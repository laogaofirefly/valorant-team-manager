import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useTrainingActions, useFinanceActions } from '@/hooks';
import { formatCurrency } from '@/utils/helpers';
import { VCTCard } from '@/components/ui/VCTCard';
import { VCTButton } from '@/components/ui/VCTButton';
import { Badge } from '@/components/ui/Badge';
import { CircularProgress } from '@/components/ui/AttributeBar';
import type { Facility } from '@/types';

const facilityIcons: Record<string, { icon: string; color: string }> = {
  'training-room': { icon: '◆', color: '#FF4655' },
  'gaming-house': { icon: '■', color: '#00E5C4' },
  'analytics-center': { icon: '▲', color: '#00D9FF' },
  'sponsor-room': { icon: '●', color: '#FFD700' },
  'team-building': { icon: '★', color: '#6C5CE7' },
};

export const FacilityPage = () => {
  const { playerTeam, addSponsor } = useGameStore();
  const { getUpgradeCost } = useTrainingActions();
  const { canAddSponsor } = useFinanceActions();
  
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorName, setSponsorName] = useState('');

  const handleUpgrade = (facility: Facility) => {
    const cost = getUpgradeCost(facility.id);
    if (playerTeam.budget < cost || facility.level >= facility.maxLevel) return;
    useGameStore.getState().upgradeFacility(facility.id);
    setSelectedFacility(null);
  };

  const handleAddSponsor = () => {
    if (sponsorName.trim()) {
      addSponsor(sponsorName.trim());
      setSponsorName('');
      setShowSponsorModal(false);
    }
  };

  const getEffectText = (facility: Facility): string[] => {
    const effects: string[] = [];
    const e = facility.effects;
    if (e.trainingBonus) effects.push(`训练加成 +${Math.floor(e.trainingBonus * 100)}%`);
    if (e.moraleBonus) effects.push(`士气恢复 +${e.moraleBonus * facility.level}`);
    if (e.fitnessBonus) effects.push(`状态恢复 +${e.fitnessBonus * facility.level}`);
    if (e.scoutingBonus) effects.push(`球探加成 +${Math.floor(e.scoutingBonus * facility.level * 100)}%`);
    if (e.revenueBonus) effects.push(`收入加成 +${Math.floor(e.revenueBonus * facility.level * 100)}%`);
    if (e.chemistryBonus) effects.push(`默契加成 +${Math.floor(e.chemistryBonus * facility.level * 100)}%`);
    return effects;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <VCTCard variant="highlight" className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning">FACILITY HQ</Badge>
              <span className="text-xs text-gray-500 font-tactical tracking-wider">INFRASTRUCTURE</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white tracking-wider">战队设施</h1>
            <p className="text-gray-400 mt-1 font-tactical">升级设施解锁更多战队加成</p>
          </div>
          <div className="flex items-center gap-3">
            <VCTCard className="px-4 py-2">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">BUDGET</p>
              <p className="font-display text-xl font-bold text-valorant-gold">{formatCurrency(playerTeam.budget)}</p>
            </VCTCard>
            <VCTCard className="px-4 py-2">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">SPONSORS</p>
              <CircularProgress value={playerTeam.sponsors.length} maxValue={5} size={40} color="#FFD700" />
            </VCTCard>
          </div>
        </div>
      </VCTCard>

      {/* 设施卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playerTeam.facilities.map(facility => {
          const upgradeCost = getUpgradeCost(facility.id);
          const isMaxLevel = facility.level >= facility.maxLevel;
          const canAfford = playerTeam.budget >= upgradeCost;
          const iconInfo = facilityIcons[facility.id] || { icon: '◇', color: '#C0C0C0' };

          return (
            <VCTCard key={facility.id} className="overflow-hidden">
              {/* 顶部色条 */}
              <div className="h-1" style={{ background: iconInfo.color }}></div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 clip-corner-sm flex items-center justify-center font-display font-bold text-2xl"
                      style={{ background: `${iconInfo.color}20`, color: iconInfo.color, border: `1px solid ${iconInfo.color}40` }}
                    >
                      {iconInfo.icon}
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-white tracking-wide">{facility.chineseName}</h3>
                      <p className="text-[10px] text-gray-500 font-tactical">{facility.description}</p>
                    </div>
                  </div>
                  <CircularProgress
                    value={facility.level}
                    maxValue={facility.maxLevel}
                    size={50}
                    color={iconInfo.color}
                  />
                </div>

                {/* 设施效果 */}
                <div className="mb-3">
                  <p className="text-[10px] text-gray-500 font-tactical tracking-wider mb-1">CURRENT EFFECTS</p>
                  <div className="space-y-1">
                    {getEffectText(facility).map((effect, idx) => (
                      <div key={idx} className="text-xs text-valorant-teal bg-valorant-teal/10 clip-corner-sm px-2 py-1 border-l-2 border-valorant-teal/50">
                        ✓ {effect}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 升级按钮 */}
                {isMaxLevel ? (
                  <div className="w-full py-2 bg-valorant-gold/10 border border-valorant-gold/40 clip-corner-sm text-valorant-gold text-center text-xs font-display font-bold tracking-wider">
                    ★ MAX LEVEL
                  </div>
                ) : (
                  <VCTButton
                    variant="primary"
                    size="sm"
                    fullWidth
                    disabled={!canAfford}
                    onClick={() => setSelectedFacility(facility)}
                  >
                    升级至 Lv.{facility.level + 1} · {formatCurrency(upgradeCost)}
                  </VCTButton>
                )}
              </div>
            </VCTCard>
          );
        })}
      </div>

      {/* 赞助商管理 */}
      <VCTCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="vct-heading font-display text-base text-white">赞助商管理</h3>
          <VCTButton
            variant="primary"
            size="sm"
            onClick={() => setShowSponsorModal(true)}
            disabled={!canAddSponsor()}
          >
            + 签约新赞助商
          </VCTButton>
        </div>

        {playerTeam.sponsors.length === 0 ? (
          <p className="text-gray-500 text-xs font-tactical text-center py-6">暂无赞助商 · 签约可获得稳定收入</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {playerTeam.sponsors.map((sponsor, idx) => (
              <VCTCard key={idx} className="p-2 flex items-center gap-2 border-l-2 border-valorant-gold/50">
                <div className="w-8 h-8 bg-valorant-gold/20 flex items-center justify-center text-valorant-gold font-display font-bold clip-corner-sm">
                  {sponsor.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-display font-semibold truncate">{sponsor}</p>
                  <p className="text-[10px] text-valorant-teal font-tactical">+ $50K 活跃</p>
                </div>
              </VCTCard>
            ))}
          </div>
        )}
      </VCTCard>

      {/* 升级确认弹窗 */}
      {selectedFacility && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <VCTCard className="max-w-md w-full">
            <div className="p-5 border-b border-white/5 bg-valorant-cyan/10">
              <p className="text-[10px] text-valorant-cyan font-tactical tracking-wider">UPGRADE CONFIRMATION</p>
              <h3 className="font-display text-xl font-bold text-white">确认升级</h3>
            </div>
            <div className="p-5">
              <p className="text-gray-400 mb-4 text-sm">
                将 <span className="text-white font-display font-semibold">{selectedFacility.chineseName}</span> 从 Lv.{selectedFacility.level} 升级到 Lv.{selectedFacility.level + 1}
              </p>

              <VCTCard className="p-3 mb-4">
                <p className="text-[10px] text-gray-500 font-tactical tracking-wider mb-2">升级后将获得：</p>
                <ul className="text-xs space-y-1.5">
                  {selectedFacility.effects.trainingBonus && (
                    <li className="text-valorant-teal">▸ 训练加成 +{Math.floor(selectedFacility.effects.trainingBonus * 100)}%</li>
                  )}
                  {selectedFacility.effects.moraleBonus && (
                    <li className="text-valorant-teal">▸ 士气恢复 +{selectedFacility.effects.moraleBonus}</li>
                  )}
                  {selectedFacility.effects.fitnessBonus && (
                    <li className="text-valorant-teal">▸ 状态恢复 +{selectedFacility.effects.fitnessBonus}</li>
                  )}
                </ul>
              </VCTCard>

              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="text-gray-500 font-tactical tracking-wider">COST</span>
                <span className="text-valorant-gold font-display font-bold">{formatCurrency(getUpgradeCost(selectedFacility.id))}</span>
              </div>

              <div className="flex gap-2">
                <VCTButton variant="secondary" size="sm" fullWidth onClick={() => setSelectedFacility(null)}>
                  取消
                </VCTButton>
                <VCTButton variant="primary" size="sm" fullWidth onClick={() => handleUpgrade(selectedFacility)}>
                  确认升级
                </VCTButton>
              </div>
            </div>
          </VCTCard>
        </div>
      )}

      {/* 赞助商签约弹窗 */}
      {showSponsorModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <VCTCard className="max-w-md w-full">
            <div className="p-5 border-b border-white/5 bg-valorant-gold/10">
              <p className="text-[10px] text-valorant-gold font-tactical tracking-wider">SPONSOR DEAL</p>
              <h3 className="font-display text-xl font-bold text-white">签约新赞助商</h3>
            </div>
            <div className="p-5">
              <p className="text-gray-400 text-xs mb-4 font-tactical">
                输入赞助商名称（如：红牛、雷蛇、罗技等）
                <br />
                基础奖金 <span className="text-valorant-gold font-display">$50,000</span>
              </p>

              <input
                type="text"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                placeholder="请输入赞助商名称"
                className="w-full bg-valorant-dark text-white px-3 py-2 clip-corner-sm border border-white/10 mb-4 font-tactical"
                autoFocus
              />

              <div className="flex gap-2">
                <VCTButton variant="secondary" size="sm" fullWidth onClick={() => setShowSponsorModal(false)}>
                  取消
                </VCTButton>
                <VCTButton
                  variant="primary"
                  size="sm"
                  fullWidth
                  disabled={!sponsorName.trim()}
                  onClick={handleAddSponsor}
                >
                  确认签约
                </VCTButton>
              </div>
            </div>
          </VCTCard>
        </div>
      )}

      {/* 设施说明 */}
      <VCTCard className="p-4">
        <h3 className="vct-heading font-display text-base text-white mb-3">设施系统说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-valorant-cyan">▸</span>
              <p className="text-gray-400">升级设施可永久获得各类加成</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-valorant-teal">▸</span>
              <p className="text-gray-400">设施等级越高，加成效果越显著</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-valorant-purple">▸</span>
              <p className="text-gray-400">训练室：提升训练效率</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-valorant-red">▸</span>
              <p className="text-gray-400">战队基地：恢复士气和状态</p>
            </div>
          </div>
        </div>
      </VCTCard>
    </div>
  );
};