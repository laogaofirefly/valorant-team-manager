import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { tacticTypeNames } from '@/data/tactics';
import { roleNames } from '@/data/agents';
import { VCTCard } from '@/components/ui/VCTCard';
import { VCTButton } from '@/components/ui/VCTButton';
import { Badge } from '@/components/ui/Badge';
import { CircularProgress } from '@/components/ui/AttributeBar';
import type { Tactic, AgentRole } from '@/types';

const tacticTypeStyles: Record<Tactic['type'], { bg: string; text: string; border: string; accent: string }> = {
  Attack: { bg: 'bg-valorant-red/15', text: 'text-valorant-red', border: 'border-valorant-red/40', accent: '#FF4655' },
  Defense: { bg: 'bg-valorant-cyan/15', text: 'text-valorant-cyan', border: 'border-valorant-cyan/40', accent: '#00D9FF' },
  Economy: { bg: 'bg-valorant-gold/15', text: 'text-valorant-gold', border: 'border-valorant-gold/40', accent: '#FFD700' },
  Aggressive: { bg: 'bg-valorant-purple/15', text: 'text-valorant-purple', border: 'border-valorant-purple/40', accent: '#6C5CE7' },
  Passive: { bg: 'bg-valorant-teal/15', text: 'text-valorant-teal', border: 'border-valorant-teal/40', accent: '#00E5C4' },
};

