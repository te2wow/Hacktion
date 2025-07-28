import { Octokit } from '@octokit/rest';
import { Repository, CommitData, IssueData, PullRequestData, TeamStats, ContributorStats, CommitTimeData } from '@/types';

export class GitHubService {
  private octokit: Octokit;

  constructor(token?: string) {
    const authToken = token || process.env.GITHUB_TOKEN;
    this.octokit = new Octokit({
      auth: authToken || undefined,
    });
  }

  async getRepository(owner: string, repo: string): Promise<Repository> {
    const response = await this.octokit.rest.repos.get({
      owner,
      repo,
    });
    return response.data as Repository;
  }

  async getCommits(owner: string, repo: string, since?: string): Promise<CommitData[]> {
    const params: any = {
      owner,
      repo,
      per_page: 100,
    };
    
    if (since) {
      params.since = since;
    }

    const response = await this.octokit.rest.repos.listCommits(params);
    
    // Get detailed stats for each commit
    const commitsWithStats = await Promise.all(
      response.data.slice(0, 20).map(async (commit) => {
        try {
          const commitDetail = await this.octokit.rest.repos.getCommit({
            owner,
            repo,
            ref: commit.sha,
          });
          return {
            ...commit,
            stats: commitDetail.data.stats,
          };
        } catch (error) {
          return commit;
        }
      })
    );

    return commitsWithStats as CommitData[];
  }

  async getIssues(owner: string, repo: string): Promise<IssueData[]> {
    const [openIssues, closedIssues] = await Promise.all([
      this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 100,
      }),
      this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'closed',
        per_page: 100,
      }),
    ]);

    return [...openIssues.data, ...closedIssues.data].filter(
      (issue) => !issue.pull_request
    ) as IssueData[];
  }

  async getPullRequests(owner: string, repo: string): Promise<PullRequestData[]> {
    const [openPRs, closedPRs] = await Promise.all([
      this.octokit.rest.pulls.list({
        owner,
        repo,
        state: 'open',
        per_page: 100,
      }),
      this.octokit.rest.pulls.list({
        owner,
        repo,
        state: 'closed',
        per_page: 100,
      }),
    ]);

    return [...openPRs.data, ...closedPRs.data] as PullRequestData[];
  }

  async getTeamStats(owner: string, repo: string): Promise<TeamStats> {
    try {
      const [repository, commits, issues, pullRequests] = await Promise.all([
        this.getRepository(owner, repo),
        this.getCommits(owner, repo),
        this.getIssues(owner, repo),
        this.getPullRequests(owner, repo),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const commitsToday = commits.filter(
        (commit) => commit.commit.author?.date && new Date(commit.commit.author.date) >= today
      );

      const openIssues = issues.filter((issue) => issue.state === 'open');
      const closedIssues = issues.filter((issue) => issue.state === 'closed');
      const mergedPRs = pullRequests.filter((pr) => pr.merged_at);

      // Calculate contributor stats
      const contributorMap = new Map<string, ContributorStats>();
      commits.forEach((commit) => {
        const author = commit.author?.login || commit.commit.author?.name || 'Unknown';
        const existing = contributorMap.get(author) || {
          login: author,
          avatar_url: commit.author?.avatar_url || '',
          commits: 0,
          additions: 0,
          deletions: 0,
        };
        
        existing.commits += 1;
        existing.additions += commit.stats?.additions || 0;
        existing.deletions += commit.stats?.deletions || 0;
        
        contributorMap.set(author, existing);
      });

      // Calculate commits over time (last 7 days)
      const commitsOverTime: CommitTimeData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dayCommits = commits.filter((commit) => {
          if (!commit.commit.author?.date) return false;
          const commitDate = new Date(commit.commit.author.date);
          commitDate.setHours(0, 0, 0, 0);
          return commitDate.getTime() === date.getTime();
        });

        commitsOverTime.push({
          date: date.toISOString().split('T')[0],
          commits: dayCommits.length,
          additions: dayCommits.reduce((sum, c) => sum + (c.stats?.additions || 0), 0),
          deletions: dayCommits.reduce((sum, c) => sum + (c.stats?.deletions || 0), 0),
        });
      }

      const totalAdditions = commits.reduce((sum, c) => sum + (c.stats?.additions || 0), 0);
      const totalDeletions = commits.reduce((sum, c) => sum + (c.stats?.deletions || 0), 0);

      return {
        id: repository.id,
        name: repository.name,
        full_name: repository.full_name,
        owner: repository.owner.login,
        avatar_url: repository.owner.avatar_url,
        description: repository.description || undefined,
        html_url: repository.html_url,
        total_commits: commits.length,
        commits_today: commitsToday.length,
        issues_open: openIssues.length,
        issues_closed: closedIssues.length,
        issues_completion_rate: issues.length > 0 ? (closedIssues.length / issues.length) * 100 : 0,
        pull_requests_merged: mergedPRs.length,
        last_commit_time: commits[0]?.commit.author?.date,
        code_additions: totalAdditions,
        code_deletions: totalDeletions,
        contributors: Array.from(contributorMap.values()),
        commits_over_time: commitsOverTime,
      };
    } catch (error) {
      console.error(`Error fetching stats for ${owner}/${repo}:`, error);
      throw error;
    }
  }

  async getMultipleTeamStats(repositories: string[]): Promise<TeamStats[]> {
    const statsPromises = repositories.map((repoUrl) => {
      const [owner, repo] = this.parseGitHubUrl(repoUrl);
      return this.getTeamStats(owner, repo);
    });

    const results = await Promise.allSettled(statsPromises);
    return results
      .filter((result): result is PromiseFulfilledResult<TeamStats> => result.status === 'fulfilled')
      .map((result) => result.value);
  }

  private parseGitHubUrl(url: string): [string, string] {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error(`Invalid GitHub URL: ${url}`);
    }
    return [match[1], match[2]];
  }
}