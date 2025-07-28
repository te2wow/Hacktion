# Hacktion 🚀

A real-time GitHub progress tracker for hackathons. Monitor multiple teams' GitHub activity, commits, issues, and pull requests all in one dashboard.

## ✨ Features

- **Real-time Monitoring**: Auto-refresh every minute with manual refresh option
- **Team Overview**: Dashboard showing all teams with key metrics
- **Detailed Analytics**: Individual team pages with charts and graphs
- **GitHub Integration**: Fetches data from GitHub REST API
- **Issue Tracking**: Monitor open vs closed issues with completion rates
- **Commit Analytics**: Track commits over time with code changes
- **Contributor Insights**: See who's contributing the most to each team
- **Modern UI**: Dark theme with energetic orange and tech blue colors

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + TypeScript
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Database**: SQLite with better-sqlite3
- **API**: GitHub REST API via Octokit
- **Testing**: Vitest
- **Linting**: ESLint + Prettier

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- GitHub Personal Access Token

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hacktion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your GitHub token:
   ```env
   GITHUB_TOKEN=your_github_token_here
   GITHUB_REPOSITORIES=https://github.com/team1/repo1,https://github.com/team2/repo2
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### GitHub Token Setup

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read user profile data)
4. Copy the token and add it to your `.env.local` file

### Adding Repositories

Add repositories to track in your `.env.local` file:

```env
GITHUB_REPOSITORIES=https://github.com/owner1/repo1,https://github.com/owner2/repo2,https://github.com/owner3/repo3
```

## 📊 Dashboard Features

### Main Dashboard
- **Team Cards**: Overview of each team's progress
- **Activity Levels**: Visual indicators for team activity
- **Quick Stats**: Total commits, issue completion, PRs merged
- **Last Update Time**: Shows when data was last refreshed

### Team Detail View
- **Commits Over Time**: Line chart showing daily commit activity
- **Code Changes**: Bar chart of additions/deletions
- **Contributor Breakdown**: Pie chart of team member contributions
- **Issue Progress**: Progress bar and stats for issue completion

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables in Vercel**
   - `GITHUB_TOKEN`: Your GitHub personal access token
   - `GITHUB_REPOSITORIES`: Comma-separated repository URLs

## 🧪 Testing

Run tests with Vitest:

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui
```

## 🔍 Development

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── team/[id]/         # Team detail pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── TeamCard.tsx       # Team overview card
│   ├── *Chart.tsx         # Chart components
│   └── Logo.tsx           # App logo
├── lib/                   # Utilities
│   ├── github.ts          # GitHub API service
│   └── database.ts        # Database service
└── types/                 # TypeScript types
    └── index.ts           # Shared types
```

### Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run test        # Run tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit changes: `git commit -m 'Add feature'`
7. Push to branch: `git push origin feature-name`
8. Submit a pull request

## 🆘 Troubleshooting

### Common Issues

1. **"API rate limit exceeded"**
   - Make sure you're using a GitHub token
   - Consider using a GitHub App for higher rate limits

2. **"No teams configured"**
   - Check your `GITHUB_REPOSITORIES` environment variable
   - Ensure repository URLs are correct and accessible

3. **Database errors**
   - Delete `hacktion.db` to reset the database
   - Check file permissions in your deployment environment

4. **Charts not displaying**
   - Ensure you have recent commit data
   - Check browser console for JavaScript errors

## 📝 License

MIT License

---

Built with ❤️ for hackathon organizers and participants!