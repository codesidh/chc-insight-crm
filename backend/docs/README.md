# CHC Insight CRM Backend

A Node.js/Express backend API for the CHC Insight CRM system, built with TypeScript, PostgreSQL, and Redis.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Set up database (make sure PostgreSQL is running)
npm run db:migrate

# Start development server
npm run dev
```

The server will start on `http://localhost:3001`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # PostgreSQL connection
│   │   ├── redis.ts     # Redis configuration
│   │   ├── knex.ts      # Migration system
│   │   └── environment.ts # Environment variables
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── middleware/      # Express middleware
│   ├── database/        # Migrations and seeds
│   ├── scripts/         # Utility scripts
│   └── index.ts         # Application entry point
├── dist/                # Compiled JavaScript (generated)
├── coverage/            # Test coverage reports (generated)
└── uploads/             # File uploads (generated)
```

## 🛠️ Development

### Available Scripts

#### Development

```bash
npm run dev              # Start development server with hot reload
npm run dev:debug        # Start with Node.js debugger
npm run dev:utils        # Run development utilities
```

#### Building

```bash
npm run build            # Build for production
npm run build:watch      # Build with watch mode
npm run clean            # Clean build directory
```

#### Code Quality

```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking
```

#### Testing

```bash
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ci          # Run tests for CI
npm run test:debug       # Debug tests
```

#### Database

```bash
npm run db:migrate       # Run migrations
npm run db:rollback      # Rollback migrations
npm run db:seed          # Run seeds
npm run db:status        # Migration status
npm run db:create-migration <name>  # Create migration
npm run db:create-seed <name>       # Create seed
```

#### Production

```bash
npm run start            # Start production server
npm run start:prod       # Start with production environment
```

#### Validation

```bash
npm run precommit        # Pre-commit checks
npm run validate         # Full validation (lint, format, type-check, test)
```

### Development Utilities

```bash
# System status
npm run dev:utils status

# Reset database (rollback, migrate, seed)
npm run dev:utils reset-db

# Clear Redis cache
npm run dev:utils clear-cache

# Generate test data (future implementation)
npm run dev:utils test-data
```

## 🔧 Configuration

### Environment Variables

The application uses environment-specific configuration files:

- `.env.development` - Development settings
- `.env.test` - Test environment settings
- `.env.example` - Template with all available options

Key configuration areas:

#### Database

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=chc_insight_dev
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_SSL=false
DATABASE_MAX_CONNECTIONS=20
```

#### Redis

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

#### Authentication

```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### TypeScript Configuration

The project uses strict TypeScript settings with:

- Path aliases (`@/` for `src/`)
- Strict type checking
- Source maps for debugging
- Declaration files generation

### Code Quality

#### ESLint

- TypeScript-specific rules
- Strict error checking
- Import/export validation
- Code style enforcement

#### Prettier

- Consistent code formatting
- 100 character line width
- Single quotes
- Trailing commas

#### Jest

- TypeScript support
- Path alias resolution
- Coverage reporting
- Test environment isolation

## 🏗️ Architecture

### Database Layer

- **PostgreSQL**: Primary database with connection pooling
- **Redis**: Caching and session management
- **Knex**: Migration system and query builder

### Services

- **DatabaseService**: Unified database management
- **CacheService**: Redis caching utilities
- **SessionService**: Session management

### Middleware

- **Security**: Helmet for security headers
- **CORS**: Cross-origin resource sharing
- **Compression**: Response compression
- **Logging**: Request/response logging
- **Error Handling**: Centralized error management

## 🧪 Testing

### Test Structure

```
src/
├── __tests__/           # Test files
├── **/*.test.ts         # Unit tests
└── **/*.spec.ts         # Integration tests
```

### Test Environment

- Isolated test database
- Mocked external services
- Automated cleanup
- Coverage reporting

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# CI mode
npm run test:ci
```

## 📊 Monitoring

### Health Checks

- Database connectivity
- Redis connectivity
- System status
- Migration status

Access health endpoint: `GET /health`

### Logging

- Request/response logging
- Error tracking
- Database query logging
- Performance monitoring

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Environment Setup

1. Set production environment variables
2. Run database migrations
3. Start the application
4. Monitor health endpoints

### Docker Support

Docker configuration will be added in future tasks.

## 🔒 Security

- Helmet for security headers
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection
- Rate limiting (future implementation)

## 📚 API Documentation

API documentation will be generated using OpenAPI/Swagger in future tasks.

## 🤝 Contributing

1. Follow the established code style
2. Run `npm run validate` before committing
3. Write tests for new features
4. Update documentation as needed

## 📄 License

Private - CHC Insight CRM System