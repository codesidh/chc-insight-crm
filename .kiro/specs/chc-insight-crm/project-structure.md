# CHC Insight CRM - Project Structure Documentation

## Overview
This document outlines the project structure, dependency management strategy, and implementation guidelines for the CHC Insight CRM application.

## Project Architecture

### Monorepo Structure
```
chc-insight-crm/
├── package.json                 # Root workspace configuration
├── package-lock.json           # Single lock file for entire project
├── node_modules/               # Shared dependencies (hoisted)
├── frontend/
│   ├── package.json           # Frontend-specific dependencies
│   ├── node_modules/          # Frontend-specific dependencies (when needed)
│   └── src/                   # Frontend source code
├── backend/
│   ├── package.json           # Backend-specific dependencies
│   ├── node_modules/          # Backend-specific dependencies (when needed)
│   └── src/                   # Backend source code
└── .kiro/
    └── specs/
        └── chc-insight-crm/
            ├── tasks.md
            └── project-structure.md (this file)
```

## Dependency Management Strategy

### NPM Workspaces Configuration ✅
- **Root package.json** defines workspaces: `["frontend", "backend"]`
- **Dependency Hoisting**: Common dependencies automatically hoisted to root `node_modules`
- **Single Lock File**: Only `package-lock.json` at root level
- **Workspace-Specific Dependencies**: Each workspace has its own `node_modules` for unique dependencies
- **Shared Dependencies**: TypeScript, ESLint, testing tools shared across workspaces (marked as `deduped`)

### Actual Dependency Distribution
```
Root node_modules/ (shared dependencies):
├── concurrently@8.2.2          # Workspace management
├── rimraf@5.0.10               # Shared build tool
├── eslint@8.57.1               # Shared across both workspaces
├── @types/node@20.19.21        # Shared type definitions
└── ... (other shared deps)

Backend node_modules/ (backend-specific):
├── express@4.21.2              # Backend framework
├── pg@8.16.3                   # PostgreSQL driver
├── knex@3.1.0                  # Database query builder
├── redis@4.7.1                 # Cache client
├── typescript@5.5.4            # Backend-specific TS version
└── ... (other backend deps)

Frontend node_modules/ (frontend-specific):
├── next@14.2.33                # Next.js framework
├── react@18.3.1                # React library
├── react-dom@18.3.1            # React DOM
├── typescript@5.9.3            # Frontend-specific TS version
└── ... (other frontend deps)
```

### Benefits of Current Structure
1. **Smart Deduplication**: npm automatically hoists shared dependencies to root
2. **Faster Installs**: Single `npm install` command installs everything optimally
3. **Version Flexibility**: Workspaces can use different versions when needed (e.g., TypeScript)
4. **Simplified CI/CD**: One dependency installation step
5. **Optimal Storage**: Shared deps in root, unique deps in workspace-specific node_modules
6. **Dependency Isolation**: Each workspace maintains its specific requirements

## Technology Stack

### Frontend (@chc-insight/frontend)
- **Framework**: Next.js 14.x
- **Runtime**: React 18.x
- **Language**: TypeScript 5.x
- **Testing**: Vitest
- **Linting**: ESLint with Next.js config

### Backend (@chc-insight/backend)
- **Framework**: Express.js 4.x
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL with Knex.js
- **Cache**: Redis
- **Testing**: Jest
- **Development**: Nodemon with ts-node

### Shared Development Tools
- **Package Manager**: npm (workspaces)
- **Process Manager**: concurrently
- **Code Formatting**: Prettier
- **Linting**: ESLint + TypeScript ESLint
- **Build Tool**: TypeScript compiler

## Scripts Organization

### Root Level Scripts
```json
{
  "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
  "build": "npm run build --workspaces",
  "test": "npm run test --workspaces",
  "lint": "npm run lint --workspaces"
}
```

### Workspace-Specific Scripts
- **Frontend**: Next.js development, build, and testing
- **Backend**: Express server, database migrations, API testing

