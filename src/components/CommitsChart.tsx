'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CommitTimeData } from '@/types';

interface CommitsChartProps {
  data: CommitTimeData[];
}

export default function CommitsChart({ data }: CommitsChartProps) {
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#F9FAFB'
            }}
          />
          <Line
            type="monotone"
            dataKey="commits"
            stroke="#FF6B35"
            strokeWidth={2}
            dot={{ fill: '#FF6B35', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#FF6B35', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}