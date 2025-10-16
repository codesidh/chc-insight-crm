/**
 * Database Optimization Service
 * 
 * Implements database query optimization and performance monitoring
 * Requirements: 13.1, 13.3
 */

import { Knex } from 'knex';
import { DatabaseService } from './database.service';
import { cache, cacheKeys } from './cache.service';

export interface QueryPerformanceMetrics {
  queryId: string;
  query: string;
  executionTime: number;
  rowsAffected: number;
  timestamp: Date;
  userId?: string;
  tenantId?: string;
}

export interface DatabaseHealth {
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  performance: {
    avgQueryTime: number;
    slowQueries: number;
    totalQueries: number;
  };
  storage: {
    databaseSize: number;
    tableStats: Array<{
      tableName: string;
      rowCount: number;
      sizeBytes: number;
    }>;
  };
  indexes: {
    missingIndexes: string[];
    unusedIndexes: string[];
  };
}

export interface OptimizationRecommendation {
  type: 'index' | 'query' | 'schema' | 'cache';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  implementation: string;
  estimatedImprovement: string;
}

class DatabaseOptimizationService {
  private db: Knex;
  private queryMetrics: Map<string, QueryPerformanceMetrics[]> = new Map();
  private slowQueryThreshold = 1000; // 1 second

  constructor() {
    this.db = DatabaseService.getInstance().getConnection();
    this.setupQueryMonitoring();
  }

  /**
   * Setup query performance monitoring
   */
  private setupQueryMonitoring(): void {
    // Intercept queries to measure performance
    this.db.on('query', (query) => {
      const startTime = Date.now();
      query.startTime = startTime;
    });

    this.db.on('query-response', (response, query) => {
      if (query.startTime) {
        const executionTime = Date.now() - query.startTime;
        this.recordQueryMetrics({
          queryId: this.generateQueryId(query.sql),
          query: query.sql,
          executionTime,
          rowsAffected: Array.isArray(response) ? response.length : 1,
          timestamp: new Date()
        });
      }
    });

    this.db.on('query-error', (error, query) => {
      console.error('Database query error:', {
        sql: query.sql,
        bindings: query.bindings,
        error: error.message
      });
    });
  }

  /**
   * Record query performance metrics
   */
  private recordQueryMetrics(metrics: QueryPerformanceMetrics): void {
    const queryId = metrics.queryId;
    
    if (!this.queryMetrics.has(queryId)) {
      this.queryMetrics.set(queryId, []);
    }
    
    const queryHistory = this.queryMetrics.get(queryId)!;
    queryHistory.push(metrics);
    
    // Keep only last 100 executions per query
    if (queryHistory.length > 100) {
      queryHistory.shift();
    }
    
    // Log slow queries
    if (metrics.executionTime > this.slowQueryThreshold) {
      console.warn('Slow query detected:', {
        query: metrics.query,
        executionTime: metrics.executionTime,
        timestamp: metrics.timestamp
      });
    }
  }

  /**
   * Generate consistent query ID from SQL
   */
  private generateQueryId(sql: string): string {
    // Normalize query by removing parameters and whitespace
    const normalized = sql
      .replace(/\$\d+|\?/g, '?') // Replace parameters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase();
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `query_${Math.abs(hash)}`;
  }

  /**
   * Get database health metrics
   */
  async getDatabaseHealth(): Promise<DatabaseHealth> {
    try {
      // Get connection pool stats
      const poolStats = this.db.client.pool;
      const connectionPool = {
        active: poolStats.numUsed(),
        idle: poolStats.numFree(),
        total: poolStats.numUsed() + poolStats.numFree()
      };

      // Calculate performance metrics
      const allMetrics = Array.from(this.queryMetrics.values()).flat();
      const recentMetrics = allMetrics.filter(
        m => Date.now() - m.timestamp.getTime() < 60 * 60 * 1000 // Last hour
      );
      
      const performance = {
        avgQueryTime: recentMetrics.length > 0 
          ? recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / recentMetrics.length
          : 0,
        slowQueries: recentMetrics.filter(m => m.executionTime > this.slowQueryThreshold).length,
        totalQueries: recentMetrics.length
      };

      // Get storage statistics
      const tableStats = await this.getTableStatistics();
      const databaseSize = tableStats.reduce((sum, table) => sum + table.sizeBytes, 0);

      // Analyze indexes
      const indexes = await this.analyzeIndexes();

      return {
        connectionPool,
        performance,
        storage: {
          databaseSize,
          tableStats
        },
        indexes
      };
    } catch (error) {
      console.error('Error getting database health:', error);
      throw error;
    }
  }

