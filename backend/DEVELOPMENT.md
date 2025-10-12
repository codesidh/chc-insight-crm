# Development Guide

This document provides comprehensive information about the development tooling and build process for the CHC Insight Backend.

## 🛠️ Development Tooling Overview

The backend is configured with modern development tools to ensure code quality, consistency, and developer productivity:

### Core Tools

- **TypeScript**: Strict type checking with modern ES2022 features
- **Node.js**: Runtime environment (v18+)
- **Express.js**: Web framework with middleware support
- **PostgreSQL**: Primary database with connection pooling
- **Redis**: Caching and session management
- **Knex.js**: Database migrations and query building

### Code Quality Tools

- **ESLint**: TypeScript-aware linting with custom rules
- **Prettier**: Consistent code formatting
- **Jest**: Testing framework with TypeScript support
- **Husky**: Git hooks for pre-commit validation (future)

### Build Tools

- **TypeScript Compiler**: Transpilation to JavaScript
- **Nodemon**: Development server with hot reload
- **ts-node**: Direct TypeScript execution
- **cross-env**: Cross-platform environment variables

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration management
│   │   ├── environment.ts   # Environment-specific config
│   │   ├── database.ts      # PostgreSQL configuration
│   │   ├── redis.ts         # Redis configuration
│   │   ├── knex.ts          # Knex query builder setup
│   │   └── knexfile.ts      # Migration configuration
│   ├── controllers/         # Route controllers
│   ├── services/           # Business logic services
│   ├── models/             # Data models
│   ├── middleware/         # Express middleware
│   ├── database/           # Migrations and seeds
│   ├── scripts/            # Development utilities
│   ├── __tests__/          # Test files
│   └── index.ts            # Application entry point
├── dist/                   # Compiled JavaScript (generated)
├── coverage/               # Test coverage reports (generated)
├── uploads/                # File uploads (generated)
├── .env.*                  # Environment configuration files
├── docker-compose.yml      # Docker development setup
├── Dockerfile              # Container configuration
├── jest.config.js          # Jest configuration
├── nodemon.json            # Nodemon configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.production.json # Production TypeScript config
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier configuration
└── package.json            # Dependencies and scripts
```

## 🔧 Configuration Files

### TypeScript Configuration

#### `tsconfig.json` (Development)
- Strict type checking enabled
- Path aliases for clean imports (`@/` → `src/`)
- Source maps for debugging
- ES2022 target with Node.js module resolution

#### `tsconfig.production.json` (Production)
- Optimized for production builds
- No source maps or comments
- Excludes test files and development scripts

### ESLint Configuration

#### `.eslintrc.json`
- TypeScript-aware parsing
- Prettier integration
- Custom rules for Node.js development
- Warnings for `any` types to encourage type safety

### Prettier Configuration

#### `.prettierrc`
- 2-space indentation
- Single quotes
- Semicolons required
- 100 character line width
- Trailing commas (ES5 style)

### Jest Configuration

#### `jest.config.js`
- TypeScript support via ts-jest
- Path alias resolution
- Coverage reporting
- Test environment isolation
- Global setup and teardown

### Nodemon Configuration

#### `nodemon.json`
- Watches TypeScript files
- Ignores test files
- 1-second delay for stability
- Development environment variables

## 🌍 Environment Management

### Environment Files

The application supports multiple environments with specific configuration:

- `.env.development` - Local development
- `.env.test` - Test environment
- `.env.staging` - Staging deployment
- `.env.production` - Production deployment

### Environment Loading

The `src/config/environment.ts` file:
1. Loads environment-specific `.env` files based on `NODE_ENV`
2. Provides type-safe configuration interface
3. Validates required variables in production
4. Offers sensible defaults for development

### Key Environment Variables

```bash
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=chc_insight_dev
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Security
JWT_SECRET=your-secret-key
```

## 🚀 Development Workflow

### Initial Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.development

# Start database services (Docker)
docker-compose up -d postgres redis

# Run migrations
npm run db:migrate:dev

# Start development server
npm run dev
```

### Daily Development

```bash
# Start development server with hot reload
npm run dev

# Run tests in watch mode
npm run test:watch

# Check code quality
npm run lint
npm run format:check
npm run type-check

# Run full validation
npm run validate
```

### Code Quality Checks

```bash
# Lint and fix issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check

# Run all validations
npm run validate
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in CI mode
npm run test:ci

# Debug tests
npm run test:debug
```

### Database Management

```bash
# Create migration
npm run db:create-migration create_users_table

# Run migrations
npm run db:migrate:dev

# Rollback migration
npm run db:migrate:rollback

# Seed database
npm run db:seed:dev

# Reset database
npm run db:reset
```

