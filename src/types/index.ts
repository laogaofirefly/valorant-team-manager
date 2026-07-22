// ============================================
// 核心类型定义 - 统一管理所有接口和类型
// ============================================

// ===== 选手心理与状态 =====
export type PlayerMood = 'excited' | 'calm' | 'anxious' | 'tired';

export const MOOD_LABELS: Record<PlayerMood, string> = {
  excited: '兴奋',
  calm: '平静',
  anxious: '焦虑',
  tired: '疲惫',
};

export const MOOD_LEVELS: Record<PlayerMood, number> = {
  tired: 0,
  anxious: 1,
  calm: 2,
  excited: 3,
};

// ===== 选手属性 =====
export interface PlayerAttributes {
  aim: number;          // 枪法
  gameSense: number;    // 意识
  teamwork: number;     // 配合
  utility: number;      // 道具使用
  clutch: number;       // 残局能力
  entry: number;        // 突破能力
  support: number;      // 支援能力
  composure: number;    // 抗压能力
  leadership: number;   // 领导力
  consistency: number;  // 稳定性
}

export interface PlayerStats {
  acs: number;
  kda: number;
  adr: number;
  hsRate: number;
  kast: number;
  firstBlood: number;
  clutchRate: number;
}

export interface Player {
  id: string;
  name: string;
  chineseName: string;
  realName: string;
  age: number;
  nationality: string;
  teamId: string | null;
  position: AgentRole;
  mainAgents: string[];
  rating: number;
  salary: number;
  stats: PlayerStats;
  attributes: PlayerAttributes;
  potential: number;
  morale: number;
  fitness: number;
  contractYears: number;
  marketValue: number;
  isFreeAgent: boolean;
  isProspect: boolean;
  achievements: string[];
  // 新增：心理与状态系统
  mood?: PlayerMood;
  hotStreak?: number;       // 手感火热周数
  weeksWithTeam?: number;   // 在战队效力的周数
}

// ===== 特工相关 =====
export type AgentRole = 'Duelist' | 'Controller' | 'Initiator' | 'Sentinel';

export interface Agent {
  id: string;
  name: string;
  chineseName: string;
  role: AgentRole;
  difficulty: number;
  description: string;
}

// ===== 战队相关 =====
export interface Team {
  id: string;
  name: string;
  chineseName: string;
  region: 'Pacific' | 'Americas' | 'EMEA' | 'China';
  players: string[];
  coach: string;
  foundingYear: number;
  achievements: string[];
  overallRating: number;
  color: string;
}

export interface SponsorContract {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  signingBonus: number;
  weeklyIncome: number;
  duration: number; // 周数
  remainingWeeks: number;
  requirements: {
    minRating?: number;
    minWins?: number;
    minVctPoints?: number;
  };
  satisfaction: number; // 0-100
}

export interface BusinessEvent {
  id: string;
  name: string;
  type: 'streaming' | 'merchandise' | 'brand_event' | 'fan_meet';
  cost: number;
  revenue: number;
  fanGain: number;
  duration: number;
  remainingWeeks: number;
  status: 'running' | 'completed';
}

export interface AuctionItem {
  id: string;
  playerId: string;
  player: Player;
  startingPrice: number;
  currentBid: number;
  currentBidder: string | null; // 'player' 或 AI战队id
  bids: { bidder: string; amount: number; week: number }[];
  weeksRemaining: number;
  status: 'active' | 'won' | 'lost' | 'expired';
  sourceTeam: string | null;
  buyoutPrice: number;        // 一口价：直接以市场价买断
  competitionLevel: 'low' | 'medium' | 'high'; // 预计竞争程度
  interestedTeams: string[];  // 当前感兴趣的AI战队列表
}

// ===== 转会系统扩展 =====

// 转会窗状态
export type TransferWindowStatus = 'open' | 'closed' | 'opening_soon';

export interface TransferWindow {
  status: TransferWindowStatus;
  label: string;              // 当前窗口名称（如"夏季转会窗"）
  weeksUntilOpen: number;     // 距离下次开放周数（status=closed/opening_soon 时有意义）
}

