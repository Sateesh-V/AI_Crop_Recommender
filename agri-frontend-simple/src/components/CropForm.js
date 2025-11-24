import React, { useState } from 'react';
import Select from 'react-select'; // --- NEW IMPORT ---
import { FaCity } from 'react-icons/fa'; // --- NEW IMPORT ---

// --- NEW IMPORTS ---
import { indianCities } from '../data/indianCities';
import { rainfallData } from '../data/rainfallData';
// --- OPENWEATHER_API_KEY is no longer imported here ---
// --- END NEW IMPORTS ---


// This component is generic and remains unchanged.
const FormInput = ({ label, value, onChange, placeholder, icon }) => (
  <div className="form-group">
    <label>
      {icon && <span style={{ marginRight: '0.5rem' }}>{icon}</span>}
      {label}
    </label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      step="0.01"
      required
    />
  </div>
);

// This component is also unchanged.
const UnitToggle = ({ selectedUnit, onUnitChange }) => (
  <div className="unit-toggle-group">
    <button
      type="button"
      className={`unit-toggle-btn ${selectedUnit === 'kg/ha' ? 'active' : ''}`}
      onClick={() => onUnitChange('kg/ha')}
    >
      kg/ha
    </button>
    <button
      type="button"
      className={`unit-toggle-btn ${selectedUnit === 'g/m^2' ? 'active' : ''}`}
      onClick={() => onUnitChange('g/m^2')}
    >
      g/m²
    </button>
  </div>
);


