import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import CropForm from './components/CropForm';
import Results from './components/Results';
import Chatbot from './components/Chatbot'; 
import { FaCommentDots } from 'react-icons/fa'; 

// --- NEW IMPORT ---
import WeatherPage from './components/WeatherPage';

const API_URL = 'http://127.0.0.1:8000/predict';

function App() {
  // --- STATE FOR NAVIGATION ---
  const [page, setPage] = useState('home'); // 'home', 'results', or 'weather'
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // --- STATE FOR DATA (Unchanged) ---
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentInputs, setCurrentInputs] = useState(null); 
  const [forecast, setForecast] = useState(null);

  /**
   * Function to call the FastAPI backend (Unchanged)
   */
  const getPredictions = async (formData, forecastData) => {
    setLoading(true);
    setError(null);
    setPredictions(null);
    setCurrentInputs(formData);
    setForecast(forecastData);
    setPage('results'); // Land on Results page after submit

    try {
      const response = await axios.post(API_URL, formData);
      setPredictions(response.data.top_3_recommended_crops);
    } catch (err) {
      console.error("Error fetching predictions:", err);
      if (err.response) {
        setError(`Error: ${err.response.statusText}`);
      } else if (err.request) {
        setError("Network Error: Could not connect to the backend.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- MODIFIED: Page Content Renderer ---
  const renderPage = () => {
    if (page === 'home') {
      return (
        <div className="content-wrapper">
          <div className="title-section">
            <h1>Smart Crop Recommendation</h1>
            <p>
              Enter your soil and weather data to get AI-powered crop recommendations.
            </p>
          </div>
          <div className="main-grid-single">
            <div className="card">
              <CropForm onPredict={getPredictions} loading={loading} />
            </div>
          </div>
        </div>
      );
    }
    
    if (page === 'results') {
      return (
        <div className="content-wrapper">
          <div className="main-grid-single">
            <div className="card results-card">
              <Results 
                predictions={predictions} 
                loading={loading} 
                error={error}
                inputs={currentInputs}
                forecast={forecast} // Pass forecast in case you want to use it
              />
            </div>
          </div>
        </div>
      );
    }

    // --- NEW: Weather Page Render ---
    if (page === 'weather') {
      return (
        <div className="content-wrapper">
          <div className="main-grid-single">
            <div className="card">
              <WeatherPage
                forecast={forecast}
                city={currentInputs ? currentInputs.city : null}
              />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="app-container">
      {/* --- MODIFIED: Pass all 3 nav props to Header --- */}
      <Header 
        onNavHome={() => setPage('home')}
        onNavResults={() => setPage('results')}
        onNavWeather={() => setPage('weather')} // New
        resultsAvailable={!!predictions} // Enable only when predictions are loaded
        weatherAvailable={!!forecast} // Enable only when forecast is loaded
      />
      <main className="main-content">
        {renderPage()}
      </main>
      <Footer />

      {/* --- Global Chatbot FAB (Unchanged) --- */}
      {!isChatbotOpen && (
        <button 
          className="chatbot-fab" 
          onClick={() => setIsChatbotOpen(true)}
        >
          <FaCommentDots />
        </button>
      )}

      {/* --- Global Chatbot Modal (Unchanged) --- */}
      <Chatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        inputs={currentInputs}
        predictions={predictions}
      />
    </div>
  );
}

export default App;