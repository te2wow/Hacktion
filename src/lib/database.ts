import Database from 'better-sqlite3';
import path from 'path';
import { TeamStats } from '@/types';

const dbPath = path.join(process.cwd(), 'hacktion.db');

class DatabaseService {
  private db: Database.Database;

  constructor() {
    this.db = new Database(dbPath);
    this.initTables();
  }

  private initTables() {
    // Create teams table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL UNIQUE,
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  close(): void {
    this.db.close();
  }
}

export const db = new DatabaseService();