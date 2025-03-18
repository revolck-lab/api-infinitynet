import { Request, Response, NextFunction } from "express";
import { verify, JwtPayload } from "jsonwebtoken";
import { config } from "../../config";
import { AppError } from "../errors/AppError";

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
export const authMiddleware = (
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