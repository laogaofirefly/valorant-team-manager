import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response.js';
import type { JWTPayload } from '../types/index.js';

// 扩展Express Request类型
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorResponse(res, '未提供认证令牌', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'default-secret';

  try {
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = decoded;
    next();
  } catch {
    errorResponse(res, '认证令牌无效或已过期', 401);
  }
};
