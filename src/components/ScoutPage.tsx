import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useYouthActions } from '@/hooks';
import { formatCurrency } from '@/utils/helpers';
import { roleNames } from '@/data/agents';
import { VCTCard } from '@/components/ui/VCTCard';
import { VCTButton } from '@/components/ui/VCTButton';
import { Badge, RoleBadge } from '@/components/ui/Badge';
import { CircularProgress, AttributePanel } from '@/components/ui/AttributeBar';
import type { Player, AgentRole, YouthPlayer } from '@/types';

const roleStyles: Record<AgentRole, { bg: string; text: string; border: string; accent: string }> = {
  Duelist: { bg: 'bg-valorant-red/15', text: 'text-valorant-red', border: 'border-valorant-red/40', accent: '#FF4655' },
  Controller: { bg: 'bg-valorant-purple/15', text: 'text-valorant-purple', border: 'border-valorant-purple/40', accent: '#6C5CE7' },
  Initiator: { bg: 'bg-valorant-teal/15', text: 'text-valorant-teal', border: 'border-valorant-teal/40', accent: '#00E5C4' },
  Sentinel: { bg: 'bg-valorant-cyan/15', text: 'text-valorant-cyan', border: 'border-valorant-cyan/40', accent: '#00D9FF' },
};

const ATTR_LABELS: Record<string, string> = {
  aim: '枪法', gameSense: '意识', clutch: '残局', entry: '突破',
  teamwork: '配合', support: '支援', utility: '道具', composure: '抗压',
};

const ALL_ATTRS = ['aim', 'gameSense', 'teamwork', 'utility', 'clutch', 'entry', 'support', 'composure', 'leadership', 'consistency'];

const SCOUT_COST = 30000;

type TabType = 'scout' | 'youth' | 'draft';

interface ProspectPlayerCardProps {
  player: Player;
  compact?: boolean;
  isOnTeam: boolean;
  canHirePlayer: boolean;
  onHire: (player: Player) => void;
}

