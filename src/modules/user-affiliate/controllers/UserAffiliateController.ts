import { Request, Response } from 'express';
import { BaseController } from '../../../shared/controllers/BaseController';
import { UserAffiliate, CreateUserAffiliateDTO, UpdateUserAffiliateDTO } from '../models/UserAffiliate';
import userAffiliateService from '../services/UserAffiliateService';

class UserAffiliateController extends BaseController<UserAffiliate, CreateUserAffiliateDTO, UpdateUserAffiliateDTO> {
  protected serviceName = 'Usuário Afiliado';
  protected service = userAffiliateService;

  /**
   * Método específico para buscar usuário por CPF
   */
  public async getUserByCpf(req: Request, res: Response): Promise<Response> {
    try {
      const { cpf } = req.params;
      const user = await userAffiliateService.findByCpf(cpf);
      
      if (!user) {
        return this.success(res, null, 'Usuário não encontrado com este CPF', 404);
      }
      
      return this.success(res, user, 'Usuário encontrado com sucesso');
    } catch (error) {
      return this.error(res, error as Error);
    }
  }

  /**
   * Método específico para buscar usuário por email
   */
  public async getUserByEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.params;
      const user = await userAffiliateService.findByEmail(email);
      
      if (!user) {
        return this.success(res, null, 'Usuário não encontrado com este email', 404);
      }
      
      return this.success(res, user, 'Usuário encontrado com sucesso');
    } catch (error) {
      return this.error(res, error as Error);
    }
  }

  /**
   * Método específico para buscar usuário por telefone
   */
  public async getUserByTelefone(req: Request, res: Response): Promise<Response> {
    try {
      const { telefone } = req.params;
      const user = await userAffiliateService.findByTelefone(telefone);
      
      if (!user) {
        return this.success(res, null, 'Usuário não encontrado com este telefone', 404);
      }
      
      return this.success(res, user, 'Usuário encontrado com sucesso');
    } catch (error) {
      return this.error(res, error as Error);
    }
  }

  /**
   * Sobrescreve o método getAll para adicionar filtros específicos
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Extrai filtros específicos
      const { nome, email, telefone, cpf, cidade, estado, roleId, statusId } = req.query;
      
      const filters: any = {};
      
      if (nome) filters.nome = { contains: nome };
      if (email) filters.email = { contains: email };
      if (telefone) filters.telefone = { contains: telefone };
      if (cpf) filters.cpf = { contains: cpf };
      if (cidade) filters.cidade = { contains: cidade };
      if (estado) filters.estado = estado;
      if (roleId) filters.roleId = roleId;
      if (statusId) filters.statusId = statusId;
      
      const result = await this.service.getAll(page, limit, filters);
      
      return this.success(res, result, 'Usuários listados com sucesso');
    } catch (error) {
      return this.error(res, error as Error);
    }
  }
}

export default new UserAffiliateController();