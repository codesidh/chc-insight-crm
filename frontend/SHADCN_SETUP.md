# shadcn/ui Setup Documentation

## Overview

This document describes the shadcn/ui component library setup for the CHC Insight CRM frontend application.

## Configuration

### Components Configuration (`components.json`)

The project is configured with:
- **Style**: New York (modern, clean design)
- **RSC**: Enabled (React Server Components support)
- **TypeScript**: Enabled
- **CSS Variables**: Enabled for theming
- **Icon Library**: Lucide React
- **Base Color**: Neutral with oklch color system

### Color System

The application uses the modern **oklch color space** for better color consistency and accessibility:

#### Light Mode Colors
- Primary: `oklch(0.5 0.15 240)` - Healthcare blue
- Background: `oklch(1 0 0)` - Pure white
- Foreground: `oklch(0.145 0 0)` - Near black

#### Dark Mode Colors
- Primary: `oklch(0.6 0.15 240)` - Lighter healthcare blue
- Background: `oklch(0.145 0 0)` - Dark background
- Foreground: `oklch(0.985 0 0)` - Near white

#### Status Colors
- Success: `oklch(0.6 0.15 140)` - Green
- Warning: `oklch(0.7 0.15 60)` - Yellow
- Info: `oklch(0.6 0.15 220)` - Blue
- Destructive: `oklch(0.577 0.245 27.325)` - Red

## Installed Components

### Core Components
- **Button**: Various variants (default, secondary, outline, ghost, destructive)
- **Card**: Container component with header, content, and footer
- **Input**: Form input fields
- **Select**: Dropdown selection component
- **Dialog**: Modal dialogs
- **Table**: Data table components
- **Badge**: Status and priority indicators

### Component Usage

```tsx
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Badge,
} from '@/components/ui'

// Button examples
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button size="sm">Small</Button>

// Card example
<Card>
  <CardHeader>
    <CardTitle>Survey Details</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
</Card>

// Status badges
<Badge className="bg-success text-success-foreground">Completed</Badge>
<Badge className="priority-high">High Priority</Badge>
```

## Theme System

### Theme Provider
The application includes a theme provider that supports:
- Light mode
- Dark mode
- System preference detection
- Local storage persistence

### Theme Toggle
A theme toggle component is available for switching between light and dark modes.

### Custom CSS Classes

#### Status Utilities
- `.text-success`, `.bg-success`
- `.text-warning`, `.bg-warning`
- `.text-info`, `.bg-info`

#### Healthcare-Specific Classes
- `.survey-card` - Styled card for survey items
- `.status-badge` - Base styling for status indicators
- `.priority-high`, `.priority-medium`, `.priority-low` - Priority styling

## File Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   └── index.ts          # Centralized exports
│   ├── theme-provider.tsx     # Theme context provider
│   ├── theme-toggle.tsx       # Theme switching component
│   └── ui-demo.tsx           # Component demonstration
├── lib/
│   └── utils.ts              # Utility functions (cn helper)
├── types/
│   └── index.ts              # TypeScript type definitions
└── app/
    ├── globals.css           # Global styles with CSS variables
    └── layout.tsx            # Root layout with theme provider
```

## Adding New Components

To add additional shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add form checkbox radio-group
```

## Customization

### Modifying Colors
Update CSS variables in `src/app/globals.css`:

```css
:root {
  --primary: oklch(0.5 0.15 240); /* Your custom primary color */
}
```

### Adding Custom Variants
Extend component variants in the respective component files:

```tsx
const buttonVariants = cva(
  // base classes
  {
    variants: {
      variant: {
        // existing variants...
        healthcare: "bg-blue-600 text-white hover:bg-blue-700",
      },
    },
  }
)
```

## Best Practices

1. **Use the `cn` utility** for combining classes
2. **Leverage CSS variables** for consistent theming
3. **Follow the component composition pattern** for complex UIs
4. **Use TypeScript** for type safety
5. **Test components in both light and dark modes**

## Integration with Next.js 14

The setup is optimized for Next.js 14 with:
- App Router support
- Server Components compatibility
- Proper hydration handling
- TypeScript integration

## Accessibility

All components include:
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast support in both themes