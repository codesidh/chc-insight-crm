import { useMutation, useQueryClient, QueryKey } from '@tanstack/react-query'

/**
 * Generic hook for optimistic updates with TanStack Query
 */
export function useOptimisticMutation<TData, TVariables, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  queryKey: QueryKey | ((variables: TVariables) => QueryKey),
  updater: (oldData: TData | undefined, variables: TVariables) => TData,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: TError, variables: TVariables) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      const resolvedQueryKey = typeof queryKey === 'function' 
        ? queryKey(variables) 
        : queryKey

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: resolvedQueryKey })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(resolvedQueryKey)

      // Optimistically update to the new value
      queryClient.setQueryData<TData>(resolvedQueryKey, (old) => 
        updater(old, variables)
      )

      // Return a context object with the snapshotted value
      return { previousData, queryKey: resolvedQueryKey }
    },
    onError: (error: any, variables: TVariables, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousData)
      }
      options?.onError?.(error, variables)
    },
    onSettled: (_data: any, _error: any, _variables: TVariables, context: any) => {
      // Always refetch after error or success
      if (context) {
        queryClient.invalidateQueries({ queryKey: context.queryKey })
      }
    },
    onSuccess: (data: TData, variables: TVariables) => {
      options?.onSuccess?.(data, variables)
    },
  })
}

/**
 * Utility function to create optimistic update options for TanStack Query mutations
 */
export function createOptimisticOptions<TData, TVariables>(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: QueryKey | ((variables: TVariables) => QueryKey),
  updater: (oldData: TData | undefined, variables: TVariables) => TData
) {
  return {
    onMutate: async (variables: TVariables) => {
      const resolvedQueryKey = typeof queryKey === 'function' 
        ? queryKey(variables) 
        : queryKey

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: resolvedQueryKey })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(resolvedQueryKey)

      // Optimistically update to the new value
      queryClient.setQueryData<TData>(resolvedQueryKey, (old) => 
        updater(old, variables)
      )

      // Return a context object with the snapshotted value
      return { previousData, queryKey: resolvedQueryKey }
    },
    onError: (_error: any, _variables: TVariables, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousData)
      }
    },
    onSettled: (_data: any, _error: any, _variables: TVariables, context: any) => {
      // Always refetch after error or success
      if (context) {
        queryClient.invalidateQueries({ queryKey: context.queryKey })
      }
    },
  }
}

// Note: For specific optimistic update patterns, use the base useOptimisticMutation hook
// and implement the specific logic in your components. The strict TypeScript configuration
// makes it challenging to create generic wrapper hooks that satisfy all type constraints.
//
// Example usage:
// const mutation = useOptimisticMutation(
//   updateItem,
//   ['items'],
//   (oldData, newItem) => oldData ? [...oldData, newItem] : [newItem],
//   {
//     onSuccess: (data) => console.log('Success:', data),
//     onError: (error) => console.error('Error:', error)
//   }
// )