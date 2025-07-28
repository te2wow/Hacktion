import Database from 'better-sqlite3';
import path from 'path';
import { TeamStats } from '@/types';

const dbPath = path.join(process.cwd(), 'hacktion.db');

class DatabaseService {
  private db: Database.Database;

  constructor() {
    try {
      this.db = new Database(dbPath);
      this.initTables();
    } catch (error) {
      console.error('Database initialization failed:', error);
      // Create in-memory database as fallback
      this.db = new Database(':memory:');
      this.initTables();
    }
  }

  private initTables() {
    try {
      // Create hackathons table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS hackathons (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create hackathon_repositories table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS hackathon_repositories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hackathon_id TEXT NOT NULL,
          repository_url TEXT NOT NULL,
          repository_name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (hackathon_id) REFERENCES hackathons (id) ON DELETE CASCADE,
          UNIQUE(hackathon_id, repository_url)
        )
      `);

      // Create hackathon_teams table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS hackathon_teams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hackathon_id TEXT NOT NULL,
          team_name TEXT NOT NULL,
          description TEXT,
          color TEXT DEFAULT '#FF6B35',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (hackathon_id) REFERENCES hackathons (id) ON DELETE CASCADE,
          UNIQUE(hackathon_id, team_name)
        )
      `);

      // Create hackathon_members table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS hackathon_members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          team_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          github_username TEXT,
          email TEXT,
          role TEXT,
          avatar_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (team_id) REFERENCES hackathon_teams (id) ON DELETE CASCADE
        )
      `);

      // Create team_repository_assignments table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS team_repository_assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          team_id INTEGER NOT NULL,
          repository_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (team_id) REFERENCES hackathon_teams (id) ON DELETE CASCADE,
          FOREIGN KEY (repository_id) REFERENCES hackathon_repositories (id) ON DELETE CASCADE,
          UNIQUE(team_id, repository_id)
        )
      `);

      // Create teams table (for GitHub stats)
      this.db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY,
        hackathon_id TEXT,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL,
        owner TEXT NOT NULL,
        avatar_url TEXT,
        description TEXT,
        html_url TEXT NOT NULL,
        total_commits INTEGER DEFAULT 0,
        commits_today INTEGER DEFAULT 0,
        issues_open INTEGER DEFAULT 0,
        issues_closed INTEGER DEFAULT 0,
        issues_completion_rate REAL DEFAULT 0,
        pull_requests_merged INTEGER DEFAULT 0,
        last_commit_time TEXT,
        code_additions INTEGER DEFAULT 0,
        code_deletions INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(hackathon_id, full_name)
      )
    `);

    // Create contributors table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contributors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER,
        login TEXT NOT NULL,
        avatar_url TEXT,
        commits INTEGER DEFAULT 0,
        additions INTEGER DEFAULT 0,
        deletions INTEGER DEFAULT 0,
        FOREIGN KEY (team_id) REFERENCES teams (id),
        UNIQUE(team_id, login)
      )
    `);

    // Create commits_timeline table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS commits_timeline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER,
        date TEXT NOT NULL,
        commits INTEGER DEFAULT 0,
        additions INTEGER DEFAULT 0,
        deletions INTEGER DEFAULT 0,
        FOREIGN KEY (team_id) REFERENCES teams (id),
        UNIQUE(team_id, date)
      )
    `);

    // Create repositories config table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS repository_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repository_url TEXT NOT NULL UNIQUE,
        team_name TEXT,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    } catch (error) {
      console.error('Database table initialization failed:', error);
    }
  }

  saveTeamStats(stats: TeamStats): void {
    const transaction = this.db.transaction(() => {
      // Update or insert team data
      const teamStmt = this.db.prepare(`
        INSERT OR REPLACE INTO teams (
          id, name, full_name, owner, avatar_url, description, html_url,
          total_commits, commits_today, issues_open, issues_closed,
          issues_completion_rate, pull_requests_merged, last_commit_time,
          code_additions, code_deletions, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      teamStmt.run(
        stats.id,
        stats.name,
        stats.full_name,
        stats.owner,
        stats.avatar_url,
        stats.description,
        stats.html_url,
        stats.total_commits,
        stats.commits_today,
        stats.issues_open,
        stats.issues_closed,
        stats.issues_completion_rate,
        stats.pull_requests_merged,
        stats.last_commit_time,
        stats.code_additions,
        stats.code_deletions
      );

      // Clear existing contributors and timeline data
      this.db.prepare('DELETE FROM contributors WHERE team_id = ?').run(stats.id);
      this.db.prepare('DELETE FROM commits_timeline WHERE team_id = ?').run(stats.id);

      // Insert contributors
      const contributorStmt = this.db.prepare(`
        INSERT INTO contributors (team_id, login, avatar_url, commits, additions, deletions)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stats.contributors.forEach((contributor) => {
        contributorStmt.run(
          stats.id,
          contributor.login,
          contributor.avatar_url,
          contributor.commits,
          contributor.additions,
          contributor.deletions
        );
      });

      // Insert timeline data
      const timelineStmt = this.db.prepare(`
        INSERT INTO commits_timeline (team_id, date, commits, additions, deletions)
        VALUES (?, ?, ?, ?, ?)
      `);

      stats.commits_over_time.forEach((timeData) => {
        timelineStmt.run(
          stats.id,
          timeData.date,
          timeData.commits,
          timeData.additions,
          timeData.deletions
        );
      });
    });

    transaction();
  }

  getAllTeamStats(): TeamStats[] {
    const teams = this.db.prepare(`
      SELECT * FROM teams ORDER BY commits_today DESC, total_commits DESC
    `).all() as any[];

    return teams.map((team) => {
      const contributors = this.db.prepare(`
        SELECT login, avatar_url, commits, additions, deletions
        FROM contributors WHERE team_id = ?
        ORDER BY commits DESC
      `).all(team.id) as any[];

      const commitsOverTime = this.db.prepare(`
        SELECT date, commits, additions, deletions
        FROM commits_timeline WHERE team_id = ?
        ORDER BY date ASC
      `).all(team.id) as any[];

      return {
        ...team,
        contributors,
        commits_over_time: commitsOverTime,
      };
    });
  }

  getTeamById(id: number): TeamStats | null {
    const team = this.db.prepare('SELECT * FROM teams WHERE id = ?').get(id) as any;
    
    if (!team) return null;

    const contributors = this.db.prepare(`
      SELECT login, avatar_url, commits, additions, deletions
      FROM contributors WHERE team_id = ?
      ORDER BY commits DESC
    `).all(id) as any[];

    const commitsOverTime = this.db.prepare(`
      SELECT date, commits, additions, deletions
      FROM commits_timeline WHERE team_id = ?
      ORDER BY date ASC
    `).all(id) as any[];

    return {
      ...team,
      contributors,
      commits_over_time: commitsOverTime,
    };
  }

  addRepository(repositoryUrl: string, teamName?: string): void {
    this.db.prepare(`
      INSERT OR IGNORE INTO repository_config (repository_url, team_name)
      VALUES (?, ?)
    `).run(repositoryUrl, teamName);
  }

  getActiveRepositories(): string[] {
    const repos = this.db.prepare(`
      SELECT repository_url FROM repository_config WHERE active = 1
    `).all() as { repository_url: string }[];

    return repos.map(r => r.repository_url);
  }

  // Hackathon management methods
  createHackathon(data: { id: string; name: string; description?: string; startDate: string; endDate: string }): void {
    this.db.prepare(`
      INSERT INTO hackathons (id, name, description, start_date, end_date)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.id, data.name, data.description || null, data.startDate, data.endDate);
  }

  getHackathon(id: string): any {
    return this.db.prepare('SELECT * FROM hackathons WHERE id = ?').get(id);
  }

  getAllHackathons(): any[] {
    return this.db.prepare('SELECT * FROM hackathons ORDER BY created_at DESC').all();
  }

  deleteHackathon(id: string): void {
    this.db.prepare('DELETE FROM hackathons WHERE id = ?').run(id);
  }

  // Repository management
  addRepository(hackathonId: string, data: { url: string; name: string; description?: string }): number {
    const result = this.db.prepare(`
      INSERT INTO hackathon_repositories (hackathon_id, repository_url, repository_name, description)
      VALUES (?, ?, ?, ?)
    `).run(hackathonId, data.url, data.name, data.description || null);
    return result.lastInsertRowid as number;
  }

  getRepositories(hackathonId: string): any[] {
    return this.db.prepare(`
      SELECT * FROM hackathon_repositories WHERE hackathon_id = ? ORDER BY created_at
    `).all(hackathonId);
  }

  deleteRepository(repositoryId: number): void {
    this.db.prepare('DELETE FROM hackathon_repositories WHERE id = ?').run(repositoryId);
  }

  // Team management
  addTeam(hackathonId: string, data: { name: string; description?: string; color?: string }): number {
    const result = this.db.prepare(`
      INSERT INTO hackathon_teams (hackathon_id, team_name, description, color)
      VALUES (?, ?, ?, ?)
    `).run(hackathonId, data.name, data.description || null, data.color || '#FF6B35');
    return result.lastInsertRowid as number;
  }

  getTeams(hackathonId: string): any[] {
    return this.db.prepare(`
      SELECT * FROM hackathon_teams WHERE hackathon_id = ? ORDER BY created_at
    `).all(hackathonId);
  }

  deleteTeam(teamId: number): void {
    this.db.prepare('DELETE FROM hackathon_teams WHERE id = ?').run(teamId);
  }

  // Member management
  addMember(teamId: number, data: { name: string; githubUsername?: string; email?: string; role?: string }): void {
    const avatarUrl = data.githubUsername ? `https://github.com/${data.githubUsername}.png` : null;
    this.db.prepare(`
      INSERT INTO hackathon_members (team_id, name, github_username, email, role, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(teamId, data.name, data.githubUsername || null, data.email || null, data.role || null, avatarUrl);
  }

  getMembers(teamId: number): any[] {
    return this.db.prepare(`
      SELECT * FROM hackathon_members WHERE team_id = ? ORDER BY created_at
    `).all(teamId);
  }

  deleteMember(memberId: number): void {
    this.db.prepare('DELETE FROM hackathon_members WHERE id = ?').run(memberId);
  }

  // Repository assignments
  assignRepositoryToTeam(teamId: number, repositoryId: number): void {
    this.db.prepare(`
      INSERT OR IGNORE INTO team_repository_assignments (team_id, repository_id)
      VALUES (?, ?)
    `).run(teamId, repositoryId);
  }

  unassignRepositoryFromTeam(teamId: number, repositoryId: number): void {
    this.db.prepare(`
      DELETE FROM team_repository_assignments WHERE team_id = ? AND repository_id = ?
    `).run(teamId, repositoryId);
  }

  getTeamRepositories(teamId: number): any[] {
    return this.db.prepare(`
      SELECT hr.* FROM hackathon_repositories hr
      JOIN team_repository_assignments tra ON hr.id = tra.repository_id
      WHERE tra.team_id = ?
    `).all(teamId);
  }

  // Get hackathon data with all related information
  getHackathonWithData(hackathonId: string): any {
    const hackathon = this.getHackathon(hackathonId);
    if (!hackathon) return null;

    const repositories = this.getRepositories(hackathonId);
    const teams = this.getTeams(hackathonId).map(team => ({
      ...team,
      members: this.getMembers(team.id),
      repositories: this.getTeamRepositories(team.id)
    }));

    return {
      ...hackathon,
      repositories,
      teams
    };
  }

  // Get repositories for a hackathon (used by GitHub API)
  getHackathonRepositoryUrls(hackathonId: string): string[] {
    const repos = this.db.prepare(`
      SELECT repository_url FROM hackathon_repositories WHERE hackathon_id = ?
    `).all(hackathonId);
    return repos.map((r: any) => r.repository_url);
  }

  close(): void {
    this.db.close();
  }
}

export const db = new DatabaseService();