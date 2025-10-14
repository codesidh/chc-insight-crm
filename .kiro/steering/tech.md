# Technology Stack

## Architecture

Monorepo with npm workspaces containing frontend and backend applications.

## Frontend Stack

- **Framework**: Next.js 15 with App Router
- **Language**: React 19 with TypeScript (strict mode enabled)
- **UI Library**: shadcn/ui with modern oklch color system
- **Styling**: Tailwind CSS v4
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: TanStack Query for server state and caching
- **Router**: TanStack Router for type-safe navigation
- **Charts**: Recharts with shadcn chart components
- **Data Tables**: TanStack Table with shadcn table components
- **Icons**: Lucide React
- **Animation**: CSS transitions and transforms (Framer Motion optional)
- **Font**: Inter (Google Fonts)

## Backend Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript (strict mode enabled)
- **Database**: PostgreSQL with Knex.js
- **Cache**: Redis
- **Testing**: Jest

## Development Tools

- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Process Management**: Nodemon (dev), PM2 (production)
- **Containerization**: Docker

## Common Commands

### Root Level (runs both frontend and backend)
```bash
npm run dev              # Start development servers
npm run build            # Build both applications
npm run test             # Run all tests
npm run lint             # Lint all code
npm run lint:fix         # Fix linting issues
```

### Frontend Only
```bash
npm run dev:frontend     # Start Next.js dev server (port 3000)
npm run build:frontend   # Build for production
npm run test:frontend    # Run frontend tests
```

### Backend Only
```bash
npm run dev:backend      # Start Express dev server (port 3001)
npm run build:backend    # Compile TypeScript
npm run test:backend     # Run backend tests
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
```

## Path Aliases

Both frontend and backend use consistent path aliases:
- `@/*` - Root src directory
- `@/components/*` - UI components (frontend)
- `@/controllers/*` - Route controllers (backend)
- `@/lib/*` - Utilities and configurations
- `@/types/*` - TypeScript type definitions

## Frontend Component Standards

**MANDATORY**: All frontend components must use shadcn/ui components, forms, and blocks:
**Data**: Let the data (hard coded values) for all pages, components, forms come from src/data/app/<component>_data.json file (application data) or src/data/examples/<component>_data.json file (example components)
- **UI Components**: Use only shadcn/ui components (Button, Card, Dialog, etc.)
- **Forms**: Use React Hook Form with shadcn form components and Zod validation
    - **useOptimistic for optimistic UI updates in forms**
    - **useFormStatus for pending states during server actions**
- **Data Display**: Use shadcn table components with TanStack Table
- **Charts**: Use Recharts with shadcn chart components
- **Blocks**: Leverage shadcn blocks for complex UI patterns
- **Styling**: Follow shadcn design system with oklch color variables
- **Icons**: Use Lucide React icons exclusively
- **State Management**: For dashboard state
    - add: TanStack Query v5 - Server state management, caching for dashboard data 
    - Zustand (optional) - Global client state if needed (filters, UI preferences)
**CRITICAL: ALWAYS check shadcn/ui registry first using MCP tools before suggesting any UI components.**
**PROCESS: 1) Search registry 2) View component details 3) Get examples 4) Only then implement**
**References:**
    - Dashboard: npx shadcn@latest add dashboard-01
    - Login: npx shadcn@latest add login-01
    - Signup: npx shadcn@latest add signup-01
    - navigation or sidebar: npx shadcn@latest add sidebar-08
    - OTP: npx shadcn@latest add otp-01
    - Calendar: npx shadcn@latest add calendar-04
    - Themeing: https://ui.shadcn.com/docs/theming
    - Dark mode: https://ui.shadcn.com/docs/dark-mode/next
    - Charts:  
        -- Area: https://ui.shadcn.com/charts/area#charts
        -- Bar: https://ui.shadcn.com/charts/bar#charts
        -- Line: https://ui.shadcn.com/charts/line#charts
        -- Pie: https://ui.shadcn.com/charts/pie#charts
        -- Radar: https://ui.shadcn.com/charts/radar#charts
        -- Radial: https://ui.shadcn.com/charts/radial#charts
        -- Tooltips: https://ui.shadcn.com/charts/tooltip#charts
    - github code reference: https://github.com/shadcn-ui/ui  
    - Survey form builder code reference: https://github.com/strlrd-29/shadcn-ui-form-builder


**Never create custom UI components when shadcn equivalents exist.**
**Remove unused import**

## Rule Enforcement

**MANDATORY WORKFLOW for UI components:**
1. Use `mcp_shadcn_search_items_in_registries` to find components
2. Use `mcp_shadcn_view_items_in_registries` to see implementation details  
3. Use `mcp_shadcn_get_item_examples_from_registries` to get usage examples
4. Use `mcp_shadcn_get_add_command_for_items` to get install commands
5. Only if NO shadcn component exists, create custom component
6. Run typescript validations and build to eliminate errors.

**VIOLATION CONSEQUENCES:**
- If Kiro suggests custom components without checking registry first, user should remind: "Check shadcn registry first"
- If Kiro doesn't follow the 5-step workflow above, user should say: "Follow the mandatory UI workflow"

## Code Quality

- Strict TypeScript configuration with no implicit any
- ESLint + Prettier for consistent formatting
- Pre-commit hooks for validation
- 100% type coverage required

## Document Standards 

- Except for documents under .kiro folders move all other .md file to frontend/docs folder or backend/docs folder based on the implementation.