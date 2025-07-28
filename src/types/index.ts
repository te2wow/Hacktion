export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description?: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface CommitData {
  sha: string;
  commit: {
    author: {
      name?: string;
      email?: string;
      date?: string;
    } | null;
    message: string;
  };
  author?: {
    login: string;
    avatar_url: string;
  } | null;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export interface IssueData {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  closed_at?: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface PullRequestData {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  merged_at?: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface TeamStats {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  avatar_url: string;
  description?: string;
  html_url: string;
  total_commits: number;
  commits_today: number;
  issues_open: number;
  issues_closed: number;
  issues_completion_rate: number;
  pull_requests_merged: number;
  last_commit_time?: string;
  code_additions: number;
  code_deletions: number;
  contributors: ContributorStats[];
  commits_over_time: CommitTimeData[];
  updated_at?: string;
}

export interface ContributorStats {
  login: string;
  avatar_url: string;
  commits: number;
  additions: number;
  deletions: number;
}

export interface CommitTimeData {
  date: string;
  commits: number;
  additions: number;
  deletions: number;
}

export interface DatabaseSchema {
  repositories: Repository[];
  commits: CommitData[];
  issues: IssueData[];
  pull_requests: PullRequestData[];
  last_updated: string;
}