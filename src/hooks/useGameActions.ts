// 游戏逻辑hooks - 封装常用操作

import { useCallback, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  Player, AgentRole, Tournament,
  CONTRACT_OPTIONS, NATIONALITIES,
  type TransferWindow, type LoanDeal,
} from '@/types';

// 战队操作hooks
export function useTeamActions() {
  const { playerTeam, setTeamName, hirePlayer, releasePlayer, setTactic } = useGameStore();

  const canHirePlayer = useCallback((player: Player, contractYears: number = 2) => {
    const option = CONTRACT_OPTIONS.find(o => o.years === contractYears) || CONTRACT_OPTIONS[1];
    const signingFee = Math.floor(player.marketValue * option.signingFeeMultiplier);
    return (
      playerTeam.budget >= signingFee &&
      playerTeam.players.length < 7 &&
      player.teamId === null
    );
  }, [playerTeam.budget, playerTeam.players.length]);

  const canReleasePlayer = useCallback(() => {
    return playerTeam.players.length > 0;
  }, [playerTeam.players.length]);

  const getTeamRating = useMemo(() => {
    if (playerTeam.players.length === 0) return 0;
    const avg = playerTeam.players.reduce((sum, p) => sum + p.rating, 0) / playerTeam.players.length;
    return Math.round(avg);
  }, [playerTeam.players]);

  const getTotalSalary = useMemo(() => {
    return playerTeam.players.reduce((sum, p) => sum + p.salary, 0);
  }, [playerTeam.players]);

  const getRosterValue = useMemo(() => {
    return playerTeam.players.reduce((sum, p) => sum + p.marketValue, 0);
  }, [playerTeam.players]);

  // 计算指定合同年限的签约费
  const getSigningFee = useCallback((player: Player, contractYears: number = 2) => {
    const option = CONTRACT_OPTIONS.find(o => o.years === contractYears) || CONTRACT_OPTIONS[1];
    return Math.floor(player.marketValue * option.signingFeeMultiplier);
  }, []);

  // 计算解约违约金
  const getTerminationFee = useCallback((player: Player) => {
    return Math.floor(player.marketValue * 0.25 * Math.max(1, player.contractYears));
  }, []);

  return {
    playerTeam,
    setTeamName,
    hirePlayer,
    releasePlayer,
    setTactic,
    canHirePlayer,
    canReleasePlayer,
    getTeamRating,
    getTotalSalary,
    getRosterValue,
    getSigningFee,
    getTerminationFee,
    contractOptions: CONTRACT_OPTIONS,
  };
}

// 选手筛选hooks
export function usePlayerFilters() {
  const { allPlayers } = useGameStore();

  const filterByRole = useCallback((role: AgentRole | 'all') => {
    if (role === 'all') return allPlayers;
    return allPlayers.filter(p => p.position === role);
  }, [allPlayers]);

  const filterByRegion = useCallback((_region: string) => {
    // 根据战队所属区域筛选（这里简化处理）
    return allPlayers;
  }, [allPlayers]);

  // 按国籍筛选
  const filterByNationality = useCallback((nationality: string) => {
    if (nationality === '全部') return allPlayers;
    return allPlayers.filter(p => p.nationality === nationality);
  }, [allPlayers]);

  // 按价格区间筛选
  const filterByPriceRange = useCallback((min: number, max: number) => {
    return allPlayers.filter(p => p.marketValue >= min && p.marketValue <= max);
  }, [allPlayers]);

  const getFreeAgents = useMemo(() => {
    return allPlayers.filter(p => p.isFreeAgent && !p.isProspect);
  }, [allPlayers]);

  const getProspects = useMemo(() => {
    return allPlayers.filter(p => p.isProspect);
  }, [allPlayers]);

  const getPlayersByRating = useCallback((min: number, max: number) => {
    return allPlayers.filter(p => p.rating >= min && p.rating <= max);
  }, [allPlayers]);

  // 综合搜索：按名字、中文名、真实姓名、国籍匹配
  const searchPlayers = useCallback((query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return allPlayers;
    return allPlayers.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.chineseName.includes(q) ||
      p.realName.toLowerCase().includes(q) ||
      p.nationality.includes(q)
    );
  }, [allPlayers]);

  // 获取所有国籍列表（去重）
  const allNationalities = useMemo(() => {
    const set = new Set<string>();
    allPlayers.forEach(p => set.add(p.nationality));
    return ['全部', ...Array.from(set).sort()];
  }, [allPlayers]);

  return {
    allPlayers,
    filterByRole,
    filterByRegion,
    filterByNationality,
    filterByPriceRange,
    getFreeAgents,
    getProspects,
    getPlayersByRating,
    searchPlayers,
    allNationalities,
    nationalityOptions: NATIONALITIES,
  };
}

