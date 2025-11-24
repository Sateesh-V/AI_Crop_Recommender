import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaChartPie } from 'react-icons/fa';

// --- THIS IS THE CHANGE ---
// High-contrast colors (Green, Blue, Orange)
const COLORS = ['#10b981', '#3b82f6', '#f97316'];
// --- END OF CHANGE ---

const PredictionPieChart = ({ predictions }) => {
  // 1. Transform data for the chart
  const chartData = predictions.map(p => ({
    name: p.crop,
    value: parseFloat(p.confidence.replace('%', ''))
  }));

  return (
    <div className="chart-container">
      <h4 className="chart-title">
        <FaChartPie style={{ marginRight: '0.5rem' }} />
        Prediction Confidence
      </h4>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${value.toFixed(2)}%`}
              contentStyle={{
                background: 'rgba(50, 50, 70, 0.9)',
                backdropFilter: 'blur(15px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              labelStyle={{ color: '#ffffff' }}
              itemStyle={{ color: '#ffffff' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PredictionPieChart;