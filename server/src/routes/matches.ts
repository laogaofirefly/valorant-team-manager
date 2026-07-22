import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Match } from '../models/Match.js';
import { User } from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
import type { PlayerTeam } from '../types/index.js';

const router: Router = Router();

// 创建比赛验证
const createMatchSchema = z.object({
  opponentUsername: z.string().min(3),
  team: z.record(z.unknown()),
});

// 计算比赛结果（AI对战）
const calculateMatchResult = (
  team1: PlayerTeam,
  team2: PlayerTeam
): { team1Score: number; team2Score: number; winnerId: string; mvpId: string } => {
  const power1 = team1.players.reduce((sum, p) => sum + p.rating, 0) / Math.max(team1.players.length, 1);
  const power2 = team2.players.reduce((sum, p) => sum + p.rating, 0) / Math.max(team2.players.length, 1);

  let team1Score = 0;
  let team2Score = 0;

  for (let i = 0; i < 13; i++) {
    if (Math.random() < power1 / (power1 + power2 + 10)) team1Score++;
    else team2Score++;
  }

  // 加时赛
  while (team1Score === team2Score) {
    if (Math.random() < power1 / (power1 + power2 + 10)) team1Score++;
    else team2Score++;
  }

  const winnerId = team1Score > team2Score ? 'player1' : 'player2';

  // MVP
  const allPlayers = [...team1.players, ...team2.players];
  const mvp = allPlayers.length > 0
    ? allPlayers.reduce((best, p) => (p.rating > best.rating ? p : best))
    : null;

  return {
    team1Score,
    team2Score,
    winnerId,
    mvpId: mvp?.id || '',
  };
};

// 所有对战路由需要认证
router.use(authMiddleware);

// 创建对战
router.post('/', async (req, res) => {
  try {
    const validated = createMatchSchema.parse(req.body);
    const userId = req.user!.userId;
    const username = req.user!.username;

    // 查找对手
    const opponent = await User.findOne({ username: validated.opponentUsername });
    if (!opponent) {
      errorResponse(res, '对手不存在', 404);
      return;
    }

    if (opponent._id.toString() === userId) {
      errorResponse(res, '不能和自己对战', 400);
      return;
    }

    const matchId = uuidv4();
    const match = await Match.create({
      matchId,
      player1Id: userId,
      player2Id: opponent._id,
      player1Name: username,
      player2Name: opponent.username,
      player1Team: validated.team as unknown as PlayerTeam,
      player2Team: null,
      status: 'waiting',
    });

    successResponse(res, match, '对战创建成功，等待对手接受', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errorResponse(res, '输入数据无效', 400, error.errors.map(e => e.message).join(', '));
      return;
    }
    errorResponse(res, '创建对战失败', 500, (error as Error).message);
  }
});

// 接受对战
router.post('/:matchId/accept', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { team } = req.body;
    const { matchId } = req.params;

    const match = await Match.findOne({ matchId, player2Id: userId, status: 'waiting' });

    if (!match) {
      errorResponse(res, '对战不存在或无权操作', 404);
      return;
    }

    if (!team) {
      errorResponse(res, '请提供战队数据', 400);
      return;
    }

    match.player2Team = team as unknown as PlayerTeam;
    match.status = 'ready';
    await match.save();

    successResponse(res, match, '已接受对战');
  } catch (error) {
    errorResponse(res, '接受对战失败', 500, (error as Error).message);
  }
});

// 开始对战并计算结果（AI模拟）
router.post('/:matchId/start', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { matchId } = req.params;

    const match = await Match.findOne({
      matchId,
      $or: [{ player1Id: userId }, { player2Id: userId }],
      status: 'ready',
    });

    if (!match || !match.player1Team || !match.player2Team) {
      errorResponse(res, '对战未准备好或无权操作', 400);
      return;
    }

    const result = calculateMatchResult(match.player1Team, match.player2Team);
    const winnerUserId = result.winnerId === 'player1'
      ? match.player1Id.toString()
      : match.player2Id.toString();

    match.result = {
      ...result,
      winnerId: winnerUserId,
    };
    match.status = 'finished';
    await match.save();

    // 更新用户VCT积分
    const points = 10;
    await User.findByIdAndUpdate(winnerUserId, { $inc: { vctPoints: points } });

    successResponse(res, match, '对战结束');
  } catch (error) {
    errorResponse(res, '开始对战失败', 500, (error as Error).message);
  }
});

// 获取对战详情
router.get('/:matchId', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { matchId } = req.params;

    const match = await Match.findOne({
      matchId,
      $or: [{ player1Id: userId }, { player2Id: userId }],
    });

    if (!match) {
      errorResponse(res, '对战不存在或无权查看', 404);
      return;
    }

    successResponse(res, match, '获取对战详情成功');
  } catch (error) {
    errorResponse(res, '获取对战详情失败', 500, (error as Error).message);
  }
});

// 获取我的对战列表
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    const query: Record<string, unknown> = {
      $or: [{ player1Id: userId }, { player2Id: userId }],
    };

    if (status) {
      query.status = status;
    }

    const matches = await Match.find(query)
      .sort({ updatedAt: -1 })
      .limit(50);

    successResponse(res, matches, '获取对战列表成功');
  } catch (error) {
    errorResponse(res, '获取对战列表失败', 500, (error as Error).message);
  }
});

// 主动认输
router.post('/:matchId/forfeit', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { matchId } = req.params;

    const match = await Match.findOne({
      matchId,
      $or: [{ player1Id: userId }, { player2Id: userId }],
      status: { $in: ['waiting', 'ready'] },
    });

    if (!match) {
      errorResponse(res, '对战不存在或无法认输', 400);
      return;
    }

    const isPlayer1 = match.player1Id.toString() === userId;
    const winnerId = isPlayer1 ? match.player2Id.toString() : match.player1Id.toString();

    match.status = 'finished';
    match.result = {
      winnerId,
      team1Score: isPlayer1 ? 0 : 13,
      team2Score: isPlayer1 ? 13 : 0,
    };
    await match.save();

    await User.findByIdAndUpdate(winnerId, { $inc: { vctPoints: 10 } });

    successResponse(res, match, '已认输');
  } catch (error) {
    errorResponse(res, '认输失败', 500, (error as Error).message);
  }
});

export default router;
