import { NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';
import { db } from '@/lib/database';

export async function POST() {
  try {
    const github = new GitHubService();
    const repositories = getConfiguredRepositories();
    
    if (repositories.length === 0) {
      return NextResponse.json({ message: 'No repositories configured' });
    }

    const teamStats = await github.getMultipleTeamStats(repositories);
    
    // Save to database
    teamStats.forEach(stats => {
      db.saveTeamStats(stats);
    });

    return NextResponse.json({ 
      message: 'Teams data refreshed successfully',
      count: teamStats.length 
    });
  } catch (error) {
    console.error('Error refreshing team data:', error);
    return NextResponse.json(
      { error: 'Failed to refresh team data' },
      { status: 500 }
    );
  }
}

function getConfiguredRepositories(): string[] {
  const dbRepos = db.getActiveRepositories();
  if (dbRepos.length > 0) {
    return dbRepos;
  }

  const repoList = process.env.GITHUB_REPOSITORIES;
  if (repoList) {
    return repoList.split(',').map(repo => repo.trim());
  }

  return [
    'https://github.com/vercel/next.js',
    'https://github.com/facebook/react',
    'https://github.com/microsoft/vscode',
  ];
}