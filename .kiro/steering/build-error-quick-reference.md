# Build Error Quick Reference Guide

## Most Common TypeScript Build Errors & Solutions

### 1. TS2323: Cannot redeclare exported variable

**Error Pattern:**
```
TS2323: Cannot redeclare exported variable 'UserSchema'
```

**Root Cause:** Duplicate exports (both `export const` and export block)

**Fix:**
```typescript
// ❌ WRONG
export const UserSchema = z.object({...});
export { UserSchema }; // Duplicate!

// ✅ CORRECT
const UserSchema = z.object({...});
export { UserSchema };
```

### 2. TS2305: Module has no exported member

**Error Pattern:**
```
TS2305: Module '"../types"' has no exported member 'UserContext'
```

**Root Cause:** Type is used but not exported from types/index.ts

**Fix:**
```typescript
// Add to types/index.ts
export interface UserContext {
  userId: string;
  tenantId: string;
  roles: Role[];
  permissions: Permission[];
  sessionId: string;
}
```

### 3. TS2339: Property does not exist on type

**Error Pattern:**
```
TS2339: Property 'getInstance' does not exist on type 'typeof DatabaseService'
```

**Root Cause:** Missing singleton pattern implementation

**Fix:**
```typescript
export class DatabaseService {
  private static instance: DatabaseService;
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
  
  getConnection() {
    return db;
  }
}
```

### 4. TS4111: Property comes from index signature

**Error Pattern:**
```
TS4111: Property 'count' comes from an index signature, so it must be accessed with ['count']
```

**Root Cause:** Database query results with strict TypeScript settings

**Fix:**
```typescript
// ❌ WRONG
const count = result.count;

// ✅ CORRECT
const count = result['count'] as string;
```

### 5. TS6133: Variable is declared but never read

**Error Pattern:**
```
TS6133: 'UserRole' is declared but its value is never read
```

**Root Cause:** Unused imports after refactoring

**Fix:**
```typescript
// ❌ WRONG
import { User, UserRole, Permission } from '../types';

// ✅ CORRECT
import { User, Permission } from '../types';
```

### 6. TS2769: No overload matches this call (JWT)

**Error Pattern:**
```
TS2769: No overload matches this call (jwt.sign)
```

**Root Cause:** JWT library type strictness

**Fix:**
```typescript
// ❌ WRONG
const token = jwt.sign(payload, secret, { expiresIn: config.jwt.expiresIn });

// ✅ CORRECT
const token = jwt.sign(payload, secret, { expiresIn: config.jwt.expiresIn as string });
```

### 7. TS2375: Type is not assignable with exactOptionalPropertyTypes

**Error Pattern:**
```
TS2375: Type 'string | undefined' is not assignable to type 'string'
```

**Root Cause:** Strict optional property handling

**Fix:**
```typescript
// ❌ WRONG
const user: User = {
  name: data.name, // might be undefined
  email: data.email
};

// ✅ CORRECT
const user: User = {
  name: data.name || '',
  email: data.email
};
```

### 8. TS2345: Argument of type 'string | undefined' is not assignable

**Error Pattern:**
```
TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'
```

**Root Cause:** Route parameters from Express can be undefined but services expect string

**Fix:**
```typescript
// ❌ WRONG
const { id } = req.params;
const result = await this.service.method(id, tenantId);

// ✅ CORRECT
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

### 9. TS2322: Type mismatch in API responses

**Error Pattern:**
```
TS2322: Type 'ApiResponse<FormTemplate>' is not assignable to type 'ApiResponse<Question>'
```

**Root Cause:** Method returns wrong type from service calls

**Fix:**
```typescript
// ❌ WRONG
if (!updateResult.success) {
  return updateResult; // Wrong type
}

// ✅ CORRECT
if (!updateResult.success) {
  return {
    success: false,
    error: updateResult.error
  };
}
```

### 10. TS2339: Property does not exist on interface

**Error Pattern:**
```
TS2339: Property 'template_data' does not exist on type 'FormTemplate'
```

**Root Cause:** Database field names don't match interface property names

**Fix:**
```typescript
// ❌ WRONG
const templateData = JSON.parse(template.template_data || '{}');
const questions = templateData.questions || [];

// ✅ CORRECT
const questions = template.questions || [];
```

### 11. TS2551: Property does not exist (typo in property name)

**Error Pattern:**
```
TS2551: Property 'type_id' does not exist on type 'FormTemplate'. Did you mean 'typeId'?
```

**Root Cause:** Using snake_case database field names instead of camelCase interface properties

**Fix:**
```typescript
// ❌ WRONG
sourceTemplate.type_id
sourceTemplate.created_by

