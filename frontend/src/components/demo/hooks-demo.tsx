'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  useDebounce, 
  useDebouncedCallback,
  useAutoSave,
  useForm,
  useDateUtils,
  useLocalStorage,
  useAsync,
  useDragAndDrop,
} from '@/hooks'
import { z } from 'zod'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Demo form schema
const demoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})



// Sortable item component for drag and drop demo
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-white border rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
    >
      {children}
    </div>
  )
}

/**
 * Demo component showcasing the utility hooks
 */
export function HooksDemo() {
  // Debounce demo
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  
  // Date utilities demo
  const { format, status, dueDates } = useDateUtils()
  const now = new Date()
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  
  // Local storage demo
  const [preferences, setPreferences] = useLocalStorage('demo-preferences', {
    theme: 'light',
    notifications: true,
  })
  
  // Form with auto-save demo
  const form = useForm(demoSchema, {
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  })
  
  useAutoSave({
    watch: form.watch,
    onSave: (data) => {
      console.log('Auto-saving form data:', data)
    },
    delay: 1000,
  })
  
  // Async operation demo
  const {
    data: asyncData,
    isLoading,
    error,
    execute: executeAsync,
  } = useAsync(
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      return { message: 'Data loaded successfully!', timestamp: new Date().toISOString() }
    },
    { immediate: false }
  )
  
  // Drag and drop demo
  const [dragItems, setDragItems] = useState([
    { id: '1', content: 'First item' },
    { id: '2', content: 'Second item' },
    { id: '3', content: 'Third item' },
    { id: '4', content: 'Fourth item' },
  ])
  
  const dragAndDrop = useDragAndDrop({
    items: dragItems.map(item => ({ id: item.id, data: item })),
    onReorder: (items) => {
      const reorderedItems = items.map(item => item.data || item).filter(Boolean)
      setDragItems(reorderedItems as typeof dragItems)
    },
    strategy: 'vertical',
  })
  
  // Debounced callback demo
  const debouncedLog = useDebouncedCallback((value: string) => {
    console.log('Debounced callback executed with:', value)
  }, 300)

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Debounce Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Debounce Hook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                debouncedLog(e.target.value)
              }}
            />
            <div className="text-sm text-muted-foreground">
              <p>Current: {searchTerm}</p>
              <p>Debounced: {debouncedSearchTerm}</p>
            </div>
          </CardContent>
        </Card>

        {/* Date Utilities Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Date Utilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm space-y-1">
              <p>Now: {format.medium(now)}</p>
              <p>Relative: {format.relative(now)}</p>
              <p>Is today: {status.isToday(now) ? 'Yes' : 'No'}</p>
              <p>Tomorrow status: 
                <Badge className="ml-2" variant="outline">
                  {dueDates.getDueDateStatus(tomorrow)}
                </Badge>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Local Storage Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Local Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">Theme: {preferences.theme}</p>
              <p className="text-sm">Notifications: {preferences.notifications ? 'On' : 'Off'}</p>
            </div>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  theme: prev.theme === 'light' ? 'dark' : 'light'
                }))}
              >
                Toggle Theme
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  notifications: !prev.notifications
                }))}
              >
                Toggle Notifications
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Async Hook Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Async Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={executeAsync} 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Loading...' : 'Load Data'}
            </Button>
            
            {error && (
              <p className="text-sm text-red-600">Error: {error.message}</p>
            )}
            
            {asyncData && (
              <div className="text-sm text-green-600">
                <p>{asyncData.message}</p>
                <p className="text-xs text-muted-foreground">
                  {format.time(asyncData.timestamp)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form with Auto-save Demo */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Form with Auto-save</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Input
                  placeholder="Name"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              <div>
                <Input
                  placeholder="Message (min 10 characters)"
                  {...form.register('message')}
                />
                {form.formState.errors.message && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.message.message}
                  </p>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Form auto-saves after 1 second of inactivity
              </p>
            </form>
          </CardContent>
        </Card>

      </div>

      {/* Drag and Drop Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Drag and Drop</CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext {...dragAndDrop}>
            <SortableContext items={dragAndDrop.items} strategy={dragAndDrop.strategy}>
              <div className="space-y-2">
                {dragItems.map((item) => (
                  <SortableItem key={item.id} id={item.id}>
                    <div className="flex items-center justify-between">
                      <span>{item.content}</span>
                      <Badge variant="secondary">ID: {item.id}</Badge>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
            
            <DragOverlay dropAnimation={dragAndDrop.dropAnimation}>
              {dragAndDrop.activeItem ? (
                <div className="p-3 bg-white border rounded-lg shadow-lg">
                  <div className="flex items-center justify-between">
                    <span>{dragItems.find(item => item.id === dragAndDrop.activeItem?.id)?.content}</span>
                    <Badge variant="secondary">Dragging...</Badge>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          
          <p className="text-xs text-muted-foreground mt-4">
            Drag items to reorder them
          </p>
        </CardContent>
      </Card>
    </div>
  )
}