  /**
   * Get table statistics
   */
  private async getTableStatistics(): Promise<Array<{
    tableName: string;
    rowCount: number;
    sizeBytes: number;
  }>> {
    try {
      // PostgreSQL specific query (for future use)
      /*
      const result = await this.db.raw(`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public'
        ORDER BY tablename, attname
      `);
      */

      // Get table sizes
      const sizeResult = await this.db.raw(`
        SELECT 
          table_name,
          pg_total_relation_size(quote_ident(table_name)) as size_bytes
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      // Get row counts for main tables
      const tables = ['users', 'form_categories', 'form_types', 'form_templates', 'form_instances'];
      const tableStats = [];

      for (const tableName of tables) {
        try {
          const countResult = await this.db(tableName).count('* as count').first();
          const rowCount = parseInt(countResult?.['count'] as string) || 0;
          
          const sizeInfo = sizeResult.rows.find((r: any) => r.table_name === tableName);
          const sizeBytes = sizeInfo ? parseInt(sizeInfo.size_bytes) : 0;

          tableStats.push({
            tableName,
            rowCount,
            sizeBytes
          });
        } catch (error) {
          // Table might not exist yet
          console.warn(`Could not get stats for table ${tableName}:`, error);
        }
      }

      return tableStats;
    } catch (error) {
      console.error('Error getting table statistics:', error);
      return [];
    }
  }

  /**
   * Analyze database indexes
   */
  private async analyzeIndexes(): Promise<{
    missingIndexes: string[];
    unusedIndexes: string[];
  }> {
    try {
      // Get existing indexes (for future use)
      /*
      const indexResult = await this.db.raw(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
      `);
      */

      // Analyze slow queries for missing indexes
      const slowQueries = Array.from(this.queryMetrics.values())
        .flat()
        .filter(m => m.executionTime > this.slowQueryThreshold);

      const missingIndexes: string[] = [];
      const unusedIndexes: string[] = [];

      // Simple heuristics for missing indexes
      for (const metric of slowQueries) {
        if (metric.query.includes('WHERE') && !metric.query.includes('INDEX')) {
          // Extract potential missing index suggestions
          const whereMatch = metric.query.match(/WHERE\s+(\w+)\s*=/i);
          if (whereMatch) {
            const column = whereMatch[1];
            missingIndexes.push(`Consider index on column: ${column}`);
          }
        }
      }

      // Remove duplicates
      const uniqueMissingIndexes = [...new Set(missingIndexes)];

      return {
        missingIndexes: uniqueMissingIndexes,
        unusedIndexes // Would need more sophisticated analysis
      };
    } catch (error) {
      console.error('Error analyzing indexes:', error);
      return {
        missingIndexes: [],
        unusedIndexes: []
      };
    }
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];
    
    try {
      const health = await this.getDatabaseHealth();
      
      // Check for slow queries
      if (health.performance.slowQueries > 0) {
        recommendations.push({
          type: 'query',
          priority: 'high',
          description: `${health.performance.slowQueries} slow queries detected`,
          impact: 'Queries taking longer than 1 second can impact user experience',
          implementation: 'Review and optimize slow queries, add appropriate indexes',
          estimatedImprovement: '50-80% query performance improvement'
        });
      }

      // Check for missing indexes
      if (health.indexes.missingIndexes.length > 0) {
        recommendations.push({
          type: 'index',
          priority: 'medium',
          description: 'Missing database indexes detected',
          impact: 'Queries without proper indexes perform full table scans',
          implementation: 'Add indexes on frequently queried columns',
          estimatedImprovement: '10-100x query performance improvement'
        });
      }

      // Check connection pool utilization
      if (health.connectionPool.active / health.connectionPool.total > 0.8) {
        recommendations.push({
          type: 'schema',
          priority: 'medium',
          description: 'High connection pool utilization',
          impact: 'May lead to connection timeouts under load',
          implementation: 'Increase connection pool size or optimize query patterns',
          estimatedImprovement: 'Better concurrency handling'
        });
      }

      // Check for caching opportunities
      const avgQueryTime = health.performance.avgQueryTime;
      if (avgQueryTime > 100) {
        recommendations.push({
          type: 'cache',
          priority: 'medium',
          description: 'Frequent database queries detected',
          impact: 'Repeated queries increase database load',
          implementation: 'Implement caching for frequently accessed data',
          estimatedImprovement: '90% reduction in database load'
        });
      }

      // Check database size
      const dbSizeGB = health.storage.databaseSize / (1024 * 1024 * 1024);
      if (dbSizeGB > 10) {
        recommendations.push({
          type: 'schema',
          priority: 'low',
          description: 'Large database size detected',
          impact: 'Large databases may have slower backup and maintenance operations',
          implementation: 'Consider data archival and partitioning strategies',
          estimatedImprovement: 'Improved maintenance performance'
        });
      }

    } catch (error) {
      console.error('Error generating optimization recommendations:', error);
    }

