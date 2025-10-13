import { QueryClient } from '@tanstack/react-query'

// Default query options for consistent behavior across the app
const defaultQueryOptions = {
  queries: {
    // Stale time: 5 minutes - data is considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache time: 10 minutes - data stays in cache for 10 minutes after becoming unused
    gcTime: 10 * 60 * 1000,
    // Retry failed requests 3 times with exponential backoff
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false
      }
      // Retry up to 3 times for other errors
      return failureCount < 3
    },
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus for critical data
    refetchOnWindowFocus: false,
    // Refetch on reconnect
    refetchOnReconnect: true,
  },
  mutations: {
    // Retry mutations once on network errors
    retry: (failureCount: number, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false
      }
      return failureCount < 1
    },
  },
}

// Global error handler for queries
const handleQueryError = (error: any) => {
  console.error('Query error:', error)
  
  // Handle specific error types
  if (error?.status === 401) {
    // Redirect to login or refresh token
    console.warn('Unauthorized access - redirecting to login')
    // In a real app, you might want to redirect to login or refresh token
    // window.location.href = '/login'
  } else if (error?.status === 403) {
    console.warn('Forbidden access')
    // Show permission denied message
  } else if (error?.status >= 500) {
    console.error('Server error')
    // Show generic server error message
  }
}

// Create and configure the query client
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
  // Global error handler
  mutationCache: {
    onError: handleQueryError,
  } as any,
})

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth related queries
  auth: {
    user: () => ['auth', 'user'] as const,
    permissions: (userId: string) => ['auth', 'permissions', userId] as const,
  },
  
  // Survey related queries
  surveys: {
    all: () => ['surveys'] as const,
    lists: () => [...queryKeys.surveys.all(), 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.surveys.lists(), filters] as const,
    details: () => [...queryKeys.surveys.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.surveys.details(), id] as const,
    templates: () => [...queryKeys.surveys.all(), 'templates'] as const,
    template: (id: string) => [...queryKeys.surveys.templates(), id] as const,
    instances: () => [...queryKeys.surveys.all(), 'instances'] as const,
    instance: (id: string) => [...queryKeys.surveys.instances(), id] as const,
  },
  
  // Member related queries
  members: {
    all: () => ['members'] as const,
    search: (query: string) => [...queryKeys.members.all(), 'search', query] as const,
    detail: (id: string) => [...queryKeys.members.all(), 'detail', id] as const,
  },
  
  // Provider related queries
  providers: {
    all: () => ['providers'] as const,
    search: (query: string) => [...queryKeys.providers.all(), 'search', query] as const,
    detail: (id: string) => [...queryKeys.providers.all(), 'detail', id] as const,
  },
  
  // Dashboard related queries
  dashboard: {
    all: () => ['dashboard'] as const,
    metrics: (filters?: Record<string, any>) => [...queryKeys.dashboard.all(), 'metrics', filters] as const,
    compliance: (dateRange?: { start: Date; end: Date }) => [...queryKeys.dashboard.all(), 'compliance', dateRange] as const,
    productivity: (userId?: string) => [...queryKeys.dashboard.all(), 'productivity', userId] as const,
  },
  
  // Work queue related queries
  workQueue: {
    all: () => ['work-queue'] as const,
    tasks: (userId: string, filters?: Record<string, any>) => [...queryKeys.workQueue.all(), 'tasks', userId, filters] as const,
  },
  
  // Reports related queries
  reports: {
    all: () => ['reports'] as const,
    templates: () => [...queryKeys.reports.all(), 'templates'] as const,
    history: (userId?: string) => [...queryKeys.reports.all(), 'history', userId] as const,
  },
}

// Utility function to invalidate related queries
export const invalidateQueries = {
  surveys: () => queryClient.invalidateQueries({ queryKey: queryKeys.surveys.all() }),
  members: () => queryClient.invalidateQueries({ queryKey: queryKeys.members.all() }),
  providers: () => queryClient.invalidateQueries({ queryKey: queryKeys.providers.all() }),
  dashboard: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() }),
  workQueue: () => queryClient.invalidateQueries({ queryKey: queryKeys.workQueue.all() }),
  reports: () => queryClient.invalidateQueries({ queryKey: queryKeys.reports.all() }),
}