# Utility Hooks Documentation

This document provides comprehensive documentation for all utility hooks implemented in the CHC Insight CRM frontend application.

## Table of Contents

1. [Core Utility Hooks](#core-utility-hooks)
2. [Form Management Hooks](#form-management-hooks)
3. [Drag and Drop Hooks](#drag-and-drop-hooks)
4. [Date Utility Hooks](#date-utility-hooks)
5. [Storage Hooks](#storage-hooks)
6. [Async Operation Hooks](#async-operation-hooks)
7. [Optimistic Update Hooks](#optimistic-update-hooks)
8. [Usage Examples](#usage-examples)

## Core Utility Hooks

### useDebounce

Debounces a value to prevent excessive updates.

```typescript
const debouncedValue = useDebounce(value, delay)
```

**Parameters:**
- `value: T` - The value to debounce
- `delay: number` - Delay in milliseconds

**Returns:** The debounced value

### useDebouncedCallback

Creates a debounced version of a callback function.

```typescript
const debouncedCallback = useDebouncedCallback(callback, delay)
```

**Use Cases:**
- Search input handling
- API call throttling
- Form validation delays

## Form Management Hooks

### useForm

Enhanced React Hook Form integration with Zod validation.

```typescript
const form = useForm(schema, options)
```

**Features:**
- Automatic Zod resolver integration
- Built-in validation on change
- TypeScript type safety

### useAutoSave

Automatically saves form data with debouncing.

```typescript
useAutoSave({
  watch: form.watch,
  onSave: (data) => saveToServer(data),
  delay: 2000,
  enabled: true
})
```

**Parameters:**
- `watch` - React Hook Form watch function
- `onSave` - Save callback function
- `delay` - Auto-save delay (default: 2000ms)
- `enabled` - Enable/disable auto-save

### useFormPersistence

Persists form data to localStorage for draft recovery.

```typescript
const { saveToStorage, clearStorage } = useFormPersistence({
  key: 'survey-draft',
  setValue: form.setValue,
  getValues: form.getValues,
  enabled: true
})
```

## Drag and Drop Hooks

### useDragAndDrop

Comprehensive drag and drop functionality using @dnd-kit.

```typescript
const dragAndDrop = useDragAndDrop({
  items: dragItems,
  onReorder: setDragItems,
  strategy: 'vertical',
  disabled: false
})
```

**Features:**
- Vertical and horizontal sorting
- Custom modifiers support
- Keyboard accessibility
- Touch device support

### useMultiContainerDragAndDrop

Manages drag and drop between multiple containers.

```typescript
const {
  containers,
  addContainer,
  removeContainer,
  addItem,
  removeItem
} = useMultiContainerDragAndDrop()
```

**Use Cases:**
- Survey builder question organization
- Task board management
- File organization systems

### useValidatedDragAndDrop

Drag and drop with validation constraints.

```typescript
const validatedDnd = useValidatedDragAndDrop({
  items,
  onReorder,
  canDrop: (item, targetIndex) => targetIndex < maxItems,
  canDrag: (item) => !item.locked,
  maxItems: 10,
  minItems: 1
})
```

## Date Utility Hooks

### useDateUtils

Comprehensive date manipulation and formatting utilities.

```typescript
const { format, parse, compare, calculate, ranges, status } = useDateUtils({
  locale: enUS,
  weekStartsOn: 1,
  defaultFormat: 'MMM dd, yyyy'
})
```

**Formatters:**
- `format.short(date)` - MM/dd/yyyy
- `format.medium(date)` - MMM dd, yyyy
- `format.long(date)` - Full date
- `format.time(date)` - Time only
- `format.relative(date)` - Relative to now
- `format.distance(date)` - Distance from now

**Status Checks:**
- `status.isToday(date)`
- `status.isOverdue(date)`
- `status.isPast(date)`
- `status.isFuture(date)`

**Business Days:**
- `businessDays.addBusinessDays(date, days)`
- `businessDays.isBusinessDay(date)`
- `businessDays.getBusinessDaysInRange(start, end)`

**Due Date Utilities:**
- `dueDates.calculateDueDate(start, days, businessOnly)`
- `dueDates.getDueDateStatus(date)` - Returns: 'overdue', 'urgent', 'soon', 'normal'
- `dueDates.getDueDateColor(date)` - Returns Tailwind classes

### useDateRange

Manages date range selection with validation.

```typescript
const {
  range,
  setRange,
  setPresetRange,
  clearRange,
  isValid
} = useDateRange(initialRange)
```

## Storage Hooks

### useLocalStorage / useSessionStorage

Type-safe browser storage management.

```typescript
const [value, setValue, removeValue] = useLocalStorage('key', defaultValue)
const [sessionValue, setSessionValue, removeSessionValue] = useSessionStorage('key', defaultValue)
```

### useUserPreferences

Manages user preferences with automatic persistence.

```typescript
const {
  preferences,
  updatePreference,
  updatePreferences,
  resetPreferences
} = useUserPreferences({
  theme: 'light',
  notifications: true,
  language: 'en'
})
```

### useFormDraft

Manages form drafts with auto-save functionality.

```typescript
const {
  draft,
  saveDraft,
  updateDraft,
  deleteDraft,
  hasDraft,
  isDirty,
  lastSaved
} = useFormDraft('survey-123', defaultValues, {
  autoSaveDelay: 1000,
  enabled: true
})
```

### useCache

Application cache with TTL and stale-while-revalidate support.

```typescript
const {
  data,
  isLoading,
  error,
  refresh,
  invalidate,
  isStale
} = useCache('cache-key', fetchFunction, {
  ttl: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: true
})
```

## Async Operation Hooks

### useAsync

Manages async operations with loading states and error handling.

```typescript
const {
  data,
  error,
  isLoading,
  isSuccess,
  isError,
  execute,
  reset,
  retry
} = useAsync(asyncFunction, {
  immediate: false,
  onSuccess: (data) => console.log('Success:', data),
  onError: (error) => console.error('Error:', error),
  retryCount: 3,
  retryDelay: 1000
})
```

### useCancellableAsync

Async operations with cancellation support.

```typescript
const {
  data,
  isLoading,
  execute,
  cancel
} = useCancellableAsync(
  (signal) => fetch('/api/data', { signal }),
  { immediate: false }
)
```

### usePolling

Polls data at regular intervals.

```typescript
const {
  data,
  isLoading,
  isPolling,
  startPolling,
  stopPolling
} = usePolling(fetchFunction, 5000, {
  enabled: true,
  stopOnError: false
})
```

### useAsyncQueue

Manages multiple async operations in a queue.

```typescript
const {
  queue,
  addToQueue,
  removeFromQueue,
  clearQueue,
  pendingCount,
  isProcessing
} = useAsyncQueue()
```

## Optimistic Update Hooks

### useOptimisticUpdate

Generic optimistic updates with TanStack Query.

```typescript
const { createOptimisticMutation } = useOptimisticUpdate()

const mutation = createOptimisticMutation({
  mutationFn: updateSurvey,
  queryKey: ['surveys', surveyId],
  updater: (oldData, variables) => ({ ...oldData, ...variables }),
  onSuccess: (data) => console.log('Updated:', data)
})
```

### useOptimisticList

Optimistic updates for list operations.

```typescript
const {
  createAddMutation,
  createUpdateMutation,
  createRemoveMutation
} = useOptimisticList()
```

### useOptimisticForm

Optimistic form updates with validation.

```typescript
const { createFormMutation } = useOptimisticForm()

const formMutation = createFormMutation({
  mutationFn: saveForm,
  queryKey: ['form', formId],
  validator: (data) => formSchema.safeParse(data).success
})
```

## Usage Examples

### Survey Builder with Drag and Drop

```typescript
function SurveyBuilder() {
  const [questions, setQuestions] = useState(initialQuestions)
  
  const dragAndDrop = useDragAndDrop({
    items: questions,
    onReorder: setQuestions,
    strategy: 'vertical'
  })
  
  return (
    <DndContext {...dragAndDrop}>
      <SortableContext items={dragAndDrop.items}>
        {questions.map(question => (
          <SortableQuestion key={question.id} question={question} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

### Form with Auto-save and Draft Recovery

```typescript
function SurveyForm({ surveyId }: { surveyId: string }) {
  const form = useForm(surveySchema)
  
  // Auto-save to server
  useAutoSave({
    watch: form.watch,
    onSave: async (data) => {
      await saveSurveyDraft(surveyId, data)
    },
    delay: 2000
  })
  
  // Local draft persistence
  const { hasDraft, deleteDraft } = useFormDraft(
    `survey-${surveyId}`,
    form.getValues()
  )
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {hasDraft && (
        <Alert>
          <AlertDescription>
            You have unsaved changes. 
            <Button onClick={deleteDraft}>Discard</Button>
          </AlertDescription>
        </Alert>
      )}
      {/* Form fields */}
    </form>
  )
}
```

### Dashboard with Date Filtering

```typescript
function Dashboard() {
  const { ranges, format } = useDateUtils()
  const { range, setPresetRange } = useDateRange()
  
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard', range],
    queryFn: () => fetchDashboardData(range),
    enabled: !!range
  })
  
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => setPresetRange('today')}>
          Today
        </Button>
        <Button onClick={() => setPresetRange('thisWeek')}>
          This Week
        </Button>
        <Button onClick={() => setPresetRange('thisMonth')}>
          This Month
        </Button>
      </div>
      
      {range && (
        <p>Showing data from {format.short(range.start)} to {format.short(range.end)}</p>
      )}
      
      {/* Dashboard content */}
    </div>
  )
}
```

### Optimistic Survey Updates

```typescript
function SurveyList() {
  const { createUpdateMutation } = useOptimisticList()
  
  const updateSurveyMutation = createUpdateMutation({
    mutationFn: updateSurvey,
    queryKey: ['surveys'],
    onSuccess: (data) => {
      toast.success('Survey updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update survey')
    }
  })
  
  const handleStatusChange = (surveyId: string, status: string) => {
    updateSurveyMutation.mutate({ id: surveyId, status })
  }
  
  return (
    <div>
      {surveys.map(survey => (
        <SurveyCard 
          key={survey.id} 
          survey={survey}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  )
}
```

## Best Practices

1. **Performance**: Use debouncing for search inputs and auto-save functionality
2. **User Experience**: Implement optimistic updates for immediate feedback
3. **Data Persistence**: Use form drafts for long forms to prevent data loss
4. **Error Handling**: Always provide error states and retry mechanisms
5. **Accessibility**: Ensure drag and drop components work with keyboard navigation
6. **Type Safety**: Leverage TypeScript for better development experience
7. **Caching**: Use appropriate TTL values for cached data based on update frequency

## Integration with Existing Codebase

These hooks are designed to work seamlessly with:
- **TanStack Query** for server state management
- **React Hook Form** for form handling
- **shadcn/ui** components for consistent UI
- **Zod** for validation schemas
- **date-fns** for date operations
- **@dnd-kit** for drag and drop functionality

All hooks follow the established patterns in the codebase and maintain consistency with the existing architecture.