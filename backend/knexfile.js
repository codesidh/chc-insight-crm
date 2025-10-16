'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const environment_1 = require('./dist/config/environment');
const knexConfig = {
  development: {
    client: 'postgresql',
    connection: {
      host: environment_1.config.database.host,
      port: environment_1.config.database.port,
      database: environment_1.config.database.name,
      user: environment_1.config.database.username,
      password: environment_1.config.database.password,
      ssl: environment_1.config.database.ssl ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: environment_1.config.database.maxConnections,
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
  },
  test: {
    client: 'postgresql',
    connection: {
      host: process.env.TEST_DATABASE_HOST || environment_1.config.database.host,
      port: parseInt(process.env.TEST_DATABASE_PORT || '5432', 10),
      database: process.env.TEST_DATABASE_NAME || 'chc_insight_test',
      user: process.env.TEST_DATABASE_USERNAME || environment_1.config.database.username,
      password: process.env.TEST_DATABASE_PASSWORD || environment_1.config.database.password,
      ssl: process.env.TEST_DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 1,
      max: 5,
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
  },
  staging: {
    client: 'postgresql',
    connection: {
      host: process.env.STAGING_DATABASE_HOST || environment_1.config.database.host,
      port: parseInt(process.env.STAGING_DATABASE_PORT || '5432', 10),
      database: process.env.STAGING_DATABASE_NAME || 'chc_insight_staging',
      user: process.env.STAGING_DATABASE_USERNAME || environment_1.config.database.username,
      password: process.env.STAGING_DATABASE_PASSWORD || environment_1.config.database.password,
      ssl: process.env.STAGING_DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
  },
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.PRODUCTION_DATABASE_HOST || environment_1.config.database.host,
      port: parseInt(process.env.PRODUCTION_DATABASE_PORT || '5432', 10),
      database: process.env.PRODUCTION_DATABASE_NAME || 'chc_insight_production',
      user: process.env.PRODUCTION_DATABASE_USERNAME || environment_1.config.database.username,
      password: process.env.PRODUCTION_DATABASE_PASSWORD || environment_1.config.database.password,
      ssl: process.env.PRODUCTION_DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 5,
      max: 50,
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
    acquireConnectionTimeout: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
};
exports.default = knexConfig;
//# sourceMappingURL=knexfile.js.map
