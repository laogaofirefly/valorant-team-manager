import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';
const router = Router();
// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d');
// 生成JWT
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
// 注册验证模式
const registerSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(6),
    nickname: z.string().max(20).optional(),
});
// 登录验证模式
const loginSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
});
// 注册
router.post('/register', async (req, res) => {
    try {
        const validated = registerSchema.parse(req.body);
        // 检查用户名和邮箱是否已存在
        const existingUser = await User.findOne({
            $or: [{ username: validated.username }, { email: validated.email }],
        });
        if (existingUser) {
            errorResponse(res, '用户名或邮箱已存在', 409);
            return;
        }
        const user = await User.create(validated);
        const token = generateToken({
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
        });
        successResponse(res, {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                nickname: user.nickname,
                avatar: user.avatar,
                vctPoints: user.vctPoints,
            },
            token,
        }, '注册成功', 201);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            errorResponse(res, '输入数据无效', 400, error.errors.map(e => e.message).join(', '));
            return;
        }
        errorResponse(res, '注册失败', 500, error.message);
    }
});
// 登录
router.post('/login', async (req, res) => {
    try {
        const validated = loginSchema.parse(req.body);
        const user = await User.findOne({ username: validated.username });
        if (!user) {
            errorResponse(res, '用户名或密码错误', 401);
            return;
        }
        const isPasswordValid = await user.comparePassword(validated.password);
        if (!isPasswordValid) {
            errorResponse(res, '用户名或密码错误', 401);
            return;
        }
        const token = generateToken({
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
        });
        successResponse(res, {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                nickname: user.nickname,
                avatar: user.avatar,
                vctPoints: user.vctPoints,
            },
            token,
        }, '登录成功');
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            errorResponse(res, '输入数据无效', 400, error.errors.map(e => e.message).join(', '));
            return;
        }
        errorResponse(res, '登录失败', 500, error.message);
    }
});
// 验证令牌
router.get('/verify', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        errorResponse(res, '未提供认证令牌', 401);
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            errorResponse(res, '用户不存在', 404);
            return;
        }
        successResponse(res, {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                nickname: user.nickname,
                avatar: user.avatar,
                vctPoints: user.vctPoints,
            },
        }, '令牌有效');
    }
    catch {
        errorResponse(res, '认证令牌无效或已过期', 401);
    }
});
export default router;
//# sourceMappingURL=auth.js.map