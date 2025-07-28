import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { GitHubService } from './src/lib/github'
import { db } from './src/lib/database'

const app = new Hono()

app.use('*', logger())

app.use('*', cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Hackathon management endpoints
app.post('/api/hackathons', async (c) => {
  try {
    const { id, name, description, startDate, endDate } = await c.req.json()
    
    db.createHackathon({ id, name, description, startDate, endDate })
    
    return c.json({ success: true, id })
  } catch (error) {
    console.error('Error creating hackathon:', error)
    return c.json({ error: 'Failed to create hackathon' }, 500)
  }
})

app.get('/api/hackathons', async (c) => {
  try {
    const hackathons = db.getAllHackathons()
    return c.json(hackathons)
  } catch (error) {
    console.error('Error fetching hackathons:', error)
    return c.json({ error: 'Failed to fetch hackathons' }, 500)
  }
})

app.get('/api/hackathons/:id', async (c) => {
  try {
    const hackathonId = c.req.param('id')
    const hackathon = db.getHackathonWithData(hackathonId)
    
    if (!hackathon) {
      return c.json({ error: 'Hackathon not found' }, 404)
    }
    
    return c.json(hackathon)
  } catch (error) {
    console.error('Error fetching hackathon:', error)
    return c.json({ error: 'Failed to fetch hackathon' }, 500)
  }
})

app.delete('/api/hackathons/:id', async (c) => {
  try {
    const hackathonId = c.req.param('id')
    db.deleteHackathon(hackathonId)
    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting hackathon:', error)
    return c.json({ error: 'Failed to delete hackathon' }, 500)
  }
})

// Repository management
app.post('/api/hackathons/:id/repositories', async (c) => {
  try {
    const hackathonId = c.req.param('id')
    const { url, name, description } = await c.req.json()
    
    const repositoryId = db.addRepository(hackathonId, { url, name, description })
    
    return c.json({ success: true, id: repositoryId })
  } catch (error) {
    console.error('Error adding repository:', error)
    return c.json({ error: 'Failed to add repository' }, 500)
  }
})

app.delete('/api/repositories/:id', async (c) => {
  try {
    const repositoryId = parseInt(c.req.param('id'))
    db.deleteRepository(repositoryId)
    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting repository:', error)
    return c.json({ error: 'Failed to delete repository' }, 500)
  }
})

// Team management
app.post('/api/hackathons/:id/teams', async (c) => {
  try {
    const hackathonId = c.req.param('id')
    const { name, description, color } = await c.req.json()
    
    const teamId = db.addTeam(hackathonId, { name, description, color })
    
    return c.json({ success: true, id: teamId })
  } catch (error) {
    console.error('Error adding team:', error)
    return c.json({ error: 'Failed to add team' }, 500)
  }
})

app.delete('/api/teams/:id', async (c) => {
  try {
    const teamId = parseInt(c.req.param('id'))
    db.deleteTeam(teamId)
    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting team:', error)
    return c.json({ error: 'Failed to delete team' }, 500)
  }
})

// Member management
app.post('/api/teams/:id/members', async (c) => {
  try {
    const teamId = parseInt(c.req.param('id'))
    const { name, githubUsername, email, role } = await c.req.json()
    
    db.addMember(teamId, { name, githubUsername, email, role })
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Error adding member:', error)
    return c.json({ error: 'Failed to add member' }, 500)
  }
})

app.delete('/api/members/:id', async (c) => {
  try {
    const memberId = parseInt(c.req.param('id'))
    db.deleteMember(memberId)
    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting member:', error)
    return c.json({ error: 'Failed to delete member' }, 500)
  }
})

// Repository assignments
app.post('/api/teams/:teamId/repositories/:repoId', async (c) => {
  try {
    const teamId = parseInt(c.req.param('teamId'))
    const repoId = parseInt(c.req.param('repoId'))
    
    db.assignRepositoryToTeam(teamId, repoId)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Error assigning repository:', error)
    return c.json({ error: 'Failed to assign repository' }, 500)
  }
})

app.delete('/api/teams/:teamId/repositories/:repoId', async (c) => {
  try {
    const teamId = parseInt(c.req.param('teamId'))
    const repoId = parseInt(c.req.param('repoId'))
    
    db.unassignRepositoryFromTeam(teamId, repoId)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Error unassigning repository:', error)
    return c.json({ error: 'Failed to unassign repository' }, 500)
  }
})

app.get('/api/hackathons/:id/teams', async (c) => {
  try {
    const hackathonId = c.req.param('id')
    console.log('Fetching team data for hackathon:', hackathonId)
    
    const cachedTeams = db.getAllTeamStats().filter(team => team.hackathon_id === hackathonId)
    
    if (cachedTeams.length > 0) {
      const lastUpdated = new Date(cachedTeams[0].updated_at || 0)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      
      if (lastUpdated > fiveMinutesAgo) {
        console.log('Returning cached data')
        return c.json(cachedTeams)
      }
    }

    const github = new GitHubService()
    const repositories = db.getHackathonRepositoryUrls(hackathonId)
    console.log('Configured repositories for hackathon:', repositories)
    
    if (repositories.length === 0) {
      console.log('No repositories configured for hackathon')
      return c.json([])
    }

    console.log('Fetching fresh data from GitHub...')
    const teamStats = await github.getMultipleTeamStats(repositories)
    console.log('Retrieved team stats:', teamStats.length, 'teams')
    
    teamStats.forEach(stats => {
      stats.hackathon_id = hackathonId
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

// Legacy endpoint for backward compatibility
app.get('/api/teams', async (c) => {
  try {
    console.log('Fetching team data (legacy endpoint)...')
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