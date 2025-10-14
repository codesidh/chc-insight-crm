# Backend Development Standards

## Technology Stack

### Core Framework
- **Runtime**: Node.js 18+ with TypeScript (strict mode enabled)
- **Framework**: Express.js 4.18+ with async/await patterns
- **Database**: PostgreSQL with Knex.js query builder
- **Validation**: Zod for schema validation and type safety
- **Authentication**: JWT with Passport.js strategies
- **Caching**: Redis for session management and caching
- **Security**: Helmet.js, CORS, bcryptjs for password hashing
- **Environment**: dotenv for configuration management

### Development Tools
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Testing**: Jest with ts-jest for TypeScript support
- **Code Quality**: Strict TypeScript configuration with no implicit any
- **Type Coverage**: 100% type coverage required
- **Database Migrations**: Knex.js migrations and seeds

## Project Structure

### Mandatory Backend Structure
```
backend/
├── src/
│   ├── controllers/          # HTTP request handlers
│   │   ├── auth.controller.ts
│   │   ├── form-hierarchy.controller.ts
│   │   ├── form-builder.controller.ts
│   │   └── member-provider-lookup.controller.ts
│   ├── services/             # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── database.service.ts
│   │   ├── form-hierarchy.service.ts
│   │   ├── form-builder.service.ts
│   │   └── member-provider-lookup.service.ts
│   ├── models/               # Database models and interfaces
│   │   └── .gitkeep
│   ├── middleware/           # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   └── requestLogger.ts
│   ├── routes/               # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── form-hierarchy.routes.ts
│   │   ├── form-builder.routes.ts
│   │   └── member-provider-lookup.routes.ts
│   ├── database/             # Database related files
│   │   ├── migrations/       # Knex migrations
│   │   └── seeds/           # Database seed files
│   ├── config/              # Configuration files
│   │   ├── environment.ts   # Environment configuration
│   │   ├── database.ts      # Database configuration
│   │   ├── knex.ts         # Knex instance
│   │   └── redis.ts        # Redis configuration
│   ├── types/               # TypeScript type definitions
│   │   ├── index.ts         # Core type exports
│   │   └── validation-schemas.ts # Zod validation schemas
│   ├── utils/               # Utility functions
│   ├── scripts/             # Database and utility scripts
│   │   ├── setup-database.ts
│   │   └── dev-utils.ts
│   ├── __tests__/           # Test files
│   └── index.ts             # Application entry point
├── dist/                    # Compiled JavaScript (build output)
├── Dockerfile               # Container configuration
├── docker-compose.yml       # Local development setup
├── package.json             # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

### Path Aliases
```typescript
// Configuration and environment
import config from '@/config/environment'
import { DatabaseService } from '@/services/database.service'

// Controllers and services
import { AuthController } from '@/controllers/auth.controller'
import { FormHierarchyService } from '@/services/form-hierarchy.service'

// Types and validation
import { User, ApiResponse } from '@/types'
import { CreateUserSchema } from '@/types/validation-schemas'

// Middleware and utilities
import { authMiddleware } from '@/middleware/auth.middleware'
import { errorHandler } from '@/middleware/errorHandler'
```

## Architecture Standards

### Layered Architecture
**MANDATORY**: Follow strict layered architecture with clear separation of concerns:

1. **Controllers Layer**: HTTP request/response handling only
2. **Services Layer**: Business logic and data processing
3. **Database Layer**: Data access and persistence
4. **Middleware Layer**: Cross-cutting concerns (auth, logging, validation)

### Controller Standards
```typescript
// ✅ CORRECT: Controller handles HTTP only
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      // Validate request body
      const validationResult = CreateUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validationResult.error.errors
          }
        });
        return;
      }

      // Delegate to service layer
      const result = await this.userService.createUser(validationResult.data, userId);

      if (result.success) {
        res.status(201).json(result);
      } else {
        const statusCode = result.error?.code === 'USER_EXISTS' ? 409 : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      });
    }
  };
}
```

### Service Standards
```typescript
// ✅ CORRECT: Service contains business logic
export class UserService {
  private db: Knex;

