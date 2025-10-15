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
- **Form Builder Reference**: https://github.com/hasanharman/form-builder.git (Primary reference for MVP implementation)

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

## Bundle Optimization Standards

### CRITICAL: Performance Targets
**MANDATORY**: All routes must meet these bundle size requirements:

- **Optimal**: < 150 kB First Load JS
- **Good**: < 200 kB First Load JS  
- **Acceptable**: 200-300 kB First Load JS
- **PROHIBITED**: > 300 kB First Load JS

### Heavy Component Management

#### Dynamic Import Requirements
**MANDATORY**: Components with these dependencies MUST use dynamic imports:

```typescript
// Heavy libraries requiring dynamic imports:
// - @dnd-kit/* (drag-and-drop) ~55 kB
// - @tanstack/react-table ~45 kB  
// - recharts ~85 kB
// - Any component bundle > 20 kB

// ✅ CORRECT: Dynamic import pattern
const AdvancedDataTable = dynamic(
  () => import('./advanced-data-table').then(mod => ({ default: mod.AdvancedDataTable })),
  {
    loading: () => <TableSkeleton />,
    ssr: false, // Disable SSR for heavy components
  }
)

// ❌ WRONG: Direct import of heavy components
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
```

#### Loading Skeleton Requirements
**MANDATORY**: All dynamic imports MUST include loading skeletons:

```typescript
// Required skeleton components:
import { TableSkeleton } from '@/components/ui/loading-skeleton'    // For data tables
import { ChartSkeleton } from '@/components/ui/loading-skeleton'    // For charts  
import { FormSkeleton } from '@/components/ui/loading-skeleton'     // For forms
import { ExamplesSkeleton } from '@/components/ui/loading-skeleton' // For examples
```

### Barrel Export Restrictions

#### PROHIBITED Heavy Component Exports
**CRITICAL**: These components MUST NOT be included in barrel exports (`@/components/ui/index.ts`):

```typescript
// ❌ PROHIBITED in barrel exports:
// export { AdvancedDataTable } from './advanced-data-table'  // ~100 kB with deps
// export { ChartContainer } from './chart'                   // ~85 kB with recharts
// export { DragDropProvider } from './drag-drop'             // ~55 kB with @dnd-kit

// ✅ CORRECT: Direct imports only
// Import directly: import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
```

#### Safe Barrel Exports
**ALLOWED**: Only lightweight components (< 5 kB) in barrel exports:

```typescript
// ✅ SAFE for barrel exports:
export { Button } from './button'           // ~2 kB
export { Input } from './input'             // ~1 kB  
export { Card } from './card'               // ~3 kB
export { Badge } from './badge'             // ~1 kB
```

### Bundle Analysis Requirements

#### Pre-Commit Validation
**MANDATORY**: Run before every commit:

```bash
npm run build                    # Check bundle sizes
npm run analyze                  # Generate bundle report (if sizes increase)
```

#### Bundle Size Monitoring
**MANDATORY**: Monitor these metrics:

```bash
# Bundle analysis commands
npm run analyze                  # Full bundle analysis with visual reports
npm run bundle-report           # Generate detailed bundle breakdown
npm run build                   # Check current First Load JS sizes

# Performance targets per route:
# - Core routes (dashboard, analytics): < 170 kB ✅
# - Feature routes (surveys, members): < 200 kB ✅  
# - Example routes: < 210 kB ✅
# - Settings/admin routes: < 250 kB ✅
```

### Webpack Configuration Standards

#### Required Bundle Splitting
**MANDATORY**: Heavy libraries MUST be split into separate chunks:

