// Production knexfile for running migrations
module.exports = {
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST || process.env.PRODUCTION_DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || process.env.PRODUCTION_DATABASE_PORT || '5432', 10),
      database: process.env.DATABASE_NAME || process.env.PRODUCTION_DATABASE_NAME || 'chc_insight_crm',
      user: process.env.DATABASE_USERNAME || process.env.PRODUCTION_DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || process.env.PRODUCTION_DATABASE_PASSWORD || 'secure_password_123',
      ssl: false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './dist/database/migrations',
      tableName: 'knex_migrations',
      extension: 'js',
    },
    seeds: {
      directory: './dist/database/seeds',
      extension: 'js',
    },
  },
};