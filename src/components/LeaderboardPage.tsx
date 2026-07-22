// 排行榜页面

import { useState, useEffect } from 'react';
import { VCTCard, VCTCardHeader, VCTCardContent, VCTButton, Badge } from '@/components/ui';
import { leaderboardApi, LeaderboardEntry } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await leaderboardApi.getTop();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-4">
      <VCTCard>
        <VCTCardHeader
          title="VCT 积分榜"
          subtitle="全球战队经理排名"
          icon="🏆"
          action={
            <VCTButton onClick={loadLeaderboard} variant="ghost" size="sm" icon="↻">
              刷新
            </VCTButton>
          }
        />

        <VCTCardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">加载中...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              {error}
              <VCTButton onClick={loadLeaderboard} variant="secondary" size="sm" className="ml-2">
                重试
              </VCTButton>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              暂无数据
              <p className="text-sm mt-2">成为第一个上榜的战队经理！</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => {
                const isCurrentUser = user && entry.id === user.id;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 border transition-colors ${
                      isCurrentUser
                        ? 'bg-red-900/20 border-red-500/50'
                        : 'bg-gray-900/50 border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`font-oswald text-2xl font-bold w-12 ${getRankColor(entry.rank)}`}>
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {entry.nickname || entry.username}
                          </span>
                          {isCurrentUser && <Badge variant="primary">YOU</Badge>}
                        </div>
                        <p className="text-xs text-gray-500">@{entry.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-oswald text-2xl font-bold text-red-400">
                        {entry.vctPoints}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">VCT积分</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </VCTCardContent>
      </VCTCard>
    </div>
  );
}