// 赛事操作hooks
export function useTournamentActions() {
  const { 
    availableTournaments, 
    completedTournaments, 
    joinTournament,
    simulateMatch,
    getOpponentTeams,
  } = useGameStore();

  const canJoinTournament = useCallback((tournament: Tournament) => {
    const { playerTeam } = useGameStore.getState();
    return (
      playerTeam.budget >= tournament.entryFee &&
      !completedTournaments.includes(tournament.id)
    );
  }, [completedTournaments]);

  const getAvailableTournaments = useMemo(() => {
    return availableTournaments.filter(t => !completedTournaments.includes(t.id));
  }, [availableTournaments, completedTournaments]);

  const getCompletedTournamentsList = useMemo(() => {
    return availableTournaments.filter(t => completedTournaments.includes(t.id));
  }, [availableTournaments, completedTournaments]);

  return {
    availableTournaments,
    completedTournaments,
    joinTournament,
    simulateMatch,
    getOpponentTeams,
    canJoinTournament,
    getAvailableTournaments,
    getCompletedTournamentsList,
  };
}

// 训练和设施hooks
export function useTrainingActions() {
  const { 
    playerTeam, 
    trainPlayer, 
    upgradeFacility,
    scoutPlayer,
  } = useGameStore();

  const canTrainPlayer = useCallback((playerId: string) => {
    const player = playerTeam.players.find(p => p.id === playerId);
    if (!player) return false;
    return player.fitness >= 50 && playerTeam.budget >= 10000;
  }, [playerTeam]);

  const canUpgradeFacility = useCallback((facilityId: string) => {
    const facility = playerTeam.facilities.find(f => f.id === facilityId);
    if (!facility || facility.level >= facility.maxLevel) return false;
    const cost = Math.floor(facility.upgradeCost * Math.pow(1.5, facility.level - 1));
    return playerTeam.budget >= cost;
  }, [playerTeam]);

  const getTrainingCost = useCallback(() => 10000, []);

  const getUpgradeCost = useCallback((facilityId: string) => {
    const facility = playerTeam.facilities.find(f => f.id === facilityId);
    if (!facility) return 0;
    return Math.floor(facility.upgradeCost * Math.pow(1.5, facility.level - 1));
  }, [playerTeam.facilities]);

  return {
    trainPlayer,
    upgradeFacility,
    scoutPlayer,
    canTrainPlayer,
    canUpgradeFacility,
    getTrainingCost,
    getUpgradeCost,
  };
}

// 赛季和时间hooks
export function useSeasonActions() {
  const { 
    currentWeek, 
    currentSeason, 
    gamePhase,
    advanceWeek,
    advanceSeason,
    matchHistory,
    newsHistory,
    vctStandings,
    seasonRecords,
  } = useGameStore();

  const getPhaseLabel = useMemo(() => {
    const phases: Record<string, string> = {
      preseason: '季前赛',
      regular: '常规赛季',
      playoffs: '季后赛',
      offseason: '休赛期',
    };
    return phases[gamePhase] || gamePhase;
  }, [gamePhase]);

  const getRecentMatches = useCallback((count: number = 5) => {
    return matchHistory.slice(0, count);
  }, [matchHistory]);

  const getRecentNews = useCallback((count: number = 10) => {
    return newsHistory.slice(0, count);
  }, [newsHistory]);

  const getTeamStanding = useMemo(() => {
    return vctStandings.find(s => s.teamId === 'my-team');
  }, [vctStandings]);

  return {
    currentWeek,
    currentSeason,
    gamePhase,
    advanceWeek,
    advanceSeason,
    getPhaseLabel,
    getRecentMatches,
    getRecentNews,
    getTeamStanding,
    matchHistory,
    newsHistory,
    vctStandings,
    seasonRecords,
  };
}