    return recommendations;
  }

  /**
   * Optimize frequently accessed queries with caching
   */
  async optimizeWithCaching(tenantId: string): Promise<{
    categoriesCached: boolean;
    typesCached: boolean;
    templatesCached: boolean;
  }> {
    try {
      // Cache form categories
      const categories = await this.db('form_categories')
        .where('tenant_id', tenantId)
        .where('is_active', true)
        .select('*');
      
      await cache.set(
        cacheKeys.formCategory(tenantId),
        categories,
        3600 // 1 hour
      );

      // Cache form types for each category
      let typesCached = true;
      for (const category of categories) {
        try {
          const types = await this.db('form_types')
            .where('category_id', category.id)
            .where('is_active', true)
            .select('*');
          
          await cache.set(
            cacheKeys.formType(tenantId, category.id),
            types,
            3600
          );
        } catch (error) {
          typesCached = false;
          console.error('Error caching form types:', error);
        }
      }

      // Cache active form templates
      const templates = await this.db('form_templates')
        .where('tenant_id', tenantId)
        .where('is_active', true)
        .select('*');
      
      let templatesCached = true;
      try {
        await cache.set(
          `form:templates:${tenantId}:active`,
          templates,
          1800 // 30 minutes
        );
      } catch (error) {
        templatesCached = false;
        console.error('Error caching form templates:', error);
      }

      return {
        categoriesCached: true,
        typesCached,
        templatesCached
      };
    } catch (error) {
      console.error('Error optimizing with caching:', error);
      return {
        categoriesCached: false,
        typesCached: false,
        templatesCached: false
      };
    }
  }

  /**
   * Get query performance report
   */
  getQueryPerformanceReport(): {
    slowestQueries: Array<{
      query: string;
      avgExecutionTime: number;
      executionCount: number;
      lastExecuted: Date;
    }>;
    totalQueries: number;
    averageExecutionTime: number;
  } {
    const allMetrics = Array.from(this.queryMetrics.entries()).map(([queryId, metrics]) => {
      const avgTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;
      const lastMetric = metrics[metrics.length - 1];
      
      if (!lastMetric) {
        return null; // Skip if no metrics
      }
      
      return {
        queryId,
        query: lastMetric.query,
        avgExecutionTime: avgTime,
        executionCount: metrics.length,
        lastExecuted: lastMetric.timestamp
      };
    });

    const slowestQueries = allMetrics
      .filter(metric => metric !== null)
      .sort((a, b) => b!.avgExecutionTime - a!.avgExecutionTime)
      .slice(0, 10) as Array<{
        queryId: string;
        query: string;
        avgExecutionTime: number;
        executionCount: number;
        lastExecuted: Date;
      }>;

    const validMetrics = allMetrics.filter(q => q !== null) as Array<{
      queryId: string;
      query: string;
      avgExecutionTime: number;
      executionCount: number;
      lastExecuted: Date;
    }>;
    
    const totalQueries = validMetrics.reduce((sum, q) => sum + q.executionCount, 0);
    const averageExecutionTime = validMetrics.length > 0
      ? validMetrics.reduce((sum, q) => sum + q.avgExecutionTime, 0) / validMetrics.length
      : 0;

    return {
      slowestQueries,
      totalQueries,
      averageExecutionTime
    };
  }

  /**
   * Clear query metrics
   */
  clearMetrics(): void {
    this.queryMetrics.clear();
  }
}

export default DatabaseOptimizationService;