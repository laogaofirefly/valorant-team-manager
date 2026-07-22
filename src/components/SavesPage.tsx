// 存档管理页面

import { useState, useEffect } from 'react';
import { VCTCard, VCTCardHeader, VCTCardContent, VCTButton } from '@/components/ui';
import { saveApi, SaveSlot, ApiError } from '@/services/api';
import { useGameStore } from '@/store/gameStore';

export function SavesPage() {
  const { playerTeam, currentWeek, currentSeason, ...rest } = useGameStore();
  const [saves, setSaves] = useState<SaveSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveName, setSaveName] = useState('');

  const loadSaves = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await saveApi.getAll();
      setSaves(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSaves();
  }, []);

  const handleSave = async (slot: number) => {
    if (!saveName.trim()) {
      setError('请输入存档名称');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const gameState = { playerTeam, currentWeek, currentSeason, ...rest };
      await saveApi.save({ slot, name: saveName, gameState });
      setSaveName('');
      await loadSaves();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async (slot: number) => {
    if (!confirm('确定要加载此存档吗？当前进度将丢失')) return;
    setIsLoading(true);
    setError(null);
    try {
      const save = await saveApi.get(slot);
      // TODO: 整合加载逻辑
      alert(`已加载存档: ${save.name}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slot: number) => {
    if (!confirm('确定要删除此存档吗？')) return;
    setIsLoading(true);
    setError(null);
    try {
      await saveApi.delete(slot);
      await loadSaves();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '删除失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 显示5个存档槽位
  const slots = [1, 2, 3, 4, 5];
  const saveMap = new Map(saves.map(s => [s.slot, s]));

  return (
    <div className="space-y-4">
      <VCTCard>
        <VCTCardHeader
          title="游戏存档"
          subtitle="云端保存您的游戏进度"
          icon="💾"
          action={
            <VCTButton onClick={loadSaves} variant="ghost" size="sm" icon="↻">
              刷新
            </VCTButton>
          }
        />
        <VCTCardContent>
          <div className="mb-4">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="存档名称"
              maxLength={50}
              className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-700 px-3 py-2 text-red-300 text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-gray-400">加载中...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {slots.map((slot) => {
                const save = saveMap.get(slot);
                return (
                  <div
                    key={slot}
                    className="p-4 bg-gray-900/50 border border-gray-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-rajdhani font-bold text-white uppercase tracking-wider">
                          槽位 {slot}
                        </h4>
                        {save ? (
                          <>
                            <p className="text-sm text-gray-300 mt-1">{save.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(save.updatedAt).toLocaleString('zh-CN')}
                            </p>
                            {save.isAutoSave && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/50">自动</span>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-500 mt-1">空</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {save ? (
                        <>
                          <VCTButton
                            onClick={() => handleLoad(slot)}
                            variant="primary"
                            size="sm"
                            icon="↧"
                          >
                            加载
                          </VCTButton>
                          <VCTButton
                            onClick={() => handleSave(slot)}
                            variant="secondary"
                            size="sm"
                            icon="↑"
                          >
                            覆盖
                          </VCTButton>
                          <VCTButton
                            onClick={() => handleDelete(slot)}
                            variant="danger"
                            size="sm"
                            icon="×"
                          >
                            删除
                          </VCTButton>
                        </>
                      ) : (
                        <VCTButton
                          onClick={() => handleSave(slot)}
                          disabled={!saveName.trim()}
                          variant="primary"
                          size="sm"
                          fullWidth
                          icon="+"
                        >
                          保存
                        </VCTButton>
                      )}
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
