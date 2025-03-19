import { hash } from 'bcrypt';
import { BaseRepository } from '../../../shared/database/BaseRepository';
import { UserAdmin, CreateUserAdminDTO, UpdateUserAdminDTO } from '../models/UserAdmin';
import { AppError, ErrorType } from '../../../shared/errors/AppError';
import { config } from '../../../config';

class UserAdminRepository extends BaseRepository<UserAdmin, CreateUserAdminDTO, UpdateUserAdminDTO> {
  constructor() {
    // Passando 'userAdmin' como nome do modelo para o Prisma
    // Campos únicos e relações
    super('userAdmin', ['email', 'cpf', 'telefone'], ['role', 'status']);
  }

  /**
   * Sobrescreve o método create para tratar senhas e validações específicas
   */
  public async create(data: CreateUserAdminDTO): Promise<UserAdmin> {
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
  public async update(id: string, data: UpdateUserAdminDTO): Promise<UserAdmin> {
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
  public async findByCpf(cpf: string): Promise<UserAdmin | null> {
    return this.findByField('cpf', cpf);
  }

  /**
   * Método específico para buscar usuário por email
   */
  public async findByEmail(email: string): Promise<UserAdmin | null> {
    return this.findByField('email', email);
  }

  /**
   * Método específico para buscar usuário por telefone
   */
  public async findByTelefone(telefone: string): Promise<UserAdmin | null> {
    return this.findByField('telefone', telefone);
  }

  /**
   * Método para atualizar o número de tentativas de login
   */
  public async incrementFailedAttempts(id: string): Promise<UserAdmin> {
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
  public async registerSuccessfulLogin(id: string): Promise<UserAdmin> {
    return this.update(id, {
      failedAttempts: 0,
      lastLoginAt: new Date()
    });
  }
}

export default new UserAdminRepository();