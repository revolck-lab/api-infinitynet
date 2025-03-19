import { Request, Response } from 'express';
import { BaseController } from '../../../shared/controllers/BaseController';
import { User, CreateUserDTO, UpdateUserDTO } from '../models/User';
import userService from '../services/UserService';

class UserController extends BaseController<User, CreateUserDTO, UpdateUserDTO> {
  protected serviceName = 'Usuário';
  protected service = userService;

  /**
   * Método específico para buscar usuário por email
   */
  public async getUserByEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.params;
      const user = await userService.findByEmail(email);
      
      if (!user) {
        return this.success(res, null, 'Usuário não encontrado com este email', 404);
      }
      
      return this.success(res, user, 'Usuário encontrado com sucesso');
    } catch (error) {
      return this.error(res, error as Error);
    }
  }

  /**
   * Método específico para buscar usuário por CPF
   */
  public async getUserByCpf(req: Request, res: Response): Promise<Response> {
    try {
      const { cpf } = req.params;
      const user = await userService.findByCpf(cpf);
      
      if (!user) {
        return this.success(res, null, 'Usuário não encontrado com este CPF', 404);
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
      const { nome, email, cidade, estado, roleId, statusId } = req.query;
      
      const filters: any = {};
      
      if (nome) filters.nome = { contains: nome };
      if (email) filters.email = { contains: email };
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

export default new UserController();