import { Router } from 'express';
import { z } from 'zod';
import { Save } from '../models/Save.js';
import { authMiddleware } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
const router = Router();
// 所有存档路由都需要认证
router.use(authMiddleware);
// 保存游戏验证
const saveSchema = z.object({
    slot: z.number().int().min(1).max(5),
    name: z.string().min(1).max(50),
    gameState: z.record(z.unknown()),
    isAutoSave: z.boolean().optional(),
});
// 获取用户的所有存档
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const saves = await Save.find({ userId })
            .select('slot name isAutoSave updatedAt createdAt')
            .sort({ slot: 1 });
        successResponse(res, saves, '获取存档列表成功');
    }
    catch (error) {
        errorResponse(res, '获取存档列表失败', 500, error.message);
    }
});
// 获取指定存档
router.get('/:slot', async (req, res) => {
    try {
        const userId = req.user.userId;
        const slot = parseInt(req.params.slot, 10);
        if (isNaN(slot) || slot < 1 || slot > 5) {
            errorResponse(res, '存档槽位无效', 400);
            return;
        }
        const save = await Save.findOne({ userId, slot });
        if (!save) {
            errorResponse(res, '存档不存在', 404);
            return;
        }
        successResponse(res, save, '获取存档成功');
    }
    catch (error) {
        errorResponse(res, '获取存档失败', 500, error.message);
    }
});
// 保存/更新游戏进度
router.post('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const validated = saveSchema.parse(req.body);
        const saveData = {
            userId,
            slot: validated.slot,
            name: validated.name,
            gameState: validated.gameState,
            isAutoSave: validated.isAutoSave || false,
        };
        // 使用 upsert 更新或创建
        const save = await Save.findOneAndUpdate({ userId, slot: validated.slot }, saveData, { upsert: true, new: true, setDefaultsOnInsert: true });
        successResponse(res, save, '保存成功');
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            errorResponse(res, '输入数据无效', 400, error.errors.map(e => e.message).join(', '));
            return;
        }
        errorResponse(res, '保存失败', 500, error.message);
    }
});
// 删除存档
router.delete('/:slot', async (req, res) => {
    try {
        const userId = req.user.userId;
        const slot = parseInt(req.params.slot, 10);
        if (isNaN(slot) || slot < 1 || slot > 5) {
            errorResponse(res, '存档槽位无效', 400);
            return;
        }
        const result = await Save.findOneAndDelete({ userId, slot });
        if (!result) {
            errorResponse(res, '存档不存在', 404);
            return;
        }
        successResponse(res, { slot }, '删除存档成功');
    }
    catch (error) {
        errorResponse(res, '删除存档失败', 500, error.message);
    }
});
// 自动保存（更新最新存档或创建槽位1的存档）
router.post('/auto', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { gameState } = req.body;
        if (!gameState) {
            errorResponse(res, '游戏状态不能为空', 400);
            return;
        }
        // 查找最新的存档，如果没有则使用槽位1
        const latestSave = await Save.findOne({ userId }).sort({ updatedAt: -1 });
        const slot = latestSave?.slot || 1;
        const name = latestSave?.name || '自动保存';
        const save = await Save.findOneAndUpdate({ userId, slot }, {
            userId,
            slot,
            name,
            gameState: gameState,
            isAutoSave: true,
        }, { upsert: true, new: true });
        successResponse(res, save, '自动保存成功');
    }
    catch (error) {
        errorResponse(res, '自动保存失败', 500, error.message);
    }
});
export default router;
//# sourceMappingURL=saves.js.map