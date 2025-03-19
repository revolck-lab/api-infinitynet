import { hash } from 'bcrypt';
import { BaseRepository } from '../../../shared/database/BaseRepository';
import { UserAffiliate, CreateUserAffiliateDTO, UpdateUserAffiliateDTO } from '../models/UserAffiliate';
import { AppError, ErrorType } from '../../../shared/errors/AppError';
import { config } from '../../../config';

class UserAffiliateRepository extends BaseRepository<UserAffiliate, CreateUserAffiliateDTO, UpdateUserAffiliateDTO> {
  constructor() {
    // Passando 'userAffiliate' como nome do modelo para o Prisma
    // Campos únicos e relações
    super('userAffiliate', ['email', 'cpf', 'telefone'], ['role', 'status']);
  }

  /**
   * Sobrescreve o método create para tratar senhas e validações específicas
   */
  public async create(data: CreateUserAffiliateDTO): Promise<UserAffiliate> {
    // Verifica se os IDs de role e status existem
    const role = await this.prisma.role.findUnique({
      where: { id: data.roleId },
    });

    if (!role) {
      throw new AppError('Perfil (role) não encontrado', ErrorType.BAD_REQUEST, 400);
    }

    const status = await this.prisma.status.findUnique({
      where: { id: data.statusId },
    });

    if (!status) {
      throw new AppError('Status não encontrado', ErrorType.BAD_REQUEST, 400);
    }

    // Criptografa a senha
    const hashedPassword = await hash(data.senha, config.auth.bcrypt.saltRounds);

    // Utiliza o método da classe base, mas com senha criptografada
    return super.create({
      ...data,
      senha: hashedPassword,
    });
  }

  /**
   * Sobrescreve o método update para tratar senhas
   */
  public async update(id: string, data: UpdateUserAffiliateDTO): Promise<UserAffiliate> {
    // Se estiver atualizando a roleId, verifica se existe
    if (data.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: data.roleId },
      });

      if (!role) {
        throw new AppError('Perfil (role) não encontrado', ErrorType.BAD_REQUEST, 400);
      }
    }

    // Se estiver atualizando o statusId, verifica se existe
    if (data.statusId) {
      const status = await this.prisma.status.findUnique({
        where: { id: data.statusId },
      });

      if (!status) {
        throw new AppError('Status não encontrado', ErrorType.BAD_REQUEST, 400);
      }
    }

    // Se estiver atualizando a senha, criptografa
    let updateData = { ...data };

    if (data.senha) {
      const hashedPassword = await hash(data.senha, config.auth.bcrypt.saltRounds);
      updateData.senha = hashedPassword;
    }

    // Utiliza o método da classe base com os dados tratados
    return super.update(id, updateData);
  }

  /**
   * Método específico para buscar usuário por CPF
   */
  public async findByCpf(cpf: string): Promise<UserAffiliate | null> {
    return this.findByField('cpf', cpf);
  }

  /**
   * Método específico para buscar usuário por email
   */
  public async findByEmail(email: string): Promise<UserAffiliate | null> {
    return this.findByField('email', email);
  }

  /**
   * Método específico para buscar usuário por telefone
   */
  public async findByTelefone(telefone: string): Promise<UserAffiliate | null> {
    return this.findByField('telefone', telefone);
  }

  /**
   * Método para atualizar o número de tentativas de login
   */
  public async incrementFailedAttempts(id: string): Promise<UserAffiliate> {
    const user = await this.findById(id);
    
    if (!user) {
      throw new AppError('Usuário não encontrado', ErrorType.NOT_FOUND, 404);
    }
    
    return this.update(id, {
      failedAttempts: (user.failedAttempts || 0) + 1
    });
  }

  /**
   * Método para resetar o número de tentativas de login e atualizar último login
   */
  public async registerSuccessfulLogin(id: string): Promise<UserAffiliate> {
    return this.update(id, {
      failedAttempts: 0,
      lastLoginAt: new Date()
    });
  }
}

export default new UserAffiliateRepository();