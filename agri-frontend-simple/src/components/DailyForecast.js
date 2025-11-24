import React from 'react';

// Helper to get a weather icon from the OpenWeatherMap code
const getWeatherIconUrl = (icon) => {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
};

// Helper to format the day (e.g., "Thu")
const formatDay = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Helper to format the date (e.g., "Nov 6")
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// --- NEW HELPER ---
// Helper to capitalize the first letter of each word (e.g., "light rain" -> "Light Rain")
const capitalize = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const DailyForecast = ({ forecast, city }) => {

  // --- MODIFIED DATA PROCESSING ---
  const processedData = forecast.reduce((acc, item) => {
    const date = item.dt_txt.split(' ')[0];

    if (!acc[date]) {
      acc[date] = {
        date: date,
        temp_min: item.main.temp_min,
        temp_max: item.main.temp_max,
        // Get icon and description from 3 PM forecast if possible
        icon: item.dt_txt.includes('15:00:00') ? item.weather[0].icon : null,
        description: item.dt_txt.includes('15:00:00') ? item.weather[0].description : null,
      };
    } else {
      // Update min/max temps
      if (item.main.temp_min < acc[date].temp_min) {
        acc[date].temp_min = item.main.temp_min;
      }
      if (item.main.temp_max > acc[date].temp_max) {
        acc[date].temp_max = item.main.temp_max;
      }
      // If we didn't have an icon/desc yet, or if this is the 3 PM one, grab it
      if (!acc[date].icon || item.dt_txt.includes('15:00:00')) {
        acc[date].icon = item.weather[0].icon;
        acc[date].description = item.weather[0].description;
      }
    }
    return acc;
  }, {});

  const forecastDays = Object.values(processedData);

  // Fallback for the first day if it's missing data (e.g., forecast starts at 11 PM)
  if (forecastDays.length > 0) {
    if (!forecastDays[0].icon) {
      forecastDays[0].icon = forecast[0].weather[0].icon;
    }
    if (!forecastDays[0].description) {
      forecastDays[0].description = forecast[0].weather[0].description;
    }
  }
  // --- END OF MODIFIED PROCESSING ---

  return (
    <div className="daily-forecast-container">
      <h4 className="chart-title" style={{ marginBottom: '1rem' }}>
        5-Day Overview for {city}
      </h4>
      <div className="daily-forecast-scroll">
        {forecastDays.map((day, index) => (
          <div className="daily-forecast-card" key={day.date}>
            <div className="day-label">
              {index === 0 ? 'Today' : formatDay(day.date)}
            </div>
            <div className="date-label">{formatDate(day.date)}</div>
            
            <img 
              src={getWeatherIconUrl(day.icon)} 
              alt={day.description} // Use description for alt text
              className="weather-icon"
            />
            
            {/* --- MODIFIED: Temp display --- */}
            <div className="temp-range">
              {Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°C
            </div>
            
            {/* --- NEW: Condition display --- */}
            <div className="condition-label">
              {capitalize(day.description)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecast;