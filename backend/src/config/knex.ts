import knex, { Knex } from 'knex';
import knexConfig from './knexfile';
import config from './environment';

// Get the appropriate configuration based on environment
const environment = config.nodeEnv || 'development';
const dbConfig = knexConfig[environment];

if (!dbConfig) {
  throw new Error(`No database configuration found for environment: ${environment}`);
}

// Create Knex instance
export const db: Knex = knex(dbConfig);

// Database health check using Knex
export const checkKnexConnection = async (): Promise<boolean> => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Knex database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Knex database connection failed:', error);
    return false;
  }
};

// Run migrations
export const runMigrations = async (): Promise<void> => {
  try {
    console.log('🔄 Running database migrations...');
    const [batchNo, log] = await db.migrate.latest();

    if (log.length === 0) {
      console.log('✅ Database is already up to date');
    } else {
      console.log(`✅ Batch ${batchNo} run: ${log.length} migrations`);
      log.forEach((migration: string) => {
        console.log(`  - ${migration}`);
      });
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Rollback migrations
export const rollbackMigrations = async (): Promise<void> => {
  try {
    console.log('🔄 Rolling back database migrations...');
    const [batchNo, log] = await db.migrate.rollback();

    if (log.length === 0) {
      console.log('✅ Already at the base migration');
    } else {
      console.log(`✅ Batch ${batchNo} rolled back: ${log.length} migrations`);
      log.forEach((migration: string) => {
        console.log(`  - ${migration}`);
      });
    }
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};

// Run seeds
export const runSeeds = async (): Promise<void> => {
  try {
    console.log('🔄 Running database seeds...');
    const log = await db.seed.run();

    if (!log) {
      console.log('✅ No seed files found');
    } else {
      console.log(`✅ Ran seed files successfully`);
      if (Array.isArray(log)) {
        log.forEach((seed: any) => {
          console.log(`  - ${seed.file || seed}`);
        });
      } else {
        console.log(`  - ${(log as any).file || log}`);
      }
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Close database connection
export const closeKnexConnection = async (): Promise<void> => {
  try {
    await db.destroy();
    console.log('🔒 Knex database connection closed');
  } catch (error) {
    console.error('❌ Error closing Knex database connection:', error);
  }
};

// Migration status
export const getMigrationStatus = async (): Promise<any> => {
  try {
    const completed = await db.migrate.currentVersion();
    const list = await db.migrate.list();

    return {
      currentVersion: completed,
      pending: list[1],
      completed: list[0],
    };
  } catch (error) {
    console.error('❌ Error getting migration status:', error);
    throw error;
  }
};
