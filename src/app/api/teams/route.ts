import { NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';
import { db } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repositories } = body;
    
    if (!repositories || repositories.length === 0) {
      return NextResponse.json([]);
    }

    const gitHubService = new GitHubService();
    const teams = await Promise.all(
      repositories.map(async (repoUrl: string) => {
        try {
          return await gitHubService.getRepositoryStats(repoUrl);
        } catch (error) {
          console.error(`Error fetching stats for ${repoUrl}:`, error);
          return null;
        }
      })
    );

    const validTeams = teams.filter(team => team !== null);
    return NextResponse.json(validTeams);
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json([]);
  }
}

export async function GET() {
  // Return empty array for GET requests - use POST instead
  return NextResponse.json([]);
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