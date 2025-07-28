import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubService } from '@/lib/github';

// Mock Octokit
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    rest: {
      repos: {
        get: vi.fn(),
        listCommits: vi.fn(),
        getCommit: vi.fn(),
      },
      issues: {
        listForRepo: vi.fn(),
      },
      pulls: {
        list: vi.fn(),
      },
    },
  })),
}));

describe('GitHubService', () => {
  let githubService: GitHubService;

  beforeEach(() => {
    githubService = new GitHubService('mock-token');
  });

  it('should initialize with token', () => {
    expect(githubService).toBeInstanceOf(GitHubService);
  });

  describe('parseGitHubUrl', () => {
    it('should parse GitHub URLs correctly', () => {
      const url = 'https://github.com/owner/repo';
      // @ts-ignore - accessing private method for testing
      const [owner, repo] = githubService.parseGitHubUrl(url);
      expect(owner).toBe('owner');
      expect(repo).toBe('repo');
    });

    it('should throw error for invalid URLs', () => {
      const invalidUrl = 'invalid-url';
      expect(() => {
        // @ts-ignore - accessing private method for testing
        githubService.parseGitHubUrl(invalidUrl);
      }).toThrow('Invalid GitHub URL');
    });
  });
});