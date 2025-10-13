# Advanced Data Table

A comprehensive, feature-rich data table component built with React, TanStack Table, and dnd-kit for drag-and-drop functionality.

## Features

- **Drag & Drop Reordering**: Sortable rows with visual feedback
- **Column Management**: Show/hide columns with dropdown controls
- **Row Selection**: Multi-select with checkboxes
- **Inline Editing**: Editable cells with form validation
- **Detailed Views**: Drawer component with charts and forms
- **Pagination**: Full pagination controls with page size selection
- **Responsive Design**: Mobile-optimized with adaptive layouts
- **Tabbed Interface**: Multiple views (Outline, Past Performance, etc.)
- **Search & Filtering**: Built-in filtering capabilities
- **Sorting**: Column-based sorting

## Installation

The component requires these dependencies (already installed):

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers
npm install @tanstack/react-table
npm install recharts
npm install sonner
npm install zod
```

## Usage

### Basic Usage

```tsx
import { AdvancedDataTable, DataTableItem } from '@/components/ui/advanced-data-table'

const data: DataTableItem[] = [
  {
    id: 1,
    header: "Executive Summary",
    type: "Executive Summary",
    status: "Done",
    target: "2",
    limit: "3",
    reviewer: "Eddie Lake",
  },
  // ... more data
]

function MyComponent() {
  const [tableData, setTableData] = useState(data)

  const handleDataChange = (newData: DataTableItem[]) => {
    setTableData(newData)
    // Sync with backend if needed
  }

  return (
    <AdvancedDataTable 
      data={tableData}
      onDataChange={handleDataChange}
    />
  )
}
```

### Data Schema

The component uses a Zod schema for type safety:

```tsx
export const dataTableSchema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
})

export type DataTableItem = z.infer<typeof dataTableSchema>
```

### Converting Existing Data

You can convert your existing data structures to the DataTableItem format:

```tsx
function surveyToDataTableItem(survey: SurveyTemplate): DataTableItem {
  return {
    id: parseInt(survey.id),
    header: survey.name,
    type: survey.type,
    status: survey.isActive ? 'Active' : 'Inactive',
    target: survey.version.toString(),
    limit: survey.questionsCount.toString(),
    reviewer: 'Assign reviewer',
  }
}
```

## Component Architecture

### Core Components

1. **AdvancedDataTable**: Main component with table logic
2. **DragHandle**: Drag-and-drop handle for row reordering
3. **DraggableRow**: Individual table row with drag functionality
4. **TableCellViewer**: Drawer component for detailed row views

### Key Features

#### Drag & Drop
- Uses `@dnd-kit` for smooth drag-and-drop experience
- Vertical-only dragging with visual feedback
- Automatic data reordering on drop

#### Column Management
- Show/hide columns via dropdown menu
- Persistent column visibility state
- Non-hideable essential columns (drag handle, selection, header)

#### Inline Editing
- Target and Limit columns are editable
- Form submission with toast notifications
- Real-time validation

#### Detailed Views
- Drawer component opens on header click
- Responsive direction (bottom on mobile, right on desktop)
- Includes charts, forms, and detailed information
- Chart integration with Recharts

#### Pagination
- Configurable page sizes (10, 20, 30, 40, 50)
- Navigation controls (first, previous, next, last)
- Row count information
- Responsive pagination controls

## Customization

### Styling
The component uses Tailwind CSS classes and follows the shadcn/ui design system. You can customize:

- Colors via CSS custom properties
- Spacing and sizing via Tailwind classes
- Component variants via the existing shadcn/ui components

### Data Mapping
To use with different data structures, create mapping functions:

```tsx
function mapYourDataToTableItem(item: YourDataType): DataTableItem {
  return {
    id: item.uniqueId,
    header: item.title,
    type: item.category,
    status: item.state,
    target: item.goal.toString(),
    limit: item.maximum.toString(),
    reviewer: item.assignee || 'Assign reviewer',
  }
}
```

### Column Configuration
The columns are defined within the component but can be extended by modifying the `columns` array in the `AdvancedDataTable` component.

## Integration Examples

### With Survey System
```tsx
// Convert survey templates to table format
const tableData = surveys.map(surveyToDataTableItem)

<AdvancedDataTable 
  data={tableData}
  onDataChange={(newData) => {
    // Update survey order in backend
    updateSurveyOrder(newData)
  }}
/>
```

### With Work Queue
```tsx
// Convert work items to table format
const tableData = workItems.map(workItemToDataTableItem)

<AdvancedDataTable 
  data={tableData}
  onDataChange={(newData) => {
    // Update work item priorities
    updateWorkItemPriorities(newData)
  }}
/>
```

## Performance Considerations

- Uses React.memo for optimized re-renders
- Efficient drag-and-drop with minimal DOM manipulation
- Virtualization can be added for large datasets
- Debounced search and filtering

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- ARIA labels and descriptions
- Focus management during drag operations
- Semantic HTML structure

## Browser Support

- Modern browsers with ES2020+ support
- Touch devices for drag-and-drop
- Responsive design for mobile/tablet/desktop

## Migration from Basic Tables

To migrate from basic table implementations:

1. Install required dependencies
2. Convert data to `DataTableItem` format
3. Replace table component with `AdvancedDataTable`
4. Add data change handlers for persistence
5. Customize styling if needed

The component is designed to be a drop-in replacement for basic table implementations while providing significantly enhanced functionality.