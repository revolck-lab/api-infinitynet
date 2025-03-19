import { Request, Response, NextFunction } from "express";
import { AppError, ErrorType } from "../errors/AppError";

// Interface para armazenar informações de limitação de taxa
interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// Cache simples para armazenar as requisições por IP
const requestCache: Map<string, RateLimitInfo> = new Map();

// Configurações de limitação de taxa
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequestsPerWindow: 100, // 100 requisições por janela
};

/**
 * Extrai um IP como string da requisição
 */
function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // Se for um array, pega o primeiro elemento, se for string usa diretamente
    const ips = Array.isArray(forwardedFor) 
      ? forwardedFor[0] 
      : forwardedFor.split(',')[0].trim();
    return ips || 'unknown';
  }
  return req.ip || 'unknown';
}

/**
 * Middleware para limitar requisições por IP
 */
export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Obtém o IP do cliente
  const clientIp = getClientIp(req);
  
  // Obtém a hora atual
  const now = Date.now();
  
  // Verifica se há informações de limite para este IP
  if (requestCache.has(clientIp)) {
    const rateLimitInfo = requestCache.get(clientIp)!;
    
    // Verifica se o tempo de reset já passou
    if (now > rateLimitInfo.resetTime) {
      // Reinicia o contador
      rateLimitInfo.count = 1;
      rateLimitInfo.resetTime = now + RATE_LIMIT.windowMs;
    } else {
      // Incrementa o contador
      rateLimitInfo.count += 1;
      
      // Verifica se excedeu o limite
      if (rateLimitInfo.count > RATE_LIMIT.maxRequestsPerWindow) {
        res.setHeader('Retry-After', Math.ceil((rateLimitInfo.resetTime - now) / 1000).toString());
        throw new AppError(
          'Muitas requisições, tente novamente mais tarde',
          ErrorType.BAD_REQUEST,
          429
        );
      }
    }
    
    // Atualiza o cache
    requestCache.set(clientIp, rateLimitInfo);
  } else {
    // Primeira requisição deste IP
    requestCache.set(clientIp, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
  }
  
  // Informa o cliente sobre o limite de requisições restantes
  const remaining = RATE_LIMIT.maxRequestsPerWindow - (requestCache.get(clientIp)?.count || 0);
  res.setHeader('X-Rate-Limit-Remaining', remaining.toString());
  
  next();
};

/**
 * Middleware para proteção contra Content-Type incorreto
 */
export const contentTypeCheck = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Verifica apenas requisições POST, PUT e PATCH com corpo
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      throw new AppError(
        'Content-Type não suportado. Utilize application/json',
        ErrorType.VALIDATION,
        415
      );
    }
  }
  
  next();
};

/**
 * Middleware para verificar tamanho de payload
 */
export const payloadSizeCheck = (maxSize: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    // Converte o maxSize para bytes (ex: '1mb' para bytes)
    const sizeUnit = maxSize.slice(-2);
    const size = parseInt(maxSize.slice(0, -2));
    
    let maxBytes = 0;
    if (sizeUnit === 'kb') {
      maxBytes = size * 1024;
    } else if (sizeUnit === 'mb') {
      maxBytes = size * 1024 * 1024;
    }
    
    if (contentLength > maxBytes) {
      throw new AppError(
        `Payload excede o tamanho máximo permitido (${maxSize})`,
        ErrorType.BAD_REQUEST,
        413
      );
    }
    
    next();
  };
};

/**
 * Middleware para proteger contra parâmetros maliciosos
 */
export const sanitizeParams = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  // Lista de padrões suspeitos (simplificada)
  const suspiciousPatterns = [
    /javascript:/i,
    /<script>/i,
    /onclick/i,
    /onerror/i,
    /alert\(/i,
    /document\.cookie/i,
    /eval\(/i,
    /execCommand/i,
  ];
  
  // Verifica query params
  const queryParams = req.query;
  for (const key in queryParams) {
    const value = queryParams[key];
    if (typeof value === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          throw new AppError(
            'Parâmetro suspeito detectado',
            ErrorType.BAD_REQUEST,
            400
          );
        }
      }
    }
  }
  
  next();
};

/**
 * Middleware para adicionar cabeçalhos de segurança extras
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Previne vazamento de referrer para outros domínios
  res.setHeader('Referrer-Policy', 'same-origin');
  
  // Força conexões HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Define a política de recursos para a API
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  
  next();
};