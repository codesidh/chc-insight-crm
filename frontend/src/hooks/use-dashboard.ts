import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-client'

// Dashboard metrics hook
export function useDashboardMetrics(filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.dashboard.metrics(filters),
    queryFn: () => dashboardApi.getMetrics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard data should be relatively fresh
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  })
}

// Compliance data hook
export function useComplianceData(dateRange?: { start: Date; end: Date }) {
  const formattedDateRange = dateRange ? {
    start: dateRange.start.toISOString(),
    end: dateRange.end.toISOString(),
  } : undefined

  return useQuery({
    queryKey: queryKeys.dashboard.compliance(dateRange),
    queryFn: () => dashboardApi.getComplianceData(formattedDateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refetch every 10 minutes
  })
}

// Productivity data hook
export function useProductivityData(userId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.productivity(userId),
    queryFn: () => dashboardApi.getProductivityData(userId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  })
}

// Combined dashboard data hook for executive dashboard
export function useExecutiveDashboard(filters?: {
  dateRange?: { start: Date; end: Date }
  region?: string
  surveyType?: string
}) {
  const metricsQuery = useDashboardMetrics(filters)
  const complianceQuery = useComplianceData(filters?.dateRange)
  const productivityQuery = useProductivityData()

  return {
    metrics: {
      data: metricsQuery.data?.data,
      isLoading: metricsQuery.isLoading,
      error: metricsQuery.error,
    },
    compliance: {
      data: complianceQuery.data?.data,
      isLoading: complianceQuery.isLoading,
      error: complianceQuery.error,
    },
    productivity: {
      data: productivityQuery.data?.data,
      isLoading: productivityQuery.isLoading,
      error: productivityQuery.error,
    },
    isLoading: metricsQuery.isLoading || complianceQuery.isLoading || productivityQuery.isLoading,
    hasError: metricsQuery.isError || complianceQuery.isError || productivityQuery.isError,
  }
}

// Role-specific dashboard hooks
export function useCoordinatorDashboard(userId: string, filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['dashboard', 'coordinator', userId, filters],
    queryFn: () => dashboardApi.getMetrics({ ...filters, userId, role: 'coordinator' }),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: !!userId,
  })
}

export function useManagerDashboard(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['dashboard', 'manager', filters],
    queryFn: () => dashboardApi.getMetrics({ ...filters, role: 'manager' }),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}