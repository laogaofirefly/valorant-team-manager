import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useTrainingActions, useSeasonActions } from '@/hooks';
import { formatCurrency } from '@/utils/helpers';
import { roleNames } from '@/data/agents';
import { AttributePanel, CircularProgress } from '@/components/ui/AttributeBar';
import { VCTCard } from '@/components/ui/VCTCard';
import { VCTButton } from '@/components/ui/VCTButton';
import { Badge } from '@/components/ui/Badge';
import type { PlayerAttributes } from '@/data/players';
import { MOOD_LABELS, type PlayerMood } from '@/types';

const attributeNames: Record<keyof PlayerAttributes, string> = {
  aim: '枪法',
  gameSense: '意识',
  teamwork: '配合',
  utility: '道具',
  clutch: '残局',
  entry: '突破',
  support: '支援',
  composure: '抗压',
  leadership: '领导',
  consistency: '稳定',
};

const attributeIcons: Record<keyof PlayerAttributes, string> = {
  aim: '🎯',
  gameSense: '🧠',
  teamwork: '🤝',
  utility: '💨',
  clutch: '⚔',
  entry: '⚡',
  support: '🛡',
  composure: '🧊',
  leadership: '👑',
  consistency: '📊',
};

export const TrainingPage = () => {
  const { playerTeam, advanceWeek, calculateChemistry, restPlayer } = useGameStore();
  const { trainPlayer, getTrainingCost } = useTrainingActions();
  const { currentWeek, getPhaseLabel } = useSeasonActions();

  const [trainingPlayer, setTrainingPlayer] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<keyof PlayerAttributes | null>(null);
  const [restingPlayer, setRestingPlayer] = useState<string | null>(null);

  const budget = playerTeam.budget;
  const chemistry = calculateChemistry();
  const trainingRoom = playerTeam.facilities.find(f => f.id === 'training-room');
  const trainingBonus = trainingRoom ? trainingRoom.effects.trainingBonus || 0 : 0;
  const trainingGain = 1 + Math.floor(trainingBonus * 2);
  const trainingCost = getTrainingCost();

  const handleTrain = (playerId: string, attribute?: keyof PlayerAttributes) => {
    setTrainingPlayer(playerId);
    setTimeout(() => {
      trainPlayer(playerId, attribute);
      setTrainingPlayer(null);
      setSelectedAttribute(null);
    }, 500);
  };

  const handleRest = (playerId: string) => {
    setRestingPlayer(playerId);
    setTimeout(() => {
      restPlayer(playerId);
      setRestingPlayer(null);
    }, 500);
  };

  const getMoodColor = (mood: PlayerMood): string => {
    switch (mood) {
      case 'excited': return 'text-valorant-gold';
      case 'calm': return 'text-valorant-teal';
      case 'anxious': return 'text-yellow-400';
      case 'tired': return 'text-valorant-red';
    }
  };

  const getMoodBadgeVariant = (mood: PlayerMood): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (mood) {
      case 'excited': return 'warning';
      case 'calm': return 'success';
      case 'anxious': return 'danger';
      case 'tired': return 'danger';
    }
  };

  const getTrainingProgress = (playerId: string) => {
    const player = playerTeam.players.find(p => p.id === playerId);
    if (!player) return 0;
    return ((player.rating - 60) / (player.potential - 60)) * 100;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <VCTCard variant="highlight" className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary">TRAINING CENTER</Badge>
              <span className="text-xs text-gray-500 font-tactical tracking-wider">SKILL DEVELOPMENT</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white tracking-wider">训练中心</h1>
            <p className="text-gray-400 mt-1 font-tactical">专项训练 · 提升10项核心能力</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <VCTCard className="px-4 py-2">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">BUDGET</p>
              <p className="font-display text-xl font-bold text-valorant-gold">{formatCurrency(budget)}</p>
            </VCTCard>
            <VCTCard className="px-4 py-2">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">WEEK · PHASE</p>
              <p className="font-display text-sm font-bold text-valorant-cyan">{currentWeek} · {getPhaseLabel}</p>
            </VCTCard>
            <VCTCard className="px-4 py-2">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">CHEMISTRY</p>
              <CircularProgress value={chemistry} size={40} color="#6C5CE7" />
            </VCTCard>
          </div>
        </div>
      </VCTCard>

      {/* 推进周 */}
      <VCTCard variant="highlight" className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-display text-base font-bold text-white mb-0.5">推进到下一周</p>
            <p className="text-gray-400 text-xs font-tactical">选手状态恢复 · 默契提升 · 新赛事解锁</p>
          </div>
          <VCTButton variant="primary" onClick={advanceWeek}>
            ▸ 推进至第 {currentWeek + 1} 周
          </VCTButton>
        </div>
      </VCTCard>

      {/* 训练室加成 */}
      {trainingBonus > 0 && (
        <VCTCard className="p-3 flex items-center gap-3">
          <span className="text-valorant-teal font-display font-bold text-lg">⚡</span>
          <div>
            <p className="text-valorant-teal font-display font-semibold text-sm">训练室 Lv.{trainingRoom?.level} 已激活</p>
            <p className="text-gray-400 text-xs font-tactical">每次训练额外提升 +{trainingGain - 1} 点属性</p>
          </div>
        </VCTCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 选手训练区 */}
        <div className="lg:col-span-2">
          <h2 className="vct-heading font-display text-lg text-white mb-4">选手训练</h2>
          {playerTeam.players.length === 0 ? (
            <VCTCard className="p-8 text-center">
              <p className="text-gray-400 font-tactical tracking-wider">NO PLAYERS</p>
              <p className="text-gray-500 text-xs mt-2 font-tactical">前往转会市场签约选手</p>
            </VCTCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playerTeam.players.map(player => (
                <VCTCard
                  key={player.id}
                  className={`p-4 ${trainingPlayer === player.id ? 'animate-pulse border-valorant-red' : ''} ${
                    selectedPlayerId === player.id ? 'border-valorant-cyan selected-glow' : ''
                  }`}
                >
                  {/* 选手头部 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-display text-base font-bold text-white truncate">{player.chineseName}</span>
                        <Badge variant="info" size="sm">{roleNames[player.position]}</Badge>
                      </div>
                      <p className="text-[10px] text-gray-500 font-tactical">{player.realName} · {player.nationality}</p>
                    </div>
                    <CircularProgress value={player.rating} size={50} color="#00D9FF" label={`POT ${player.potential}`} />
                  </div>

                  {/* 训练进度 */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] mb-1 font-tactical tracking-wider">
                      <span className="text-gray-500">TRAINING PROGRESS</span>
                      <span className="text-gray-400">{player.rating} / {player.potential}</span>
                    </div>
                    <div className="tactical-bar">
                      <div
                        className="tactical-bar-fill"
                        style={{ width: `${getTrainingProgress(player.id)}%`, background: 'linear-gradient(90deg, #00E5C4, #FF4655)' }}
                      />
                    </div>
                  </div>

                  {/* 关键属性 */}
                  <div className="mb-3">
                    <AttributePanel
                      attributes={{
                        aim: player.attributes.aim,
                        gameSense: player.attributes.gameSense,
                        clutch: player.attributes.clutch,
                        entry: player.attributes.entry,
                        utility: player.attributes.utility,
                      }}
                      labels={attributeNames}
                      color="red"
                    />
                  </div>

                  {/* 士气状态 */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-gray-500 font-tactical tracking-wider">士气</span>
                        <span className="text-white font-display font-semibold">{player.morale}%</span>
                      </div>
                      <div className="tactical-bar">
                        <div className="tactical-bar-fill" style={{ width: `${player.morale}%`, background: 'linear-gradient(90deg, #00E5C4, #00D9FF)' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-gray-500 font-tactical tracking-wider">状态</span>
                        <span className="text-white font-display font-semibold">{player.fitness}%</span>
                      </div>
                      <div className="tactical-bar">
                        <div className="tactical-bar-fill" style={{ width: `${player.fitness}%`, background: 'linear-gradient(90deg, #FFD700, #FF6B7A)' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* 心理与状态：心情 + 手感火热 */}
                  <div className="flex items-center justify-between gap-2 mb-3 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 font-tactical tracking-wider">心情</span>
                      <Badge variant={getMoodBadgeVariant(player.mood || 'calm')} size="sm">
                        {MOOD_LABELS[player.mood || 'calm']}
                      </Badge>
                    </div>
                    {(player.hotStreak || 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-valorant-gold">🔥</span>
                        <span className={`${getMoodColor('excited')} font-display font-bold`}>
                          手感火热 x{player.hotStreak}
                        </span>
                      </div>
                    )}
                    {(player.weeksWithTeam || 0) > 0 && (
                      <span className="text-gray-600 font-tactical">
                        效力 {player.weeksWithTeam}周
                      </span>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <VCTButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      disabled={budget < trainingCost || player.rating >= player.potential || player.fitness < 50}
                      onClick={() => handleTrain(player.id)}
                    >
                      {player.rating >= player.potential ? '已满级' : player.fitness < 50 ? '状态不足' : budget < trainingCost ? '资金不足' : `综合+1 ($${trainingCost/1000}K)`}
                    </VCTButton>
                    <VCTButton
                      variant={selectedPlayerId === player.id ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={() => setSelectedPlayerId(selectedPlayerId === player.id ? null : player.id)}
                    >
                      专项
                    </VCTButton>
                    <VCTButton
                      variant="ghost"
                      size="sm"
                      disabled={budget < 5000 || restingPlayer === player.id}
                      onClick={() => handleRest(player.id)}
                      className={restingPlayer === player.id ? 'animate-pulse' : ''}
                      title="花费$5K安排休息，恢复状态与心情"
                    >
                      {restingPlayer === player.id ? '休息中…' : '休息'}
                    </VCTButton>
                  </div>

                  {/* 专项训练面板 */}
                  {selectedPlayerId === player.id && (
                    <div className="mt-3 bg-valorant-darker/60 clip-corner-sm p-3 space-y-2">
                      <p className="text-[10px] text-gray-500 font-tactical tracking-wider mb-2">选择专项训练属性：</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(Object.keys(attributeNames) as (keyof PlayerAttributes)[]).map(attr => (
                          <button
                            key={attr}
                            onClick={() => setSelectedAttribute(selectedAttribute === attr ? null : attr)}
                            className={`text-left p-2 clip-corner-sm text-xs transition-all border ${
                              selectedAttribute === attr
                                ? 'bg-valorant-purple/30 text-white border-valorant-purple'
                                : 'bg-valorant-dark/60 text-gray-300 border-white/5 hover:border-valorant-purple/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-display font-semibold">{attributeIcons[attr]} {attributeNames[attr]}</span>
                              <span className="text-valorant-cyan font-display font-bold">{player.attributes[attr]}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      {selectedAttribute && (
                        <VCTButton
                          variant="primary"
                          size="sm"
                          fullWidth
                          disabled={budget < trainingCost || player.attributes[selectedAttribute] >= 99 || player.fitness < 50}
                          onClick={() => handleTrain(player.id, selectedAttribute)}
                        >
                          {player.attributes[selectedAttribute] >= 99
                            ? '属性已满'
                            : player.fitness < 50
                            ? '状态不足'
                            : budget < trainingCost
                            ? '资金不足'
                            : `训练 ${attributeNames[selectedAttribute]} +${trainingGain} ($${trainingCost/1000}K)`}
                        </VCTButton>
                      )}
                    </div>
                  )}
                </VCTCard>
              ))}
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-4">
          {/* 团队状态 */}
          <VCTCard className="p-4">
            <h3 className="vct-heading font-display text-base text-white mb-3">团队状态</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 font-tactical tracking-wider">平均评级</span>
                  <span className="text-valorant-cyan font-display font-bold">
                    {playerTeam.players.length > 0
                      ? (playerTeam.players.reduce((sum, p) => sum + p.rating, 0) / playerTeam.players.length).toFixed(1)
                      : '-'}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 font-tactical tracking-wider">平均士气</span>
                  <span className="text-white font-display font-semibold">
                    {playerTeam.players.length > 0
                      ? Math.round(playerTeam.players.reduce((sum, p) => sum + p.morale, 0) / playerTeam.players.length)
                      : 0}
                  </span>
                </div>
                <div className="tactical-bar">
                  <div className="tactical-bar-fill" style={{
                    width: `${playerTeam.players.length > 0 ? Math.round(playerTeam.players.reduce((sum, p) => sum + p.morale, 0) / playerTeam.players.length) : 0}%`,
                    background: 'linear-gradient(90deg, #00E5C4, #00D9FF)'
                  }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 font-tactical tracking-wider">平均状态</span>
                  <span className="text-white font-display font-semibold">
                    {playerTeam.players.length > 0
                      ? Math.round(playerTeam.players.reduce((sum, p) => sum + p.fitness, 0) / playerTeam.players.length)
                      : 0}
                  </span>
                </div>
                <div className="tactical-bar">
                  <div className="tactical-bar-fill" style={{
                    width: `${playerTeam.players.length > 0 ? Math.round(playerTeam.players.reduce((sum, p) => sum + p.fitness, 0) / playerTeam.players.length) : 0}%`,
                    background: 'linear-gradient(90deg, #FFD700, #FF6B7A)'
                  }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 font-tactical tracking-wider">团队默契</span>
                  <span className="text-valorant-purple font-display font-bold">{chemistry.toFixed(0)}</span>
                </div>
                <div className="tactical-bar">
                  <div className="tactical-bar-fill" style={{ width: `${chemistry}%`, background: 'linear-gradient(90deg, #6C5CE7, #FF4655)' }}></div>
                </div>
              </div>
            </div>
          </VCTCard>

          {/* 属性说明 */}
          <VCTCard className="p-4">
            <h3 className="vct-heading font-display text-base text-white mb-3">10项属性</h3>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {(Object.keys(attributeNames) as (keyof PlayerAttributes)[]).map(attr => (
                <div key={attr} className="bg-valorant-dark/40 clip-corner-sm p-2">
                  <p className="text-white font-display font-semibold text-xs">{attributeIcons[attr]} {attributeNames[attr]}</p>
                </div>
              ))}
            </div>
          </VCTCard>

          {/* 训练说明 */}
          <VCTCard className="p-4">
            <h3 className="vct-heading font-display text-base text-white mb-3">训练说明</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-valorant-cyan">▸</span>
                <p className="text-gray-400">综合训练：花费 ${trainingCost.toLocaleString()} 提升评级 +1</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-valorant-purple">▸</span>
                <p className="text-gray-400">专项训练：针对性提升某项属性</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-valorant-teal">▸</span>
                <p className="text-gray-400">训练室升级可增加属性提升幅度</p>
              </div>
            </div>
          </VCTCard>
        </div>
      </div>
    </div>
  );
};