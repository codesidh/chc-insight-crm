#!/usr/bin/env ts-node

import { DatabaseService } from '../services/database.service';
import config from '../config/environment';

/**
 * Development utilities script
 * Usage: npm run dev:utils <command>
 */

async function resetDatabase() {
  console.log('🔄 Resetting database...');

  try {
    await DatabaseService.initialize();

    // Rollback all migrations
    console.log('📤 Rolling back all migrations...');
    await DatabaseService.rollback();

    // Run migrations
    console.log('📥 Running migrations...');
    await DatabaseService.migrate();

    // Run seeds
    console.log('🌱 Running seeds...');
    await DatabaseService.seed();

    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
}

async function clearCache() {
  console.log('🧹 Clearing Redis cache...');

  try {
    await DatabaseService.initialize();

    // Clear all cache patterns
    await DatabaseService.cache.clearPattern('*');

    console.log('✅ Cache cleared');
  } catch (error) {
    console.error('❌ Cache clear failed:', error);
    throw error;
  }
}

async function showStatus() {
  console.log('📊 System Status');
  console.log('================');

  try {
    await DatabaseService.initialize();

    // Environment info
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Port: ${config.port}`);
    console.log(
      `Database: ${config.database.name}@${config.database.host}:${config.database.port}`
    );
    console.log(`Redis: ${config.redis.host}:${config.redis.port}/${config.redis.db}`);

    // Health check
    const health = await DatabaseService.healthCheck();
    console.log('\nHealth Status:');
    console.log(`PostgreSQL: ${health.postgresql ? '✅' : '❌'}`);
    console.log(`Redis: ${health.redis ? '✅' : '❌'}`);
    console.log(`Knex: ${health.knex ? '✅' : '❌'}`);
    console.log(`Overall: ${health.overall ? '✅' : '❌'}`);

    // Migration status
    const migrationStatus = await DatabaseService.getMigrationStatus();
    console.log('\nMigration Status:');
    console.log(`Current Version: ${migrationStatus.currentVersion}`);
    console.log(`Pending Migrations: ${migrationStatus.pending.length}`);
    console.log(`Completed Migrations: ${migrationStatus.completed.length}`);
  } catch (error) {
    console.error('❌ Status check failed:', error);
    throw error;
  }
}

async function generateTestData() {
  console.log('🎭 Generating test data...');

  try {
    await DatabaseService.initialize();

    // This will be implemented when we have models
    console.log('⚠️  Test data generation will be implemented in future tasks');
  } catch (error) {
    console.error('❌ Test data generation failed:', error);
    throw error;
  }
}

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'reset-db':
        await resetDatabase();
        break;

      case 'clear-cache':
        await clearCache();
        break;

      case 'status':
        await showStatus();
        break;

      case 'test-data':
        await generateTestData();
        break;

      default:
        console.log('Available commands:');
        console.log('  reset-db    - Reset database (rollback, migrate, seed)');
        console.log('  clear-cache - Clear Redis cache');
        console.log('  status      - Show system status');
        console.log('  test-data   - Generate test data');
        break;
    }
  } catch (error) {
    console.error('❌ Command failed:', error);
    process.exit(1);
  } finally {
    await DatabaseService.shutdown();
    process.exit(0);
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}
