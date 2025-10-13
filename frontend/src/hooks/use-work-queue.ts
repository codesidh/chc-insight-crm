import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workQueueApi } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-client'
import { toast } from 'sonner'

// Work queue tasks hook
export function useWorkQueueTasks(
  userId: string,
  filters?: {
    status?: 'pending' | 'in_progress' | 'completed' | 'overdue'
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    assignedTo?: string
    dueDate?: { start: Date; end: Date }
    surveyType?: string
    page?: number
    limit?: number
  }
) {
  return useQuery({
    queryKey: queryKeys.workQueue.tasks(userId, filters),
    queryFn: () => workQueueApi.getTasks(userId, filters),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - work queue should be fresh
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
  })
}

// Assign task mutation
export function useAssignTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, assigneeId }: { taskId: string; assigneeId: string }) =>
      workQueueApi.assignTask(taskId, assigneeId),
    onMutate: async ({ taskId, assigneeId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.workQueue.all() })

      // Optimistically update the task assignment
      queryClient.setQueriesData(
        { queryKey: queryKeys.workQueue.all() },
        (old: any) => {
          if (!old?.data?.data) return old

          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((task: any) =>
                task.id === taskId
                  ? { ...task, assignedTo: assigneeId, status: 'in_progress' }
                  : task
              ),
            },
          }
        }
      )
    },
    onError: (error: any) => {
      // Invalidate queries to refetch correct data
      queryClient.invalidateQueries({ queryKey: queryKeys.workQueue.all() })
      toast.error(error.message || 'Failed to assign task')
    },
    onSuccess: () => {
      toast.success('Task assigned successfully')
    },
  })
}

// Update task status mutation
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, status, comment }: { 
      taskId: string
      status: string
      comment?: string 
    }) => workQueueApi.updateTaskStatus(taskId, status, comment),
    onMutate: async ({ taskId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.workQueue.all() })

      // Optimistically update the task status
      queryClient.setQueriesData(
        { queryKey: queryKeys.workQueue.all() },
        (old: any) => {
          if (!old?.data?.data) return old

          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((task: any) =>
                task.id === taskId
                  ? { 
                      ...task, 
                      status,
                      updatedAt: new Date().toISOString(),
                    }
                  : task
              ),
            },
          }
        }
      )
    },
    onError: (error: any) => {
      // Invalidate queries to refetch correct data
      queryClient.invalidateQueries({ queryKey: queryKeys.workQueue.all() })
      toast.error(error.message || 'Failed to update task status')
    },
    onSuccess: (_, { status }) => {
      // Also invalidate dashboard and survey queries as they might be affected
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.instances() })
      
      const statusMessages: Record<string, string> = {
        'in_progress': 'Task started',
        'completed': 'Task completed',
        'rejected': 'Task rejected',
        'pending': 'Task returned to pending',
      }
      
      toast.success(statusMessages[status] || 'Task status updated')
    },
  })
}

// Bulk task operations
export function useBulkAssignTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskIds, assigneeId }: { taskIds: string[]; assigneeId: string }) => {
      // Execute assignments in parallel
      const promises = taskIds.map(taskId => 
        workQueueApi.assignTask(taskId, assigneeId)
      )
      return Promise.all(promises)
    },
    onSuccess: (_, { taskIds }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workQueue.all() })
      toast.success(`${taskIds.length} tasks assigned successfully`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign tasks')
    },
  })
}

export function useBulkUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskIds, status, comment }: { 
      taskIds: string[]
      status: string
      comment?: string 
    }) => {
      // Execute status updates in parallel
      const promises = taskIds.map(taskId => 
        workQueueApi.updateTaskStatus(taskId, status, comment)
      )
      return Promise.all(promises)
    },
    onSuccess: (_, { taskIds, status }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workQueue.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() })
      
      const statusMessages: Record<string, string> = {
        'completed': 'Tasks completed',
        'rejected': 'Tasks rejected',
        'in_progress': 'Tasks started',
      }
      
      toast.success(`${taskIds.length} ${statusMessages[status] || 'tasks updated'}`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update tasks')
    },
  })
}

// Work queue statistics hook
export function useWorkQueueStats(userId: string) {
  return useQuery({
    queryKey: ['work-queue', 'stats', userId],
    queryFn: async () => {
      // This would typically be a separate API endpoint
      // For now, we'll derive stats from the tasks data
      const response = await workQueueApi.getTasks(userId)
      const tasks = response.data.data

      return {
        total: tasks.length,
        pending: tasks.filter((t: any) => t.status === 'pending').length,
        inProgress: tasks.filter((t: any) => t.status === 'in_progress').length,
        overdue: tasks.filter((t: any) => 
          t.status !== 'completed' && new Date(t.dueDate) < new Date()
        ).length,
        completed: tasks.filter((t: any) => t.status === 'completed').length,
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}