// API客户端服务 - 封装所有后端调用

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// 获取token
const getToken = (): string | null => {
  return localStorage.getItem('vct_token');
};

// 通用请求方法
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new ApiError(data.message || '请求失败', response.status);
  }

  return data.data as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

export { ApiError };

// ===== 认证API =====
export interface User {
  id: string;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  vctPoints: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: (data: { username: string; email: string; password: string; nickname?: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: { username: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  verify: () => api.get<{ user: User }>('/auth/verify'),
};

// ===== 存档API =====
export interface SaveSlot {
  _id: string;
  slot: number;
  name: string;
  isAutoSave: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface Save {
  _id: string;
  userId: string;
  slot: number;
  name: string;
  gameState: any;
  isAutoSave: boolean;
  updatedAt: string;
  createdAt: string;
}

export const saveApi = {
  getAll: () => api.get<SaveSlot[]>('/saves'),
  get: (slot: number) => api.get<Save>(`/saves/${slot}`),
  save: (data: { slot: number; name: string; gameState: any; isAutoSave?: boolean }) =>
    api.post<Save>('/saves', data),
  autoSave: (gameState: any) => api.post<Save>('/saves/auto', { gameState }),
  delete: (slot: number) => api.delete<{ slot: number }>(`/saves/${slot}`),
};

// ===== 对战API =====
export interface Match {
  _id: string;
  matchId: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  player1Team: any;
  player2Team: any;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  result?: {
    winnerId: string;
    team1Score: number;
    team2Score: number;
    mvpId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const matchApi = {
  getAll: (status?: string) => api.get<Match[]>(`/matches${status ? `?status=${status}` : ''}`),
  get: (matchId: string) => api.get<Match>(`/matches/${matchId}`),
  create: (opponentUsername: string, team: any) =>
    api.post<Match>('/matches', { opponentUsername, team }),
  accept: (matchId: string, team: any) =>
    api.post<Match>(`/matches/${matchId}/accept`, { team }),
  start: (matchId: string) =>
    api.post<Match>(`/matches/${matchId}/start`),
  forfeit: (matchId: string) =>
    api.post<Match>(`/matches/${matchId}/forfeit`),
};

// ===== 排行榜API =====
export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  nickname?: string;
  vctPoints: number;
}

export const leaderboardApi = {
  getTop: () => api.get<LeaderboardEntry[]>(`/leaderboard`),
  getUserRank: (userId: string) =>
    api.get<LeaderboardEntry>(`/leaderboard/user/${userId}`),
};