  constructor() {
    this.db = DatabaseService.getInstance().getConnection();
  }

  async createUser(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<ApiResponse<User>> {
    try {
      // Validate input with Zod
      const validatedData = CreateUserSchema.parse({
        ...userData,
        createdBy
      });

      // Business logic: Check if user exists
      const existingUser = await this.db('users')
        .where({ email: validatedData.email, tenant_id: validatedData.tenantId })
        .first();

      if (existingUser) {
        return {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          }
        };
      }

      // Business logic: Create user
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);
      
      const newUser = {
        id: userId,
        tenant_id: validatedData.tenantId,
        email: validatedData.email,
        password_hash: hashedPassword,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        is_active: true,
        created_by: createdBy,
        created_at: new Date(),
        updated_at: new Date()
      };

      await this.db('users').insert(newUser);

      const created = await this.db('users').where('id', userId).first();

      return {
        success: true,
        data: created,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'USER_CREATE_ERROR',
          message: 'Failed to create user',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }
}
```

## API Standards

### Response Format
**MANDATORY**: All API responses must use the standardized `ApiResponse<T>` format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp: Date;
  };
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

### HTTP Status Codes
**MANDATORY**: Use consistent HTTP status codes:

- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resources)
- `422` - Unprocessable Entity (business logic errors)
- `500` - Internal Server Error

### Error Handling
```typescript
// ✅ CORRECT: Consistent error handling
try {
  const result = await this.someService.performOperation();
  
  if (result.success) {
    res.status(200).json(result);
  } else {
    const statusCode = this.getStatusCodeFromError(result.error?.code);
    res.status(statusCode).json(result);
  }
} catch (error) {
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  });
}

private getStatusCodeFromError(errorCode?: string): number {
  switch (errorCode) {
    case 'NOT_FOUND': return 404;
    case 'ALREADY_EXISTS': return 409;
    case 'VALIDATION_ERROR': return 400;
    case 'UNAUTHORIZED': return 401;
    case 'FORBIDDEN': return 403;
    default: return 400;
  }
}
```

## Database Standards

### Query Builder Usage
**MANDATORY**: Use Knex.js query builder, never raw SQL except for complex queries:

```typescript
// ✅ CORRECT: Using query builder
const users = await this.db('users')
  .where('tenant_id', tenantId)
  .where('is_active', true)
  .orderBy('created_at', 'desc')
  .limit(limit)
  .offset(offset);

// ✅ ACCEPTABLE: Raw SQL for complex queries with proper escaping
const summary = await this.db.raw(`
  SELECT 
    fc.id as category_id,
    fc.name as category_name,
    COUNT(DISTINCT ft.id) as type_count
  FROM form_categories fc
  LEFT JOIN form_types ft ON fc.id = ft.category_id
  WHERE fc.tenant_id = ? AND fc.is_active = true
  GROUP BY fc.id, fc.name
  ORDER BY fc.name
`, [tenantId]);

// ❌ WRONG: String concatenation in SQL
const users = await this.db.raw(`SELECT * FROM users WHERE name = '${name}'`);
```

### Migration Standards
```typescript
// ✅ CORRECT: Migration structure
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('email', 255).notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.uuid('created_by').notNullable().references('id').inTable('users');
    table.uuid('updated_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Constraints
    table.unique(['tenant_id', 'email']);
    
    // Indexes
    table.index(['tenant_id']);
    table.index(['email']);
    table.index(['is_active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
```

## Validation Standards

### Zod Schema Usage
**MANDATORY**: Use Zod for all input validation:

```typescript
// ✅ CORRECT: Comprehensive Zod schema
export const CreateUserSchema = z.object({
  tenantId: z.string().uuid(),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  createdBy: z.string().uuid()
});

export const UpdateUserSchema = CreateUserSchema.partial().extend({
  updatedBy: z.string().uuid()
});

// ✅ CORRECT: Schema validation in service
const validatedData = CreateUserSchema.parse(userData);
```

### Input Sanitization
```typescript
// ✅ CORRECT: Validate and sanitize inputs
const validationResult = CreateUserSchema.safeParse(req.body);

if (!validationResult.success) {
  return res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: validationResult.error.errors
    }
  });
}

