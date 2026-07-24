import { useState, useMemo } from 'react';
import {
  usePlayerFilters, useTeamActions, useAuctionActions,
  useTransferWindow, useTransferHistory, usePlayerComparison, useTransferActions,
} from '@/hooks';
import { VCTCard, VCTCardContent, VCTButton, Badge } from '@/components/ui';
import { PlayerCard } from './PlayerCard';
import { formatCurrency } from '@/utils/helpers';
import { roleNames } from '@/data/agents';
import type { AgentRole } from '@/data/agents';
import { images } from '@/data/images';
import type { AuctionItem, TransferRecord } from '@/types';
import { ATTRIBUTE_LABELS, PLAYER_POSITIONS } from '@/types';

type MarketTab = 'market' | 'auction' | 'records';

// 转会类型标签
const TRANSFER_TYPE_LABELS: Record<TransferRecord['type'], string> = {
  hire: '签约',
  release: '解约',
  trade: '交易',
  loan: '租借',
  auction: '拍卖',
  buyout: '买断',
};

// 价格区间预设
const PRICE_PRESETS: { label: string; min: number; max: number }[] = [
  { label: '全部', min: 0, max: Number.MAX_SAFE_INTEGER },
  { label: '50万以下', min: 0, max: 500000 },
  { label: '50万-100万', min: 500000, max: 1000000 },
  { label: '100万-200万', min: 1000000, max: 2000000 },
  { label: '200万以上', min: 2000000, max: Number.MAX_SAFE_INTEGER },
];

