import Link from 'next/link';
import { TeamStats } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface TeamCardProps {
  team: TeamStats;
}

export default function TeamCard({ team }: TeamCardProps) {
  const getActivityLevel = (commitsToday: number) => {
    if (commitsToday >= 10) return { color: 'text-green-400', label: 'Very Active' };
    if (commitsToday >= 5) return { color: 'text-yellow-400', label: 'Active' };
    if (commitsToday >= 1) return { color: 'text-orange-400', label: 'Low Activity' };
    return { color: 'text-red-400', label: 'Inactive' };
  };

  const activity = getActivityLevel(team.commits_today);
  const lastCommitTime = team.last_commit_time
    ? formatDistanceToNow(new Date(team.last_commit_time), { addSuffix: true })
    : 'No commits yet';

  return (
    <Link href={`/team/${team.id}`}>
      <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700 hover:border-hacktion-orange transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={team.avatar_url}
              alt={team.owner}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-lg">{team.name}</h3>
              <p className="text-sm text-gray-400">@{team.owner}</p>
            </div>
          </div>
          <div className={`text-sm font-medium px-2 py-1 rounded ${activity.color} bg-opacity-20`}>
            {activity.label}
          </div>
        </div>

        {team.description && (
          <p className="text-sm text-gray-300 mb-4 line-clamp-2">
            {team.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-2xl font-bold text-hacktion-orange">
              {team.commits_today}
            </p>
            <p className="text-xs text-gray-400">Commits Today</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{team.total_commits}</p>
            <p className="text-xs text-gray-400">Total Commits</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-lg font-semibold">
              {Math.round(team.issues_completion_rate)}%
            </p>
            <p className="text-xs text-gray-400">Issues Closed</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-hacktion-blue">
              {team.pull_requests_merged}
            </p>
            <p className="text-xs text-gray-400">PRs Merged</p>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-3">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Last commit: {lastCommitTime}</span>
            <span>+{team.code_additions} -{team.code_deletions}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}