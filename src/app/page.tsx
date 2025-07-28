'use client';

import { useState, useEffect } from 'react';
import { TeamStats } from '@/types';
import TeamCard from '@/components/TeamCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { apiClient } from '@/lib/api';

export default function HomePage() {
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchTeamData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const data = await apiClient.get('/api/teams');
      setTeams(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      // Force refresh from GitHub API
      await apiClient.post('/api/teams/refresh');
      await fetchTeamData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
    
    // Set up auto-refresh every minute
    const interval = setInterval(() => fetchTeamData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const mostActiveTeam = teams.length > 0 ? teams.reduce((prev, current) => 
    prev.commits_today > current.commits_today ? prev : current
  ) : null;

  const leastActiveTeam = teams.length > 0 ? teams.reduce((prev, current) => 
    prev.commits_today < current.commits_today ? prev : current
  ) : null;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-hacktion-orange mb-2">
            Total Teams
          </h3>
          <p className="text-3xl font-bold">{teams.length}</p>
        </div>
        
        <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            Most Active Team
          </h3>
          <p className="text-xl font-bold">{mostActiveTeam?.name || 'N/A'}</p>
          <p className="text-sm text-gray-400">
            {mostActiveTeam?.commits_today || 0} commits today
          </p>
        </div>
        
        <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Needs Attention
          </h3>
          <p className="text-xl font-bold">{leastActiveTeam?.name || 'N/A'}</p>
          <p className="text-sm text-gray-400">
            {leastActiveTeam?.commits_today || 0} commits today
          </p>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Progress</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-hacktion-orange text-white rounded hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {refreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Refresh</span>
              </>
            )}
          </button>
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdated}
          </div>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12 bg-hacktion-gray rounded-lg border border-gray-700">
          <p className="text-gray-400 mb-4">No teams configured yet</p>
          <p className="text-sm text-gray-500">
            Add GitHub repository URLs in your environment configuration
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}