# Project Structure

## Monorepo Organization

```
chc-insight-crm/
├── frontend/                 # Next.js application (see frontend-standards.md)
├── backend/                  # Express.js API
├── .kiro/                    # Kiro specifications and steering
├── node_modules/             # Root dependencies
└── package.json              # Workspace configuration
```

**Note**: Frontend structure is detailed in `frontend-standards.md`

## Backend Structure (`backend/`)

```
backend/
├── src/
│   ├── controllers/          # Route controllers
│   ├── services/             # Business logic
│   ├── models/               # Database models
│   ├── middleware/           # Express middleware
│   ├── routes/               # API route definitions
│   ├── utils/                # Utility functions
│   ├── config/               # Configuration files
│   │   └── knexfile.ts       # Database configuration
│   ├── types/                # TypeScript definitions
│   └── index.ts              # Application entry point
├── migrations/               # Database migrations
├── seeds/                    # Database seed files
├── dist/                     # Compiled JavaScript (build output)
├── Dockerfile                # Container configuration
├── docker-compose.yml        # Local development setup
└── tsconfig.json             # TypeScript configuration
```

## Backend Naming Conventions

### Files and Directories
- **kebab-case** for directories: `user-management/`
- **camelCase** for utilities and services: `userService.ts`
- **lowercase** for configuration files: `knexfile.ts`

### Code Conventions
- **PascalCase** for TypeScript interfaces and classes
- **camelCase** for functions, variables, and methods
- **SCREAMING_SNAKE_CASE** for constants and environment variables

## Backend Structure
- Controllers handle HTTP requests/responses only
- Services contain business logic
- Models define data structures and database interactions
- Middleware handles cross-cutting concerns (auth, logging, etc.)

## Configuration Files

- Environment variables in `.env` files (never commit secrets)
- TypeScript configuration shared between workspaces
- ESLint and Prettier configurations at workspace level
- Database configuration in `backend/src/config/knexfile.ts`