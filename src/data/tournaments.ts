// VCT 赛事体系 - 还原真实无畏契约职业赛场结构
export type TournamentStage = 'kickoff' | 'stage1' | 'masters' | 'stage2' | 'champions' | 'challengers' | 'gamechangers';
export type TournamentFormat = 'BO1' | 'BO3' | 'BO5' | 'Swiss';
export type VCTRegion = 'Pacific' | 'Americas' | 'EMEA' | 'China' | 'International';

export interface VCTMapPool {
  maps: string[];
}

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
  vctPoints: number;          // VCT积分
  mapPool: string[];          // 比赛地图池
  description: string;
  startDate?: string;
  emblemColor: string;
}

// 真实VCT年度赛事体系（按照VCT 2024-2025赛制）
export const tournaments: Tournament[] = [
  {
    id: 'vct-kickoff',
    name: 'VCT Kickoff',
    chineseName: 'VCT 启航赛',
    stage: 'kickoff',
    format: 'BO3',
    region: 'Pacific',
    prizePool: 250000,
    entryFee: 5000,
    requiredRank: 70,
    duration: 5,
    participants: 8,
    vctPoints: 50,
    mapPool: ['ascent', 'bind', 'haven', 'split', 'sunset', 'lotus', 'icebox'],
    description: 'VCT赛季揭幕战，各赛区队伍争夺大师赛名额',
    emblemColor: '#FF4655',
  },
  {
    id: 'vct-masters-madrid',
    name: 'VCT Masters Madrid',
    chineseName: 'VCT 马德里大师赛',
    stage: 'masters',
    format: 'BO3',
    region: 'International',
    prizePool: 500000,
    entryFee: 15000,
    requiredRank: 80,
    duration: 7,
    participants: 8,
    vctPoints: 100,
    mapPool: ['ascent', 'bind', 'haven', 'split', 'sunset', 'lotus', 'icebox'],
    description: '全球顶尖战队齐聚马德里，争夺首座大师赛奖杯',
    emblemColor: '#FFD700',
  },
  {
    id: 'vct-stage1',
    name: 'VCT Stage 1',
    chineseName: 'VCT 第一阶段联赛',
    stage: 'stage1',
    format: 'BO3',
    region: 'Pacific',
    prizePool: 250000,
    entryFee: 8000,
    requiredRank: 72,
    duration: 6,
    participants: 10,
    vctPoints: 75,
    mapPool: ['ascent', 'bind', 'haven', 'split', 'sunset', 'lotus', 'icebox', 'fracture'],
    description: '赛区常规赛第一阶段，争夺VCT积分与上海大师赛资格',
    emblemColor: '#00D9FF',
  },
  {
    id: 'vct-masters-shanghai',
    name: 'VCT Masters Shanghai',
    chineseName: 'VCT 上海大师赛',
    stage: 'masters',
    format: 'BO3',
    region: 'International',
    prizePool: 1000000,
    entryFee: 25000,
    requiredRank: 85,
    duration: 10,
    participants: 12,
    vctPoints: 200,
    mapPool: ['ascent', 'bind', 'haven', 'split', 'sunset', 'lotus', 'icebox', 'fracture', 'breeze'],
    description: '上海大师赛 - 全球12支顶级战队争夺世界第二座大师奖杯',
    emblemColor: '#FF4655',
  },
  {
    id: 'vct-stage2',
    name: 'VCT Stage 2',
    chineseName: 'VCT 第二阶段联赛',
    stage: 'stage2',
    format: 'BO3',
    region: 'Pacific',
    prizePool: 250000,
    entryFee: 10000,
    requiredRank: 75,
    duration: 6,
    participants: 10,
    vctPoints: 100,
    mapPool: ['ascent', 'bind', 'haven', 'split', 'sunset', 'lotus', 'icebox', 'fracture', 'pearl'],
    description: '赛区常规赛第二阶段，争夺全球冠军赛参赛资格',
    emblemColor: '#00D9FF',
  },
  {
    id: 'vct-champions',
    name: 'VCT Champions',
    chineseName: 'VCT 全球冠军赛',
    stage: 'champions',
    format: 'BO5',
    region: 'International',
    prizePool: 2250000,
    entryFee: 50000,
    requiredRank: 90,
    duration: 14,
    participants: 16,
    vctPoints: 500,
    mapPool: ['ascent', 'bind', 'haven', 'split', 'sunset', 'lotus', 'icebox', 'fracture', 'breeze', 'pearl', 'abyss'],
    description: '年度最高荣誉 - 16支全球顶尖战队争夺世界冠军王座',
    emblemColor: '#FFD700',
  },
  {
    id: 'vct-challengers',
    name: 'VCT Challengers',
    chineseName: 'VCT 挑战者联赛',
    stage: 'challengers',
    format: 'BO3',
    region: 'Pacific',
    prizePool: 100000,
    entryFee: 2000,
    requiredRank: 60,
    duration: 8,
    participants: 12,
    vctPoints: 25,
    mapPool: ['ascent', 'bind', 'haven', 'split', 'sunset', 'lotus'],
    description: '次级职业联赛 - 升降级通道，冲击VCT国际联赛席位',
    emblemColor: '#6C5CE7',
  },
  {
    id: 'vct-game-changers',
    name: 'VCT Game Changers',
    chineseName: 'VCT 改变者赛',
    stage: 'gamechangers',
    format: 'BO3',
    region: 'International',
    prizePool: 500000,
    entryFee: 5000,
    requiredRank: 70,
    duration: 7,
    participants: 8,
    vctPoints: 50,
    mapPool: ['ascent', 'bind', 'haven', 'split', 'sunset', 'lotus', 'icebox'],
    description: '女子选手专属世界赛 - 推动电竞多元化发展',
    emblemColor: '#EC4899',
  },
];

export const stageNames: Record<TournamentStage, string> = {
  kickoff: '启航赛',
  stage1: '第一阶段',
  masters: '大师赛',
  stage2: '第二阶段',
  champions: '全球冠军赛',
  challengers: '挑战者联赛',
  gamechangers: '改变者赛',
};

export const stageOrder: TournamentStage[] = ['kickoff', 'stage1', 'masters', 'stage2', 'champions', 'challengers', 'gamechangers'];

export const regionNames: Record<VCTRegion, string> = {
  Pacific: '太平洋',
  Americas: '美洲',
  EMEA: 'EMEA',
  China: '中国',
  International: '国际',
};

export const formatNames: Record<TournamentFormat, string> = {
  BO1: '单局制',
  BO3: '三局两胜',
  BO5: '五局三胜',
  Swiss: '瑞士轮',
};

export const levelNames: Record<string, string> = {
  Tier1: 'S级赛事',
  Tier2: 'A级赛事',
  Tier3: 'B级赛事',
};

// VCT年度时间线（按赛制节奏）
export const vctTimeline = [
  { week: 1, stage: 'kickoff', name: 'VCT启航赛', description: '赛季揭幕' },
  { week: 3, stage: 'masters', name: '马德里大师赛', description: '首届大师赛' },
  { week: 5, stage: 'stage1', name: '第一阶段联赛', description: '赛区常规赛' },
  { week: 8, stage: 'masters', name: '上海大师赛', description: '全球第二站' },
  { week: 10, stage: 'stage2', name: '第二阶段联赛', description: '赛区常规赛' },
  { week: 13, stage: 'champions', name: '全球冠军赛', description: '年度巅峰' },
];

export const getTournamentsByStage = (stage: TournamentStage): Tournament[] =>
  tournaments.filter(t => t.stage === stage);

export const getTournamentsByRegion = (region: VCTRegion): Tournament[] =>
  tournaments.filter(t => t.region === region || t.region === 'International');