const sanitizedData = validationResult.data;
```

## Security Standards

### Authentication & Authorization
```typescript
// ✅ CORRECT: JWT middleware implementation
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required' }
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    
    // Attach user context to request
    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      roles: decoded.roles
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid authentication token' }
    });
  }
};
```

### Password Security
```typescript
// ✅ CORRECT: Secure password hashing
const hashedPassword = await bcrypt.hash(password, 12);

// ✅ CORRECT: Password verification
const isValid = await bcrypt.compare(password, user.password_hash);
```

### Environment Variables
```typescript
// ✅ CORRECT: Environment configuration
export default {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001'),
  jwtSecret: process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'dev-secret-key';
  })(),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'chc_insight_crm',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  }
};
```

## File Naming Conventions

### Files and Directories
- **kebab-case** for directories: `form-hierarchy/`
- **camelCase** for TypeScript files: `formHierarchy.service.ts`
- **lowercase** for configuration files: `knexfile.ts`
- **PascalCase** for classes: `FormHierarchyService`

### Code Conventions
- **PascalCase** for TypeScript interfaces, classes, and enums
- **camelCase** for functions, variables, and methods
- **SCREAMING_SNAKE_CASE** for constants and environment variables
- **kebab-case** for API endpoints: `/api/form-categories`

## Import Order Standards

1. Node.js built-in modules
2. Third-party libraries (express, knex, etc.)
3. Internal types and interfaces (`@/types`)
4. Internal services (`@/services`)
5. Internal middleware (`@/middleware`)
6. Internal utilities (`@/utils`)
7. Relative imports (`./`, `../`)

```typescript
// ✅ CORRECT: Import order
import { Request, Response } from 'express';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

import { User, ApiResponse } from '@/types';
import { CreateUserSchema } from '@/types/validation-schemas';
import { DatabaseService } from '@/services/database.service';
import { authMiddleware } from '@/middleware/auth.middleware';

import { validateUserData } from './userValidation';
```

## Testing Standards

### Test Structure
```typescript
// ✅ CORRECT: Test structure
describe('UserService', () => {
  let userService: UserService;
  let mockDb: jest.Mocked<Knex>;

  beforeEach(() => {
    mockDb = createMockDb();
    userService = new UserService();
    (userService as any).db = mockDb;
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const userData = {
        tenantId: 'tenant-123',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockDb.mockReturnValueOnce(Promise.resolve(null)); // No existing user
      mockDb.mockReturnValueOnce(Promise.resolve()); // Insert success
      mockDb.mockReturnValueOnce(Promise.resolve(mockUser)); // Return created user

      // Act
      const result = await userService.createUser(userData, 'creator-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(mockDb).toHaveBeenCalledWith('users');
    });

    it('should return error when user already exists', async () => {
      // Test implementation
    });
  });
});
```

## Performance Standards

### Database Optimization
- **MANDATORY**: Use database indexes for frequently queried columns
- **MANDATORY**: Implement pagination for list endpoints
- **MANDATORY**: Use connection pooling
- **RECOMMENDED**: Use database transactions for multi-table operations

### Caching Strategy
```typescript
// ✅ CORRECT: Redis caching implementation
export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(config.redis);
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
```

## Logging Standards

### Request Logging
```typescript
// ✅ CORRECT: Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  });

  next();
};
```

## Development Commands

### Backend Development
```bash
npm run dev              # Start development server with nodemon
npm run dev:debug        # Start with debugging enabled
npm run build            # Build for production
npm run start            # Start production server
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run type-check       # TypeScript type checking
npm run db:migrate       # Run database migrations
npm run db:seed          # Run database seeds
npm run db:reset         # Reset database (dev only)
```

## Build Error Prevention Standards

### Critical TypeScript Configuration Rules

Based on analysis of common build failures, these rules are **MANDATORY** to prevent compilation errors:

#### 1. Export Declaration Management
**PROBLEM**: Duplicate export declarations cause TS2323 errors
**ROOT CAUSE**: Schemas exported both individually (`export const`) and in export blocks

```typescript
// ❌ WRONG: Duplicate exports
export const UserSchema = z.object({...});
// ... later in file
export { UserSchema }; // TS2323: Cannot redeclare exported variable

