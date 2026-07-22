export type AgentRole = 'Duelist' | 'Controller' | 'Initiator' | 'Sentinel';

export interface Agent {
  id: string;
  name: string;
  chineseName: string;
  role: AgentRole;
  tier: 'S' | 'A' | 'B' | 'C';
  pickRate: number;
  winRate: number;
  description: string;
}

export const agents: Agent[] = [
  { id: 'jett', name: 'Jett', chineseName: '捷风', role: 'Duelist', tier: 'S', pickRate: 13.7, winRate: 51.3, description: '灵活的决斗者，拥有迅疾如风的位移能力' },
  { id: 'phoenix', name: 'Phoenix', chineseName: '不死鸟', role: 'Duelist', tier: 'A', pickRate: 8.5, winRate: 52.8, description: '自带自闪和回血，单排容错天花板' },
  { id: 'reyna', name: 'Reyna', chineseName: '芮娜', role: 'Duelist', tier: 'S', pickRate: 7.8, winRate: 51.0, description: '极具攻击性，击杀后可吸血隐身' },
  { id: 'neon', name: 'Neon', chineseName: '霓虹', role: 'Duelist', tier: 'A', pickRate: 4.9, winRate: 53.0, description: '高速移动，专为突破而生' },
  { id: 'raze', name: 'Raze', chineseName: '雷兹', role: 'Duelist', tier: 'S', pickRate: 5.8, winRate: 51.5, description: '高伤害范围打击，炸药包位移' },
  { id: 'yoru', name: 'Yoru', chineseName: '夜露', role: 'Duelist', tier: 'B', pickRate: 3.3, winRate: 51.1, description: '分身传送制造混乱' },
  { id: 'iso', name: 'Iso', chineseName: '壹决', role: 'Duelist', tier: 'B', pickRate: 2.1, winRate: 50.5, description: '护盾技能正面对抗' },
  
  { id: 'clove', name: 'Clove', chineseName: '暮蝶', role: 'Controller', tier: 'S', pickRate: 13.6, winRate: 53.6, description: '阵亡后可放烟，大招自带复活' },
  { id: 'omen', name: 'Omen', chineseName: '幽影', role: 'Controller', tier: 'A', pickRate: 6.2, winRate: 51.8, description: '灵活烟雾和传送' },
  { id: 'astra', name: 'Astra', chineseName: '星礈', role: 'Controller', tier: 'A', pickRate: 3.1, winRate: 52.2, description: '全局星图控场' },
  { id: 'brimstone', name: 'Brimstone', chineseName: '炼狱', role: 'Controller', tier: 'A', pickRate: 4.5, winRate: 52.5, description: '简单粗暴烟雾和轰炸' },
  { id: 'viper', name: 'Viper', chineseName: '毒蛇', role: 'Controller', tier: 'B', pickRate: 2.8, winRate: 51.9, description: '持续毒域消耗' },
  { id: 'harbor', name: 'Harbor', chineseName: '海神', role: 'Controller', tier: 'B', pickRate: 2.5, winRate: 51.3, description: '水域控场' },
  
  { id: 'sova', name: 'Sova', chineseName: '猎枭', role: 'Initiator', tier: 'S', pickRate: 7.7, winRate: 52.9, description: '侦查箭全局控信息' },
  { id: 'fade', name: 'Fade', chineseName: '黑梦', role: 'Initiator', tier: 'A', pickRate: 5.5, winRate: 52.9, description: '恐惧技能和侦测' },
  { id: 'gekko', name: 'Gekko', chineseName: '盖可', role: 'Initiator', tier: 'S', pickRate: 6.8, winRate: 53.2, description: '可回收道具，小弟辅助' },
  { id: 'skye', name: 'Skye', chineseName: '斯凯', role: 'Initiator', tier: 'B', pickRate: 3.2, winRate: 51.4, description: '治疗和闪光全能' },
  { id: 'breach', name: 'Breach', chineseName: '铁臂', role: 'Initiator', tier: 'B', pickRate: 2.9, winRate: 51.1, description: '闪光和爆破' },
  { id: 'kayo', name: 'KAY/O', chineseName: 'K/O', role: 'Initiator', tier: 'B', pickRate: 3.5, winRate: 51.6, description: '压制和大招禁道具' },
  
  { id: 'cypher', name: 'Cypher', chineseName: '零', role: 'Sentinel', tier: 'S', pickRate: 5.2, winRate: 52.8, description: '陷阱布局全面，回防无解' },
  { id: 'killjoy', name: 'Killjoy', chineseName: '奇乐', role: 'Sentinel', tier: 'A', pickRate: 6.1, winRate: 52.2, description: '阵地防守压制力拉满' },
  { id: 'sage', name: 'Sage', chineseName: '贤者', role: 'Sentinel', tier: 'A', pickRate: 4.8, winRate: 52.0, description: '治疗和隔墙封路' },
  { id: 'chamber', name: 'Chamber', chineseName: '尚勃勒', role: 'Sentinel', tier: 'B', pickRate: 10.6, winRate: 51.3, description: '机动性拉扯' },
  { id: 'deadlock', name: 'Deadlock', chineseName: '死锁', role: 'Sentinel', tier: 'C', pickRate: 1.8, winRate: 50.4, description: '机制偏冷门' },
  { id: 'vyse', name: 'Vyse', chineseName: '维斯', role: 'Sentinel', tier: 'B', pickRate: 2.5, winRate: 51.2, description: '丝线控场哨卫' },
  { id: 'tejo', name: 'Tejo', chineseName: '钛狐', role: 'Initiator', tier: 'B', pickRate: 2.3, winRate: 51.0, description: '潜袭爬虫沉默敌人' },
];

export const roleNames: Record<AgentRole, string> = {
  Duelist: '决斗者',
  Controller: '控场者',
  Initiator: '先锋',
  Sentinel: '哨卫',
};
