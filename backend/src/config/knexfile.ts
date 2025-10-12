import type { Knex } from 'knex';
import config from './environment';

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.username,
      password: config.database.password,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: config.database.maxConnections,
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './database/seeds',
      extension: 'ts',
    },
  },

  test: {
    client: 'postgresql',
    connection: {
      host: process.env['TEST_DATABASE_HOST'] || config.database.host,
      port: parseInt(process.env['TEST_DATABASE_PORT'] || '5432', 10),
      database: process.env['TEST_DATABASE_NAME'] || 'chc_insight_test',
      user: process.env['TEST_DATABASE_USERNAME'] || config.database.username,
      password: process.env['TEST_DATABASE_PASSWORD'] || config.database.password,
      ssl: process.env['TEST_DATABASE_SSL'] === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 1,
      max: 5,
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './database/seeds',
      extension: 'ts',
    },
  },

  staging: {
    client: 'postgresql',
    connection: {
      host: process.env['STAGING_DATABASE_HOST'] || config.database.host,
      port: parseInt(process.env['STAGING_DATABASE_PORT'] || '5432', 10),
      database: process.env['STAGING_DATABASE_NAME'] || 'chc_insight_staging',
      user: process.env['STAGING_DATABASE_USERNAME'] || config.database.username,
      password: process.env['STAGING_DATABASE_PASSWORD'] || config.database.password,
      ssl: process.env['STAGING_DATABASE_SSL'] === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './database/seeds',
      extension: 'ts',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env['PRODUCTION_DATABASE_HOST'] || config.database.host,
      port: parseInt(process.env['PRODUCTION_DATABASE_PORT'] || '5432', 10),
      database: process.env['PRODUCTION_DATABASE_NAME'] || 'chc_insight_production',
      user: process.env['PRODUCTION_DATABASE_USERNAME'] || config.database.username,
      password: process.env['PRODUCTION_DATABASE_PASSWORD'] || config.database.password,
      ssl:
        process.env['PRODUCTION_DATABASE_SSL'] === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 5,
      max: 50,
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './database/seeds',
      extension: 'ts',
    },
    acquireConnectionTimeout: 60000,
  },
};

export default knexConfig;
