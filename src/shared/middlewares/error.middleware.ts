import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../services/logger.service";
import { AppError, ErrorType } from "../errors/AppError";
import { config } from "../../config";

/**
 * Middleware central para tratamento de todos os erros da aplicação
 * Padroniza as respostas de erro e registra os detalhes no logger
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let errorType = ErrorType.INTERNAL;
  let message = "Erro interno do servidor";
  let details: any = undefined;

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
      details: details,
      requestId: req.headers["x-request-id"] || "unknown",
    });
  }
  // Tratamento específico para erros de validação do Zod
  else if (err instanceof ZodError) {
    statusCode = 400;
    errorType = ErrorType.VALIDATION;
    message = "Erro de validação";
    details = err.errors;

    logger.warn(`${errorType}: ${message}`, {
      path: req.path,
      method: req.method,
      details: details,
      requestId: req.headers["x-request-id"] || "unknown",
    });
  }
  // Erros desconhecidos (possivelmente críticos)
  else {
    logger.error("Erro não tratado", {
      path: req.path,
      method: req.method,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      requestId: req.headers["x-request-id"] || "unknown",
    });
  }

  // Responde ao cliente com o erro formatado
  res.status(statusCode).json({
    status: "error",
    type: errorType,
    message,
    // Inclui detalhes apenas em ambiente de desenvolvimento
    ...(config.server.isDev && details && { details }),
    // Inclui o stack trace apenas em ambiente de desenvolvimento
    ...(config.server.isDev && err.stack && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Middleware para capturar erros em rotas não encontradas
 */
export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(AppError.notFound(`Rota não encontrada: ${req.method} ${req.path}`));
};
