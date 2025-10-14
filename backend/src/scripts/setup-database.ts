#!/usr/bin/env ts-node

/**
 * Database setup script
 * Runs migrations and seeds for initial database setup
 */

import { DatabaseService } from '../services/database.service';
import config from '../config/environment';

async function setupDatabase() {
  console.log('🔧 Setting up CHC Insight CRM Database...\n');

  try {
    // Initialize database connection
    console.log('📡 Connecting to database...');
    await DatabaseService.initialize();
    const knex = DatabaseService.getKnexInstance();

    console.log(`✅ Connected to database: ${config.database.name}`);
    console.log(`   Host: ${config.database.host}:${config.database.port}`);
    console.log(`   Environment: ${config.nodeEnv}\n`);

    // Run migrations
    console.log('🔄 Running database migrations...');
    const [batchNo, migrationFiles] = await knex.migrate.latest();
    
    if (migrationFiles.length === 0) {
      console.log('✅ Database is already up to date');
    } else {
      console.log(`✅ Ran ${migrationFiles.length} migrations in batch ${batchNo}:`);
      migrationFiles.forEach((file: string) => console.log(`   - ${file}`));
    }

    // Run seeds
    console.log('\n🌱 Running database seeds...');
    const seedFiles = await knex.seed.run();
    
    if (seedFiles[0].length === 0) {
      console.log('✅ No seed files to run');
    } else {
      console.log(`✅ Ran ${seedFiles[0].length} seed files:`);
      seedFiles[0].forEach((file: string) => console.log(`   - ${file}`));
    }

    console.log('\n🎉 Database setup completed successfully!');
    
    // Display connection info
    console.log('\n📋 Database Information:');
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Database: ${config.database.name}`);
    console.log(`   Host: ${config.database.host}:${config.database.port}`);
    
    if (config.nodeEnv === 'development') {
      console.log('\n🔐 Default Admin Credentials:');
      console.log('   Email: admin@chc-insight.com');
      console.log('   Password: admin123');
      console.log('\n⚠️  Please change the default password after first login!');
    }

  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await DatabaseService.shutdown();
    console.log('\n🔒 Database connection closed');
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  setupDatabase();
}

export default setupDatabase;