const CropForm = ({ onPredict, loading }) => {
  const [N, setN] = useState('');
  const [P, setP] = useState('');
  const [K, setK] = useState('');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [ph, setPh] = useState('');
  const [rainfall, setRainfall] = useState('');
  
  // --- NEW STATE ---
  const [selectedCity, setSelectedCity] = useState(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [forecast, setForecast] = useState(null); // <-- Store forecast
  // --- END NEW STATE ---

  // State for units remains the same
  const [nUnit, setNUnit] = useState('kg/ha');
  const [pUnit, setPUnit] = useState('kg/ha');
  const [kUnit, setKUnit] = useState('kg/ha');
  
  const CONVERSION_FACTOR = 10; // 1 g/m^2 = 10 kg/ha

  // Unchanged handler
  const handleUnitChange = (newUnit, currentValue, currentUnit, setValue, setUnit) => {
    if (newUnit === currentUnit) {
      return;
    }
    const numericValue = parseFloat(currentValue);
    if (isNaN(numericValue) || currentValue.trim() === '') {
      setUnit(newUnit);
      return;
    }
    let convertedValue;
    if (newUnit === 'kg/ha') {
      convertedValue = numericValue * CONVERSION_FACTOR;
    } else {
      convertedValue = numericValue / CONVERSION_FACTOR;
    }
    setValue(String(parseFloat(convertedValue.toPrecision(10))));
    setUnit(newUnit);
  };
  
  // --- MODIFIED: Weather Fetching Handler ---
  const handleCityChange = async (selectedOption) => {
    setSelectedCity(selectedOption);
    setForecast(null); // Clear previous forecast

    if (!selectedOption) {
      // Clear fields if city is cleared
      setTemperature('');
      setHumidity('');
      setRainfall('');
      return;
    }
    
    setIsFetchingWeather(true);
    const cityName = selectedOption.value;
    
    try {
      // 1. Fetch Temp, Humidity, and Forecast from OUR backend
      const weatherUrl = `http://127.0.0.1:8000/weather-forecast?city=${cityName}`;
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        throw new Error('Weather data not found');
      }
      const weatherData = await weatherResponse.json();
      
      // Set temp and humidity from API
      setTemperature(String(weatherData.current.temp));
      setHumidity(String(weatherData.current.humidity));
      setForecast(weatherData.forecast); // <-- Save the forecast
      
      // 2. Get Annual Rainfall from our static data file
      const annualRainfall = rainfallData[cityName];
      if (annualRainfall) {
        setRainfall(String(annualRainfall));
      } else {
        setRainfall(''); // Clear rainfall if not in our dataset
        console.warn(`No rainfall data for ${cityName}. Add it to rainfallData.js`);
      }
      
    } catch (error) {
      console.error("Failed to fetch weather:", error);
      // Clear fields on error
      setTemperature('');
      setHumidity('');
      setRainfall('');
    } finally {
      setIsFetchingWeather(false);
    }
  };
  
  // --- MODIFIED: handleSubmit ---
  const handleSubmit = (e) => {
    e.preventDefault();

    const nValue = nUnit === 'g/m^2' ? parseFloat(N) * CONVERSION_FACTOR : parseFloat(N);
    const pValue = pUnit === 'g/m^2' ? parseFloat(P) * CONVERSION_FACTOR : parseFloat(P);
    const kValue = kUnit === 'g/m^2' ? parseFloat(K) * CONVERSION_FACTOR : parseFloat(K);

    const formData = {
      N: parseInt(nValue),
      P: parseInt(pValue),
      K: parseInt(kValue),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      ph: parseFloat(ph),
      rainfall: parseFloat(rainfall),
      city: selectedCity ? selectedCity.value : null
    };
    
    // --- Pass the forecast data up to App.js ---
    onPredict(formData, forecast);
  };

  const formHeaderStyle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '1.5rem',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };
  
  // --- NEW: Styles for react-select ---
  const selectStyles = {
    control: (baseStyles) => ({
      ...baseStyles,
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '12px',
      boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.1)',
      color: '#ffffff',
    }),
    singleValue: (baseStyles) => ({ ...baseStyles, color: '#ffffff' }),
    placeholder: (baseStyles) => ({ ...baseStyles, color: 'rgba(255, 255, 255, 0.5)' }),
    input: (baseStyles) => ({ ...baseStyles, color: '#ffffff' }),
    menu: (baseStyles) => ({
      ...baseStyles,
      background: 'rgba(50, 50, 70, 0.9)',
      backdropFilter: 'blur(15px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      background: state.isFocused ? 'rgba(16, 185, 129, 0.5)' : 'transparent',
      color: '#ffffff',
    }),
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h2 style={formHeaderStyle}>
        <span style={{ fontSize: '1.75rem' }}>🌱</span>
        Enter Soil & Climate Data
      </h2>
      
      {/* --- NEW: City Selector --- */}
      <div className="form-group">
        <label>
          <FaCity style={{ marginRight: '0.5rem' }} />
          Select City (Optional)
        </label>
        <Select
          options={indianCities}
          onChange={handleCityChange}
          value={selectedCity}
          styles={selectStyles}
          placeholder={isFetchingWeather ? 'Fetching data...' : 'Type or select a city'}
          isClearable
          isLoading={isFetchingWeather}
        />
        <small style={{color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px', fontSize: '0.8rem'}}>
          This will auto-fill Temp, Humidity, and Avg. Rainfall.
        </small>
      </div>
      
      <div className="form-grid">
        {/* --- N, P, K inputs (Unchanged) --- */}
        <div className="form-group">
          <label>
            <span style={{ marginRight: '0.5rem' }}>🔬</span>
            Nitrogen (N)
          </label>
          <input type="number" value={N} onChange={(e) => setN(e.target.value)} placeholder="e.g., 90" step="0.01" required />
          <UnitToggle selectedUnit={nUnit} onUnitChange={(newUnit) => handleUnitChange(newUnit, N, nUnit, setN, setNUnit)} />
        </div>
        <div className="form-group">
          <label>
            <span style={{ marginRight: '0.5rem' }}>⚗️</span>
            Phosphorous (P)
          </label>
          <input type="number" value={P} onChange={(e) => setP(e.target.value)} placeholder="e.g., 42" step="0.01" required />
          <UnitToggle selectedUnit={pUnit} onUnitChange={(newUnit) => handleUnitChange(newUnit, P, pUnit, setP, setPUnit)} />
        </div>
        <div className="form-group">
          <label>
            <span style={{ marginRight: '0.5rem' }}>🧪</span>
            Potassium (K)
          </label>
          <input type="number" value={K} onChange={(e) => setK(e.target.value)} placeholder="e.g., 43" step="0.01" required />
          <UnitToggle selectedUnit={kUnit} onUnitChange={(newUnit) => handleUnitChange(newUnit, K, kUnit, setK, setKUnit)} />
        </div>

        {/* --- MODIFIED: Temp, Humidity, Rainfall now read-only if fetching --- */}
        <FormInput label="Temperature (°C)" value={temperature} onChange={setTemperature} placeholder="e.g., 20.87" icon="🌡️" />
        <FormInput label="Humidity (%)" value={humidity} onChange={setHumidity} placeholder="e.g., 82.00" icon="💧" />
        <FormInput label="Soil pH" value={ph} onChange={setPh} placeholder="e.g., 6.50" icon="📊" />
        <FormInput label="Rainfall (mm/year)" value={rainfall} onChange={setRainfall} placeholder="e.g., 202.9" icon="🌧️" />
      </div>

      <button type="submit" disabled={loading || isFetchingWeather} className="submit-button">
        {loading ? (
          <><span style={{ marginRight: '0.5rem' }}>⏳</span>Analyzing...</>
        ) : (
          <><span style={{ marginRight: '0.5rem' }}>🚀</span>Get Recommendation</>
        )}
      </button>
    </form>
  );
};

export default CropForm;