### Building and Deployment

```bash
# Build for development
npm run build

# Build for production
npm run build:production

# Start production server
npm run start:prod
```

## 🐳 Docker Development

### Docker Compose Services

The `docker-compose.yml` provides a complete development environment:

- **Backend**: Node.js application with hot reload
- **PostgreSQL**: Database with persistent storage
- **Redis**: Cache with persistent storage
- **pgAdmin**: Database administration (port 5050)
- **Redis Commander**: Redis administration (port 8081)

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Execute commands in container
docker-compose exec backend npm run db:migrate

# Stop services
docker-compose down

# Rebuild services
docker-compose up --build
```

### Docker Development Workflow

1. Start services: `docker-compose up -d`
2. Access pgAdmin: http://localhost:5050 (admin@chc-insight.com / admin)
3. Access Redis Commander: http://localhost:8081
4. Backend API: http://localhost:3001
5. View logs: `docker-compose logs -f backend`

## 🔍 Development Utilities

### Built-in Utilities

The `npm run dev:utils` command provides helpful development tools:

```bash
# Show system status
npm run dev:utils status

# Reset database
npm run dev:utils reset-db

# Clear Redis cache
npm run dev:utils clear-cache

# Generate test data (future)
npm run dev:utils test-data
```

### Code Generation

Generate boilerplate code for common patterns:

```bash
# Generate controller
npm run dev:utils generate controller user

# Generate service
npm run dev:utils generate service user

# Generate model
npm run dev:utils generate model user

# Generate middleware
npm run dev:utils generate middleware auth
```

## 🧪 Testing Strategy

### Test Structure

```
src/
├── __tests__/              # Global tests
├── controllers/
│   └── __tests__/          # Controller tests
├── services/
│   └── __tests__/          # Service tests
└── models/
    └── __tests__/          # Model tests
```

### Test Types

- **Unit Tests**: Individual function/class testing
- **Integration Tests**: Component interaction testing
- **End-to-End Tests**: Full workflow testing (future)

### Test Environment

- Isolated test database
- Mocked external services
- Automated cleanup
- Coverage reporting

## 📊 Performance Monitoring

### Development Monitoring

- Request/response logging
- Database query logging
- Error tracking
- Performance metrics

### Health Checks

The application provides health check endpoints:

- `GET /health` - Overall system health
- Database connectivity
- Redis connectivity
- Migration status

## 🔒 Security Considerations

### Development Security

- Environment variable validation
- Input sanitization
- SQL injection prevention
- XSS protection via Helmet
- CORS configuration

### Production Security

- Strong JWT secrets (32+ characters)
- HTTPS enforcement
- Rate limiting (future)
- Audit logging (future)

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL status
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Reset database
npm run db:reset
```

#### Redis Connection Errors
```bash
# Check Redis status
docker-compose ps redis

# View Redis logs
docker-compose logs redis

# Clear Redis cache
npm run dev:utils clear-cache
```

#### TypeScript Compilation Errors
```bash
# Check TypeScript configuration
npm run type-check

# Clean and rebuild
npm run clean && npm run build
```

#### Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- user.test.ts

# Debug tests
npm run test:debug
```

### Performance Issues

```bash
# Check system status
npm run dev:utils status

# Monitor database performance
# Access pgAdmin at http://localhost:5050

# Monitor Redis performance
# Access Redis Commander at http://localhost:8081
```

## 📚 Best Practices

### Code Style

1. Use TypeScript strict mode
2. Prefer explicit types over `any`
3. Use path aliases for clean imports
4. Follow ESLint and Prettier rules
5. Write meaningful test descriptions

### Development Workflow

1. Run `npm run validate` before committing
2. Use feature branches for development
3. Write tests for new functionality
4. Update documentation as needed
5. Use semantic commit messages

### Performance

1. Use connection pooling for database
2. Implement caching where appropriate
3. Use async/await for asynchronous operations
4. Monitor query performance
5. Optimize database indexes

### Security

1. Validate all inputs
2. Use parameterized queries
3. Keep dependencies updated
4. Follow OWASP guidelines
5. Regular security audits

## 🔄 Continuous Integration

### Pre-commit Checks

The validation pipeline includes:
1. ESLint code quality checks
2. Prettier code formatting
3. TypeScript type checking
4. Jest test execution
5. Coverage reporting

### CI Pipeline (Future)

Planned CI/CD pipeline:
1. Automated testing on pull requests
2. Security vulnerability scanning
3. Dependency updates
4. Automated deployments
5. Performance monitoring

## 📖 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Jest Documentation](https://jestjs.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

---

This development guide is maintained as part of the CHC Insight CRM project. For questions or improvements, please refer to the project documentation or contact the development team.