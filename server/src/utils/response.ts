import type { Response } from 'express';
import type { ApiResponse } from '../types/index.js';

export const successResponse = <T>(res: Response, data: T, message = '操作成功', statusCode = 200): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const errorResponse = (res: Response, message = '操作失败', statusCode = 400, error?: string): void => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  if (error) response.error = error;
  res.status(statusCode).json(response);
};