export const TacticsPage = () => {
  const { availableTactics, playerTeam, setTactic, calculateChemistry, calculateTeamStrength } = useGameStore();
  const [filterType, setFilterType] = useState<string>('all');

  const currentTactic = playerTeam.selectedTactic;
  const chemistry = calculateChemistry();
  const teamStrength = calculateTeamStrength();
  const teamPositions = playerTeam.players.map(p => p.position);

  const filteredTactics = useMemo(() => 
    filterType === 'all' ? availableTactics : availableTactics.filter(t => t.type === filterType),
    [availableTactics, filterType]
  );

  const calculateTacticMatch = (tactic: Tactic): number => {
    if (playerTeam.players.length === 0) return 0;
    const matchedPositions = tactic.bestPositions.filter(pos => teamPositions.includes(pos as AgentRole)).length;
    const positionMatch = (matchedPositions / Math.min(tactic.bestPositions.length, playerTeam.players.length)) * 60;
    const riskPenalty = (5 - tactic.risk) * 8;
    return Math.max(0, Math.min(100, Math.round(positionMatch + riskPenalty)));
  };

  const calculateTacticBonus = (tactic: Tactic): number => {
    let bonus = 0;
    tactic.bestPositions.forEach((pos: string) => {
      if (teamPositions.includes(pos as AgentRole)) bonus += 2;
    });
    bonus += tactic.successRateModifier * 20;
    return Math.round(bonus);
  };

  const getRiskColor = (risk: number): string => {
    if (risk <= 1) return 'text-valorant-teal';
    if (risk <= 2) return 'text-valorant-cyan';
    if (risk <= 3) return 'text-valorant-gold';
    return 'text-valorant-red';
  };

  const getRiskStars = (risk: number): string => '■'.repeat(risk) + '□'.repeat(5 - risk);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <VCTCard variant="highlight" className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary">TACTICAL HQ</Badge>
              <span className="text-xs text-gray-500 font-tactical tracking-wider">STRATEGY DEPLOYMENT</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white tracking-wider">战术中心</h1>
            <p className="text-gray-400 mt-1 font-tactical">选择适合阵容的战术 · 影响比赛胜率</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <VCTCard className="px-4 py-2">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">CURRENT</p>
              <p className="font-display text-sm font-bold text-valorant-cyan">{currentTactic.chineseName}</p>
            </VCTCard>
            <VCTCard className="px-4 py-2">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">CHEMISTRY</p>
              <CircularProgress value={chemistry} size={40} color="#6C5CE7" />
            </VCTCard>
            <VCTCard className="px-4 py-2">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">STRENGTH</p>
              <p className="font-display text-xl font-bold text-valorant-gold">{teamStrength.toFixed(1)}</p>
            </VCTCard>
          </div>
        </div>
      </VCTCard>

      {/* 当前阵容 */}
      <VCTCard className="p-4">
        <h3 className="vct-heading font-display text-base text-white mb-3">当前阵容</h3>
        {playerTeam.players.length === 0 ? (
          <p className="text-gray-500 text-xs font-tactical">暂无选手，请先签约选手</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {playerTeam.players.map(player => (
              <Badge key={player.id} variant="default">
                {player.chineseName} · {roleNames[player.position]}
              </Badge>
            ))}
          </div>
        )}
      </VCTCard>

      {/* 战术筛选 */}
      <VCTCard className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-gray-500 font-tactical tracking-wider mr-1">TYPE</span>
          <VCTButton
            variant={filterType === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            全部
          </VCTButton>
          {(Object.keys(tacticTypeNames) as Tactic['type'][]).map(type => (
            <VCTButton
              key={type}
              variant={filterType === type ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType(type)}
            >
              {tacticTypeNames[type]}
            </VCTButton>
          ))}
        </div>
      </VCTCard>

      {/* 战术列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTactics.map(tactic => {
          const matchRate = calculateTacticMatch(tactic);
          const bonus = calculateTacticBonus(tactic);
          const isActive = currentTactic.id === tactic.id;
          const typeStyle = tacticTypeStyles[tactic.type];

          return (
            <VCTCard
              key={tactic.id}
              className={`overflow-hidden ${isActive ? 'border-valorant-red selected-glow' : ''}`}
            >
              {/* 顶部色条 */}
              <div className="h-1" style={{ background: typeStyle.accent }}></div>

              <div className="p-4">
                {/* 头部 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-lg font-bold text-white tracking-wide truncate">{tactic.chineseName}</h4>
                    <Badge variant="default" size="sm">{tacticTypeNames[tactic.type]}</Badge>
                  </div>
                  {isActive && <Badge variant="primary" size="sm">ACTIVE</Badge>}
                </div>

                <p className="text-xs text-gray-400 mb-3 min-h-[32px]">{tactic.description}</p>

                {/* 风险等级 */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-gray-500 font-tactical tracking-wider">RISK LEVEL</span>
                  <span className={`font-display font-bold ${getRiskColor(tactic.risk)}`}>{getRiskStars(tactic.risk)}</span>
                </div>

                {/* 适用位置 */}
                <div className="mb-3">
                  <p className="text-[10px] text-gray-500 font-tactical tracking-wider mb-1">适用位置</p>
                  <div className="flex flex-wrap gap-1">
                    {tactic.bestPositions.map(pos => {
                      const matched = teamPositions.includes(pos as AgentRole);
                      return (
                        <Badge
                          key={pos}
                          variant={matched ? 'success' : 'default'}
                          size="sm"
                        >
                          {roleNames[pos as keyof typeof roleNames]}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* 匹配度与加成 */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <VCTCard className="p-2">
                    <p className="text-[10px] text-gray-500 font-tactical tracking-wider">MATCH</p>
                    <CircularProgress
                      value={matchRate}
                      size={50}
                      color={matchRate >= 70 ? '#00E5C4' : matchRate >= 40 ? '#FFD700' : '#FF4655'}
                    />
                  </VCTCard>
                  <VCTCard className="p-2">
                    <p className="text-[10px] text-gray-500 font-tactical tracking-wider">BONUS</p>
                    <p className={`font-display font-bold text-lg ${bonus > 0 ? 'text-valorant-teal' : 'text-gray-300'}`}>
                      {bonus > 0 ? '+' : ''}{bonus}
                    </p>
                    <p className="text-[10px] text-gray-500 font-tactical mt-1">实力加成</p>
                  </VCTCard>
                </div>

                <VCTButton
                  variant={isActive ? 'secondary' : 'primary'}
                  size="sm"
                  fullWidth
                  disabled={isActive}
                  onClick={() => setTactic(tactic)}
                >
                  {isActive ? '✓ 当前使用' : '采用此战术'}
                </VCTButton>
              </div>
            </VCTCard>
          );
        })}
      </div>

      {/* 战术说明 */}
      <VCTCard className="p-4">
        <h3 className="vct-heading font-display text-base text-white mb-3">战术系统说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-valorant-teal">▸</span>
              <p className="text-gray-400">战术会影响比赛时的属性加成</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-valorant-cyan">▸</span>
              <p className="text-gray-400">阵容匹配度越高，战术效果越好</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-valorant-purple">▸</span>
              <p className="text-gray-400">默契度越高战术执行越完美</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-valorant-red">▸</span>
              <p className="text-gray-400">不同位置选手适配不同战术</p>
            </div>
          </div>
        </div>
      </VCTCard>
    </div>
  );
};