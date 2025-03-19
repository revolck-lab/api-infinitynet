import Redis from 'ioredis';
import { config } from '../../config';

class RedisService {
  private client: Redis;
  private static instance: RedisService;

  private constructor() {
    this.client = new Redis(config.redis.url);
    this.setupListeners();
  }

  private setupListeners(): void {
    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis connected');
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, expiry?: number): Promise<void> {
    if (expiry) {
      await this.client.set(key, value, 'EX', expiry);
    } else {
      await this.client.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async increment(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }
}

export const redisService = RedisService.getInstance();