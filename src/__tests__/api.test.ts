import { describe, it, expect, vi } from 'vitest';

// Mock the database
vi.mock('@/lib/database', () => ({
  db: {
    getAllTeamStats: vi.fn().mockReturnValue([
      {
        id: 1,
        name: 'Test Team',
        full_name: 'test/repo',
        total_commits: 10,
        commits_today: 2,
        updated_at: new Date().toISOString(),
      },
    ]),
    getActiveRepositories: vi.fn().mockReturnValue([]),
  },
}));

// Mock GitHub service
vi.mock('@/lib/github', () => ({
  GitHubService: vi.fn().mockImplementation(() => ({
    getMultipleTeamStats: vi.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Test Team',
        full_name: 'test/repo',
        total_commits: 10,
        commits_today: 2,
      },
    ]),
  })),
}));

describe('API Routes', () => {
  it('should export configuration correctly', () => {
    // Basic test to ensure the test setup is working
    expect(process.env.GITHUB_TOKEN).toBe('mock-token');
    expect(process.env.GITHUB_REPOSITORIES).toContain('test/repo1');
  });
});