// ✅ CORRECT: Single export method
const UserSchema = z.object({...});
// ... at end of file
export { UserSchema };
```

**RULE**: Choose ONE export pattern per file:
- **Option A**: Individual exports (`export const`)
- **Option B**: Const declarations + export block (RECOMMENDED for schema files)

#### 2. Type Import/Export Consistency
**PROBLEM**: Missing type exports cause TS2305 errors
**ROOT CAUSE**: Types referenced but not exported from index files

```typescript
// ❌ WRONG: Type used but not exported
// In service file
import { UserContext } from '../types'; // TS2305: Module has no exported member

// ✅ CORRECT: Ensure all used types are exported
// In types/index.ts
export interface UserContext {
  userId: string;
  tenantId: string;
  roles: Role[];
  permissions: Permission[];
  sessionId: string;
}
```

**RULE**: All types referenced in services MUST be exported from `types/index.ts`

#### 3. Service Architecture Patterns
**PROBLEM**: Inconsistent service instantiation patterns
**ROOT CAUSE**: Missing singleton patterns and database connection methods

```typescript
// ❌ WRONG: Service expects getInstance() method that doesn't exist
this.db = DatabaseService.getInstance().getConnection(); // TS2339: Property 'getInstance' does not exist

// ✅ CORRECT: Implement proper singleton pattern
export class DatabaseService {
  private static instance: DatabaseService;
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
  
  getConnection() {
    return db; // Return Knex instance
  }
}
```

**RULE**: All service classes that need database access MUST follow singleton pattern

#### 4. JWT Token Generation Type Safety
**PROBLEM**: JWT library type mismatches
**ROOT CAUSE**: Strict TypeScript options with JWT payload types

```typescript
// ❌ WRONG: Type mismatch in JWT options
const token = jwt.sign(payload, secret, { expiresIn: config.jwt.expiresIn }); // Type error

// ✅ CORRECT: Explicit type casting for JWT options
const token = jwt.sign(
  payload,
  secret,
  { expiresIn: config.jwt.expiresIn as string }
);
```

**RULE**: Always cast JWT configuration values to expected types

#### 5. Strict Null Checks Compliance
**PROBLEM**: Undefined values in strict mode
**ROOT CAUSE**: `exactOptionalPropertyTypes: true` and `noUncheckedIndexedAccess: true`

```typescript
// ❌ WRONG: Potential undefined access
const value = parseInt(match[1]); // TS2345: Argument of type 'string | undefined'

// ✅ CORRECT: Null check before access
const value = match && match[1] ? parseInt(match[1]) : 0;
```

**RULE**: Always check for undefined/null before accessing array elements or object properties

#### 6. Database Query Result Handling
**PROBLEM**: Index signature access violations
**ROOT CAUSE**: Knex query results have index signatures, strict mode requires bracket notation

```typescript
// ❌ WRONG: Property access on index signature
const count = result.count; // TS4111: Property 'count' comes from index signature

// ✅ CORRECT: Bracket notation for index signatures
const count = result['count'] as string;
```

**RULE**: Use bracket notation for database query result properties

#### 7. Unused Import Management
**PROBLEM**: Unused imports cause TS6133 errors
**ROOT CAUSE**: Imports added but not used in implementation

```typescript
// ❌ WRONG: Unused imports
import { User, UserRole, Permission } from '../types'; // UserRole unused

