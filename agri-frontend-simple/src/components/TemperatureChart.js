import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaTemperatureHigh } from 'react-icons/fa'; // New Icon

// Helper to format the date string (e.g., "Mon 6PM")
const formatXAxis = (tickItem) => {
  const date = new Date(tickItem);
  return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', hour12: true });
};

const TemperatureChart = ({ forecast, city }) => {
  // 1. Transform data for the chart
  const chartData = forecast.map(item => ({
    time: item.dt_txt,
    Temperature: item.main.temp,
  }));

  return (
    <div className="chart-container">
      <h4 className="chart-title">
        <FaTemperatureHigh style={{ marginRight: '0.5rem' }} />
        5-Day Temperature Forecast (°C) for {city}
      </h4>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
            <XAxis
              dataKey="time"
              tickFormatter={formatXAxis}
              stroke="rgba(255, 255, 255, 0.8)"
              fontSize="0.8rem"
            />
            <YAxis stroke="rgba(255, 255, 255, 0.8)" />
            <Tooltip
              formatter={(value, name) => [`${value.toFixed(1)}°C`, name]}
              contentStyle={{
                background: 'rgba(50, 50, 70, 0.9)',
                backdropFilter: 'blur(15px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              labelStyle={{ color: '#ffffff' }}
              itemStyle={{ fontWeight: '600', color: '#fca5a5' }} // Red color for temp
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Temperature" 
              stroke="#fca5a5" // Red-ish color
              strokeWidth={2} 
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TemperatureChart;