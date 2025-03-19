import Redis from 'ioredis';
import { config } from '../../config';
import { logger } from './logger.service';

/**
 * Memory fallback cache for when Redis is unavailable
 */
class MemoryCache {
  private cache: Map<string, { value: string; expiry: number | null }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    const expiry = expirySeconds ? Date.now() + (expirySeconds * 1000) : null;
    this.cache.set(key, { value, expiry });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async increment(key: string): Promise<number> {
    const item = this.cache.get(key);
    const currentValue = item ? parseInt(item.value, 10) || 0 : 0;
    const newValue = currentValue + 1;
    
    this.cache.set(key, {
      value: newValue.toString(),
      expiry: item?.expiry || null
    });
    
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const item = this.cache.get(key);
    if (item) {
      item.expiry = Date.now() + (seconds * 1000);
      this.cache.set(key, item);
    }
  }
}

class RedisService {
  private client: Redis | null = null;
  private memoryCache: MemoryCache = new MemoryCache();
  private isRedisAvailable: boolean = false;
  private static instance: RedisService;

  private constructor() {
    try {
      // Try to connect to Redis
      this.client = new Redis(config.redis.url, {
        connectTimeout: 3000, // 3 seconds timeout
        maxRetriesPerRequest: 1,
        retryStrategy: () => null // Don't retry on connection failures
      });
      
      this.setupListeners();
    } catch (error) {
      this.handleConnectionFailure(error);
    }
  }

  private setupListeners(): void {
    if (!this.client) return;

    this.client.on('error', (err) => {
      this.handleConnectionFailure(err);
    });

    this.client.on('connect', () => {
      this.isRedisAvailable = true;
      logger.info('Redis connected successfully');
    });
  }

  private handleConnectionFailure(error: any): void {
    this.isRedisAvailable = false;
    
    // Log once instead of continuously
    if (this.client) {
      logger.warn('Redis connection failed, using memory fallback', {
        error: error.message
      });
    }
    
    // Close the client if it exists
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.isRedisAvailable && this.client) {
        return await this.client.get(key);
      }
      return await this.memoryCache.get(key);
    } catch (error) {
      logger.debug('Redis get error, using memory fallback', { key });
      return this.memoryCache.get(key);
    }
  }

  async set(key: string, value: string, expiry?: number): Promise<void> {
    try {
      if (this.isRedisAvailable && this.client) {
        if (expiry) {
          await this.client.set(key, value, 'EX', expiry);
        } else {
          await this.client.set(key, value);
        }
      }
      await this.memoryCache.set(key, value, expiry);
    } catch (error) {
      logger.debug('Redis set error, using memory fallback', { key });
      await this.memoryCache.set(key, value, expiry);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.isRedisAvailable && this.client) {
        await this.client.del(key);
      }
      await this.memoryCache.delete(key);
    } catch (error) {
      logger.debug('Redis delete error, using memory fallback', { key });
      await this.memoryCache.delete(key);
    }
  }

  async increment(key: string): Promise<number> {
    try {
      if (this.isRedisAvailable && this.client) {
        return await this.client.incr(key);
      }
      return await this.memoryCache.increment(key);
    } catch (error) {
      logger.debug('Redis increment error, using memory fallback', { key });
      return this.memoryCache.increment(key);
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      if (this.isRedisAvailable && this.client) {
        await this.client.expire(key, seconds);
      }
      await this.memoryCache.expire(key, seconds);
    } catch (error) {
      logger.debug('Redis expire error, using memory fallback', { key });
      await this.memoryCache.expire(key, seconds);
    }
  }
}

export const redisService = RedisService.getInstance();