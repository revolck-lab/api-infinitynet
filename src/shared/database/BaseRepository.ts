import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import { AppError, ErrorType } from '../errors/AppError';
import { redisService } from '../services/redis.service';
import { config } from '../../config';
import { logger } from '../services/logger.service';

/**
 * Interface base para paginação
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Classe base para todos os repositórios
 * Implementa operações CRUD comuns e adiciona cache com Redis
 */
export abstract class BaseRepository<T, CreateDTO, UpdateDTO> {
  protected prisma: PrismaClient;
  protected model: string;
  protected uniqueFields: string[] = [];
  protected relations: string[] = [];
  protected cacheEnabled: boolean = true;
  protected cacheTTL: number = config.redis.defaultExpiry;

  constructor(model: string, uniqueFields: string[] = [], relations: string[] = []) {
    this.prisma = prisma;
    this.model = model;
    this.uniqueFields = uniqueFields;
    this.relations = relations;
  }

  /**
   * Constrói a chave para cache
   */
  protected getCacheKey(id: string): string {
    return `${this.model}:${id}`;
  }

  /**
   * Verifica se um campo único já existe
   */
  protected async checkUniqueConstraints(data: any, excludeId?: string): Promise<void> {
    for (const field of this.uniqueFields) {
      if (data[field]) {
        const where: any = { [field]: data[field] };
        
        // Adiciona a exclusão do ID atual em caso de atualização
        if (excludeId) {
          where.id = { not: excludeId };
        }
        
        const existingRecord = await (this.prisma as any)[this.model].findFirst({ where });
        
        if (existingRecord) {
          throw new AppError(
            `Já existe um registro com este ${field}: ${data[field]}`,
            ErrorType.CONFLICT,
            409
          );
        }
      }
    }
  }

  /**
   * Obtém todos os registros com paginação
   */
  public async findAll(page = 1, limit = 10, filters: any = {}): Promise<PaginatedResponse<T>> {
    const skip = (page - 1) * limit;
    
    // Constrói as relações para o include se houver
    const include = this.relations.length > 0
      ? this.relations.reduce((acc, relation) => {
          acc[relation] = true;
          return acc;
        }, {} as Record<string, boolean>)
      : undefined;
    
    const [records, total] = await Promise.all([
      (this.prisma as any)[this.model].findMany({
        where: filters,
        skip,
        take: limit,
        include,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      (this.prisma as any)[this.model].count({ where: filters }),
    ]);
    
    return {
      data: records as T[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtém um registro pelo ID
   */
  public async findById(id: string): Promise<T | null> {
    try {
      // Tenta obter do cache primeiro
      if (this.cacheEnabled) {
        try {
          const cached = await redisService.get(this.getCacheKey(id));
          if (cached) {
            return JSON.parse(cached) as T;
          }
        } catch (error) {
          logger.debug('Cache lookup failed, continuing with database query', { 
            model: this.model, 
            id 
          });
        }
      }
    } catch (error) {
      logger.debug('Cache error in findById, continuing with database query', { 
        model: this.model, 
        id,
        error: (error as any).message 
      });
    }
    
    // Constrói as relações para o include se houver
    const include = this.relations.length > 0
      ? this.relations.reduce((acc, relation) => {
          acc[relation] = true;
          return acc;
        }, {} as Record<string, boolean>)
      : undefined;
    
    const record = await (this.prisma as any)[this.model].findUnique({
      where: { id },
      include,
    });
    
    // Salva no cache se encontrado
    if (record && this.cacheEnabled) {
      try {
        await redisService.set(
          this.getCacheKey(id),
          JSON.stringify(record),
          this.cacheTTL
        );
      } catch (error) {
        logger.debug('Failed to store in cache, continuing', { 
          model: this.model, 
          id 
        });
      }
    }
    
    return record as T | null;
  }

  /**
   * Cria um novo registro
   */
  public async create(data: CreateDTO): Promise<T> {
    // Verifica restrições de unicidade
    await this.checkUniqueConstraints(data);
    
    // Inclui relações na resposta se houver
    const include = this.relations.length > 0
      ? this.relations.reduce((acc, relation) => {
          acc[relation] = true;
          return acc;
        }, {} as Record<string, boolean>)
      : undefined;
    
    const record = await (this.prisma as any)[this.model].create({
      data,
      include,
    });
    
    // Salva no cache
    if (this.cacheEnabled) {
      try {
        await redisService.set(
          this.getCacheKey(record.id),
          JSON.stringify(record),
          this.cacheTTL
        );
      } catch (error) {
        logger.debug('Failed to store new record in cache', { 
          model: this.model, 
          id: record.id 
        });
      }
    }
    
    return record as T;
  }

  /**
   * Atualiza um registro existente
   */
  public async update(id: string, data: UpdateDTO): Promise<T> {
    // Verifica se o registro existe
    const exists = await this.findById(id);
    if (!exists) {
      throw new AppError(`Registro não encontrado: ${id}`, ErrorType.NOT_FOUND, 404);
    }
    
    // Verifica restrições de unicidade
    await this.checkUniqueConstraints(data, id);
    
    // Inclui relações na resposta se houver
    const include = this.relations.length > 0
      ? this.relations.reduce((acc, relation) => {
          acc[relation] = true;
          return acc;
        }, {} as Record<string, boolean>)
      : undefined;
    
    const updated = await (this.prisma as any)[this.model].update({
      where: { id },
      data,
      include,
    });
    
    // Atualiza o cache
    if (this.cacheEnabled) {
      try {
        await redisService.set(
          this.getCacheKey(id),
          JSON.stringify(updated),
          this.cacheTTL
        );
      } catch (error) {
        logger.debug('Failed to update record in cache', { 
          model: this.model, 
          id 
        });
      }
    }
    
    return updated as T;
  }

  /**
   * Remove um registro
   */
  public async delete(id: string): Promise<void> {
    // Verifica se o registro existe
    const exists = await this.findById(id);
    if (!exists) {
      throw new AppError(`Registro não encontrado: ${id}`, ErrorType.NOT_FOUND, 404);
    }
    
    await (this.prisma as any)[this.model].delete({
      where: { id },
    });
    
    // Remove do cache
    if (this.cacheEnabled) {
      try {
        await redisService.delete(this.getCacheKey(id));
      } catch (error) {
        logger.debug('Failed to remove record from cache', { 
          model: this.model, 
          id 
        });
      }
    }
  }

  /**
   * Obtém um registro pelo campo especificado
   */
  public async findByField(field: string, value: any): Promise<T | null> {
    // Constrói as relações para o include se houver
    const include = this.relations.length > 0
      ? this.relations.reduce((acc, relation) => {
          acc[relation] = true;
          return acc;
        }, {} as Record<string, boolean>)
      : undefined;
    
    const record = await (this.prisma as any)[this.model].findFirst({
      where: { [field]: value },
      include,
    });
    
    return record as T | null;
  }

  /**
   * Invalidar todos os caches relacionados a este modelo
   */
  public async invalidateCache(): Promise<void> {
    // Implementação simplificada pois dependeria do redis
    logger.debug('Cache invalidation called for model', { model: this.model });
  }
}