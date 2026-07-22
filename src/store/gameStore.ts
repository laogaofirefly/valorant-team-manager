// 重构后的游戏状态管理 - 使用模块化设计

import { create } from 'zustand';
import {
  PLAYER_POSITIONS,
  CONTRACT_OPTIONS, TRANSFER_WINDOW_OPEN_WEEKS,
  MOOD_LEVELS,
  type Player, type Tournament, type GameMap, type Tactic,
  type MatchResult, type NewsItem, type SeasonRecord, type VCTStanding,
  type GamePhase, type PlayerTeam, type Team, type AgentRole,
  type AuctionItem, type YouthPlayer, type DraftClass, type DraftPick, type ScoutReport,
  type SponsorContract, type BusinessEvent,
  type TutorialState, type StoryState, type DetailedMatchState, type BPPhase, type MapResult,
  type TransferRecord, type TransferWindow, type LoanDeal, type TransferType,
  type PlayerMood, type ChemistryPair, type Bet, type MatchPrediction,
  type Achievement, type Challenge, type ChallengeType,
  type RetiredPlayer, type Coach
} from '@/types';
import { realPlayers, prospects } from '@/data/players';
import { tournaments } from '@/data/tournaments';
import { maps as gameMaps } from '@/data/maps';
import { realTeams, getTeamById } from '@/data/teams';
import { tactics } from '@/data/tactics';
import { initialFacilities } from '@/data/facilities';
import { storyChapters, storyDialogs, tutorialSteps } from '@/data/story';

// ===== 常量配置 =====
const SCOUT_COST = 30000;
const TRAINING_COST = 10000;
const MATCH_PRIZE = 25000;

const sponsorPool = [
  { name: 'Secretlab', bonus: 30000 },
  { name: 'Red Bull', bonus: 50000 },
  { name: 'Logitech G', bonus: 35000 },
  { name: 'HyperX', bonus: 25000 },
  { name: 'ASUS ROG', bonus: 40000 },
  { name: 'Razer', bonus: 35000 },
  { name: 'Nike', bonus: 60000 },
  { name: 'Mercedes-Benz', bonus: 80000 },
];

const randomEvents = [
  { type: 'event' as const, title: '战队士气高涨', effect: 'morale' },
  { type: 'injury' as const, title: '选手手腕不适', effect: 'fitness' },
  { type: 'milestone' as const, title: '训练突破', effect: 'rating' },
];

// ===== 成就定义 =====
const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked' | 'unlockedWeek'>[] = [
  { id: 'first_win', name: '首胜里程碑', description: '赢得第一场比赛', icon: '🎯', category: 'match', reward: { cash: 50000 } },
  { id: 'ten_wins', name: '十胜达成', description: '累计赢得10场比赛', icon: '🏆', category: 'match', reward: { cash: 100000 } },
  { id: 'fifty_wins', name: '五十胜达成', description: '累计赢得50场比赛', icon: '🏅', category: 'match', reward: { cash: 300000, reputation: 10 } },
  { id: 'first_championship', name: '首个冠军', description: '赢得第一个赛事冠军', icon: '🥇', category: 'match', reward: { cash: 200000, fans: 5000 } },
  { id: 'five_championships', name: '五冠王', description: '累计赢得5个赛事冠军', icon: '👑', category: 'match', reward: { cash: 500000, reputation: 15, fans: 20000 } },
  { id: 'win_streak_5', name: '五连胜', description: '连续赢得5场比赛', icon: '🔥', category: 'match', reward: { cash: 80000 } },
  { id: 'win_streak_10', name: '十连胜', description: '连续赢得10场比赛', icon: '⚡', category: 'match', reward: { cash: 200000, reputation: 10 } },
  { id: 'sign_star', name: '签约球星', description: '签下评级≥85的选手', icon: '⭐', category: 'transfer', reward: { cash: 100000, fans: 3000 } },
  { id: 'sign_superstar', name: '签约巨星', description: '签下评级≥90的选手', icon: '💎', category: 'transfer', reward: { cash: 250000, reputation: 5, fans: 10000 } },
  { id: 'rich_club', name: '富甲一方', description: '预算达到$5,000,000', icon: '💰', category: 'finance', reward: { reputation: 5 } },
  { id: 'fan_favorite', name: '万千宠爱', description: '粉丝数达到100,000', icon: '❤️', category: 'finance', reward: { cash: 100000 } },
  { id: 'top_rank', name: '世界第一', description: '战队排名达到#1', icon: '🌟', category: 'special', reward: { cash: 500000, reputation: 20, fans: 50000 } },
  { id: 'youth_promotion', name: '青训之光', description: '从青训营提拔一名选手', icon: '🌱', category: 'training', reward: { cash: 50000 } },
  { id: 'chemistry_master', name: '化学大师', description: '团队化学反应达到90', icon: '🧪', category: 'special', reward: { cash: 100000, reputation: 5 } },
  { id: 'training_dedicated', name: '训练狂人', description: '累计训练50次', icon: '📚', category: 'training', reward: { cash: 80000 } },
  { id: 'scout_expert', name: '球探专家', description: '累计球探10次', icon: '🔍', category: 'training', reward: { cash: 60000 } },
  { id: 'sponsor_magnet', name: '赞助商宠儿', description: '同时拥有5个赞助合同', icon: '🤝', category: 'finance', reward: { cash: 150000 } },
  { id: 'bet_master', name: '博彩高手', description: '累计赢得5次博彩', icon: '🎲', category: 'special', reward: { cash: 100000 } },
  { id: 'bet_addict', name: '博彩达人', description: '累计下注10次', icon: '🎰', category: 'special', reward: { cash: 50000 } },
  { id: 'veteran', name: '老兵不死', description: '阵容中拥有33岁以上的选手', icon: '🎖️', category: 'special', reward: { cash: 30000, reputation: 3 } },
  { id: 'retire_to_coach', name: '传承之路', description: '将退役选手转化为教练', icon: '📋', category: 'special', reward: { cash: 50000, reputation: 5 } },
  { id: 'season_3', name: '三朝元老', description: '进入第3个赛季', icon: '📅', category: 'special', reward: { cash: 100000, fans: 5000 } },
  { id: 'high_reputation', name: '名声显赫', description: '战队声望达到90', icon: '📢', category: 'finance', reward: { cash: 200000 } },
  { id: 'perfect_team', name: '完美阵容', description: '7名选手评级全部≥80', icon: '✨', category: 'transfer', reward: { cash: 300000, reputation: 10, fans: 15000 } },
];

// ===== 每周挑战模板 =====
const CHALLENGE_TEMPLATES: { type: ChallengeType; desc: (target: number) => string; targets: number[]; reward: (target: number) => { cash?: number; reputation?: number; fans?: number } }[] = [
  {
    type: 'win_matches',
    desc: (t) => `本周赢得${t}场比赛`,
    targets: [2, 3, 4],
    reward: (t) => ({ cash: t * 30000 }),
  },
  {
    type: 'train_players',
    desc: (t) => `本周完成${t}次训练`,
    targets: [3, 4, 5],
    reward: (t) => ({ cash: t * 15000 }),
  },
  {
    type: 'sign_players',
    desc: (t) => `本周签约${t}名选手`,
    targets: [1, 2],
    reward: (t) => ({ cash: t * 40000, reputation: 2 }),
  },
  {
    type: 'scout_players',
    desc: (t) => `本周球探${t}次`,
    targets: [1, 2, 3],
    reward: (t) => ({ cash: t * 20000 }),
  },
  {
    type: 'earn_money',
    desc: (t) => `本周比赛收入$${t.toLocaleString()}`,
    targets: [50000, 100000, 150000],
    reward: (t) => ({ cash: Math.floor(t * 0.3) }),
  },
  {
    type: 'play_matches',
    desc: (t) => `本周参加${t}场比赛`,
    targets: [3, 4, 5],
    reward: (t) => ({ cash: t * 15000, fans: 500 }),
  },
];

// 生成每周挑战
const generateChallenges = (week: number): Challenge[] => {
  const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 3);
  return shuffled.map((template) => {
    const target = template.targets[Math.floor(Math.random() * template.targets.length)];
    return {
      id: `challenge-${week}-${generateId()}`,
      type: template.type,
      description: template.desc(target),
      target,
      progress: 0,
      reward: template.reward(target),
      completed: false,
      claimed: false,
      week,
    };
  });
};

// 初始化成就列表
const initialAchievements = (): Achievement[] =>
  ACHIEVEMENT_DEFS.map((def) => ({ ...def, unlocked: false }));

// ===== 工具函数 =====
const generateId = () => Math.random().toString(36).substring(2, 9);

// ===== 转会窗工具函数 =====
// 判断指定周是否处于转会窗开放期
const isTransferWindowOpenAt = (week: number): boolean =>
  TRANSFER_WINDOW_OPEN_WEEKS.includes(week);

// 计算当前转会窗状态
const computeTransferWindow = (week: number): TransferWindow => {
  if (isTransferWindowOpenAt(week)) {
    const label = week >= 17 ? '休赛期转会窗' : '赛季中段转会窗';
    return { status: 'open', label, weeksUntilOpen: 0 };
  }
  // 找下一个开放周
  const upcoming = TRANSFER_WINDOW_OPEN_WEEKS
    .filter(w => w > week)
    .sort((a, b) => a - b)[0];
  if (upcoming === undefined) {
    // 没有更大的开放周，循环回赛季开头（取最小开放周+赛季长度估算）
    const next = (TRANSFER_WINDOW_OPEN_WEEKS.slice().sort((a, b) => a - b)[0] || 7);
    const weeksUntil = next + (24 - week); // 估算下赛季
    return { status: 'closed', label: '转会窗关闭', weeksUntilOpen: weeksUntil };
  }
  const weeksUntil = upcoming - week;
  return {
    status: weeksUntil <= 2 ? 'opening_soon' : 'closed',
    label: weeksUntil <= 2 ? '转会窗即将开放' : '转会窗关闭',
    weeksUntilOpen: weeksUntil,
  };
};

// 计算签约费：根据合同年限与市场价
const computeSigningFee = (marketValue: number, contractYears: number): number => {
  const option = CONTRACT_OPTIONS.find(o => o.years === contractYears) || CONTRACT_OPTIONS[1];
  return Math.floor(marketValue * option.signingFeeMultiplier);
};

// 计算解约违约金：剩余合同年限越多，违约金越高
const computeTerminationFee = (marketValue: number, contractYears: number): number => {
  // 剩余年限 * 市场价 * 0.25，最低保留一定额度
  return Math.floor(marketValue * 0.25 * Math.max(1, contractYears));
};

// 评估拍卖竞争程度（基于选手评级）
const evaluateCompetition = (rating: number): AuctionItem['competitionLevel'] => {
  if (rating >= 90) return 'high';
  if (rating >= 84) return 'medium';
  return 'low';
};

// 计算AI战队对选手的需求强度（0~1）
const computeAiInterest = (aiTeam: Team, player: Player): number => {
  // 战队评级越低，对高评级选手需求越高
  const ratingGap = player.rating - aiTeam.overallRating;
  // 选手评级高于战队且战队能负担得起时兴趣大
  if (ratingGap <= 0) return 0.05;
  // 基础兴趣值
  let interest = Math.min(0.85, 0.15 + ratingGap * 0.06);
  // 评级非常高的选手更受追捧
  if (player.rating >= 92) interest += 0.15;
  return Math.min(0.95, interest);
};

// 模拟AI战队预算（基于战队评级）
const computeAiBudget = (aiTeam: Team): number => {
  // 高评级战队预算更多
  return 800000 + aiTeam.overallRating * 12000;
};

// 添加转会记录的工具函数
const createTransferRecord = (
  week: number,
  season: number,
  type: TransferType,
  player: Player,
  fromTeam: string | null,
  toTeam: string,
  fee: number,
  extra?: { contractYears?: number; loanWeeks?: number; details?: string }
): TransferRecord => ({
  id: generateId(),
  week,
  season,
  type,
  playerName: player.chineseName,
  playerId: player.id,
  fromTeam,
  toTeam,
  fee,
  contractYears: extra?.contractYears,
  loanWeeks: extra?.loanWeeks,
  details: extra?.details,
});

const getInitialPlayers = (): Player[] => {
  const starterIds = ['tenz', 'sacy', 'koosta', 'shroud', 'scream'];
  const starters = realPlayers.filter(p => starterIds.includes(p.id));
  const updated = starters.map(p => ({
    ...p,
    teamId: 'my-team' as string | null,
    isFreeAgent: false,
    mood: 'calm' as PlayerMood,
    hotStreak: 0,
    weeksWithTeam: 12,
  }));
  return updated;
};

const createInitialTeam = (defaultTactic: Tactic): PlayerTeam => {
  const initialPlayers = getInitialPlayers();
  const totalSalary = initialPlayers.reduce((sum, p) => sum + Math.floor(p.salary / 4), 0);
  return {
    id: 'my-team',
    name: '我的战队',
    players: initialPlayers,
    coach: '暂无教练',
    budget: 1500000,
  sponsors: [],
  ranking: 100,
  wins: 0,
  losses: 0,
  draws: 0,
  chemistry: 50,
  selectedTactic: defaultTactic,
  facilities: [...initialFacilities],
  vctPoints: 0,
  seasonWins: 0,
  seasonLosses: 0,
  seasonPrize: 0,
  weeklyRevenue: 0,
    weeklyExpense: totalSalary,
    fanBase: 10000,
    reputation: 50,
    youthAcademyLevel: 1,
    sponsorContracts: [],
    businessEvents: [],
  };
};

// ===== 比赛模拟逻辑 =====
const simulateMatchLogic = (
  teamStrength: number,
  opponentStrength: number,
  chemistry: number,
  tacticBonus: number
): { teamScore: number; opponentScore: number; result: 'win' | 'loss' | 'draw' } => {
  const teamPower = teamStrength + tacticBonus + (chemistry - 50) * 0.1;
  
  // 12回合进攻模拟
  let teamAttackWins = 0;
  let opponentAttackWins = 0;
  
  for (let i = 0; i < 12; i++) {
    const teamWinChance = teamPower / (teamPower + opponentStrength);
    if (Math.random() < teamWinChance) teamAttackWins++;
    const oppWinChance = opponentStrength / (teamPower + opponentStrength);
    if (Math.random() < oppWinChance) opponentAttackWins++;
  }
  
  let teamScore = Math.min(13, teamAttackWins + Math.floor(Math.random() * 2));
  let opponentScore = Math.min(13, opponentAttackWins + Math.floor(Math.random() * 2));
  
  // 加时赛
  if (teamScore === opponentScore && teamScore >= 12) {
    teamScore = Math.random() < teamPower / (teamPower + opponentStrength) ? 14 : 13;
    opponentScore = teamScore === 14 ? 13 : 14;
  }
  
  const result = teamScore > opponentScore ? 'win' : teamScore < opponentScore ? 'loss' : 'draw';
  return { teamScore, opponentScore, result };
};

