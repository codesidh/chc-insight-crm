#!/usr/bin/env ts-node

import { DatabaseService } from '../services/database.service';

async function main() {
  const command = process.argv[2];

  try {
    await DatabaseService.initialize();

    switch (command) {
      case 'migrate':
        console.log('🔄 Running migrations...');
        await DatabaseService.migrate();
        break;

      case 'rollback':
        console.log('🔄 Rolling back migrations...');
        await DatabaseService.rollback();
        break;

      case 'seed':
        console.log('🔄 Running seeds...');
        await DatabaseService.seed();
        break;

      case 'status': {
        console.log('📊 Getting migration status...');
        const status = await DatabaseService.getMigrationStatus();
        console.log('Current version:', status.currentVersion);
        console.log('Pending migrations:', status.pending.length);
        console.log('Completed migrations:', status.completed.length);
        break;
      }

      case 'health': {
        console.log('🏥 Checking database health...');
        const health = await DatabaseService.healthCheck();
        console.log('Health status:', health);
        break;
      }

      default:
        console.log('Available commands:');
        console.log('  migrate  - Run pending migrations');
        console.log('  rollback - Rollback last migration batch');
        console.log('  seed     - Run database seeds');
        console.log('  status   - Show migration status');
        console.log('  health   - Check database health');
        break;
    }
  } catch (error) {
    console.error('❌ Database operation failed:', error);
    process.exit(1);
  } finally {
    await DatabaseService.shutdown();
    process.exit(0);
  }
}

main();