// ✅ CORRECT: Only import what's used
import { User, Permission } from '../types';
```

**RULE**: Remove unused imports immediately after refactoring

### Validation Schema Standards

#### Schema File Organization
**MANDATORY**: Follow this exact pattern for validation schema files:

```typescript
// 1. Imports at top
import { z } from 'zod';
import { EnumType } from './index';

// 2. Schema definitions (NO export keyword)
const UserSchema = z.object({
  // schema definition
});

const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// 3. Single export block at end
export {
  UserSchema,
  CreateUserSchema,
  // ... all other schemas
};
```

#### Schema Naming Conventions
- **Base schemas**: `EntitySchema` (e.g., `UserSchema`)
- **Create schemas**: `CreateEntitySchema` (e.g., `CreateUserSchema`)
- **Update schemas**: `UpdateEntitySchema` (e.g., `UpdateUserSchema`)
- **Filter schemas**: `EntityFilterSchema` (e.g., `UserFilterSchema`)

### Database Service Standards

#### Singleton Implementation
**MANDATORY**: All database-related services MUST implement singleton pattern:

```typescript
export class DatabaseService {
  private static instance: DatabaseService;
  private static initialized = false;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  getConnection(): Knex {
    return db; // Return the Knex instance
  }

  static getKnexInstance(): Knex {
    return db; // Static method for direct access
  }
}
```

#### Service Constructor Pattern
**MANDATORY**: Services that need database access MUST follow this pattern:

```typescript
export class SomeService {
  private db: Knex;

  constructor() {
    this.db = DatabaseService.getInstance().getConnection();
  }
}
```

### Type Safety Enforcement

#### Strict TypeScript Configuration
**MANDATORY**: These tsconfig.json options MUST be enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true
  }
}
```

#### Type Assertion Guidelines
**WHEN TO USE**: Type assertions should be used sparingly and only when:
1. Working with external library types (JWT, database results)
2. Converting between compatible types
3. Handling dynamic content where type is known at runtime

```typescript
// ✅ ACCEPTABLE: External library type assertion
const token = jwt.sign(payload, secret, { expiresIn: time as string });

// ✅ ACCEPTABLE: Database result type assertion
const count = parseInt(result['count'] as string);

// ❌ WRONG: Avoiding proper type checking
const user = data as User; // Should use proper validation instead
```

### Critical TypeScript Patterns

#### Request Parameter Validation
**MANDATORY**: All route parameters MUST be validated before service calls:

```typescript
// ✅ CORRECT: Always validate parameters
const { id } = req.params;
if (!id) {
  res.status(400).json({
    success: false,
    error: { code: 'INVALID_ID', message: 'ID is required' }
  });
  return;
}
const result = await this.service.method(id, tenantId);
```

#### Query Parameter Access
**MANDATORY**: Use bracket notation for query parameters with strict TypeScript:

```typescript
// ✅ CORRECT: Bracket notation
const filters = {
  isActive: req.query['isActive'] === 'true' ? true : req.query['isActive'] === 'false' ? false : undefined,
  name: req.query['name'] as string
};

// ❌ WRONG: Dot notation (causes TS4111 errors)
const filters = {
  isActive: req.query.isActive === 'true',
  name: req.query.name as string
};
```

#### Interface vs Database Field Mapping
**MANDATORY**: Always use interface property names (camelCase), not database field names (snake_case):

```typescript
// ✅ CORRECT: Use interface properties
const questions = template.questions || [];
const typeId = template.typeId;
const createdBy = template.createdBy;

// ❌ WRONG: Database field names
const templateData = JSON.parse(template.template_data || '{}');
const typeId = template.type_id;
const createdBy = template.created_by;
```

#### Service Method Return Types
**MANDATORY**: Service methods must return the correct type, never pass through wrong types:

```typescript
// ✅ CORRECT: Return correct type
async createQuestion(): Promise<ApiResponse<Question>> {
  const updateResult = await this.formService.update(data);
  
  if (!updateResult.success) {
    return {
      success: false,
      error: updateResult.error  // Extract error, don't return whole response
    };
  }
  
  return {
    success: true,
    data: createdQuestion,  // Return the Question, not FormTemplate
    metadata: { timestamp: new Date() }
  };
}
```