const ProspectPlayerCard = ({ player, compact = false, isOnTeam, canHirePlayer, onHire }: ProspectPlayerCardProps) => {
  const isSigned = player.teamId !== null;
  const style = roleStyles[player.position] || roleStyles.Duelist;

  if (compact) {
    return (
      <VCTCard key={player.id} className={`p-3 border-l-2 ${isOnTeam ? 'border-valorant-red' : style.border}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-white font-display font-semibold text-sm truncate">{player.chineseName}</p>
            <p className="text-[10px] text-gray-500 font-tactical">{player.realName} · {player.nationality}</p>
          </div>
          <CircularProgress value={player.rating} size={40} color="#00D9FF" />
        </div>
        <div className="flex items-center justify-between text-[10px] mb-2">
          <RoleBadge role={player.position} />
          <span className="text-valorant-gold font-display font-semibold">{formatCurrency(player.marketValue)}</span>
        </div>
        {isSigned && !isOnTeam && (
          <p className="text-[10px] text-gray-500 font-tactical">▸ 已被其他战队签约</p>
        )}
        {isOnTeam && (
          <p className="text-[10px] text-valorant-red font-tactical">✓ 已加入你的战队</p>
        )}
        {!isSigned && (
          <VCTButton
            variant="primary"
            size="sm"
            fullWidth
            disabled={!canHirePlayer}
            onClick={() => onHire(player)}
          >
            {!canHirePlayer ? '资金不足' : '签约'}
          </VCTButton>
        )}
      </VCTCard>
    );
  }

  return (
    <VCTCard key={player.id} className="p-2 border-l-2 border-l-valorant-teal">
      <div className="flex items-center justify-between">
        <span className="text-white text-xs font-display font-semibold">{player.chineseName}</span>
        <span className="text-valorant-cyan font-display font-bold text-xs">{player.rating}</span>
      </div>
      <p className="text-[10px] text-gray-500 font-tactical">{player.nationality} · {roleNames[player.position]}</p>
    </VCTCard>
  );
};

export const ScoutPage = () => {
  const { playerTeam, scoutPlayer, hirePlayer, allPlayers } = useGameStore();
  const {
    youthPlayers,
    draftClass,
    recruitCost,
    canRecruit,
    canUpgradeAcademy,
    myDraftPicks,
    availableDraftProspects,
    recruitYouth,
    trainYouth,
    promoteYouth,
    upgradeYouthAcademy,
    generateDraftClass,
    draftPlayer,
  } = useYouthActions();

  const [activeTab, setActiveTab] = useState<TabType>('scout');
  const [scouting, setScouting] = useState(false);
  const [discoveredPlayer, setDiscoveredPlayer] = useState<Player | null>(null);
  const [scoutHistory, setScoutHistory] = useState<Player[]>([]);
  const [selectedYouthAttr, setSelectedYouthAttr] = useState<Record<string, string>>({});

  const analyticsCenter = useMemo(
    () => playerTeam.facilities.find(f => f.id === 'analytics-center'),
    [playerTeam.facilities]
  );

  const scoutingBonus = useMemo(() => {
    return analyticsCenter ? (analyticsCenter.effects.scoutingBonus || 0) * analyticsCenter.level : 0;
  }, [analyticsCenter]);

  const discoveredProspects = useMemo(() => {
    return allPlayers.filter(p => p.isProspect && (p.rating > 78 || scoutHistory.some(s => s.id === p.id)));
  }, [allPlayers, scoutHistory]);

  const canScout = playerTeam.budget >= SCOUT_COST && !scouting;
  const canHire = (player: Player) => playerTeam.budget >= player.marketValue && player.teamId === null;

  const handleScout = () => {
    if (!canScout) return;
    setScouting(true);

    setTimeout(() => {
      const discovered = scoutPlayer();
      if (discovered) {
        setDiscoveredPlayer(discovered);
        setScoutHistory(prev => [discovered, ...prev].slice(0, 10));
      } else {
        setDiscoveredPlayer(null);
      }
      setScouting(false);
    }, 800);
  };

  const handleHire = (player: Player) => {
    if (!canHire(player)) return;
    hirePlayer(player.id);
    setDiscoveredPlayer(null);
  };

  const handleTrainYouth = (youth: YouthPlayer) => {
    const attr = selectedYouthAttr[youth.id] || 'aim';
    trainYouth(youth.id, attr);
  };

  const renderTabs = () => (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      {[
        { id: 'scout' as const, label: '新秀发掘', icon: '◎' },
        { id: 'youth' as const, label: '青训营', icon: '↑' },
        { id: 'draft' as const, label: '选秀大会', icon: '★' },
      ].map(tab => (
        <VCTButton
          key={tab.id}
          variant={activeTab === tab.id ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="mr-1">{tab.icon}</span>{tab.label}
        </VCTButton>
      ))}
    </div>
  );

  const renderScoutTab = () => (
    <>
      {/* 派遣球探 */}
      <VCTCard variant="highlight" className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] text-valorant-purple font-tactical tracking-wider mb-1">▸ SCOUT MISSION</p>
            <h3 className="font-display text-xl font-bold text-white mb-1">派遣球探</h3>
            <p className="text-gray-400 text-xs font-tactical">花费 ${SCOUT_COST.toLocaleString()} 发掘全球潜力新秀</p>
            <p className="text-gray-500 text-[10px] font-tactical mt-1">
              数据分析中心 Lv.{analyticsCenter?.level || 0} · 加成 +{Math.floor(scoutingBonus * 100)}%
            </p>
          </div>
          <VCTButton
            variant="primary"
            size="md"
            disabled={!canScout}
            onClick={handleScout}
          >
            {scouting ? '⌛ 搜索中...' : `▸ 派遣球探 ($${SCOUT_COST.toLocaleString()})`}
          </VCTButton>
        </div>
      </VCTCard>

      {/* 发现新秀 */}
      {discoveredPlayer && (
        <VCTCard variant="highlight" className="p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-valorant-gold font-tactical tracking-wider">★ NEW TALENT DISCOVERED</p>
              <h3 className="font-display text-xl font-bold text-valorant-gold">发现新秀</h3>
            </div>
            <button onClick={() => setDiscoveredPlayer(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
          </div>

          <VCTCard className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <span className="font-display text-2xl font-bold text-white">{discoveredPlayer.chineseName}</span>
                  <RoleBadge role={discoveredPlayer.position} />
                  <Badge variant="primary" size="sm">新秀</Badge>
                </div>
                <p className="text-xs text-gray-400 font-tactical">{discoveredPlayer.realName} · {discoveredPlayer.nationality} · {discoveredPlayer.age}岁</p>
              </div>
              <CircularProgress
                value={discoveredPlayer.rating}
                size={70}
                color="#00D9FF"
                label={`POT ${discoveredPlayer.potential}`}
              />
            </div>

            <div className="mb-4">
              <AttributePanel
                attributes={{
                  aim: discoveredPlayer.attributes.aim,
                  gameSense: discoveredPlayer.attributes.gameSense,
                  clutch: discoveredPlayer.attributes.clutch,
                  entry: discoveredPlayer.attributes.entry,
                }}
                labels={ATTR_LABELS}
                color="red"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1 font-tactical tracking-wider">
                <span className="text-gray-500">GROWTH POTENTIAL</span>
                <span className="text-valorant-gold font-display font-semibold">
                  {discoveredPlayer.rating} → {discoveredPlayer.potential}
                  <span className="text-valorant-teal ml-2">+{discoveredPlayer.potential - discoveredPlayer.rating}</span>
                </span>
              </div>
              <div className="tactical-bar">
                <div
                  className="tactical-bar-fill"
                  style={{ width: `${(discoveredPlayer.rating / discoveredPlayer.potential) * 100}%`, background: 'linear-gradient(90deg, #FFD700, #FF4655)' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
              <span className="text-gray-500 font-tactical tracking-wider text-xs">签约费用</span>
              <span className="font-display font-bold text-valorant-gold">{formatCurrency(discoveredPlayer.marketValue)}</span>
            </div>

            <VCTButton
              variant="primary"
              size="md"
              fullWidth
              disabled={!canHire(discoveredPlayer)}
              onClick={() => handleHire(discoveredPlayer)}
            >
              {!canHire(discoveredPlayer) ? '资金不足' : `▸ 立即签约 ${formatCurrency(discoveredPlayer.marketValue)}`}
            </VCTButton>
          </VCTCard>
        </VCTCard>
      )}

      {/* 已发现的新秀 */}
      <VCTCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="vct-heading font-display text-base text-white">已发现的新秀</h3>
          <Badge variant="info">{discoveredProspects.length} 名</Badge>
        </div>
        {discoveredProspects.length === 0 ? (
          <p className="text-gray-500 text-xs font-tactical text-center py-8">
            暂未发现新秀 · 派遣球探发掘未来之星
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {discoveredProspects.map(player => (
              <ProspectPlayerCard key={player.id} player={player} compact isOnTeam={player.teamId === playerTeam.id} canHirePlayer={canHire(player)} onHire={handleHire} />
            ))}
          </div>
        )}
      </VCTCard>
    </>
  );

  const renderYouthTab = () => (
    <>
      <VCTCard variant="highlight" className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] text-valorant-teal font-tactical tracking-wider mb-1">▸ YOUTH ACADEMY</p>
            <h3 className="font-display text-xl font-bold text-white mb-1">青训营 Lv.{playerTeam.youthAcademyLevel}</h3>
            <p className="text-gray-400 text-xs font-tactical">培养未来之星 · 当前学员 {youthPlayers.length}/6</p>
          </div>
          <div className="flex items-center gap-2">
            <VCTButton
              variant="primary"
              size="md"
              disabled={!canRecruit}
              onClick={() => recruitYouth()}
            >
              招募学员 (${recruitCost.toLocaleString()})
            </VCTButton>
            <VCTButton
              variant="secondary"
              size="md"
              disabled={!canUpgradeAcademy}
              onClick={() => upgradeYouthAcademy()}
            >
              升级青训营
            </VCTButton>
          </div>
        </div>
      </VCTCard>

      {youthPlayers.length === 0 ? (
        <VCTCard className="p-8 text-center">
          <p className="text-gray-400 font-tactical">青训营暂无学员</p>
          <p className="text-gray-500 text-xs mt-2">招募学员并进行专项训练</p>
        </VCTCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {youthPlayers.map(youth => {
            const style = roleStyles[youth.position];
            return (
              <VCTCard key={youth.id} className={`p-4 border-l-2 ${style.border}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-lg font-bold text-white">{youth.chineseName}</span>
                      <RoleBadge role={youth.position} />
                      {youth.isReady && <Badge variant="success" size="sm">可提拔</Badge>}
                    </div>
                    <p className="text-[10px] text-gray-500 font-tactical">{youth.nationality} · {youth.age}岁 · 入营{youth.weeksInAcademy}周</p>
                  </div>
                  <CircularProgress value={youth.rating} size={50} color={style.accent} label={`POT ${youth.potential}`} />
                </div>

                <div className="mb-3">
                  <AttributePanel
                    attributes={{
                      aim: youth.attributes.aim || 50,
                      gameSense: youth.attributes.gameSense || 50,
                      teamwork: youth.attributes.teamwork || 50,
                      clutch: youth.attributes.clutch || 50,
                    }}
                    labels={ATTR_LABELS}
                    color="blue"
                  />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <select
                    value={selectedYouthAttr[youth.id] || 'aim'}
                    onChange={(e) => setSelectedYouthAttr(prev => ({ ...prev, [youth.id]: e.target.value }))}
                    className="bg-valorant-dark text-white px-2 py-1 text-xs clip-corner-sm border border-white/10 font-tactical flex-1"
                  >
                    {ALL_ATTRS.map(attr => (
                      <option key={attr} value={attr}>{ATTR_LABELS[attr] || attr}</option>
                    ))}
                  </select>
                  <VCTButton variant="primary" size="sm" onClick={() => handleTrainYouth(youth)}>
                    训练 ($8K)
                  </VCTButton>
                </div>

                <VCTButton
                  variant="secondary"
                  size="sm"
                  fullWidth
                  disabled={!youth.isReady || playerTeam.players.length >= 7}
                  onClick={() => promoteYouth(youth.id)}
                >
                  {playerTeam.players.length >= 7 ? '阵容已满' : youth.isReady ? '提拔至一线队' : '尚未成熟'}
                </VCTButton>
              </VCTCard>
            );
          })}
        </div>
      )}
    </>
  );

  const renderDraftTab = () => (
    <>
      <VCTCard variant="highlight" className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] text-valorant-gold font-tactical tracking-wider mb-1">▸ DRAFT LOTTERY</p>
            <h3 className="font-display text-xl font-bold text-white mb-1">选秀大会</h3>
            <p className="text-gray-400 text-xs font-tactical">
              {draftClass ? `${draftClass.season}赛季选秀名单已生成 · ${availableDraftProspects.length} 名新秀可选` : '休赛期生成新秀名单'}
            </p>
          </div>
          {!draftClass && (
            <VCTButton variant="primary" size="md" onClick={() => generateDraftClass()}>
              生成选秀名单
            </VCTButton>
          )}
        </div>
      </VCTCard>

      {draftClass ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <VCTCard className="p-4">
              <h3 className="vct-heading font-display text-base text-white mb-3">可用签位</h3>
              {myDraftPicks.length === 0 ? (
                <p className="text-gray-500 text-xs font-tactical text-center py-4">暂无可用签位</p>
              ) : (
                <div className="space-y-2">
                  {myDraftPicks.map(pick => (
                    <div key={pick.id} className="flex items-center justify-between bg-valorant-dark/60 clip-corner-sm p-3">
                      <div>
                        <Badge variant={pick.round === 1 ? 'warning' : 'info'} size="sm">第{pick.round}轮 · 第{pick.pickNumber}顺位</Badge>
                        {pick.selectedPlayerId && (
                          <p className="text-xs text-valorant-teal font-tactical mt-1">
                            已选择: {draftClass.prospects.find(p => p.id === pick.selectedPlayerId)?.chineseName}
                          </p>
                        )}
                      </div>
                      {pick.selectedPlayerId ? (
                        <Badge variant="success" size="sm">已完成</Badge>
                      ) : (
                        <span className="text-xs text-gray-500 font-tactical">待选择</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </VCTCard>

            <VCTCard className="p-4">
              <h3 className="vct-heading font-display text-base text-white mb-3">选秀名单</h3>
              {availableDraftProspects.length === 0 ? (
                <p className="text-gray-500 text-xs font-tactical text-center py-4">选秀名单已清空</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableDraftProspects.map(player => {
                    const style = roleStyles[player.position] || roleStyles.Duelist;
                    const availablePick = myDraftPicks.find(p => !p.selectedPlayerId);
                    return (
                      <div key={player.id} style={{ borderColor: style.accent }} className="border-l-2">
                        <VCTCard className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white font-display font-semibold text-sm">{player.chineseName}</p>
                            <p className="text-[10px] text-gray-500 font-tactical">{player.nationality} · {roleNames[player.position]}</p>
                          </div>
                          <CircularProgress value={player.rating} size={40} color={style.accent} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] mb-2">
                          <span className="text-gray-500 font-tactical">潜力 <span className="text-valorant-gold font-display">{player.potential}</span></span>
                          <span className="text-gray-500 font-tactical">薪资 <span className="text-valorant-gold font-display">{formatCurrency(player.salary)}</span></span>
                        </div>
                        <VCTButton
                          variant="primary"
                          size="sm"
                          fullWidth
                          disabled={!availablePick || playerTeam.players.length >= 7}
                          onClick={() => availablePick && draftPlayer(availablePick.id, player.id)}
                        >
                          {!availablePick ? '无可用签位' : playerTeam.players.length >= 7 ? '阵容已满' : `第${availablePick.round}轮选中`}
                        </VCTButton>
                        </VCTCard>
                      </div>
                    );
                  })}
                </div>
              )}
            </VCTCard>
          </div>

          <div className="space-y-4">
            <VCTCard className="p-4">
              <h3 className="vct-heading font-display text-base text-white mb-3">选秀说明</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-valorant-gold">▸</span>
                  <p className="text-gray-400">每个休赛期生成新一届选秀名单</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-valorant-cyan">▸</span>
                  <p className="text-gray-400">顺位越前越能选到高潜力新秀</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-valorant-teal">▸</span>
                  <p className="text-gray-400">新秀合同薪资较低但成长空间大</p>
                </div>
              </div>
            </VCTCard>
          </div>
        </div>
      ) : (
        <VCTCard className="p-8 text-center">
          <p className="text-gray-400 font-tactical">选秀大会尚未开始</p>
          <p className="text-gray-500 text-xs mt-2">点击上方按钮生成当赛季选秀名单</p>
        </VCTCard>
      )}
    </>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <VCTCard variant="highlight" className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary">TALENT SCOUTING</Badge>
              <span className="text-xs text-gray-500 font-tactical tracking-wider">DISCOVERY CENTER</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white tracking-wider">人才中心</h1>
            <p className="text-gray-400 mt-1 font-tactical">发掘 · 培养 · 选拔未来之星</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <VCTCard className="px-4 py-2">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">BUDGET</p>
              <p className="font-display text-xl font-bold text-valorant-gold">{formatCurrency(playerTeam.budget)}</p>
            </VCTCard>
          </div>
        </div>
      </VCTCard>

      {renderTabs()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'scout' && renderScoutTab()}
          {activeTab === 'youth' && renderYouthTab()}
          {activeTab === 'draft' && renderDraftTab()}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-4">
          {/* 发掘历史 */}
          {activeTab === 'scout' && (
            <VCTCard className="p-4">
              <h3 className="vct-heading font-display text-base text-white mb-3">发掘历史</h3>
              {scoutHistory.length === 0 ? (
                <p className="text-gray-500 text-xs font-tactical text-center py-4">暂无发掘记录</p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {scoutHistory.map(player => (
                    <ProspectPlayerCard key={player.id} player={player} isOnTeam={player.teamId === playerTeam.id} canHirePlayer={canHire(player)} onHire={handleHire} />
                  ))}
                </div>
              )}
            </VCTCard>
          )}

          {/* 数据分析中心 */}
          {activeTab === 'scout' && (
            <VCTCard className="p-4">
              <h3 className="vct-heading font-display text-base text-white mb-3">数据分析中心</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-tactical tracking-wider">CURRENT LV</span>
                  <span className="text-white font-display font-semibold">Lv.{analyticsCenter?.level || 0} / {analyticsCenter?.maxLevel || 5}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 font-tactical tracking-wider">PROGRESS</span>
                    <span className="text-valorant-teal font-display">+{Math.floor(scoutingBonus * 100)}%</span>
                  </div>
                  <div className="tactical-bar">
                    <div className="tactical-bar-fill" style={{ width: `${((analyticsCenter?.level || 0) / (analyticsCenter?.maxLevel || 5)) * 100}%`, background: 'linear-gradient(90deg, #00E5C4, #00D9FF)' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-tactical tracking-wider">COST</span>
                  <span className="text-valorant-gold font-display font-semibold">${SCOUT_COST.toLocaleString()}</span>
                </div>
              </div>
            </VCTCard>
          )}

          {/* 青训营信息 */}
          {activeTab === 'youth' && (
            <VCTCard className="p-4">
              <h3 className="vct-heading font-display text-base text-white mb-3">青训营设施</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-tactical tracking-wider">LEVEL</span>
                  <span className="text-white font-display font-semibold">Lv.{playerTeam.youthAcademyLevel} / 5</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 font-tactical tracking-wider">GROWTH RATE</span>
                    <span className="text-valorant-teal font-display">+{(50 + playerTeam.youthAcademyLevel * 30).toFixed(0)}%</span>
                  </div>
                  <div className="tactical-bar">
                    <div className="tactical-bar-fill" style={{ width: `${(playerTeam.youthAcademyLevel / 5) * 100}%`, background: 'linear-gradient(90deg, #00E5C4, #00D9FF)' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-tactical tracking-wider">UPGRADE COST</span>
                  <span className="text-valorant-gold font-display font-semibold">${(100000 * playerTeam.youthAcademyLevel).toLocaleString()}</span>
                </div>
              </div>
            </VCTCard>
          )}

          {/* 通用说明 */}
          <VCTCard className="p-4">
            <h3 className="vct-heading font-display text-base text-white mb-3">
              {activeTab === 'scout' ? '发掘说明' : activeTab === 'youth' ? '青训说明' : '选秀说明'}
            </h3>
            <div className="space-y-2 text-xs">
              {activeTab === 'scout' && [
                { color: 'text-valorant-purple', text: '球探可发掘全球各地的潜力新秀' },
                { color: 'text-valorant-teal', text: '新秀评级较低但成长空间大' },
                { color: 'text-valorant-gold', text: '数据中心等级越高发现的新秀越强' },
                { color: 'text-valorant-cyan', text: '签约后可通过训练提升新秀能力' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className={item.color}>▸</span>
                  <p className="text-gray-400">{item.text}</p>
                </div>
              ))}
              {activeTab === 'youth' && [
                { color: 'text-valorant-teal', text: '青训营学员每周自动成长' },
                { color: 'text-valorant-cyan', text: '专项训练可加速特定属性提升' },
                { color: 'text-valorant-gold', text: '达到成熟条件后可提拔至一线队' },
                { color: 'text-valorant-purple', text: '升级青训营提高成长速度' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className={item.color}>▸</span>
                  <p className="text-gray-400">{item.text}</p>
                </div>
              ))}
              {activeTab === 'draft' && [
                { color: 'text-valorant-gold', text: '每赛季休赛期生成选秀名单' },
                { color: 'text-valorant-cyan', text: '使用签位选择高潜力新秀' },
                { color: 'text-valorant-teal', text: '新秀薪资低、合同年限短' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className={item.color}>▸</span>
                  <p className="text-gray-400">{item.text}</p>
                </div>
              ))}
            </div>
          </VCTCard>
        </div>
      </div>
    </div>
  );
};
