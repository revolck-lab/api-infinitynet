import { BaseService } from '../../../shared/services/BaseService';
import { UserAffiliate, CreateUserAffiliateDTO, UpdateUserAffiliateDTO } from '../models/UserAffiliate';
import userAffiliateRepository from '../repositories/UserAffiliateRepository';
import { AppError } from '../../../shared/errors/AppError';

class UserAffiliateService extends BaseService<UserAffiliate, CreateUserAffiliateDTO, UpdateUserAffiliateDTO> {
  protected repository = userAffiliateRepository;
  protected entityName = 'Usuário Afiliado';

  /**
   * Método específico para buscar usuário por CPF
   */
  public async findByCpf(cpf: string): Promise<UserAffiliate | null> {
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
  public async findByEmail(email: string): Promise<UserAffiliate | null> {
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
   * Método específico para buscar usuário por telefone
   */
  public async findByTelefone(telefone: string): Promise<UserAffiliate | null> {
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
   * Método para atualizar usuário com validações adicionais
   */
  public async update(id: string, data: UpdateUserAffiliateDTO): Promise<UserAffiliate> {
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
  public async incrementFailedAttempts(id: string): Promise<UserAffiliate> {
    return userAffiliateRepository.incrementFailedAttempts(id);
  }

  /**
   * Método para registrar login bem-sucedido
   */
  public async registerSuccessfulLogin(id: string): Promise<UserAffiliate> {
    return userAffiliateRepository.registerSuccessfulLogin(id);
  }
}

export default new UserAffiliateService();