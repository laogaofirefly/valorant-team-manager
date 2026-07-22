// 战队设施系统
export interface Facility {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  level: number;
  maxLevel: number;
  upgradeCost: number;
  // 设施效果
  effects: {
    trainingBonus?: number;      // 训练加成
    moraleBonus?: number;        // 士气加成
    fitnessBonus?: number;       // 状态恢复加成
    scoutingBonus?: number;      // 球探加成
    revenueBonus?: number;       // 收入加成
    chemistryBonus?: number;     // 默契度加成
  };
}

export const initialFacilities: Facility[] = [
  {
    id: 'training-room',
    name: 'Training Room',
    chineseName: '训练室',
    description: '提升选手训练效率',
    level: 1,
    maxLevel: 5,
    upgradeCost: 50000,
    effects: { trainingBonus: 0.1 },
  },
  {
    id: 'gaming-house',
    name: 'Gaming House',
    chineseName: '战队基地',
    description: '提升选手士气和状态恢复',
    level: 1,
    maxLevel: 5,
    upgradeCost: 80000,
    effects: { moraleBonus: 5, fitnessBonus: 5 },
  },
  {
    id: 'analytics-center',
    name: 'Analytics Center',
    chineseName: '数据分析中心',
    description: '提升球探发现新人的能力',
    level: 1,
    maxLevel: 5,
    upgradeCost: 100000,
    effects: { scoutingBonus: 0.15 },
  },
  {
    id: 'sponsor-room',
    name: 'Sponsor Room',
    chineseName: '商务中心',
    description: '提升赞助商收入',
    level: 1,
    maxLevel: 5,
    upgradeCost: 60000,
    effects: { revenueBonus: 0.2 },
  },
  {
    id: 'team-building',
    name: 'Team Building',
    chineseName: '团建设施',
    description: '提升选手默契度',
    level: 1,
    maxLevel: 5,
    upgradeCost: 70000,
    effects: { chemistryBonus: 0.1 },
  },
];

export const getFacilityById = (id: string): Facility | undefined => initialFacilities.find(f => f.id === id);

export const getUpgradeCost = (facility: Facility): number => {
  return Math.floor(facility.upgradeCost * Math.pow(1.5, facility.level - 1));
};
