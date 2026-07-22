import type { Agent, AgentRole } from './agents';
import { agents } from './agents';

// 选手多维度属性
export interface PlayerAttributes {
  aim: number;          // 枪法 (0-100)
  gameSense: number;    // 意识 (0-100)
  teamwork: number;     // 配合 (0-100)
  utility: number;      // 道具使用 (0-100)
  clutch: number;       // 残局能力 (0-100)
  entry: number;        // 突破能力 (0-100)
  support: number;      // 支援能力 (0-100)
  composure: number;    // 抗压能力 (0-100)
  leadership: number;   // 领导力 (0-100)
  consistency: number;  // 稳定性 (0-100)
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
  stats: {
    acs: number;
    kda: number;
    adr: number;
    hsRate: number;
    kast: number;
    firstBlood: number;  // 首杀率
    clutchRate: number;  // 残局胜率
  };
  attributes: PlayerAttributes;
  potential: number;
  morale: number;
  fitness: number;
  contractYears: number;  // 合同年限
  marketValue: number;
  isFreeAgent: boolean;
  isProspect: boolean;    // 是否为新秀
  achievements: string[];
}

// 根据评级生成多维度属性
const generateAttributes = (rating: number, position: AgentRole, seed: number): PlayerAttributes => {
  const rand = (base: number, variance: number) => Math.max(40, Math.min(99, Math.floor(base + (Math.sin(seed++) * variance))));
  const base = rating;
  
  const positionBonus: Record<AgentRole, Partial<PlayerAttributes>> = {
    Duelist: { entry: 10, aim: 5, clutch: 5 },
    Controller: { utility: 12, gameSense: 5 },
    Initiator: { support: 8, gameSense: 6, utility: 5 },
    Sentinel: { support: 10, composure: 5, teamwork: 5 },
  };
  
  const bonus = positionBonus[position];
  
  return {
    aim: rand(base, 8) + (bonus.aim || 0),
    gameSense: rand(base - 2, 10) + (bonus.gameSense || 0),
    teamwork: rand(base - 3, 12) + (bonus.teamwork || 0),
    utility: rand(base - 5, 15) + (bonus.utility || 0),
    clutch: rand(base - 2, 10) + (bonus.clutch || 0),
    entry: rand(base - 4, 12) + (bonus.entry || 0),
    support: rand(base - 5, 15) + (bonus.support || 0),
    composure: rand(base - 3, 10) + (bonus.composure || 0),
    leadership: rand(base - 10, 15),
    consistency: rand(base - 4, 12),
  };
};

const generateStats = (rating: number, attrs?: PlayerAttributes) => {
  const aim = attrs?.aim || rating;
  const clutch = attrs?.clutch || rating;
  return {
    acs: Math.floor(200 + rating * 2.5 + Math.sin(aim) * 30),
    kda: Math.round((1.2 + rating * 0.08 + (aim - 80) * 0.01) * 10) / 10,
    adr: Math.floor(120 + rating * 2 + Math.sin(aim) * 25),
    hsRate: Math.floor(30 + (aim - 80) * 0.8 + Math.random() * 10),
    kast: Math.floor(70 + rating * 1.5 + Math.random() * 8),
    firstBlood: Math.floor(15 + (attrs?.entry || rating - 80) * 0.5),
    clutchRate: Math.floor(40 + (clutch - 80) * 0.8),
  };
};

// 创建选手的辅助函数
let playerIdCounter = 0;
const createPlayer = (
  id: string,
  name: string,
  chineseName: string,
  realName: string,
  age: number,
  nationality: string,
  teamId: string | null,
  position: AgentRole,
  mainAgents: string[],
  rating: number,
  salary: number,
  marketValue: number,
  potential: number,
  morale: number = 80,
  fitness: number = 85,
  contractYears: number = 2,
  isFreeAgent: boolean = false,
  isProspect: boolean = false,
  achievements: string[] = [],
): Player => {
  playerIdCounter++;
  const attributes = generateAttributes(rating, position, playerIdCounter);
  return {
    id, name, chineseName, realName, age, nationality, teamId, position, mainAgents,
    rating, salary, marketValue, potential, morale, fitness, contractYears,
    isFreeAgent, isProspect, achievements,
    stats: generateStats(rating, attributes),
    attributes,
  };
};

