import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './ResultsChart.module.css';

interface ChartDataPoint {
  date: string;
  score: number;
}

interface ResultsChartProps {
  data: ChartDataPoint[];
}

const ResultsChart: React.FC<ResultsChartProps> = ({ data }) => {
  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#00A337" 
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultsChart;