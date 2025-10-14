import {
  checkDatabaseConnection,
  closeDatabaseConnection,
  query,
  withTransaction,
} from '../config/database';
import {
  initializeRedis,
  checkRedisConnection,
  closeRedisConnection,
  CacheService,
  SessionService,
} from '../config/redis';
import {
  checkKnexConnection,
  runMigrations,
  rollbackMigrations,
  runSeeds,
  closeKnexConnection,
  getMigrationStatus,
  db,
} from '../config/knex';

export class DatabaseService {
  private static initialized = false;
  private static instance: DatabaseService;

  /**
   * Get singleton instance of DatabaseService
   */
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Get Knex database connection
   */
  getConnection() {
    return db;
  }

  /**
   * Get Knex instance (static method)
   */
  static getKnexInstance() {
    return db;
  }

  /**
   * Initialize all database connections (PostgreSQL and Redis)
   */
  static async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️  Database service already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing database service...');

      // Initialize Redis connection
      await initializeRedis();

      // Check PostgreSQL connection
      const pgConnected = await checkDatabaseConnection();
      if (!pgConnected) {
        throw new Error('Failed to connect to PostgreSQL');
      }

      // Check Knex connection
      const knexConnected = await checkKnexConnection();
      if (!knexConnected) {
        throw new Error('Failed to connect via Knex');
      }

      // Check Redis connection
      const redisConnected = await checkRedisConnection();
      if (!redisConnected) {
        throw new Error('Failed to connect to Redis');
      }

      this.initialized = true;
      console.log('✅ Database service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database service:', error);
      throw error;
    }
  }

  /**
   * Health check for all database connections
   */
  static async healthCheck(): Promise<{
    postgresql: boolean;
    redis: boolean;
    knex: boolean;
    overall: boolean;
  }> {
    const postgresql = await checkDatabaseConnection();
    const redis = await checkRedisConnection();
    const knex = await checkKnexConnection();
    const overall = postgresql && redis && knex;

    return {
      postgresql,
      redis,
      knex,
      overall,
    };
  }

  /**
   * Run database migrations
   */
  static async migrate(): Promise<void> {
    try {
      await runMigrations();
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Rollback database migrations
   */
  static async rollback(): Promise<void> {
    try {
      await rollbackMigrations();
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Run database seeds
   */
  static async seed(): Promise<void> {
    try {
      await runSeeds();
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  static async getMigrationStatus(): Promise<any> {
    try {
      return await getMigrationStatus();
    } catch (error) {
      console.error('❌ Failed to get migration status:', error);
      throw error;
    }
  }

  /**
   * Gracefully shutdown all database connections
   */
  static async shutdown(): Promise<void> {
    try {
      console.log('🔄 Shutting down database service...');

      await Promise.all([closeDatabaseConnection(), closeRedisConnection(), closeKnexConnection()]);

      this.initialized = false;
      console.log('✅ Database service shutdown complete');
    } catch (error) {
      console.error('❌ Error during database service shutdown:', error);
      throw error;
    }
  }

  /**
   * Execute a raw SQL query
   */
  static async executeQuery(text: string, params?: any[]): Promise<any> {
    return await query(text, params);
  }

  /**
   * Execute a function within a database transaction
   */
  static async executeTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    return await withTransaction(callback);
  }

  /**
   * Cache operations
   */
  static get cache() {
    return CacheService;
  }

  /**
   * Session operations
   */
  static get session() {
    return SessionService;
  }

  /**
   * Check if database service is initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }
}
