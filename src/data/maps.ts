export interface Map {
  id: string;
  name: string;
  chineseName: string;
  type: 'Attack' | 'Defense' | 'Balanced';
  bestAgents: string[];
  difficulty: number;
}

export const maps: Map[] = [
  { id: 'ascent', name: 'Ascent', chineseName: '亚海悬城', type: 'Balanced', bestAgents: ['omen', 'jett', 'sova', 'cypher'], difficulty: 3 },
  { id: 'bind', name: 'Bind', chineseName: '隐世修所', type: 'Attack', bestAgents: ['brimstone', 'raze', 'sova', 'killjoy'], difficulty: 2 },
  { id: 'haven', name: 'Haven', chineseName: '幽邃地窟', type: 'Defense', bestAgents: ['astra', 'phoenix', 'fade', 'sage'], difficulty: 4 },
  { id: 'split', name: 'Split', chineseName: '裂变峡谷', type: 'Attack', bestAgents: ['viper', 'neon', 'gekko', 'cypher'], difficulty: 3 },
  { id: 'breeze', name: 'Breeze', chineseName: '微风岛屿', type: 'Defense', bestAgents: ['viper', 'sova', 'clove', 'chamber'], difficulty: 4 },
  { id: 'icebox', name: 'Icebox', chineseName: '森寒冬港', type: 'Defense', bestAgents: ['viper', 'sova', 'killjoy', 'jett'], difficulty: 5 },
  { id: 'lotus', name: 'Lotus', chineseName: '莲华古城', type: 'Balanced', bestAgents: ['astra', 'reyna', 'fade', 'sage'], difficulty: 4 },
  { id: 'sunset', name: 'Sunset', chineseName: '日落之城', type: 'Attack', bestAgents: ['omen', 'raze', 'gekko', 'cypher'], difficulty: 3 },
  { id: 'fracture', name: 'Fracture', chineseName: '双塔迷城', type: 'Balanced', bestAgents: ['brimstone', 'phoenix', 'fade', 'chamber'], difficulty: 4 },
  { id: 'pearl', name: 'Pearl', chineseName: '深海明珠', type: 'Attack', bestAgents: ['omen', 'jett', 'gekko', 'killjoy'], difficulty: 3 },
  { id: 'abyss', name: 'Abyss', chineseName: '渊域', type: 'Defense', bestAgents: ['viper', 'sova', 'cypher', 'clove'], difficulty: 4 },
];

export const mapTypeNames: Record<Map['type'], string> = {
  Attack: '进攻优势',
  Defense: '防守优势',
  Balanced: '平衡',
};
