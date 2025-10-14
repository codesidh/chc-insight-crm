# State Management and Data Fetching

This directory contains the configuration and utilities for state management and data fetching in the CHC Insight CRM frontend application.

## Overview

The application uses modern React patterns for state management and data fetching:

- **TanStack Query v5** for server state management and caching
- **React Hook Form** with Zod validation for form state
- **TanStack Table** for data table state and functionality
- **Custom hooks** for business logic encapsulation

## Architecture

### Query Client (`query-client.ts`)

The query client is configured with:
- **Stale Time**: 5 minutes for most queries
- **Cache Time**: 10 minutes to keep data in memory
- **Retry Logic**: Smart retry with exponential backoff
- **Error Handling**: Global error handling with user notifications
- **Query Keys Factory**: Consistent key management for cache invalidation

```typescript
import { queryClient, queryKeys } from '@/lib/query-client'

// Use predefined query keys
const surveysQuery = useQuery({
  queryKey: queryKeys.surveys.list({ status: 'active' }),
  queryFn: () => surveyApi.getTemplates({ status: 'active' })
})
```

### API Client (`api-client.ts`)

Type-safe API client with:
- **Automatic Error Handling**: Consistent error responses
- **Request/Response Interceptors**: Authentication and logging
- **TypeScript Integration**: Full type safety for API calls
- **File Upload Support**: Multipart form data handling
- **Timeout Management**: Configurable request timeouts

```typescript
import { surveyApi } from '@/lib/api-client'

// All API calls are type-safe and include error handling
const template = await surveyApi.getTemplate('123')
```

### Validation Schemas (`validations/index.ts`)

Zod schemas for:
- **Form Validation**: Runtime type checking and validation
- **API Request/Response**: Ensure data integrity
- **Type Inference**: Automatic TypeScript types from schemas

```typescript
import { surveyTemplateSchema, type SurveyTemplateFormData } from '@/lib/validations'

const form = useForm(surveyTemplateSchema, {
  defaultValues: { name: '', type: 'custom' }
})
```

### Table Configuration (`table-config.ts`)

TanStack Table utilities:
- **Common Column Definitions**: Reusable column types
- **State Management**: Pagination, sorting, filtering
- **Server-Side Operations**: Manual pagination and sorting
- **Selection Support**: Row selection with bulk operations

```typescript
import { useDataTable, commonColumns } from '@/lib/table-config'

const { table } = useDataTable({
  data: surveys,
  columns: [
    commonColumns.select,
    { accessorKey: 'name', header: 'Name' },
    commonColumns.actions
  ]
})
```

## Custom Hooks

### Survey Hooks (`hooks/use-surveys.ts`)

- `useSurveyTemplates()` - Fetch survey templates with pagination
- `useSurveyTemplate(id)` - Fetch single template
- `useCreateSurveyTemplate()` - Create new template with optimistic updates
- `useUpdateSurveyTemplate()` - Update template with rollback on error
- `useSaveResponse()` - Auto-save survey responses

### Search Hooks (`hooks/use-search.ts`)

- `useMemberSearch(query)` - Debounced member search
- `useProviderSearch(query)` - Debounced provider search
- `useTypeAheadSearch()` - Combined search for type-ahead components

### Dashboard Hooks (`hooks/use-dashboard.ts`)

- `useDashboardMetrics()` - Executive dashboard data
- `useComplianceData()` - Compliance metrics with auto-refresh
- `useProductivityData()` - Staff productivity metrics

### Work Queue Hooks (`hooks/use-work-queue.ts`)

- `useWorkQueueTasks()` - Task list with real-time updates
- `useAssignTask()` - Task assignment with optimistic updates
- `useBulkUpdateTaskStatus()` - Bulk operations

### Form Hooks (`hooks/use-form.ts`)

- `useForm()` - Enhanced React Hook Form with Zod integration
- `useAutoSave()` - Automatic form saving with debouncing
- `useFormPersistence()` - Local storage persistence

## Usage Examples

### Basic Query

