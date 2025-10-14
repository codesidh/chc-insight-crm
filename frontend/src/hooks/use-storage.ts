import { useState, useEffect, useCallback, useRef } from 'react'

type StorageType = 'localStorage' | 'sessionStorage'

/**
 * Hook for managing localStorage and sessionStorage with TypeScript support
 */
export function useStorage<T>(
  key: string,
  defaultValue: T,
  storageType: StorageType = 'localStorage'
) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue
    }

    try {
      const storage = window[storageType]
      const item = storage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading ${storageType} key "${key}":`, error)
      return defaultValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        if (typeof window !== 'undefined') {
          const storage = window[storageType]
          storage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.warn(`Error setting ${storageType} key "${key}":`, error)
      }
    },
    [key, storedValue, storageType]
  )

  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue)
      if (typeof window !== 'undefined') {
        const storage = window[storageType]
        storage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing ${storageType} key "${key}":`, error)
    }
  }, [key, defaultValue, storageType])

  return [storedValue, setValue, removeValue] as const
}

/**
 * Hook for localStorage specifically
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  return useStorage(key, defaultValue, 'localStorage')
}

/**
 * Hook for sessionStorage specifically
 */
export function useSessionStorage<T>(key: string, defaultValue: T) {
  return useStorage(key, defaultValue, 'sessionStorage')
}

/**
 * Hook for managing user preferences with automatic persistence
 */
export function useUserPreferences<T extends Record<string, any>>(
  defaultPreferences: T,
  storageKey = 'user-preferences'
) {
  const [preferences, setPreferences, clearPreferences] = useLocalStorage(
    storageKey,
    defaultPreferences
  )

  const updatePreference = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setPreferences(prev => ({
        ...prev,
        [key]: value,
      }))
    },
    [setPreferences]
  )

  const updatePreferences = useCallback(
    (updates: Partial<T>) => {
      setPreferences(prev => ({
        ...prev,
        ...updates,
      }))
    },
    [setPreferences]
  )

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences)
  }, [setPreferences, defaultPreferences])

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    clearPreferences,
  }
}

/**
 * Hook for managing form drafts with auto-save
 */
export function useFormDraft<T extends Record<string, any>>(
  formId: string,
  defaultValues: T,
  options: {
    autoSaveDelay?: number
    enabled?: boolean
  } = {}
) {
  const { autoSaveDelay = 1000, enabled = true } = options
  const [draft, setDraft, clearDraft] = useLocalStorage(
    `form-draft-${formId}`,
    defaultValues
  )
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const saveDraft = useCallback(
    (values: T) => {
      if (!enabled) return
      
      setDraft(values)
      setLastSaved(new Date())
      setIsDirty(false)
    },
    [setDraft, enabled]
  )

  const updateDraft = useCallback(
    (values: Partial<T>) => {
      if (!enabled) return

      const newDraft = { ...draft, ...values }
      setDraft(newDraft)
      setIsDirty(true)

      // Auto-save with debounce
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setLastSaved(new Date())
        setIsDirty(false)
      }, autoSaveDelay)
    },
    [draft, setDraft, autoSaveDelay, enabled]
  )

  const deleteDraft = useCallback(() => {
    clearDraft()
    setIsDirty(false)
    setLastSaved(null)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [clearDraft])

  const hasDraft = useCallback(() => {
    return JSON.stringify(draft) !== JSON.stringify(defaultValues)
  }, [draft, defaultValues])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    draft,
    saveDraft,
    updateDraft,
    deleteDraft,
    hasDraft: hasDraft(),
    isDirty,
    lastSaved,
    isEnabled: enabled,
  }
}

/**
 * Hook for managing application cache with expiration
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number // Time to live in milliseconds
    staleWhileRevalidate?: boolean
    enabled?: boolean
  } = {}
) {
  const { ttl = 5 * 60 * 1000, staleWhileRevalidate = true, enabled = true } = options
  
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const cacheKey = `cache-${key}`
  const timestampKey = `cache-timestamp-${key}`

  const isExpired = useCallback(() => {
    if (typeof window === 'undefined') return true
    
    try {
      const timestamp = localStorage.getItem(timestampKey)
      if (!timestamp) return true
      
      const age = Date.now() - parseInt(timestamp, 10)
      return age > ttl
    } catch {
      return true
    }
  }, [timestampKey, ttl])

  const getCachedData = useCallback((): T | null => {
    if (typeof window === 'undefined' || !enabled) return null
    
    try {
      const cached = localStorage.getItem(cacheKey)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  }, [cacheKey, enabled])

  const setCachedData = useCallback(
    (newData: T) => {
      if (typeof window === 'undefined' || !enabled) return
      
      try {
        localStorage.setItem(cacheKey, JSON.stringify(newData))
        localStorage.setItem(timestampKey, Date.now().toString())
        setLastFetched(new Date())
      } catch (error) {
        console.warn('Failed to cache data:', error)
      }
    },
    [cacheKey, timestampKey, enabled]
  )

  const fetchData = useCallback(async () => {
    if (!enabled) return
    
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      setData(result)
      setCachedData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [fetcher, setCachedData, enabled])

  const invalidate = useCallback(() => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(timestampKey)
      setData(null)
      setLastFetched(null)
    } catch (error) {
      console.warn('Failed to invalidate cache:', error)
    }
  }, [cacheKey, timestampKey])

  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  // Load cached data on mount
  useEffect(() => {
    if (!enabled) return
    
    const cached = getCachedData()
    
    if (cached && !isExpired()) {
      setData(cached)
      
      // Try to get timestamp for lastFetched
      try {
        const timestamp = localStorage.getItem(timestampKey)
        if (timestamp) {
          setLastFetched(new Date(parseInt(timestamp, 10)))
        }
      } catch {
        // Ignore timestamp errors
      }
      
      // If stale-while-revalidate is enabled, fetch in background
      if (staleWhileRevalidate) {
        fetchData()
      }
    } else {
      // No valid cache, fetch immediately
      fetchData()
    }
  }, [enabled, getCachedData, isExpired, staleWhileRevalidate, fetchData, timestampKey])

  return {
    data,
    isLoading,
    error,
    lastFetched,
    refresh,
    invalidate,
    isStale: isExpired(),
  }
}

/**
 * Hook for managing recent items list
 */
export function useRecentItems<T extends { id: string | number }>(
  storageKey: string,
  maxItems = 10
) {
  const [recentItems, setRecentItems] = useLocalStorage<T[]>(storageKey, [])

  const addRecentItem = useCallback(
    (item: T) => {
      setRecentItems(prev => {
        // Remove existing item if it exists
        const filtered = prev.filter(existing => existing.id !== item.id)
        
        // Add to beginning and limit to maxItems
        return [item, ...filtered].slice(0, maxItems)
      })
    },
    [setRecentItems, maxItems]
  )

  const removeRecentItem = useCallback(
    (id: string | number) => {
      setRecentItems(prev => prev.filter(item => item.id !== id))
    },
    [setRecentItems]
  )

  const clearRecentItems = useCallback(() => {
    setRecentItems([])
  }, [setRecentItems])

  return {
    recentItems,
    addRecentItem,
    removeRecentItem,
    clearRecentItems,
  }
}