#### Database Query Result Processing
**MANDATORY**: Use explicit typing for database query results to avoid type inference issues:

```typescript
// ✅ CORRECT: Explicit typing with for-loop
const statistics: Record<string, number> = {};
for (const result of queryResults) {
  const key = result['key'] as string;
  if (key) {
    statistics[key] = parseInt(result['count'] as string) || 0;
  }
}

// ❌ WRONG: Reduce with type inference issues
const statistics = queryResults.reduce((acc, result) => {
  acc[result.key] = result.count;  // Type inference problems
  return acc;
}, {});
```

### Pre-Commit Validation Rules

#### Mandatory Checks Before Commit
1. **Type Check**: `npm run type-check` MUST pass
2. **Lint Check**: `npm run lint` MUST pass with zero errors
3. **Build Check**: `npm run build` MUST complete successfully
4. **Test Check**: `npm run test` MUST pass (if tests exist)

#### Automated Validation Script
**MANDATORY**: Add this to package.json scripts:

```json
{
  "scripts": {
    "validate": "npm run lint && npm run type-check && npm run build",
    "precommit": "npm run validate"
  }
}
```

### Error Pattern Recognition

#### Common Error Patterns to Watch For
1. **TS2323**: Duplicate exports → Use single export pattern
2. **TS2305**: Missing type exports → Add to types/index.ts
3. **TS2339**: Missing method → Implement required interface methods
4. **TS4111**: Index signature access → Use bracket notation
5. **TS6133**: Unused imports → Remove immediately
6. **TS2769**: JWT type mismatch → Add type assertions
7. **TS2375**: Strict type assignment → Handle optional properties properly

#### Build Error Triage Process
1. **Identify Error Code**: Look for TS#### error codes
2. **Categorize**: Determine if it's export, type, or configuration issue
3. **Apply Pattern**: Use the appropriate fix pattern from this guide
4. **Validate**: Run type-check to ensure fix doesn't introduce new errors
5. **Test**: Verify functionality still works as expected

## Enforcement Rules

### Mandatory Checks
- All endpoints must use authentication middleware
- All inputs must be validated with Zod schemas
- All database queries must use Knex query builder
- All responses must follow ApiResponse format
- All errors must be properly handled and logged
- **NEW**: All validation schemas must follow single export pattern
- **NEW**: All services must implement proper singleton patterns
- **NEW**: All type imports must be properly exported

### Prohibited Actions
- Direct SQL string concatenation
- Storing passwords in plain text
- Exposing sensitive data in API responses
- Using `any` type in TypeScript
- Bypassing validation layers
- **NEW**: Duplicate export declarations in schema files
- **NEW**: Property access on database query results without bracket notation
- **NEW**: Committing code with TypeScript errors
- **NEW**: Using database field names instead of interface properties
- **NEW**: Returning wrong types from service methods
- **NEW**: Skipping route parameter validation

### Code Review Requirements
- Verify proper error handling
- Confirm input validation
- Check authentication/authorization
- Validate database query safety
- Ensure proper logging
- **NEW**: Verify no duplicate exports in validation schemas
- **NEW**: Confirm proper singleton pattern implementation
- **NEW**: Check that all referenced types are exported
- **NEW**: Validate TypeScript compilation passes
- **NEW**: Verify route parameter validation before service calls
- **NEW**: Confirm bracket notation used for query parameters
- **NEW**: Check interface properties used (not database field names)
- **NEW**: Validate service methods return correct types

### Development Workflow Requirements
1. **Before Starting**: Run `npm run type-check` to ensure clean baseline
2. **During Development**: Fix TypeScript errors immediately, don't accumulate
3. **Before Committing**: Run `npm run validate` script
4. **Code Review**: Reviewer must verify build passes in CI/CD

This comprehensive standard ensures maintainable, secure, and scalable backend development across the entire CHC Insight CRM application while preventing common build failures.