import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { surveyApi } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-client'
import { toast } from 'sonner' // Assuming we'll add sonner for notifications

// Survey templates hooks
export function useSurveyTemplates(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: queryKeys.surveys.list(params || {}),
    queryFn: () => surveyApi.getTemplates(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSurveyTemplate(id: string) {
  return useQuery({
    queryKey: queryKeys.surveys.template(id),
    queryFn: () => surveyApi.getTemplate(id),
    enabled: !!id,
  })
}

export function useCreateSurveyTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: surveyApi.createTemplate,
    onSuccess: () => {
      // Invalidate and refetch survey templates
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.templates() })
      toast.success('Survey template created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create survey template')
    },
  })
}

export function useUpdateSurveyTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, template }: { id: string; template: any }) =>
      surveyApi.updateTemplate(id, template),
    onMutate: async ({ id, template }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.surveys.template(id) })

      // Snapshot the previous value
      const previousTemplate = queryClient.getQueryData(queryKeys.surveys.template(id))

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.surveys.template(id), (old: any) => ({
        ...old,
        data: { ...old?.data, ...template },
      }))

      return { previousTemplate }
    },
    onError: (_, { id }, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.surveys.template(id), context?.previousTemplate)
      toast.error('Failed to update survey template')
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.templates() })
      toast.success('Survey template updated successfully')
    },
  })
}

export function useDeleteSurveyTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: surveyApi.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.templates() })
      toast.success('Survey template deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete survey template')
    },
  })
}

export function useCopySurveyTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      surveyApi.copyTemplate(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.templates() })
      toast.success('Survey template copied successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to copy survey template')
    },
  })
}

// Survey instances hooks
export function useSurveyInstances(params?: { 
  page?: number
  limit?: number
  status?: string
  assignedTo?: string 
}) {
  return useQuery({
    queryKey: queryKeys.surveys.list(params || {}),
    queryFn: () => surveyApi.getInstances(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for more dynamic data
  })
}

export function useSurveyInstance(id: string) {
  return useQuery({
    queryKey: queryKeys.surveys.instance(id),
    queryFn: () => surveyApi.getInstance(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute for active surveys
  })
}

export function useCreateSurveyInstance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ templateId, context }: { templateId: string; context: any }) =>
      surveyApi.createInstance(templateId, context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.instances() })
      toast.success('Survey instance created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create survey instance')
    },
  })
}

export function useSaveResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ instanceId, responses, isDraft = true }: { 
      instanceId: string
      responses: any[]
      isDraft?: boolean 
    }) => surveyApi.saveResponse(instanceId, responses, isDraft),
    onMutate: async ({ instanceId, responses }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.surveys.instance(instanceId) })

      // Snapshot the previous value
      const previousInstance = queryClient.getQueryData(queryKeys.surveys.instance(instanceId))

      // Optimistically update responses
      queryClient.setQueryData(queryKeys.surveys.instance(instanceId), (old: any) => ({
        ...old,
        data: {
          ...old?.data,
          response_data: responses,
          updated_at: new Date().toISOString(),
        },
      }))

      return { previousInstance }
    },
    onError: (_, { instanceId }, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.surveys.instance(instanceId), context?.previousInstance)
      toast.error('Failed to save responses')
    },
    onSuccess: (_, { isDraft }) => {
      if (!isDraft) {
        toast.success('Responses saved successfully')
      }
    },
  })
}

export function useSubmitSurvey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: surveyApi.submitSurvey,
    onSuccess: (_, instanceId) => {
      // Update the instance status optimistically
      queryClient.setQueryData(queryKeys.surveys.instance(instanceId), (old: any) => ({
        ...old,
        data: {
          ...old?.data,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        },
      }))
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.instances() })
      queryClient.invalidateQueries({ queryKey: queryKeys.workQueue.all() })
      
      toast.success('Survey submitted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit survey')
    },
  })
}

// File upload hook
export function useUploadAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ instanceId, file }: { instanceId: string; file: File }) =>
      surveyApi.uploadAttachment(instanceId, file),
    onSuccess: (_, { instanceId }) => {
      // Invalidate the survey instance to refetch with new attachment
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.instance(instanceId) })
      toast.success('File uploaded successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload file')
    },
  })
}