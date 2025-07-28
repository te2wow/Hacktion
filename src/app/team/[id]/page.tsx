'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TeamStats } from '@/types';
import CommitsChart from '@/components/CommitsChart';
import CodeChangesChart from '@/components/CodeChangesChart';
import ContributorsChart from '@/components/ContributorsChart';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { apiClient } from '@/lib/api';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamDetail = async () => {
      try {
        const data = await apiClient.get(`/api/teams/${params.id}`);
        setTeam(data);
      } catch (error) {
        console.error('Failed to fetch team data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTeamDetail();
    }
  }, [params.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Team Not Found</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-hacktion-orange text-white rounded hover:bg-opacity-80"
        >
          Go Back
        </button>
      </div>
    );
  }

  const lastCommitTime = team.last_commit_time
    ? formatDistanceToNow(new Date(team.last_commit_time), { addSuffix: true })
    : 'No commits yet';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-hacktion-orange hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Team Info */}
      <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
        <div className="flex items-start space-x-4">
          <img
            src={team.avatar_url}
            alt={team.owner}
            className="w-16 h-16 rounded-full"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
            <p className="text-gray-400 mb-2">@{team.owner}</p>
            {team.description && (
              <p className="text-gray-300 mb-4">{team.description}</p>
            )}
            <a
              href={team.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-hacktion-blue hover:text-blue-400 transition-colors"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-hacktion-gray rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-hacktion-orange">
            {team.commits_today}
          </p>
          <p className="text-sm text-gray-400">Commits Today</p>
        </div>
        <div className="bg-hacktion-gray rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold">{team.total_commits}</p>
          <p className="text-sm text-gray-400">Total Commits</p>
        </div>
        <div className="bg-hacktion-gray rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold">
            {Math.round(team.issues_completion_rate)}%
          </p>
          <p className="text-sm text-gray-400">Issues Completed</p>
        </div>
        <div className="bg-hacktion-gray rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-hacktion-blue">
            {team.pull_requests_merged}
          </p>
          <p className="text-sm text-gray-400">PRs Merged</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Commits Over Time</h3>
          <CommitsChart data={team.commits_over_time} />
        </div>
        
        <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Code Changes</h3>
          <CodeChangesChart data={team.commits_over_time} />
        </div>
        
        <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Contributors</h3>
          <ContributorsChart data={team.contributors} />
        </div>
        
        <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Issue Progress</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-green-400">Closed Issues</span>
              <span className="text-green-400 font-bold">{team.issues_closed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-400">Open Issues</span>
              <span className="text-red-400 font-bold">{team.issues_open}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, team.issues_completion_rate)}%`,
                }}
              />
            </div>
            <div className="text-center text-gray-400 text-sm">
              {Math.round(team.issues_completion_rate)}% completion rate
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Last Commit:</span>
            <p className="text-white">{lastCommitTime}</p>
          </div>
          <div>
            <span className="text-gray-400">Code Additions:</span>
            <p className="text-green-400">+{team.code_additions}</p>
          </div>
          <div>
            <span className="text-gray-400">Code Deletions:</span>
            <p className="text-red-400">-{team.code_deletions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}