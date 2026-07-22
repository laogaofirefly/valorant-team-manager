// 联机对战页面

import { useState, useEffect } from 'react';
import { VCTCard, VCTCardHeader, VCTCardContent, VCTButton, Badge } from '@/components/ui';
import { matchApi, Match, ApiError } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';

export function MultiplayerPage() {
  const { user } = useAuthStore();
  const { playerTeam } = useGameStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [opponentUsername, setOpponentUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'ready' | 'finished'>('all');

  const loadMatches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await matchApi.getAll(statusFilter === 'all' ? undefined : statusFilter);
      setMatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [statusFilter]);

  const handleCreateMatch = async () => {
    if (!opponentUsername.trim()) {
      setError('请输入对手用户名');
      return;
    }
    if (playerTeam.players.length === 0) {
      setError('您的战队没有选手，请先签约');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await matchApi.create(opponentUsername, playerTeam);
      setOpponentUsername('');
      await loadMatches();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '创建失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (match: Match) => {
    if (playerTeam.players.length === 0) {
      setError('您的战队没有选手，请先签约');
      return;
    }
    setIsLoading(true);
    try {
      await matchApi.accept(match.matchId, playerTeam);
      await loadMatches();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '接受失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async (match: Match) => {
    setIsLoading(true);
    try {
      const result = await matchApi.start(match.matchId);
      if (result.result) {
        const isWin = result.result.winnerId === user?.id;
        alert(isWin ? '🎉 胜利！' : '😢 失败');
      }
      await loadMatches();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '开始失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForfeit = async (match: Match) => {
    if (!confirm('确定要认输吗？')) return;
    setIsLoading(true);
    try {
      await matchApi.forfeit(match.matchId);
      await loadMatches();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Match['status']) => {
    const map = {
      waiting: { variant: 'warning' as const, label: '等待中' },
      ready: { variant: 'info' as const, label: '已就绪' },
      playing: { variant: 'primary' as const, label: '进行中' },
      finished: { variant: 'default' as const, label: '已结束' },
    };
    return map[status];
  };

  return (
    <div className="space-y-4">
      {/* 创建对战 */}
      <VCTCard>
        <VCTCardHeader title="发起对战" subtitle="向其他战队经理挑战" icon="⚔" />
        <VCTCardContent>
          <div className="flex gap-3">
            <input
              type="text"
              value={opponentUsername}
              onChange={(e) => setOpponentUsername(e.target.value)}
              placeholder="输入对手用户名"
              className="flex-1 bg-gray-900 border border-gray-700 px-4 py-2 text-white focus:border-red-500 focus:outline-none"
            />
            <VCTButton
              onClick={handleCreateMatch}
              disabled={isLoading || playerTeam.players.length === 0}
              variant="primary"
              icon="→"
            >
              发起挑战
            </VCTButton>
          </div>
          {playerTeam.players.length === 0 && (
            <p className="text-sm text-yellow-500 mt-2">⚠ 请先在战队页签约选手</p>
          )}
          {error && (
            <div className="mt-3 bg-red-900/30 border border-red-700 px-3 py-2 text-red-300 text-sm">
              {error}
            </div>
          )}
        </VCTCardContent>
      </VCTCard>

      {/* 状态筛选 */}
      <div className="flex gap-2">
        {(['all', 'waiting', 'ready', 'finished'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 font-rajdhani uppercase tracking-wider text-sm border transition-colors ${
              statusFilter === status
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'
            }`}
          >
            {status === 'all' ? '全部' :
             status === 'waiting' ? '等待' :
             status === 'ready' ? '就绪' : '结束'}
          </button>
        ))}
      </div>

      {/* 对战列表 */}
      <VCTCard>
        <VCTCardHeader
          title="对战记录"
          subtitle={`共 ${matches.length} 场对战`}
          icon="📜"
          action={
            <VCTButton onClick={loadMatches} variant="ghost" size="sm" icon="↻">
              刷新
            </VCTButton>
          }
        />
        <VCTCardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">加载中...</div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8 text-gray-400">暂无对战</div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => {
                const status = getStatusBadge(match.status);
                const isPlayer1 = user?.id === match.player1Id;
                const opponent = isPlayer1 ? match.player2Name : match.player1Name;

                return (
                  <div
                    key={match.matchId}
                    className="p-4 bg-gray-900/50 border border-gray-800 hover:border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold">
                            {match.player1Name}
                          </span>
                          <span className="text-gray-500">vs</span>
                          <span className="text-white font-bold">
                            {match.player2Name}
                          </span>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          对手: {opponent} · {new Date(match.createdAt).toLocaleString('zh-CN')}
                        </p>
                        {match.result && (
                          <p className="text-sm mt-1">
                            <span className="text-gray-400">比分: </span>
                            <span className="text-white font-bold">
                              {match.result.team1Score} - {match.result.team2Score}
                            </span>
                            {match.result.winnerId === user?.id && (
                              <span className="ml-2 text-green-400">🎉 胜利</span>
                            )}
                            {match.result.winnerId !== user?.id && match.status === 'finished' && (
                              <span className="ml-2 text-red-400">失败</span>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {/* 玩家2接受对战 */}
                        {match.status === 'waiting' && !isPlayer1 && (
                          <VCTButton
                            onClick={() => handleAccept(match)}
                            variant="primary"
                            size="sm"
                          >
                            接受
                          </VCTButton>
                        )}
                        {/* 玩家1等待 */}
                        {match.status === 'waiting' && isPlayer1 && (
                          <Badge variant="warning">等待对手接受</Badge>
                        )}
                        {/* 双方可以开始 */}
                        {match.status === 'ready' && (
                          <VCTButton
                            onClick={() => handleStart(match)}
                            variant="primary"
                            size="sm"
                            icon="▶"
                          >
                            开始
                          </VCTButton>
                        )}
                        {/* 进行中的对战可以认输 */}
                        {(match.status === 'waiting' || match.status === 'ready') && (
                          <VCTButton
                            onClick={() => handleForfeit(match)}
                            variant="danger"
                            size="sm"
                          >
                            认输
                          </VCTButton>
                        )}
                      </div>
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
