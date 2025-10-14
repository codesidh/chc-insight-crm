import { useState, useCallback, useEffect, useRef } from 'react'

export interface AsyncState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

export interface UseAsyncOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  retryCount?: number
  retryDelay?: number
}

/**
 * Hook for managing async operations with loading states and error handling
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const {
    immediate = false,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
  } = options

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  })

  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)

  const execute = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isError: false,
    }))

    try {
      const data = await asyncFunction()
      
      if (mountedRef.current) {
        setState({
          data,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        })
        onSuccess?.(data)
        retryCountRef.current = 0
      }
    } catch (error) {
      if (mountedRef.current) {
        const err = error as Error
        
        // Retry logic
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++
          setTimeout(() => {
            if (mountedRef.current) {
              execute()
            }
          }, retryDelay)
          return
        }

        setState({
          data: null,
          error: err,
          isLoading: false,
          isSuccess: false,
          isError: true,
        })
        onError?.(err)
      }
    }
  }, [asyncFunction, onSuccess, onError, retryCount, retryDelay])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    })
    retryCountRef.current = 0
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    ...state,
    execute,
    reset,
    retry: execute,
  }
}

/**
 * Hook for managing multiple async operations
 */
export function useAsyncQueue<T>() {
  const [queue, setQueue] = useState<Array<{
    id: string
    promise: Promise<T>
    status: 'pending' | 'fulfilled' | 'rejected'
    result?: T
    error?: Error
  }>>([])

  const addToQueue = useCallback((id: string, promise: Promise<T>) => {
    setQueue(prev => [
      ...prev,
      { id, promise, status: 'pending' }
    ])

    promise
      .then(result => {
        setQueue(prev => prev.map(item =>
          item.id === id
            ? { ...item, status: 'fulfilled', result }
            : item
        ))
      })
      .catch(error => {
        setQueue(prev => prev.map(item =>
          item.id === id
            ? { ...item, status: 'rejected', error }
            : item
        ))
      })

    return promise
  }, [])

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
  }, [])

  const pendingCount = queue.filter(item => item.status === 'pending').length
  const completedCount = queue.filter(item => item.status === 'fulfilled').length
  const errorCount = queue.filter(item => item.status === 'rejected').length

  return {
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    pendingCount,
    completedCount,
    errorCount,
    isProcessing: pendingCount > 0,
  }
}

/**
 * Hook for managing async operations with cancellation
 */
export function useCancellableAsync<T>(
  asyncFunction: (signal: AbortSignal) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const cancellableAsyncFunction = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()
    
    try {
      return await asyncFunction(abortControllerRef.current.signal)
    } catch (error) {
      // Don't throw if the request was cancelled
      if (error instanceof Error && error.name === 'AbortError') {
        return null as T
      }
      throw error
    }
  }, [asyncFunction])

  const asyncState = useAsync(cancellableAsyncFunction, options)

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  return {
    ...asyncState,
    cancel,
  }
}

/**
 * Hook for polling data at regular intervals
 */
export function usePolling<T>(
  asyncFunction: () => Promise<T>,
  interval: number,
  options: UseAsyncOptions & {
    enabled?: boolean
    stopOnError?: boolean
  } = {}
) {
  const { enabled = true, stopOnError = false, ...asyncOptions } = options
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  const asyncState = useAsync(asyncFunction, {
    ...asyncOptions,
    immediate: false,
  })

  const startPolling = useCallback(() => {
    if (!enabled || isPolling) return

    setIsPolling(true)
    
    // Execute immediately
    asyncState.execute()

    // Set up interval
    intervalRef.current = setInterval(() => {
      asyncState.execute()
    }, interval)
  }, [enabled, isPolling, asyncState, interval])

  const stopPolling = useCallback(() => {
    setIsPolling(false)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Auto-start polling if enabled
  useEffect(() => {
    if (enabled) {
      startPolling()
    } else {
      stopPolling()
    }

    return stopPolling
  }, [enabled, startPolling, stopPolling])

  // Stop polling on error if configured
  useEffect(() => {
    if (stopOnError && asyncState.isError) {
      stopPolling()
    }
  }, [stopOnError, asyncState.isError, stopPolling])

  return {
    ...asyncState,
    isPolling,
    startPolling,
    stopPolling,
  }
}

/**
 * Hook for debounced async operations
 */
export function useDebouncedAsync<T>(
  asyncFunction: () => Promise<T>,
  delay: number,
  options: UseAsyncOptions = {}
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const asyncState = useAsync(asyncFunction, { ...options, immediate: false })

  const debouncedExecute = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      asyncState.execute()
    }, delay)
  }, [asyncState, delay])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return cancel
  }, [cancel])

  return {
    ...asyncState,
    execute: debouncedExecute,
    cancel,
  }
}

/**
 * Hook for sequential async operations
 */
export function useSequentialAsync<T>() {
  const [operations, setOperations] = useState<Array<{
    id: string
    asyncFunction: () => Promise<T>
    status: 'pending' | 'running' | 'completed' | 'failed'
    result?: T
    error?: Error
  }>>([])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const addOperation = useCallback((id: string, asyncFunction: () => Promise<T>) => {
    setOperations(prev => [
      ...prev,
      { id, asyncFunction, status: 'pending' }
    ])
  }, [])

  const executeSequence = useCallback(async () => {
    if (isRunning || operations.length === 0) return

    setIsRunning(true)
    setCurrentIndex(0)

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i]
      if (!operation) continue
      
      setOperations(prev => prev.map((op, index) =>
        index === i ? { ...op, status: 'running' } : op
      ))
      setCurrentIndex(i)

      try {
        const result = await operation.asyncFunction()
        
        setOperations(prev => prev.map((op, index) =>
          index === i ? { ...op, status: 'completed', result } : op
        ))
      } catch (error) {
        setOperations(prev => prev.map((op, index) =>
          index === i ? { ...op, status: 'failed', error: error as Error } : op
        ))
        break // Stop on first error
      }
    }

    setIsRunning(false)
  }, [operations, isRunning])

  const reset = useCallback(() => {
    setOperations([])
    setCurrentIndex(0)
    setIsRunning(false)
  }, [])

  const removeOperation = useCallback((id: string) => {
    setOperations(prev => prev.filter(op => op.id !== id))
  }, [])

  return {
    operations,
    currentIndex,
    isRunning,
    addOperation,
    executeSequence,
    reset,
    removeOperation,
    progress: operations.length > 0 ? (currentIndex + 1) / operations.length : 0,
  }
}