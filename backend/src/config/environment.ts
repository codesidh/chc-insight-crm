import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific configuration
const nodeEnv = process.env['NODE_ENV'] || 'development';

// Load the appropriate .env file based on NODE_ENV
const envFile = `.env.${nodeEnv}`;
const envPath = path.resolve(process.cwd(), envFile);

// Load environment variables
dotenv.config({ path: envPath });

// Fallback to .env if environment-specific file doesn't exist
if (nodeEnv !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  cors: {
    allowedOrigins: string[];
  };
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    ssl: boolean;
    maxConnections: number;
  };
  redis: {
    host: string;
    port: number;
    password: string | undefined;
    db: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    username: string | undefined;
    password: string | undefined;
    from: string;
  };
  fileUpload: {
    maxSize: number;
    allowedTypes: string[];
    path: string;
  };
  logging: {
    level: string;
    format: string;
  };
  security: {
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    sessionTimeoutMs: number;
  };
  performance: {
    cacheTtlSeconds: number;
    apiTimeoutMs: number;
  };
}

// Parse environment variables with defaults and validation
const config: EnvironmentConfig = {
  nodeEnv,
  port: parseInt(process.env['PORT'] || '3001', 10),
  cors: {
    allowedOrigins: (process.env['CORS_ALLOWED_ORIGINS'] || 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
  },
  database: {
    host: process.env['DATABASE_HOST'] || 'localhost',
    port: parseInt(process.env['DATABASE_PORT'] || '5432', 10),
    name: process.env['DATABASE_NAME'] || `chc_insight_${nodeEnv}`,
    username: process.env['DATABASE_USERNAME'] || 'postgres',
    password: process.env['DATABASE_PASSWORD'] || 'password',
    ssl: process.env['DATABASE_SSL'] === 'true',
    maxConnections: parseInt(process.env['DATABASE_MAX_CONNECTIONS'] || '20', 10),
  },
  redis: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
    password: process.env['REDIS_PASSWORD'] || undefined,
    db: parseInt(process.env['REDIS_DB'] || '0', 10),
  },
  jwt: {
    secret: process.env['JWT_SECRET'] || 'default-jwt-secret-change-this',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
  },
  email: {
    host: process.env['EMAIL_HOST'] || 'localhost',
    port: parseInt(process.env['EMAIL_PORT'] || '587', 10),
    secure: process.env['EMAIL_SECURE'] === 'true',
    username: process.env['EMAIL_USERNAME'],
    password: process.env['EMAIL_PASSWORD'],
    from: process.env['EMAIL_FROM'] || 'noreply@chc-insight.com',
  },
  fileUpload: {
    maxSize: parseInt(process.env['FILE_UPLOAD_MAX_SIZE'] || '10485760', 10), // 10MB default
    allowedTypes: (
      process.env['FILE_UPLOAD_ALLOWED_TYPES'] || 'image/jpeg,image/png,image/gif,application/pdf'
    )
      .split(',')
      .map((type) => type.trim()),
    path: process.env['FILE_UPLOAD_PATH'] || './uploads',
  },
  logging: {
    level: process.env['LOG_LEVEL'] || (nodeEnv === 'production' ? 'info' : 'debug'),
    format: process.env['LOG_FORMAT'] || 'combined',
  },
  security: {
    rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
    sessionTimeoutMs: parseInt(process.env['SESSION_TIMEOUT_MS'] || '3600000', 10), // 1 hour
  },
  performance: {
    cacheTtlSeconds: parseInt(process.env['CACHE_TTL_SECONDS'] || '300', 10), // 5 minutes
    apiTimeoutMs: parseInt(process.env['API_TIMEOUT_MS'] || '30000', 10), // 30 seconds
  },
};

// Validation for required environment variables in production
if (nodeEnv === 'production') {
  const requiredVars = [
    'DATABASE_HOST',
    'DATABASE_NAME',
    'DATABASE_USERNAME',
    'DATABASE_PASSWORD',
    'JWT_SECRET',
    'REDIS_HOST',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missingVars.join(', ')}`
    );
  }

  // Validate JWT secret strength in production
  if (config.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }
}

// Validate port range
if (config.port < 1 || config.port > 65535) {
  throw new Error(`Invalid port number: ${config.port}. Must be between 1 and 65535.`);
}

// Validate database port
if (config.database.port < 1 || config.database.port > 65535) {
  throw new Error(`Invalid database port: ${config.database.port}. Must be between 1 and 65535.`);
}

// Validate Redis port
if (config.redis.port < 1 || config.redis.port > 65535) {
  throw new Error(`Invalid Redis port: ${config.redis.port}. Must be between 1 and 65535.`);
}

// Log configuration in development
if (nodeEnv === 'development') {
  console.log('🔧 Environment Configuration:');
  console.log(`   NODE_ENV: ${config.nodeEnv}`);
  console.log(`   Port: ${config.port}`);
  console.log(
    `   Database: ${config.database.host}:${config.database.port}/${config.database.name}`
  );
  console.log(`   Redis: ${config.redis.host}:${config.redis.port}/${config.redis.db}`);
  console.log(`   CORS Origins: ${config.cors.allowedOrigins.join(', ')}`);
}

export default config;