// ✅ CORRECT
sourceTemplate.typeId
sourceTemplate.createdBy
```

### 12. TS2322: Dict<string | number> not assignable to Record<string, number>

**Error Pattern:**
```
TS2322: Type 'Dict<string | number>' is not assignable to type 'Record<string, number>'
```

**Root Cause:** Database query results with mixed types in reduce operations

**Fix:**
```typescript
// ❌ WRONG
const stats = results.reduce((acc, stat) => {
  acc[stat.key] = stat.count;
  return acc;
}, {});

// ✅ CORRECT
const stats: Record<string, number> = {};
for (const stat of results) {
  stats[stat.key] = parseInt(stat.count as string) || 0;
}
```

## Quick Diagnostic Commands

```bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint

# Full validation
npm run validate

# Build check
npm run build
```

## Emergency Fix Workflow

1. **Identify Error Code**: Look for TS#### in error message
2. **Find Pattern**: Match against this reference guide
3. **Apply Fix**: Use the provided solution pattern
4. **Validate**: Run `npm run type-check`
5. **Test**: Ensure functionality still works

## Prevention Checklist

- [ ] Use single export pattern in schema files
- [ ] Implement singleton pattern for database services
- [ ] Export all referenced types from types/index.ts
- [ ] Use bracket notation for database query results (`req.query['property']`)
- [ ] Remove unused imports immediately
- [ ] Add type assertions for external libraries
- [ ] Handle optional properties properly
- [ ] Validate route parameters before service calls
- [ ] Match interface property names (camelCase) not database fields (snake_case)
- [ ] Use explicit typing for complex reduce operations
- [ ] Make interface properties optional when validation schemas allow undefined
- [ ] Return correct types from service methods (don't pass through wrong types)
- [ ] Run validation before committing

## Common File Patterns

### Validation Schema File Template
```typescript
import { z } from 'zod';

// Schema definitions (no export)
const UserSchema = z.object({...});
const CreateUserSchema = UserSchema.omit({...});

// Single export block
export {
  UserSchema,
  CreateUserSchema
};
```

### Service Class Template
```typescript
import { Knex } from 'knex';
import { DatabaseService } from './database.service';

export class SomeService {
  private db: Knex;

  constructor() {
    this.db = DatabaseService.getInstance().getConnection();
  }
}
```

### Database Service Template
```typescript
export class DatabaseService {
  private static instance: DatabaseService;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  getConnection(): Knex {
    return db;
  }
}
```

### Controller Parameter Validation Template
```typescript
export class SomeController {
  someMethod = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, otherId } = req.params;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      // Validate authentication
      if (!tenantId || !userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      // Validate required parameters
      if (!id || !otherId) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARAMS', message: 'Required parameters missing' }
        });
        return;
      }

      // Parse query parameters with bracket notation
      const filters = {
        isActive: req.query['isActive'] === 'true' ? true : req.query['isActive'] === 'false' ? false : undefined,
        name: req.query['name'] as string
      };

      const result = await this.service.method(id, tenantId, filters);
      // ... handle result
    } catch (error) {
      // ... error handling
    }
  };
}
```

### Service Method Return Type Template
```typescript
export class SomeService {
  async createItem(data: CreateData): Promise<ApiResponse<Item>> {
    try {
      // ... business logic

      const updateResult = await this.otherService.update(data);
      
      // ✅ CORRECT: Don't return wrong type
      if (!updateResult.success) {
        return {
          success: false,
          error: updateResult.error
        };
      }

      // Return the correct type
      return {
        success: true,
        data: createdItem,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create item'
        }
      };
    }
  }
}
```

### Database Query Result Processing Template
```typescript
// ✅ CORRECT: Handle mixed types from database
async getStatistics(): Promise<ApiResponse<Record<string, number>>> {
  try {
    const results = await this.db('table')
      .select('category')
      .count('* as count')
      .groupBy('category');

    // Use explicit typing and for-loop for type safety
    const statistics: Record<string, number> = {};
    for (const result of results) {
      const category = result['category'] as string;
      if (category) {
        statistics[category] = parseInt(result['count'] as string) || 0;
      }
    }

    return {
      success: true,
      data: statistics,
      metadata: { timestamp: new Date() }
    };
  } catch (error) {
    // ... error handling
  }
}
```