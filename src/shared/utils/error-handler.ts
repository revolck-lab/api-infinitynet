import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../services/logger.service';
import { AppError, ErrorType } from '../errors/AppError';
import { config } from '../../config';

export class ErrorHandler {
  /**
   * Middleware central para tratamento de todos os erros da aplicação
   */
  public static handleError(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    let statusCode = 500;
    let errorType = ErrorType.INTERNAL;
    let message = 'Erro interno do servidor';
    let details: any = undefined;
    const requestId = req.headers['x-request-id'] || 'unknown';

    // Tratamento específico para erros conhecidos
    if (err instanceof AppError) {
      statusCode = err.statusCode;
      errorType = err.type;
      message = err.message;
      details = err.details;

      // Registra detalhes do erro operacional
      logger.warn(`${errorType}: ${message}`, {
        path: req.path,
        method: req.method,
        details,
        requestId,
        userId: req.user?.id
      });
    }
    // Tratamento específico para erros de validação do Zod
    else if (err instanceof ZodError) {
      statusCode = 400;
      errorType = ErrorType.VALIDATION;
      message = 'Erro de validação';
      details = err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }));

      logger.warn(`${errorType}: ${message}`, {
        path: req.path,
        method: req.method,
        details,
        requestId,
        userId: req.user?.id
      });
    }
    // Erros desconhecidos (possivelmente críticos)
    else {
      logger.error('Erro não tratado', {
        path: req.path,
        method: req.method,
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack
        },
        requestId,
        userId: req.user?.id
      });
    }

    // Responde ao cliente com o erro formatado
    res.status(statusCode).json({
      status: 'error',
      type: errorType,
      message,
      // Inclui detalhes apenas em ambiente de desenvolvimento
      ...(config.server.isDev && details && { details }),
      // Inclui o stack trace apenas em ambiente de desenvolvimento
      ...(config.server.isDev && err.stack && { stack: err.stack }),
      requestId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Método para envolver um controller e capturar seus erros
   * @param fn Função controller a ser envolvida
   */
  public static catchErrors(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Middleware para capturar erros em rotas não encontradas
   */
  public static handleNotFound(req: Request, _res: Response, next: NextFunction): void {
    next(AppError.notFound(`Rota não encontrada: ${req.method} ${req.path}`));
  }
}