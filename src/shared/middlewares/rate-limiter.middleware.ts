// shared/middlewares/rate-limiter.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorType } from '../errors/AppError';

// Armazenamento em memória (apenas para desenvolvimento)
interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const requestCache: Map<string, RateLimitInfo> = new Map();

export const memoryRateLimiter = (
  windowMs: number = 15 * 60 * 1000, // 15 minutos
  maxRequests: number = 100          // 100 requisições
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Extrai um IP como string da requisição
    const getClientIp = (req: Request): string => {
      const forwardedFor = req.headers['x-forwarded-for'];
      if (forwardedFor) {
        // Se for um array, pega o primeiro elemento, se for string usa diretamente
        const ips = Array.isArray(forwardedFor) 
          ? forwardedFor[0] 
          : forwardedFor.split(',')[0].trim();
        return ips || 'unknown';
      }
      return req.ip || 'unknown';
    };

    const clientIp = getClientIp(req);
    const now = Date.now();
    
    // Verifica se há informações de limite para este IP
    if (requestCache.has(clientIp)) {
      const rateLimitInfo = requestCache.get(clientIp)!;
      
      // Verifica se o tempo de reset já passou
      if (now > rateLimitInfo.resetTime) {
        // Reinicia o contador
        rateLimitInfo.count = 1;
        rateLimitInfo.resetTime = now + windowMs;
      } else {
        // Incrementa o contador
        rateLimitInfo.count += 1;
        
        // Verifica se excedeu o limite
        if (rateLimitInfo.count > maxRequests) {
          res.setHeader('Retry-After', Math.ceil((rateLimitInfo.resetTime - now) / 1000).toString());
          next(new AppError(
            'Muitas requisições, tente novamente mais tarde',
            ErrorType.BAD_REQUEST,
            429
          ));
          return;
        }
      }
      
      // Atualiza o cache
      requestCache.set(clientIp, rateLimitInfo);
    } else {
      // Primeira requisição deste IP
      requestCache.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
    }
    
    // Informa o cliente sobre o limite de requisições restantes
    const remaining = maxRequests - (requestCache.get(clientIp)?.count || 0);
    res.setHeader('X-Rate-Limit-Remaining', remaining.toString());
    
    next();
  };
};