// 财务hooks
export function useFinanceActions() {
  const { playerTeam, addSponsor, signSponsorContract, runBusinessEvent } = useGameStore();

  const getWeeklyNet = useMemo(() => {
    return playerTeam.weeklyRevenue - playerTeam.weeklyExpense;
  }, [playerTeam.weeklyRevenue, playerTeam.weeklyExpense]);

  const canAddSponsor = useCallback(() => {
    return playerTeam.sponsors.length < 5;
  }, [playerTeam.sponsors.length]);

  const sponsorContracts = playerTeam.sponsorContracts;
  const businessEvents = playerTeam.businessEvents;
  const fanBase = playerTeam.fanBase;
  const reputation = playerTeam.reputation;

  return {
    budget: playerTeam.budget,
    weeklyRevenue: playerTeam.weeklyRevenue,
    weeklyExpense: playerTeam.weeklyExpense,
    sponsors: playerTeam.sponsors,
    sponsorContracts,
    businessEvents,
    fanBase,
    reputation,
    getWeeklyNet,
    addSponsor,
    signSponsorContract,
    runBusinessEvent,
    canAddSponsor,
  };
}

// 转会拍卖hooks
export function useAuctionActions() {
  const {
    activeAuctions,
    auctionHistory,
    allPlayers,
    createAuction,
    placeBid,
    buyoutAuction,
    playerTeam,
  } = useGameStore();

  const getAuctionablePlayers = useMemo(() => {
    return allPlayers.filter(p => p.teamId === null && !p.isProspect);
  }, [allPlayers]);

  const myActiveBids = useMemo(() => {
    return activeAuctions.filter(a => a.currentBidder === 'player');
  }, [activeAuctions]);

  const canCreateAuction = useCallback((player: Player) => {
    return player.teamId === null && !activeAuctions.some(a => a.playerId === player.id && a.status === 'active');
  }, [activeAuctions]);

  const getMinBid = useCallback((auctionId: string) => {
    const auction = activeAuctions.find(a => a.id === auctionId);
    if (!auction) return 0;
    return auction.currentBid + Math.max(5000, Math.floor(auction.currentBid * 0.05));
  }, [activeAuctions]);

  // 是否可以一口价买断
  const canBuyout = useCallback((auctionId: string) => {
    const auction = activeAuctions.find(a => a.id === auctionId);
    if (!auction || auction.status !== 'active') return false;
    return playerTeam.budget >= auction.buyoutPrice && playerTeam.players.length < 7;
  }, [activeAuctions, playerTeam.budget, playerTeam.players.length]);

  // 竞争程度文本
  const getCompetitionLabel = useCallback((level: 'low' | 'medium' | 'high') => {
    return level === 'high' ? '激烈' : level === 'medium' ? '中等' : '温和';
  }, []);

  return {
    activeAuctions,
    auctionHistory,
    getAuctionablePlayers,
    myActiveBids,
    playerTeam,
    createAuction,
    placeBid,
    buyoutAuction,
    canCreateAuction,
    canBuyout,
    getMinBid,
    getCompetitionLabel,
  };
}

// 青训与选秀hooks
export function useYouthActions() {
  const {
    youthPlayers,
    draftClass,
    playerTeam,
    recruitYouth,
    trainYouth,
    promoteYouth,
    upgradeYouthAcademy,
    generateDraftClass,
    draftPlayer,
  } = useGameStore();

  const recruitCost = 15000 * playerTeam.youthAcademyLevel;
  const canRecruit = playerTeam.budget >= recruitCost && youthPlayers.length < 6;
  const canUpgradeAcademy = playerTeam.youthAcademyLevel < 5 && playerTeam.budget >= 100000 * playerTeam.youthAcademyLevel;

  const myDraftPicks = useMemo(() => {
    return draftClass?.picks.filter(p => p.teamId === 'my-team') || [];
  }, [draftClass]);

  const availableDraftProspects = useMemo(() => {
    return draftClass?.prospects.filter(p => !draftClass.picks.some(pk => pk.selectedPlayerId === p.id)) || [];
  }, [draftClass]);

  return {
    youthPlayers,
    draftClass,
    playerTeam,
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
  };
}

