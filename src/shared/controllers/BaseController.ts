import { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { PaginatedResponse } from '../database/BaseRepository';

/**
 * Classe base para todos os controladores
 * Implementa operações CRUD comuns e formatação de respostas
 */
export abstract class BaseController<T, CreateDTO, UpdateDTO> {
  protected abstract serviceName: string;
  protected abstract service: any;

  /**
   * Formata uma resposta de sucesso
   */
  protected success<R>(
    res: Response,
    data?: R,
    message = 'Operação realizada com sucesso',
    statusCode = 200
  ): Response {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Formata uma resposta de erro
   */
  protected error(
    res: Response,
    error: AppError | Error,
    statusCode = 500
  ): Response {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: 'error',
        type: error.type,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Obtém todos os registros com paginação
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Extrai outros filtros da query
      const { page: _, limit: __, ...filters } = req.query;
      
      const result: PaginatedResponse<T> = await this.service.getAll(page, limit, filters);
      
      return this.success(res, result, `${this.serviceName} listados com sucesso`);
    } catch (error) {
      return this.error(res, error as Error);
    }
  }

  /**
   * Obtém um registro pelo ID
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const record = await this.service.getById(id);
      
      return this.success(res, record, `${this.serviceName} encontrado com sucesso`);
    } catch (error) {
      return this.error(res, error as Error);
    }
  }

  /**
   * Cria um novo registro
   */
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const data: CreateDTO = req.body;
      const record = await this.service.create(data);
      
      return this.success(
        res, 
        record, 
        `${this.serviceName} criado com sucesso`, 
        201
      );
    } catch (error) {
      return this.error(res, error as Error);
    }
  }

  /**
   * Atualiza um registro existente
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data: UpdateDTO = req.body;
      
      const record = await this.service.update(id, data);
      
      return this.success(res, record, `${this.serviceName} atualizado com sucesso`);
    } catch (error) {
      return this.error(res, error as Error);
    }
  }

  /**
   * Remove um registro
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      
      return this.success(res, null, `${this.serviceName} removido com sucesso`, 204);
    } catch (error) {
      return this.error(res, error as Error);
    }
  }
}