## Implementation Guidelines

### DO ✅
- Keep single `package.json` at root with workspaces configuration
- Maintain single `package-lock.json` at root level
- Use workspace-specific `package.json` for defining dependencies
- Run `npm install` only from root directory
- Use workspace scripts: `npm run dev --workspace=frontend`
- Allow npm to automatically manage `node_modules` structure (hoisting + workspace-specific)
- Trust npm's dependency resolution and deduplication

### DON'T ❌
- Create individual `package-lock.json` files in workspaces
- Run `npm install` inside workspace directories (use root-level install)
- Manually manage dependency hoisting (let npm handle it automatically)
- Force all dependencies into root (npm will optimize placement automatically)

### Commands Reference
```bash
# Install all dependencies
npm install

# Development (both frontend & backend)
npm run dev

# Build all workspaces
npm run build

# Test all workspaces
npm run test

# Workspace-specific commands
npm run dev --workspace=frontend
npm run dev --workspace=backend
npm run build --workspace=frontend
npm run build --workspace=backend
```

## Database Configuration

### Backend Database Setup
- **Primary DB**: PostgreSQL
- **Migration Tool**: Knex.js
- **Cache Layer**: Redis
- **Environment Configs**: Development, Test, Staging, Production

### Migration Commands
```bash
npm run db:migrate --workspace=backend
npm run db:seed --workspace=backend
npm run db:reset --workspace=backend
```

## Development Workflow

### Local Development
1. Clone repository
2. Run `npm install` from root
3. Set up environment variables in backend
4. Run `npm run dev` to start both services
5. Frontend: http://localhost:3000
6. Backend: http://localhost:3001

### Testing Strategy
- **Frontend**: Vitest for component and integration tests
- **Backend**: Jest for unit and integration tests
- **Coverage**: Both workspaces configured for coverage reports

## Build & Deployment

### Production Build
```bash
npm run build                    # Build all workspaces
npm run build:frontend          # Frontend only
npm run build:backend           # Backend only
```

### Docker Support
- Backend includes Docker configuration
- Containerized deployment ready

## Security & Quality

### Code Quality Tools
- **ESLint**: Consistent code style
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Husky**: Git hooks (if configured)

### Security Measures
- **Helmet**: Security headers (backend)
- **CORS**: Cross-origin configuration
- **Environment Variables**: Secure config management
- **Audit**: Regular dependency security checks

## Why Multiple node_modules Directories?

### This is Normal and Optimal ✅
The presence of `node_modules` in both root and workspace directories is **not a problem** - it's the **industry standard** for monorepos:

1. **Automatic Optimization**: npm automatically decides where to place each dependency
2. **Shared Dependencies**: Common packages are hoisted to root (marked as `deduped`)
3. **Version Conflicts**: Different versions are kept in workspace-specific directories
4. **Framework Requirements**: Some tools require dependencies in specific locations

### Examples from Our Project:
- `eslint@8.57.1` → Shared in root (used by both workspaces)
- `@types/node@20.19.21` → Shared in root (marked as `deduped`)
- `typescript@5.5.4` → Backend-specific (different from frontend's 5.9.3)
- `express@4.21.2` → Backend-only (not needed by frontend)
- `next@14.2.33` → Frontend-only (not needed by backend)

### Industry Usage:
- **React** (Facebook) uses this structure
- **Babel** uses this structure
- **Jest** uses this structure
- **Angular** uses this structure
- **Most enterprise applications** use this structure

**Recommendation**: Keep the current structure - it's optimized and working correctly!

## Future Considerations

### Scalability
- Workspace structure supports additional packages (shared, utils, etc.)
- Database migrations support multiple environments
- Docker-ready for containerized deployment

### Monitoring & Logging
- Structured logging framework ready
- Health check endpoints configured
- Performance monitoring hooks available

---

**Last Updated**: October 2025
**Maintained By**: CHC Development Team
**Version**: 1.1.0