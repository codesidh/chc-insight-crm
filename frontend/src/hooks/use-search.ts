import { useQuery } from '@tanstack/react-query'
import { memberApi, providerApi } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-client'
import { useDebounce } from './use-debounce'

// Member search hook
export function useMemberSearch(query: string, options?: { limit?: number; enabled?: boolean }) {
  const debouncedQuery = useDebounce(query, 300) // Debounce search queries
  
  return useQuery({
    queryKey: queryKeys.members.search(debouncedQuery),
    queryFn: () => memberApi.search(debouncedQuery, options?.limit ? { limit: options.limit } : undefined),
    enabled: (options?.enabled !== false) && debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes - member data doesn't change frequently
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

// Provider search hook
export function useProviderSearch(query: string, options?: { 
  limit?: number
  specialty?: string
  networkStatus?: 'in_network' | 'out_of_network' | 'both'
  enabled?: boolean 
}) {
  const debouncedQuery = useDebounce(query, 300)
  
  return useQuery({
    queryKey: queryKeys.providers.search(debouncedQuery),
    queryFn: () => {
      const searchParams: any = {}
      if (options?.limit) searchParams.limit = options.limit
      if (options?.specialty) searchParams.specialty = options.specialty
      if (options?.networkStatus) searchParams.networkStatus = options.networkStatus
      return providerApi.search(debouncedQuery, Object.keys(searchParams).length > 0 ? searchParams : undefined)
    },
    enabled: (options?.enabled !== false) && debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Member details hook
export function useMember(id: string) {
  return useQuery({
    queryKey: queryKeys.members.detail(id),
    queryFn: () => memberApi.getMember(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Provider details hook
export function useProvider(id: string) {
  return useQuery({
    queryKey: queryKeys.providers.detail(id),
    queryFn: () => providerApi.getProvider(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}

// Pre-population data hook
export function usePrePopulationData(memberId?: string, providerId?: string) {
  return useQuery({
    queryKey: ['pre-populate', memberId, providerId],
    queryFn: () => memberApi.getPrePopulationData(memberId!, providerId),
    enabled: !!memberId,
    staleTime: 2 * 60 * 1000, // 2 minutes - this data should be relatively fresh
  })
}

// Combined search hook for type-ahead components
export function useTypeAheadSearch(
  type: 'member' | 'provider',
  query: string,
  options?: {
    limit?: number
    enabled?: boolean
    specialty?: string
    networkStatus?: 'in_network' | 'out_of_network' | 'both'
  }
) {
  const memberQuery = useMemberSearch(query, {
    ...(options?.limit ? { limit: options.limit } : {}),
    enabled: type === 'member' && (options?.enabled !== false),
  })

  const providerQuery = useProviderSearch(query, {
    ...(options?.limit ? { limit: options.limit } : {}),
    ...(options?.specialty ? { specialty: options.specialty } : {}),
    ...(options?.networkStatus ? { networkStatus: options.networkStatus } : {}),
    enabled: type === 'provider' && (options?.enabled !== false),
  })

  if (type === 'member') {
    return {
      data: memberQuery.data?.data || [],
      isLoading: memberQuery.isLoading,
      error: memberQuery.error,
      isError: memberQuery.isError,
    }
  }

  return {
    data: providerQuery.data?.data || [],
    isLoading: providerQuery.isLoading,
    error: providerQuery.error,
    isError: providerQuery.isError,
  }
}