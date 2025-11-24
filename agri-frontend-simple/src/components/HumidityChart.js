import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaTint } from 'react-icons/fa'; // New Icon

// Helper to format the date string (e.g., "Mon 6PM")
const formatXAxis = (tickItem) => {
  const date = new Date(tickItem);
  return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', hour12: true });
};

const HumidityChart = ({ forecast, city }) => {
  // 1. Transform data for the chart
  const chartData = forecast.map(item => ({
    time: item.dt_txt,
    Humidity: item.main.humidity,
  }));

  return (
    <div className="chart-container">
      <h4 className="chart-title">
        <FaTint style={{ marginRight: '0.5rem' }} />
        5-Day Humidity Forecast (%) for {city}
      </h4>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
            <XAxis
              dataKey="time"
              tickFormatter={formatXAxis}
              stroke="rgba(255, 255, 255, 0.8)"
              fontSize="0.8rem"
            />
            <YAxis stroke="rgba(255, 255, 255, 0.8)" />
            <Tooltip
              formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
              contentStyle={{
                background: 'rgba(50, 50, 70, 0.9)',
                backdropFilter: 'blur(15px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              labelStyle={{ color: '#ffffff' }}
              itemStyle={{ fontWeight: '600', color: '#818cf8' }} // Blue color for humidity
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="Humidity" 
              stroke="#818cf8" // Blue-ish color
              fill="url(#colorHumidity)"
              strokeWidth={2} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HumidityChart;