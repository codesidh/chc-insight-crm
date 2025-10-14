# Frontend Development Standards

## Technology Stack

### Core Framework
- **Framework**: Next.js 15 with App Router
- **Language**: React 19 with TypeScript (strict mode enabled)
- **UI Library**: shadcn/ui with modern oklch color system
- **Styling**: Tailwind CSS v4
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: TanStack Query v5 for server state and caching
- **Charts**: Recharts with shadcn chart components
- **Data Tables**: TanStack Table with shadcn table components
- **Icons**: Lucide React exclusively
- **Animation**: CSS transitions and transforms (Framer Motion optional)
- **Font**: Inter (Google Fonts)

### Development Tools
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Code Quality**: Strict TypeScript configuration with no implicit any
- **Type Coverage**: 100% type coverage required

## Project Structure

### Mandatory Frontend Structure
```
frontend/src/
├── app/                          # Next.js 15 App Router (pages and layouts)
│   ├── (auth)/                   # Route groups for authentication
│   ├── dashboard/                # Dashboard pages
│   ├── analytics/                # Analytics pages
│   ├── members/                  # Member management pages
│   ├── providers/                # Provider management pages
│   ├── surveys/                  # Survey management pages
│   ├── workflows/                # Workflow management pages
│   ├── reports/                  # Reporting pages
│   ├── settings/                 # Application settings
│   ├── examples/                 # Example/demo pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── loading.tsx               # Global loading UI
│   ├── error.tsx                 # Global error UI
│   ├── not-found.tsx             # 404 page
│   └── globals.css               # Global styles
├── components/                   # React components (UI only)
│   ├── ui/                       # shadcn/ui components (auto-generated)
│   ├── custom/                   # Custom reusable components
│   ├── layout/                   # Layout-specific components
│   ├── charts/                   # Chart components
│   ├── dashboard/                # Dashboard-specific components
│   ├── features/                 # Feature-specific components
│   ├── demo/                     # Demo components (temporary)
│   └── examples/                 # Example components (for documentation)
├── config/                       # Application configuration
│   ├── design-system.ts          # Design tokens and system config
│   ├── chart-themes.ts           # Chart theming configuration
│   └── index.ts                  # Configuration exports
├── providers/                    # React Context providers
│   ├── index.tsx                 # Root providers wrapper
│   ├── query-provider.tsx        # TanStack Query provider
│   ├── theme-provider.tsx        # Theme provider
│   └── theme-script.tsx          # Theme script for FOUC prevention
├── hooks/                        # Custom React hooks
│   ├── index.ts                  # Hook exports
│   ├── use-dashboard.ts          # Dashboard-specific hooks
│   ├── use-surveys.ts            # Survey-specific hooks
│   └── use-*.ts                  # Other custom hooks
├── lib/                          # Core utilities and clients
│   ├── utils.ts                  # General utilities (cn, etc.)
│   ├── api-client.ts             # API client configuration
│   ├── query-client.ts           # TanStack Query client
│   ├── validations/              # Zod validation schemas
│   └── *.ts                      # Other utility files
├── data/                         # Static data and mock data
│   ├── app/                      # Application data (production)
│   │   ├── dashboard_data.json   # Dashboard data
│   │   ├── surveys_data.json     # Survey data
│   │   └── *_data.json           # Other app data files
│   └── examples/                 # Example data (for demos)
│       ├── example_chart_data.json
│       └── example_*.json        # Other example data
└── types/                        # TypeScript type definitions
    └── index.ts                  # Global type exports
```

### Path Aliases
```typescript
// Configuration and design system
import { tokens, colors, theme } from '@/config'

// Components
import { Button } from '@/components/ui/button'
import { CustomCard } from '@/components/custom/custom-card'

// Hooks and utilities
import { useDashboard } from '@/hooks/use-dashboard'
import { cn } from '@/lib/utils'

// Data and types
import dashboardData from '@/data/app/dashboard_data.json'
import type { Survey } from '@/types'
```

## UI Component Standards

### MANDATORY: shadcn/ui First Approach
**CRITICAL**: All UI components must use shadcn/ui components, forms, and blocks first.

### 5-Step UI Component Workflow
**MANDATORY PROCESS** before creating any UI component:

1. **Search shadcn/ui Registry**
   ```bash
   mcp_shadcn_search_items_in_registries
   ```

2. **View Component Details**
   ```bash
   mcp_shadcn_view_items_in_registries
   ```

3. **Get Usage Examples**
   ```bash
   mcp_shadcn_get_item_examples_from_registries
   ```

4. **Install Component**
   ```bash
   mcp_shadcn_get_add_command_for_items
   # Then run: npx shadcn@latest add <component>
   ```

5. **Only If NO shadcn Component Exists**
   - Create custom component in `components/custom/`
   - Follow shadcn/ui patterns and styling
   - Use design system tokens

### Component Organization Rules

#### 1. **shadcn/ui Components (`components/ui/`)**
- **NEVER modify manually** - these are auto-generated
- Use `npx shadcn@latest add <component>` to add new components
- All UI components must come from shadcn/ui registry first

#### 2. **Custom Components (`components/custom/`)**
- Only create when NO shadcn/ui equivalent exists
- Must follow shadcn/ui patterns and styling
- Use Tailwind CSS classes only
- Export as named exports

#### 3. **Layout Components (`components/layout/`)**
- Navigation, headers, footers, sidebars
- Page layouts and wrappers
- Must be responsive and accessible

#### 4. **Feature Components (`components/features/`)**
- Business logic components
- Feature-specific UI components
- Organized by feature domain (surveys, members, etc.)