// 赛前情报hooks
export function useScoutReportActions() {
  const { scoutReports, availableTeams, scoutOpponent } = useGameStore();

  const getReportForTeam = useCallback((teamId: string) => {
    return scoutReports.find(r => r.teamId === teamId);
  }, [scoutReports]);

  return {
    scoutReports,
    availableTeams,
    scoutOpponent,
    getReportForTeam,
  };
}

// 转会窗hooks
export function useTransferWindow() {
  const { currentWeek, getTransferWindow, isTransferWindowOpen } = useGameStore();

  const window = useMemo<TransferWindow>(() => getTransferWindow(), [getTransferWindow, currentWeek]);
  const isOpen = useMemo(() => isTransferWindowOpen(), [isTransferWindowOpen, currentWeek]);

  // 状态徽章变体
  const statusVariant = useMemo<'success' | 'warning' | 'default'>(() => {
    if (window.status === 'open') return 'success';
    if (window.status === 'opening_soon') return 'warning';
    return 'default';
  }, [window.status]);

  // 状态文本
  const statusLabel = useMemo(() => {
    if (window.status === 'open') return '开放中';
    if (window.status === 'opening_soon') return `${window.weeksUntilOpen}周后开放`;
    return `关闭中（${window.weeksUntilOpen}周后开放）`;
  }, [window]);

  return {
    currentWeek,
    transferWindow: window,
    isOpen,
    statusVariant,
    statusLabel,
  };
}

// 转会历史与排行榜hooks
export function useTransferHistory() {
  const { transferHistory, currentSeason } = useGameStore();

  // 当前赛季转会记录
  const seasonTransfers = useMemo(() => {
    return transferHistory.filter(t => t.season === currentSeason);
  }, [transferHistory, currentSeason]);

  // 转会费排行榜（按费用降序）
  const feeLeaderboard = useMemo(() => {
    return [...transferHistory].sort((a, b) => b.fee - a.fee).slice(0, 10);
  }, [transferHistory]);

  // 我的战队转会记录
  const myTransfers = useMemo(() => {
    return transferHistory.filter(t =>
      t.toTeam === '我的战队' ||
      t.fromTeam === '我的战队' ||
      t.fromTeam === null
    );
  }, [transferHistory]);

  // 按类型分组统计
  const transferStats = useMemo(() => {
    const stats: Record<string, number> = {
      hire: 0, release: 0, trade: 0, loan: 0, auction: 0, buyout: 0,
    };
    transferHistory.forEach(t => {
      stats[t.type] = (stats[t.type] || 0) + 1;
    });
    return stats;
  }, [transferHistory]);

  return {
    transferHistory,
    seasonTransfers,
    feeLeaderboard,
    myTransfers,
    transferStats,
    currentSeason,
  };
}

