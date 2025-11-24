import pandas as pd
from fastapi import FastAPI, HTTPException
import joblib
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import List, Dict, Any, Optional

# --- NEW: Import the API key from our new config file ---
from apiConfig import OPENWEATHER_API_KEY 

# --- System Prompt for the Chatbot (Unchanged) ---
SYSTEM_PROMPT = """You are AgriBot, an expert agricultural specialist and crop advisor AI. Your primary goal is to provide short, concise, and clear advice to a farmer.

The user will provide you with their current soil/climate data and the top 3 crop recommendations they just received. This data is your primary context.

Your instructions are:
1.  Be professional and factual. Your advice should be grounded in agricultural science.
2.  FORMAT ALL RESPONSES IN CONCISE BULLET POINTS. Do not use long paragraphs.
3.  Use the provided context. Base your answers on the user's specific input data (N, P, K, temp, etc.) and the recommended crops.
4.  Answer preset queries directly.
5.  Answer custom queries by relating them back to the provided data or general farming knowledge.
6.  Keep answers brief. Aim for 2-4 bullet points per response unless more detail is absolutely necessary.
"""

# --- FastAPI App Setup (Unchanged) ---
app = FastAPI()
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
LM_STUDIO_URL = "http://127.0.0.1:1234/v1/chat/completions"


# --- Pydantic Models (Unchanged) ---

# This model is *only* for the /predict endpoint
class CropData(BaseModel):
    N: int
    P: int
    K: int
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    city: Optional[str] = None 

# This allows 'city' to be part of the chat context
class ChatContextData(BaseModel):
    N: int
    P: int
    K: int
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    city: Optional[str] = None

class Prediction(BaseModel):
    crop: str
    confidence: str

# ChatInput now uses the new context model
class ChatInput(BaseModel):
    user_query: str
    inputs: ChatContextData
    predictions: List[Prediction]


# --- Helper Function for Chat (Unchanged) ---

def _build_context_prompt(inputs: ChatContextData, predictions: List[Prediction]) -> str:
    """Builds the context string to be sent to the LLM."""
    
    pred_list = "\n".join([f"- {p.crop} ({p.confidence})" for p in predictions])
    
    city_line = f"- Location: {inputs.city}\n" if inputs.city else ""
    
    return f"""
--- START OF CONTEXT ---
Here is the farmer's data:
[Input Data]
{city_line}- Nitrogen (N): {inputs.N} kg/ha
- Phosphorous (P): {inputs.P} kg/ha
- Potassium (K): {inputs.K} kg/ha
- Temperature: {inputs.temperature} °C
- Humidity: {inputs.humidity} %
- Soil pH: {inputs.ph}
- Rainfall: {inputs.rainfall} mm/year

[AI Recommendations]
The analysis tool provided these top 3 recommendations:
{pred_list}
--- END OF CONTEXT ---
"""

# --- API Endpoint: Crop Prediction (FIXED) ---
# This is the original, working code that I accidentally removed.
model = joblib.load('Crop_Model.joblib')

@app.post('/predict')
def predict_crop(data: CropData):
    # We must drop the 'city' column before sending to the model
    input_data_dict = data.dict(exclude={'city'}) 
    input_data = pd.DataFrame([input_data_dict])
    
    probabilities = model.predict_proba(input_data)
    prob_each_crop = sorted(zip(model.classes_, probabilities[0]), key=lambda x: x[1], reverse=True)
    top_3_crops = prob_each_crop[0:3]
    result = [{"crop": crop, "confidence": f"{prob*100:.2f}%"} for crop, prob in top_3_crops]
    return {"top_3_recommended_crops": result}
# --- END OF FIX ---


# --- NEW: Weather Forecast Endpoint (This part is new and correct) ---
@app.get('/weather-forecast')
async def get_weather_forecast(city: str):
    """
    Fetches current weather and 5-day forecast from OpenWeatherMap.
    The free plan provides a 5-day forecast with 3-hour intervals.
    """
    if not OPENWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="Weather API key not configured")

    WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
    FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"
    
    params = {
        'q': f"{city},IN",
        'appid': OPENWEATHER_API_KEY,
        'units': 'metric'
    }
    
    try:
        async with httpx.AsyncClient() as client:
            # 1. Fetch Current Weather
            current_response = await client.get(WEATHER_URL, params=params)
            current_response.raise_for_status()
            current_data = current_response.json()
            
            # 2. Fetch 5-Day Forecast
            forecast_response = await client.get(FORECAST_URL, params=params)
            forecast_response.raise_for_status()
            forecast_data = forecast_response.json()
            
            # 3. Combine and return
            return {
                "current": {
                    "temp": current_data['main']['temp'],
                    "humidity": current_data['main']['humidity']
                },
                "forecast": forecast_data['list'] # 'list' contains the 3-hour array
            }

    except httpx.RequestError as exc:
        print(f"An error occurred while requesting weather data: {exc!r}")
        raise HTTPException(status_code=503, detail="Could not connect to weather service")
    except httpx.HTTPStatusError as exc:
        print(f"Weather service returned an error: {exc!r}")
        raise HTTPException(status_code=exc.response.status_code, detail="Error from weather service")
    except Exception as e:
        print(f"An unexpected error occurred: {e!r}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


# --- API Endpoint: Chatbot Proxy (Unchanged) ---
@app.post('/chat')
async def chat_with_bot(data: ChatInput):
    """
    This endpoint builds the full prompt and proxies the request to LM Studio.
    """
    
    # 1. Build the context (this function is now city-aware)
    context_str = _build_context_prompt(data.inputs, data.predictions)
    final_user_prompt = f"{context_str}\n\nMy Question: {data.user_query}"
    
    # 2. Construct the payload (Unchanged)
    payload = {
        "model": "google/gemma-3-4b",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": final_user_prompt}
        ],
        "temperature": 0.7,
        "stream": False
    }

    # 3. Send the request (Unchanged)
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                LM_STUDIO_URL,
                json=payload,
                timeout=60.0
            )
            response.raise_for_status()
            lm_studio_data = response.json()
            bot_response = lm_studio_data["choices"][0]["message"]["content"]
            return {"response": bot_response}

    except httpx.RequestError as exc:
        print(f"An error occurred while requesting {exc.request.url!r}: {exc!r}")
        return {"error": "Could not connect to the chat advisor. Is LM Studio running?"}
    except Exception as e:
        print(f"An unexpected error occurred: {e!r}")
        return {"error": "An unexpected error occurred in the chat proxy."}