export const realPlayers: Player[] = [
  // ===== 太平洋赛区 - DRX =====
  createPlayer('beyn', 'BeYN', 'BeYN', 'Kim Tae-young', 23, '韩国', 'drx', 'Initiator', ['sova', 'fade'], 92, 380000, 650000, 95, 90, 88, 3, false, false, ['2023 Pacific League Champion']),
  createPlayer('flicker', 'Flicker', 'Flicker', 'Kim Yeong-hun', 22, '韩国', 'drx', 'Duelist', ['jett', 'phoenix'], 91, 350000, 600000, 94, 88, 90, 2, false, false, ['2023 Pacific League Champion']),
  createPlayer('free1ng', 'free1ng', 'free1ng', 'Kim Min-seok', 24, '韩国', 'drx', 'Controller', ['omen', 'clove'], 90, 320000, 550000, 93, 85, 86, 2, false, false),
  createPlayer('hyunmin', 'HYUNMIN', 'HYUNMIN', 'Park Hyun-min', 21, '韩国', 'drx', 'Sentinel', ['cypher', 'killjoy'], 89, 300000, 500000, 92, 82, 84, 2, false, false),
  createPlayer('mako', 'MaKo', 'MaKo', 'Kim Yeong-seok', 25, '韩国', 'drx', 'Controller', ['brimstone', 'astra'], 91, 360000, 620000, 94, 88, 85, 3, false, false, ['2022 VCT Champions']),
  createPlayer('yong', 'Yong', 'Yong', 'Lee Yong-hun', 23, '韩国', 'drx', 'Duelist', ['reyna', 'neon'], 88, 280000, 450000, 91, 80, 82, 2, false, false),

  // ===== 太平洋赛区 - Gen.G =====
  createPlayer('efina', 'Efina', 'Efina', 'Kim Nak-yeon', 22, '韩国', 'gen', 'Duelist', ['jett', 'phoenix'], 93, 400000, 700000, 96, 92, 90, 3, false, false, ['2024 Shanghai Master Champion']),
  createPlayer('t3xture', 't3xture', 't3xture', 'Kim Na-ra', 23, '韩国', 'gen', 'Duelist', ['raze', 'neon'], 92, 380000, 650000, 95, 88, 86, 3, false, false, ['2024 Shanghai Master Champion']),
  createPlayer('karon', 'Karon', 'Karon', 'Kim Won-tae', 24, '韩国', 'gen', 'Controller', ['omen', 'astra'], 90, 340000, 580000, 93, 85, 84, 2, false, false, ['2024 Shanghai Master Champion']),
  createPlayer('ash', 'Ash', 'Ash', 'Ha Hyun-cheol', 24, '韩国', 'gen', 'Controller', ['clove', 'viper'], 89, 320000, 520000, 92, 82, 80, 2, false, false),
  createPlayer('raxcal', 'RaxcaL', 'RaxcaL', 'Kim Min-seok', 22, '韩国', 'gen', 'Initiator', ['gekko', 'fade'], 90, 330000, 560000, 93, 86, 85, 2, false, false),
  createPlayer('lakia', 'Lakia', 'Lakia', 'Kim Jong-min', 25, '韩国', 'gen', 'Initiator', ['sova', 'gekko'], 88, 300000, 480000, 90, 82, 84, 2, false, false, ['2024 Shanghai Master Champion']),

  // ===== 太平洋赛区 - Paper Rex =====
  createPlayer('d4v41', 'd4v41', 'd4v41', 'David Ang', 23, '新加坡', 'prx', 'Duelist', ['jett', 'phoenix'], 91, 360000, 620000, 94, 88, 86, 3, false, false, ['2023 Pacific League Champion']),
  createPlayer('f0rsaken', 'f0rsaken', 'f0rsaken', 'Abhishek Malhan', 24, '印度', 'prx', 'Controller', ['brimstone', 'viper'], 90, 340000, 580000, 93, 85, 82, 2, false, false, ['2023 Pacific League Champion']),
  createPlayer('mindfreak', 'Mindfreak', 'Mindfreak', 'Jason Tan', 25, '新加坡', 'prx', 'Sentinel', ['cypher', 'killjoy'], 89, 320000, 520000, 92, 82, 80, 2, false, false),
  createPlayer('something', 'something', 'something', 'Wang Xinhao', 22, '中国', 'prx', 'Initiator', ['sova', 'fade'], 90, 340000, 560000, 93, 86, 84, 2, false, false),
  createPlayer('kingfisher', 'Kingfisher', 'Kingfisher', 'James Chen', 23, '菲律宾', 'prx', 'Duelist', ['reyna', 'neon'], 88, 300000, 480000, 91, 80, 82, 2, false, false),

  // ===== 太平洋赛区 - T1 =====
  createPlayer('brax', 'brax', 'brax', 'Brandon Na', 29, '美国', 't1', 'Initiator', ['sova', 'gekko'], 87, 280000, 450000, 90, 78, 75, 1, false, false),
  createPlayer('drone', 'drone', 'drone', 'Kim Jun-ho', 22, '韩国', 't1', 'Duelist', ['jett', 'phoenix'], 89, 310000, 500000, 92, 82, 84, 2, false, false),
  createPlayer('munchkin', 'munchkin', 'munchkin', 'Kim Byeong-hoon', 25, '韩国', 't1', 'Controller', ['omen', 'clove'], 88, 300000, 480000, 91, 80, 82, 2, false, false),
  createPlayer('xeta', 'xeta', 'xeta', 'Park Gun-ho', 24, '韩国', 't1', 'Sentinel', ['cypher', 'killjoy'], 87, 280000, 440000, 90, 78, 80, 2, false, false),
  createPlayer('zeffa', 'zeffa', 'zeffa', 'Kim Seong-hyun', 22, '韩国', 't1', 'Duelist', ['raze', 'reyna'], 86, 260000, 420000, 89, 76, 78, 2, false, false),

  // ===== 太平洋赛区 - VARREL =====
  createPlayer('yuki', 'Yuki', 'Yuki', 'Tanaka Yuki', 22, '日本', 'vl', 'Duelist', ['jett', 'phoenix'], 85, 240000, 380000, 88, 78, 80, 2, false, false),
  createPlayer('koala', 'Koala', 'Koala', 'Lee Min-ho', 23, '韩国', 'vl', 'Controller', ['omen', 'clove'], 84, 230000, 360000, 87, 76, 78, 2, false, false),
  createPlayer('leo', 'Leo', 'Leo', 'Park Jung-ho', 21, '韩国', 'vl', 'Initiator', ['sova', 'fade'], 83, 220000, 340000, 86, 74, 76, 2, false, false),
  createPlayer('nova-vl', 'NovaVL', 'Nova', 'Chen Wei', 22, '中国', 'vl', 'Sentinel', ['cypher', 'killjoy'], 82, 210000, 320000, 85, 72, 74, 2, false, false),
  createPlayer('skye', 'Skye', 'Skye', 'Ha Ji-won', 20, '韩国', 'vl', 'Duelist', ['reyna', 'neon'], 84, 220000, 340000, 88, 78, 80, 2, false, true),

  // ===== 美洲赛区 - Sentinels =====
  createPlayer('johnqt', 'johnqt', 'johnqt', 'Mohamed Amine Ouarid', 24, '摩洛哥', 'sentinels', 'Duelist', ['jett', 'phoenix'], 90, 350000, 580000, 93, 86, 84, 2, false, false, ['2024 Masters Madrid Champion']),
  createPlayer('n4rrate', 'N4RRATE', 'N4RRATE', 'Marshall Massey', 22, '美国', 'sentinels', 'Controller', ['omen', 'astra'], 88, 320000, 500000, 91, 82, 80, 2, false, false),
  createPlayer('kyu', 'Kyu', 'Kyu', 'Mirel Braco Hrustemovic', 21, '波黑', 'sentinels', 'Initiator', ['sova', 'gekko'], 87, 280000, 450000, 90, 80, 82, 2, false, false),
  createPlayer('reduxx', 'reduxx', 'reduxx', 'Yassin Aboulalazm', 22, '法国', 'sentinels', 'Duelist', ['reyna', 'neon'], 86, 260000, 420000, 89, 78, 80, 2, false, false),
  createPlayer('cortezia', 'cortezia', 'cortezia', 'Gabriel Araujo Lobo Cortez', 24, '巴西', 'sentinels', 'Sentinel', ['cypher', 'chamber'], 87, 280000, 440000, 90, 80, 82, 2, false, false),

  // ===== 美洲赛区 - Cloud9 =====
  createPlayer('xeppaa', 'Xeppaa', 'Xeppaa', 'Eric Bach', 25, '美国', 'c9', 'Duelist', ['jett', 'phoenix'], 89, 330000, 540000, 92, 84, 82, 2, false, false),
  createPlayer('oxy', 'OXY', 'OXY', 'Francis Huang', 23, '美国', 'c9', 'Controller', ['omen', 'clove'], 87, 300000, 480000, 90, 80, 78, 2, false, false),
  createPlayer('v1c', 'v1c', 'v1c', 'Victor Chang', 22, '美国', 'c9', 'Initiator', ['sova', 'fade'], 86, 280000, 440000, 89, 78, 80, 2, false, false),
  createPlayer('penny', 'penny', 'penny', 'Eric Penny', 24, '美国', 'c9', 'Sentinel', ['killjoy', 'cypher'], 85, 260000, 400000, 88, 76, 78, 2, false, false),
  createPlayer('zellsis', 'Zellsis', 'Zellsis', 'Jordan Montemurro', 25, '美国', 'c9', 'Duelist', ['raze', 'neon'], 88, 310000, 500000, 91, 82, 80, 2, false, false),
  createPlayer('immi', 'Immi', 'Immi', 'Ian Harding', 23, '美国', 'c9', 'Controller', ['brimstone', 'viper'], 84, 240000, 380000, 87, 74, 76, 2, false, false),

  // ===== 美洲赛区 - LOUD =====
  createPlayer('davih', 'DaviH', 'DaviH', 'David Cruz', 23, '葡萄牙', 'loud', 'Initiator', ['sova', 'gekko'], 87, 280000, 440000, 90, 80, 82, 2, false, false),
  createPlayer('tkzin', 'tkzin', 'tkzin', 'Enzo Zimiani', 22, '巴西', 'loud', 'Duelist', ['jett', 'phoenix'], 88, 300000, 480000, 91, 82, 84, 2, false, false, ['2022 VCT Champions']),
  createPlayer('lukxo', 'lukxo', 'lukxo', 'Lucca Travaioli', 23, '巴西', 'loud', 'Controller', ['omen', 'clove'], 86, 270000, 420000, 89, 78, 80, 2, false, false),
  createPlayer('darker', 'Darker', 'Darker', 'Sebastián Cicuamia', 24, '智利', 'loud', 'Sentinel', ['cypher', 'killjoy'], 85, 250000, 400000, 88, 76, 78, 2, false, false),
  createPlayer('erde', 'erde', 'erde', 'Roberto Lobos', 22, '巴西', 'loud', 'Duelist', ['reyna', 'neon'], 86, 260000, 420000, 89, 78, 80, 2, false, false),

  // ===== 美洲赛区 - 100 Thieves =====
  createPlayer('asuna', 'Asuna', 'Asuna', 'Peter Mazuryk', 24, '美国', '100t', 'Duelist', ['jett', 'phoenix'], 89, 320000, 520000, 92, 84, 82, 2, false, false),
  createPlayer('cryocells', 'Cryocells', 'Cryocells', 'Matthew Dylan Panganiban', 22, '菲律宾', '100t', 'Controller', ['omen', 'clove'], 86, 270000, 420000, 89, 78, 80, 2, false, false),
  createPlayer('timotino', 'Timotino', 'Timotino', 'Timothee Lavigne DuPont', 23, '法国', '100t', 'Initiator', ['sova', 'fade'], 85, 250000, 400000, 88, 76, 78, 2, false, false),
  createPlayer('vora', 'Vora', 'Vora', 'Jordan Parv', 24, '美国', '100t', 'Sentinel', ['cypher', 'killjoy'], 84, 240000, 380000, 87, 74, 76, 2, false, false),
  createPlayer('bang-100t', 'Bang', 'Bang', 'Sean Christian Bezerra', 25, '美国', '100t', 'Duelist', ['raze', 'reyna'], 87, 280000, 440000, 90, 80, 82, 2, false, false),
  createPlayer('nbs', 'Nbs', 'Nbs', 'Laurynas Kisielius', 23, '立陶宛', '100t', 'Initiator', ['gekko', 'breach'], 84, 240000, 380000, 87, 74, 76, 2, false, false),

  // ===== 美洲赛区 - Team Envy / Evil Geniuses / FURIA =====
  createPlayer('canezerra', 'canezerra', 'canezerra', 'Alex Banias', 22, '美国', 'envy', 'Duelist', ['jett', 'phoenix'], 85, 250000, 400000, 88, 78, 80, 2, false, false),
  createPlayer('eggsterr', 'Eggsterr', 'Eggsterr', 'Evan Grady', 23, '美国', 'envy', 'Controller', ['omen', 'clove'], 84, 240000, 380000, 87, 76, 78, 2, false, false),
  createPlayer('inspire', 'inspire', 'inspire', 'Hunter Schlein', 22, '美国', 'envy', 'Initiator', ['sova', 'fade'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('ion2x', 'ion2x', 'ion2x', 'Ayan Rastogi', 21, '美国', 'envy', 'Sentinel', ['cypher', 'killjoy'], 82, 220000, 340000, 85, 72, 74, 2, false, false),
  createPlayer('p0ppin', 'P0PPIN', 'P0PPIN', 'Matteo Weber', 22, '德国', 'envy', 'Duelist', ['reyna', 'neon'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('keznit', 'keznit', 'keznit', 'Angelo Mori', 24, '智利', 'envy', 'Duelist', ['jett', 'raze'], 86, 270000, 430000, 89, 78, 80, 2, false, false),

  // ===== EMEA赛区 - Team Vitality =====
  createPlayer('jamppi', 'Jamppi', 'Jamppi', 'Elias Olkkonen', 24, '芬兰', 'vitality', 'Initiator', ['sova', 'fade'], 92, 380000, 650000, 95, 90, 88, 3, false, false, ['2024 EMEA League Champion']),
  createPlayer('derke', 'Derke', 'Derke', 'Nikita Sirmitev', 24, '丹麦', 'vitality', 'Duelist', ['jett', 'raze'], 94, 450000, 800000, 97, 92, 90, 3, false, false, ['2024 EMEA League Champion']),
  createPlayer('sayonara', 'Sayonara', 'Sayonara', 'Ștefan Mîtcu', 23, '罗马尼亚', 'vitality', 'Controller', ['omen', 'clove'], 90, 340000, 580000, 93, 86, 84, 2, false, false, ['2024 EMEA League Champion']),
  createPlayer('chronicle', 'Chronicle', 'Chronicle', 'Timofey Khromov', 26, '俄罗斯', 'vitality', 'Controller', ['astra', 'brimstone'], 91, 360000, 620000, 94, 88, 85, 3, false, false, ['2024 EMEA League Champion']),
  createPlayer('profek', 'PROFEK', 'PROFEK', 'Dawid Święć', 22, '波兰', 'vitality', 'Sentinel', ['cypher', 'killjoy'], 89, 320000, 520000, 92, 84, 82, 2, false, false, ['2024 EMEA League Champion']),
  createPlayer('sayf', 'Sayf', 'Sayf', 'Saif Jibraeel', 23, '挪威', 'vitality', 'Duelist', ['reyna', 'neon'], 88, 300000, 480000, 91, 82, 80, 2, false, false),

  // ===== EMEA赛区 - Fnatic =====
  createPlayer('boaster', 'Boaster', 'Boaster', 'Jake Howlett', 27, '英国', 'fnatic', 'Initiator', ['sova', 'gekko'], 90, 350000, 600000, 93, 88, 85, 3, false, false, ['2023 EMEA League Champion']),
  createPlayer('alfajer', 'Alfajer', 'Alfajer', 'Emir Beder', 20, '土耳其', 'fnatic', 'Sentinel', ['cypher', 'killjoy'], 92, 380000, 650000, 95, 90, 88, 3, false, false, ['2023 EMEA League Champion']),
  createPlayer('kaajak', 'kaajak', 'kaajak', 'Kajetan Haremski', 22, '波兰', 'fnatic', 'Duelist', ['jett', 'phoenix'], 89, 330000, 540000, 92, 84, 82, 2, false, false),
  createPlayer('crashies', 'crashies', 'crashies', 'Austin Roberts', 24, '美国', 'fnatic', 'Controller', ['omen', 'clove'], 90, 340000, 580000, 93, 86, 84, 2, false, false),
  createPlayer('veqaj', 'Veqaj', 'Veqaj', 'Sylvain Pattyn', 23, '比利时', 'fnatic', 'Duelist', ['raze', 'neon'], 88, 310000, 500000, 91, 82, 80, 2, false, false),
  createPlayer('cloud-fnc', 'Cloud', 'Cloud', 'Kirill Nekhozhin', 23, '俄罗斯', 'fnatic', 'Initiator', ['sova', 'fade'], 90, 340000, 560000, 93, 86, 84, 2, false, false),

  // ===== EMEA赛区 - Team Liquid =====
  createPlayer('nats', 'nAts', 'nAts', 'Ayaz Akhmetshin', 24, '俄罗斯', 'liquid', 'Initiator', ['sova', 'fade'], 88, 320000, 500000, 91, 82, 80, 2, false, false),
  createPlayer('kamo', 'kamo', 'kamo', 'Kamil Frąckowiak', 22, '波兰', 'liquid', 'Duelist', ['jett', 'phoenix'], 86, 270000, 420000, 89, 78, 80, 2, false, false),
  createPlayer('soulcas', 'soulcas', 'soulcas', 'Dominic Sullivan', 25, '英国', 'liquid', 'Controller', ['omen', 'clove'], 85, 250000, 400000, 88, 76, 78, 2, false, false),
  createPlayer('kioshima', 'kioshima', 'kioshima', 'Kyohei Yoshida', 26, '日本', 'liquid', 'Sentinel', ['cypher', 'killjoy'], 84, 240000, 380000, 87, 74, 76, 2, false, false),
  createPlayer('malbsmd', 'malbsMd', 'malbsMd', 'Malik Bessaad', 23, '法国', 'liquid', 'Duelist', ['reyna', 'neon'], 85, 250000, 400000, 88, 76, 78, 2, false, false),

  // ===== EMEA赛区 - Team Heretics =====
  createPlayer('boo', 'Boo', 'Boo', 'Ričardas Lukaševičius', 23, '立陶宛', 'heretics', 'Initiator', ['sova', 'fade'], 85, 260000, 410000, 88, 78, 80, 2, false, false),
  createPlayer('benjyfishy', 'benjyfishy', 'benjyfishy', 'Benjy Fish', 22, '英国', 'heretics', 'Duelist', ['jett', 'phoenix'], 86, 270000, 430000, 89, 80, 82, 2, false, false),
  createPlayer('riens', 'RieNs', 'RieNs', 'Enes Ecirli', 23, '土耳其', 'heretics', 'Controller', ['omen', 'clove'], 84, 240000, 380000, 87, 76, 78, 2, false, false),
  createPlayer('wo0t', 'Wo0t', 'Wo0t', 'Mert Alkan', 22, '土耳其', 'heretics', 'Sentinel', ['cypher', 'killjoy'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('comeback', 'ComeBack', 'ComeBack', 'Berkcan Şentürk', 21, '土耳其', 'heretics', 'Duelist', ['raze', 'reyna'], 84, 240000, 380000, 87, 76, 78, 2, false, false),

  // ===== EMEA赛区 - GIANTX / NAVI / Gentle Mates =====
  createPlayer('westside', 'westside', 'westside', 'Miłosz Duda', 23, '波兰', 'giantx', 'Duelist', ['jett', 'phoenix'], 85, 250000, 400000, 88, 78, 80, 2, false, false),
  createPlayer('ara', 'ara', 'ara', 'Eduard-George Hanceriuc', 22, '罗马尼亚', 'giantx', 'Initiator', ['sova', 'gekko'], 84, 240000, 380000, 87, 76, 78, 2, false, false),
  createPlayer('flickless', 'Flickless', 'Flickless', 'Karel Maeckelbergh', 24, '比利时', 'giantx', 'Controller', ['omen', 'clove'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('grubinho', 'GRUBINHO', 'GRUBINHO', 'Grzegorz Ryczko', 22, '波兰', 'giantx', 'Sentinel', ['cypher', 'killjoy'], 82, 220000, 340000, 85, 72, 74, 2, false, false),
  createPlayer('pipson', 'pipsoN', 'pipsoN', 'Daniil Meshcheryakov', 25, '俄罗斯', 'giantx', 'Controller', ['brimstone', 'viper'], 84, 240000, 380000, 87, 76, 78, 2, false, false),

  createPlayer('hiro', 'hiro', 'hiro', 'Emirhan Kat', 22, '土耳其', 'navi', 'Duelist', ['jett', 'phoenix'], 86, 270000, 420000, 89, 80, 82, 2, false, false),
  createPlayer('ruxic', 'Ruxic', 'Ruxic', 'Uğur Güç', 23, '土耳其', 'navi', 'Initiator', ['sova', 'fade'], 85, 250000, 400000, 88, 78, 80, 2, false, false),
  createPlayer('shao', 'Shao', 'Shao', 'Andrei Kiprskii', 25, '俄罗斯', 'navi', 'Controller', ['omen', 'astra'], 84, 240000, 380000, 87, 76, 78, 2, false, false),
  createPlayer('mir', 'Mir', 'Mir', 'Andrey Kiprskii', 23, '俄罗斯', 'navi', 'Sentinel', ['cypher', 'killjoy'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('aleksib', 'Aleksib', 'Aleksib', 'Aleksi Virolainen', 25, '芬兰', 'navi', 'Duelist', ['raze', 'neon'], 85, 250000, 400000, 88, 78, 80, 2, false, false),

  createPlayer('starxo', 'starxo', 'starxo', 'Patryk Kopczyński', 23, '波兰', 'gentlemates', 'Initiator', ['sova', 'gekko'], 84, 240000, 380000, 87, 78, 80, 2, false, false),
  createPlayer('minny', 'Minny', 'Minny', 'Patrik Hušek', 22, '捷克', 'gentlemates', 'Duelist', ['jett', 'phoenix'], 83, 230000, 360000, 86, 76, 78, 2, false, false),
  createPlayer('bipo', 'bipo', 'bipo', 'Taranvir Singh', 23, '英国', 'gentlemates', 'Controller', ['omen', 'clove'], 82, 220000, 340000, 85, 74, 76, 2, false, false),
  createPlayer('glyph', 'GLYPH', 'GLYPH', 'Conner Garcia', 22, '美国', 'gentlemates', 'Sentinel', ['cypher', 'killjoy'], 81, 210000, 320000, 84, 72, 74, 2, false, false),
  createPlayer('marteen', 'marteen', 'marteen', 'Martin Pátek', 21, '捷克', 'gentlemates', 'Duelist', ['reyna', 'neon'], 82, 220000, 340000, 85, 74, 76, 2, false, false),

  // ===== 中国赛区 - AG =====
  createPlayer('shr1mp', 'Shr1mp', 'Shr1mp', 'Yang Yong', 22, '中国', 'ag', 'Duelist', ['jett', 'phoenix'], 88, 280000, 480000, 91, 85, 83, 2, false, false, ['2024 VCT CN League Champion']),
  createPlayer('k1ra', 'K1ra', 'K1ra', 'Huang Zhihao', 23, '中国', 'ag', 'Controller', ['omen', 'brimstone'], 87, 260000, 440000, 90, 82, 80, 2, false, false, ['2024 VCT CN League Champion']),
  createPlayer('bai', 'Bai', 'Bai', 'Zhang Zeyang', 21, '中国', 'ag', 'Initiator', ['sova', 'gekko'], 86, 250000, 420000, 89, 80, 82, 2, false, false, ['2024 VCT CN League Champion']),
  createPlayer('s1mo', 's1mo', 's1mo', 'Li Siming', 22, '中国', 'ag', 'Sentinel', ['cypher', 'killjoy'], 85, 240000, 400000, 88, 78, 80, 2, false, false, ['2024 VCT CN League Champion']),
  createPlayer('yezi', 'Yezi', 'Yezi', 'Chen Ye', 21, '中国', 'ag', 'Duelist', ['reyna', 'neon'], 85, 240000, 400000, 88, 78, 80, 2, false, false, ['2024 VCT CN League Champion']),

  // ===== 中国赛区 - BLG =====
  createPlayer('xigua', 'Xigua', '西瓜', 'Wang Xi', 22, '中国', 'blg', 'Duelist', ['jett', 'phoenix'], 86, 260000, 420000, 89, 80, 82, 2, false, false),
  createPlayer('luna', 'Luna', 'Luna', 'Chen Yue', 21, '中国', 'blg', 'Controller', ['omen', 'clove'], 84, 240000, 380000, 87, 76, 78, 2, false, false),
  createPlayer('mike', 'Mike', 'Mike', 'Li Ming', 23, '中国', 'blg', 'Initiator', ['sova', 'fade'], 85, 250000, 400000, 88, 78, 80, 2, false, false),
  createPlayer('ming-blg', 'Ming', 'Ming', 'Zhang Ming', 22, '中国', 'blg', 'Sentinel', ['cypher', 'killjoy'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('xiang', 'Xiang', 'Xiang', 'Liu Xiang', 21, '中国', 'blg', 'Duelist', ['raze', 'reyna'], 84, 240000, 380000, 87, 76, 78, 2, false, false),

  // ===== 中国赛区 - EDG =====
  createPlayer('smoggy', 'Smoggy', 'Smoggy', 'Chen Zifan', 23, '中国', 'edg', 'Duelist', ['jett', 'phoenix'], 87, 270000, 450000, 90, 82, 80, 2, false, false, ['2023 VCT CN League Champion']),
  createPlayer('haodong', 'Haodong', 'Haodong', 'Li Haodong', 22, '中国', 'edg', 'Controller', ['omen', 'clove'], 86, 260000, 420000, 89, 80, 78, 2, false, false, ['2023 VCT CN League Champion']),
  createPlayer('chichao', 'Chichao', 'Chichao', 'Wang Chichao', 23, '中国', 'edg', 'Initiator', ['sova', 'fade'], 85, 250000, 400000, 88, 78, 80, 2, false, false, ['2023 VCT CN League Champion']),
  createPlayer('xwudd', 'Xwudd', 'Xwudd', 'Xu Wen', 22, '中国', 'edg', 'Sentinel', ['cypher', 'killjoy'], 84, 240000, 380000, 87, 76, 78, 2, false, false, ['2023 VCT CN League Champion']),
  createPlayer('cxy', 'Cxy', 'Cxy', 'Chen Xiaoyu', 21, '中国', 'edg', 'Duelist', ['reyna', 'neon'], 85, 250000, 400000, 88, 78, 80, 2, false, false, ['2023 VCT CN League Champion']),

  // ===== 中国赛区 - FPX =====
  createPlayer('hanji', 'Hanji', 'Hanji', 'Han Ji', 22, '中国', 'fpx', 'Duelist', ['jett', 'phoenix'], 85, 250000, 400000, 88, 78, 80, 2, false, false),
  createPlayer('yuyanjia', 'Yuyanjia', 'Yuyanjia', 'Yu Yanjia', 23, '中国', 'fpx', 'Controller', ['omen', 'clove'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('tian', 'Tian', 'Tian', 'Tian Ye', 22, '中国', 'fpx', 'Initiator', ['sova', 'gekko'], 84, 240000, 380000, 87, 76, 78, 2, false, false),
  createPlayer('crisp', 'Crisp', 'Crisp', 'Liu Qing', 24, '中国', 'fpx', 'Sentinel', ['cypher', 'killjoy'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('lwx', 'LWX', 'LWX', 'Lin Weixiang', 24, '中国', 'fpx', 'Duelist', ['raze', 'reyna'], 84, 240000, 380000, 87, 76, 78, 2, false, false),

  // ===== 中国赛区 - DRG / JDG / NOVA / TE / TEC / TYL / WOL / XLG =====
  createPlayer('xiaohu', 'Xiaohu', 'Xiaohu', 'Li Xiao', 22, '中国', 'drg', 'Duelist', ['jett', 'phoenix'], 84, 240000, 380000, 87, 76, 78, 2, false, false),
  createPlayer('ming-drg', 'MingDRG', 'Ming', 'Zhang Ming', 23, '中国', 'drg', 'Controller', ['omen', 'brimstone'], 82, 220000, 340000, 85, 74, 76, 2, false, false),
  createPlayer('gala', 'Gala', 'Gala', 'Gao Lin', 21, '中国', 'drg', 'Initiator', ['sova', 'fade'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('wei-drg', 'Wei', 'Wei', 'Wei Chen', 22, '中国', 'drg', 'Sentinel', ['cypher', 'killjoy'], 82, 220000, 340000, 85, 72, 74, 2, false, false),
  createPlayer('breath', 'Breath', 'Breath', 'Chen Bo', 24, '中国', 'drg', 'Duelist', ['reyna', 'neon'], 81, 210000, 320000, 84, 72, 74, 2, false, false),

  createPlayer('ruler', 'Ruler', 'Ruler', 'Park Jae-hyuk', 23, '韩国', 'jdg', 'Duelist', ['jett', 'phoenix'], 85, 250000, 400000, 88, 78, 80, 2, false, false),
  createPlayer('kanavi', 'Kanavi', 'Kanavi', 'Seo Jin-hyeok', 24, '韩国', 'jdg', 'Controller', ['omen', 'clove'], 84, 240000, 380000, 87, 76, 78, 2, false, false),
  createPlayer('369', '369', '369', 'Bai Jia-hao', 22, '中国', 'jdg', 'Initiator', ['sova', 'gekko'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('rngming', 'MingJDG', 'Ming', 'Shi Sen-ming', 25, '中国', 'jdg', 'Sentinel', ['cypher', 'killjoy'], 84, 240000, 380000, 87, 76, 78, 2, false, false),
  createPlayer('hope', 'Hope', 'Hope', 'Wang Jie', 22, '中国', 'jdg', 'Duelist', ['raze', 'reyna'], 82, 220000, 340000, 85, 74, 76, 2, false, false),

  createPlayer('knight', 'Knight', 'Knight', 'Zhuo Ding', 22, '中国', 'nova', 'Duelist', ['jett', 'phoenix'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('zoom', 'Zoom', 'Zoom', 'Wang Xing', 23, '中国', 'nova', 'Controller', ['omen', 'clove'], 82, 220000, 340000, 85, 72, 74, 2, false, false),
  createPlayer('tarzan', 'Tarzan', 'Tarzan', 'Lee Seung-yong', 24, '韩国', 'nova', 'Initiator', ['sova', 'fade'], 82, 220000, 340000, 85, 72, 74, 2, false, false),
  createPlayer('meiko', 'Meiko', 'Meiko', 'Tian Ye', 25, '中国', 'nova', 'Sentinel', ['cypher', 'killjoy'], 81, 210000, 320000, 84, 72, 74, 2, false, false),
  createPlayer('lqs', 'Lqs', 'Lqs', 'Liu Qing-song', 22, '中国', 'nova', 'Duelist', ['reyna', 'neon'], 80, 200000, 300000, 83, 70, 72, 2, false, false),

  createPlayer('scout', 'Scout', 'Scout', 'Lee Ye-chan', 23, '韩国', 'te', 'Duelist', ['jett', 'phoenix'], 84, 240000, 380000, 87, 76, 78, 2, false, false),
  createPlayer('viper', 'Viper', 'Viper', 'Park Do-yeon', 22, '韩国', 'te', 'Controller', ['omen', 'clove'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('zeka', 'Zeka', 'Zeka', 'Kim Geon-woo', 21, '韩国', 'te', 'Initiator', ['sova', 'gekko'], 82, 220000, 340000, 85, 74, 76, 2, false, false),
  createPlayer('keria', 'Keria', 'Keria', 'Ryu Min-seok', 22, '韩国', 'te', 'Sentinel', ['cypher', 'killjoy'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('deft', 'Deft', 'Deft', 'Kim Hyuk-kyu', 25, '韩国', 'te', 'Duelist', ['raze', 'reyna'], 82, 220000, 340000, 85, 72, 74, 2, false, false),

  createPlayer('chovy', 'Chovy', 'Chovy', 'Jeong Ji-hoon', 22, '韩国', 'tec', 'Duelist', ['jett', 'phoenix'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('gorilla', 'Gorilla', 'Gorilla', 'Kang Beom-hyun', 24, '韩国', 'tec', 'Controller', ['omen', 'clove'], 82, 220000, 340000, 85, 72, 74, 2, false, false),
  createPlayer('bdd', 'Bdd', 'Bdd', 'Gwak Bo-seong', 23, '韩国', 'tec', 'Initiator', ['sova', 'fade'], 81, 210000, 320000, 84, 72, 74, 2, false, false),
  createPlayer('effort', 'Effort', 'Effort', 'Kim Sang-min', 22, '韩国', 'tec', 'Sentinel', ['cypher', 'killjoy'], 80, 200000, 300000, 83, 70, 72, 2, false, false),
  createPlayer('ghost', 'Ghost', 'Ghost', 'Jang Yong-jun', 21, '韩国', 'tec', 'Duelist', ['reyna', 'neon'], 81, 210000, 320000, 84, 72, 74, 2, false, false),

  createPlayer('faker-tyl', 'Faker', 'Faker', 'Lee Sang-hyeok', 24, '韩国', 'tyl', 'Duelist', ['jett', 'phoenix'], 86, 270000, 430000, 89, 80, 82, 2, false, false),
  createPlayer('oner', 'Oner', 'Oner', 'Mun Hyeon-jun', 22, '韩国', 'tyl', 'Controller', ['omen', 'clove'], 85, 250000, 400000, 88, 78, 80, 2, false, false),
  createPlayer('gumayusi', 'Gumayusi', 'Gumayusi', 'Lee Min-hyeong', 23, '韩国', 'tyl', 'Initiator', ['sova', 'fade'], 84, 240000, 380000, 87, 76, 78, 2, false, false),
  createPlayer('keria-tyl', 'KeriaT', 'Keria', 'Ryu Min-seok', 22, '韩国', 'tyl', 'Sentinel', ['cypher', 'killjoy'], 84, 240000, 380000, 87, 76, 78, 2, false, false),
  createPlayer('zeus', 'Zeus', 'Zeus', 'Choi Woo-je', 21, '韩国', 'tyl', 'Duelist', ['raze', 'reyna'], 83, 230000, 360000, 86, 74, 76, 2, false, false),

  createPlayer('caps', 'Caps', 'Caps', 'Rasmus Winther', 24, '丹麦', 'wol', 'Duelist', ['jett', 'phoenix'], 84, 240000, 380000, 87, 76, 78, 2, false, false),
  createPlayer('jankos', 'Jankos', 'Jankos', 'Marcin Jankowski', 25, '波兰', 'wol', 'Controller', ['omen', 'clove'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('rekkles', 'Rekkles', 'Rekkles', 'Martin Larsson', 25, '瑞典', 'wol', 'Initiator', ['sova', 'fade'], 82, 220000, 340000, 85, 74, 76, 2, false, false),
  createPlayer('mikyx', 'Mikyx', 'Mikyx', 'Mihael Mehle', 23, '斯洛文尼亚', 'wol', 'Sentinel', ['cypher', 'killjoy'], 81, 210000, 320000, 84, 72, 74, 2, false, false),
  createPlayer('bwipo', 'Bwipo', 'Bwipo', 'Gabriël Rau', 24, '比利时', 'wol', 'Duelist', ['reyna', 'neon'], 82, 220000, 340000, 85, 74, 76, 2, false, false),

  createPlayer('perkz', 'Perkz', 'Perkz', 'Luka Perković', 24, '克罗地亚', 'xlg', 'Duelist', ['jett', 'phoenix'], 83, 230000, 360000, 86, 74, 76, 2, false, false),
  createPlayer('selfmade', 'Selfmade', 'Selfmade', 'Oskar Boderek', 23, '波兰', 'xlg', 'Controller', ['omen', 'clove'], 82, 220000, 340000, 85, 72, 74, 2, false, false),
  createPlayer('upset', 'Upset', 'Upset', 'Elias Lipp', 22, '德国', 'xlg', 'Initiator', ['sova', 'fade'], 81, 210000, 320000, 84, 72, 74, 2, false, false),
  createPlayer('morgan', 'Morgan', 'Morgan', 'Park Lu-han', 22, '韩国', 'xlg', 'Sentinel', ['cypher', 'killjoy'], 80, 200000, 300000, 83, 70, 72, 2, false, false),
  createPlayer('hylissang', 'Hylissang', 'Hylissang', 'Zdravets Galabov', 25, '保加利亚', 'xlg', 'Duelist', ['raze', 'reyna'], 81, 210000, 320000, 84, 72, 74, 2, false, false),

  // ===== 自由选手（明星选手） =====
  createPlayer('tenz', 'TenZ', 'TenZ', 'Tyson Ngo', 25, '加拿大', null, 'Duelist', ['jett', 'phoenix'], 95, 500000, 800000, 98, 85, 90, 0, true, false, ['2022 VCT Champions', '2024 Masters Madrid']),
  createPlayer('scream', 'screaM', 'screaM', 'Adil Benrlitom', 29, '比利时', null, 'Duelist', ['jett', 'reyna'], 92, 300000, 500000, 94, 70, 75, 0, true, false, ['2021 VCT Champions']),
  createPlayer('shroud', 'Shroud', 'Shroud', 'Michael Grzesiek', 29, '加拿大', null, 'Duelist', ['jett', 'phoenix'], 91, 400000, 600000, 93, 75, 70, 0, true, false),
  createPlayer('koosta', 'koosta', 'koosta', 'Anthony Mediano', 27, '美国', null, 'Sentinel', ['sage', 'killjoy'], 88, 180000, 300000, 90, 65, 72, 0, true, false),
  createPlayer('sacy', 'Sacy', 'Sacy', 'Gustavo Rossi da Silva', 25, '巴西', null, 'Initiator', ['sova', 'gekko'], 90, 350000, 550000, 93, 82, 80, 0, true, false, ['2022 VCT Champions']),
  createPlayer('pangg', 'pangg', 'pangg', 'Park Dong-hyuk', 24, '韩国', null, 'Duelist', ['jett', 'raze'], 89, 280000, 460000, 92, 80, 82, 0, true, false),

  // ===== 新秀选手（球探可发掘） =====
  createPlayer('rookie-01', 'Rookie01', '新秀01', 'Kim Min-jae', 18, '韩国', null, 'Duelist', ['jett', 'phoenix'], 78, 50000, 120000, 92, 85, 90, 0, true, true),
  createPlayer('rookie-02', 'Rookie02', '新秀02', 'Li Wei', 19, '中国', null, 'Controller', ['omen', 'clove'], 76, 40000, 100000, 90, 82, 88, 0, true, true),
  createPlayer('rookie-03', 'Rookie03', '新秀03', 'Alex Chen', 18, '美国', null, 'Initiator', ['sova', 'fade'], 77, 45000, 110000, 91, 84, 88, 0, true, true),
  createPlayer('rookie-04', 'Rookie04', '新秀04', 'Yuki Tanaka', 19, '日本', null, 'Sentinel', ['cypher', 'killjoy'], 75, 40000, 90000, 89, 80, 86, 0, true, true),
  createPlayer('rookie-05', 'Rookie05', '新秀05', 'Park Ji-hoon', 18, '韩国', null, 'Duelist', ['reyna', 'neon'], 79, 50000, 130000, 93, 86, 90, 0, true, true),
  createPlayer('rookie-06', 'Rookie06', '新秀06', 'Braz Cubas', 19, '巴西', null, 'Initiator', ['gekko', 'breach'], 74, 35000, 85000, 88, 78, 84, 0, true, true),
  createPlayer('rookie-07', 'Rookie07', '新秀07', 'Felix Wagner', 18, '德国', null, 'Controller', ['brimstone', 'viper'], 73, 35000, 80000, 87, 76, 82, 0, true, true),
  createPlayer('rookie-08', 'Rookie08', '新秀08', 'Zhang Hao', 19, '中国', null, 'Sentinel', ['chamber', 'cypher'], 76, 40000, 95000, 90, 82, 86, 0, true, true),
];

export const freeAgents = realPlayers.filter(p => p.isFreeAgent);

export const prospects = realPlayers.filter(p => p.isProspect);

export const getPlayerById = (id: string): Player | undefined => realPlayers.find(p => p.id === id);

export const getPlayersByRole = (role: AgentRole): Player[] => realPlayers.filter(p => p.position === role);

export const getAgentByName = (name: string): Agent | undefined => agents.find(a => a.id === name);

export const getPlayerMainAgents = (player: Player): Agent[] => player.mainAgents.map(id => getAgentByName(id)).filter(Boolean) as Agent[];

// 计算选手综合评级（基于多维度属性）
export const calculatePlayerRating = (attrs: PlayerAttributes, position: AgentRole): number => {
  const weights: Record<AgentRole, Partial<Record<keyof PlayerAttributes, number>>> = {
    Duelist: { aim: 0.30, entry: 0.20, clutch: 0.15, composure: 0.10, gameSense: 0.10, consistency: 0.10, teamwork: 0.05 },
    Controller: { utility: 0.30, gameSense: 0.20, teamwork: 0.15, composure: 0.10, consistency: 0.10, support: 0.10, aim: 0.05 },
    Initiator: { support: 0.25, gameSense: 0.20, utility: 0.20, teamwork: 0.15, aim: 0.10, consistency: 0.10 },
    Sentinel: { support: 0.25, composure: 0.20, teamwork: 0.20, gameSense: 0.15, utility: 0.10, consistency: 0.10 },
  };
  
  const weight = weights[position];
  let sum = 0;
  let totalWeight = 0;
  
  Object.entries(weight).forEach(([key, w]) => {
    sum += attrs[key as keyof PlayerAttributes] * (w as number);
    totalWeight += w as number;
  });
  
  return Math.round(sum / totalWeight);
};
