const jwt = require('jsonwebtoken');
import { config } from '../../../config';
import { AppError, ErrorType } from '../../../shared/errors/AppError';

export class TokenService {
  /**
   * Gera um token JWT
   */
  public generateToken(payload: any, expiresIn: string = config.auth.jwt.expiresIn): string {
    // Usando a biblioteca via require
    return jwt.sign(payload, config.auth.jwt.secret, {
      expiresIn,
      issuer: 'api-infinitynet'
    });
  }

  /**
   * Verifica e decodifica um token JWT
   */
  public async verifyToken(token: string): Promise<any> {
    try {
      // Verifica a validade do token usando require
      const decoded = jwt.verify(token, config.auth.jwt.secret);
      
      // Verifica o emissor do token
      if (decoded.iss !== 'api-infinitynet') {
        throw new AppError('Token inválido', ErrorType.AUTHENTICATION, 401);
      }
      
      return decoded;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Token inválido ou expirado', ErrorType.AUTHENTICATION, 401);
    }
  }
}

export const tokenService = new TokenService();