// 转会记录
export type TransferType = 'hire' | 'release' | 'trade' | 'loan' | 'auction' | 'buyout';

export interface TransferRecord {
  id: string;
  week: number;
  season: number;
  type: TransferType;
  playerName: string;
  playerId: string;
  fromTeam: string | null;    // 原属战队名称（null表示自由选手）
  toTeam: string;             // 目标战队名称
  fee: number;                // 转会费/签约费/违约金
  contractYears?: number;     // 合同年限（hire/trade/buyout时有意义）
  loanWeeks?: number;         // 租借周数（loan时有意义）
  details?: string;           // 额外说明
}

// 租借合同
export interface LoanDeal {
  id: string;
  playerId: string;
  playerName: string;
  fromTeamId: string;         // 实际归属战队
  toTeamId: string;           // 租借至战队（玩家战队）
  weeklyFee: number;          // 每周支付的租借费（部分薪资）
  remainingWeeks: number;     // 剩余租借周数
  totalWeeks: number;         // 总租借周数
  returnClause: number;       // 提前召回违约金
}

// 合同谈判选项
export interface ContractOption {
  years: number;
  signingFeeMultiplier: number;  // 签约费 = 市场价 * 倍率
  label: string;
}

// 交易提案
export interface TradeProposal {
  myPlayerId: string;
  targetPlayerId: string;
  targetTeamId: string;
  additionalMoney: number;    // 玩家额外补差价
}

export interface YouthPlayer {
  id: string;
  name: string;
  chineseName: string;
  age: number;
  nationality: string;
  position: AgentRole;
  rating: number;
  potential: number;
  weeksInAcademy: number;
  trainingFocus: string | null;
  attributes: Partial<PlayerAttributes>;
  mainAgents: string[];
  marketValue: number;
  isReady: boolean;
}

export interface DraftClass {
  season: number;
  prospects: Player[];
  picks: DraftPick[];
  isGenerated: boolean;
}

export interface DraftPick {
  id: string;
  round: number;
  pickNumber: number;
  teamId: string;
  selectedPlayerId: string | null;
}

export interface ScoutReport {
  id: string;
  teamId: string;
  teamName: string;
  week: number;
  overallRating: number;
  playstyle: string;
  keyPlayers: { name: string; role: string; threat: number }[];
  weakness: string;
  recommendedTactic: string;
  winProbability: number;
}

export interface PlayerTeam {
  id: string;
  name: string;
  players: Player[];
  coach: string;
  budget: number;
  sponsors: string[];
  ranking: number;
  wins: number;
  losses: number;
  draws: number;
  chemistry: number;
  selectedTactic: Tactic;
  facilities: Facility[];
  vctPoints: number;
  seasonWins: number;
  seasonLosses: number;
  seasonPrize: number;
  weeklyRevenue: number;
  weeklyExpense: number;
  fanBase: number;
  reputation: number;
  youthAcademyLevel: number;
  sponsorContracts: SponsorContract[];
  businessEvents: BusinessEvent[];
}

// ===== 战术系统 =====
export type TacticType = 'Attack' | 'Defense' | 'Economy' | 'Aggressive' | 'Passive';

export interface Tactic {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  type: TacticType;
  attributeBonuses: {
    aim?: number;
    gameSense?: number;
    teamwork?: number;
    utility?: number;
    clutch?: number;
    entry?: number;
    support?: number;
    composure?: number;
  };
  successRateModifier: number;
  bestPositions: string[];
  risk: number;
}

// ===== 设施 =====
export interface Facility {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  level: number;
  maxLevel: number;
  upgradeCost: number;
  effects: {
    trainingBonus?: number;
    moraleBonus?: number;
    fitnessBonus?: number;
    scoutingBonus?: number;
    revenueBonus?: number;
    chemistryBonus?: number;
  };
}