```typescript
// next.config.ts - Required configuration
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.optimization.splitChunks = {
      cacheGroups: {
        // MANDATORY: Separate chunk for drag-and-drop
        dndkit: {
          test: /[\\/]node_modules[\\/]@dnd-kit[\\/]/,
          name: 'dnd-kit',
          chunks: 'all',
          priority: 30,
        },
        // MANDATORY: Separate chunk for table library  
        reactTable: {
          test: /[\\/]node_modules[\\/]@tanstack[\\/]react-table[\\/]/,
          name: 'react-table', 
          chunks: 'all',
          priority: 30,
        },
        // MANDATORY: Separate chunk for charts
        recharts: {
          test: /[\\/]node_modules[\\/]recharts[\\/]/,
          name: 'recharts',
          chunks: 'all', 
          priority: 30,
        },
      },
    };
  }
  return config;
}
```

### Component Creation Guidelines

#### Bundle Impact Assessment
**MANDATORY**: Before creating components, assess bundle impact:

1. **Lightweight Components** (< 5 kB): Create normally
2. **Medium Components** (5-20 kB): Consider lazy loading
3. **Heavy Components** (> 20 kB): MUST use dynamic imports
4. **Critical Path Components**: Keep under 10 kB

#### Heavy Dependency Alternatives
**RECOMMENDED**: Use lighter alternatives when possible:

```typescript
// Heavy dependencies to avoid in critical paths:
// - @dnd-kit/* → Consider native HTML5 drag-and-drop for simple cases
// - recharts → Consider native SVG for simple charts
// - @tanstack/react-table → Consider native HTML tables for simple data

// ✅ PREFERRED: Lightweight alternatives for non-critical features
// ❌ AVOID: Heavy libraries in core user flows
```

## Enforcement Rules

### Mandatory Checks
- Always check shadcn/ui registry first
- Run TypeScript validation after changes
- Follow the 5-step UI workflow
- Use design system tokens
- **NEW**: Verify bundle size impact before adding heavy components
- **NEW**: Run `npm run build` to check First Load JS sizes
- **NEW**: Use dynamic imports for components > 20 kB

### Prohibited Actions
- Creating custom UI components without checking registry
- Modifying shadcn/ui components directly
- Using inline styles instead of Tailwind
- Importing example components in production
- Removing unused imports manually (use ESLint autofix)
- **NEW**: Adding heavy components to barrel exports
- **NEW**: Direct imports of @dnd-kit, @tanstack/react-table, or recharts in critical paths
- **NEW**: Creating routes with > 300 kB First Load JS
- **NEW**: Skipping loading skeletons for dynamic imports

### Violation Consequences
- If Kiro suggests custom components without checking registry first, user should remind: **"Check shadcn registry first"**
- If Kiro doesn't follow the 5-step workflow above, user should say: **"Follow the mandatory UI workflow"**
- **NEW**: If Kiro suggests heavy component imports without dynamic loading, user should say: **"Use dynamic imports for heavy components"**
- **NEW**: If bundle sizes exceed targets, user should say: **"Check bundle optimization guidelines"**

### Code Review Requirements
- Verify shadcn/ui registry was checked
- Confirm proper import paths
- Validate design system usage
- Check responsive design implementation
- **NEW**: Verify heavy components use dynamic imports
- **NEW**: Confirm loading skeletons are implemented
- **NEW**: Check that bundle size targets are met
- **NEW**: Validate no heavy components in barrel exports

## Dependency Management Standards

### Bundle Impact Assessment
**MANDATORY**: Before adding any new dependency, assess its impact:

```bash
# Check dependency size before installing
npm info <package-name> | grep unpacked
npx bundlephobia <package-name>

# After installation, verify bundle impact
npm run build
npm run analyze  # If First Load JS increases significantly
```

### Dependency Categories

#### ✅ APPROVED: Lightweight Dependencies (< 10 kB)
- `clsx`, `tailwind-merge` - Utility libraries
- `zod` - Validation (tree-shakeable)
- `lucide-react` - Icons (tree-shakeable)
- `date-fns` - Date utilities (tree-shakeable)

#### ⚠️ CONDITIONAL: Medium Dependencies (10-50 kB)
- `@radix-ui/*` - UI primitives (use selectively)
- `react-hook-form` - Forms (acceptable for form-heavy routes)
- `@tanstack/react-query` - State management (core dependency)

