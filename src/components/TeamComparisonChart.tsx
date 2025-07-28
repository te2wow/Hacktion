'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TeamStats } from '@/types';
import TimeRangePicker, { TimeRange, getDateRangeData } from './TimeRangePicker';
import { useState } from 'react';

interface TeamComparisonChartProps {
  teams: TeamStats[];
  metric: 'commits' | 'additions' | 'deletions';
}

const TEAM_COLORS = [
  '#FF6B35', // Hacktion Orange
  '#004E89', // Hacktion Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

export default function TeamComparisonChart({ teams, metric }: TeamComparisonChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  // Filter data by selected time range
  const filteredTeams = teams.map(team => ({
    ...team,
    commits_over_time: getDateRangeData(team.commits_over_time, timeRange)
  }));

  // Get all unique dates from filtered teams
  const allDates = new Set<string>();
  filteredTeams.forEach(team => {
    team.commits_over_time.forEach(data => {
      allDates.add(data.date);
    });
  });

  // Sort dates
  const sortedDates = Array.from(allDates).sort();

  // Create comparison data
  const comparisonData = sortedDates.map(date => {
    const dataPoint: any = {
      date: new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      fullDate: date,
    };

    filteredTeams.forEach((team, index) => {
      const teamData = team.commits_over_time.find(d => d.date === date);
      dataPoint[team.name] = teamData ? teamData[metric] : 0;
    });

    return dataPoint;
  });

  const metricLabels = {
    commits: 'コミット数',
    additions: '追加行数',
    deletions: '削除行数'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-hacktion-gray border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {entry.value} {metric === 'commits' ? 'commits' : 'lines'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          チーム比較 - {metricLabels[metric]}
        </h3>
        <TimeRangePicker 
          selectedRange={timeRange}
          onRangeChange={setTimeRange}
        />
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={comparisonData}>
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
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#F9FAFB' }}
            />
            {teams.map((team, index) => (
              <Line
                key={team.id}
                type="monotone"
                dataKey={team.name}
                stroke={TEAM_COLORS[index % TEAM_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Team Legend with Stats */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredTeams.map((team, index) => {
          const totalMetric = team.commits_over_time.reduce((sum, data) => sum + data[metric], 0);
          const todayMetric = team.commits_over_time[team.commits_over_time.length - 1]?.[metric] || 0;
          
          return (
            <div key={team.id} className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: TEAM_COLORS[index % TEAM_COLORS.length] }}
              />
              <div className="flex-1">
                <p className="text-white font-medium">{team.name}</p>
                <p className="text-xs text-gray-400">
                  本日: {todayMetric} | 合計: {totalMetric}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}