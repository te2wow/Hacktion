'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TeamStats } from '@/types';
import TimeRangePicker, { TimeRange, getDateRangeData } from './TimeRangePicker';
import { useState } from 'react';

interface CumulativeProgressChartProps {
  teams: TeamStats[];
}

const TEAM_COLORS = [
  '#FF6B35', // Hacktion Orange
  '#004E89', // Hacktion Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
];

export default function CumulativeProgressChart({ teams }: CumulativeProgressChartProps) {
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

  // Create cumulative data
  const cumulativeData = sortedDates.map(date => {
    const dataPoint: any = {
      date: new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      fullDate: date,
    };

    filteredTeams.forEach((team, index) => {
      // Calculate cumulative commits up to this date
      const cumulativeCommits = team.commits_over_time
        .filter(d => d.date <= date)
        .reduce((sum, d) => sum + d.commits, 0);
      
      dataPoint[team.name] = cumulativeCommits;
    });

    return dataPoint;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Sort payload by value for better display
      const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
      
      return (
        <div className="bg-hacktion-gray border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {sortedPayload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {entry.value} commits
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
          累積進捗レース
        </h3>
        <TimeRangePicker 
          selectedRange={timeRange}
          onRangeChange={setTimeRange}
        />
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cumulativeData}>
            <defs>
              {teams.map((team, index) => (
                <linearGradient key={team.id} id={`gradient-${team.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={TEAM_COLORS[index % TEAM_COLORS.length]} 
                    stopOpacity={0.8}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={TEAM_COLORS[index % TEAM_COLORS.length]} 
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
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
              <Area
                key={team.id}
                type="monotone"
                dataKey={team.name}
                stroke={TEAM_COLORS[index % TEAM_COLORS.length]}
                fill={`url(#gradient-${team.id})`}
                strokeWidth={2}
                fillOpacity={0.4}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Team Rankings */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">現在の順位</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teams
            .sort((a, b) => b.total_commits - a.total_commits)
            .map((team, index) => (
              <div key={team.id} className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-xs font-bold text-white">
                  {index + 1}
                </div>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: TEAM_COLORS[teams.findIndex(t => t.id === team.id) % TEAM_COLORS.length] }}
                />
                <div className="flex-1">
                  <p className="text-white font-medium">{team.name}</p>
                  <p className="text-xs text-gray-400">
                    総{team.total_commits}コミット
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}