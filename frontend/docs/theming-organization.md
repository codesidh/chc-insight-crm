# CHC Insight CRM Theming Organization

## Simple Theming Structure

The theming system uses a clean, globals.css-driven approach with standard shadcn/ui patterns:

### Core Theme Components

#### 1. Theme Provider (`/providers/theme-provider.tsx`)
**Simple theme management:**

- `ThemeProvider` - Basic wrapper around next-themes
- `useTheme` - Hook with mounted state
- `ThemeToggle` - Theme toggle button component
- `ThemeStatus` - Theme status indicator component

```tsx
// Single import for all theme functionality
import { 
  ThemeProvider, 
  useTheme, 
  ThemeToggle, 
  ThemeStatus 
} from '@/providers/theme-provider'
```

#### 2. Theme Script (`/providers/theme-script.tsx`)
**FOUC prevention:**

- Prevents flash of unstyled content
- Handles system theme detection
- Applied before React hydration

#### 3. Global Styles (`/app/globals.css`)
**CSS custom properties theming:**

- HSL color variables for both themes
- Standard shadcn/ui color system
- Clean, maintainable structure

## Usage Patterns

### 1. Application Setup
```tsx
// /providers/index.tsx
import { ThemeProvider } from '@/components/providers/theme-provider'

export function Providers({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
```

### 2. Layout Integration
```tsx
// /app/layout.tsx
import { ThemeScript } from '@/components/providers/theme-script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 3. Component Usage
```tsx
// Any component
import { ThemeToggle, useTheme } from '@/components/providers/theme-provider'

export function MyComponent() {
  const { theme, mounted } = useTheme()
  
  return (
    <div>
      <ThemeToggle />
      {mounted && <p>Current theme: {theme}</p>}
    </div>
  )
}
```

### 4. Chart Integration
```tsx
// Chart components
import { useTheme } from '@/providers/theme-provider'

export function MyChart() {
  const { theme } = useTheme()
  
  return (
    <AreaChart>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <Area stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" />
    </AreaChart>
  )
}
```

## Benefits of This Organization

### 1. Simplicity
- Clean CSS custom properties approach
- Standard shadcn/ui patterns
- Easy to understand and maintain

### 2. Performance
- Minimal JavaScript overhead
- CSS-driven theming
- Fast theme switching

### 3. Maintainability
- All colors defined in one place (globals.css)
- Standard Tailwind CSS classes
- No complex abstractions

### 4. Accessibility
- Proper contrast ratios
- System theme detection
- FOUC prevention

## File Structure

```
frontend/src/
├── providers/
│   ├── theme-provider.tsx        # ✅ Simple theme utilities
│   ├── theme-script.tsx          # ✅ FOUC prevention
│   └── index.tsx                 # ✅ Root providers
├── components/
│   ├── examples/
│   │   └── design-system/
│   │       └── design-system-showcase.tsx  # ✅ Demo component
│   └── layout/
│       └── site-header.tsx       # ✅ Uses ThemeToggle
├── app/
│   ├── globals.css               # ✅ CSS custom properties theming
│   └── layout.tsx                # ✅ Uses ThemeScript
├── config/
│   └── index.ts                  # ✅ Basic app config
└── docs/
    ├── theming.md                # ✅ Theming guide
    └── theming-organization.md   # ✅ This file
```

## Migration Benefits

### Before (Scattered)
- Multiple theme toggle implementations
- Inconsistent theme usage
- Duplicate theme providers
- Mixed import sources

### After (Centralized)
- Single theme provider with all utilities
- Consistent API across application
- No duplicate implementations
- Clear import paths

## Maintenance

### Adding New Theme Features
1. Add to `/providers/theme-provider.tsx`
2. Export from the same file
3. Update documentation
4. Test across all usage points

### Updating Colors
1. Modify CSS custom properties in `/app/globals.css`
2. Update Tailwind config if needed
3. Test in both light and dark modes
4. Verify accessibility compliance

### Chart Theme Updates
1. Update chart color variables in `/app/globals.css`
2. Test with existing chart components
3. Verify color contrast in both themes

This organization ensures maintainable, scalable theming that grows with the application while maintaining consistency and performance.