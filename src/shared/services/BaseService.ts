import { CircuitBreaker } from '../utils/circuit-breaker';
import { AppError, ErrorType } from '../errors/AppError';
import { PaginatedResponse } from '../database/BaseRepository';
import { logger } from './logger.service';

/**
 * Classe base para todos os serviços
 * Implementa operações CRUD comuns e adiciona circuit breaker
 */
export abstract class BaseService<T, CreateDTO, UpdateDTO> {
  protected abstract repository: any;
  protected abstract entityName: string;
  protected circuitBreaker: CircuitBreaker;
  
  constructor() {
    this.circuitBreaker = new CircuitBreaker();
  }

  /**
   * Obtém todos os registros com paginação
   */
  public async getAll(page = 1, limit = 10, filters = {}): Promise<PaginatedResponse<T>> {
    try {
      return await this.circuitBreaker.execute<PaginatedResponse<T>>(() => 
        this.repository.findAll(page, limit, filters)
      );
    } catch (error) {
      logger.error(`Erro ao listar ${this.entityName}`, { error });
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `Erro ao listar ${this.entityName}`,
        ErrorType.INTERNAL,
        500
      );
    }
  }

  /**
   * Obtém um registro pelo ID
   */
  public async getById(id: string): Promise<T> {
    try {
      const record = await this.circuitBreaker.execute<T | null>(() => 
        this.repository.findById(id)
      );
      
      if (!record) {
        throw AppError.notFound(`${this.entityName} não encontrado`);
      }
      
      return record as T;
    } catch (error) {
      logger.error(`Erro ao buscar ${this.entityName}`, { id, error });
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `Erro ao buscar ${this.entityName}`,
        ErrorType.INTERNAL,
        500
      );
    }
  }

  /**
   * Cria um novo registro
   */
  public async create(data: CreateDTO): Promise<T> {
    try {
      return await this.circuitBreaker.execute<T>(() => 
        this.repository.create(data)
      );
    } catch (error) {
      logger.error(`Erro ao criar ${this.entityName}`, { data, error });
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `Erro ao criar ${this.entityName}`,
        ErrorType.INTERNAL,
        500
      );
    }
  }

  /**
   * Atualiza um registro existente
   */
  public async update(id: string, data: UpdateDTO): Promise<T> {
    try {
      return await this.circuitBreaker.execute<T>(() => 
        this.repository.update(id, data)
      );
    } catch (error) {
      logger.error(`Erro ao atualizar ${this.entityName}`, { id, data, error });
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `Erro ao atualizar ${this.entityName}`,
        ErrorType.INTERNAL,
        500
      );
    }
  }

  /**
   * Remove um registro
   */
  public async delete(id: string): Promise<void> {
    try {
      await this.circuitBreaker.execute<void>(() => 
        this.repository.delete(id)
      );
    } catch (error) {
      logger.error(`Erro ao remover ${this.entityName}`, { id, error });
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `Erro ao remover ${this.entityName}`,
        ErrorType.INTERNAL,
        500
      );
    }
  }

  /**
   * Obtém um registro pelo campo especificado
   */
  public async getByField(field: string, value: any): Promise<T | null> {
    try {
      return await this.circuitBreaker.execute<T | null>(() => 
        this.repository.findByField(field, value)
      );
    } catch (error) {
      logger.error(`Erro ao buscar ${this.entityName} por ${field}`, { field, value, error });
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `Erro ao buscar ${this.entityName} por ${field}`,
        ErrorType.INTERNAL,
        500
      );
    }
  }
}