// ===== 状态接口 =====
interface GameState {
  // 核心状态
  playerTeam: PlayerTeam;
  allPlayers: Player[];
  availableTournaments: Tournament[];
  availableMaps: GameMap[];
  availableTeams: Team[];
  availableTactics: Tactic[];
  
  // 时间状态
  currentWeek: number;
  currentSeason: number;
  gamePhase: GamePhase;
  
  // 选择状态
  selectedPlayer: Player | null;
  selectedTournament: Tournament | null;
  
  // 记录状态
  matchHistory: MatchResult[];
  teamRoster: Player[];
  notifications: string[];
  newsHistory: NewsItem[];
  seasonRecords: SeasonRecord[];
  vctStandings: VCTStanding[];
  completedTournaments: string[];

  // 新玩法状态
  activeAuctions: AuctionItem[];
  auctionHistory: AuctionItem[];
  youthPlayers: YouthPlayer[];
  draftClass: DraftClass | null;
  scoutReports: ScoutReport[];

  // 教程状态
  tutorial: TutorialState;
  
  // 剧情状态
  story: StoryState;
  
  // 当前比赛状态
  currentMatch: DetailedMatchState | null;

  // 已报名赛事
  registeredTournaments: string[];

  // 转会系统扩展
  transferHistory: TransferRecord[];   // 转会历史记录
  activeLoans: LoanDeal[];             // 进行中的租借合同

  // 新增：化学反应、心理、博彩、成就、挑战、退役系统
  bets: Bet[];
  pendingBet: Bet | null;
  betsThisWeek: number;
  totalBetsWon: number;
  totalBetsPlaced: number;
  achievements: Achievement[];
  weeklyChallenges: Challenge[];
  retiredPlayers: RetiredPlayer[];
  coaches: Coach[];
  totalTrainings: number;
  totalScouts: number;
  currentWinStreak: number;
  maxWinStreak: number;
  weeklyTrainings: number;
  weeklySignings: number;
  weeklyScouts: number;
  weeklyMatchesPlayed: number;
  weeklyMatchesWon: number;
  weeklyEarnings: number;

  // 战队操作
  setTeamName: (name: string) => void;
  hirePlayer: (playerId: string, contractYears?: number) => void;
  releasePlayer: (playerId: string) => void;
  setBudget: (amount: number) => void;

  // 转会窗与高级转会
  getTransferWindow: () => TransferWindow;
  isTransferWindowOpen: () => boolean;
  tradePlayer: (myPlayerId: string, targetPlayerId: string, additionalMoney: number) => void;
  loanPlayer: (playerId: string, weeks: number) => void;
  getTransferRecommendations: () => Player[];
  addTransferRecord: (record: TransferRecord) => void;

  // 时间操作
  advanceWeek: () => void;
  advanceSeason: () => void;

  // 选择操作
  selectPlayer: (player: Player | null) => void;
  selectTournament: (tournament: Tournament | null) => void;
  setTactic: (tactic: Tactic) => void;

  // 比赛操作
  simulateMatch: (opponentTeam: Team, tactic?: Tactic) => MatchResult;
  joinTournament: (tournamentId: string) => void;
  startTournamentMatch: (tournamentId: string, opponentId: string) => void;
  startBP: (tournament: Tournament, opponent: Team) => void;
  playerBanMap: (mapId: string) => void;
  playerPickMap: (mapId: string) => void;
  simulateCurrentMatch: () => void;
  closeCurrentMatch: () => void;

  // 训练操作
  trainPlayer: (playerId: string, attribute?: string) => void;
  upgradeFacility: (facilityId: string) => void;
  scoutPlayer: () => Player | null;
  restPlayer: (playerId: string) => void;

  // 其他操作
  addSponsor: (sponsorName: string) => void;
  addNotification: (message: string) => void;
  clearNotifications: () => void;
  addNews: (item: Omit<NewsItem, 'id' | 'timestamp'>) => void;

  // 转会拍卖
  createAuction: (playerId: string, startingPrice?: number, weeks?: number) => void;
  placeBid: (auctionId: string, amount: number) => void;
  buyoutAuction: (auctionId: string) => void;
  resolveAuctions: () => void;

  // 青训营
  recruitYouth: () => YouthPlayer | null;
  trainYouth: (youthId: string, attribute: string) => void;
  promoteYouth: (youthId: string) => void;
  upgradeYouthAcademy: () => void;

  // 选秀大会
  generateDraftClass: () => void;
  draftPlayer: (pickId: string, playerId: string) => void;

  // 赛前情报
  scoutOpponent: (teamId: string) => ScoutReport | null;

  // 赞助商与商业
  signSponsorContract: (sponsorName: string, tier: SponsorContract['tier']) => void;
  runBusinessEvent: (eventType: BusinessEvent['type']) => void;
  updateSponsorSatisfaction: () => void;

  // 教程操作
  startTutorial: () => void;
  nextTutorialStep: () => void;
  prevTutorialStep: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;

  // 剧情操作
  startStoryChapter: (chapterId: string) => void;
  nextStoryDialog: () => void;
  closeStory: () => void;
  checkStoryTriggers: () => void;

  // 计算方法
  calculateTeamStrength: () => number;
  getTeamRating: () => number;
  getOpponentTeams: () => Team[];
  getTeamById: (id: string) => Team | undefined;
  calculateChemistry: () => number;

  // 新增：化学反应系统
  getPlayerChemistry: (playerA: Player, playerB: Player) => number;
  getChemistryMatrix: () => ChemistryPair[];

  // 新增：博彩系统
  placeBet: (amount: number, opponentId: string, opponentName: string) => boolean;
  getMatchPrediction: (opponentTeam: Team) => MatchPrediction;

  // 新增：成就系统
  checkAchievements: () => void;

  // 新增：每周挑战系统
  generateWeeklyChallenges: () => void;
  claimChallenge: (challengeId: string) => void;

  // 新增：退役与传承系统
  retirePlayer: (playerId: string) => void;
  convertToCoach: (retiredPlayerId: string) => void;
}

// ===== 创建Store =====
const defaultTactic = tactics[0];

