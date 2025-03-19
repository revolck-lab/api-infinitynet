import { compare } from "bcrypt";
import { config } from "../../../config";
import { AppError, ErrorType } from "../../../shared/errors/AppError";

// Importações dos repositórios de usuários
import userPhoneRepository from "../../user-phone/repositories/UserPhoneRepository";
import userAdminRepository from "../../user-admin/repositories/UserAdminRepository";
import userAffiliateRepository from "../../user-affiliate/repositories/UserAffiliateRepository";

// Importando jsonwebtoken usando require para evitar problemas de tipagem
const jwt = require('jsonwebtoken');

/**
 * Tipo para o perfil de acesso do usuário
 */
interface UserRole {
  id: string;
  name: string;
  level: number;
}

/**
 * Tipo de fonte do usuário (qual tabela)
 */
export enum UserSource {
  PHONE = 'phone',
  ADMIN = 'admin',
  AFFILIATE = 'affiliate'
}

/**
 * Interface para resposta de autenticação
 */
export interface AuthResponse {
  user: {
    id: string;
    nome: string;
    email: string;
    source: UserSource; // Tipo de fonte do usuário
    role: UserRole;
  };
  token: string;
  refreshToken: string;
}

/**
 * Serviço para autenticação e gerenciamento de tokens JWT
 */
class AuthService {
  /**
   * Realiza o login de usuário por telefone e PIN (app móvel)
   */
  public async loginByPhone(telefone: string, pin: string): Promise<AuthResponse> {
    // Busca o usuário pelo telefone
    const user = await userPhoneRepository.findByTelefone(telefone);

    if (!user) {
      throw AppError.authentication("Credenciais inválidas");
    }

    // Verifica se o status do usuário é ativo
    const isUserActive = user.status?.name === "Ativo";

    if (!isUserActive) {
      throw AppError.authentication("Usuário inativo");
    }

    // Verifica tentativas de login
    const MAX_FAILED_ATTEMPTS = 5;
    if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      throw AppError.authentication("Conta bloqueada por excesso de tentativas incorretas. Por favor, contate o suporte.");
    }

    // Verifica se o PIN está correto
    const pinMatch = await compare(pin, user.pin);

    if (!pinMatch) {
      // Incrementa tentativas falhas
      await userPhoneRepository.incrementFailedAttempts(user.id);
      throw AppError.authentication("Credenciais inválidas");
    }

    // Registra login bem-sucedido (reseta tentativas)
    await userPhoneRepository.registerSuccessfulLogin(user.id);

    // Gera os tokens JWT
    const { token, refreshToken } = this.generateTokens({
      id: user.id,
      nome: user.nome,
      email: user.email,
      source: UserSource.PHONE,
      role: {
        id: user.role?.id || "",
        name: user.role?.name || "",
        level: user.role?.level || 0,
      }
    });

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        source: UserSource.PHONE,
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
   * Realiza o login de usuário administrativo por CPF e senha
   */
  public async loginAdmin(cpf: string, senha: string): Promise<AuthResponse> {
    // Busca o usuário pelo CPF
    const user = await userAdminRepository.findByCpf(cpf);

    if (!user) {
      throw AppError.authentication("Credenciais inválidas");
    }

    // Verifica se o status do usuário é ativo
    const isUserActive = user.status?.name === "Ativo";

    if (!isUserActive) {
      throw AppError.authentication("Usuário inativo");
    }

    // Verifica tentativas de login
    const MAX_FAILED_ATTEMPTS = 5;
    if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      throw AppError.authentication("Conta bloqueada por excesso de tentativas incorretas. Por favor, contate o suporte.");
    }

    // Verifica se a senha está correta
    const passwordMatch = await compare(senha, user.senha);

    if (!passwordMatch) {
      // Incrementa tentativas falhas
      await userAdminRepository.incrementFailedAttempts(user.id);
      throw AppError.authentication("Credenciais inválidas");
    }

    // Registra login bem-sucedido (reseta tentativas)
    await userAdminRepository.registerSuccessfulLogin(user.id);

    // Gera os tokens JWT
    const { token, refreshToken } = this.generateTokens({
      id: user.id,
      nome: user.nome,
      email: user.email,
      source: UserSource.ADMIN,
      role: {
        id: user.role?.id || "",
        name: user.role?.name || "",
        level: user.role?.level || 0,
      }
    });

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        source: UserSource.ADMIN,
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
   * Realiza o login de usuário afiliado por CPF e senha
   */
  public async loginAffiliate(cpf: string, senha: string): Promise<AuthResponse> {
    // Busca o usuário pelo CPF
    const user = await userAffiliateRepository.findByCpf(cpf);

    if (!user) {
      throw AppError.authentication("Credenciais inválidas");
    }

    // Verifica se o status do usuário é ativo
    const isUserActive = user.status?.name === "Ativo";

    if (!isUserActive) {
      throw AppError.authentication("Usuário inativo");
    }

    // Verifica tentativas de login
    const MAX_FAILED_ATTEMPTS = 5;
    if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      throw AppError.authentication("Conta bloqueada por excesso de tentativas incorretas. Por favor, contate o suporte.");
    }

    // Verifica se a senha está correta
    const passwordMatch = await compare(senha, user.senha);

    if (!passwordMatch) {
      // Incrementa tentativas falhas
      await userAffiliateRepository.incrementFailedAttempts(user.id);
      throw AppError.authentication("Credenciais inválidas");
    }

    // Registra login bem-sucedido (reseta tentativas)
    await userAffiliateRepository.registerSuccessfulLogin(user.id);

    // Gera os tokens JWT
    const { token, refreshToken } = this.generateTokens({
      id: user.id,
      nome: user.nome,
      email: user.email,
      source: UserSource.AFFILIATE,
      role: {
        id: user.role?.id || "",
        name: user.role?.name || "",
        level: user.role?.level || 0,
      }
    });

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        source: UserSource.AFFILIATE,
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
  private generateTokens(user: {
    id: string;
    nome: string;
    email: string;
    source: UserSource;
    role: UserRole;
  }): { token: string; refreshToken: string } {
    // Payload para o token JWT
    const payload = {
      sub: user.id,
      name: user.nome,
      email: user.email,
      source: user.source,
      role: user.role,
    };

    // Gera o token de acesso usando require
    const token = jwt.sign(payload, config.auth.jwt.secret, {
      expiresIn: config.auth.jwt.expiresIn,
    });

    // Gera o refresh token com uma expiração mais longa
    const refreshToken = jwt.sign({ 
      sub: user.id, 
      source: user.source 
    }, config.auth.jwt.secret, {
      expiresIn: config.auth.jwt.refreshExpiresIn,
    });

    return { token, refreshToken };
  }

  /**
   * Atualiza o token usando o refresh token
   */
  public async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      // Verifica se o refresh token é válido usando require
      const decoded = jwt.verify(refreshToken, config.auth.jwt.secret);

      if (!decoded.sub || !decoded.source) {
        throw AppError.authentication("Token inválido");
      }

      // Busca o usuário pelo ID conforme a fonte
      let user;
      switch (decoded.source) {
        case UserSource.PHONE:
          user = await userPhoneRepository.findById(decoded.sub);
          break;
        case UserSource.ADMIN:
          user = await userAdminRepository.findById(decoded.sub);
          break;
        case UserSource.AFFILIATE:
          user = await userAffiliateRepository.findById(decoded.sub);
          break;
        default:
          throw AppError.authentication("Fonte de usuário inválida");
      }

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
        source: decoded.source,
        role: {
          id: user.role?.id,
          name: user.role?.name,
          level: user.role?.level,
        },
      };

      const token = jwt.sign(payload, config.auth.jwt.secret, {
        expiresIn: config.auth.jwt.expiresIn,
      });

      return { token };
    } catch (error) {
      throw AppError.authentication("Refresh token inválido ou expirado");
    }
  }
}

export default new AuthService();