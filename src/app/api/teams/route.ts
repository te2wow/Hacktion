import { NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';
import { db } from '@/lib/database';

export async function GET() {
  try {
    // Get cached data from database
    const cachedTeams = db.getAllTeamStats();
    
    // If we have recent data (less than 5 minutes old), return it
    if (cachedTeams.length > 0) {
      const lastUpdated = new Date(cachedTeams[0].updated_at || 0);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (lastUpdated > fiveMinutesAgo) {
        return NextResponse.json(cachedTeams);
      }
    }

    // Otherwise, fetch fresh data from GitHub
    const github = new GitHubService();
    const repositories = getConfiguredRepositories();
    
    if (repositories.length === 0) {
      return NextResponse.json([]);
    }

    const teamStats = await github.getMultipleTeamStats(repositories);
    
    // Save to database
    teamStats.forEach(stats => {
      db.saveTeamStats(stats);
    });

    return NextResponse.json(teamStats);
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    );
  }
}

function getConfiguredRepositories(): string[] {
  // Try to get from database first
  const dbRepos = db.getActiveRepositories();
  if (dbRepos.length > 0) {
    return dbRepos;
  }

  // Fallback to environment variable
  const repoList = process.env.GITHUB_REPOSITORIES;
  if (repoList) {
    return repoList.split(',').map(repo => repo.trim());
  }

  // Demo repositories for testing
  return [
    'https://github.com/vercel/next.js',
    'https://github.com/facebook/react',
    'https://github.com/microsoft/vscode',
  ];
}