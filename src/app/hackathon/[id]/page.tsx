'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { HackathonStorage, type Hackathon } from '@/lib/hackathon'
import { TeamStats } from '@/types'
import TeamCard from '@/components/TeamCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { apiClient } from '@/lib/api'

export default function HackathonPage() {
  const params = useParams()
  const router = useRouter()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [teams, setTeams] = useState<TeamStats[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    if (params.id) {
      const hackathonData = HackathonStorage.getHackathon(params.id as string)
      if (hackathonData) {
        setHackathon(hackathonData)
        HackathonStorage.setCurrentHackathonId(hackathonData.id)
        fetchTeamData()
        
        // Set up automatic polling every minute
        const interval = setInterval(() => {
          fetchTeamData(true)
        }, 60000)
        
        return () => clearInterval(interval)
      } else {
        router.push('/')
      }
    }
  }, [params.id, router])

  const fetchTeamData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    
    try {
      const data = await apiClient.get(`/api/teams?hackathonId=${params.id}`)
      setTeams(data)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Failed to fetch team data:', error)
      setTeams([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleManualRefresh = async () => {
    setRefreshing(true)
    try {
      await apiClient.post('/api/teams/refresh', { hackathonId: params.id })
      await fetchTeamData()
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!hackathon) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">ハッカソンが見つかりません</h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-hacktion-orange text-white rounded hover:bg-opacity-80"
        >
          ホームに戻る
        </button>
      </div>
    )
  }

  const mostActiveTeam = teams.length > 0 ? teams.reduce((prev, current) => 
    prev.commits_today > current.commits_today ? prev : current
  ) : null

  const leastActiveTeam = teams.length > 0 ? teams.reduce((prev, current) => 
    prev.commits_today < current.commits_today ? prev : current
  ) : null

  return (
    <div className="space-y-6">
      {/* Hackathon Header */}
      <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{hackathon.name}</h1>
            <p className="text-gray-400 mb-4">{hackathon.description}</p>
            <div className="flex space-x-6 text-sm text-gray-500">
              <span>開始: {new Date(hackathon.startDate).toLocaleDateString('ja-JP')}</span>
              <span>終了: {new Date(hackathon.endDate).toLocaleDateString('ja-JP')}</span>
              <span>チーム数: {hackathon.teams.length}</span>
              <span>リポジトリ数: {hackathon.repositories.length}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push(`/hackathon/${hackathon.id}/settings`)}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              設定
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              ホーム
            </button>
          </div>
        </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-hacktion-orange mb-2">
            総チーム数
          </h3>
          <p className="text-3xl font-bold">{teams.length}</p>
        </div>
        
        <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            最も活発なチーム
          </h3>
          <p className="text-xl font-bold">{mostActiveTeam?.name || 'N/A'}</p>
          <p className="text-sm text-gray-400">
            {mostActiveTeam?.commits_today || 0} 今日のコミット
          </p>
        </div>
        
        <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            要注意チーム
          </h3>
          <p className="text-xl font-bold">{leastActiveTeam?.name || 'N/A'}</p>
          <p className="text-sm text-gray-400">
            {leastActiveTeam?.commits_today || 0} 今日のコミット
          </p>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">チーム進捗</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {refreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-hacktion-orange border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-hacktion-orange">更新中...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">自動更新有効</span>
              </>
            )}
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            手動更新
          </button>
          <div className="text-sm text-gray-400">
            最終更新: {lastUpdated}
          </div>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12 bg-hacktion-gray rounded-lg border border-gray-700">
          <p className="text-gray-400 mb-4">まだチームが設定されていません</p>
          <p className="text-sm text-gray-500 mb-6">
            設定画面でリポジトリとチームを追加してください
          </p>
          <button
            onClick={() => router.push(`/hackathon/${hackathon.id}/settings`)}
            className="px-6 py-3 bg-hacktion-orange text-white rounded hover:bg-opacity-80"
          >
            設定を開く
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  )
}