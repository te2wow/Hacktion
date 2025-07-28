import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const teamId = parseInt(resolvedParams.id);
    
    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // Demo data based on team ID
    const demoTeams = [
      {
        id: 1,
        name: 'Hacktion',
        full_name: 'te2wow/Hacktion',
        owner: 'te2wow',
        avatar_url: 'https://github.com/te2wow.png',
        description: 'Real-time hackathon progress tracker',
        html_url: 'https://github.com/te2wow/Hacktion',
        total_commits: 1,
        commits_today: 1,
        issues_open: 0,
        issues_closed: 0,
        issues_completion_rate: 0,
        pull_requests_merged: 0,
        last_commit_time: new Date().toISOString(),
        code_additions: 12938,
        code_deletions: 1,
        updated_at: new Date().toISOString(),
        contributors: [
          {
            login: 'te2wow',
            avatar_url: 'https://github.com/te2wow.png',
            commits: 1,
            additions: 12938,
            deletions: 1
          }
        ],
        commits_over_time: [
          { date: new Date().toISOString().split('T')[0], commits: 1, additions: 12938, deletions: 1 }
        ]
      },
      {
        id: 2,
        name: 'Sample Team A',
        full_name: 'team-a/project',
        owner: 'team-a',
        avatar_url: 'https://github.com/github.png',
        description: 'Demo team with high activity',
        html_url: 'https://github.com/team-a/project',
        total_commits: 45,
        commits_today: 8,
        issues_open: 3,
        issues_closed: 12,
        issues_completion_rate: 80,
        pull_requests_merged: 5,
        last_commit_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        code_additions: 2500,
        code_deletions: 300,
        updated_at: new Date().toISOString(),
        contributors: [
          { login: 'alice', avatar_url: 'https://github.com/github.png', commits: 25, additions: 1500, deletions: 200 },
          { login: 'bob', avatar_url: 'https://github.com/github.png', commits: 20, additions: 1000, deletions: 100 }
        ],
        commits_over_time: [
          { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], commits: 5, additions: 300, deletions: 50 },
          { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], commits: 7, additions: 450, deletions: 60 },
          { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], commits: 6, additions: 400, deletions: 40 },
          { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], commits: 9, additions: 550, deletions: 70 },
          { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], commits: 8, additions: 400, deletions: 30 },
          { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], commits: 2, additions: 200, deletions: 20 },
          { date: new Date().toISOString().split('T')[0], commits: 8, additions: 200, deletions: 30 }
        ]
      },
      {
        id: 3,
        name: 'Sample Team B',
        full_name: 'team-b/project',
        owner: 'team-b',
        avatar_url: 'https://github.com/github.png',
        description: 'Demo team with moderate activity',
        html_url: 'https://github.com/team-b/project',
        total_commits: 23,
        commits_today: 2,
        issues_open: 5,
        issues_closed: 8,
        issues_completion_rate: 61.5,
        pull_requests_merged: 3,
        last_commit_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        code_additions: 1800,
        code_deletions: 200,
        updated_at: new Date().toISOString(),
        contributors: [
          { login: 'charlie', avatar_url: 'https://github.com/github.png', commits: 15, additions: 1200, deletions: 150 },
          { login: 'diana', avatar_url: 'https://github.com/github.png', commits: 8, additions: 600, deletions: 50 }
        ],
        commits_over_time: [
          { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], commits: 3, additions: 200, deletions: 20 },
          { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], commits: 4, additions: 300, deletions: 30 },
          { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], commits: 2, additions: 150, deletions: 10 },
          { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], commits: 5, additions: 400, deletions: 50 },
          { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], commits: 4, additions: 350, deletions: 40 },
          { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], commits: 3, additions: 250, deletions: 25 },
          { date: new Date().toISOString().split('T')[0], commits: 2, additions: 150, deletions: 25 }
        ]
      }
    ];

    const team = demoTeams.find(t => t.id === teamId);
    
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    );
  }
}