// ===== 赛事相关 =====
export type TournamentFormat = 'BO1' | 'BO3' | 'BO5' | 'Swiss';
export type TournamentStage = 'kickoff' | 'stage1' | 'masters' | 'stage2' | 'champions' | 'challengers' | 'gamechangers';
export type VCTRegion = 'Pacific' | 'Americas' | 'EMEA' | 'China' | 'International';

export interface Tournament {
  id: string;
  name: string;
  chineseName: string;
  stage: TournamentStage;
  format: TournamentFormat;
  region: VCTRegion;
  prizePool: number;
  entryFee: number;
  requiredRank: number;
  duration: number;
  participants: number;
  vctPoints: number;
  mapPool: string[];
  description: string;
  startDate?: string;
  emblemColor: string;
}

export interface MapResult {
  mapName: string;
  teamScore: number;
  opponentScore: number;
  winner: string;
}

export interface MatchResult {
  id: string;
  opponentName: string;
  opponentId: string;
  result: 'win' | 'loss' | 'draw';
  score: { team: number; opponent: number };
  tournamentName: string;
  date: string;
  mvp: Player | null;
  tacticUsed: string;
  teamRating: number;
  opponentRating: number;
  mapResults?: MapResult[];
}

// ===== 地图 =====
export interface GameMap {
  id: string;
  name: string;
  chineseName: string;
  type: 'Attack' | 'Defense' | 'Balanced';
  bestAgents: string[];
  difficulty: number;
}

// ===== 新闻与记录 =====
export type NewsType = 'transfer' | 'match' | 'event' | 'injury' | 'contract' | 'season' | 'milestone';

export interface NewsItem {
  id: string;
  week: number;
  type: NewsType;
  title: string;
  content: string;
  timestamp: number;
}

export interface SeasonRecord {
  season: number;
  wins: number;
  losses: number;
  vctPoints: number;
  bestFinish: string;
  prizeMoney: number;
}

export interface VCTStanding {
  teamId: string;
  teamName: string;
  region: string;
  wins: number;
  losses: number;
  points: number;
  color: string;
}

// ===== BP系统 =====
export interface BPStep {
  type: 'ban' | 'pick';
  team: 'player' | 'opponent';
  mapId?: string;
  mapName?: string;
}

export interface BPPhase {
  steps: BPStep[];
  currentStep: number;
  availableMaps: string[];
  pickedMaps: string[];
  bannedMaps: string[];
}

// ===== 比赛详细状态 =====
export interface DetailedMatchState {
  phase: 'bp' | 'map-play' | 'finished';
  bpPhase?: BPPhase;
  currentMapIndex: number;
  mapResults: MapResult[];
  opponent?: Team;
  tournament?: Tournament;
  format: TournamentFormat;
}

// ===== 新手教程 =====
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetPage?: string;
  highlightSelector?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface TutorialState {
  currentStep: number;
  isActive: boolean;
  completed: boolean;
}

// ===== 剧情模式 =====
export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  triggerCondition: StoryTriggerCondition;
}

export interface StoryTriggerCondition {
  type: 'initial' | 'first_win' | 'rank_reached' | 'tournament_won' | 'week_reached';
  value?: number | string;
}

export interface StoryDialog {
  id: string;
  chapterId: string;
  speaker: string;
  speakerAvatar?: string;
  text: string;
  type: 'narration' | 'dialog' | 'event';
}

export interface StoryState {
  currentChapter: string | null;
  currentDialogIndex: number;
  isActive: boolean;
  unlockedChapters: string[];
  completedChapters: string[];
}

// ===== 游戏状态 =====
export type GamePhase = 'preseason' | 'regular' | 'playoffs' | 'offseason';

export interface GameState {
  playerTeam: PlayerTeam;
  allPlayers: Player[];
  availableTournaments: Tournament[];
  availableMaps: GameMap[];
  availableTeams: Team[];
  availableTactics: Tactic[];
  currentWeek: number;
  currentSeason: number;
  gamePhase: GamePhase;
  selectedPlayer: Player | null;
  selectedTournament: Tournament | null;
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
}

