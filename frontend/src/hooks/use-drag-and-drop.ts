import { useState, useCallback, useMemo } from 'react'
import {
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core'
import {
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  restrictToVerticalAxis,
  restrictToHorizontalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'

export interface DragItem {
  id: string
  type?: string
  data?: any
}

export interface DropZone {
  id: string
  accepts?: string[]
  data?: any
}

export interface UseDragAndDropOptions {
  items: DragItem[]
  onReorder?: (items: DragItem[]) => void
  onDrop?: (item: DragItem, dropZone: DropZone) => void
  strategy?: 'vertical' | 'horizontal'
  modifiers?: Array<any>
  disabled?: boolean
}

/**
 * Comprehensive drag and drop hook for survey builder and other components
 */
export function useDragAndDrop({
  items,
  onReorder,
  onDrop,
  strategy = 'vertical',
  modifiers,
  disabled = false,
}: UseDragAndDropOptions) {
  const [activeItem, setActiveItem] = useState<DragItem | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  // Configure sensors for different input methods
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Default modifiers based on strategy
  const defaultModifiers = useMemo(() => {
    const baseModifiers = [restrictToWindowEdges]
    
    if (strategy === 'vertical') {
      baseModifiers.push(restrictToVerticalAxis)
    } else if (strategy === 'horizontal') {
      baseModifiers.push(restrictToHorizontalAxis)
    }
    
    return baseModifiers
  }, [strategy])

  const finalModifiers = modifiers || defaultModifiers

  // Sorting strategy based on configuration
  const sortingStrategy = strategy === 'horizontal' 
    ? horizontalListSortingStrategy 
    : verticalListSortingStrategy

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const item = items.find(item => item.id === active.id)
    setActiveItem(item || null)
  }, [items])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    setOverId(over?.id as string || null)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveItem(null)
    setOverId(null)

    if (!over) return

    const activeItem = items.find(item => item.id === active.id)
    if (!activeItem) return

    // Handle reordering within the same container
    if (active.id !== over.id && items.some(item => item.id === over.id)) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)
      
      const reorderedItems = arrayMove(items, oldIndex, newIndex)
      onReorder?.(reorderedItems)
      return
    }

    // Handle dropping to a different container/zone
    if (onDrop && over.id !== active.id) {
      const dropZone: DropZone = {
        id: over.id as string,
        data: over.data?.current,
      }
      onDrop(activeItem, dropZone)
    }
  }, [items, onReorder, onDrop])

  const handleDragCancel = useCallback(() => {
    setActiveItem(null)
    setOverId(null)
  }, [])

  // Drop animation configuration
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }

  return {
    // DndContext props
    sensors,
    collisionDetection: closestCenter,
    modifiers: finalModifiers,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel,
    
    // SortableContext props
    items: items.map(item => item.id),
    strategy: sortingStrategy,
    
    // State
    activeItem,
    overId,
    isDisabled: disabled,
    
    // Utilities
    dropAnimation,
  }
}

/**
 * Simplified hook for managing drag and drop between multiple containers
 * Note: This is a simplified version. For complex multi-container scenarios,
 * consider using the @dnd-kit examples directly.
 */
export function useMultiContainerDragAndDrop<T extends DragItem>() {
  const [containers, setContainers] = useState<Record<string, T[]>>({})
  const [activeItem] = useState<T | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addContainer = useCallback((id: string, items: T[] = []) => {
    setContainers(prev => ({
      ...prev,
      [id]: items,
    }))
  }, [])

  const removeContainer = useCallback((id: string) => {
    setContainers(prev => {
      const newContainers = { ...prev }
      delete newContainers[id]
      return newContainers
    })
  }, [])

  const addItem = useCallback((containerId: string, item: T, index?: number) => {
    setContainers(prev => {
      const items = prev[containerId] || []
      const newItems = [...items]
      
      if (index !== undefined) {
        newItems.splice(index, 0, item)
      } else {
        newItems.push(item)
      }
      
      return {
        ...prev,
        [containerId]: newItems,
      }
    })
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setContainers(prev => {
      const newContainers = { ...prev }
      
      Object.keys(newContainers).forEach(containerId => {
        const items = newContainers[containerId]
        if (items) {
          newContainers[containerId] = items.filter(item => item.id !== itemId)
        }
      })
      
      return newContainers
    })
  }, [])

  return {
    containers,
    setContainers,
    activeItem,
    sensors,
    collisionDetection: closestCenter,
    addContainer,
    removeContainer,
    addItem,
    removeItem,
  }
}

/**
 * Hook for drag and drop with validation and constraints
 */
export function useValidatedDragAndDrop<T extends DragItem>({
  items,
  onReorder,
  canDrop,
  canDrag,
  maxItems,
  minItems = 0,
}: {
  items: T[]
  onReorder?: (items: T[]) => void
  canDrop?: (item: T, targetIndex: number) => boolean
  canDrag?: (item: T) => boolean
  maxItems?: number
  minItems?: number
}) {
  const [draggedItem, setDraggedItem] = useState<T | null>(null)
  const [validDropZones, setValidDropZones] = useState<number[]>([])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const item = items.find(item => item.id === event.active.id)
    if (!item || (canDrag && !canDrag(item))) {
      return
    }

    setDraggedItem(item)

    // Calculate valid drop zones
    if (canDrop) {
      const validZones: number[] = []
      for (let i = 0; i <= items.length; i++) {
        if (canDrop(item, i)) {
          validZones.push(i)
        }
      }
      setValidDropZones(validZones)
    }
  }, [items, canDrag, canDrop])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    setDraggedItem(null)
    setValidDropZones([])

    if (!over || !draggedItem) return

    const oldIndex = items.findIndex(item => item.id === active.id)
    const newIndex = items.findIndex(item => item.id === over.id)

    // Validate the drop
    if (canDrop && !canDrop(draggedItem, newIndex)) {
      return
    }

    // Check item limits
    if (maxItems && items.length >= maxItems && newIndex >= items.length) {
      return
    }

    if (minItems && items.length <= minItems && oldIndex < items.length) {
      return
    }

    if (oldIndex !== newIndex) {
      const reorderedItems = arrayMove(items, oldIndex, newIndex)
      onReorder?.(reorderedItems)
    }
  }, [items, draggedItem, canDrop, maxItems, minItems, onReorder])

  return {
    draggedItem,
    validDropZones,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    canReorder: items.length > minItems,
    canAddMore: !maxItems || items.length < maxItems,
  }
}