export interface Hackathon {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  repositories: Repository[]
  teams: Team[]
  createdAt: string
  updatedAt: string
}

export interface Repository {
  id: string
  url: string
  name: string
  description?: string
  teamId?: string
}

export interface Team {
  id: string
  name: string
  description?: string
  members: Member[]
  repositoryIds: string[]
  color?: string
}

export interface Member {
  id: string
  name: string
  githubUsername?: string
  email?: string
  role?: string
  avatar?: string
}

// 推測不能なIDを生成
export function generateHackathonId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const length = 12
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

// LocalStorageでのハッカソン管理
export class HackathonStorage {
  private static STORAGE_KEY = 'hacktion_hackathons'
  private static CURRENT_KEY = 'hacktion_current'

  static getAllHackathons(): Hackathon[] {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static getHackathon(id: string): Hackathon | null {
    const hackathons = this.getAllHackathons()
    return hackathons.find(h => h.id === id) || null
  }

  static saveHackathon(hackathon: Hackathon): void {
    if (typeof window === 'undefined') return
    
    const hackathons = this.getAllHackathons()
    const index = hackathons.findIndex(h => h.id === hackathon.id)
    
    hackathon.updatedAt = new Date().toISOString()
    
    if (index >= 0) {
      hackathons[index] = hackathon
    } else {
      hackathons.push(hackathon)
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(hackathons))
  }

  static deleteHackathon(id: string): void {
    if (typeof window === 'undefined') return
    
    const hackathons = this.getAllHackathons()
    const filtered = hackathons.filter(h => h.id !== id)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
  }

  static getCurrentHackathonId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.CURRENT_KEY)
  }

  static setCurrentHackathonId(id: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.CURRENT_KEY, id)
  }

  static createHackathon(data: Omit<Hackathon, 'id' | 'createdAt' | 'updatedAt'>): Hackathon {
    const hackathon: Hackathon = {
      ...data,
      id: generateHackathonId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.saveHackathon(hackathon)
    return hackathon
  }

  static clearAllData(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.CURRENT_KEY)
  }
}