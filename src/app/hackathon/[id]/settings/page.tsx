'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { HackathonStorage, type Hackathon, type Repository, type Team, type Member } from '@/lib/hackathon'

export default function HackathonSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Form states for repository-team pairs
  const [repoUrl, setRepoUrl] = useState('')
  const [repoName, setRepoName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')
  const [teamColor, setTeamColor] = useState('#FF6B35')
  
  const [memberName, setMemberName] = useState('')
  const [memberGithub, setMemberGithub] = useState('')
  const [memberEmail, setMemberEmail] = useState('')
  const [memberRole, setMemberRole] = useState('')
  const [selectedTeamForMember, setSelectedTeamForMember] = useState('')

  useEffect(() => {
    if (params.id) {
      const hackathonData = HackathonStorage.getHackathon(params.id as string)
      if (hackathonData) {
        setHackathon(hackathonData)
      } else {
        router.push('/')
      }
      setLoading(false)
    }
  }, [params.id, router])

  const updateHackathon = (updatedHackathon: Hackathon) => {
    HackathonStorage.saveHackathon(updatedHackathon)
    setHackathon(updatedHackathon)
  }

  const addRepositoryTeamPair = () => {
    if (!hackathon || !repoUrl.trim() || !teamName.trim()) return

    const repoId = Date.now().toString()
    const teamId = (Date.now() + 1).toString()

    const newRepo: Repository = {
      id: repoId,
      url: repoUrl.trim(),
      name: repoName.trim() || extractRepoName(repoUrl),
      teamId: teamId
    }

    const newTeam: Team = {
      id: teamId,
      name: teamName.trim(),
      description: teamDescription.trim() || undefined,
      members: [],
      repositoryIds: [repoId],
      color: teamColor
    }

    const updatedHackathon = {
      ...hackathon,
      repositories: [...hackathon.repositories, newRepo],
      teams: [...hackathon.teams, newTeam]
    }

    updateHackathon(updatedHackathon)
    setRepoUrl('')
    setRepoName('')
    setTeamName('')
    setTeamDescription('')
    setTeamColor('#FF6B35')
  }

  const removeRepositoryTeamPair = (repoId: string) => {
    if (!hackathon) return

    const repo = hackathon.repositories.find(r => r.id === repoId)
    const teamIdToRemove = repo?.teamId
    
    const updatedHackathon = {
      ...hackathon,
      repositories: hackathon.repositories.filter(r => r.id !== repoId),
      teams: hackathon.teams.filter(t => t.id !== teamIdToRemove)
    }

    updateHackathon(updatedHackathon)
  }


  const addMember = () => {
    if (!hackathon || !memberName.trim() || !selectedTeamForMember) return

    const newMember: Member = {
      id: Date.now().toString(),
      name: memberName.trim(),
      githubUsername: memberGithub.trim() || undefined,
      email: memberEmail.trim() || undefined,
      role: memberRole.trim() || undefined,
      avatar: memberGithub.trim() ? `https://github.com/${memberGithub.trim()}.png` : undefined
    }

    const updatedHackathon = {
      ...hackathon,
      teams: hackathon.teams.map(team => 
        team.id === selectedTeamForMember 
          ? { ...team, members: [...team.members, newMember] }
          : team
      )
    }

    updateHackathon(updatedHackathon)
    setMemberName('')
    setMemberGithub('')
    setMemberEmail('')
    setMemberRole('')
  }

  const removeMember = (teamId: string, memberId: string) => {
    if (!hackathon) return

    const updatedHackathon = {
      ...hackathon,
      teams: hackathon.teams.map(team => 
        team.id === teamId 
          ? { ...team, members: team.members.filter(m => m.id !== memberId) }
          : team
      )
    }

    updateHackathon(updatedHackathon)
  }


  const extractRepoName = (url: string): string => {
    const match = url.match(/github\.com\/[^\/]+\/([^\/]+)/)
    return match ? match[1] : 'Unknown Repository'
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-hacktion-orange border-t-transparent rounded-full"></div></div>
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{hackathon.name} - 設定</h1>
        <button
          onClick={() => router.push(`/hackathon/${hackathon.id}`)}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          ダッシュボードに戻る
        </button>
      </div>

      {/* Share Link */}
      <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">共有リンク</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={`${window.location.origin}/hackathon/${hackathon.id}`}
            readOnly
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-300"
          />
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/hackathon/${hackathon.id}`)}
            className="px-4 py-2 bg-hacktion-orange text-white rounded hover:bg-opacity-80"
          >
            コピー
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          このリンクを参加者に共有してリアルタイム進捗を確認してもらいましょう
        </p>
      </div>

      {/* Repository-Team Management */}
      <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">チーム・リポジトリ管理</h2>
        <p className="text-sm text-gray-400 mb-6">
          リポジトリとチームは1:1で紐づきます。リポジトリを追加すると対応するチームが自動的に作成されます。
        </p>
        
        {/* Add Repository-Team Pair Form */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 p-4 bg-gray-800 rounded">
          <input
            type="text"
            placeholder="GitHubリポジトリURL"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="リポジトリ名（省略可）"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="チーム名"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="チーム説明（省略可）"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
          />
          <input
            type="color"
            value={teamColor}
            onChange={(e) => setTeamColor(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 h-10"
          />
          <button
            onClick={addRepositoryTeamPair}
            disabled={!repoUrl.trim() || !teamName.trim()}
            className="px-4 py-2 bg-hacktion-orange text-white rounded hover:bg-opacity-80 disabled:opacity-50"
          >
            追加
          </button>
        </div>

        {/* Repository-Team Pairs List */}
        <div className="space-y-4">
          {hackathon.repositories.map((repo) => {
            const team = hackathon.teams.find(t => t.id === repo.teamId)
            return (
              <div key={repo.id} className="p-4 bg-gray-800 rounded">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: team?.color || '#FF6B35' }}
                    ></div>
                    <div>
                      <h4 className="font-medium">{team?.name || 'Unknown Team'}</h4>
                      <p className="text-sm text-gray-400">{repo.name} - {repo.url}</p>
                      {team?.description && <p className="text-xs text-gray-500">{team.description}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => removeRepositoryTeamPair(repo.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    削除
                  </button>
                </div>
                
                {/* Members */}
                {team && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">メンバー ({team.members.length})</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {team.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                          <div className="flex items-center space-x-2">
                            {member.avatar && (
                              <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" />
                            )}
                            <span className="text-sm">{member.name}</span>
                            {member.githubUsername && <span className="text-xs text-gray-400">@{member.githubUsername}</span>}
                            {member.role && <span className="text-xs text-blue-400">{member.role}</span>}
                          </div>
                          <button
                            onClick={() => removeMember(team.id, member.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            削除
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {hackathon.repositories.length === 0 && (
            <p className="text-gray-400 text-center py-4">チーム・リポジトリが登録されていません</p>
          )}
        </div>
      </div>

      {/* Member Management */}
      {hackathon.teams.length > 0 && (
        <div className="bg-hacktion-gray rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">メンバー追加</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-800 rounded">
            <select
              value={selectedTeamForMember}
              onChange={(e) => setSelectedTeamForMember(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="">チームを選択</option>
              {hackathon.teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="名前"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="GitHub ID"
              value={memberGithub}
              onChange={(e) => setMemberGithub(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="役割"
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
            />
            <button
              onClick={addMember}
              disabled={!memberName.trim() || !selectedTeamForMember}
              className="px-4 py-2 bg-hacktion-orange text-white rounded hover:bg-opacity-80 disabled:opacity-50"
            >
              追加
            </button>
          </div>
        </div>
      )}
    </div>
  )
}