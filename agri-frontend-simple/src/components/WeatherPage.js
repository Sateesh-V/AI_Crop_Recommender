import React from 'react';

// Import the weather components
import DailyForecast from './DailyForecast';
import TemperatureChart from './TemperatureChart';
import HumidityChart from './HumidityChart';

const WeatherPage = ({ forecast, city }) => {
  // If there's no forecast data, show a simple message.
  if (!forecast || !city) {
    return (
      <div className="initial-state" style={{ color: 'rgba(255, 255, 255, 0.8)', minHeight: '400px' }}>
        <p style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '1.5rem', color: '#ffffff' }}>
          No weather data available.
        </p>
        <p style={{ fontSize: '0.95rem', marginTop: '0.5rem', maxWidth: '280px' }}>
          Go to the Home page and submit a form with a city to see the weather forecast.
        </p>
      </div>
    );
  }

  // If we have data, render all the weather components
  return (
    <div className="weather-page-container">
      <h2 style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        color: '#ffffff',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: '1.5rem'
      }}>
        Weather Forecast for {city}
      </h2>
      
      {/* Daily overview */}
      <DailyForecast forecast={forecast} city={city} /> 
      
      {/* Grid Wrapper for side-by-side charts */}
      <div className="weather-charts-grid">
        <TemperatureChart forecast={forecast} city={city} />
        <HumidityChart forecast={forecast} city={city} />
      </div>
    </div>
  );
};

export default WeatherPage;