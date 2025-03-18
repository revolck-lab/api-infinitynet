import { sign, verify, JwtPayload, Secret } from "jsonwebtoken";
import { compare } from "bcrypt";
import { config } from "../../../config";
import { AppError, ErrorType } from "../../../shared/errors/AppError";
import userRepository from "../../user/repositories/UserRepository";
import { User } from "../../user/models/User";

/**
 * Interface para resposta de autenticação
 */
export interface AuthResponse {
  user: {
    id: string;
    nome: string;
    email: string;
    role: {
      id: string;
      name: string;
      level: number;
    };
  };
  token: string;
  refreshToken: string;
}

/**
 * Serviço para autenticação e gerenciamento de tokens JWT
 */
class AuthService {
  /**
   * Realiza o login do usuário
   */
  public async login(email: string, password: string): Promise<AuthResponse> {
    // Busca o usuário pelo email
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw AppError.authentication("Credenciais inválidas");
    }

    // Verifica se o status do usuário é ativo
    const isUserActive = user.status?.name === "Ativo";

    if (!isUserActive) {
      throw AppError.authentication("Usuário inativo");
    }

    // Verifica se a senha está correta
    const passwordMatch = await compare(password, user.senha);

    if (!passwordMatch) {
      throw AppError.authentication("Credenciais inválidas");
    }

    // Gera os tokens JWT
    const { token, refreshToken } = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: {
          id: user.role?.id || "",
          name: user.role?.name || "",
          level: user.role?.level || 0,
        },
      },
      token,
      refreshToken,
    };
  }

  /**
   * Gera token de acesso e refresh token
   */
  private generateTokens(user: User): { token: string; refreshToken: string } {
    // Payload para o token JWT
    const payload = {
      sub: user.id,
      name: user.nome,
      email: user.email,
      role: {
        id: user.role?.id,
        name: user.role?.name,
        level: user.role?.level,
      },
    };

    // Converter a chave secreta para o tipo Secret
    const secretKey: Secret = config.auth.jwt.secret;

    // Gera o token de acesso
    const token = sign(payload, secretKey, {
      expiresIn: config.auth.jwt.expiresIn,
    });

    // Gera o refresh token com uma expiração mais longa
    const refreshToken = sign({ sub: user.id }, secretKey, {
      expiresIn: config.auth.jwt.refreshExpiresIn,
    });

    return { token, refreshToken };
  }

  /**
   * Atualiza o token usando o refresh token
   */
  public async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      // Converter a chave secreta para o tipo Secret
      const secretKey: Secret = config.auth.jwt.secret;
      
      // Verifica se o refresh token é válido
      const decoded = verify(
        refreshToken,
        secretKey
      ) as JwtPayload;

      if (!decoded.sub) {
        throw AppError.authentication("Token inválido");
      }

      // Busca o usuário pelo ID
      const user = await userRepository.findById(decoded.sub);

      if (!user) {
        throw AppError.authentication("Usuário não encontrado");
      }

      // Verifica se o status do usuário é ativo
      const isUserActive = user.status?.name === "Ativo";

      if (!isUserActive) {
        throw AppError.authentication("Usuário inativo");
      }

      // Gera um novo token de acesso
      const payload = {
        sub: user.id,
        name: user.nome,
        email: user.email,
        role: {
          id: user.role?.id,
          name: user.role?.name,
          level: user.role?.level,
        },
      };

      const token = sign(payload, secretKey, {
        expiresIn: config.auth.jwt.expiresIn,
      });

      return { token };
    } catch (error) {
      throw AppError.authentication("Refresh token inválido ou expirado");
    }
  }
}

export default new AuthService();