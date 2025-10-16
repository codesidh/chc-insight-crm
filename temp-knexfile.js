// Temporary knexfile for running migrations
module.exports = {
  production: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'chc_insight_crm',
      user: 'postgres',
      password: 'secure_password_123',
      ssl: false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './backend/dist/database/migrations',
      tableName: 'knex_migrations',
      extension: 'js',
    },
    seeds: {
      directory: './backend/dist/database/seeds',
      extension: 'js',
    },
  },
};