# Project Structure

## Monorepo Organization

```
chc-insight-crm/
├── frontend/                 # Next.js application
├── backend/                  # Express.js API
├── .kiro/                    # Kiro specifications and steering
├── node_modules/             # Root dependencies
└── package.json              # Workspace configuration
```

## Frontend Structure (`frontend/`)

```
frontend/
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── globals.css       # Global styles
│   │   └── (routes)/         # Route groups
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── custom/           # Custom components
│   ├── lib/                  # Utilities and configurations
│   │   ├── utils.ts          # Utility functions
│   │   └── config.ts         # App configuration
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript definitions
│   └── providers/            # Context providers
├── public/                   # Static assets
├── components.json           # shadcn/ui configuration
├── next.config.ts            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

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

## Naming Conventions

### Files and Directories
- **kebab-case** for directories: `user-management/`
- **PascalCase** for React components: `UserProfile.tsx`
- **camelCase** for utilities and services: `userService.ts`
- **lowercase** for configuration files: `next.config.ts`

### Code Conventions
- **PascalCase** for React components and TypeScript interfaces
- **camelCase** for functions, variables, and methods
- **SCREAMING_SNAKE_CASE** for constants and environment variables
- **kebab-case** for CSS classes and HTML attributes

## Import Organization

1. External libraries (React, Next.js, etc.)
2. Internal utilities and configurations (`@/lib`, `@/config`)
3. Components (`@/components`)
4. Types (`@/types`)
5. Relative imports (`./`, `../`)

## Component Structure

### Frontend Components
- Place reusable UI components in `components/ui/`
- Place business logic components in `components/custom/`
- Use shadcn/ui patterns for consistent styling
- Export components as named exports

### Backend Structure
- Controllers handle HTTP requests/responses only
- Services contain business logic
- Models define data structures and database interactions
- Middleware handles cross-cutting concerns (auth, logging, etc.)

## Configuration Files

- Environment variables in `.env` files (never commit secrets)
- TypeScript configuration shared between workspaces
- ESLint and Prettier configurations at workspace level
- Database configuration in `backend/src/config/knexfile.ts`