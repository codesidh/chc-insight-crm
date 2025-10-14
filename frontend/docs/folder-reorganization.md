# Folder Reorganization Guide

## Overview

This document outlines the recent reorganization of the frontend folder structure to improve maintainability and follow Next.js 15 best practices.

## Changes Made

### 1. Configuration Files Moved to `src/config/`

**Before:**
```
src/lib/
├── design-system.ts     # Design tokens and utilities
├── chart-themes.ts      # Chart theming configuration
└── utils.ts
```

**After:**
```
src/config/
├── design-system.ts     # Design tokens and utilities
├── chart-themes.ts      # Chart theming configuration
└── index.ts             # Configuration exports

src/lib/
├── utils.ts             # General utilities only
├── api-client.ts        # API client
├── query-client.ts      # TanStack Query client
└── validations/         # Zod schemas
```

### 2. Providers Consolidated to `src/providers/`

**Before:**
```
src/providers/
├── index.tsx            # Root providers wrapper
└── query-provider.tsx   # TanStack Query provider

src/components/providers/
├── theme-provider.tsx   # Theme provider
└── theme-script.tsx     # Theme script
```

**After:**
```
src/providers/
├── index.tsx            # Root providers wrapper
├── query-provider.tsx   # TanStack Query provider
├── theme-provider.tsx   # Theme provider
└── theme-script.tsx     # Theme script
```

### 3. Updated Import Paths

All imports have been updated to use the new paths:

```typescript
// Old imports (deprecated)
import { designTokens } from '@/lib/design-system'
import { chartTheme } from '@/lib/chart-themes'
import { ThemeProvider } from '@/components/providers/theme-provider'

// New imports
import { designTokens } from '@/config/design-system'
import { chartTheme } from '@/config/chart-themes'
import { ThemeProvider } from '@/providers/theme-provider'

// Or use the centralized config exports
import { tokens, colors, theme } from '@/config'
```

## Rationale

### Why Move Configuration to `src/config/`?

1. **Separation of Concerns**: Configuration files are distinct from utility functions
2. **Clarity**: Makes it clear what files contain configuration vs. business logic
3. **Scalability**: Easier to manage as the application grows
4. **Convention**: Follows common patterns in large React applications

### Why Consolidate Providers?

1. **Single Source of Truth**: All React providers in one location
2. **Easier Maintenance**: No need to look in multiple folders for providers
3. **Logical Grouping**: Providers are a specific type of React component
4. **Import Simplicity**: Cleaner import paths

## Migration Guide

If you have existing code that imports from the old locations:

### 1. Update Design System Imports

```typescript
// Replace this:
import { designTokens, chartColors } from '@/lib/design-system'

// With this:
import { designTokens, chartColors } from '@/config/design-system'

// Or use the centralized exports:
import { tokens, colors } from '@/config'
```

### 2. Update Chart Theme Imports

```typescript
// Replace this:
import { chartTheme, getChartColor } from '@/lib/chart-themes'

// With this:
import { chartTheme, getChartColor } from '@/config/chart-themes'

// Or use the centralized exports:
import { theme, getChartColor } from '@/config'
```

### 3. Update Provider Imports

```typescript
// Replace this:
import { ThemeProvider } from '@/components/providers/theme-provider'

// With this:
import { ThemeProvider } from '@/providers/theme-provider'
```

## Benefits

1. **Better Organization**: Clear separation between configuration, utilities, and components
2. **Improved Maintainability**: Easier to find and update configuration files
3. **Consistent Structure**: Follows established patterns in the React ecosystem
4. **Scalability**: Structure supports growth as the application expands
5. **Developer Experience**: Cleaner imports and logical file organization

## File Structure Summary

```
frontend/src/
├── config/                       # Application configuration
│   ├── design-system.ts         # Design tokens and utilities
│   ├── chart-themes.ts          # Chart theming configuration
│   └── index.ts                 # Configuration exports
├── lib/                         # Core utilities and clients
│   ├── utils.ts                 # General utilities
│   ├── api-client.ts           # API client
│   ├── query-client.ts         # TanStack Query client
│   └── validations/            # Zod schemas
├── providers/                   # All React providers
│   ├── index.tsx               # Root providers wrapper
│   ├── query-provider.tsx      # TanStack Query provider
│   ├── theme-provider.tsx      # Theme provider
│   └── theme-script.tsx        # Theme script
├── components/                  # React components only
│   ├── ui/                     # shadcn/ui components
│   ├── custom/                 # Custom reusable components
│   ├── layout/                 # Layout components
│   └── examples/               # Example/demo components
├── hooks/                       # Custom React hooks
├── types/                       # TypeScript definitions
└── data/                        # Static data files
```

## Next Steps

1. Update any remaining imports in your local branches
2. Use the new centralized config exports for cleaner imports
3. Follow this structure for new configuration files
4. Consider this pattern for other types of files (hooks, types, etc.)