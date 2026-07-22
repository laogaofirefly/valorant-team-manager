import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.js';
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        errorResponse(res, '未提供认证令牌', 401);
        return;
    }
    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    }
    catch {
        errorResponse(res, '认证令牌无效或已过期', 401);
    }
};
//# sourceMappingURL=auth.js.map