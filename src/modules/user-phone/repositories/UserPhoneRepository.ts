import { hash } from 'bcrypt';
import { BaseRepository } from '../../../shared/database/BaseRepository';
import { UserPhone, CreateUserPhoneDTO, UpdateUserPhoneDTO } from '../models/UserPhone';
import { AppError, ErrorType } from '../../../shared/errors/AppError';
import { config } from '../../../config';

class UserPhoneRepository extends BaseRepository<UserPhone, CreateUserPhoneDTO, UpdateUserPhoneDTO> {
  constructor() {
    // Passando 'userPhone' como nome do modelo para o Prisma
    // Campos únicos e relações
    super('userPhone', ['email', 'cpf', 'telefone'], ['role', 'status']);
  }

  /**
   * Sobrescreve o método create para tratar PINs e validações específicas
   */
  public async create(data: CreateUserPhoneDTO): Promise<UserPhone> {
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

    // Validar se o PIN tem apenas números
    if (!/^\d+$/.test(data.pin)) {
      throw new AppError('PIN deve conter apenas números', ErrorType.VALIDATION, 400);
    }

    // Criptografa o PIN
    const hashedPin = await hash(data.pin, config.auth.bcrypt.saltRounds);

    // Utiliza o método da classe base, mas com PIN criptografado
    return super.create({
      ...data,
      pin: hashedPin,
    });
  }

  /**
   * Sobrescreve o método update para tratar PINs
   */
  public async update(id: string, data: UpdateUserPhoneDTO): Promise<UserPhone> {
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

    // Se estiver atualizando o PIN, valida e criptografa
    let updateData = { ...data };

    if (data.pin) {
      // Validar se o PIN tem apenas números
      if (!/^\d+$/.test(data.pin)) {
        throw new AppError('PIN deve conter apenas números', ErrorType.VALIDATION, 400);
      }

      const hashedPin = await hash(data.pin, config.auth.bcrypt.saltRounds);
      updateData.pin = hashedPin;
    }

    // Utiliza o método da classe base com os dados tratados
    return super.update(id, updateData);
  }

  /**
   * Método específico para buscar usuário por telefone
   */
  public async findByTelefone(telefone: string): Promise<UserPhone | null> {
    return this.findByField('telefone', telefone);
  }

  /**
   * Método específico para buscar usuário por CPF
   */
  public async findByCpf(cpf: string): Promise<UserPhone | null> {
    return this.findByField('cpf', cpf);
  }

  /**
   * Método específico para buscar usuário por email
   */
  public async findByEmail(email: string): Promise<UserPhone | null> {
    return this.findByField('email', email);
  }

  /**
   * Método para atualizar o número de tentativas de login
   */
  public async incrementFailedAttempts(id: string): Promise<UserPhone> {
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
  public async registerSuccessfulLogin(id: string): Promise<UserPhone> {
    return this.update(id, {
      failedAttempts: 0,
      lastLoginAt: new Date()
    });
  }
}

export default new UserPhoneRepository();