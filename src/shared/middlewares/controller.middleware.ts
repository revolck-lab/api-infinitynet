import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Middleware para encapsular os controladores assíncronos e tratar erros consistentemente
 */
export const asyncHandler = (fn: AsyncController) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};