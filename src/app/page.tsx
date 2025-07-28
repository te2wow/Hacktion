'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HackathonStorage, type Hackathon } from '@/lib/hackathon';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const router = useRouter();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const allHackathons = HackathonStorage.getAllHackathons();
    setHackathons(allHackathons);
    setLoading(false);
  }, []);

  const handleCreateHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hackathon = HackathonStorage.createHackathon({
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      repositories: [],
      teams: []
    });

    setHackathons([...hackathons, hackathon]);
    setShowCreateForm(false);
    setFormData({ name: '', description: '', startDate: '', endDate: '' });
    
    router.push(`/hackathon/${hackathon.id}`);
  };

  const handleSelectHackathon = (hackathon: Hackathon) => {
    HackathonStorage.setCurrentHackathonId(hackathon.id);
    router.push(`/hackathon/${hackathon.id}`);
  };

  const handleDeleteHackathon = (hackathonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('このハッカソンを削除しますか？この操作は取り消せません。')) {
      HackathonStorage.deleteHackathon(hackathonId);
      setHackathons(hackathons.filter(h => h.id !== hackathonId));
    }
  };

  const handleClearAllData = () => {
    if (confirm('すべてのハッカソンデータを削除しますか？この操作は取り消せません。')) {
      HackathonStorage.clearAllData();
      setHackathons([]);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">ハッカソン管理</h1>
          <p className="text-gray-400 mt-2">ハッカソンを作成・管理してチームの進捗を追跡しましょう</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleClearAllData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
          >
            データをクリア
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-hacktion-orange text-white rounded hover:bg-opacity-80 font-medium"
          >
            新しいハッカソンを作成
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-hacktion-gray p-6 rounded-lg border border-gray-700 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">新しいハッカソンを作成</h2>
            <form onSubmit={handleCreateHackathon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">ハッカソン名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-hacktion-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">説明</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-hacktion-orange"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">開始日</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-hacktion-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">終了日</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-hacktion-orange"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-hacktion-orange text-white rounded hover:bg-opacity-80"
                >
                  作成
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {hackathons.length === 0 ? (
        <div className="text-center py-12 bg-hacktion-gray rounded-lg border border-gray-700">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-xl font-bold mb-2">ハッカソンを作成しましょう</h2>
          <p className="text-gray-400 mb-6">
            初めてのハッカソンを作成して、チームの進捗追跡を始めましょう
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-hacktion-orange text-white rounded hover:bg-opacity-80 font-medium"
          >
            ハッカソンを作成
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => (
            <div
              key={hackathon.id}
              onClick={() => handleSelectHackathon(hackathon)}
              className="bg-hacktion-gray rounded-lg p-6 border border-gray-700 hover:border-hacktion-orange cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white">{hackathon.name}</h3>
                <button
                  onClick={(e) => handleDeleteHackathon(hackathon.id, e)}
                  className="text-red-400 hover:text-red-300 text-sm"
                  title="削除"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {hackathon.description || 'No description'}
              </p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>期間:</span>
                  <span>
                    {new Date(hackathon.startDate).toLocaleDateString('ja-JP')} - {new Date(hackathon.endDate).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>チーム数:</span>
                  <span>{hackathon.teams.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>リポジトリ数:</span>
                  <span>{hackathon.repositories.length}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-600">
                <span className="text-xs text-gray-500">
                  最終更新: {new Date(hackathon.updatedAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}