// 转会操作hooks（交易、租借、推荐）
export function useTransferActions() {
  const {
    playerTeam, allPlayers, availableTeams,
    tradePlayer, loanPlayer, hirePlayer,
    getTransferRecommendations, getTransferWindow,
  } = useGameStore();

  const transferWindow = getTransferWindow();

  // 可交易的我方选手（非租借）
  const myTradablePlayers = useMemo(() => {
    return playerTeam.players;
  }, [playerTeam.players]);

  // 可交易的目标选手（其他战队选手）
  const tradableTargets = useMemo(() => {
    return allPlayers.filter(p =>
      p.teamId !== null &&
      p.teamId !== 'my-team' &&
      !p.isFreeAgent
    );
  }, [allPlayers]);

  // 可租借的选手（其他战队选手）
  const loanablePlayers = useMemo(() => {
    return allPlayers.filter(p =>
      p.teamId !== null &&
      p.teamId !== 'my-team' &&
      !p.isFreeAgent
    );
  }, [allPlayers]);

  // 推荐选手
  const recommendations = useMemo(() => {
    return getTransferRecommendations();
  }, [getTransferRecommendations, playerTeam.players]);

  // 计算交易补差价
  const computeTradeDiff = useCallback((myPlayerId: string, targetPlayerId: string) => {
    const myPlayer = playerTeam.players.find(p => p.id === myPlayerId);
    const targetPlayer = allPlayers.find(p => p.id === targetPlayerId);
    if (!myPlayer || !targetPlayer) return 0;
    return Math.max(0, targetPlayer.marketValue - myPlayer.marketValue);
  }, [playerTeam.players, allPlayers]);

  // 计算租借费用
  const computeLoanFee = useCallback((playerId: string, weeks: number) => {
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return { weekly: 0, total: 0 };
    const loanWeeks = Math.max(2, Math.min(8, weeks));
    const weekly = Math.floor(player.salary / 4 * 0.5);
    return { weekly, total: weekly * loanWeeks };
  }, [allPlayers]);

  return {
    playerTeam,
    availableTeams,
    transferWindow,
    myTradablePlayers,
    tradableTargets,
    loanablePlayers,
    recommendations,
    tradePlayer,
    loanPlayer,
    hirePlayer,
    computeTradeDiff,
    computeLoanFee,
  };
}

// 选手对比hooks
export function usePlayerComparison() {
  const { allPlayers, playerTeam } = useGameStore();

  // 对比最多3名选手的属性
  const comparePlayers = useCallback((playerIds: string[]) => {
    const players = playerIds
      .map(id => allPlayers.find(p => p.id === id))
      .filter((p): p is Player => !!p)
      .slice(0, 3);
    return players;
  }, [allPlayers]);

  // 找出每项属性的最佳值
  const getBestAttributes = useCallback((players: Player[]) => {
    const attrKeys = ['aim', 'gameSense', 'teamwork', 'utility', 'clutch', 'entry', 'support', 'composure', 'leadership', 'consistency'] as const;
    const best: Record<string, number> = {};
    attrKeys.forEach(key => {
      best[key] = Math.max(...players.map(p => p.attributes[key]));
    });
    return best;
  }, []);

  // 综合评分
  const getOverallScore = useCallback((player: Player) => {
    const attrs = player.attributes;
    return Math.round(
      (attrs.aim + attrs.gameSense + attrs.teamwork + attrs.utility +
       attrs.clutch + attrs.entry + attrs.support + attrs.composure +
       attrs.leadership + attrs.consistency) / 10
    );
  }, []);

  return {
    allPlayers,
    playerTeam,
    comparePlayers,
    getBestAttributes,
    getOverallScore,
  };
}

// 租借管理hooks
export function useLoanActions() {
  const { activeLoans, playerTeam } = useGameStore();

  // 我方租借在外的选手（理论上 toTeamId === my-team 表示租入）
  const myActiveLoans = useMemo<LoanDeal[]>(() => {
    return activeLoans.filter(l => l.toTeamId === playerTeam.id);
  }, [activeLoans, playerTeam.id]);

  // 即将到期的租借（剩余1-2周）
  const expiringLoans = useMemo(() => {
    return myActiveLoans.filter(l => l.remainingWeeks <= 2);
  }, [myActiveLoans]);

  return {
    activeLoans,
    myActiveLoans,
    expiringLoans,
  };
}

// 化学反应hooks
export function useChemistryActions() {
  const { playerTeam, getPlayerChemistry, getChemistryMatrix } = useGameStore();

  const chemistryMatrix = useMemo(() => getChemistryMatrix(), [getChemistryMatrix, playerTeam.players]);

  const avgChemistry = useMemo(() => {
    if (chemistryMatrix.length === 0) return 0;
    const sum = chemistryMatrix.reduce((acc, p) => acc + p.value, 0);
    return Math.round(sum / chemistryMatrix.length);
  }, [chemistryMatrix]);

  // 最默契的组合
  const topPairs = useMemo(() => {
    return [...chemistryMatrix].sort((a, b) => b.value - a.value).slice(0, 3);
  }, [chemistryMatrix]);

  return {
    chemistryMatrix,
    avgChemistry,
    topPairs,
    getPlayerChemistry,
  };
}

