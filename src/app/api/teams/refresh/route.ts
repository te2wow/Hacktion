import { NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';
import { db } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repositories } = body;
    
    if (!repositories || repositories.length === 0) {
      return NextResponse.json({ 
        message: 'No repositories provided',
        count: 0
      });
    }

    const gitHubService = new GitHubService();
    let successCount = 0;
    
    for (const repoUrl of repositories) {
      try {
        await gitHubService.getRepositoryStats(repoUrl);
        successCount++;
      } catch (error) {
        console.error(`Error refreshing ${repoUrl}:`, error);
      }
    }

    return NextResponse.json({ 
      message: 'Team data refreshed successfully',
      count: successCount
    });
  } catch (error) {
    console.error('Error refreshing team data:', error);
    return NextResponse.json(
      { error: 'Failed to refresh team data' },
      { status: 500 }
    );
  }
}

function getConfiguredRepositories(hackathonId: string): string[] {
  if (typeof window !== 'undefined') {
    return [];
  }
  
  try {
    const { HackathonStorage } = require('@/lib/hackathon');
    const hackathon = HackathonStorage.getHackathon(hackathonId);
    
    if (hackathon && hackathon.repositories) {
      return hackathon.repositories.map((repo: any) => repo.url);
    }
  } catch (error) {
    console.error('Error loading hackathon data:', error);
  }
  
  return [];
}