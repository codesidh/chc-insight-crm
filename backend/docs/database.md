# Database Configuration

This directory contains database-related files for the CHC Insight CRM backend.

## Structure

```
database/
├── migrations/     # Database migration files (created by Knex)
├── seeds/         # Database seed files (created by Knex)
└── README.md      # This file
```

## Database Setup

The application uses PostgreSQL as the primary database and Redis for caching and session management.

### Configuration

Database configuration is managed through environment variables. See `.env.example` for all available options.

Key configuration files:

- `src/config/environment.ts` - Environment variable configuration
- `src/config/database.ts` - PostgreSQL connection pool setup
- `src/config/redis.ts` - Redis client configuration
- `src/config/knex.ts` - Knex migration system setup
- `src/config/knexfile.ts` - Knex configuration for different environments

### Available Scripts

```bash
# Database operations
npm run db:migrate              # Run pending migrations
npm run db:migrate:rollback     # Rollback last migration batch
npm run db:migrate:status       # Show migration status
npm run db:seed                 # Run database seeds
npm run db:create-migration     # Create a new migration file
npm run db:create-seed          # Create a new seed file

# Database script (custom operations)
npm run db:script migrate       # Run migrations via custom script
npm run db:script rollback      # Rollback via custom script
npm run db:script seed          # Run seeds via custom script
npm run db:script status        # Check migration status
npm run db:script health        # Check database health
```

### Services

- **DatabaseService** (`src/services/database.service.ts`) - Main database service that manages both PostgreSQL and Redis connections
- **CacheService** - Redis caching utilities
- **SessionService** - Redis session management

### Features

- **Connection Pooling**: PostgreSQL connection pool with configurable limits
- **Health Checks**: Built-in health check endpoints for monitoring
- **Graceful Shutdown**: Proper connection cleanup on application shutdown
- **Multi-Environment**: Support for development, test, staging, and production environments
- **Migration System**: Knex-based database migrations and seeds
- **Caching Layer**: Redis-based caching with TTL support
- **Session Management**: Redis-based session storage

### Usage Example

```typescript
import { DatabaseService } from '@/services/database.service';

// Initialize database connections
await DatabaseService.initialize();

// Health check
const health = await DatabaseService.healthCheck();

// Execute raw query
const result = await DatabaseService.executeQuery('SELECT NOW()');

// Use cache
await DatabaseService.cache.set('key', { data: 'value' }, 3600);
const cached = await DatabaseService.cache.get('key');

// Session management
await DatabaseService.session.createSession('session-id', userData);
const session = await DatabaseService.session.getSession('session-id');
```

## Next Steps

Database schema and migrations will be implemented in task 5 "Implement database schema and data models".