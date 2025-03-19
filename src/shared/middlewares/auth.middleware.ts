// src/shared/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verify, JwtPayload } from 'jsonwebtoken';
import { config } from '../../config';
import { AppError, ErrorType } from '../errors/AppError';
import { logger } from '../services/logger.service';

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
 * Classe de autenticação e autorização
 */
export class Auth {
  /**
   * Middleware para validação de token JWT
   * Verifica se o token é válido e adiciona os dados do usuário ao objeto de requisição
   */
  public static jwtMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    try {
      // Obtém o token do cabeçalho
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw AppError.authentication('Token não fornecido');
      }

      // Verifica o formato do token
      const parts = authHeader.split(' ');

      if (parts.length !== 2) {
        throw AppError.authentication('Formato de token inválido');
      }

      const [scheme, token] = parts;

      if (!/^Bearer$/i.test(scheme)) {
        throw AppError.authentication('Formato de token inválido');
      }

      // Verifica se o token é válido
      const decoded = verify(token, config.auth.jwt.secret) as JwtPayload;

      // Adiciona os dados do usuário à requisição
      req.user = {
        id: decoded.sub || '',
        name: decoded.name || '',
        email: decoded.email || '',
        role: decoded.role || {},
      };

      logger.debug('Usuário autenticado com JWT', {
        userId: req.user.id,
        email: req.user.email,
        roleLevel: req.user.role.level
      });

      return next();
    } catch (error) {
      throw AppError.authentication('Token inválido ou expirado');
    }
  }

  /**
   * Middleware para verificar o nível de acesso do usuário
   * @param requiredLevel - Nível mínimo necessário para acesso
   */
  public static requireRole(requiredLevel: number) {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Verifica se o usuário está autenticado
      if (!req.user) {
        throw AppError.authentication('Não autenticado');
      }

      // Verifica se o usuário tem o nível de acesso necessário
      const userLevel = req.user.role.level || 0;

      if (userLevel < requiredLevel) {
        logger.warn('Acesso negado por nível de permissão insuficiente', {
          userId: req.user.id,
          userLevel,
          requiredLevel,
          path: req.path
        });
        
        throw AppError.authorization(
          `Acesso negado. Nível mínimo requerido: ${requiredLevel}`
        );
      }

      return next();
    };
  }

  /**
   * Middleware para compatibilidade com o sistema antigo de autenticação por API Key
   * Será descontinuado em versões futuras
   */
  public static apiKeyMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== config.auth.apiKey) {
      throw AppError.authentication('API Key inválida');
    }

    logger.info('Usuário autenticado com API Key', {
      apiKey: '***API_KEY_HIDDEN***',
      path: req.path,
      method: req.method
    });

    return next();
  }
}

// Exporta funções diretamente para manter compatibilidade com código existente
export const jwtMiddleware = Auth.jwtMiddleware;
export const requireRole = Auth.requireRole;
export const apiKeyMiddleware = Auth.apiKeyMiddleware;