# CHC Insight CRM Theming System

## Overview

The CHC Insight CRM theming system provides clean dark/light mode support using standard shadcn/ui theming driven by CSS custom properties in globals.css.

## Architecture

### Core Components

1. **ThemeProvider** (`/providers/theme-provider.tsx`)
   - Simple wrapper around next-themes
   - Provides theme toggle and status components
   - Includes basic theme utilities

2. **ThemeScript** (`/providers/theme-script.tsx`)
   - Prevents flash of unstyled content
   - Handles system theme detection
   - Applied before React hydration

3. **Global Styles** (`/app/globals.css`)
   - CSS custom properties for theming
   - Standard shadcn/ui color variables
   - Clean HSL-based color system

## Usage

### Basic Setup

The theme system is automatically configured in the root providers:

```tsx
// Already configured in /providers/index.tsx
import { ThemeProvider } from '@/components/providers/theme-provider'

export function Providers({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
```

### Theme Toggle

Use the built-in theme toggle component:

```tsx
import { ThemeToggle } from '@/providers/theme-provider'

export function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  )
}
```

### Theme Status

Display current theme information:

```tsx
import { ThemeStatus } from '@/providers/theme-provider'

export function Footer() {
  return (
    <footer>
      <ThemeStatus />
    </footer>
  )
}
```

### Using Theme in Components

```tsx
import { useTheme } from '@/providers/theme-provider'

export function MyComponent() {
  const { theme, setTheme, mounted } = useTheme()
  
  if (!mounted) {
    return <div>Loading...</div>
  }
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}
```

## Color System

### HSL Color Space

We use standard HSL color space with CSS custom properties defined in globals.css:

```css
/* Light theme */
:root {
  --primary: 222.2 47.4% 11.2%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

/* Dark theme */
.dark {
  --primary: 210 40% 98%;
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Using Colors in Components

Use Tailwind CSS classes that reference the CSS custom properties:

```tsx
// Primary colors
<div className="bg-primary text-primary-foreground">Primary</div>

// Secondary colors  
<div className="bg-secondary text-secondary-foreground">Secondary</div>

// Status colors using standard Tailwind
<div className="bg-green-500 text-white">Success</div>
<div className="bg-red-500 text-white">Error</div>
<div className="bg-yellow-500 text-black">Warning</div>
```

## Chart Theming

### Using Chart Colors

Use the chart color variables defined in globals.css:

```tsx
import { useTheme } from '@/providers/theme-provider'

export function MyChart() {
  const { theme } = useTheme()
  
  return (
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis className="text-muted-foreground" />
      <YAxis className="text-muted-foreground" />
      <Tooltip 
        contentStyle={{
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
        }}
      />
      <Area 
        stroke="hsl(var(--chart-1))" 
        fill="hsl(var(--chart-1))"
        fillOpacity={0.2}
      />
    </AreaChart>
  )
}
```

### Chart Color Variables

The following chart colors are available in both light and dark themes:

- `--chart-1` through `--chart-5` for data visualization
- Use with `hsl(var(--chart-1))` syntax

## Customizing Colors

### Adding Custom Colors

To add custom colors, update the CSS custom properties in globals.css:

```css
:root {
  /* Add your custom colors */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --error: 0 84% 60%;
}

.dark {
  /* Dark theme versions */
  --success: 142 71% 45%;
  --warning: 38 95% 56%;
  --error: 0 91% 71%;
}
```

Then extend your Tailwind config:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        error: 'hsl(var(--error))',
      }
    }
  }
}
```

## Accessibility Features

### FOUC Prevention

The ThemeScript prevents flash of unstyled content:

```tsx
// In layout.tsx
<head>
  <ThemeScript />
</head>
```

### System Theme Detection

Automatically detects and respects user's system theme preference:

```javascript
// Detects system preference
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
```

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- UI components: 3:1 minimum contrast ratio

### Reduced Motion Support

Respects user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Theme Storage

### Storage Key

Themes are stored with a unique key: `chc-insight-theme`

### Available Themes

- `light` - Light mode
- `dark` - Dark mode  
- `system` - Follow system preference (default)

## Best Practices

### Component Development

1. **Always check mounted state** before rendering theme-dependent content
2. **Use theme-aware colors** from the design system
3. **Test both themes** during development
4. **Provide loading states** for theme-dependent components

### Performance

1. **Use CSS custom properties** for dynamic theming
2. **Minimize layout shifts** with consistent sizing
3. **Optimize font loading** with proper display settings
4. **Use efficient selectors** and avoid deep nesting

### Testing

1. **Test theme switching** functionality
2. **Verify color contrast** in both themes
3. **Check FOUC prevention** on page load
4. **Test system theme detection**

## Troubleshooting

### Common Issues

1. **Hydration Mismatch**
   ```tsx
   // Solution: Check mounted state
   const { mounted } = useTheme()
   if (!mounted) return <LoadingState />
   ```

2. **Theme Not Persisting**
   ```tsx
   // Check storage key configuration
   <ThemeProvider storageKey="chc-insight-theme">
   ```

3. **Smooth Transitions Not Working**
   ```css
   /* Ensure theme-transition class is applied */
   .my-component {
     @apply theme-transition;
   }
   ```

### Debug Mode

Enable debug logging in development:

```tsx
<ThemeProvider enableSystem={true} forcedTheme={undefined}>
  {/* Your app */}
</ThemeProvider>
```

## Migration Guide

### From Basic next-themes

If migrating from basic next-themes setup:

1. Replace `ThemeProvider` import:
   ```tsx
   // Before
   import { ThemeProvider } from 'next-themes'
   
   // After
   import { ThemeProvider } from '@/components/providers/theme-provider'
   ```

2. Update theme hook:
   ```tsx
   // Before
   import { useTheme } from 'next-themes'
   
   // After
   import { useTheme } from '@/components/providers/theme-provider'
   ```

3. Add ThemeScript to layout:
   ```tsx
   import { ThemeScript } from '@/components/providers/theme-script'
   
   export default function Layout({ children }) {
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

## Examples

See the design system showcase for complete examples:
- `/components/examples/design-system/design-system-showcase.tsx`

This demonstrates all theming features including:
- Color palettes in both themes
- Chart theming
- Component variants
- Smooth transitions
- Accessibility features