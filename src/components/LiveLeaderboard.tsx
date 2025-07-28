'use client';

import { useState, useEffect } from 'react';
import { TeamStats } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface LiveLeaderboardProps {
  teams: TeamStats[];
}

type SortType = 'commits_today' | 'total_commits' | 'code_additions' | 'issues_completion_rate';

export default function LiveLeaderboard({ teams }: LiveLeaderboardProps) {
  const [sortBy, setSortBy] = useState<SortType>('commits_today');
  const [animatingTeam, setAnimatingTeam] = useState<number | null>(null);

  const sortedTeams = [...teams].sort((a, b) => {
    if (sortBy === 'issues_completion_rate') {
      return b[sortBy] - a[sortBy];
    }
    return b[sortBy] - a[sortBy];
  });

  // Animate position changes
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTeam = teams[Math.floor(Math.random() * teams.length)];
      if (randomTeam) {
        setAnimatingTeam(randomTeam.id);
        setTimeout(() => setAnimatingTeam(null), 1000);
      }
    }, 10000); // Animate every 10 seconds

    return () => clearInterval(interval);
  }, [teams]);

  const getRankChange = (team: TeamStats, currentRank: number) => {
    // Simulate rank change for demo (in real app, you'd compare with previous data)
    const previousRank = currentRank + (Math.random() > 0.5 ? 1 : -1);
    const change = previousRank - currentRank;
    
    if (change > 0) return { direction: 'up', amount: change };
    if (change < 0) return { direction: 'down', amount: Math.abs(change) };
    return { direction: 'same', amount: 0 };
  };

  const getMetricValue = (team: TeamStats, metric: SortType) => {
    if (metric === 'issues_completion_rate') {
      return `${Math.round(team[metric])}%`;
    }
    return team[metric].toLocaleString();
  };

  const getMetricLabel = (metric: SortType) => {
    const labels = {
      commits_today: '本日のコミット',
      total_commits: '総コミット数',
      code_additions: '追加行数',
      issues_completion_rate: 'Issue完了率'
    };
    return labels[metric];
  };

  const getTrophyIcon = (rank: number) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          🏁 リアルタイム順位表
          <span className="ml-2 text-sm bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
            LIVE
          </span>
        </h3>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortType)}
          className="bg-hacktion-dark border border-gray-600 text-white px-3 py-1 rounded text-sm focus:outline-none focus:border-hacktion-orange"
        >
          <option value="commits_today">本日の活動</option>
          <option value="total_commits">総合進捗</option>
          <option value="code_additions">コード量</option>
          <option value="issues_completion_rate">Issue完了</option>
        </select>
      </div>

      <div className="space-y-3">
        {sortedTeams.map((team, index) => {
          const rank = index + 1;
          const rankChange = getRankChange(team, rank);
          const isAnimating = animatingTeam === team.id;

          return (
            <div
              key={team.id}
              className={`relative flex items-center p-4 rounded-lg border transition-all duration-500 ${
                isAnimating 
                  ? 'border-hacktion-orange bg-hacktion-orange bg-opacity-10 transform scale-105' 
                  : 'border-gray-600 bg-hacktion-dark bg-opacity-50'
              } ${rank === 1 ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-12 h-12 mr-4">
                <span className={`text-2xl font-bold ${
                  rank === 1 ? 'text-yellow-400' : 
                  rank === 2 ? 'text-gray-300' : 
                  rank === 3 ? 'text-amber-600' : 'text-gray-400'
                }`}>
                  {getTrophyIcon(rank)}
                </span>
              </div>

              {/* Team Info */}
              <div className="flex items-center flex-1">
                <img
                  src={team.avatar_url}
                  alt={team.owner}
                  className="w-10 h-10 rounded-full mr-3 border-2 border-gray-600"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{team.name}</h4>
                  <p className="text-xs text-gray-400">@{team.owner}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="text-right mr-4">
                <p className="text-lg font-bold text-white">
                  {getMetricValue(team, sortBy)}
                </p>
                <p className="text-xs text-gray-400">
                  {getMetricLabel(sortBy)}
                </p>
              </div>

              {/* Rank Change Indicator */}
              <div className="flex items-center">
                {rankChange.direction === 'up' && (
                  <div className="flex items-center text-green-400">
                    <span className="text-xs">↗</span>
                    <span className="text-xs ml-1">{rankChange.amount}</span>
                  </div>
                )}
                {rankChange.direction === 'down' && (
                  <div className="flex items-center text-red-400">
                    <span className="text-xs">↘</span>
                    <span className="text-xs ml-1">{rankChange.amount}</span>
                  </div>
                )}
                {rankChange.direction === 'same' && (
                  <div className="flex items-center text-gray-400">
                    <span className="text-xs">—</span>
                  </div>
                )}
              </div>

              {/* Activity Indicator */}
              <div className="ml-3">
                {team.last_commit_time && (
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      new Date(team.last_commit_time) > new Date(Date.now() - 60 * 60 * 1000)
                        ? 'bg-green-400 animate-pulse'
                        : new Date(team.last_commit_time) > new Date(Date.now() - 6 * 60 * 60 * 1000)
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                    }`} />
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(team.last_commit_time), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>

              {/* Celebration Effect for #1 */}
              {rank === 1 && isAnimating && (
                <div className="absolute -top-2 -right-2">
                  <span className="text-2xl animate-bounce">🎉</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Stats */}
      <div className="mt-6 pt-4 border-t border-gray-600 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-hacktion-orange">
            {teams.reduce((sum, team) => sum + team.commits_today, 0)}
          </p>
          <p className="text-xs text-gray-400">本日の総コミット数</p>
        </div>
        <div>
          <p className="text-lg font-bold text-hacktion-blue">
            {teams.reduce((sum, team) => sum + team.code_additions, 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">総追加コード行数</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-400">
            {Math.round(teams.reduce((sum, team) => sum + team.issues_completion_rate, 0) / teams.length)}%
          </p>
          <p className="text-xs text-gray-400">平均完了率</p>
        </div>
      </div>
    </div>
  );
}