```typescript
function SurveyList() {
  const { data, isLoading, error } = useSurveyTemplates({
    page: 1,
    limit: 10,
    search: 'assessment'
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      {data?.data.map(survey => (
        <SurveyCard key={survey.id} survey={survey} />
      ))}
    </div>
  )
}
```

### Form with Validation

```typescript
function CreateSurveyForm() {
  const createSurvey = useCreateSurveyTemplate()
  const form = useForm(surveyTemplateSchema)

  const onSubmit = form.handleSubmit(async (data) => {
    await createSurvey.mutateAsync(data)
  })

  return (
    <form onSubmit={onSubmit}>
      <Input {...form.register('name')} />
      {form.formState.errors.name && (
        <ErrorText>{form.formState.errors.name.message}</ErrorText>
      )}
      <Button type="submit" disabled={createSurvey.isPending}>
        Create Survey
      </Button>
    </form>
  )
}
```

### Data Table

```typescript
function SurveyTable() {
  const { data } = useSurveyTemplates()
  const { table } = useDataTable({
    data: data?.data || [],
    columns: surveyColumns,
    manualPagination: true
  })

  return <DataTable table={table} />
}
```

### Auto-Save Form

```typescript
function SurveyEditor({ instanceId }: { instanceId: string }) {
  const saveResponse = useSaveResponse()
  const form = useForm(surveyResponseSchema)

  // Auto-save every 2 seconds
  useAutoSave({
    watch: form.watch,
    onSave: (data) => saveResponse.mutate({
      instanceId,
      responses: data.responses,
      isDraft: true
    }),
    delay: 2000
  })

  return (
    <form>
      {/* Form fields */}
    </form>
  )
}
```

## Best Practices

### Query Keys

Always use the query keys factory for consistent cache management:

```typescript
// ✅ Good
queryKey: queryKeys.surveys.list({ status: 'active' })

// ❌ Bad
queryKey: ['surveys', 'list', 'active']
```

### Error Handling

Let the global error handler manage common errors, handle specific cases locally:

```typescript
const mutation = useMutation({
  mutationFn: api.createSurvey,
  onError: (error) => {
    // Only handle specific business logic errors
    if (error.code === 'DUPLICATE_NAME') {
      setFieldError('name', 'Survey name already exists')
    }
    // Global handler manages network errors, auth, etc.
  }
})
```

### Optimistic Updates

Use optimistic updates for better UX, with proper rollback:

```typescript
const updateSurvey = useMutation({
  mutationFn: api.updateSurvey,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.surveys.detail(id) })
    const previousData = queryClient.getQueryData(queryKeys.surveys.detail(id))
    queryClient.setQueryData(queryKeys.surveys.detail(id), newData)
    return { previousData }
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(queryKeys.surveys.detail(id), context?.previousData)
  }
})
```

### Form Validation

Always use Zod schemas for consistent validation:

```typescript
// Define schema once
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email')
})

// Use in forms
const form = useForm(userSchema)

// Use for API validation
const createUser = (data: z.infer<typeof userSchema>) => {
  return api.post('/users', userSchema.parse(data))
}
```

## Performance Considerations

- **Stale While Revalidate**: Queries show cached data immediately while fetching fresh data
- **Background Refetching**: Automatic updates when data becomes stale
- **Debounced Search**: Search queries are debounced to reduce API calls
- **Optimistic Updates**: UI updates immediately for better perceived performance
- **Query Deduplication**: Multiple components requesting same data share a single request

## Testing

The state management setup is designed to be testable:

```typescript
// Mock API responses
const mockApi = {
  getSurveys: jest.fn().mockResolvedValue({ data: [] })
}

// Test with React Query
const wrapper = ({ children }) => (
  <QueryClientProvider client={testQueryClient}>
    {children}
  </QueryClientProvider>
)

test('loads surveys', async () => {
  render(<SurveyList />, { wrapper })
  await waitFor(() => {
    expect(screen.getByText('No surveys found')).toBeInTheDocument()
  })
})
```