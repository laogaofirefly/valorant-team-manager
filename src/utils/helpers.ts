export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getTierColor = (tier: string): string => {
  const colors: Record<string, string> = {
    'S': 'text-yellow-400',
    'A': 'text-purple-400',
    'B': 'text-blue-400',
    'C': 'text-gray-400',
  };
  return colors[tier] || 'text-gray-400';
};

export const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    'Duelist': 'text-red-400',
    'Controller': 'text-purple-400',
    'Initiator': 'text-green-400',
    'Sentinel': 'text-blue-400',
  };
  return colors[role] || 'text-gray-400';
};

export const getMatchResultColor = (result: string): string => {
  const colors: Record<string, string> = {
    'win': 'text-green-400',
    'loss': 'text-red-400',
    'draw': 'text-yellow-400',
  };
  return colors[result] || 'text-gray-400';
};

export const getMatchResultText = (result: string): string => {
  const texts: Record<string, string> = {
    'win': '胜利',
    'loss': '失败',
    'draw': '平局',
  };
  return texts[result] || '未知';
};

export const getPhaseText = (phase: string): string => {
  const texts: Record<string, string> = {
    'preseason': '休赛期',
    'regular': '常规赛',
    'playoffs': '季后赛',
  };
  return texts[phase] || '未知';
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};
