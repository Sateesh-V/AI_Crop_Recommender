import React from 'react';

// A simple helper to add units to our labels
const getLabel = (key) => {
  const labels = {
    N: 'Nitrogen (N)',
    P: 'Phosphorous (P)',
    K: 'Potassium (K)',
    temperature: 'Temperature (°C)',
    humidity: 'Humidity (%)',
    ph: 'Soil pH',
    rainfall: 'Rainfall (mm/year)',
    city: 'City',
  };
  return labels[key] || key;
};

const UserInputTable = ({ inputs }) => {
  if (!inputs) return null;

  // We filter out any keys that are null or not for display
  const tableData = Object.entries(inputs).filter(
    ([key, value]) => value !== null && key !== 'city'
  );

  return (
    <div className="user-input-container">
      <h3 className="user-input-title">
        Your Input Parameters ({inputs.city || 'N/A'})
      </h3>
      <div className="user-input-grid">
        {tableData.map(([key, value]) => (
          <div className="input-item" key={key}>
            <div className="input-label">{getLabel(key)}</div>
            <div className="input-value">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserInputTable;