// 战术系统
export interface Tactic {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  type: 'Attack' | 'Defense' | 'Economy' | 'Aggressive' | 'Passive';
  // 战术对各属性的加成
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
  // 战术成功概率修正
  successRateModifier: number;
  // 适用位置
  bestPositions: string[];
  // 风险等级 (1-5)
  risk: number;
}

export const tactics: Tactic[] = [
  {
    id: 'default',
    name: 'Default',
    chineseName: '默认战术',
    description: '均衡的战术配置，适合大多数情况',
    type: 'Passive',
    attributeBonuses: {},
    successRateModifier: 0,
    bestPositions: ['Duelist', 'Controller', 'Initiator', 'Sentinel'],
    risk: 1,
  },
  {
    id: 'rush',
    name: 'Rush B',
    chineseName: 'B点强攻',
    description: '集中火力快速突破B点，高风险高回报',
    type: 'Aggressive',
    attributeBonuses: { entry: 10, aim: 5, composure: -5 },
    successRateModifier: 0.1,
    bestPositions: ['Duelist', 'Initiator'],
    risk: 4,
  },
  {
    id: 'slow-push',
    name: 'Slow Push',
    chineseName: '慢推控图',
    description: '慢慢推进，控制地图资源，稳健战术',
    type: 'Passive',
    attributeBonuses: { gameSense: 10, utility: 8, teamwork: 5 },
    successRateModifier: 0.05,
    bestPositions: ['Controller', 'Sentinel', 'Initiator'],
    risk: 2,
  },
  {
    id: 'eco-stack',
    name: 'Eco Stack',
    chineseName: '经济局堆积',
    description: '经济局集中人数优势，寻找翻盘机会',
    type: 'Economy',
    attributeBonuses: { composure: 10, clutch: 8, gameSense: 5 },
    successRateModifier: -0.05,
    bestPositions: ['Sentinel', 'Controller'],
    risk: 3,
  },
  {
    id: 'aggressive-defense',
    name: 'Aggressive Defense',
    chineseName: '积极防守',
    description: '前压防守，主动出击打乱对手节奏',
    type: 'Defense',
    attributeBonuses: { entry: 8, aim: 5, composure: -3 },
    successRateModifier: 0.08,
    bestPositions: ['Duelist', 'Initiator', 'Sentinel'],
    risk: 3,
  },
  {
    id: 'retake',
    name: 'Retake',
    chineseName: '回防战术',
    description: '放弃前压，集中回防夺回点位',
    type: 'Defense',
    attributeBonuses: { teamwork: 10, composure: 8, utility: 5 },
    successRateModifier: 0.03,
    bestPositions: ['Controller', 'Sentinel', 'Initiator'],
    risk: 2,
  },
  {
    id: 'split-push',
    name: 'Split Push',
    chineseName: '分推战术',
    description: '多点分推，分散对手防守注意力',
    type: 'Attack',
    attributeBonuses: { gameSense: 8, teamwork: 5, entry: 5 },
    successRateModifier: 0.06,
    bestPositions: ['Duelist', 'Initiator'],
    risk: 3,
  },
  {
    id: 'post-plant',
    name: 'Post Plant',
    chineseName: '安包后防守',
    description: '专注于安包后的防守，利用道具拖延时间',
    type: 'Defense',
    attributeBonuses: { utility: 12, composure: 8, support: 5 },
    successRateModifier: 0.07,
    bestPositions: ['Controller', 'Sentinel'],
    risk: 2,
  },
];

export const getTacticById = (id: string): Tactic | undefined => tactics.find(t => t.id === id);

export const getTacticsByType = (type: Tactic['type']): Tactic[] => tactics.filter(t => t.type === type);

export const tacticTypeNames: Record<Tactic['type'], string> = {
  Attack: '进攻战术',
  Defense: '防守战术',
  Economy: '经济战术',
  Aggressive: '激进战术',
  Passive: '稳健战术',
};