export const MarketPage = () => {
  const { playerTeam, getSigningFee } = useTeamActions();
  const { getFreeAgents, allNationalities } = usePlayerFilters();
  const {
    activeAuctions,
    auctionHistory,
    getAuctionablePlayers,
    myActiveBids,
    createAuction,
    placeBid,
    buyoutAuction,
    canBuyout,
    getMinBid,
    getCompetitionLabel,
  } = useAuctionActions();
  const { transferWindow, isOpen: transferOpen, statusLabel, statusVariant } = useTransferWindow();
  const { feeLeaderboard, seasonTransfers, myTransfers, transferStats } = useTransferHistory();
  const { recommendations } = useTransferActions();
  const { comparePlayers, getBestAttributes, getOverallScore } = usePlayerComparison();

  const [activeTab, setActiveTab] = useState<MarketTab>('market');
  const [filterRole, setFilterRole] = useState<AgentRole | 'all'>('all');
  const [filterRating, setFilterRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'age'>('rating');
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  // 新增筛选状态
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterNationality, setFilterNationality] = useState<string>('全部');
  const [pricePresetIdx, setPricePresetIdx] = useState<number>(0);
  // 对比功能
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState<boolean>(false);

  const freeAgents = getFreeAgents;
  const budget = playerTeam.budget;
  const pricePreset = PRICE_PRESETS[pricePresetIdx];

  // 综合筛选与排序
  const filteredPlayers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = freeAgents
      .filter(p => filterRole === 'all' || p.position === filterRole)
      .filter(p => p.rating >= filterRating)
      .filter(p => filterNationality === '全部' || p.nationality === filterNationality)
      .filter(p => p.marketValue >= pricePreset.min && p.marketValue <= pricePreset.max);
    if (q) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.chineseName.includes(q) ||
        p.realName.toLowerCase().includes(q) ||
        p.nationality.includes(q)
      );
    }
    return [...result].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return a.marketValue - b.marketValue;
      return a.age - b.age;
    });
  }, [freeAgents, filterRole, filterRating, filterNationality, pricePreset, searchQuery, sortBy]);

  // 拍卖可上架选手
  const auctionablePlayers = useMemo(() => {
    return getAuctionablePlayers
      .filter(p => filterRole === 'all' || p.position === filterRole)
      .filter(p => p.rating >= filterRating)
      .sort((a, b) => b.rating - a.rating);
  }, [getAuctionablePlayers, filterRole, filterRating]);

  // 顶级明星
  const topStars = useMemo(() => {
    return freeAgents.filter(p => p.rating >= 90).slice(0, 5);
  }, [freeAgents]);

  // 角色样式配置
  const roleStyles: Record<AgentRole, { bg: string; text: string; border: string; accent: string }> = {
    Duelist: { bg: 'bg-valorant-red/15', text: 'text-valorant-red', border: 'border-valorant-red/40', accent: '#FF4655' },
    Controller: { bg: 'bg-valorant-purple/15', text: 'text-valorant-purple', border: 'border-valorant-purple/40', accent: '#6C5CE7' },
    Initiator: { bg: 'bg-valorant-teal/15', text: 'text-valorant-teal', border: 'border-valorant-teal/40', accent: '#00E5C4' },
    Sentinel: { bg: 'bg-valorant-cyan/15', text: 'text-valorant-cyan', border: 'border-valorant-cyan/40', accent: '#00D9FF' },
  };

  // 战队需求统计
  const teamNeeds = useMemo(() => {
    return PLAYER_POSITIONS.map(role => ({
      role,
      count: playerTeam.players.filter(p => p.position === role).length,
      style: roleStyles[role],
    }));
  }, [playerTeam.players]);

  // 对比选手列表
  const compareList = useMemo(() => comparePlayers(compareIds), [compareIds, comparePlayers]);
  const bestAttrs = useMemo(() => getBestAttributes(compareList), [compareList, getBestAttributes]);

  const toggleCompare = (playerId: string) => {
    setCompareIds(prev => {
      if (prev.includes(playerId)) return prev.filter(id => id !== playerId);
      if (prev.length >= 3) return prev; // 最多3名
      return [...prev, playerId];
    });
  };

  const handleCreateAuction = (playerId: string) => {
    createAuction(playerId);
  };

  const handlePlaceBid = (auction: AuctionItem) => {
    const amount = Number(bidAmounts[auction.id]);
    if (!amount || amount <= auction.currentBid) {
      return;
    }
    placeBid(auction.id, amount);
    setBidAmounts(prev => ({ ...prev, [auction.id]: '' }));
  };

  const handleBuyout = (auction: AuctionItem) => {
    buyoutAuction(auction.id);
  };

  const getBidderName = (bidder: string | null) => {
    if (!bidder) return '无';
    if (bidder === 'player') return '你的出价';
    return bidder;
  };

  // 转会窗状态颜色
  const windowBadgeVariant = statusVariant as 'success' | 'warning' | 'default';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-valorant-darker via-valorant-dark to-valorant-darker clip-corner border border-valorant-red/20 grid-bg">
        {/* 转会市场装饰背景图 */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${images.marketDecoration})`, backgroundColor: '#1a0d0d' }}
          aria-hidden="true"
        />
        <div className="scan-line"></div>
        <div className="relative p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary">TRANSFER CENTER</Badge>
              <span className="text-xs text-gray-500 font-tactical tracking-wider">MARKET & AUCTION</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white tracking-wider">转会中心</h1>
            <p className="text-gray-400 mt-1 font-tactical">自由签约 · 拍卖竞价 · 交易租借 · 打造冠军阵容</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-valorant-panel/60 px-4 py-2 clip-corner-sm border border-valorant-gold/30">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">BUDGET</p>
              <p className="font-display text-xl font-bold text-valorant-gold">{formatCurrency(budget)}</p>
            </div>
            <div className="bg-valorant-panel/60 px-4 py-2 clip-corner-sm border border-valorant-cyan/30">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">ACTIVE BIDS</p>
              <p className="font-display text-xl font-bold text-valorant-cyan">{myActiveBids.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 转会窗状态 */}
      <VCTCard variant={transferOpen ? 'highlight' : 'default'} className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{transferOpen ? '🟢' : transferWindow.status === 'opening_soon' ? '🟡' : '🔴'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base text-white tracking-wider">{transferWindow.label}</h3>
                <Badge variant={windowBadgeVariant} size="sm">{statusLabel}</Badge>
              </div>
              <p className="text-[11px] text-gray-500 font-tactical mt-0.5">
                {transferOpen
                  ? '转会窗开放中，可签约自由选手、交易与租借'
                  : '转会窗关闭，无法签约自由选手；拍卖与已签约选手管理仍可进行'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-tactical">本季转会</p>
              <p className="text-valorant-cyan font-display font-bold">{transferStats.hire + transferStats.trade + transferStats.loan + transferStats.auction + transferStats.buyout}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-tactical">历史总额</p>
              <p className="text-valorant-gold font-display font-bold">{formatCurrency(feeLeaderboard.reduce((s, r) => s + r.fee, 0))}</p>
            </div>
          </div>
        </div>
      </VCTCard>

      {/* 标签切换 */}
      <div className="flex items-center gap-2 flex-wrap">
        <VCTButton
          variant={activeTab === 'market' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('market')}
        >
          转会市场
        </VCTButton>
        <VCTButton
          variant={activeTab === 'auction' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('auction')}
        >
          拍卖行 ({activeAuctions.length})
        </VCTButton>
        <VCTButton
          variant={activeTab === 'records' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('records')}
        >
          转会记录
        </VCTButton>
        {compareIds.length > 0 && (
          <VCTButton
            variant="warning"
            size="sm"
            onClick={() => setShowCompare(s => !s)}
          >
            对比 ({compareIds.length})
          </VCTButton>
        )}
      </div>

      {/* 筛选器 */}
      {activeTab !== 'records' && (
        <VCTCard variant="default" className="p-4">
          <div className="space-y-3">
            {/* 搜索框 */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-tactical tracking-wider">SEARCH</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="按选手名字 / 中文名 / 国籍搜索..."
                className="flex-1 bg-valorant-dark text-white px-3 py-1.5 text-xs clip-corner-sm border border-white/10 font-tactical placeholder:text-gray-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-500 hover:text-white text-xs px-2"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-gray-500 font-tactical tracking-wider mr-1">POSITION</span>
              <button
                onClick={() => setFilterRole('all')}
                className={`px-3 py-1 text-xs font-display font-semibold tracking-wider clip-corner-sm transition-all ${
                  filterRole === 'all' ? 'bg-valorant-red text-white' : 'bg-valorant-dark/60 text-gray-400 hover:text-white'
                }`}
              >
                全部
              </button>
              {PLAYER_POSITIONS.map(role => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`px-3 py-1 text-xs font-display font-semibold tracking-wider clip-corner-sm transition-all border ${
                    filterRole === role ? 'bg-valorant-red text-white border-valorant-red' : `${roleStyles[role].bg} ${roleStyles[role].text} ${roleStyles[role].border} hover:bg-opacity-30`
                  }`}
                >
                  {roleNames[role]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-tactical tracking-wider">MIN RATING</span>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(Number(e.target.value))}
                  className="bg-valorant-dark text-white px-2 py-1 text-xs clip-corner-sm border border-white/10 font-tactical"
                >
                  {[0, 80, 85, 90, 92].map(rating => (
                    <option key={rating} value={rating}>
                      {rating === 0 ? '不限' : `${rating}+`}
                    </option>
                  ))}
                </select>
              </div>

              {/* 国籍筛选 */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-tactical tracking-wider">NATIONALITY</span>
                <select
                  value={filterNationality}
                  onChange={(e) => setFilterNationality(e.target.value)}
                  className="bg-valorant-dark text-white px-2 py-1 text-xs clip-corner-sm border border-white/10 font-tactical max-w-[140px]"
                >
                  {allNationalities.map(nat => (
                    <option key={nat} value={nat}>{nat}</option>
                  ))}
                </select>
              </div>

              {/* 价格区间筛选 */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-tactical tracking-wider">PRICE</span>
                <select
                  value={pricePresetIdx}
                  onChange={(e) => setPricePresetIdx(Number(e.target.value))}
                  className="bg-valorant-dark text-white px-2 py-1 text-xs clip-corner-sm border border-white/10 font-tactical"
                >
                  {PRICE_PRESETS.map((p, idx) => (
                    <option key={idx} value={idx}>{p.label}</option>
                  ))}
                </select>
              </div>

              {activeTab === 'market' && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-tactical tracking-wider">SORT BY</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'rating' | 'price' | 'age')}
                    className="bg-valorant-dark text-white px-2 py-1 text-xs clip-corner-sm border border-white/10 font-tactical"
                  >
                    <option value="rating">评级</option>
                    <option value="price">价格</option>
                    <option value="age">年龄</option>
                  </select>
                </div>
              )}

              <div className="ml-auto">
                <Badge variant="info" size="sm">
                  {activeTab === 'market' ? `${filteredPlayers.length} 名选手匹配` : `${auctionablePlayers.length} 名可拍卖`}
                </Badge>
              </div>
            </div>
          </div>
        </VCTCard>
      )}

      {/* 对比面板 */}
      {showCompare && compareList.length >= 2 && (
        <VCTCard variant="highlight">
          <VCTCardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="vct-heading font-display text-base text-white">选手对比</h3>
                <Badge variant="warning" size="sm">{compareList.length}/3</Badge>
              </div>
              <div className="flex items-center gap-2">
                <VCTButton variant="ghost" size="sm" onClick={() => { setCompareIds([]); setShowCompare(false); }}>清空</VCTButton>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-tactical">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-2 text-gray-500 tracking-wider">属性</th>
                    {compareList.map(p => (
                      <th key={p.id} className="text-center py-2 px-2">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-7 h-7 clip-corner-sm flex items-center justify-center text-white font-display font-bold text-[10px]" style={{ background: roleStyles[p.position].accent }}>
                            {p.name.charAt(0)}
                          </div>
                          <span className="text-white font-display">{p.chineseName}</span>
                          <span className="text-[9px] text-gray-500">{roleNames[p.position]} · {p.nationality}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-1.5 px-2 text-gray-400">综合评分</td>
                    {compareList.map(p => {
                      const score = getOverallScore(p);
                      const isBest = score === Math.max(...compareList.map(getOverallScore));
                      return (
                        <td key={p.id} className={`text-center py-1.5 px-2 font-display font-bold ${isBest ? 'text-valorant-teal' : 'text-gray-300'}`}>
                          {score}{isBest && ' ★'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-1.5 px-2 text-gray-400">评级</td>
                    {compareList.map(p => {
                      const isBest = p.rating === Math.max(...compareList.map(x => x.rating));
                      return (
                        <td key={p.id} className={`text-center py-1.5 px-2 font-display font-bold ${isBest ? 'text-valorant-teal' : 'text-gray-300'}`}>
                          {p.rating}{isBest && ' ★'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-1.5 px-2 text-gray-400">市场价</td>
                    {compareList.map(p => {
                      const isBest = p.marketValue === Math.min(...compareList.map(x => x.marketValue));
                      return (
                        <td key={p.id} className={`text-center py-1.5 px-2 font-display ${isBest ? 'text-valorant-teal' : 'text-valorant-gold'}`}>
                          {formatCurrency(p.marketValue)}{isBest && ' ★'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-1.5 px-2 text-gray-400">年龄</td>
                    {compareList.map(p => {
                      const isBest = p.age === Math.min(...compareList.map(x => x.age));
                      return (
                        <td key={p.id} className={`text-center py-1.5 px-2 font-display ${isBest ? 'text-valorant-teal' : 'text-gray-300'}`}>
                          {p.age}{isBest && ' ★'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-1.5 px-2 text-gray-400">周薪</td>
                    {compareList.map(p => {
                      const isBest = p.salary === Math.min(...compareList.map(x => x.salary));
                      return (
                        <td key={p.id} className={`text-center py-1.5 px-2 font-display ${isBest ? 'text-valorant-teal' : 'text-gray-300'}`}>
                          {formatCurrency(p.salary)}{isBest && ' ★'}
                        </td>
                      );
                    })}
                  </tr>
                  {(Object.keys(ATTRIBUTE_LABELS) as (keyof typeof ATTRIBUTE_LABELS)[]).map(attrKey => (
                    <tr key={attrKey} className="border-b border-white/5">
                      <td className="py-1.5 px-2 text-gray-400">{ATTRIBUTE_LABELS[attrKey]}</td>
                      {compareList.map(p => {
                        const val = p.attributes[attrKey];
                        const isBest = val === bestAttrs[attrKey];
                        return (
                          <td key={p.id} className={`text-center py-1.5 px-2 font-display ${isBest ? 'text-valorant-teal font-bold' : 'text-gray-300'}`}>
                            {val}{isBest && ' ★'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td className="py-1.5 px-2 text-gray-400">2年签约费</td>
                    {compareList.map(p => (
                      <td key={p.id} className="text-center py-1.5 px-2 font-display text-valorant-gold">
                        {formatCurrency(getSigningFee(p, 2))}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-tactical">★ 标记该属性最优值 · 签约费基于2年标准合同计算</p>
          </VCTCardContent>
        </VCTCard>
      )}

      {activeTab === 'market' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 选手列表 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 推荐选手 */}
            {recommendations.length > 0 && (
              <VCTCard variant="highlight">
                <VCTCardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="vct-heading font-display text-base text-white">推荐选手</h3>
                    <Badge variant="warning" size="sm">针对弱点位置</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendations.map(player => {
                      const roleStyle = roleStyles[player.position];
                      const inCompare = compareIds.includes(player.id);
                      return (
                        <div key={player.id} className={`bg-valorant-dark/60 clip-corner-sm p-3 border-l-2 ${roleStyle.border}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 clip-corner-sm flex items-center justify-center text-white font-display font-bold text-xs" style={{ background: roleStyle.accent }}>
                                {player.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white text-xs font-display font-semibold">{player.chineseName}</p>
                                <p className="text-[10px] text-gray-500 font-tactical">{roleNames[player.position]} · {player.nationality}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-valorant-cyan font-display font-bold text-sm">{player.rating}</p>
                              <p className="text-[10px] text-valorant-gold font-tactical">{formatCurrency(player.marketValue)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-valorant-teal font-tactical">性价比 {(player.rating / Math.max(1, player.marketValue / 10000)).toFixed(2)}</span>
                            <button
                              onClick={() => toggleCompare(player.id)}
                              className={`ml-auto px-2 py-0.5 text-[10px] font-display clip-corner-sm border transition-all ${inCompare ? 'bg-valorant-teal text-valorant-darker border-valorant-teal' : 'border-white/20 text-gray-400 hover:text-white'}`}
                            >
                              {inCompare ? '✓ 对比中' : '加入对比'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </VCTCardContent>
              </VCTCard>
            )}

            <h2 className="vct-heading font-display text-lg text-white">
              自由选手 <span className="text-gray-500 text-sm">({filteredPlayers.length})</span>
            </h2>
            {filteredPlayers.length === 0 ? (
              <VCTCard variant="dark" className="p-8 text-center">
                <p className="text-gray-400 font-tactical tracking-wider">NO MATCHES</p>
                <p className="text-gray-500 text-xs mt-2 font-tactical">没有符合条件的选手，试试调整筛选条件</p>
              </VCTCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPlayers.map(player => {
                  const inCompare = compareIds.includes(player.id);
                  return (
                    <div key={player.id} className="space-y-1.5">
                      <PlayerCard player={player} showAction actionType="hire" />
                      <button
                        onClick={() => toggleCompare(player.id)}
                        className={`w-full px-3 py-1 text-[11px] font-display font-semibold tracking-wider clip-corner-sm border transition-all ${inCompare ? 'bg-valorant-teal text-valorant-darker border-valorant-teal' : 'bg-valorant-dark/60 text-gray-400 border-white/10 hover:text-white hover:border-white/30'}`}
                      >
                        {inCompare ? '✓ 已加入对比' : '加入对比'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 右侧栏 */}
          <div className="space-y-4">
            {/* 顶级明星 */}
            <VCTCard variant="highlight">
              <VCTCardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="vct-heading font-display text-base text-white">顶级明星</h3>
                  <Badge variant="warning" size="sm">ELITE TIER</Badge>
                </div>
                <div className="space-y-1.5">
                  {topStars.length > 0 ? (
                    topStars.map(player => {
                      const roleStyle = roleStyles[player.position];
                      return (
                        <div key={player.id} className="bg-valorant-dark/60 clip-corner-sm p-2 border-l-2 border-valorant-gold/50 flex items-center gap-2">
                          <div className="w-8 h-8 clip-corner-sm flex items-center justify-center text-white font-display font-bold text-xs" style={{ background: roleStyle.accent }}>
                            {player.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-display font-semibold truncate">{player.chineseName}</p>
                            <p className="text-[10px] text-gray-500 font-tactical">{player.nationality} · {roleNames[player.position]}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-valorant-cyan font-display font-bold text-sm">{player.rating}</p>
                            <p className="text-[10px] text-valorant-gold font-tactical">{formatCurrency(player.marketValue)}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-xs font-tactical text-center py-4">暂无顶级明星</p>
                  )}
                </div>
              </VCTCardContent>
            </VCTCard>

            {/* 战队需求 */}
            <VCTCard variant="default">
              <VCTCardContent className="p-4">
                <h3 className="vct-heading font-display text-base text-white mb-3">战队需求</h3>
                <div className="space-y-3">
                  {teamNeeds.map(({ role, count, style }) => {
                    const isFull = count >= 2;
                    return (
                      <div key={role}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={`font-tactical tracking-wider ${style.text}`}>{roleNames[role]}</span>
                          <span className={`font-display font-semibold ${isFull ? 'text-valorant-teal' : 'text-gray-400'}`}>
                            {count}/2 {isFull && '✓'}
                          </span>
                        </div>
                        <div className="tactical-bar">
                          <div
                            className="tactical-bar-fill"
                            style={{ width: `${Math.min(count / 2, 1) * 100}%`, background: `linear-gradient(90deg, ${style.accent}aa, ${style.accent})` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </VCTCardContent>
            </VCTCard>

            {/* 市场提示 */}
            <VCTCard variant="default">
              <VCTCardContent className="p-4">
                <h3 className="vct-heading font-display text-base text-white mb-3">市场提示</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-valorant-cyan">▸</span>
                    <p className="text-gray-400">每位置至少签约2名选手</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-valorant-gold">▸</span>
                    <p className="text-gray-400">高评级选手表现更稳定</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-valorant-purple">▸</span>
                    <p className="text-gray-400">新秀成长空间大但需培养</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-valorant-red">▸</span>
                    <p className="text-gray-400">合同年限影响签约费倍率</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-valorant-teal">▸</span>
                    <p className="text-gray-400">可选中2-3名选手对比属性</p>
                  </div>
                </div>
              </VCTCardContent>
            </VCTCard>
          </div>
        </div>
      ) : activeTab === 'auction' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 拍卖列表 */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="vct-heading font-display text-lg text-white mb-4">
              活跃拍卖 <span className="text-gray-500 text-sm">({activeAuctions.length})</span>
            </h2>
            {activeAuctions.length === 0 ? (
              <VCTCard variant="dark" className="p-8 text-center">
                <p className="text-gray-400 font-tactical tracking-wider">NO ACTIVE AUCTIONS</p>
                <p className="text-gray-500 text-xs mt-2 font-tactical">暂无进行中的拍卖，可从下方选手发起</p>
              </VCTCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAuctions.map(auction => {
                  const style = roleStyles[auction.player.position];
                  const minBid = getMinBid(auction.id);
                  const isLeading = auction.currentBidder === 'player';
                  const canBuy = canBuyout(auction.id);
                  const actualBuyout = Math.max(auction.buyoutPrice, minBid);
                  const compLabel = getCompetitionLabel(auction.competitionLevel);
                  const compVariant = auction.competitionLevel === 'high' ? 'danger' : auction.competitionLevel === 'medium' ? 'warning' : 'success';
                  return (
                    <VCTCard key={auction.id} className={`p-4 border-l-2 ${isLeading ? 'border-valorant-teal' : style.border}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 clip-corner-sm flex items-center justify-center text-white font-display font-bold text-sm" style={{ background: style.accent }}>
                            {auction.player.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-display font-semibold text-sm">{auction.player.chineseName}</p>
                            <p className="text-[10px] text-gray-500 font-tactical">{roleNames[auction.player.position]} · 评级 {auction.player.rating}</p>
                          </div>
                        </div>
                        <Badge variant={isLeading ? 'success' : 'default'} size="sm">
                          {isLeading ? '领先' : '竞拍中'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div className="bg-valorant-dark/60 clip-corner-sm p-2">
                          <p className="text-[10px] text-gray-500 font-tactical">CURRENT BID</p>
                          <p className="text-valorant-gold font-display font-semibold">{formatCurrency(auction.currentBid)}</p>
                        </div>
                        <div className="bg-valorant-dark/60 clip-corner-sm p-2">
                          <p className="text-[10px] text-gray-500 font-tactical">REMAINING</p>
                          <p className="text-valorant-cyan font-display font-semibold">{auction.weeksRemaining} 周</p>
                        </div>
                      </div>

                      {/* 竞争程度与一口价 */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant={compVariant as 'danger' | 'warning' | 'success'} size="sm">
                          竞争：{compLabel}
                        </Badge>
                        <span className="text-[10px] text-gray-500 font-tactical">
                          关注战队 {auction.interestedTeams.length}
                        </span>
                        <span className="ml-auto text-[10px] text-valorant-gold font-tactical">
                          一口价 {formatCurrency(actualBuyout)}
                        </span>
                      </div>

                      <p className="text-[10px] text-gray-500 font-tactical mb-2">
                        当前最高: <span className={isLeading ? 'text-valorant-teal' : 'text-valorant-red'}>{getBidderName(auction.currentBidder)}</span>
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={bidAmounts[auction.id] || ''}
                            onChange={(e) => setBidAmounts(prev => ({ ...prev, [auction.id]: e.target.value }))}
                            placeholder={`最低 ${formatCurrency(minBid)}`}
                            className="flex-1 bg-valorant-dark text-white px-2 py-1.5 text-xs clip-corner-sm border border-white/10 font-tactical"
                          />
                          <VCTButton
                            variant="primary"
                            size="sm"
                            disabled={!bidAmounts[auction.id] || Number(bidAmounts[auction.id]) < minBid || Number(bidAmounts[auction.id]) > budget}
                            onClick={() => handlePlaceBid(auction)}
                          >
                            出价
                          </VCTButton>
                        </div>
                        <VCTButton
                          variant="warning"
                          size="sm"
                          fullWidth
                          disabled={!canBuy}
                          onClick={() => handleBuyout(auction)}
                        >
                          {canBuy ? `一口价买断 ${formatCurrency(actualBuyout)}` : `一口价 ${formatCurrency(actualBuyout)}（预算/阵容不足）`}
                        </VCTButton>
                      </div>
                    </VCTCard>
                  );
                })}
              </div>
            )}

            {/* 可发起拍卖的选手 */}
            <h2 className="vct-heading font-display text-lg text-white mb-4 mt-6">
              发起拍卖 <span className="text-gray-500 text-sm">({auctionablePlayers.length})</span>
            </h2>
            {auctionablePlayers.length === 0 ? (
              <VCTCard variant="dark" className="p-8 text-center">
                <p className="text-gray-400 font-tactical tracking-wider">NO PLAYERS AVAILABLE</p>
                <p className="text-gray-500 text-xs mt-2 font-tactical">没有可上架拍卖的选手</p>
              </VCTCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auctionablePlayers.map(player => {
                  const style = roleStyles[player.position];
                  const alreadyInAuction = activeAuctions.some(a => a.playerId === player.id);
                  return (
                    <VCTCard key={player.id} className={`p-3 border-l-2 ${style.border}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 clip-corner-sm flex items-center justify-center text-white font-display font-bold text-xs" style={{ background: style.accent }}>
                            {player.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-display font-semibold text-sm">{player.chineseName}</p>
                            <p className="text-[10px] text-gray-500 font-tactical">{roleNames[player.position]} · {player.rating}</p>
                          </div>
                        </div>
                        <span className="text-valorant-gold font-display font-bold text-xs">{formatCurrency(player.marketValue)}</span>
                      </div>
                      <VCTButton
                        variant="secondary"
                        size="sm"
                        fullWidth
                        disabled={alreadyInAuction}
                        onClick={() => handleCreateAuction(player.id)}
                      >
                        {alreadyInAuction ? '已上架' : `发起拍卖 (${formatCurrency(Math.floor(player.marketValue * 0.6))})`}
                      </VCTButton>
                    </VCTCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* 右侧栏 */}
          <div className="space-y-4">
            {/* 我的出价 */}
            <VCTCard variant="highlight">
              <VCTCardContent className="p-4">
                <h3 className="vct-heading font-display text-base text-white mb-3">我的出价</h3>
                {myActiveBids.length === 0 ? (
                  <p className="text-gray-500 text-xs font-tactical text-center py-4">暂无领先出价</p>
                ) : (
                  <div className="space-y-2">
                    {myActiveBids.map(auction => (
                      <div key={auction.id} className="bg-valorant-dark/60 clip-corner-sm p-2 border-l-2 border-valorant-teal">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-xs font-display">{auction.player.chineseName}</span>
                          <span className="text-valorant-gold font-display font-bold text-xs">{formatCurrency(auction.currentBid)}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-tactical">剩余 {auction.weeksRemaining} 周</p>
                      </div>
                    ))}
                  </div>
                )}
              </VCTCardContent>
            </VCTCard>

            {/* 拍卖历史 */}
            <VCTCard variant="default">
              <VCTCardContent className="p-4">
                <h3 className="vct-heading font-display text-base text-white mb-3">拍卖历史</h3>
                {auctionHistory.length === 0 ? (
                  <p className="text-gray-500 text-xs font-tactical text-center py-4">暂无历史记录</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {auctionHistory.slice(0, 10).map(auction => (
                      <div key={auction.id} className="bg-valorant-dark/60 clip-corner-sm p-2 border-l-2 border-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-xs font-display">{auction.player.chineseName}</span>
                          <Badge variant={auction.status === 'won' ? 'success' : auction.status === 'lost' ? 'danger' : 'default'} size="sm">
                            {auction.status === 'won' ? '中标' : auction.status === 'lost' ? '失利' : '过期'}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-gray-500 font-tactical">成交价 {formatCurrency(auction.currentBid)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </VCTCardContent>
            </VCTCard>

            {/* 拍卖规则 */}
            <VCTCard variant="default">
              <VCTCardContent className="p-4">
                <h3 className="vct-heading font-display text-base text-white mb-3">拍卖规则</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-valorant-cyan">▸</span>
                    <p className="text-gray-400">起拍价为选手市场价的60%</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-valorant-gold">▸</span>
                    <p className="text-gray-400">每次加价至少5%或$5,000</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-valorant-red">▸</span>
                    <p className="text-gray-400">AI战队根据预算与需求智能出价</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-valorant-teal">▸</span>
                    <p className="text-gray-400">可使用一口价直接买断（市场价）</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-valorant-purple">▸</span>
                    <p className="text-gray-400">竞争程度反映该选手受追捧热度</p>
                  </div>
                </div>
              </VCTCardContent>
            </VCTCard>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 转会记录主区 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 转会费排行榜 */}
            <VCTCard variant="highlight">
              <VCTCardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="vct-heading font-display text-base text-white">转会费排行榜</h3>
                  <Badge variant="gold" size="sm">TOP 10</Badge>
                </div>
                {feeLeaderboard.length === 0 ? (
                  <p className="text-gray-500 text-xs font-tactical text-center py-4">暂无转会记录</p>
                ) : (
                  <div className="space-y-1.5">
                    {feeLeaderboard.map((record, idx) => (
                      <div key={record.id} className={`bg-valorant-dark/60 clip-corner-sm p-2 flex items-center gap-3 ${idx < 3 ? 'border-l-2 border-valorant-gold/60' : 'border-l-2 border-gray-700'}`}>
                        <span className={`font-display font-bold text-sm w-6 text-center ${idx < 3 ? 'text-valorant-gold' : 'text-gray-500'}`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-display font-semibold truncate">{record.playerName}</p>
                          <p className="text-[10px] text-gray-500 font-tactical">
                            {record.fromTeam || '自由市场'} → {record.toTeam}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-valorant-gold font-display font-bold text-xs">{formatCurrency(record.fee)}</p>
                          <p className="text-[10px] text-gray-500 font-tactical">S{record.season}·W{record.week} · {TRANSFER_TYPE_LABELS[record.type]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </VCTCardContent>
            </VCTCard>

            {/* 本赛季转会 */}
            <VCTCard variant="default">
              <VCTCardContent className="p-4">
                <h3 className="vct-heading font-display text-base text-white mb-3">本赛季转会</h3>
                {seasonTransfers.length === 0 ? (
                  <p className="text-gray-500 text-xs font-tactical text-center py-4">本赛季暂无转会记录</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {seasonTransfers.map(record => (
                      <TransferRecordRow key={record.id} record={record} />
                    ))}
                  </div>
                )}
              </VCTCardContent>
            </VCTCard>
          </div>

          {/* 右侧栏 */}
          <div className="space-y-4">
            {/* 转会统计 */}
            <VCTCard variant="default">
              <VCTCardContent className="p-4">
                <h3 className="vct-heading font-display text-base text-white mb-3">转会统计</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(TRANSFER_TYPE_LABELS) as (keyof typeof TRANSFER_TYPE_LABELS)[]).map(type => (
                    <div key={type} className="bg-valorant-dark/60 clip-corner-sm p-2 text-center">
                      <p className="text-[10px] text-gray-500 font-tactical">{TRANSFER_TYPE_LABELS[type]}</p>
                      <p className="text-valorant-cyan font-display font-bold text-lg">{transferStats[type] || 0}</p>
                    </div>
                  ))}
                </div>
              </VCTCardContent>
            </VCTCard>

            {/* 我的转会记录 */}
            <VCTCard variant="default">
              <VCTCardContent className="p-4">
                <h3 className="vct-heading font-display text-base text-white mb-3">我的转会</h3>
                {myTransfers.length === 0 ? (
                  <p className="text-gray-500 text-xs font-tactical text-center py-4">暂无记录</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {myTransfers.slice(0, 15).map(record => (
                      <TransferRecordRow key={record.id} record={record} compact />
                    ))}
                  </div>
                )}
              </VCTCardContent>
            </VCTCard>
          </div>
        </div>
      )}
    </div>
  );
};

// 转会记录行组件
const TransferRecordRow = ({ record, compact = false }: { record: TransferRecord; compact?: boolean }) => {
  const typeVariant = record.type === 'hire' || record.type === 'auction' || record.type === 'buyout'
    ? 'success'
    : record.type === 'release'
      ? 'danger'
      : record.type === 'loan'
        ? 'info'
        : 'warning';
  return (
    <div className="bg-valorant-dark/60 clip-corner-sm p-2 border-l-2 border-gray-600">
      <div className="flex items-center justify-between gap-2">
        <span className="text-white text-xs font-display truncate">{record.playerName}</span>
        <Badge variant={typeVariant as 'success' | 'danger' | 'info' | 'warning'} size="sm">
          {TRANSFER_TYPE_LABELS[record.type]}
        </Badge>
      </div>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-[10px] text-gray-500 font-tactical truncate">
          {record.fromTeam || '自由市场'} → {record.toTeam}
        </p>
        <p className="text-valorant-gold font-display font-bold text-[10px]">{formatCurrency(record.fee)}</p>
      </div>
      {!compact && record.details && (
        <p className="text-[10px] text-gray-600 font-tactical mt-0.5 truncate">{record.details}</p>
      )}
      <p className="text-[10px] text-gray-600 font-tactical">S{record.season} · 第{record.week}周</p>
    </div>
  );
};