// ===== 选手化学反应 =====
export interface ChemistryPair {
  playerAId: string;
  playerBId: string;
  playerAName: string;
  playerBName: string;
  value: number; // 0-100
  reasons: string[];
}

// ===== 博彩系统 =====
export interface Bet {
  id: string;
  amount: number;
  week: number;
  opponentId: string;
  opponentName: string;
  status: 'pending' | 'won' | 'lost';
  payout: number;
}

export interface MatchPrediction {
  winProbability: number; // 0-100
  odds: number; // 赔率，如 1.85
  recommendation: string;
}

// ===== 成就系统 =====
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'match' | 'transfer' | 'finance' | 'training' | 'special';
  unlocked: boolean;
  unlockedWeek?: number;
  reward: {
    cash?: number;
    reputation?: number;
    fans?: number;
  };
}

// ===== 每周挑战 =====
export type ChallengeType = 'win_matches' | 'train_players' | 'sign_players' | 'scout_players' | 'earn_money' | 'play_matches';

export interface Challenge {
  id: string;
  type: ChallengeType;
  description: string;
  target: number;
  progress: number;
  reward: {
    cash?: number;
    reputation?: number;
    fans?: number;
  };
  completed: boolean;
  claimed: boolean;
  week: number;
}

// ===== 退役选手与教练 =====
export interface RetiredPlayer {
  id: string;
  playerId: string;
  chineseName: string;
  nationality: string;
  position: AgentRole;
  rating: number;
  attributes: PlayerAttributes;
  age: number;
  retiredWeek: number;
  isCoach: boolean;
}

export interface Coach {
  id: string;
  name: string;
  chineseName: string;
  nationality: string;
  rating: number;
  specialty: string;
  bonus: {
    trainingBonus?: number;
    moraleBonus?: number;
    chemistryBonus?: number;
  };
}

// ===== 常量 =====
export const PLAYER_POSITIONS: AgentRole[] = ['Duelist', 'Controller', 'Initiator', 'Sentinel'];

export const ATTRIBUTE_LABELS: Record<keyof PlayerAttributes, string> = {
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

export const STAGE_NAMES: Record<TournamentStage, string> = {
  kickoff: '启航赛',
  stage1: '第一阶段',
  masters: '大师赛',
  stage2: '第二阶段',
  champions: '全球冠军赛',
  challengers: '挑战者联赛',
  gamechangers: '改变者赛',
};

export const FORMAT_NAMES: Record<TournamentFormat, string> = {
  BO1: '单局制',
  BO3: '三局两胜',
  BO5: '五局三胜',
  Swiss: '瑞士轮',
};

export const REGIONS = ['太平洋', '美洲', 'EMEA', '中国'] as const;
export type Region = typeof REGIONS[number];

// ===== 转会系统常量 =====

// 合同谈判选项：年限越长，签约费倍率越高（多付钱锁定更久）
export const CONTRACT_OPTIONS: ContractOption[] = [
  { years: 1, signingFeeMultiplier: 0.85, label: '1年短约' },
  { years: 2, signingFeeMultiplier: 1.0, label: '2年标准' },
  { years: 3, signingFeeMultiplier: 1.2, label: '3年长约' },
  { years: 4, signingFeeMultiplier: 1.45, label: '4年顶薪' },
];

// 转会窗开启周段（休赛期 17+ 和赛季中段 7-8）
export const TRANSFER_WINDOW_OPEN_WEEKS: number[] = [
  // offseason
  17, 18, 19, 20, 21, 22,
  // mid-season
  7, 8,
];

// 国籍筛选选项
export const NATIONALITIES = [
  '全部', '中国', '韩国', '日本', '美国', '巴西', '加拿大',
  '英国', '法国', '德国', '俄罗斯', '波兰', '土耳其', '芬兰',
  '丹麦', '瑞典', '新加坡', '印度', '菲律宾', '罗马尼亚',
] as const;