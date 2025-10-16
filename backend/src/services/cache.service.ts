/**
 * Cache Service
 * 
 * Implements basic caching for frequently accessed data
 * Requirements: 13.1, 13.3
 */

import Redis from 'ioredis';

export interface CacheConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
  };
  defaultTtl: number; // Default TTL in seconds
  maxMemory: string;
  evictionPolicy: string;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheStats {
  totalKeys: number;
  memoryUsage: number;
  hitRate: number;
  missRate: number;
  evictions: number;
}

class CacheManager {
  private redis: Redis;
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      redis: {
        host: process.env['REDIS_HOST'] || 'localhost',
        port: parseInt(process.env['REDIS_PORT'] || '6379'),
        password: process.env['REDIS_PASSWORD'],
        db: parseInt(process.env['REDIS_DB'] || '0'),
        keyPrefix: process.env['REDIS_KEY_PREFIX'] || 'chc_insight:'
      },
      defaultTtl: 3600, // 1 hour
      maxMemory: '256mb',
      evictionPolicy: 'allkeys-lru',
      ...config
    };

    this.redis = new Redis({
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password,
      db: this.config.redis.db,
      keyPrefix: this.config.redis.keyPrefix,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    this.setupEventHandlers();
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        this.stats.hits++;
        const entry: CacheEntry<T> = JSON.parse(cached);
        
        // Update hit count
        entry.hits++;
        await this.redis.setex(key, entry.ttl, JSON.stringify(entry));
        
        return entry.data;
      }
      
      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const cacheTtl = ttl || this.config.defaultTtl;
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: cacheTtl,
        hits: 0
      };

      await this.redis.setex(key, cacheTtl, JSON.stringify(entry));
      this.stats.sets++;
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      this.stats.deletes++;
      return result > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      const result = await this.redis.del(...keys);
      this.stats.deletes += result;
      return result;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern - get from cache or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount = 1, ttl?: number): Promise<number> {
    try {
      const result = await this.redis.incrby(key, amount);
      if (ttl && result === amount) {
        // Set TTL only if this is a new key
        await this.redis.expire(key, ttl);
      }
      return result;
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Set with expiration at specific time
   */
  async setExpireAt<T>(key: string, value: T, expireAt: Date): Promise<boolean> {
    try {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: Math.floor((expireAt.getTime() - Date.now()) / 1000),
        hits: 0
      };

      await this.redis.set(key, JSON.stringify(entry));
      await this.redis.expireat(key, Math.floor(expireAt.getTime() / 1000));
      this.stats.sets++;
      return true;
    } catch (error) {
      console.error('Cache setExpireAt error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const memoryUsage = memoryMatch && memoryMatch[1] ? parseInt(memoryMatch[1]) : 0;
      
      const keysMatch = keyspace.match(/keys=(\d+)/);
      const totalKeys = keysMatch && keysMatch[1] ? parseInt(keysMatch[1]) : 0;
      
      const totalRequests = this.stats.hits + this.stats.misses;
      const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
      const missRate = totalRequests > 0 ? this.stats.misses / totalRequests : 0;

      return {
        totalKeys,
        memoryUsage,
        hitRate,
        missRate,
        evictions: 0 // Would need to parse from Redis stats
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: 0,
        hitRate: 0,
        missRate: 0,
        evictions: 0
      };
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    try {
      await this.redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache health status
   */
  async healthCheck(): Promise<{
    connected: boolean;
    latency: number;
    memoryUsage: number;
    status: 'healthy' | 'degraded' | 'unhealthy';
  }> {
    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;
      
      const stats = await this.getStats();
      const memoryUsagePercent = (stats.memoryUsage / (256 * 1024 * 1024)) * 100; // Assuming 256MB max
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (latency > 100 || memoryUsagePercent > 90) {
        status = 'degraded';
      }
      if (latency > 500 || memoryUsagePercent > 95) {
        status = 'unhealthy';
      }

      return {
        connected: true,
        latency,
        memoryUsage: memoryUsagePercent,
        status
      };
    } catch (error) {
      return {
        connected: false,
        latency: -1,
        memoryUsage: 0,
        status: 'unhealthy'
      };
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    this.redis.on('error', (error: any) => {
      console.error('❌ Redis error:', error);
    });

    this.redis.on('close', () => {
      console.log('🔌 Redis connection closed');
    });

    this.redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

// Cache key generators for different data types
export const cacheKeys = {
  formCategory: (tenantId: string, categoryId?: string) => 
    categoryId ? `form:category:${tenantId}:${categoryId}` : `form:categories:${tenantId}`,
  
  formType: (tenantId: string, categoryId: string, typeId?: string) =>
    typeId ? `form:type:${tenantId}:${categoryId}:${typeId}` : `form:types:${tenantId}:${categoryId}`,
  
  formTemplate: (tenantId: string, typeId: string, templateId?: string) =>
    templateId ? `form:template:${tenantId}:${typeId}:${templateId}` : `form:templates:${tenantId}:${typeId}`,
  
  formInstance: (tenantId: string, instanceId: string) =>
    `form:instance:${tenantId}:${instanceId}`,
  
  member: (tenantId: string, memberId: string) =>
    `member:${tenantId}:${memberId}`,
  
  memberSearch: (tenantId: string, query: string, filters?: string) =>
    `member:search:${tenantId}:${query}${filters ? `:${filters}` : ''}`,
  
  provider: (tenantId: string, providerId: string) =>
    `provider:${tenantId}:${providerId}`,
  
  providerSearch: (tenantId: string, query: string, filters?: string) =>
    `provider:search:${tenantId}:${query}${filters ? `:${filters}` : ''}`,
  
  dashboardMetrics: (tenantId: string, userId?: string, timeframe?: string) =>
    `dashboard:metrics:${tenantId}${userId ? `:${userId}` : ''}${timeframe ? `:${timeframe}` : ''}`,
  
  userSession: (sessionId: string) =>
    `session:${sessionId}`,
  
  userPermissions: (userId: string, tenantId: string) =>
    `permissions:${userId}:${tenantId}`,
  
  rateLimitCounter: (ip: string, endpoint?: string) =>
    `ratelimit:${ip}${endpoint ? `:${endpoint}` : ''}`,
  
  auditLog: (tenantId: string, date: string) =>
    `audit:${tenantId}:${date}`
};

// Create singleton instance
const cacheManager = new CacheManager();

// Export cache utilities
export const cache = {
  get: cacheManager.get.bind(cacheManager),
  set: cacheManager.set.bind(cacheManager),
  delete: cacheManager.delete.bind(cacheManager),
  deletePattern: cacheManager.deletePattern.bind(cacheManager),
  exists: cacheManager.exists.bind(cacheManager),
  getOrSet: cacheManager.getOrSet.bind(cacheManager),
  increment: cacheManager.increment.bind(cacheManager),
  setExpireAt: cacheManager.setExpireAt.bind(cacheManager),
  getStats: cacheManager.getStats.bind(cacheManager),
  clear: cacheManager.clear.bind(cacheManager),
  healthCheck: cacheManager.healthCheck.bind(cacheManager),
  disconnect: cacheManager.disconnect.bind(cacheManager)
};

export default cacheManager;