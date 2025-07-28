'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CommitTimeData } from '@/types';

interface CodeChangesChartProps {
  data: CommitTimeData[];
}

export default function CodeChangesChart({ data }: CodeChangesChartProps) {
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
        <BarChart data={chartData}>
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
          <Legend />
          <Bar
            dataKey="additions"
            fill="#10B981"
            name="Additions"
          />
          <Bar
            dataKey="deletions"
            fill="#EF4444"
            name="Deletions"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}