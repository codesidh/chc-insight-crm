# Data Organization

This directory contains all JSON data files used throughout the CHC Insight CRM application, organized into logical subdirectories for better maintainability and clarity.

## Directory Structure

```
src/data/
├── app/                    # Application data for pages and features
│   ├── analytics_data.json
│   ├── dashboard_data.json
│   ├── members_data.json
│   ├── providers_data.json
│   ├── surveys_data.json
│   └── workflows_data.json
├── examples/               # Data for component examples
│   ├── example_chart_data.json
│   ├── example_command_data.json
│   ├── example_form_data.json
│   └── example_navigation_data.json
└── README.md              # This file
```

## Data Categories

### 📊 Application Data (`/app`)

Contains real application data used by the main pages and features of the CRM system.

**Files:**
- `dashboard_data.json` - Dashboard metrics, stats, and content
- `members_data.json` - Member management data and statistics
- `providers_data.json` - Provider network information
- `surveys_data.json` - Survey templates and configurations
- `workflows_data.json` - Workflow definitions and states
- `analytics_data.json` - Analytics and reporting data

**Usage:**
```typescript
import { getDashboardData, getMembersData } from '@/lib/app-data'

const dashboardData = getDashboardData()
const membersData = getMembersData()
```

### 🎨 Example Data (`/examples`)

Contains data specifically for component examples and demonstrations.

**Files:**
- `example_chart_data.json` - Chart data and configurations for Recharts examples
- `example_command_data.json` - Search and command palette example data
- `example_form_data.json` - Form options, validation data, and defaults
- `example_navigation_data.json` - Navigation, breadcrumb, and UI example data

**Usage:**
```typescript
import { getChartData, getCommandData } from '@/lib/example-data'

const chartData = getChartData()
const commandData = getCommandData()
```

## Utility Functions

### App Data Utilities (`@/lib/app-data`)

Provides typed access to application data with convenient getter functions:

```typescript
// Dashboard data
export const getDashboardData = () => dashboardData
export const getDashboardStats = () => dashboardData.stats
export const getDashboardFeatureCards = () => dashboardData.featureCards

// Members data
export const getMembersData = () => membersData
export const getMembersStats = () => membersData.stats
export const getMembers = () => membersData.members
```

### Example Data Utilities (`@/lib/example-data`)

Provides typed access to example component data:

```typescript
// Chart data
export const getChartData = () => chartData
export const getComplianceData = () => chartData.complianceData
export const getSurveyTypeData = () => chartData.surveyTypeData

// Command data
export const getCommandData = () => commandData
export const getMembers = () => commandData.members
export const getProviders = () => commandData.providers
```

## Data Structure Standards

### 🏗️ Consistent Structure

All data files follow consistent patterns:

```json
{
  "pageInfo": {
    "title": "Page Title",
    "description": "Page description"
  },
  "stats": [
    {
      "id": "unique-id",
      "title": "Stat Title",
      "value": "123",
      "change": "+5%",
      "changeLabel": "from last month",
      "icon": "IconName",
      "changeType": "positive"
    }
  ],
  "items": [...],
  "quickActions": [...]
}
```

### 🎯 TypeScript Support

All data files have corresponding TypeScript types:

```typescript
export type DashboardDataType = typeof dashboardData
export type MembersDataType = typeof membersData
export type ChartDataType = typeof chartData
```

### 🔧 Validation

Data structures are validated through:
- TypeScript type checking
- JSON schema validation (implicit through imports)
- Runtime validation in utility functions

## Best Practices

### ✅ Do's

- **Use utility functions** instead of direct imports for better maintainability
- **Follow naming conventions**: `<feature>_data.json` for app data, `example_<component>_data.json` for examples
- **Include proper metadata** like `id`, `title`, `description` for all items
- **Use consistent icon names** that match Lucide React icons
- **Include change indicators** for metrics and stats
- **Provide fallback values** for optional fields

### ❌ Don'ts

- **Don't import JSON files directly** in components - use utility functions
- **Don't mix application data with example data** - keep them in separate directories
- **Don't hardcode data in components** - always use external JSON files
- **Don't forget to update utility functions** when adding new data files
- **Don't use inconsistent data structures** across similar components

## Migration Guide

If you need to add new data or modify existing data:

### Adding New Application Data

1. Create `new_feature_data.json` in `/app` directory
2. Add import and utility functions to `@/lib/app-data.ts`
3. Export TypeScript types
4. Use utility functions in components

### Adding New Example Data

1. Create `example_new_component_data.json` in `/examples` directory
2. Add import and utility functions to `@/lib/example-data.ts`
3. Export TypeScript types
4. Use utility functions in example components

### Updating Existing Data

1. Modify the JSON file directly
2. Ensure TypeScript types still match
3. Update utility functions if structure changes
4. Test all affected components

## File Locations Reference

| Data Type | Location | Utility File | Usage |
|-----------|----------|--------------|-------|
| Dashboard | `/app/dashboard_data.json` | `@/lib/app-data` | Main dashboard page |
| Members | `/app/members_data.json` | `@/lib/app-data` | Member management |
| Providers | `/app/providers_data.json` | `@/lib/app-data` | Provider network |
| Surveys | `/app/surveys_data.json` | `@/lib/app-data` | Survey management |
| Workflows | `/app/workflows_data.json` | `@/lib/app-data` | Workflow engine |
| Analytics | `/app/analytics_data.json` | `@/lib/app-data` | Analytics dashboard |
| Chart Examples | `/examples/example_chart_data.json` | `@/lib/example-data` | Chart components |
| Command Examples | `/examples/example_command_data.json` | `@/lib/example-data` | Command palettes |
| Form Examples | `/examples/example_form_data.json` | `@/lib/example-data` | Form components |
| Navigation Examples | `/examples/example_navigation_data.json` | `@/lib/example-data` | Navigation components |

This organization ensures clean separation of concerns, better maintainability, and consistent data access patterns throughout the application.