// 博彩hooks
export function useBettingActions() {
  const {
    pendingBet, bets, betsThisWeek, totalBetsWon, totalBetsPlaced,
    placeBet, getMatchPrediction, playerTeam,
  } = useGameStore();

  const canBet = useMemo(() => {
    return betsThisWeek < 3 && !pendingBet && playerTeam.budget > 0;
  }, [betsThisWeek, pendingBet, playerTeam.budget]);

  const winRate = useMemo(() => {
    if (totalBetsPlaced === 0) return 0;
    return Math.round((totalBetsWon / totalBetsPlaced) * 100);
  }, [totalBetsWon, totalBetsPlaced]);

  return {
    pendingBet,
    bets,
    betsThisWeek,
    totalBetsWon,
    totalBetsPlaced,
    canBet,
    winRate,
    placeBet,
    getMatchPrediction,
  };
}

// 成就hooks
export function useAchievementActions() {
  const { achievements, checkAchievements } = useGameStore();

  const unlocked = useMemo(() => achievements.filter(a => a.unlocked), [achievements]);
  const locked = useMemo(() => achievements.filter(a => !a.unlocked), [achievements]);

  const recentUnlocked = useMemo(() => {
    return [...unlocked]
      .sort((a, b) => (b.unlockedWeek || 0) - (a.unlockedWeek || 0))
      .slice(0, 5);
  }, [unlocked]);

  const progress = useMemo(() => {
    if (achievements.length === 0) return 0;
    return Math.round((unlocked.length / achievements.length) * 100);
  }, [unlocked.length, achievements.length]);

  // 按类别分组
  const byCategory = useMemo(() => {
    const groups: Record<string, typeof achievements> = {};
    achievements.forEach(a => {
      if (!groups[a.category]) groups[a.category] = [];
      groups[a.category].push(a);
    });
    return groups;
  }, [achievements]);

  return {
    achievements,
    unlocked,
    locked,
    recentUnlocked,
    progress,
    byCategory,
    checkAchievements,
  };
}

// 每周挑战hooks
export function useChallengeActions() {
  const { weeklyChallenges, claimChallenge, generateWeeklyChallenges, currentWeek } = useGameStore();

  const completed = useMemo(() => weeklyChallenges.filter(c => c.completed), [weeklyChallenges]);
  const unclaimed = useMemo(() => weeklyChallenges.filter(c => c.completed && !c.claimed), [weeklyChallenges]);
  const inProgress = useMemo(() => weeklyChallenges.filter(c => !c.completed), [weeklyChallenges]);

  const totalReward = useMemo(() => {
    const cash = weeklyChallenges.reduce((sum, c) => sum + (c.reward.cash || 0), 0);
    const rep = weeklyChallenges.reduce((sum, c) => sum + (c.reward.reputation || 0), 0);
    const fans = weeklyChallenges.reduce((sum, c) => sum + (c.reward.fans || 0), 0);
    return { cash, rep, fans };
  }, [weeklyChallenges]);

  return {
    weeklyChallenges,
    completed,
    unclaimed,
    inProgress,
    totalReward,
    currentWeek,
    claimChallenge,
    generateWeeklyChallenges,
  };
}

// 退役与传承hooks
export function useRetirementActions() {
  const {
    retiredPlayers, coaches, playerTeam,
    retirePlayer, convertToCoach, restPlayer,
  } = useGameStore();

  // 可退役的选手（28岁以上）
  const retireablePlayers = useMemo(() => {
    return playerTeam.players.filter(p => p.age >= 28);
  }, [playerTeam.players]);

  // 还未成为教练的退役选手
  const availableForCoach = useMemo(() => {
    return retiredPlayers.filter(r => !r.isCoach);
  }, [retiredPlayers]);

  return {
    retiredPlayers,
    coaches,
    retireablePlayers,
    availableForCoach,
    retirePlayer,
    convertToCoach,
    restPlayer,
  };
}