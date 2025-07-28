import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { GitHubService } from './lib/github'
import { db } from './lib/database'

const app = new Hono()

app.use('*', logger())

app.use('*', cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/api/teams', async (c) => {
  try {
    console.log('Fetching team data...')
    const cachedTeams = db.getAllTeamStats()
    
    if (cachedTeams.length > 0) {
      const lastUpdated = new Date(cachedTeams[0].updated_at || 0)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      
      if (lastUpdated > fiveMinutesAgo) {
        console.log('Returning cached data')
        return c.json(cachedTeams)
      }
    }

    const github = new GitHubService()
    const repositories = getConfiguredRepositories()
    console.log('Configured repositories:', repositories)
    
    if (repositories.length === 0) {
      console.log('No repositories configured')
      return c.json([])
    }

    console.log('Fetching fresh data from GitHub...')
    const teamStats = await github.getMultipleTeamStats(repositories)
    console.log('Retrieved team stats:', teamStats.length, 'teams')
    
    teamStats.forEach(stats => {
      db.saveTeamStats(stats)
    })

    return c.json(teamStats)
  } catch (error) {
    console.error('Error fetching team data:', error)
    return c.json(
      { error: 'Failed to fetch team data', details: error.message },
      500
    )
  }
})

app.get('/api/teams/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const team = db.getTeamById(id)
    
    if (!team) {
      return c.json({ error: 'Team not found' }, 404)
    }
    
    return c.json(team)
  } catch (error) {
    console.error('Error fetching team:', error)
    return c.json(
      { error: 'Failed to fetch team' },
      500
    )
  }
})

app.post('/api/teams/refresh', async (c) => {
  try {
    const github = new GitHubService()
    const repositories = getConfiguredRepositories()
    
    if (repositories.length === 0) {
      return c.json({ message: 'No repositories configured' })
    }

    const teamStats = await github.getMultipleTeamStats(repositories)
    
    teamStats.forEach(stats => {
      db.saveTeamStats(stats)
    })

    return c.json({ 
      message: 'Data refreshed successfully',
      teams: teamStats.length 
    })
  } catch (error) {
    console.error('Error refreshing data:', error)
    return c.json(
      { error: 'Failed to refresh data' },
      500
    )
  }
})

function getConfiguredRepositories(): string[] {
  const dbRepos = db.getActiveRepositories()
  if (dbRepos.length > 0) {
    return dbRepos
  }

  const repoList = process.env.GITHUB_REPOSITORIES
  if (repoList) {
    return repoList.split(',').map(repo => repo.trim())
  }

  return [
    'https://github.com/vercel/next.js',
    'https://github.com/facebook/react',
    'https://github.com/microsoft/vscode',
  ]
}

const port = parseInt(process.env.API_PORT || '3001')

console.log(`Hono server starting on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})