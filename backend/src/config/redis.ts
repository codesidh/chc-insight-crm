import { createClient, RedisClientType } from 'redis';
import config from './environment';

// Redis client configuration
const redisConfig: any = {
  socket: {
    host: config.redis.host,
    port: config.redis.port,
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        console.error('❌ Redis connection failed after 10 retries');
        return new Error('Redis connection failed');
      }
      return Math.min(retries * 50, 500);
    },
  },
  database: config.redis.db,
};

// Only add password if it exists
if (config.redis.password) {
  redisConfig.password = config.redis.password;
}

// Create Redis client
export const redisClient: RedisClientType = createClient(redisConfig);

// Redis event handlers
redisClient.on('connect', () => {
  console.log('🔗 Connecting to Redis...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis client error:', err);
});

redisClient.on('end', () => {
  console.log('🔒 Redis connection closed');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis client reconnecting...');
});

// Initialize Redis connection
export const initializeRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connection established');
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

// Redis health check function
export const checkRedisConnection = async (): Promise<boolean> => {
  try {
    const pong = await redisClient.ping();
    console.log('✅ Redis health check successful:', pong);
    return true;
  } catch (error) {
    console.error('❌ Redis health check failed:', error);
    return false;
  }
};

// Graceful shutdown function
export const closeRedisConnection = async (): Promise<void> => {
  try {
    await redisClient.quit();
    console.log('🔒 Redis connection closed');
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error);
  }
};

// Cache helper functions
export class CacheService {
  // Set cache with expiration
  static async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.setEx(key, ttlSeconds, serializedValue);
    } catch (error) {
      console.error('❌ Cache set error:', error);
      throw error;
    }
  }

  // Get cache value
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('❌ Cache get error:', error);
      return null;
    }
  }

  // Delete cache key
  static async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('❌ Cache delete error:', error);
      throw error;
    }
  }

  // Check if key exists
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('❌ Cache exists check error:', error);
      return false;
    }
  }

  // Set cache with pattern-based expiration
  static async setWithPattern(
    pattern: string,
    key: string,
    value: any,
    ttlSeconds: number = 3600
  ): Promise<void> {
    const fullKey = `${pattern}:${key}`;
    await this.set(fullKey, value, ttlSeconds);
  }

  // Get cache with pattern
  static async getWithPattern<T>(pattern: string, key: string): Promise<T | null> {
    const fullKey = `${pattern}:${key}`;
    return await this.get<T>(fullKey);
  }

  // Clear all keys matching pattern
  static async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(`${pattern}:*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('❌ Cache pattern clear error:', error);
      throw error;
    }
  }
}

// Session management helpers
export class SessionService {
  private static readonly SESSION_PREFIX = 'session';
  private static readonly SESSION_TTL = 24 * 60 * 60; // 24 hours

  static async createSession(sessionId: string, userData: any): Promise<void> {
    await CacheService.setWithPattern(this.SESSION_PREFIX, sessionId, userData, this.SESSION_TTL);
  }

  static async getSession<T>(sessionId: string): Promise<T | null> {
    return await CacheService.getWithPattern<T>(this.SESSION_PREFIX, sessionId);
  }

  static async updateSession(sessionId: string, userData: any): Promise<void> {
    await CacheService.setWithPattern(this.SESSION_PREFIX, sessionId, userData, this.SESSION_TTL);
  }

  static async destroySession(sessionId: string): Promise<void> {
    await CacheService.del(`${this.SESSION_PREFIX}:${sessionId}`);
  }

  static async extendSession(sessionId: string): Promise<void> {
    const sessionData = await this.getSession(sessionId);
    if (sessionData) {
      await this.createSession(sessionId, sessionData);
    }
  }
}
