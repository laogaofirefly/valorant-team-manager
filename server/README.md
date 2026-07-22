# 无畏契约战队经理 - 后端服务

## 技术栈

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT 认证
- Zod 数据验证

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 生产环境启动
pnpm start
```

## 环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/valorant_team_manager
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## API 接口

### 认证

- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/verify` - 验证令牌

### 存档

- `GET /api/saves` - 获取存档列表
- `GET /api/saves/:slot` - 获取指定存档
- `POST /api/saves` - 保存游戏
- `POST /api/saves/auto` - 自动保存
- `DELETE /api/saves/:slot` - 删除存档

### 对战

- `GET /api/matches` - 获取对战列表
- `POST /api/matches` - 创建对战
- `GET /api/matches/:matchId` - 对战详情
- `POST /api/matches/:matchId/accept` - 接受对战
- `POST /api/matches/:matchId/start` - 开始对战
- `POST /api/matches/:matchId/forfeit` - 认输

### 排行榜

- `GET /api/leaderboard` - 获取排行榜
- `GET /api/leaderboard/user/:userId` - 获取用户排名