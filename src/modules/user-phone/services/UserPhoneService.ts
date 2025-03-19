import { BaseService } from '../../../shared/services/BaseService';
import { UserPhone, CreateUserPhoneDTO, UpdateUserPhoneDTO } from '../models/UserPhone';
import userPhoneRepository from '../repositories/UserPhoneRepository';
import { AppError } from '../../../shared/errors/AppError';

class UserPhoneService extends BaseService<UserPhone, CreateUserPhoneDTO, UpdateUserPhoneDTO> {
  protected repository = userPhoneRepository;
  protected entityName = 'Usuário App';

  /**
   * Método específico para buscar usuário por telefone
   */
  public async findByTelefone(telefone: string): Promise<UserPhone | null> {
    return this.getByField('telefone', telefone);
  }

  /**
   * Método específico para verificar se o telefone já existe
   */
  public async telefoneExists(telefone: string, excludeId?: string): Promise<boolean> {
    const user = await this.findByTelefone(telefone);
    return !!user && (!excludeId || user.id !== excludeId);
  }

  /**
   * Método específico para buscar usuário por CPF
   */
  public async findByCpf(cpf: string): Promise<UserPhone | null> {
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
   * Método específico para buscar usuário por email
   */
  public async findByEmail(email: string): Promise<UserPhone | null> {
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
   * Método para atualizar usuário com validações adicionais
   */
  public async update(id: string, data: UpdateUserPhoneDTO): Promise<UserPhone> {
    // Valida o email se estiver sendo atualizado
    if (data.email && await this.emailExists(data.email, id)) {
      throw AppError.conflict('Este email já está em uso');
    }

    // Valida o CPF se estiver sendo atualizado
    if (data.cpf && await this.cpfExists(data.cpf, id)) {
      throw AppError.conflict('Este CPF já está cadastrado');
    }

    // Valida o telefone se estiver sendo atualizado
    if (data.telefone && await this.telefoneExists(data.telefone, id)) {
      throw AppError.conflict('Este telefone já está cadastrado');
    }

    return super.update(id, data);
  }

  /**
   * Método para incrementar tentativas falhas de login
   */
  public async incrementFailedAttempts(id: string): Promise<UserPhone> {
    return userPhoneRepository.incrementFailedAttempts(id);
  }

  /**
   * Método para registrar login bem-sucedido
   */
  public async registerSuccessfulLogin(id: string): Promise<UserPhone> {
    return userPhoneRepository.registerSuccessfulLogin(id);
  }
}

export default new UserPhoneService();