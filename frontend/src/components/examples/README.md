# shadcn/ui Component Examples for CHC Insight CRM

This directory contains comprehensive examples of how to use shadcn/ui components with Recharts integration, command palettes, form validation, and navigation components for the CHC Insight CRM application.

## 📊 Chart Components with Recharts Integration

### Available Chart Examples

- **ComplianceAreaChart**: Stacked area chart showing survey completion trends
- **SurveyTypePieChart**: Pie chart displaying survey type distribution
- **ProductivityBarChart**: Bar chart for staff productivity metrics
- **ComplianceLineChart**: Line chart for completion rate trends
- **DashboardChartsExample**: Complete dashboard layout with multiple charts

### Features

- ✅ Full Recharts integration with shadcn/ui chart components
- ✅ Responsive design with proper aspect ratios
- ✅ Custom color themes using CSS variables
- ✅ Interactive tooltips and legends
- ✅ Accessibility-compliant chart components
- ✅ TypeScript support with proper type definitions

### Usage

```tsx
import { ComplianceAreaChart, DashboardChartsExample } from '@/components/examples'

// Single chart
<ComplianceAreaChart />

// Complete dashboard
<DashboardChartsExample />
```

## 🔍 Command Components for Search Interfaces

### Available Command Examples

- **GlobalCommandPalette**: Application-wide command palette (⌘K)
- **MemberSearchCommand**: Type-ahead member search
- **ProviderSearchCommand**: Provider lookup with NPI and specialty
- **SurveySearchCommand**: Survey template search
- **WorkQueueFilterCommand**: Advanced filtering interface

### Features

- ✅ Keyboard shortcuts and navigation
- ✅ Type-ahead search with debouncing
- ✅ Grouped results with proper categorization
- ✅ Badge indicators for status and counts
- ✅ Accessible keyboard navigation
- ✅ Custom search result formatting

### Usage

```tsx
import { GlobalCommandPalette, MemberSearchCommand } from '@/components/examples'

// Global command palette
<GlobalCommandPalette />

// Member search with callback
<MemberSearchCommand onSelect={(member) => console.log(member)} />
```

## 📝 Form Components with Validation

### Available Form Examples

- **SurveyTemplateForm**: Complex survey template creation with business rules
- **MemberAssessmentForm**: Comprehensive member assessment with file uploads

### Features

- ✅ React Hook Form integration with Zod validation
- ✅ Real-time validation with proper error display
- ✅ File upload with drag-and-drop support
- ✅ Date pickers with calendar integration
- ✅ Switch toggles for boolean settings
- ✅ Progress indicators for form submission
- ✅ Checkbox groups and radio button groups
- ✅ Select dropdowns with proper styling

### Validation Features

- ✅ Required field validation
- ✅ String length validation
- ✅ Number range validation
- ✅ Date validation with constraints
- ✅ File type and size validation
- ✅ Custom business rule validation

### Usage

```tsx
import { SurveyTemplateForm, MemberAssessmentForm } from '@/components/examples'

// Survey template creation
<SurveyTemplateForm />

// Member assessment
<MemberAssessmentForm />
```

## 🧭 Navigation Components

### Available Navigation Examples

- **SurveyBreadcrumbExample**: Hierarchical navigation for survey management
- **MemberBreadcrumbExample**: Member profile navigation with ellipsis
- **WorkQueuePaginationExample**: Advanced pagination with page size controls
- **SurveyDetailTabsExample**: Tabbed interface for survey details
- **DashboardTabsExample**: Dashboard tabs with badge indicators
- **NavigationShowcase**: Complete navigation component demonstration

### Features

- ✅ Breadcrumb navigation with icons and separators
- ✅ Advanced pagination with ellipsis and page size controls
- ✅ Tabbed interfaces with badge indicators
- ✅ Responsive design for mobile and desktop
- ✅ Keyboard navigation support
- ✅ Proper ARIA labels for accessibility

### Usage

```tsx
import { 
  SurveyBreadcrumbExample, 
  WorkQueuePaginationExample,
  SurveyDetailTabsExample 
} from '@/components/examples'

// Breadcrumb navigation
<SurveyBreadcrumbExample />

// Pagination
<WorkQueuePaginationExample />

// Tabbed interface
<SurveyDetailTabsExample />
```

## 🎨 Design System Integration

### Color System

All components use the modern oklch color system with CSS variables:

```css
/* Chart colors */
--chart-1: 220 70% 50%
--chart-2: 160 60% 45%
--chart-3: 30 80% 55%
--chart-4: 280 65% 60%
--chart-5: 340 75% 55%
```

### Typography

Components follow the shadcn/ui typography scale:

- **Headings**: `text-lg font-semibold`, `text-base font-medium`
- **Body**: `text-sm`, `text-xs text-muted-foreground`
- **Labels**: `text-sm font-medium`

### Spacing

Consistent spacing using Tailwind CSS:

- **Component spacing**: `space-y-4`, `space-y-6`
- **Grid gaps**: `gap-4`, `gap-6`
- **Padding**: `p-4`, `px-3 py-2`

## 🔧 Technical Implementation

### Dependencies

All examples use the following key dependencies:

```json
{
  "react-hook-form": "^7.65.0",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.1.12",
  "recharts": "^2.15.4",
  "date-fns": "^2.30.0",
  "lucide-react": "^0.545.0"
}
```

### TypeScript Support

All components are fully typed with TypeScript:

```tsx
interface ChartConfig {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: Record<string, string>
  }
}

type FormData = z.infer<typeof formSchema>
```

### Performance Optimizations

- **Lazy loading**: Chart components are loaded on demand
- **Memoization**: Expensive calculations are memoized
- **Debouncing**: Search inputs use debounced queries
- **Virtualization**: Large lists use virtual scrolling (when needed)

## 📱 Responsive Design

All components are designed mobile-first:

```tsx
// Responsive grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive text sizing
<p className="text-sm md:text-base">

// Responsive spacing
<div className="space-y-4 md:space-y-6">
```

## ♿ Accessibility Features

- **ARIA labels**: Proper labeling for screen readers
- **Keyboard navigation**: Full keyboard support
- **Focus management**: Proper focus handling in modals and forms
- **Color contrast**: WCAG AA compliant color combinations
- **Screen reader support**: Semantic HTML and ARIA attributes

## 🧪 Testing Considerations

When testing these components:

1. **Form validation**: Test all validation scenarios
2. **Keyboard navigation**: Ensure all interactions work with keyboard
3. **Screen readers**: Test with screen reader software
4. **Responsive design**: Test on various screen sizes
5. **Performance**: Monitor chart rendering performance with large datasets

## 📚 Additional Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Recharts Documentation](https://recharts.org/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)