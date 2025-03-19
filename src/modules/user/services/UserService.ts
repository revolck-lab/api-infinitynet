import { BaseService } from '../../../shared/services/BaseService';
import { User, CreateUserDTO, UpdateUserDTO } from '../models/User';
import userRepository from '../repositories/UserRepository';
import { AppError } from '../../../shared/errors/AppError';

class UserService extends BaseService<User, CreateUserDTO, UpdateUserDTO> {
  protected repository = userRepository;
  protected entityName = 'Usuário';

  /**
   * Método específico para buscar usuário por email
   */
  public async findByEmail(email: string): Promise<User | null> {
    return this.getByField('email', email);
  }

  /**
   * Método específico para verificar se o email já existe
   */
  public async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user && (!excludeId || user.id !== excludeId);
  }

  /**
   * Método específico para buscar usuário por CPF
   */
  public async findByCpf(cpf: string): Promise<User | null> {
    return this.getByField('cpf', cpf);
  }

  /**
   * Método específico para verificar se o CPF já existe
   */
  public async cpfExists(cpf: string, excludeId?: string): Promise<boolean> {
    const user = await this.findByCpf(cpf);
    return !!user && (!excludeId || user.id !== excludeId);
  }

  /**
   * Método para atualizar usuário com validações adicionais
   */
  public async update(id: string, data: UpdateUserDTO): Promise<User> {
    // Valida o email se estiver sendo atualizado
    if (data.email && await this.emailExists(data.email, id)) {
      throw AppError.conflict('Este email já está em uso');
    }

    // Valida o CPF se estiver sendo atualizado
    if (data.cpf && await this.cpfExists(data.cpf, id)) {
      throw AppError.conflict('Este CPF já está cadastrado');
    }

    return super.update(id, data);
  }
}

export default new UserService();