import { Request, Response, NextFunction } from "express";
import { verify, JwtPayload } from "jsonwebtoken";
import { config } from "../../config";
import { AppError, ErrorType } from "../errors/AppError";

/**
 * Interface para extender Request com dados do usuário autenticado
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: {
          id?: string;
          name?: string;
          level?: number;
        };
      };
    }
  }
}

/**
 * Middleware para validação de token JWT
 * Verifica se o token é válido e adiciona os dados do usuário ao objeto de requisição
 */
export const jwtMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Obtém o token do cabeçalho
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw AppError.authentication("Token não fornecido");
  }

  // Verifica o formato do token
  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    throw AppError.authentication("Formato de token inválido");
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    throw AppError.authentication("Formato de token inválido");
  }

  try {
    // Verifica se o token é válido
    const decoded = verify(token, config.auth.jwt.secret) as JwtPayload;

    // Adiciona os dados do usuário à requisição
    req.user = {
      id: decoded.sub || "",
      name: decoded.name || "",
      email: decoded.email || "",
      role: decoded.role || {},
    };

    return next();
  } catch (error) {
    throw AppError.authentication("Token inválido ou expirado");
  }
};

/**
 * Middleware para verificar o nível de acesso do usuário
 * @param requiredLevel - Nível mínimo necessário para acesso
 */
export const requireRole = (requiredLevel: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Verifica se o usuário está autenticado
    if (!req.user) {
      throw AppError.authentication("Não autenticado");
    }

    // Verifica se o usuário tem o nível de acesso necessário
    const userLevel = req.user.role.level || 0;

    if (userLevel < requiredLevel) {
      throw AppError.authorization(
        `Acesso negado. Nível mínimo requerido: ${requiredLevel}`
      );
    }

    return next();
  };
};

/**
 * Middleware para compatibilidade com o sistema antigo de autenticação por API Key
 * Será descontinuado em versões futuras
 */
export const apiKeyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== config.auth.apiKey) {
    throw AppError.authentication("API Key inválida");
  }

  return next();
};
