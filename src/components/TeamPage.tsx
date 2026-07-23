import { useState } from 'react';
import { useTeamActions, useFinanceActions, useChemistryActions } from '@/hooks';
import { VCTCard, VCTCardContent, VCTButton, Badge, AttributePanel } from '@/components/ui';
import { PlayerCard } from './PlayerCard';
import { formatCurrency } from '@/utils/helpers';
import { roleNames } from '@/data/agents';
import type { AgentRole } from '@/data/agents';
import { images } from '@/data/images';
import type { SponsorContract } from '@/types';

export const TeamPage = () => {
  const { playerTeam, setTeamName, getTeamRating, getRosterValue, getTotalSalary } = useTeamActions();
  const {
    sponsors,
    addSponsor,
    canAddSponsor,
    sponsorContracts,
    businessEvents,
    fanBase,
    reputation,
    signSponsorContract,
    runBusinessEvent,
  } = useFinanceActions();
  const { chemistryMatrix, avgChemistry, topPairs } = useChemistryActions();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(playerTeam.name);
  const [newSponsor, setNewSponsor] = useState('');
  const [selectedSponsor, setSelectedSponsor] = useState('Secretlab');
  const [selectedTier, setSelectedTier] = useState<SponsorContract['tier']>('bronze');

  const teamRating = getTeamRating;
  const rosterValue = getRosterValue;
  const totalSalary = getTotalSalary;

  const handleSaveName = () => {
    if (newName.trim()) {
      setTeamName(newName.trim());
      setEditingName(false);
    }
  };

  const handleAddSponsor = () => {
    if (newSponsor.trim() && canAddSponsor()) {
      addSponsor(newSponsor.trim());
      setNewSponsor('');
    }
  };

  // 位置阵容统计
  const roleCounts: Record<AgentRole, number> = {
    Duelist: playerTeam.players.filter(p => p.position === 'Duelist').length,
    Initiator: playerTeam.players.filter(p => p.position === 'Initiator').length,
    Controller: playerTeam.players.filter(p => p.position === 'Controller').length,
    Sentinel: playerTeam.players.filter(p => p.position === 'Sentinel').length,
  };

  // 角色样式配置
  const roleStyles: Record<AgentRole, { bg: string; text: string; border: string; accent: string }> = {
    Duelist: { bg: 'bg-valorant-red/10', text: 'text-valorant-red', border: 'border-valorant-red/40', accent: '#FF4655' },
    Controller: { bg: 'bg-valorant-purple/10', text: 'text-valorant-purple', border: 'border-valorant-purple/40', accent: '#6C5CE7' },
    Initiator: { bg: 'bg-valorant-teal/10', text: 'text-valorant-teal', border: 'border-valorant-teal/40', accent: '#00E5C4' },
    Sentinel: { bg: 'bg-valorant-cyan/10', text: 'text-valorant-cyan', border: 'border-valorant-cyan/40', accent: '#00D9FF' },
  };

  // 团队平均属性
  const teamAttributes = {
    rating: playerTeam.players.length > 0
      ? Math.round(playerTeam.players.reduce((sum, p) => sum + p.rating, 0) / playerTeam.players.length)
      : 0,
    morale: playerTeam.players.length > 0
      ? Math.round(playerTeam.players.reduce((sum, p) => sum + p.morale, 0) / playerTeam.players.length)
      : 0,
    fitness: playerTeam.players.length > 0
      ? Math.round(playerTeam.players.reduce((sum, p) => sum + p.fitness, 0) / playerTeam.players.length)
      : 0,
  };

  const attributeLabels = {
    rating: '平均评级',
    morale: '平均士气',
    fitness: '平均状态',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-valorant-darker via-valorant-dark to-valorant-darker clip-corner border border-valorant-red/20 grid-bg">
        <div className="scan-line"></div>
        <div className="relative p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* 战队Logo */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-valorant-red/30 to-valorant-red-dark/10 clip-corner flex items-center justify-center border border-valorant-red/40 overflow-hidden flex-shrink-0">
              {/* 战队Logo 背景图 */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: `url(${images.teamLogoBackground})`, backgroundColor: '#1a0d0d' }}
                aria-hidden="true"
              />
              <span className="relative font-display text-3xl md:text-4xl font-bold text-white">
                {playerTeam.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="primary">TEAM HQ</Badge>
                <span className="text-xs text-gray-500 font-tactical tracking-wider">ROSTER MANAGEMENT</span>
              </div>
              <h1 className="font-display text-3xl font-bold text-white tracking-wider">战队管理</h1>
              <p className="text-gray-400 mt-1 font-tactical">职业战队阵容 · 教练组 · 赞助商</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-valorant-panel/60 px-4 py-2 clip-corner-sm border border-valorant-gold/30">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">BUDGET</p>
              <p className="font-display text-xl font-bold text-valorant-gold">{formatCurrency(playerTeam.budget)}</p>
            </div>
            <div className="bg-valorant-panel/60 px-4 py-2 clip-corner-sm border border-valorant-cyan/30">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">RATING</p>
              <p className="font-display text-xl font-bold text-valorant-cyan">{teamRating}</p>
            </div>
            <div className="bg-valorant-panel/60 px-4 py-2 clip-corner-sm border border-valorant-purple/30">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">ROSTER VALUE</p>
              <p className="font-display text-xl font-bold text-valorant-purple">{formatCurrency(rosterValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 战队名称 */}
      <VCTCard variant="default" className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] text-gray-500 font-tactical tracking-wider mb-1">TEAM NAME</p>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-valorant-dark text-white px-3 py-1.5 clip-corner-sm border border-valorant-red/30 font-display"
                  autoFocus
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <VCTButton variant="ghost" size="sm" onClick={handleSaveName}>保存</VCTButton>
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="font-display text-xl font-bold text-white tracking-wider hover:text-valorant-cyan transition-all flex items-center gap-2"
              >
                {playerTeam.name}
                <span className="text-[10px] text-gray-500 font-tactical">编辑 ✎</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs font-tactical tracking-wider">
            <span className="text-gray-500">PLAYERS</span>
            <span className="font-display text-valorant-cyan font-bold text-lg">{playerTeam.players.length}/7</span>
          </div>
        </div>
      </VCTCard>

      {/* 位置阵容 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(roleCounts) as AgentRole[]).map(role => {
          const count = roleCounts[role];
          const style = roleStyles[role];
          return (
            <VCTCard
              key={role}
              variant="default"
              className={`p-4 ${count === 0 ? 'opacity-50' : ''}`}
            >
              <div className="absolute top-0 right-0 w-1 h-full" style={{ background: style.accent }}></div>
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider mb-1">POSITION</p>
              <p className={`font-display text-sm font-semibold mb-2 ${style.text}`}>{roleNames[role]}</p>
              <div className="flex items-baseline gap-1">
                <p className="font-display text-3xl font-bold text-white">{count}</p>
                <p className="text-xs text-gray-500 font-tactical">/ 2</p>
              </div>
              <div className="tactical-bar mt-2">
                <div
                  className="tactical-bar-fill"
                  style={{ width: `${Math.min(count / 2, 1) * 100}%`, background: `linear-gradient(90deg, ${style.accent}aa, ${style.accent})` }}
                />
              </div>
            </VCTCard>
          );
        })}
      </div>

      {/* 选手化学反应矩阵 */}
      <VCTCard variant="default" className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="vct-heading font-display text-lg text-white">选手化学反应</h2>
            <p className="text-xs text-gray-500 font-tactical mt-1">
              同国籍、长期合作、位置互补均可提升化学反应
            </p>
          </div>
          <VCTCard variant="dark" corner="br" className="px-4 py-2">
            <p className="text-[10px] text-gray-500 font-tactical tracking-wider">平均默契度</p>
            <p className={`font-display text-xl font-bold ${
              avgChemistry >= 75 ? 'text-valorant-gold' : avgChemistry >= 60 ? 'text-valorant-teal' : 'text-gray-400'
            }`}>{avgChemistry}</p>
          </VCTCard>
        </div>

        {playerTeam.players.length < 2 ? (
          <p className="text-gray-500 text-xs font-tactical text-center py-6">
            至少需要2名选手才能查看化学反应矩阵
          </p>
        ) : (
          <>
            {/* 矩阵表格 */}
            <div className="overflow-x-auto -mx-1 px-1 pb-2">
              <table className="w-full text-[10px] font-tactical">
                <thead>
                  <tr>
                    <th className="text-left text-gray-500 p-1.5 sticky left-0 bg-valorant-dark">选手</th>
                    {playerTeam.players.map(p => (
                      <th key={p.id} className="p-1.5 text-center text-gray-400 min-w-[44px]">
                        {p.chineseName.slice(0, 2)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {playerTeam.players.map(rowPlayer => (
                    <tr key={rowPlayer.id}>
                      <td className="text-left text-gray-300 p-1.5 sticky left-0 bg-valorant-dark font-display font-semibold">
                        {rowPlayer.chineseName.slice(0, 4)}
                      </td>
                      {playerTeam.players.map(colPlayer => {
                        if (rowPlayer.id === colPlayer.id) {
                          return <td key={colPlayer.id} className="p-1.5 text-center text-gray-700">—</td>;
                        }
                        const pair = chemistryMatrix.find(
                          c => (c.playerAId === rowPlayer.id && c.playerBId === colPlayer.id) ||
                                (c.playerAId === colPlayer.id && c.playerBId === rowPlayer.id)
                        );
                        const value = pair?.value || 50;
                        const colorClass = value >= 80 ? 'text-valorant-gold bg-valorant-gold/10' :
                                          value >= 65 ? 'text-valorant-teal bg-valorant-teal/10' :
                                          value >= 50 ? 'text-valorant-cyan bg-valorant-cyan/5' :
                                          'text-gray-500 bg-gray-700/20';
                        return (
                          <td key={colPlayer.id} className="p-1.5 text-center">
                            <span className={`inline-flex items-center justify-center w-9 h-7 clip-corner-sm font-display font-bold ${colorClass}`}>
                              {value}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 最默契组合 */}
            {topPairs.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-xs text-gray-500 font-tactical tracking-wider mb-2">最默契组合</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {topPairs.map((pair, idx) => (
                    <VCTCard key={idx} variant="dark" corner="br" className="p-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-display font-bold text-white truncate">
                          {pair.playerAName} × {pair.playerBName}
                        </p>
                        <Badge variant={pair.value >= 80 ? 'warning' : pair.value >= 65 ? 'success' : 'info'} size="sm">
                          {pair.value}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {pair.reasons.map((r, i) => (
                          <span key={i} className="text-[9px] text-gray-500 font-tactical bg-valorant-dark/60 px-1.5 py-0.5 clip-corner-sm">
                            {r}
                          </span>
                        ))}
                      </div>
                    </VCTCard>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </VCTCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 选手名单 */}
        <div className="lg:col-span-2">
          <h2 className="vct-heading font-display text-lg text-white mb-4">选手名单</h2>
          {playerTeam.players.length === 0 ? (
            <VCTCard variant="dark" className="p-8 text-center">
              <p className="text-gray-400 font-tactical tracking-wider">ROSTER EMPTY</p>
              <p className="text-gray-500 text-xs mt-2 font-tactical">前往转会市场签约选手</p>
            </VCTCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playerTeam.players.map(player => (
                <PlayerCard key={player.id} player={player} showAction actionType="release" />
              ))}
            </div>
          )}
        </div>

        {/* 右侧栏 */}
        <div className="space-y-4">
          {/* 教练组 */}
          <VCTCard variant="default">
            <VCTCardContent className="p-4">
              <h3 className="vct-heading font-display text-base text-white mb-3">教练组</h3>
              <div className="bg-valorant-dark/60 clip-corner-sm p-3 flex items-center gap-3">
                <div
                  className="w-12 h-12 clip-corner-sm flex items-center justify-center font-display font-bold text-xl text-white"
                  style={{ background: 'linear-gradient(135deg, #FF4655, #BD3944)' }}
                >
                  C
                </div>
                <div>
                  <p className="text-white font-display font-semibold">{playerTeam.coach}</p>
                  <p className="text-[10px] text-gray-500 font-tactical tracking-wider">HEAD COACH · 战术指导</p>
                </div>
              </div>
            </VCTCardContent>
          </VCTCard>

          {/* 商业经营概览 */}
          <VCTCard variant="default">
            <VCTCardContent className="p-4">
              <h3 className="vct-heading font-display text-base text-white mb-3">商业经营</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-valorant-dark/60 clip-corner-sm p-2 text-center">
                  <p className="text-[10px] text-gray-500 font-tactical">FAN BASE</p>
                  <p className="font-display text-lg font-bold text-valorant-cyan">{fanBase.toLocaleString()}</p>
                </div>
                <div className="bg-valorant-dark/60 clip-corner-sm p-2 text-center">
                  <p className="text-[10px] text-gray-500 font-tactical">REPUTATION</p>
                  <p className="font-display text-lg font-bold text-valorant-gold">{reputation}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-tactical">赞助合同</span>
                  <span className="text-white font-display">{sponsorContracts.length}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-tactical">商业活动</span>
                  <span className="text-white font-display">{businessEvents.filter(e => e.status === 'running').length} 进行中</span>
                </div>
              </div>
            </VCTCardContent>
          </VCTCard>

          {/* 赞助商合同 */}
          <VCTCard variant="default">
            <VCTCardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="vct-heading font-display text-base text-white">赞助商合同</h3>
                <Badge variant="warning" size="sm">{sponsorContracts.length}/5</Badge>
              </div>
              {sponsorContracts.length === 0 ? (
                <p className="text-gray-500 text-xs font-tactical mb-3">暂无赞助商合同</p>
              ) : (
                <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                  {sponsorContracts.map(contract => (
                    <div key={contract.id} className="bg-valorant-dark/60 clip-corner-sm p-2 border-l-2 border-valorant-gold/50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-valorant-gold/20 flex items-center justify-center text-valorant-gold font-display font-bold text-xs clip-corner-sm">
                            {contract.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white text-xs font-display">{contract.name}</span>
                          <Badge variant={contract.tier === 'platinum' ? 'warning' : contract.tier === 'gold' ? 'success' : 'default'} size="sm">
                            {contract.tier.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-valorant-gold font-tactical">+{formatCurrency(contract.weeklyIncome)}/周</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-tactical">
                        <span>剩余 {contract.remainingWeeks} 周</span>
                        <span className={contract.satisfaction >= 60 ? 'text-valorant-teal' : 'text-valorant-red'}>满意度 {contract.satisfaction}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <select
                  value={selectedSponsor}
                  onChange={(e) => setSelectedSponsor(e.target.value)}
                  className="w-full bg-valorant-dark text-white px-2 py-1.5 text-xs clip-corner-sm border border-white/10 font-tactical"
                >
                  {['Secretlab', 'Red Bull', 'Logitech G', 'HyperX', 'ASUS ROG', 'Razer', 'Nike', 'Mercedes-Benz'].map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  {(['bronze', 'silver', 'gold', 'platinum'] as SponsorContract['tier'][]).map(tier => (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`flex-1 py-1 text-[10px] font-display font-semibold clip-corner-sm transition-all ${
                        selectedTier === tier ? 'bg-valorant-red text-white' : 'bg-valorant-dark/60 text-gray-400 hover:text-white'
                      }`}
                    >
                      {tier.toUpperCase()}
                    </button>
                  ))}
                </div>
                <VCTButton
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => signSponsorContract(selectedSponsor, selectedTier)}
                  disabled={sponsorContracts.length >= 5}
                >
                  签约赞助商
                </VCTButton>
              </div>
            </VCTCardContent>
          </VCTCard>

          {/* 商业活动 */}
          <VCTCard variant="default">
            <VCTCardContent className="p-4">
              <h3 className="vct-heading font-display text-base text-white mb-3">商业活动</h3>
              {businessEvents.length === 0 ? (
                <p className="text-gray-500 text-xs font-tactical mb-3">暂无进行中的商业活动</p>
              ) : (
                <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                  {businessEvents.map(event => (
                    <div key={event.id} className="bg-valorant-dark/60 clip-corner-sm p-2 border-l-2 border-valorant-cyan/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-xs font-display">{event.name}</span>
                        <Badge variant={event.status === 'running' ? 'info' : 'success'} size="sm">
                          {event.status === 'running' ? `${event.remainingWeeks}周` : '已完成'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-tactical">
                        <span>收入 {formatCurrency(event.revenue)}</span>
                        <span className="text-valorant-teal">粉丝 +{event.fanGain.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {([
                  { type: 'streaming' as const, label: '直播', icon: '🎥' },
                  { type: 'merchandise' as const, label: '周边', icon: '👕' },
                  { type: 'brand_event' as const, label: '联名', icon: '🤝' },
                  { type: 'fan_meet' as const, label: '见面会', icon: '🎤' },
                ]).map(event => (
                  <VCTButton
                    key={event.type}
                    variant="secondary"
                    size="sm"
                    onClick={() => runBusinessEvent(event.type)}
                  >
                    {event.icon} {event.label}
                  </VCTButton>
                ))}
              </div>
            </VCTCardContent>
          </VCTCard>

          {/* 旧版赞助商（保留） */}
          <VCTCard variant="default">
            <VCTCardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="vct-heading font-display text-base text-white">品牌赞助</h3>
                <Badge variant="warning" size="sm">+ $50K / 每个</Badge>
              </div>
              {sponsors.length === 0 ? (
                <p className="text-gray-500 text-xs font-tactical">暂无赞助商</p>
              ) : (
                <div className="space-y-1.5 mb-3">
                  {sponsors.map((sponsor, index) => (
                    <div key={index} className="flex items-center justify-between bg-valorant-dark/60 clip-corner-sm p-2 border-l-2 border-valorant-gold/50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-valorant-gold/20 flex items-center justify-center text-valorant-gold font-display font-bold text-xs clip-corner-sm">
                          {sponsor.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white text-xs font-display">{sponsor}</span>
                      </div>
                      <Badge variant="success" size="sm">+$50K</Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSponsor}
                  onChange={(e) => setNewSponsor(e.target.value)}
                  placeholder="赞助商名称"
                  className="flex-1 bg-valorant-dark text-white px-3 py-1.5 text-xs clip-corner-sm border border-white/10 font-tactical"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSponsor()}
                />
                <VCTButton variant="primary" size="sm" onClick={handleAddSponsor}>签约</VCTButton>
              </div>
            </VCTCardContent>
          </VCTCard>

          {/* 团队状态 */}
          <VCTCard variant="default">
            <VCTCardContent className="p-4">
              <h3 className="vct-heading font-display text-base text-white mb-3">团队状态</h3>
              <AttributePanel
                attributes={teamAttributes}
                labels={attributeLabels}
                color="red"
              />
              <div className="mt-4 pt-3 border-t border-gray-800">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-tactical">周薪支出</span>
                  <span className="text-valorant-red font-display font-bold">{formatCurrency(totalSalary)}</span>
                </div>
              </div>
            </VCTCardContent>
          </VCTCard>
        </div>
      </div>
    </div>
  );
};