#### 🚨 RESTRICTED: Heavy Dependencies (> 50 kB)
- `@dnd-kit/*` - Drag and drop (MUST use dynamic imports)
- `@tanstack/react-table` - Data tables (MUST use dynamic imports)
- `recharts` - Charts (MUST use dynamic imports)
- `framer-motion` - Animations (avoid unless critical)

#### ❌ PROHIBITED: Extremely Heavy Dependencies (> 100 kB)
- `lodash` - Use native JS or lightweight alternatives
- `moment.js` - Use `date-fns` instead
- `antd`, `material-ui` - Use shadcn/ui instead
- `three.js` - Avoid unless absolutely necessary

### Tree Shaking Requirements
**MANDATORY**: Ensure all dependencies support tree shaking:

```typescript
// ✅ CORRECT: Tree-shakeable imports
import { format } from 'date-fns'
import { Calendar } from 'lucide-react'
import { z } from 'zod'

// ❌ WRONG: Full library imports
import * as dateFns from 'date-fns'
import * as LucideIcons from 'lucide-react'
import lodash from 'lodash'
```

## Performance Monitoring Standards

### Build-Time Monitoring
**MANDATORY**: Monitor these metrics in CI/CD:

```bash
# Bundle size regression detection
npm run build
# Fail build if any route exceeds:
# - 200 kB for core routes
# - 250 kB for feature routes  
# - 300 kB for any route (hard limit)
```

### Development Monitoring
**MANDATORY**: Use these tools during development:

```typescript
// Performance monitoring in development
import { logPerformanceMetrics } from '@/lib/performance'

// In layout.tsx or _app.tsx
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    logPerformanceMetrics()
  }
}, [])
```

### Production Monitoring
**RECOMMENDED**: Track these metrics in production:

- First Load JS per route
- Core Web Vitals (LCP, FID, CLS)
- Bundle cache hit rates
- Route-level performance metrics

## Development Commands

### Frontend Development
```bash
npm run dev:frontend     # Start Next.js dev server (port 3000)
npm run build:frontend   # Build for production
npm run test:frontend    # Run frontend tests
npm run lint             # Lint all code
npm run lint:fix         # Fix linting issues
```

### Bundle Analysis Commands
```bash
npm run build            # Check current bundle sizes
npm run analyze          # Generate visual bundle analysis
npm run bundle-report    # Detailed bundle breakdown
npm run analyze:server   # Server bundle analysis
npm run analyze:browser  # Browser bundle analysis
```

## Document Standards

- Move all `.md` files to `frontend/docs/` folder (except `.kiro/` folder contents)
- Use consistent documentation patterns
- Include code examples and usage patterns
- Document bundle optimization decisions and performance impacts

## Bundle Optimization Success Metrics

### Achieved Performance Targets ✅
- `/examples`: 361 kB → 205 kB (43% reduction)
- `/examples/advanced-table`: 325 kB → 113 kB (65% reduction)  
- `/settings`: 357 kB → 168 kB (53% reduction)
- **Total savings**: 557 kB across problematic routes

### Maintenance Guidelines
1. **Monthly Bundle Audits**: Review bundle sizes and identify growth
2. **Dependency Impact Assessment**: Evaluate new dependencies before adding
3. **Performance Regression Testing**: Monitor bundle sizes in CI/CD
4. **Dynamic Import Compliance**: Ensure heavy components use lazy loading

### Emergency Bundle Bloat Response
If any route exceeds performance targets:

1. **Immediate**: Run `npm run analyze` to identify heavy chunks
2. **Assess**: Check for new heavy dependencies or barrel export violations
3. **Optimize**: Implement dynamic imports for heavy components
4. **Validate**: Confirm bundle sizes return to acceptable ranges
5. **Document**: Update this guide with lessons learned

This comprehensive standard ensures maintainable, scalable, consistent UI development, and optimal performance across the entire CHC Insight CRM application.