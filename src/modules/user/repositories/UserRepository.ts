import { hash } from 'bcrypt';
import { BaseRepository } from '../../../shared/database/BaseRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '../models/User';
import { AppError, ErrorType } from '../../../shared/errors/AppError';
import { config } from '../../../config';

class UserRepository extends BaseRepository<User, CreateUserDTO, UpdateUserDTO> {
  constructor() {
    // Nome do modelo no Prisma, campos únicos e relações
    super('user', ['email', 'cpf', 'telefone'], ['role', 'status']);
  }

  /**
   * Sobrescreve o método create para tratar senhas e validações específicas
   */
  public async create(data: CreateUserDTO): Promise<User> {
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
  public async update(id: string, data: UpdateUserDTO): Promise<User> {
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
   * Método específico para buscar usuário por email
   */
  public async findByEmail(email: string): Promise<User | null> {
    return this.findByField('email', email);
  }

  /**
   * Método específico para buscar usuário por CPF
   */
  public async findByCpf(cpf: string): Promise<User | null> {
    return this.findByField('cpf', cpf);
  }
}

export default new UserRepository();