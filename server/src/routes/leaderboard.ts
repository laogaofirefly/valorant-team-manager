import { Router } from 'express';
import { User } from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router: Router = Router();

// 获取VCT积分榜（按vctPoints排序）
router.get('/', async (_req, res) => {
  try {
    const topPlayers = await User.find()
      .select('username nickname vctPoints createdAt')
      .sort({ vctPoints: -1, createdAt: 1 })
      .limit(100);

    const rankedPlayers = topPlayers.map((player, index) => ({
      rank: index + 1,
      id: player._id,
      username: player.username,
      nickname: player.nickname,
      vctPoints: player.vctPoints,
    }));

    successResponse(res, rankedPlayers, '获取排行榜成功');
  } catch (error) {
    errorResponse(res, '获取排行榜失败', 500, (error as Error).message);
  }
});

// 获取指定用户排名
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('username nickname vctPoints');
    if (!user) {
      errorResponse(res, '用户不存在', 404);
      return;
    }

    const rank = await User.countDocuments({ vctPoints: { $gt: user.vctPoints } }) + 1;

    successResponse(res, {
      rank,
      username: user.username,
      nickname: user.nickname,
      vctPoints: user.vctPoints,
    }, '获取用户排名成功');
  } catch (error) {
    errorResponse(res, '获取用户排名失败', 500, (error as Error).message);
  }
});

export default router;