#### 5. **Chart Components (`components/charts/`)**
- Recharts-based chart components
- Use chart themes from `@/config/chart-themes`
- Must be responsive and accessible

#### 6. **Example Components (`components/examples/`)**
- Demo and showcase components
- Documentation examples
- **NEVER import into production code**

### UI Component Requirements

#### **Forms**
- Use React Hook Form with shadcn form components and Zod validation
- **useOptimistic** for optimistic UI updates in forms
- **useFormStatus** for pending states during server actions

#### **Data Display**
- Use shadcn table components with TanStack Table
- Charts: Use Recharts with shadcn chart components
- Blocks: Leverage shadcn blocks for complex UI patterns

#### **Styling**
- Follow shadcn design system with oklch color variables
- Use Tailwind CSS classes only
- Support light/dark themes

#### **Icons**
- Use Lucide React icons exclusively

#### **State Management**
- TanStack Query v5 for server state management and caching
- Zustand (optional) for global client state if needed (filters, UI preferences)

### shadcn/ui References
- **Dashboard**: `npx shadcn@latest add dashboard-01`
- **Login**: `npx shadcn@latest add login-01`
- **Signup**: `npx shadcn@latest add signup-01`
- **Navigation/Sidebar**: `npx shadcn@latest add sidebar-08`
- **OTP**: `npx shadcn@latest add otp-01`
- **Calendar**: `npx shadcn@latest add calendar-04`
- **Theming**: https://ui.shadcn.com/docs/theming
- **Dark mode**: https://ui.shadcn.com/docs/dark-mode/next
- **Charts**: https://ui.shadcn.com/charts
- **GitHub Reference**: https://github.com/shadcn-ui/ui
- **Survey Form Builder**: https://github.com/strlrd-29/shadcn-ui-form-builder

## Data Organization

### Application Data (`data/app/`)
**MANDATORY**: All hard-coded values for pages, components, and forms must come from data files.

- **Production data and configurations**
- **Named as**: `<feature>_data.json`
- **Used by**: Actual application components

### Example Data (`data/examples/`)
- **Demo and test data**
- **Named as**: `example_<type>_data.json`
- **Used only by**: Example components

### Data Import Pattern
```typescript
// Application data
import dashboardData from '@/data/app/dashboard_data.json'

// Example data
import exampleChartData from '@/data/examples/example_chart_data.json'
```

## Configuration System

### Design System (`config/design-system.ts`)
- Design tokens (colors, spacing, typography)
- Component size variants
- Animation presets
- Layout utilities

### Chart Themes (`config/chart-themes.ts`)
- Chart color palettes
- Chart configuration presets
- Theme utilities for light/dark mode

### Centralized Exports (`config/index.ts`)
```typescript
// Use centralized imports
import { tokens, colors, theme } from '@/config'

// Instead of individual imports
import { designTokens } from '@/config/design-system'
import { chartTheme } from '@/config/chart-themes'
```

## File Naming Conventions

### Components
- **File names**: kebab-case (`user-profile.tsx`)
- **Component names**: PascalCase (`UserProfile`)
- **Exports**: Named exports matching component name

### Hooks
- **File names**: `use-` prefix with kebab-case (`use-dashboard.ts`)
- **Hook names**: camelCase (`useDashboard`)

### Data Files
- **Application data**: snake_case with suffix (`dashboard_data.json`)
- **Example data**: `example_` prefix (`example_chart_data.json`)

### Utilities
- **File names**: kebab-case (`api-client.ts`)
- **Exports**: camelCase (`apiClient`)

## Import Order Standards

1. React and Next.js imports
2. Third-party libraries
3. Internal components (`@/components`)
4. Internal hooks (`@/hooks`)
5. Internal utilities (`@/lib`, `@/config`)
6. Internal types (`@/types`)
7. Data imports (`@/data`)
8. Relative imports (`./`, `../`)

## Styling Standards

### Design System Usage
```typescript
// Use config tokens
import { componentSizes, animations } from '@/config'

// Apply in components
<Button className={componentSizes.button.lg}>
```

### Tailwind CSS
- Use Tailwind utility classes exclusively
- Follow responsive design patterns
- Use CSS variables for theming

### Color System
- Use oklch color space for better accessibility
- Follow healthcare color semantics
- Support light/dark themes

## Enforcement Rules

### Mandatory Checks
- Always check shadcn/ui registry first
- Run TypeScript validation after changes
- Follow the 5-step UI workflow
- Use design system tokens

### Prohibited Actions
- Creating custom UI components without checking registry
- Modifying shadcn/ui components directly
- Using inline styles instead of Tailwind
- Importing example components in production
- Removing unused imports manually (use ESLint autofix)

### Violation Consequences
- If Kiro suggests custom components without checking registry first, user should remind: **"Check shadcn registry first"**
- If Kiro doesn't follow the 5-step workflow above, user should say: **"Follow the mandatory UI workflow"**

### Code Review Requirements
- Verify shadcn/ui registry was checked
- Confirm proper import paths
- Validate design system usage
- Check responsive design implementation

## Development Commands

### Frontend Development
```bash
npm run dev:frontend     # Start Next.js dev server (port 3000)
npm run build:frontend   # Build for production
npm run test:frontend    # Run frontend tests
npm run lint             # Lint all code
npm run lint:fix         # Fix linting issues
```

## Document Standards

- Move all `.md` files to `frontend/docs/` folder (except `.kiro/` folder contents)
- Use consistent documentation patterns
- Include code examples and usage patterns

This comprehensive standard ensures maintainable, scalable, and consistent UI development across the entire CHC Insight CRM application.