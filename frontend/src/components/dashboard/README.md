# CHC Insight CRM Dashboard

This directory contains the dashboard components for the CHC Insight CRM application, designed to provide insights into the existing MVP capabilities.

## Components Overview

### 1. DashboardMetrics (`dashboard-metrics.tsx`)
- **Purpose**: Displays key performance indicators for the CRM system
- **Data Source**: Real-time data from `/api/form-hierarchy/summary` endpoint
- **Metrics Shown**:
  - Total Form Templates across categories
  - Total Form Instances with completion rate
  - Pending Work (drafts + pending approvals)
  - System Health status
- **Features**: Loading states, error handling, responsive design

### 2. FormStatusChart (`form-status-chart.tsx`)
- **Purpose**: Visual representation of form instance status distribution
- **Chart Type**: Pie chart using Recharts
- **Data Visualization**: 
  - Draft instances (gray)
  - Pending instances (amber)
  - Approved instances (blue)
  - Completed instances (green)
- **Features**: Interactive tooltips, responsive legend, custom colors

### 3. FormActivityChart (`form-activity-chart.tsx`)
- **Purpose**: Shows form creation and completion trends over time
- **Chart Type**: Line chart using Recharts
- **Time Period**: Last 30 days
- **Metrics**: Forms created vs. completed with completion rate
- **Features**: Interactive tooltips, trend analysis, responsive design

### 4. RecentActivity (`recent-activity.tsx`)
- **Purpose**: Shows latest system activities and form submissions
- **Activity Types**:
  - Form instance completions
  - Template updates
  - Workflow approvals
  - New form creations
- **Features**: Real-time timestamps, status indicators, activity icons

### 5. QuickActions (`quick-actions.tsx`)
- **Purpose**: Provides quick access to key MVP features
- **Actions Available**:
  - Form Builder (create/manage templates)
  - Create Survey (new form instances)
  - Member Lookup (search members)
  - Provider Lookup (search providers)
  - Form Hierarchy (manage categories/types)
  - Analytics (reports and insights)
- **Features**: Color-coded icons, hover effects, direct navigation

### 6. SystemStatus (`system-status.tsx`)
- **Purpose**: Monitors health and availability of MVP components
- **Components Monitored**:
  - Form Hierarchy service
  - Form Builder service
  - Member Lookup service
  - Provider Lookup service
  - Database connectivity
  - API Server status
- **Features**: Real-time status updates, health percentage, last checked timestamps

## Data Integration

### API Integration (`../lib/dashboard-api.ts`)
The dashboard uses a centralized API client that:
- Fetches real data from backend endpoints when available
- Falls back to mock data for development
- Handles authentication with JWT tokens
- Provides consistent error handling
- Implements proper TypeScript typing

### Key Endpoints Used:
- `GET /api/form-hierarchy/summary` - Form hierarchy statistics
- Mock endpoints for activity and trends (to be implemented)

### Data Flow:
1. Components call `dashboardAPI` methods
2. API client attempts real backend calls
3. Falls back to mock data if backend unavailable
4. Components handle loading/error states
5. Data is displayed with proper formatting

## Design System Integration

### Styling Approach:
- Uses shadcn/ui components exclusively
- Follows CHC Insight CRM design tokens
- Implements responsive design patterns
- Supports light/dark theme switching

### Color Coding:
- **Green**: Success states, completed items
- **Blue**: Primary actions, approved items
- **Amber/Yellow**: Pending states, warnings
- **Gray**: Draft states, inactive items
- **Red**: Error states, critical issues

### Responsive Breakpoints:
- Mobile: Single column layout
- Tablet: 2-column grid for charts and actions
- Desktop: Full grid layout with optimal spacing

## Usage Examples

### Basic Dashboard Implementation:
```tsx
import { DashboardMetrics } from '@/components/dashboard/dashboard-metrics';
import { RecentActivity } from '@/components/dashboard/recent-activity';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <DashboardMetrics />
      <RecentActivity />
    </div>
  );
}
```

### Custom Chart Configuration:
```tsx
import { FormStatusChart } from '@/components/dashboard/form-status-chart';

// The component automatically fetches and displays data
<FormStatusChart />
```

## Performance Considerations

### Bundle Optimization:
- Charts use dynamic imports to reduce initial bundle size
- Components implement proper loading states
- Data fetching is optimized with caching
- Images and icons are optimized for web

### Loading Strategy:
- Skeleton loaders for better perceived performance
- Progressive data loading
- Error boundaries for graceful failure handling
- Responsive design for all device sizes

## Future Enhancements

### Planned Features:
1. **Real-time Updates**: WebSocket integration for live data
2. **Advanced Filtering**: Date ranges, category filters
3. **Export Functionality**: PDF/Excel export of dashboard data
4. **Custom Dashboards**: User-configurable dashboard layouts
5. **Drill-down Analytics**: Detailed views from chart interactions

### Integration Opportunities:
1. **Notification System**: Alert integration for critical events
2. **User Preferences**: Customizable dashboard layouts
3. **Advanced Analytics**: Machine learning insights
4. **Mobile App**: React Native dashboard components

## Development Guidelines

### Adding New Components:
1. Follow the existing component structure
2. Implement proper TypeScript typing
3. Add loading and error states
4. Include responsive design
5. Add to this README documentation

### Testing Strategy:
1. Unit tests for component logic
2. Integration tests for API calls
3. Visual regression tests for UI
4. Accessibility testing compliance

### Code Quality:
- Follow ESLint and Prettier configurations
- Use TypeScript strict mode
- Implement proper error boundaries
- Document complex logic with comments

This dashboard provides a comprehensive view of the CHC Insight CRM MVP capabilities while maintaining excellent user experience and performance standards.