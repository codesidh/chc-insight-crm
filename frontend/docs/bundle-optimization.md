# Bundle Optimization Guide

## Current Bundle Analysis Results

### Before Optimization
- `/examples`: 361 kB ⚠️ Critical
- `/examples/advanced-table`: 325 kB ⚠️ High  
- `/settings`: 357 kB ⚠️ High
- Most dashboard routes: 158 kB ✓ Acceptable
- `/`, `/dashboard/metrics`: 102 kB ✓ Optimal

### Performance Targets
- **Good**: < 200 kB First Load JS
- **Acceptable**: 200-300 kB
- **Poor**: > 300 kB (needs optimization)

## Optimization Strategies Implemented

### 1. Dynamic Imports for Heavy Components

#### Chart Components
```typescript
// Before: Direct import (loads immediately)
import { ComplianceAreaChart } from "@/components/examples/chart-examples"

// After: Dynamic import (loads on demand)
const ComplianceAreaChart = dynamic(
  () => import('./chart-examples').then(mod => ({ default: mod.ComplianceAreaChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)
```

#### Advanced Data Table
```typescript
// Heavy @dnd-kit and @tanstack/react-table dependencies
const AdvancedDataTableExample = dynamic(
  () => import('./advanced-data-table-example'),
  {
    loading: () => <TableSkeleton />,
    ssr: false,
  }
)
```

### 2. Webpack Bundle Splitting

```typescript
// next.config.ts
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.optimization.splitChunks = {
      cacheGroups: {
        // Separate chunk for drag-and-drop (50-60 kB)
        dndkit: {
          test: /[\\/]node_modules[\\/]@dnd-kit[\\/]/,
          name: 'dnd-kit',
          chunks: 'all',
          priority: 30,
        },
        // Separate chunk for table library (40-50 kB)
        reactTable: {
          test: /[\\/]node_modules[\\/]@tanstack[\\/]react-table[\\/]/,
          name: 'react-table',
          chunks: 'all',
          priority: 30,
        },
        // Separate chunk for charts (80-100 kB)
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

### 3. Loading Skeletons

Created comprehensive loading states:
- `TableSkeleton` for data tables
- `ChartSkeleton` for chart components  
- `FormSkeleton` for form components
- `ExamplesSkeleton` for the examples page

### 4. Package Import Optimization

```typescript
experimental: {
  optimizePackageImports: [
    '@radix-ui/react-icons', 
    'lucide-react',
    '@dnd-kit/core',
    '@dnd-kit/sortable', 
    '@tanstack/react-table',
    'recharts'
  ],
}
```

## Bundle Analysis Commands

```bash
# Analyze bundle composition
npm run analyze

# Generate detailed bundle report
npm run bundle-report

# Analyze server vs browser bundles separately
npm run analyze:server
npm run analyze:browser
```

## Expected Improvements

### Route-Specific Reductions
- `/examples`: 361 kB → ~180 kB (50% reduction)
- `/examples/advanced-table`: 325 kB → ~160 kB (51% reduction)
- `/settings`: 357 kB → ~180 kB (50% reduction)

### Chunk Distribution
- **Main bundle**: Core React/Next.js (~102 kB)
- **dnd-kit chunk**: Drag-and-drop functionality (~55 kB)
- **react-table chunk**: Table functionality (~45 kB)  
- **recharts chunk**: Chart functionality (~85 kB)
- **radix-ui chunk**: UI components (~40 kB)

## Performance Monitoring

### Web Vitals Tracking
```typescript
import { trackWebVitals } from '@/lib/performance'

// In _app.tsx or layout.tsx
useEffect(() => {
  trackWebVitals()
}, [])
```

### Bundle Size Regression Tests
```bash
# Add to CI/CD pipeline
npm run build
npm run analyze
# Check if bundle sizes exceed thresholds
```

## Best Practices Going Forward

### 1. Component Organization
- Keep heavy components in separate files
- Use dynamic imports for components > 20 kB
- Implement proper loading states

### 2. Dependency Management
- Audit new dependencies for bundle impact
- Use tree-shaking friendly imports
- Consider lighter alternatives for heavy libraries

### 3. Route-Based Code Splitting
- Each route should be < 200 kB total
- Use Next.js automatic code splitting
- Implement lazy loading for non-critical features

### 4. Monitoring Setup
- Track Core Web Vitals in production
- Set up bundle size alerts in CI/CD
- Monitor Real User Metrics (RUM)

## Troubleshooting

### Large Bundle Issues
1. Run `npm run analyze` to identify heavy chunks
2. Check for duplicate dependencies
3. Implement dynamic imports for heavy components
4. Consider code splitting at the route level

### Performance Regression
1. Compare bundle analysis reports
2. Check for new heavy dependencies
3. Verify dynamic imports are working
4. Monitor Web Vitals metrics

## Future Optimizations

### Phase 2 Improvements
- Implement service worker for caching
- Add progressive loading for images
- Optimize font loading strategy
- Consider micro-frontends for large features

### Advanced Techniques
- Route-based prefetching
- Component-level caching
- Edge-side rendering for static content
- CDN optimization for assets