export const useGameStore = create<GameState>((set, get) => {
  const initialTeam = createInitialTeam(defaultTactic);
  const initialPlayerIds = new Set(initialTeam.players.map(p => p.id));
  const initialAllPlayers = realPlayers.map(p =>
    initialPlayerIds.has(p.id)
      ? { ...p, teamId: 'my-team' as string | null, isFreeAgent: false }
      : p
  );

  return {
    // 初始状态
    playerTeam: initialTeam,
    allPlayers: initialAllPlayers,
  availableTournaments: tournaments,
  availableMaps: gameMaps,
  availableTeams: realTeams,
  availableTactics: tactics,
  
  currentWeek: 1,
  currentSeason: 1,
  gamePhase: 'preseason',
  
  selectedPlayer: null,
  selectedTournament: null,
  
  matchHistory: [],
  teamRoster: [],
  notifications: [],
  newsHistory: [],
  seasonRecords: [],
  vctStandings: realTeams.map(t => ({
    teamId: t.id,
    teamName: t.chineseName,
    region: t.region,
    wins: 0,
    losses: 0,
    points: Math.floor(Math.random() * 50) + 10,
    color: t.color,
  })),
  completedTournaments: [],
  // 新玩法初始状态
  activeAuctions: [],
  auctionHistory: [],
  youthPlayers: [],
  draftClass: null,
  scoutReports: [],
  // 教程初始状态
  tutorial: {
    currentStep: 0,
    isActive: false,
    completed: false,
  },
  // 剧情初始状态
  story: {
    currentChapter: null,
    currentDialogIndex: 0,
    isActive: false,
    unlockedChapters: ['chapter-1'],
    completedChapters: [],
  },
  // 当前比赛状态
  currentMatch: null,
  // 已报名赛事
  registeredTournaments: [],
  // 转会系统扩展初始状态
  transferHistory: [],
  activeLoans: [],
  // 新增系统初始状态
  bets: [],
  pendingBet: null,
  betsThisWeek: 0,
  totalBetsWon: 0,
  totalBetsPlaced: 0,
  achievements: initialAchievements(),
  weeklyChallenges: generateChallenges(1),
  retiredPlayers: [],
  coaches: [],
  totalTrainings: 0,
  totalScouts: 0,
  currentWinStreak: 0,
  maxWinStreak: 0,
  weeklyTrainings: 0,
  weeklySignings: 0,
  weeklyScouts: 0,
  weeklyMatchesPlayed: 0,
  weeklyMatchesWon: 0,
  weeklyEarnings: 0,

  // ===== 战队操作 =====
  setTeamName: (name) => set((state) => ({
    playerTeam: { ...state.playerTeam, name }
  })),

  hirePlayer: (playerId, contractYears = 2) => {
    const state = get();
    const player = state.allPlayers.find(p => p.id === playerId);
    if (!player || player.teamId !== null) return;

    // 转会窗校验：自由选手签约需要转会窗开放
    if (!isTransferWindowOpenAt(state.currentWeek)) {
      get().addNotification('转会窗关闭中，无法签约自由选手');
      return;
    }

    // 计算签约费（基于合同年限）
    const signingFee = computeSigningFee(player.marketValue, contractYears);

    if (state.playerTeam.budget < signingFee) {
      get().addNotification(`预算不足，需要 $${signingFee.toLocaleString()} 签约费`);
      return;
    }
    if (state.playerTeam.players.length >= 7) {
      get().addNotification('阵容已满！最多签约7名选手');
      return;
    }

    const updatedPlayer = {
      ...player,
      teamId: state.playerTeam.id,
      isFreeAgent: false,
      contractYears,
      mood: 'excited' as PlayerMood,
      hotStreak: 0,
      weeksWithTeam: 0,
    };

    set({
      playerTeam: {
        ...state.playerTeam,
        budget: state.playerTeam.budget - signingFee,
        players: [...state.playerTeam.players, updatedPlayer],
        weeklyExpense: state.playerTeam.weeklyExpense + Math.floor(player.salary / 4),
      },
      allPlayers: state.allPlayers.map(p => p.id === playerId ? updatedPlayer : p),
      transferHistory: [
        createTransferRecord(state.currentWeek, state.currentSeason, 'hire',
          player, null, state.playerTeam.name, signingFee,
          { contractYears, details: `${contractYears}年合同` }),
        ...state.transferHistory,
      ],
      weeklySignings: state.weeklySignings + 1,
      weeklyChallenges: state.weeklyChallenges.map(c =>
        c.type === 'sign_players' && !c.completed
          ? { ...c, progress: c.progress + 1, completed: c.progress + 1 >= c.target }
          : c
      ),
    });

    get().addNotification(`成功签约 ${player.chineseName}！${contractYears}年合同，签约费 $${signingFee.toLocaleString()}`);
    get().addNews({
      week: state.currentWeek,
      type: 'transfer',
      title: '新选手加盟',
      content: `${player.chineseName}以${contractYears}年合同正式加入${state.playerTeam.name}，签约费 $${signingFee.toLocaleString()}`,
    });
    get().checkAchievements();
  },

  releasePlayer: (playerId) => {
    const state = get();
    const player = state.playerTeam.players.find(p => p.id === playerId);
    if (!player) return;

    // 计算违约金：根据剩余合同年限
    const terminationFee = computeTerminationFee(player.marketValue, player.contractYears);
    // 回收金额 = 市场价50% - 违约金
    const refundAmount = Math.max(0, Math.floor(player.marketValue * 0.5) - terminationFee);
    const actualCost = Math.floor(player.marketValue * 0.5) - refundAmount;

    const updatedPlayer = { ...player, teamId: null, isFreeAgent: true, contractYears: 0 };

    set({
      playerTeam: {
        ...state.playerTeam,
        players: state.playerTeam.players.filter(p => p.id !== playerId),
        budget: state.playerTeam.budget + refundAmount,
        weeklyExpense: Math.max(0, state.playerTeam.weeklyExpense - Math.floor(player.salary / 4)),
      },
      allPlayers: state.allPlayers.map(p => p.id === playerId ? updatedPlayer : p),
      transferHistory: [
        createTransferRecord(state.currentWeek, state.currentSeason, 'release',
          player, state.playerTeam.name, '自由市场', actualCost,
          { contractYears: player.contractYears, details: `违约金 $${terminationFee.toLocaleString()}` }),
        ...state.transferHistory,
      ],
    });

    get().addNotification(`解约 ${player.chineseName}，回收 $${refundAmount.toLocaleString()}（违约金 $${terminationFee.toLocaleString()}）`);
    get().addNews({
      week: state.currentWeek,
      type: 'transfer',
      title: '选手解约',
      content: `${state.playerTeam.name}与${player.chineseName}解约，支付违约金 $${terminationFee.toLocaleString()}`,
    });
  },

  // ===== 转会窗与高级转会 =====
  getTransferWindow: () => computeTransferWindow(get().currentWeek),

  isTransferWindowOpen: () => isTransferWindowOpenAt(get().currentWeek),

  tradePlayer: (myPlayerId, targetPlayerId, additionalMoney) => {
    const state = get();
    // 转会窗校验
    if (!isTransferWindowOpenAt(state.currentWeek)) {
      get().addNotification('转会窗关闭中，无法进行交易');
      return;
    }
    const myPlayer = state.playerTeam.players.find(p => p.id === myPlayerId);
    if (!myPlayer) {
      get().addNotification('未找到你方交易选手');
      return;
    }
    const targetPlayer = state.allPlayers.find(p => p.id === targetPlayerId);
    if (!targetPlayer || targetPlayer.teamId === null || targetPlayer.teamId === 'my-team') {
      get().addNotification('目标选手不可交易');
      return;
    }
    const targetTeam = getTeamById(targetPlayer.teamId);
    if (!targetTeam) {
      get().addNotification('目标选手战队信息缺失');
      return;
    }

    // 计算差价：目标选手市场价 - 我方选手市场价
    const priceDiff = targetPlayer.marketValue - myPlayer.marketValue;
    // 玩家补的差价必须覆盖价差
    if (additionalMoney < priceDiff) {
      get().addNotification(`补差价不足，至少需要 $${priceDiff.toLocaleString()}`);
      return;
    }
    if (state.playerTeam.budget < additionalMoney) {
      get().addNotification('预算不足以支付补差价');
      return;
    }

    // AI战队是否接受交易：评级差距越大越愿意
    const ratingDiff = targetPlayer.rating - myPlayer.rating;
    const acceptChance = Math.max(0.2, Math.min(0.95, 0.5 + (additionalMoney - priceDiff) / 200000 - ratingDiff * 0.05));
    if (Math.random() > acceptChance) {
      get().addNotification(`${targetTeam.chineseName} 拒绝了你的交易提案`);
      return;
    }

    // 执行交易
    const newMyPlayer = {
      ...targetPlayer,
      teamId: state.playerTeam.id,
      isFreeAgent: false,
      contractYears: 2,
    };
    const newTargetPlayer = {
      ...myPlayer,
      teamId: targetPlayer.teamId,
      isFreeAgent: false,
    };

    set({
      playerTeam: {
        ...state.playerTeam,
        budget: state.playerTeam.budget - additionalMoney,
        players: [
          ...state.playerTeam.players.filter(p => p.id !== myPlayerId),
          newMyPlayer,
        ],
        weeklyExpense: state.playerTeam.weeklyExpense
          - Math.floor(myPlayer.salary / 4)
          + Math.floor(targetPlayer.salary / 4),
      },
      allPlayers: state.allPlayers.map(p => {
        if (p.id === targetPlayerId) return newMyPlayer;
        if (p.id === myPlayerId) return newTargetPlayer;
        return p;
      }),
      transferHistory: [
        createTransferRecord(state.currentWeek, state.currentSeason, 'trade',
          targetPlayer, targetTeam.chineseName, state.playerTeam.name, additionalMoney,
          { contractYears: 2, details: `交易出 ${myPlayer.chineseName}，补差价 $${additionalMoney.toLocaleString()}` }),
        ...state.transferHistory,
      ],
    });

    get().addNotification(`交易成功！用 ${myPlayer.chineseName} + $${additionalMoney.toLocaleString()} 换得 ${targetPlayer.chineseName}`);
    get().addNews({
      week: state.currentWeek,
      type: 'transfer',
      title: '选手交易',
      content: `${state.playerTeam.name}用${myPlayer.chineseName}加$${additionalMoney.toLocaleString()}从${targetTeam.chineseName}换得${targetPlayer.chineseName}`,
    });
  },

  loanPlayer: (playerId, weeks) => {
    const state = get();
    // 转会窗校验
    if (!isTransferWindowOpenAt(state.currentWeek)) {
      get().addNotification('转会窗关闭中，无法租借选手');
      return;
    }
    const player = state.allPlayers.find(p => p.id === playerId);
    if (!player || player.teamId === null || player.teamId === 'my-team') {
      get().addNotification('目标选手不可租借');
      return;
    }
    if (state.playerTeam.players.length >= 7) {
      get().addNotification('阵容已满，无法租借');
      return;
    }
    const targetTeam = getTeamById(player.teamId);
    if (!targetTeam) {
      get().addNotification('目标选手战队信息缺失');
      return;
    }

    // 限制租借周数 2-8 周
    const loanWeeks = Math.max(2, Math.min(8, weeks));
    // 租借费：每周付原薪资的50%
    const weeklyFee = Math.floor(player.salary / 4 * 0.5);
    const totalFee = weeklyFee * loanWeeks;
    if (state.playerTeam.budget < totalFee) {
      get().addNotification(`预算不足，租借总费用 $${totalFee.toLocaleString()}`);
      return;
    }

    // AI战队同意租借的概率
    const acceptChance = Math.max(0.3, Math.min(0.9, 0.6 + (player.rating < 88 ? 0.2 : -0.1)));
    if (Math.random() > acceptChance) {
      get().addNotification(`${targetTeam.chineseName} 拒绝租借 ${player.chineseName}`);
      return;
    }

    const loanDeal: LoanDeal = {
      id: generateId(),
      playerId: player.id,
      playerName: player.chineseName,
      fromTeamId: player.teamId,
      toTeamId: state.playerTeam.id,
      weeklyFee,
      remainingWeeks: loanWeeks,
      totalWeeks: loanWeeks,
      returnClause: Math.floor(player.marketValue * 0.1),
    };

    // 添加到战队阵容但保留原teamId归属（用isFreeAgent=false标记）
    const loanedPlayer = {
      ...player,
      // 保留原teamId用于归还，但加入玩家战队阵容
    };

    set({
      playerTeam: {
        ...state.playerTeam,
        budget: state.playerTeam.budget - totalFee,
        players: [...state.playerTeam.players, loanedPlayer],
        weeklyExpense: state.playerTeam.weeklyExpense + weeklyFee,
      },
      activeLoans: [...state.activeLoans, loanDeal],
      transferHistory: [
        createTransferRecord(state.currentWeek, state.currentSeason, 'loan',
          player, targetTeam.chineseName, state.playerTeam.name, totalFee,
          { loanWeeks, details: `租借${loanWeeks}周，每周$${weeklyFee.toLocaleString()}` }),
        ...state.transferHistory,
      ],
    });

    get().addNotification(`租借成功！${player.chineseName} 加入战队 ${loanWeeks} 周，总费用 $${totalFee.toLocaleString()}`);
    get().addNews({
      week: state.currentWeek,
      type: 'transfer',
      title: '选手租借',
      content: `${state.playerTeam.name}从${targetTeam.chineseName}租借${player.chineseName}，租期${loanWeeks}周`,
    });
  },

  getTransferRecommendations: () => {
    const state = get();
    // 找出战队弱点位置：每个位置至少2名选手为达标
    const positionCounts: Record<AgentRole, number> = {
      Duelist: 0, Controller: 0, Initiator: 0, Sentinel: 0,
    };
    state.playerTeam.players.forEach(p => {
      positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
    });

    // 找出最弱的位置
    const weakRoles = (Object.keys(positionCounts) as AgentRole[])
      .sort((a, b) => positionCounts[a] - positionCounts[b])
      .filter(role => positionCounts[role] < 2)
      .slice(0, 2);

    if (weakRoles.length === 0) return [];

    // 推荐对应位置的自由选手，按性价比（rating / marketValue）排序
    const candidates = state.allPlayers
      .filter(p => p.isFreeAgent && !p.isProspect && weakRoles.includes(p.position))
      .sort((a, b) => (b.rating / Math.max(1, b.marketValue)) - (a.rating / Math.max(1, a.marketValue)))
      .slice(0, 5);

    return candidates;
  },

  addTransferRecord: (record) => set((state) => ({
    transferHistory: [record, ...state.transferHistory],
  })),
  
  setBudget: (amount) => set((state) => ({
    playerTeam: { ...state.playerTeam, budget: amount }
  })),
  
  setTactic: (tactic) => set((state) => ({
    playerTeam: { ...state.playerTeam, selectedTactic: tactic }
  })),
  
  // ===== 时间操作 =====
  advanceWeek: () => {
    const state = get();
    const newWeek = state.currentWeek + 1;
    
    // 计算新阶段
    let newPhase: GamePhase = 'preseason';
    if (newWeek <= 2) newPhase = 'preseason';
    else if (newWeek <= 12) newPhase = 'regular';
    else if (newWeek <= 16) newPhase = 'playoffs';
    else newPhase = 'offseason';
    
    // 选手状态恢复
    const gamingHouse = state.playerTeam.facilities.find(f => f.id === 'gaming-house');
    const fitnessBonus = gamingHouse?.effects.fitnessBonus || 0;
    const moraleBonus = gamingHouse?.effects.moraleBonus || 0;

    // 根据连胜/连败调整心情
    const winStreak = state.currentWinStreak;
    const updatedPlayers = state.playerTeam.players.map(p => {
      let mood = p.mood || 'calm';
      const currentMoodLevel = MOOD_LEVELS[mood];
      // 连胜提升心情，连败降低心情
      if (winStreak >= 3) {
        mood = currentMoodLevel < 3 ? 'excited' : 'excited';
      } else if (winStreak <= -3) {
        mood = currentMoodLevel > 0 ? 'anxious' : 'tired';
      }
      // 手感火热衰减
      const newHotStreak = Math.max(0, (p.hotStreak || 0) - 1);
      return {
        ...p,
        fitness: Math.min(100, p.fitness + 8 + fitnessBonus),
        morale: Math.min(100, p.morale + 3 + moraleBonus),
        mood,
        hotStreak: newHotStreak,
        weeksWithTeam: (p.weeksWithTeam || 0) + 1,
        age: p.age, // 年龄在赛季结束时增长
      };
    });

    // 选手退役检查：30岁以上有退役概率
    const retiredThisWeek: Player[] = [];
    const retirementNotifications: string[] = [];
    const remainingPlayers = updatedPlayers.filter(p => {
      if (p.age >= 30) {
        const retireChance = (p.age - 29) * 0.04; // 30岁=4%, 35岁=24%, 40岁=44%
        if (Math.random() < retireChance) {
          retiredThisWeek.push(p);
          retirementNotifications.push(`${p.chineseName}（${p.age}岁）宣布退役`);
          return false;
        }
      }
      return true;
    });

    const newRetiredPlayers: RetiredPlayer[] = retiredThisWeek.map(p => ({
      id: `retired-${generateId()}`,
      playerId: p.id,
      chineseName: p.chineseName,
      nationality: p.nationality,
      position: p.position,
      rating: p.rating,
      attributes: p.attributes,
      age: p.age,
      retiredWeek: newWeek,
      isCoach: false,
    }));
    
    // 默契度提升
    const teamBuilding = state.playerTeam.facilities.find(f => f.id === 'team-building');
    const chemistryBonus = teamBuilding?.effects.chemistryBonus || 0;
    const newChemistry = Math.min(100, state.playerTeam.chemistry + 2 + chemistryBonus * 10);
    
    // 周收支
    const net = state.playerTeam.weeklyRevenue - state.playerTeam.weeklyExpense;
    
    // 随机事件
    if (Math.random() < 0.3) {
      const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      get().addNews({
        week: newWeek,
        type: event.type,
        title: event.title,
        content: `第${newWeek}周事件：${event.title}`,
      });
    }
    
    // AI战队积分更新
    if (newPhase === 'regular') {
      const updatedStandings = state.vctStandings.map(s => ({
        ...s,
        wins: s.wins + (Math.random() < 0.5 ? 1 : 0),
        losses: s.losses + (Math.random() < 0.5 ? 1 : 0),
        points: s.points + (Math.random() < 0.5 ? 3 : 0),
      }));
      set({ vctStandings: updatedStandings });
    }

    // 处理活跃拍卖：智能AI出价 + 倒计时
    const updatedAuctions: AuctionItem[] = [];
    const resolvedAuctions: AuctionItem[] = [];
    let auctionBudgetChange = 0;
    let auctionSalaryChange = 0;
    const auctionNotifications: string[] = [];
    const auctionSignedPlayers: Player[] = [];
    const newTransferRecords: TransferRecord[] = [];

    state.activeAuctions.forEach(auction => {
      if (auction.status !== 'active') return;

      let updatedAuction = { ...auction, weeksRemaining: auction.weeksRemaining - 1 };

      // 智能AI出价：遍历感兴趣战队，根据预算与需求决定是否出价
      const candidateTeams = (auction.interestedTeams.length > 0
        ? auction.interestedTeams
        : realTeams.filter(t => t.id !== 'my-team').map(t => t.id)
      )
        .map(tid => getTeamById(tid))
        .filter((t): t is Team => !!t && t.id !== 'my-team');

      // 选出兴趣最高的战队出价
      let bestBidder: Team | null = null;
      let bestBidAmount = 0;
      for (const aiTeam of candidateTeams) {
        const interest = computeAiInterest(aiTeam, auction.player);
        const aiBudget = computeAiBudget(aiTeam);
        // AI最大愿意支付的金额
        const aiMaxBid = Math.min(aiBudget, auction.player.marketValue * (0.85 + interest * 0.4));
        const minRaise = Math.max(5000, Math.floor(auction.currentBid * 0.05));
        const nextBid = auction.currentBid + minRaise;
        // 是否出价：兴趣值作为概率
        if (nextBid <= aiMaxBid && Math.random() < interest) {
          if (nextBid > bestBidAmount) {
            bestBidAmount = nextBid;
            bestBidder = aiTeam;
          }
        }
      }

      if (bestBidder) {
        updatedAuction = {
          ...updatedAuction,
          currentBid: bestBidAmount,
          currentBidder: bestBidder.id,
          bids: [...updatedAuction.bids, {
            bidder: bestBidder.id,
            amount: bestBidAmount,
            week: newWeek,
          }],
        };
      }

      if (updatedAuction.weeksRemaining <= 0) {
        const finalStatus: AuctionItem['status'] = updatedAuction.currentBidder === 'player' ? 'won' : 'lost';
        const finalAuction: AuctionItem = { ...updatedAuction, status: finalStatus };
        resolvedAuctions.push(finalAuction);

        if (finalAuction.status === 'won') {
          // 扣除尾款并加入战队
          auctionBudgetChange -= finalAuction.currentBid;
          const player = state.allPlayers.find(p => p.id === finalAuction.playerId);
          if (player && player.teamId === null && (state.playerTeam.players.length + auctionSignedPlayers.length) < 7) {
            const signedPlayer = { ...player, teamId: state.playerTeam.id, isFreeAgent: false, contractYears: 2 };
            auctionSignedPlayers.push(signedPlayer);
            auctionSalaryChange += Math.floor(player.salary / 4);
            auctionNotifications.push(`拍卖中标！${player.chineseName} 加入战队`);
            newTransferRecords.push(createTransferRecord(newWeek, state.currentSeason, 'auction',
              player, null, state.playerTeam.name, finalAuction.currentBid,
              { contractYears: 2, details: '拍卖中标' }));
            get().addNews({
              week: newWeek,
              type: 'transfer',
              title: '拍卖中标',
              content: `${state.playerTeam.name}在转会拍卖中以$${finalAuction.currentBid.toLocaleString()}签下${player.chineseName}`,
            });
          }
        } else if (finalAuction.currentBidder && finalAuction.currentBidder !== 'player') {
          const winnerTeam = getTeamById(finalAuction.currentBidder);
          auctionNotifications.push(`拍卖失利：${finalAuction.player.chineseName} 被 ${winnerTeam?.chineseName || finalAuction.currentBidder} 以 $${finalAuction.currentBid.toLocaleString()} 签下`);
          newTransferRecords.push(createTransferRecord(newWeek, state.currentSeason, 'auction',
            finalAuction.player, null, winnerTeam?.chineseName || finalAuction.currentBidder,
            finalAuction.currentBid,
            { contractYears: 2, details: 'AI拍卖中标' }));
        }
      } else {
        updatedAuctions.push(updatedAuction);
      }
    });

    // 处理租借到期：归还选手
    const expiredLoans: LoanDeal[] = [];
    const remainingLoans: LoanDeal[] = [];
    let loanSalaryReduction = 0;
    const returnedPlayerIds = new Set<string>();
    state.activeLoans.forEach(loan => {
      const newRemaining = loan.remainingWeeks - 1;
      if (newRemaining <= 0) {
        expiredLoans.push(loan);
        returnedPlayerIds.add(loan.playerId);
        loanSalaryReduction += loan.weeklyFee;
      } else {
        remainingLoans.push({ ...loan, remainingWeeks: newRemaining });
      }
    });

    // 从战队阵容中移除已归还的租借选手
    let playersAfterLoans = remainingPlayers;
    if (returnedPlayerIds.size > 0) {
      playersAfterLoans = remainingPlayers.filter(p => !returnedPlayerIds.has(p.id));
      expiredLoans.forEach(loan => {
        auctionNotifications.push(`租借到期：${loan.playerName} 已归还`);
      });
    }

    // 青训营成长
    const updatedYouthPlayers = state.youthPlayers.map(youth => {
      const growthRate = 0.5 + state.playerTeam.youthAcademyLevel * 0.3;
      const attrKeys = Object.keys(youth.attributes) as (keyof typeof youth.attributes)[];
      const newAttributes = { ...youth.attributes };
      attrKeys.forEach(key => {
        const val = newAttributes[key] || 50;
        if (val < 99) {
          newAttributes[key] = Math.min(99, val + Math.random() * growthRate);
        }
      });
      const newRating = Math.min(youth.potential, youth.rating + Math.random() * growthRate * 0.5);
      return {
        ...youth,
        rating: newRating,
        attributes: newAttributes,
        weeksInAcademy: youth.weeksInAcademy + 1,
        isReady: newRating >= youth.potential * 0.85 || youth.weeksInAcademy >= 8,
      };
    });

    // 赞助商合同结算
    let sponsorIncome = 0;
    const updatedContracts = state.playerTeam.sponsorContracts.map(contract => {
      if (contract.remainingWeeks <= 0) return contract;
      const income = contract.weeklyIncome * (contract.satisfaction / 100);
      sponsorIncome += income;
      return { ...contract, remainingWeeks: contract.remainingWeeks - 1 };
    }).filter(contract => contract.remainingWeeks > 0);

    // 商业活动结算
    let businessRevenue = 0;
    let fanGain = 0;
    const updatedBusinessEvents = state.playerTeam.businessEvents.map(event => {
      if (event.status === 'completed') return event;
      const newRemaining = event.remainingWeeks - 1;
      const weeklyRev = event.revenue / event.duration;
      const weeklyFan = event.fanGain / event.duration;
      businessRevenue += weeklyRev;
      fanGain += weeklyFan;
      return {
        ...event,
        remainingWeeks: newRemaining,
        status: newRemaining <= 0 ? 'completed' as const : 'running' as const,
      };
    });

    // 粉丝增长与声望
    const fanGrowth = Math.floor(state.playerTeam.fanBase * 0.005) + Math.floor(fanGain);
    const reputationChange = state.playerTeam.seasonWins > state.playerTeam.seasonLosses ? 1 : -1;

    // 更新allPlayers中拍卖签约球员状态
    const auctionPlayerIds = new Set(auctionSignedPlayers.map(p => p.id));
    const updatedAllPlayers = state.allPlayers.map(p =>
      auctionPlayerIds.has(p.id) ? auctionSignedPlayers.find(sp => sp.id === p.id)! : p
    );

    set({
      currentWeek: newWeek,
      gamePhase: newPhase,
      activeAuctions: updatedAuctions,
      auctionHistory: [...resolvedAuctions, ...state.auctionHistory],
      activeLoans: remainingLoans,
      transferHistory: [...newTransferRecords, ...state.transferHistory],
      youthPlayers: updatedYouthPlayers,
      allPlayers: updatedAllPlayers,
      playerTeam: {
        ...state.playerTeam,
        players: [...playersAfterLoans, ...auctionSignedPlayers],
        chemistry: newChemistry,
        budget: state.playerTeam.budget + net + auctionBudgetChange + sponsorIncome + businessRevenue,
        weeklyExpense: Math.max(0, state.playerTeam.weeklyExpense + auctionSalaryChange - loanSalaryReduction),
        weeklyRevenue: state.playerTeam.weeklyRevenue + sponsorIncome + Math.floor(businessRevenue),
        sponsorContracts: updatedContracts,
        businessEvents: updatedBusinessEvents,
        fanBase: state.playerTeam.fanBase + fanGrowth,
        reputation: Math.max(0, Math.min(100, state.playerTeam.reputation + reputationChange)),
      },
      // 新增系统状态更新
      retiredPlayers: [...newRetiredPlayers, ...state.retiredPlayers],
      betsThisWeek: 0,
      pendingBet: null,
      weeklyTrainings: 0,
      weeklySignings: 0,
      weeklyScouts: 0,
      weeklyMatchesPlayed: 0,
      weeklyMatchesWon: 0,
      weeklyEarnings: 0,
      weeklyChallenges: generateChallenges(newWeek),
    });

    auctionNotifications.forEach(msg => get().addNotification(msg));
    retirementNotifications.forEach(msg => {
      get().addNotification(msg);
      get().addNews({
        week: newWeek,
        type: 'event',
        title: '选手退役',
        content: msg,
      });
    });

    if (newPhase === 'offseason') {
      get().addNews({
        week: newWeek,
        type: 'season',
        title: '赛季结束',
        content: `VCT ${state.currentSeason}赛季结束！`,
      });
    }

    get().checkAchievements();
  },
  
  advanceSeason: () => {
    const state = get();
    const record: SeasonRecord = {
      season: state.currentSeason,
      wins: state.playerTeam.seasonWins,
      losses: state.playerTeam.seasonLosses,
      vctPoints: state.playerTeam.vctPoints,
      bestFinish: '小组赛',
      prizeMoney: state.playerTeam.seasonPrize,
    };

    // 清除过期拍卖
    const clearedAuctions = state.activeAuctions.filter(a => a.status === 'active');

    // 赛季结束：归还所有未到期租借选手
    const returnedLoanPlayerIds = new Set(state.activeLoans.map(l => l.playerId));
    const keptPlayers = state.playerTeam.players.filter(p => !returnedLoanPlayerIds.has(p.id));
    let loanSalaryReduction = 0;
    state.activeLoans.forEach(loan => { loanSalaryReduction += loan.weeklyFee; });

    set({
      currentWeek: 1,
      currentSeason: state.currentSeason + 1,
      gamePhase: 'preseason',
      playerTeam: {
        ...state.playerTeam,
        players: keptPlayers,
        seasonWins: 0,
        seasonLosses: 0,
        seasonPrize: 0,
        vctPoints: 0,
        weeklyExpense: Math.max(0, state.playerTeam.weeklyExpense - loanSalaryReduction),
      },
      seasonRecords: [...state.seasonRecords, record],
      completedTournaments: [],
      activeAuctions: clearedAuctions,
      auctionHistory: [],
      activeLoans: [],
      scoutReports: [],
      vctStandings: realTeams.map(t => ({
        teamId: t.id,
        teamName: t.chineseName,
        region: t.region,
        wins: 0,
        losses: 0,
        points: Math.floor(Math.random() * 20) + 5,
        color: t.color,
      })),
    });

    // 生成新赛季选秀名单
    get().generateDraftClass();

    get().addNews({
      week: 1,
      type: 'season',
      title: '新赛季开始',
      content: `VCT ${state.currentSeason + 1}赛季正式开启！`,
    });
  },
  
  // ===== 选择操作 =====
  selectPlayer: (player) => set({ selectedPlayer: player }),
  selectTournament: (tournament) => set({ selectedTournament: tournament }),
  
  // ===== 比赛操作 =====
  simulateMatch: (opponentTeam, tactic) => {
    const state = get();
    const usedTactic = tactic || state.playerTeam.selectedTactic;
    const teamStrength = get().calculateTeamStrength();
    const chemistry = get().calculateChemistry();

    // 战术加成计算
    let tacticBonus = usedTactic.successRateModifier * 20;
    const teamPositions = state.playerTeam.players.map(p => p.position);
    usedTactic.bestPositions.forEach(pos => {
      if (teamPositions.includes(pos as AgentRole)) tacticBonus += 2;
    });

    // 心理与状态加成：心情 + 手感火热
    const moodBonus = state.playerTeam.players.reduce((sum, p) => {
      const mood = p.mood || 'calm';
      const moodVal = mood === 'excited' ? 2 : mood === 'tired' ? -4 : mood === 'anxious' ? -2 : 0;
      const hotVal = Math.min(10, (p.hotStreak || 0) * 2);
      return sum + moodVal + hotVal;
    }, 0);
    tacticBonus += moodBonus / Math.max(1, state.playerTeam.players.length);

    // 模拟比赛
    const { teamScore, opponentScore, result } = simulateMatchLogic(
      teamStrength,
      opponentTeam.overallRating,
      chemistry,
      tacticBonus
    );

    // MVP计算
    const mvp = state.playerTeam.players.length > 0
      ? state.playerTeam.players.reduce((best, p) => {
          const score = p.attributes.aim * 0.3 + p.attributes.clutch * 0.2 + p.attributes.gameSense * 0.2;
          const bestScore = best.attributes.aim * 0.3 + best.attributes.clutch * 0.2 + best.attributes.gameSense * 0.2;
          return score > bestScore ? p : best;
        })
      : null;

    const matchResult: MatchResult = {
      id: generateId(),
      opponentName: opponentTeam.chineseName,
      opponentId: opponentTeam.id,
      result,
      score: { team: teamScore, opponent: opponentScore },
      tournamentName: '友谊赛',
      date: `第 ${state.currentWeek} 周`,
      mvp,
      tacticUsed: usedTactic.chineseName,
      teamRating: Math.round(teamStrength + tacticBonus),
      opponentRating: opponentTeam.overallRating,
    };

    // 更新状态：心情、手感火热、连胜统计
    const newStreak = result === 'win'
      ? Math.max(1, state.currentWinStreak + 1)
      : result === 'loss'
        ? Math.min(-1, state.currentWinStreak - 1)
        : state.currentWinStreak;
    const updatedPlayers = state.playerTeam.players.map(p => ({
      ...p,
      fitness: Math.max(40, p.fitness - 12),
      morale: result === 'win' ? Math.min(100, p.morale + 5) : Math.max(0, p.morale - 4),
      // 胜利且评分较高者进入手感火热
      hotStreak: result === 'win' && p === mvp
        ? Math.min(5, (p.hotStreak || 0) + 1)
        : p.hotStreak || 0,
    }));

    const prizeMoney = result === 'win' ? MATCH_PRIZE : 0;

    // 博彩结算：若本場对手与pendingBet匹配则结算
    const pendingBet = state.pendingBet;
    let settledBet: Bet | null = null;
    let betPayout = 0;
    if (pendingBet && pendingBet.opponentId === opponentTeam.id && pendingBet.status === 'pending') {
      const won = result === 'win';
      betPayout = won ? pendingBet.amount * 2 : 0;
      settledBet = {
        ...pendingBet,
        status: won ? 'won' : 'lost',
        payout: betPayout,
      };
    }

    // 挑战进度更新
    const updatedChallenges = state.weeklyChallenges.map(c => {
      if (c.claimed) return c;
      if (c.type === 'play_matches') {
        const prog = c.progress + 1;
        return { ...c, progress: prog, completed: prog >= c.target };
      }
      if (c.type === 'win_matches' && result === 'win') {
        const prog = c.progress + 1;
        return { ...c, progress: prog, completed: prog >= c.target };
      }
      if (c.type === 'earn_money') {
        const prog = c.progress + prizeMoney + betPayout;
        return { ...c, progress: prog, completed: prog >= c.target };
      }
      return c;
    });

    set((prev) => ({
      matchHistory: [matchResult, ...prev.matchHistory],
      playerTeam: {
        ...prev.playerTeam,
        players: updatedPlayers,
        wins: result === 'win' ? prev.playerTeam.wins + 1 : prev.playerTeam.wins,
        losses: result === 'loss' ? prev.playerTeam.losses + 1 : prev.playerTeam.losses,
        seasonWins: result === 'win' ? prev.playerTeam.seasonWins + 1 : prev.playerTeam.seasonWins,
        seasonLosses: result === 'loss' ? prev.playerTeam.seasonLosses + 1 : prev.playerTeam.seasonLosses,
        budget: prev.playerTeam.budget + prizeMoney + betPayout,
        seasonPrize: prev.playerTeam.seasonPrize + prizeMoney,
      },
      currentWinStreak: newStreak,
      maxWinStreak: Math.max(prev.maxWinStreak, newStreak > 0 ? newStreak : 0),
      weeklyMatchesPlayed: prev.weeklyMatchesPlayed + 1,
      weeklyMatchesWon: prev.weeklyMatchesWon + (result === 'win' ? 1 : 0),
      weeklyEarnings: prev.weeklyEarnings + prizeMoney + betPayout,
      pendingBet: settledBet ? null : prev.pendingBet,
      bets: settledBet ? [settledBet, ...prev.bets] : prev.bets,
      totalBetsWon: settledBet && settledBet.status === 'won' ? prev.totalBetsWon + 1 : prev.totalBetsWon,
      weeklyChallenges: updatedChallenges,
    }));

    if (settledBet) {
      get().addNotification(
        settledBet.status === 'won'
          ? `博彩命中！获得 $${betPayout.toLocaleString()}（下注 $${settledBet.amount.toLocaleString()}）`
          : `博彩失利：损失 $${settledBet.amount.toLocaleString()}`
      );
    }

    get().addNotification(
      result === 'win' ? `战胜 ${opponentTeam.chineseName} ${teamScore}-${opponentScore}！MVP: ${mvp?.chineseName}`
      : result === 'loss' ? `不敌 ${opponentTeam.chineseName} ${teamScore}-${opponentScore}`
      : `与 ${opponentTeam.chineseName} 战平 ${teamScore}-${opponentScore}`
    );

    get().checkAchievements();
    return matchResult;
  },
  
  joinTournament: (tournamentId) => {
    const state = get();
    const tournament = state.availableTournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    if (state.playerTeam.budget < tournament.entryFee) return;
    if (state.registeredTournaments.includes(tournamentId)) return;
    if (state.completedTournaments.includes(tournamentId)) return;
    
    set((prev) => ({
      playerTeam: {
        ...prev.playerTeam,
        budget: prev.playerTeam.budget - tournament.entryFee,
      },
      registeredTournaments: [...prev.registeredTournaments, tournamentId],
    }));
    
    get().addNotification(`已报名参加 ${tournament.chineseName}！`);
  },

  startTournamentMatch: (tournamentId, opponentId) => {
    const state = get();
    const tournament = state.availableTournaments.find(t => t.id === tournamentId);
    const opponent = state.availableTeams.find(t => t.id === opponentId);
    if (!tournament || !opponent) return;
    if (!state.registeredTournaments.includes(tournamentId)) return;
    
    get().startBP(tournament, opponent);
  },

  startBP: (tournament, opponent) => {
    const mapPool = [...tournament.mapPool];
    
    const bpSteps = [
      { type: 'ban' as const, team: 'player' as const },
      { type: 'ban' as const, team: 'opponent' as const },
      { type: 'pick' as const, team: 'player' as const },
      { type: 'pick' as const, team: 'opponent' as const },
      { type: 'ban' as const, team: 'player' as const },
      { type: 'ban' as const, team: 'opponent' as const },
      { type: 'pick' as const, team: 'player' as const },
    ];

    const bpPhase: BPPhase = {
      steps: bpSteps,
      currentStep: 0,
      availableMaps: mapPool,
      pickedMaps: [],
      bannedMaps: [],
    };

    set({
      currentMatch: {
        phase: 'bp',
        bpPhase,
        currentMapIndex: 0,
        mapResults: [],
        opponent,
        tournament,
        format: tournament.format,
      },
    });
  },

  playerBanMap: (mapId) => {
    const state = get();
    if (!state.currentMatch || !state.currentMatch.bpPhase) return;
    if (state.currentMatch.phase !== 'bp') return;
    
    const bp = state.currentMatch.bpPhase;
    const currentStep = bp.steps[bp.currentStep];
    if (!currentStep || currentStep.team !== 'player' || currentStep.type !== 'ban') return;
    if (!bp.availableMaps.includes(mapId)) return;

    const newAvailable = bp.availableMaps.filter(m => m !== mapId);
    const newBanned = [...bp.bannedMaps, mapId];
    let newCurrentStep = bp.currentStep + 1;

    let updatedBP: BPPhase = {
      ...bp,
      availableMaps: newAvailable,
      bannedMaps: newBanned,
      currentStep: newCurrentStep,
    };

    while (newCurrentStep < updatedBP.steps.length) {
      const step = updatedBP.steps[newCurrentStep];
      if (step.team === 'opponent') {
        const randomMap = updatedBP.availableMaps[Math.floor(Math.random() * updatedBP.availableMaps.length)];
        if (step.type === 'ban') {
          updatedBP = {
            ...updatedBP,
            availableMaps: updatedBP.availableMaps.filter(m => m !== randomMap),
            bannedMaps: [...updatedBP.bannedMaps, randomMap],
            currentStep: newCurrentStep + 1,
          };
        } else {
          updatedBP = {
            ...updatedBP,
            availableMaps: updatedBP.availableMaps.filter(m => m !== randomMap),
            pickedMaps: [...updatedBP.pickedMaps, randomMap],
            currentStep: newCurrentStep + 1,
          };
        }
        newCurrentStep++;
      } else {
        break;
      }
    }

    const allPicksDone = updatedBP.steps.every((s, i) => 
      i < updatedBP.currentStep || s.type === 'ban'
    ) || updatedBP.pickedMaps.length >= 3;

    set({
      currentMatch: {
        ...state.currentMatch,
        bpPhase: updatedBP,
        phase: allPicksDone ? 'map-play' : 'bp',
      },
    });

    if (allPicksDone) {
      setTimeout(() => get().simulateCurrentMatch(), 500);
    }
  },

  playerPickMap: (mapId) => {
    const state = get();
    if (!state.currentMatch || !state.currentMatch.bpPhase) return;
    if (state.currentMatch.phase !== 'bp') return;
    
    const bp = state.currentMatch.bpPhase;
    const currentStep = bp.steps[bp.currentStep];
    if (!currentStep || currentStep.team !== 'player' || currentStep.type !== 'pick') return;
    if (!bp.availableMaps.includes(mapId)) return;

    const newAvailable = bp.availableMaps.filter(m => m !== mapId);
    const newPicked = [...bp.pickedMaps, mapId];
    let newCurrentStep = bp.currentStep + 1;

    let updatedBP: BPPhase = {
      ...bp,
      availableMaps: newAvailable,
      pickedMaps: newPicked,
      currentStep: newCurrentStep,
    };

    while (newCurrentStep < updatedBP.steps.length) {
      const step = updatedBP.steps[newCurrentStep];
      if (step.team === 'opponent') {
        const randomMap = updatedBP.availableMaps[Math.floor(Math.random() * updatedBP.availableMaps.length)];
        if (step.type === 'ban') {
          updatedBP = {
            ...updatedBP,
            availableMaps: updatedBP.availableMaps.filter(m => m !== randomMap),
            bannedMaps: [...updatedBP.bannedMaps, randomMap],
            currentStep: newCurrentStep + 1,
          };
        } else {
          updatedBP = {
            ...updatedBP,
            availableMaps: updatedBP.availableMaps.filter(m => m !== randomMap),
            pickedMaps: [...updatedBP.pickedMaps, randomMap],
            currentStep: newCurrentStep + 1,
          };
        }
        newCurrentStep++;
      } else {
        break;
      }
    }

    const format = state.currentMatch.format;
    const neededMaps = format === 'BO5' ? 5 : format === 'BO3' ? 3 : 1;
    const allPicksDone = updatedBP.pickedMaps.length >= neededMaps || updatedBP.currentStep >= updatedBP.steps.length;

    set({
      currentMatch: {
        ...state.currentMatch,
        bpPhase: updatedBP,
        phase: allPicksDone ? 'map-play' : 'bp',
      },
    });

    if (allPicksDone) {
      setTimeout(() => get().simulateCurrentMatch(), 500);
    }
  },

  simulateCurrentMatch: () => {
    const state = get();
    const match = state.currentMatch;
    if (!match || !match.opponent || !match.tournament || !match.bpPhase) return;
    
    const opponent = match.opponent;
    const tournament = match.tournament;
    const pickedMaps = match.bpPhase.pickedMaps;
    
    if (pickedMaps.length === 0) return;

    const format = match.format;
    const neededWins = format === 'BO5' ? 3 : format === 'BO3' ? 2 : 1;
    
    const mapResults: MapResult[] = [];
    let teamWins = 0;
    let opponentWins = 0;

    for (const mapId of pickedMaps) {
      if (teamWins >= neededWins || opponentWins >= neededWins) break;
      
      const result = get().simulateMatch(opponent);
      const map = state.availableMaps.find(m => m.id === mapId);
      const winner = result.score.team > result.score.opponent ? 'player' : 'opponent';
      
      if (winner === 'player') teamWins++;
      else opponentWins++;

      mapResults.push({
        mapName: map?.chineseName || mapId,
        teamScore: result.score.team,
        opponentScore: result.score.opponent,
        winner: winner === 'player' ? state.playerTeam.name : opponent.chineseName,
      });
    }

    const overallResult = teamWins > opponentWins ? 'win' : 'loss';
    const prizeMoney = overallResult === 'win' ? Math.floor(tournament.prizePool * 0.4) : Math.floor(tournament.prizePool * 0.1);
    const vctPointsGain = overallResult === 'win' ? tournament.vctPoints : Math.floor(tournament.vctPoints * 0.3);
    const fanGain = overallResult === 'win' ? Math.floor(tournament.prizePool / 1000) : Math.floor(tournament.prizePool / 5000);

    const finalResult: MatchResult = {
      id: generateId(),
      opponentName: opponent.chineseName,
      opponentId: opponent.id,
      result: overallResult,
      score: { team: teamWins, opponent: opponentWins },
      tournamentName: tournament.chineseName,
      date: `第 ${state.currentWeek} 周`,
      mvp: state.playerTeam.players[0] || null,
      tacticUsed: state.playerTeam.selectedTactic.chineseName,
      teamRating: get().getTeamRating(),
      opponentRating: opponent.overallRating,
      mapResults,
    };

    set((prev) => ({
      currentMatch: {
        ...prev.currentMatch!,
        phase: 'finished',
        mapResults,
      },
      matchHistory: [finalResult, ...prev.matchHistory],
      playerTeam: {
        ...prev.playerTeam,
        budget: prev.playerTeam.budget + prizeMoney,
        seasonPrize: prev.playerTeam.seasonPrize + prizeMoney,
        vctPoints: prev.playerTeam.vctPoints + vctPointsGain,
        fanBase: prev.playerTeam.fanBase + fanGain,
        reputation: Math.min(100, prev.playerTeam.reputation + (overallResult === 'win' ? 3 : 1)),
      },
      completedTournaments: [...prev.completedTournaments, tournament.id],
      registeredTournaments: prev.registeredTournaments.filter(id => id !== tournament.id),
      weeklyEarnings: prev.weeklyEarnings + prizeMoney,
    }));

    get().addNotification(
      overallResult === 'win'
        ? `恭喜！获得 ${tournament.chineseName} 冠军！奖金 $${prizeMoney.toLocaleString()}，VCT积分 +${vctPointsGain}`
        : `获得 ${tournament.chineseName} 亚军。奖金 $${prizeMoney.toLocaleString()}，VCT积分 +${vctPointsGain}`
    );

    get().addNews({
      week: state.currentWeek,
      type: 'match',
      title: overallResult === 'win' ? `${tournament.chineseName}夺冠！` : `${tournament.chineseName}获得亚军`,
      content: `${state.playerTeam.name}在${tournament.chineseName}中${overallResult === 'win' ? '夺得冠军' : '获得亚军'}！`,
    });

    get().checkStoryTriggers();
    get().checkAchievements();
  },

  closeCurrentMatch: () => {
    set({ currentMatch: null });
  },
  
  // ===== 训练操作 =====
  trainPlayer: (playerId, attribute) => {
    const state = get();
    const player = state.playerTeam.players.find(p => p.id === playerId);
    if (!player || state.playerTeam.budget < TRAINING_COST) return;
    if (player.fitness < 50) {
      get().addNotification(`${player.chineseName} 状态不足，无法训练！`);
      return;
    }
    if (player.rating >= player.potential) {
      get().addNotification(`${player.chineseName} 已达到潜力上限！`);
      return;
    }
    
    const trainingRoom = state.playerTeam.facilities.find(f => f.id === 'training-room');
    const trainingBonus = trainingRoom?.effects.trainingBonus || 0;
    
    let updatedPlayer = { ...player };
    
    if (attribute && player.attributes[attribute as keyof typeof player.attributes] !== undefined) {
      const currentAttr = player.attributes[attribute as keyof typeof player.attributes];
      const increase = Math.floor(1 + trainingBonus * 2 + Math.random());
      const newAttrValue = Math.min(99, currentAttr + increase);
      
      updatedPlayer = {
        ...player,
        attributes: { ...player.attributes, [attribute]: newAttrValue },
        rating: Math.min(player.potential, player.rating + (increase > 1 ? 1 : 0)),
        fitness: Math.max(40, player.fitness - 8),
      };
      
      get().addNotification(`${player.chineseName} 的${attribute}训练完成！+${increase}`);
    } else {
      const attrKeys = Object.keys(player.attributes) as (keyof typeof player.attributes)[];
      const newAttributes = { ...player.attributes };
      let totalIncrease = 0;
      
      attrKeys.forEach(key => {
        const inc = Math.floor(0.5 + trainingBonus + Math.random() * 0.5);
        newAttributes[key] = Math.min(99, newAttributes[key] + inc);
        totalIncrease += inc;
      });
      
      updatedPlayer = {
        ...player,
        attributes: newAttributes,
        rating: Math.min(player.potential, player.rating + 1),
        fitness: Math.max(40, player.fitness - 5),
      };
      
      get().addNotification(`${player.chineseName} 综合训练完成！评级 +1`);
    }
    
    set({
      playerTeam: {
        ...state.playerTeam,
        budget: state.playerTeam.budget - TRAINING_COST,
        players: state.playerTeam.players.map(p => p.id === playerId ? updatedPlayer : p),
      },
      allPlayers: state.allPlayers.map(p => p.id === playerId ? updatedPlayer : p),
      totalTrainings: state.totalTrainings + 1,
      weeklyTrainings: state.weeklyTrainings + 1,
      weeklyChallenges: state.weeklyChallenges.map(c => {
        if (c.claimed || c.type !== 'train_players') return c;
        const prog = c.progress + 1;
        return { ...c, progress: prog, completed: prog >= c.target };
      }),
    });

    get().checkAchievements();
  },
  
  upgradeFacility: (facilityId) => {
    const state = get();
    const facility = state.playerTeam.facilities.find(f => f.id === facilityId);
    if (!facility || facility.level >= facility.maxLevel) return;
    
    const upgradeCost = Math.floor(facility.upgradeCost * Math.pow(1.5, facility.level - 1));
    if (state.playerTeam.budget < upgradeCost) return;
    
    set({
      playerTeam: {
        ...state.playerTeam,
        budget: state.playerTeam.budget - upgradeCost,
        facilities: state.playerTeam.facilities.map(f =>
          f.id === facilityId ? { ...f, level: f.level + 1 } : f
        ),
      },
    });
    
    get().addNotification(`${facility.chineseName} 升级到 ${facility.level + 1} 级！`);
  },
  
  scoutPlayer: () => {
    const state = get();
    if (state.playerTeam.budget < SCOUT_COST) return null;
    
    const availableProspects = prospects.filter(p => p.teamId === null);
    if (availableProspects.length === 0) return null;
    
    const discoveredPlayer = availableProspects[Math.floor(Math.random() * availableProspects.length)];
    
    const analyticsCenter = state.playerTeam.facilities.find(f => f.id === 'analytics-center');
    const scoutingBonus = analyticsCenter?.effects.scoutingBonus || 0;
    
    const enhancedPlayer = {
      ...discoveredPlayer,
      rating: Math.min(95, Math.floor(discoveredPlayer.rating * (1 + scoutingBonus))),
    };
    
    set({
      playerTeam: {
        ...state.playerTeam,
        budget: state.playerTeam.budget - SCOUT_COST,
      },
      allPlayers: state.allPlayers.map(p => p.id === enhancedPlayer.id ? enhancedPlayer : p),
      totalScouts: state.totalScouts + 1,
      weeklyScouts: state.weeklyScouts + 1,
      weeklyChallenges: state.weeklyChallenges.map(c => {
        if (c.claimed || c.type !== 'scout_players') return c;
        const prog = c.progress + 1;
        return { ...c, progress: prog, completed: prog >= c.target };
      }),
    });
    
    get().addNotification(`球探发现了新秀 ${enhancedPlayer.chineseName}！评级 ${enhancedPlayer.rating}`);
    get().addNews({
      week: state.currentWeek,
      type: 'event',
      title: '新秀发现',
      content: `发掘了潜力新秀${enhancedPlayer.chineseName}`,
    });

    get().checkAchievements();
    
    return enhancedPlayer;
  },
  
  addSponsor: (sponsorName) => {
    const state = get();
    if (state.playerTeam.sponsors.length >= 5) {
      get().addNotification('赞助商已满！最多5个');
      return;
    }
    if (state.playerTeam.sponsors.includes(sponsorName)) return;
    
    const sponsor = sponsorPool.find(s => s.name === sponsorName);
    const sponsorRevenue = sponsor?.bonus || 50000;
    const weeklyFromSponsor = Math.floor(sponsorRevenue / 10);
    
    set({
      playerTeam: {
        ...state.playerTeam,
        sponsors: [...state.playerTeam.sponsors, sponsorName],
        budget: state.playerTeam.budget + sponsorRevenue,
        weeklyRevenue: state.playerTeam.weeklyRevenue + weeklyFromSponsor,
      },
    });
    
    get().addNotification(`新增赞助商 ${sponsorName}！签约费 $${sponsorRevenue.toLocaleString()}`);
    get().addNews({
      week: state.currentWeek,
      type: 'event',
      title: '赞助签约',
      content: `${sponsorName}成为官方赞助商`,
    });
  },

  // ===== 转会拍卖 =====
  createAuction: (playerId, startingPrice, weeks = 2) => {
    const state = get();
    const player = state.allPlayers.find(p => p.id === playerId);
    if (!player || player.teamId !== null) return;
    if (state.activeAuctions.some(a => a.playerId === playerId && a.status === 'active')) return;

    // 计算感兴趣的AI战队列表
    const aiTeams = realTeams.filter(t => t.id !== 'my-team');
    const interestedTeams = aiTeams
      .filter(t => computeAiInterest(t, player) > 0.3)
      .map(t => t.id)
      .slice(0, 4);

    const auction: AuctionItem = {
      id: generateId(),
      playerId,
      player,
      startingPrice: startingPrice || Math.floor(player.marketValue * 0.6),
      currentBid: startingPrice || Math.floor(player.marketValue * 0.6),
      currentBidder: null,
      bids: [],
      weeksRemaining: weeks,
      status: 'active',
      sourceTeam: null,
      buyoutPrice: player.marketValue, // 一口价 = 市场价
      competitionLevel: evaluateCompetition(player.rating),
      interestedTeams,
    };

    set({ activeAuctions: [...state.activeAuctions, auction] });
    get().addNotification(`转会拍卖开启：${player.chineseName} 起拍价 $${auction.startingPrice.toLocaleString()}（一口价 $${auction.buyoutPrice.toLocaleString()}）`);
    get().addNews({
      week: state.currentWeek,
      type: 'transfer',
      title: '转会拍卖',
      content: `${player.chineseName}进入转会拍卖市场，预计竞争程度：${auction.competitionLevel === 'high' ? '激烈' : auction.competitionLevel === 'medium' ? '中等' : '温和'}`,
    });
  },

  placeBid: (auctionId, amount) => {
    const state = get();
    const auction = state.activeAuctions.find(a => a.id === auctionId);
    if (!auction || auction.status !== 'active') return;
    if (amount <= auction.currentBid) {
      get().addNotification('出价必须高于当前最高价');
      return;
    }
    if (state.playerTeam.budget < amount) {
      get().addNotification('预算不足，无法出价');
      return;
    }

    const updatedAuctions = state.activeAuctions.map(a =>
      a.id === auctionId
        ? {
            ...a,
            currentBid: amount,
            currentBidder: 'player',
            bids: [...a.bids, { bidder: 'player', amount, week: state.currentWeek }],
          }
        : a
    );

    set({ activeAuctions: updatedAuctions });
    get().addNotification(`你对 ${auction.player.chineseName} 出价 $${amount.toLocaleString()}`);
  },

  // 一口价：直接以市场价买断拍卖
  buyoutAuction: (auctionId) => {
    const state = get();
    const auction = state.activeAuctions.find(a => a.id === auctionId);
    if (!auction || auction.status !== 'active') return;
    const buyoutPrice = auction.buyoutPrice;
    if (state.playerTeam.budget < buyoutPrice) {
      get().addNotification(`预算不足，一口价 $${buyoutPrice.toLocaleString()}`);
      return;
    }
    if (state.playerTeam.players.length >= 7) {
      get().addNotification('阵容已满！最多签约7名选手');
      return;
    }

    const player = state.allPlayers.find(p => p.id === auction.playerId);
    if (!player || player.teamId !== null) return;

    const signedPlayer = { ...player, teamId: state.playerTeam.id, isFreeAgent: false, contractYears: 2 };
    const finalAuction: AuctionItem = {
      ...auction,
      currentBid: buyoutPrice,
      currentBidder: 'player',
      status: 'won',
      bids: [...auction.bids, { bidder: 'player', amount: buyoutPrice, week: state.currentWeek }],
    };

    set({
      activeAuctions: state.activeAuctions.filter(a => a.id !== auctionId),
      auctionHistory: [finalAuction, ...state.auctionHistory],
      playerTeam: {
        ...state.playerTeam,
        budget: state.playerTeam.budget - buyoutPrice,
        players: [...state.playerTeam.players, signedPlayer],
        weeklyExpense: state.playerTeam.weeklyExpense + Math.floor(player.salary / 4),
      },
      allPlayers: state.allPlayers.map(p => p.id === player.id ? signedPlayer : p),
      transferHistory: [
        createTransferRecord(state.currentWeek, state.currentSeason, 'buyout',
          player, null, state.playerTeam.name, buyoutPrice,
          { contractYears: 2, details: '一口价买断' }),
        ...state.transferHistory,
      ],
    });

    get().addNotification(`一口价成功！${player.chineseName} 加入战队，花费 $${buyoutPrice.toLocaleString()}`);
    get().addNews({
      week: state.currentWeek,
      type: 'transfer',
      title: '一口价签约',
      content: `${state.playerTeam.name}以一口价$${buyoutPrice.toLocaleString()}签下${player.chineseName}`,
    });
  },

  resolveAuctions: () => {
    get().advanceWeek();
  },

  // ===== 青训营 =====
  recruitYouth: () => {
    const state = get();
    const recruitCost = 15000 * state.playerTeam.youthAcademyLevel;
    if (state.playerTeam.budget < recruitCost) return null;
    if (state.youthPlayers.length >= 6) {
      get().addNotification('青训营已满！最多6名学员');
      return null;
    }

    const nationalities = ['中国', '韩国', '日本', '美国', '巴西', '土耳其', '俄罗斯', '瑞典'];
    const firstNames = ['子轩', '俊杰', '浩然', '宇轩', '明泽', '天翊', '瑞霖', '晨熙', '逸飞', '博文'];
    const lastNames = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'];

    const position = PLAYER_POSITIONS[Math.floor(Math.random() * PLAYER_POSITIONS.length)];
    const potential = Math.floor(70 + Math.random() * 25) + state.playerTeam.youthAcademyLevel * 2;
    const rating = Math.floor(55 + Math.random() * 15);
    const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
    const chineseName = `${lastNames[Math.floor(Math.random() * lastNames.length)]}${firstNames[Math.floor(Math.random() * firstNames.length)]}`;

    const youth: YouthPlayer = {
      id: `youth-${generateId()}`,
      name: chineseName.toLowerCase(),
      chineseName,
      age: 16 + Math.floor(Math.random() * 4),
      nationality,
      position,
      rating,
      potential,
      weeksInAcademy: 0,
      trainingFocus: null,
      attributes: {
        aim: Math.floor(50 + Math.random() * 20),
        gameSense: Math.floor(45 + Math.random() * 25),
        teamwork: Math.floor(50 + Math.random() * 20),
        utility: Math.floor(45 + Math.random() * 25),
        clutch: Math.floor(45 + Math.random() * 25),
        entry: Math.floor(45 + Math.random() * 25),
        support: Math.floor(45 + Math.random() * 25),
        composure: Math.floor(40 + Math.random() * 30),
        leadership: Math.floor(40 + Math.random() * 25),
        consistency: Math.floor(45 + Math.random() * 25),
      },
      mainAgents: [],
      marketValue: Math.floor(rating * 1000),
      isReady: false,
    };

    set({
      playerTeam: { ...state.playerTeam, budget: state.playerTeam.budget - recruitCost },
      youthPlayers: [...state.youthPlayers, youth],
    });

    get().addNotification(`青训营招募新学员：${chineseName}，潜力 ${potential}`);
    return youth;
  },

  trainYouth: (youthId, attribute) => {
    const state = get();
    const youth = state.youthPlayers.find(y => y.id === youthId);
    if (!youth) return;
    const trainCost = 8000;
    if (state.playerTeam.budget < trainCost) return;

    const newAttributes = { ...youth.attributes };
    const current = newAttributes[attribute as keyof typeof newAttributes] || 50;
    const growth = Math.floor(1 + Math.random() * 3 + state.playerTeam.youthAcademyLevel * 0.5);
    newAttributes[attribute as keyof typeof newAttributes] = Math.min(99, current + growth);

    const newRating = Math.min(youth.potential, youth.rating + growth * 0.3);

    set({
      playerTeam: { ...state.playerTeam, budget: state.playerTeam.budget - trainCost },
      youthPlayers: state.youthPlayers.map(y =>
        y.id === youthId
          ? { ...y, attributes: newAttributes, rating: newRating, trainingFocus: attribute, isReady: newRating >= y.potential * 0.85 || y.weeksInAcademy >= 8 }
          : y
      ),
    });

    get().addNotification(`青训学员 ${youth.chineseName} 完成${attribute}训练 +${growth}`);
  },

  promoteYouth: (youthId) => {
    const state = get();
    const youth = state.youthPlayers.find(y => y.id === youthId);
    if (!youth) return;
    if (state.playerTeam.players.length >= 7) {
      get().addNotification('阵容已满，无法提拔新秀');
      return;
    }

    const promotedPlayer: Player = {
      id: `pro-${generateId()}`,
      name: youth.name,
      chineseName: youth.chineseName,
      realName: youth.chineseName,
      age: youth.age,
      nationality: youth.nationality,
      teamId: state.playerTeam.id,
      position: youth.position,
      mainAgents: youth.mainAgents,
      rating: Math.floor(youth.rating),
      salary: Math.floor(youth.rating * 150),
      stats: { acs: 200, kda: 1.1, adr: 140, hsRate: 25, kast: 70, firstBlood: 0.1, clutchRate: 0.15 },
      attributes: {
        aim: Math.floor(youth.attributes.aim || 50),
        gameSense: Math.floor(youth.attributes.gameSense || 50),
        teamwork: Math.floor(youth.attributes.teamwork || 50),
        utility: Math.floor(youth.attributes.utility || 50),
        clutch: Math.floor(youth.attributes.clutch || 50),
        entry: Math.floor(youth.attributes.entry || 50),
        support: Math.floor(youth.attributes.support || 50),
        composure: Math.floor(youth.attributes.composure || 50),
        leadership: Math.floor(youth.attributes.leadership || 50),
        consistency: Math.floor(youth.attributes.consistency || 50),
      },
      potential: youth.potential,
      morale: 80,
      fitness: 90,
      contractYears: 2,
      marketValue: youth.marketValue,
      isFreeAgent: false,
      isProspect: true,
      achievements: ['青训营提拔'],
    };

    set({
      playerTeam: {
        ...state.playerTeam,
        players: [...state.playerTeam.players, promotedPlayer],
        weeklyExpense: state.playerTeam.weeklyExpense + Math.floor(promotedPlayer.salary / 4),
      },
      youthPlayers: state.youthPlayers.filter(y => y.id !== youthId),
      allPlayers: [...state.allPlayers, promotedPlayer],
      weeklySignings: state.weeklySignings + 1,
      weeklyChallenges: state.weeklyChallenges.map(c => {
        if (c.claimed || c.type !== 'sign_players') return c;
        const prog = c.progress + 1;
        return { ...c, progress: prog, completed: prog >= c.target };
      }),
    });

    get().addNotification(`${youth.chineseName} 从青训营提拔至一线队！`);
    get().addNews({
      week: state.currentWeek,
      type: 'transfer',
      title: '青训提拔',
      content: `${state.playerTeam.name}提拔青训学员${youth.chineseName}进入一线队`,
    });

    get().checkAchievements();
  },

  upgradeYouthAcademy: () => {
    const state = get();
    if (state.playerTeam.youthAcademyLevel >= 5) {
      get().addNotification('青训营已达最高等级');
      return;
    }
    const cost = 100000 * state.playerTeam.youthAcademyLevel;
    if (state.playerTeam.budget < cost) {
      get().addNotification('预算不足，无法升级青训营');
      return;
    }

    set({
      playerTeam: {
        ...state.playerTeam,
        budget: state.playerTeam.budget - cost,
        youthAcademyLevel: state.playerTeam.youthAcademyLevel + 1,
      },
    });

    get().addNotification(`青训营升级到 Lv.${state.playerTeam.youthAcademyLevel + 1}！`);
  },

  // ===== 选秀大会 =====
  generateDraftClass: () => {
    const state = get();
    if (state.draftClass && state.draftClass.season === state.currentSeason) return;

    const draftProspects: Player[] = [];
    const agentNames = ['捷风', '雷兹', '不死鸟', '芮娜', '幽影', '蝰蛇', '欧门', '炼狱', '斯凯', '猎枭', '铁臂', 'K/O', '奇乐', '贤者', '零', '保安'];
    const nationalities = ['中国', '韩国', '日本', '美国', '巴西', '土耳其'];

    for (let i = 0; i < 24; i++) {
      const position = PLAYER_POSITIONS[Math.floor(Math.random() * PLAYER_POSITIONS.length)];
      const potential = Math.floor(75 + Math.random() * 20);
      const rating = Math.floor(62 + Math.random() * 18);
      const chineseName = `新秀${String(i + 1).padStart(2, '0')}号`;
      draftProspects.push({
        id: `draft-${state.currentSeason}-${i}`,
        name: `draft${i + 1}`,
        chineseName,
        realName: chineseName,
        age: 18 + Math.floor(Math.random() * 3),
        nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
        teamId: null,
        position,
        mainAgents: [agentNames[Math.floor(Math.random() * agentNames.length)]],
        rating,
        salary: rating * 120,
        stats: { acs: 190 + rating, kda: 1.0 + rating * 0.01, adr: 130 + rating, hsRate: 20 + Math.random() * 10, kast: 65 + Math.random() * 10, firstBlood: 0.08, clutchRate: 0.12 },
        attributes: {
          aim: Math.floor(55 + Math.random() * 25),
          gameSense: Math.floor(50 + Math.random() * 25),
          teamwork: Math.floor(55 + Math.random() * 25),
          utility: Math.floor(50 + Math.random() * 25),
          clutch: Math.floor(50 + Math.random() * 25),
          entry: Math.floor(50 + Math.random() * 25),
          support: Math.floor(50 + Math.random() * 25),
          composure: Math.floor(50 + Math.random() * 25),
          leadership: Math.floor(45 + Math.random() * 25),
          consistency: Math.floor(50 + Math.random() * 25),
        },
        potential,
        morale: 75,
        fitness: 95,
        contractYears: 2,
        marketValue: rating * 1200,
        isFreeAgent: true,
        isProspect: true,
        achievements: [],
      });
    }

    // 生成选秀签位（简化：玩家只有一个首轮签）
    const picks: DraftPick[] = [];
    for (let round = 1; round <= 2; round++) {
      for (let pick = 1; pick <= 12; pick++) {
        picks.push({
          id: `pick-${state.currentSeason}-${round}-${pick}`,
          round,
          pickNumber: pick,
          teamId: pick === 1 ? 'my-team' : `ai-${pick}`,
          selectedPlayerId: null,
        });
      }
    }

    set({
      draftClass: {
        season: state.currentSeason,
        prospects: draftProspects,
        picks,
        isGenerated: true,
      },
    });

    get().addNotification(`${state.currentSeason}赛季选秀大会新秀名单已生成！`);
  },

  draftPlayer: (pickId, playerId) => {
    const state = get();
    if (!state.draftClass) return;
    const pick = state.draftClass.picks.find(p => p.id === pickId);
    const player = state.draftClass.prospects.find(p => p.id === playerId);
    if (!pick || !player || pick.selectedPlayerId || pick.teamId !== 'my-team') return;
    if (state.playerTeam.players.length >= 7) {
      get().addNotification('阵容已满，无法选秀');
      return;
    }

    const draftedPlayer: Player = { ...player, teamId: state.playerTeam.id, isFreeAgent: false };

    set({
      playerTeam: {
        ...state.playerTeam,
        players: [...state.playerTeam.players, draftedPlayer],
        weeklyExpense: state.playerTeam.weeklyExpense + Math.floor(draftedPlayer.salary / 4),
      },
      allPlayers: [...state.allPlayers, draftedPlayer],
      draftClass: {
        ...state.draftClass,
        picks: state.draftClass.picks.map(p =>
          p.id === pickId ? { ...p, selectedPlayerId: playerId } : p
        ),
      },
    });

    get().addNotification(`选秀成功！第${pick.round}轮第${pick.pickNumber}顺位选中 ${player.chineseName}`);
    get().addNews({
      week: state.currentWeek,
      type: 'transfer',
      title: '选秀大会',
      content: `${state.playerTeam.name}选中新秀${player.chineseName}`,
    });
  },

  // ===== 赛前情报 =====
  scoutOpponent: (teamId) => {
    const state = get();
    const opponent = state.availableTeams.find(t => t.id === teamId);
    if (!opponent) return null;

    const scoutCost = 5000;
    if (state.playerTeam.budget < scoutCost) {
      get().addNotification('预算不足，无法收集情报');
      return null;
    }

    const playstyles = ['慢控图', '快攻Rush', '默认控点', '中路夹击', '单摸牵制'];
    const weaknesses = ['防守回合脆弱', '经济控制差', '过于激进', '道具配合不足', '加时赛心理不稳'];
    const tactics = ['稳固防守', '经济反击', '快攻压制', '道具主导', '个人能力'];

    const teamStrength = get().calculateTeamStrength();
    const total = teamStrength + opponent.overallRating;
    const winProbability = total > 0 ? Math.min(0.85, Math.max(0.15, teamStrength / total)) : 0.5;

    const report: ScoutReport = {
      id: generateId(),
      teamId,
      teamName: opponent.chineseName,
      week: state.currentWeek,
      overallRating: opponent.overallRating,
      playstyle: playstyles[Math.floor(Math.random() * playstyles.length)],
      keyPlayers: opponent.players.slice(0, 3).map((_pid, idx) => ({
        name: `选手${idx + 1}`,
        role: PLAYER_POSITIONS[idx % PLAYER_POSITIONS.length],
        threat: Math.floor(opponent.overallRating * (0.8 + Math.random() * 0.4)),
      })),
      weakness: weaknesses[Math.floor(Math.random() * weaknesses.length)],
      recommendedTactic: tactics[Math.floor(Math.random() * tactics.length)],
      winProbability: Math.round(winProbability * 100),
    };

    set({
      playerTeam: { ...state.playerTeam, budget: state.playerTeam.budget - scoutCost },
      scoutReports: [report, ...state.scoutReports.slice(0, 9)],
    });

    get().addNotification(`情报分析完成：${opponent.chineseName} 胜率预测 ${report.winProbability}%`);
    return report;
  },

  // ===== 赞助商与商业 =====
  signSponsorContract: (sponsorName, tier) => {
    const state = get();
    const tierMultipliers: Record<SponsorContract['tier'], number> = {
      bronze: 1,
      silver: 2,
      gold: 3.5,
      platinum: 6,
    };
    const baseBonus = (sponsorPool.find(s => s.name === sponsorName)?.bonus || 30000);
    const multiplier = tierMultipliers[tier];
    const signingBonus = Math.floor(baseBonus * multiplier * 0.5);
    const weeklyIncome = Math.floor(baseBonus * multiplier * 0.08);
    const duration = tier === 'bronze' ? 8 : tier === 'silver' ? 12 : tier === 'gold' ? 16 : 20;

    if (state.playerTeam.sponsorContracts.length >= 5) {
      get().addNotification('赞助商合同已满');
      return;
    }

    const contract: SponsorContract = {
      id: generateId(),
      name: sponsorName,
      tier,
      signingBonus,
      weeklyIncome,
      duration,
      remainingWeeks: duration,
      requirements: {
        minRating: tier === 'gold' ? 80 : tier === 'platinum' ? 85 : undefined,
        minWins: tier === 'silver' ? 5 : tier === 'gold' ? 10 : tier === 'platinum' ? 15 : undefined,
      },
      satisfaction: 80,
    };

    set({
      playerTeam: {
        ...state.playerTeam,
        budget: state.playerTeam.budget + signingBonus,
        sponsorContracts: [...state.playerTeam.sponsorContracts, contract],
        weeklyRevenue: state.playerTeam.weeklyRevenue + weeklyIncome,
      },
    });

    get().addNotification(`签约${tier}赞助商 ${sponsorName}，签约费 $${signingBonus.toLocaleString()}`);
    get().addNews({
      week: state.currentWeek,
      type: 'event',
      title: '赞助合约',
      content: `${sponsorName}与${state.playerTeam.name}签订${tier}级赞助合约`,
    });

    get().checkAchievements();
  },

  runBusinessEvent: (eventType) => {
    const state = get();
    const eventTemplates: Record<BusinessEvent['type'], { name: string; costBase: number; revenueBase: number; fanBase: number; duration: number }> = {
      streaming: { name: '选手直播活动', costBase: 5000, revenueBase: 15000, fanBase: 500, duration: 2 },
      merchandise: { name: '战队周边发售', costBase: 20000, revenueBase: 50000, fanBase: 1200, duration: 4 },
      brand_event: { name: '品牌联名活动', costBase: 30000, revenueBase: 80000, fanBase: 2000, duration: 3 },
      fan_meet: { name: '粉丝见面会', costBase: 10000, revenueBase: 25000, fanBase: 1500, duration: 1 },
    };

    const template = eventTemplates[eventType];
    const reputationBonus = 1 + state.playerTeam.reputation / 200;
    const cost = Math.floor(template.costBase * (1 + Math.random() * 0.2));
    const revenue = Math.floor(template.revenueBase * reputationBonus * (0.9 + Math.random() * 0.3));
    const fanGain = Math.floor(template.fanBase * reputationBonus);

    if (state.playerTeam.budget < cost) {
      get().addNotification('预算不足，无法开展商业活动');
      return;
    }

    const event: BusinessEvent = {
      id: generateId(),
      name: template.name,
      type: eventType,
      cost,
      revenue,
      fanGain,
      duration: template.duration,
      remainingWeeks: template.duration,
      status: 'running',
    };

    set({
      playerTeam: {
        ...state.playerTeam,
        budget: state.playerTeam.budget - cost,
        businessEvents: [...state.playerTeam.businessEvents, event],
      },
    });

    get().addNotification(`启动${template.name}，预计收入 $${revenue.toLocaleString()}，粉丝 +${fanGain.toLocaleString()}`);
  },

  updateSponsorSatisfaction: () => {
    const state = get();
    const teamRating = get().getTeamRating();
    const updatedContracts = state.playerTeam.sponsorContracts.map(contract => {
      let satisfaction = contract.satisfaction;
      if (contract.requirements.minRating && teamRating < contract.requirements.minRating) satisfaction -= 5;
      if (contract.requirements.minWins && state.playerTeam.seasonWins < contract.requirements.minWins) satisfaction -= 3;
      if (state.playerTeam.seasonWins > (contract.requirements.minWins || 0) * 1.5) satisfaction += 2;
      return { ...contract, satisfaction: Math.max(0, Math.min(100, satisfaction)) };
    });

    set({
      playerTeam: { ...state.playerTeam, sponsorContracts: updatedContracts },
    });
  },
  
  // ===== 工具方法 =====
  addNotification: (message) => set((state) => ({
    notifications: [...state.notifications, message]
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  addNews: (item) => set((state) => ({
    newsHistory: [{
      ...item,
      id: generateId(),
      timestamp: Date.now(),
    }, ...state.newsHistory],
  })),
  
  calculateTeamStrength: () => {
    const state = get();
    if (state.playerTeam.players.length === 0) return 0;
    return state.playerTeam.players.reduce((sum, p) => sum + p.rating, 0) / state.playerTeam.players.length;
  },
  
  getTeamRating: () => {
    const avgRating = get().calculateTeamStrength();
    const { wins, losses, chemistry } = get().playerTeam;
    const experienceBonus = (wins - losses) * 0.5;
    const chemistryBonus = (chemistry - 50) * 0.1;
    return Math.max(0, Math.min(100, avgRating + experienceBonus + chemistryBonus));
  },
  
  getOpponentTeams: () => realTeams,
  
  getTeamById: (id: string) => getTeamById(id),
  
  calculateChemistry: () => {
    const state = get();
    if (state.playerTeam.players.length < 2) return 0;
    const avgTeamwork = state.playerTeam.players.reduce((sum, p) => sum + p.attributes.teamwork, 0) / state.playerTeam.players.length;
    return Math.max(0, Math.min(100, state.playerTeam.chemistry + (avgTeamwork - 50) * 0.5));
  },

  // ===== 教程操作 =====
  startTutorial: () => {
    const savedProgress = localStorage.getItem('vct_tutorial_progress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      if (progress.completed) return;
      set({
        tutorial: {
          currentStep: progress.currentStep || 0,
          isActive: true,
          completed: false,
        },
      });
    } else {
      set({
        tutorial: {
          currentStep: 0,
          isActive: true,
          completed: false,
        },
      });
    }
  },

  nextTutorialStep: () => {
    const state = get();
    const nextStep = state.tutorial.currentStep + 1;
    if (nextStep >= tutorialSteps.length) {
      get().completeTutorial();
      return;
    }
    set({
      tutorial: {
        ...state.tutorial,
        currentStep: nextStep,
      },
    });
    localStorage.setItem('vct_tutorial_progress', JSON.stringify({
      currentStep: nextStep,
      completed: false,
    }));
  },

  prevTutorialStep: () => {
    const state = get();
    const prevStep = Math.max(0, state.tutorial.currentStep - 1);
    set({
      tutorial: {
        ...state.tutorial,
        currentStep: prevStep,
      },
    });
    localStorage.setItem('vct_tutorial_progress', JSON.stringify({
      currentStep: prevStep,
      completed: false,
    }));
  },

  completeTutorial: () => {
    set({
      tutorial: {
        currentStep: 0,
        isActive: false,
        completed: true,
      },
    });
    localStorage.setItem('vct_tutorial_progress', JSON.stringify({
      currentStep: 0,
      completed: true,
    }));
  },

  resetTutorial: () => {
    set({
      tutorial: {
        currentStep: 0,
        isActive: true,
        completed: false,
      },
    });
    localStorage.removeItem('vct_tutorial_progress');
  },

  // ===== 剧情操作 =====
  startStoryChapter: (chapterId) => {
    const state = get();
    if (!state.story.unlockedChapters.includes(chapterId)) return;
    
    set({
      story: {
        ...state.story,
        currentChapter: chapterId,
        currentDialogIndex: 0,
        isActive: true,
      },
    });
  },

  nextStoryDialog: () => {
    const state = get();
    if (!state.story.currentChapter) return;
    
    const dialogs = storyDialogs[state.story.currentChapter] || [];
    const nextIndex = state.story.currentDialogIndex + 1;
    
    if (nextIndex >= dialogs.length) {
      const chapterId = state.story.currentChapter;
      set({
        story: {
          ...state.story,
          isActive: false,
          currentChapter: null,
          currentDialogIndex: 0,
          completedChapters: [...state.story.completedChapters, chapterId],
        },
      });
      
      localStorage.setItem('vct_story_progress', JSON.stringify({
        unlockedChapters: [...state.story.unlockedChapters],
        completedChapters: [...state.story.completedChapters, chapterId],
      }));
    } else {
      set({
        story: {
          ...state.story,
          currentDialogIndex: nextIndex,
        },
      });
    }
  },

  closeStory: () => {
    set({
      story: {
        ...get().story,
        isActive: false,
      },
    });
  },

  checkStoryTriggers: () => {
    const state = get();
    const newUnlocked: string[] = [...state.story.unlockedChapters];
    let shouldUpdate = false;

    storyChapters.forEach((chapter) => {
      if (newUnlocked.includes(chapter.id)) return;
      
      const { type, value } = chapter.triggerCondition;
      let triggered = false;

      switch (type) {
        case 'initial':
          triggered = true;
          break;
        case 'first_win':
          triggered = state.playerTeam.wins >= 1;
          break;
        case 'rank_reached':
          triggered = state.playerTeam.ranking <= (typeof value === 'number' ? value : 100);
          break;
        case 'tournament_won':
          triggered = state.completedTournaments.some(t => {
            const match = state.matchHistory.find(m => m.tournamentName === state.availableTournaments.find(at => at.id === t)?.chineseName);
            return t === value && match?.result === 'win';
          });
          break;
        case 'week_reached':
          triggered = state.currentWeek >= (typeof value === 'number' ? value : 1);
          break;
      }

      if (triggered) {
        newUnlocked.push(chapter.id);
        shouldUpdate = true;
        get().addNotification(`剧情解锁：${chapter.title}`);
      }
    });

    if (shouldUpdate) {
      set({
        story: {
          ...state.story,
          unlockedChapters: newUnlocked,
        },
      });

      localStorage.setItem('vct_story_progress', JSON.stringify({
        unlockedChapters: newUnlocked,
        completedChapters: state.story.completedChapters,
      }));
    }
  },

  // ===== 新增：选手休息（心理与状态系统） =====
  restPlayer: (playerId) => {
    const state = get();
    const player = state.playerTeam.players.find(p => p.id === playerId);
    if (!player) return;
    const restCost = 5000;
    if (state.playerTeam.budget < restCost) {
      get().addNotification('预算不足，无法安排休息');
      return;
    }
    const updatedPlayer = {
      ...player,
      fitness: Math.min(100, player.fitness + 25),
      morale: Math.min(100, player.morale + 10),
      mood: 'calm' as PlayerMood,
      hotStreak: 0,
    };
    set({
      playerTeam: {
        ...state.playerTeam,
        budget: state.playerTeam.budget - restCost,
        players: state.playerTeam.players.map(p => p.id === playerId ? updatedPlayer : p),
      },
      allPlayers: state.allPlayers.map(p => p.id === playerId ? updatedPlayer : p),
    });
    get().addNotification(`${player.chineseName} 已安排休息，状态恢复`);
  },

  // ===== 新增：选手化学反应系统 =====
  getPlayerChemistry: (playerA, playerB) => {
    let value = 50;
    const teamworkAvg = (playerA.attributes.teamwork + playerB.attributes.teamwork) / 2;
    value += (teamworkAvg - 50) * 0.4;
    if (playerA.nationality === playerB.nationality) {
      value += 10;
    }
    const minWeeks = Math.min(playerA.weeksWithTeam || 0, playerB.weeksWithTeam || 0);
    if (minWeeks >= 8) {
      value += Math.min(15, Math.floor(minWeeks / 4));
    }
    if (playerA.position !== playerB.position) {
      value += 3;
    }
    return Math.max(0, Math.min(100, Math.round(value)));
  },

  getChemistryMatrix: () => {
    const state = get();
    const players = state.playerTeam.players;
    const pairs: ChemistryPair[] = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const a = players[i];
        const b = players[j];
        const value = get().getPlayerChemistry(a, b);
        const reasons: string[] = [];
        if (a.nationality === b.nationality) reasons.push('同国籍');
        const minWeeks = Math.min(a.weeksWithTeam || 0, b.weeksWithTeam || 0);
        if (minWeeks >= 8) reasons.push(`合作${minWeeks}周`);
        if (a.position !== b.position) reasons.push('位置互补');
        if ((a.attributes.teamwork + b.attributes.teamwork) / 2 > 70) reasons.push('配合默契');
        pairs.push({
          playerAId: a.id,
          playerBId: b.id,
          playerAName: a.chineseName,
          playerBName: b.chineseName,
          value,
          reasons,
        });
      }
    }
    return pairs;
  },

  // ===== 新增：博彩系统 =====
  placeBet: (amount, opponentId, opponentName) => {
    const state = get();
    if (state.betsThisWeek >= 3) {
      get().addNotification('本周下注次数已达上限（3次）');
      return false;
    }
    if (state.pendingBet) {
      get().addNotification('已有待结算的下注，请等待比赛结束');
      return false;
    }
    if (amount <= 0 || state.playerTeam.budget < amount) {
      get().addNotification('下注金额无效或预算不足');
      return false;
    }
    const bet: Bet = {
      id: `bet-${generateId()}`,
      amount,
      week: state.currentWeek,
      opponentId,
      opponentName,
      status: 'pending',
      payout: 0,
    };
    set({
      playerTeam: { ...state.playerTeam, budget: state.playerTeam.budget - amount },
      pendingBet: bet,
      betsThisWeek: state.betsThisWeek + 1,
      totalBetsPlaced: state.totalBetsPlaced + 1,
    });
    get().addNotification(`已下注 $${amount.toLocaleString()} 押注战胜 ${opponentName}（赔率2.0）`);
    get().checkAchievements();
    return true;
  },

  getMatchPrediction: (opponentTeam) => {
    const teamStrength = get().calculateTeamStrength();
    const total = teamStrength + opponentTeam.overallRating;
    const winProb = total > 0 ? Math.min(0.9, Math.max(0.1, teamStrength / total)) : 0.5;
    const odds = Math.max(1.1, Math.min(5.0, Math.round((1 / Math.max(0.05, winProb)) * 100) / 100));
    let recommendation: string;
    if (winProb >= 0.7) recommendation = '稳赢局，可适量下注';
    else if (winProb >= 0.55) recommendation = '略占优势，谨慎下注';
    else if (winProb >= 0.45) recommendation = '势均力敌，不建议下注';
    else recommendation = '处于劣势，避免下注';
    return {
      winProbability: Math.round(winProb * 100),
      odds,
      recommendation,
    };
  },

  // ===== 新增：成就系统 =====
  checkAchievements: () => {
    const state = get();
    const newlyUnlocked: Achievement[] = [];
    const updatedAchievements = state.achievements.map(ach => {
      if (ach.unlocked) return ach;
      let unlock = false;
      switch (ach.id) {
        case 'first_win':
          unlock = state.playerTeam.wins >= 1;
          break;
        case 'ten_wins':
          unlock = state.playerTeam.wins >= 10;
          break;
        case 'fifty_wins':
          unlock = state.playerTeam.wins >= 50;
          break;
        case 'first_championship':
          unlock = state.completedTournaments.length >= 1;
          break;
        case 'five_championships':
          unlock = state.completedTournaments.length >= 5;
          break;
        case 'win_streak_5':
          unlock = state.maxWinStreak >= 5;
          break;
        case 'win_streak_10':
          unlock = state.maxWinStreak >= 10;
          break;
        case 'sign_star':
          unlock = state.transferHistory.some(r => r.type === 'hire');
          break;
        case 'sign_superstar': {
          const signedIds = state.transferHistory
            .filter(r => r.type === 'hire')
            .map(r => r.playerId);
          unlock = state.allPlayers.some(p => signedIds.includes(p.id) && p.rating >= 90);
          break;
        }
        case 'rich_club':
          unlock = state.playerTeam.budget >= 5000000;
          break;
        case 'fan_favorite':
          unlock = state.playerTeam.fanBase >= 100000;
          break;
        case 'top_rank':
          unlock = state.playerTeam.ranking <= 1;
          break;
        case 'youth_promotion':
          unlock = state.allPlayers.some(p => p.isProspect && p.teamId === 'my-team');
          break;
        case 'chemistry_master':
          unlock = get().calculateChemistry() >= 90;
          break;
        case 'training_dedicated':
          unlock = state.totalTrainings >= 50;
          break;
        case 'scout_expert':
          unlock = state.totalScouts >= 10;
          break;
        case 'sponsor_magnet':
          unlock = state.playerTeam.sponsorContracts.length >= 5;
          break;
        case 'bet_master':
          unlock = state.totalBetsWon >= 5;
          break;
        case 'bet_addict':
          unlock = state.totalBetsPlaced >= 10;
          break;
        case 'veteran':
          unlock = state.playerTeam.players.some(p => p.age >= 33);
          break;
        case 'retire_to_coach':
          unlock = state.coaches.length >= 1;
          break;
        case 'season_3':
          unlock = state.currentSeason >= 3;
          break;
        case 'high_reputation':
          unlock = state.playerTeam.reputation >= 90;
          break;
        case 'perfect_team':
          unlock = state.playerTeam.players.length >= 7 &&
            state.playerTeam.players.every(p => p.rating >= 80);
          break;
      }
      if (unlock) {
        const unlocked = { ...ach, unlocked: true, unlockedWeek: state.currentWeek };
        newlyUnlocked.push(unlocked);
        return unlocked;
      }
      return ach;
    });

    if (newlyUnlocked.length === 0) return;

    let cashReward = 0;
    let repReward = 0;
    let fanReward = 0;
    newlyUnlocked.forEach(a => {
      cashReward += a.reward.cash || 0;
      repReward += a.reward.reputation || 0;
      fanReward += a.reward.fans || 0;
      get().addNotification(`🏆 成就解锁：${a.name} - ${a.description}`);
      get().addNews({
        week: state.currentWeek,
        type: 'milestone',
        title: '成就解锁',
        content: `${state.playerTeam.name}达成成就「${a.name}」`,
      });
    });

    set({
      achievements: updatedAchievements,
      playerTeam: {
        ...state.playerTeam,
        budget: state.playerTeam.budget + cashReward,
        reputation: Math.min(100, state.playerTeam.reputation + repReward),
        fanBase: state.playerTeam.fanBase + fanReward,
      },
    });
  },

  // ===== 新增：每周挑战系统 =====
  generateWeeklyChallenges: () => {
    const state = get();
    set({ weeklyChallenges: generateChallenges(state.currentWeek) });
    get().addNotification('本周新挑战已生成！');
  },

  claimChallenge: (challengeId: string) => {
    const state = get();
    const challenge = state.weeklyChallenges.find((c: Challenge) => c.id === challengeId);
    if (!challenge || !challenge.completed || challenge.claimed) return;
    const cash = challenge.reward.cash || 0;
    const rep = challenge.reward.reputation || 0;
    const fans = challenge.reward.fans || 0;
    set({
      playerTeam: {
        ...state.playerTeam,
        budget: state.playerTeam.budget + cash,
        reputation: Math.min(100, state.playerTeam.reputation + rep),
        fanBase: state.playerTeam.fanBase + fans,
      },
      weeklyChallenges: state.weeklyChallenges.map((c: Challenge) =>
        c.id === challengeId ? { ...c, claimed: true } : c
      ),
    });
    get().addNotification(`挑战奖励领取：$${cash.toLocaleString()}${rep ? `，声望+${rep}` : ''}${fans ? `，粉丝+${fans}` : ''}`);
  },

  // ===== 新增：选手退役与传承系统 =====
  retirePlayer: (playerId: string) => {
    const state = get();
    const player = state.playerTeam.players.find((p: Player) => p.id === playerId);
    if (!player) return;
    if (player.age < 28) {
      get().addNotification(`${player.chineseName} 年纪尚轻，不建议退役`);
      return;
    }
    const retired: RetiredPlayer = {
      id: `retired-${generateId()}`,
      playerId: player.id,
      chineseName: player.chineseName,
      nationality: player.nationality,
      position: player.position,
      rating: player.rating,
      attributes: player.attributes,
      age: player.age,
      retiredWeek: state.currentWeek,
      isCoach: false,
    };
    set({
      playerTeam: {
        ...state.playerTeam,
        players: state.playerTeam.players.filter((p: Player) => p.id !== playerId),
        weeklyExpense: Math.max(0, state.playerTeam.weeklyExpense - Math.floor(player.salary / 4)),
      },
      allPlayers: state.allPlayers.map((p: Player) => p.id === playerId ? { ...p, teamId: null, isFreeAgent: true } : p),
      retiredPlayers: [retired, ...state.retiredPlayers],
    });
    get().addNotification(`${player.chineseName} 正式退役，可前往退役名单将其转化为教练`);
    get().addNews({
      week: state.currentWeek,
      type: 'event',
      title: '选手退役',
      content: `${player.chineseName}宣布退役，感谢其为战队做出的贡献`,
    });
    get().checkAchievements();
  },

  convertToCoach: (retiredPlayerId: string) => {
    const state = get();
    const retired = state.retiredPlayers.find((r: RetiredPlayer) => r.id === retiredPlayerId);
    if (!retired || retired.isCoach) return;
    const specialtyMap: Record<string, string> = {
      Duelist: '枪法训练',
      Controller: '道具与意识',
      Initiator: '突破与支援',
      Sentinel: '防守与残局',
    };
    const coach: Coach = {
      id: `coach-${generateId()}`,
      name: retired.chineseName,
      chineseName: retired.chineseName,
      nationality: retired.nationality,
      rating: retired.rating,
      specialty: specialtyMap[retired.position] || '综合训练',
      bonus: {
        trainingBonus: Math.floor(retired.attributes.aim / 20),
        moraleBonus: Math.floor(retired.attributes.leadership / 20),
        chemistryBonus: Math.floor(retired.attributes.teamwork / 25),
      },
    };
    set({
      coaches: [...state.coaches, coach],
      retiredPlayers: state.retiredPlayers.map((r: RetiredPlayer) =>
        r.id === retiredPlayerId ? { ...r, isCoach: true } : r
      ),
      playerTeam: {
        ...state.playerTeam,
        coach: coach.chineseName,
      },
    });
    get().addNotification(`${retired.chineseName} 转型为教练！专长：${coach.specialty}`);
    get().addNews({
      week: state.currentWeek,
      type: 'event',
      title: '教练上任',
      content: `退役选手${retired.chineseName}转型为战队教练`,
    });
    get().checkAchievements();
  },
};
});