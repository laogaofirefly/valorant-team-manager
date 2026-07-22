import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import saveRoutes from './routes/saves.js';
import matchRoutes from './routes/matches.js';
import leaderboardRoutes from './routes/leaderboard.js';
import { successResponse, errorResponse } from './utils/response.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 连接数据库
connectDB();

// 中间件
app.use(cors({
  origin: NODE_ENV === 'production' ? CLIENT_URL : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/health', (_req, res) => {
  successResponse(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  }, '服务运行正常');
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/saves', saveRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// 404处理
app.use((_req, res) => {
  errorResponse(res, 'API路径不存在', 404);
});

// 全局错误处理
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('服务器错误:', err.stack);
  errorResponse(res, '服务器内部错误', 500, NODE_ENV === 'development' ? err.message : undefined);
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
});
