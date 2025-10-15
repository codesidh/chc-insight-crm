import { useState, useEffect, useCallback } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { FormInstance, FormTemplate, FormStatus, ResponseData, QuestionType } from '@/types'
import { surveyApi } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-client'
import { useAutoSave } from './use-form'

// Create dynamic validation schema based on form template
const createFormValidationSchema = (template: FormTemplate) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {}
  
  template.questions.forEach((question) => {
    let fieldSchema: z.ZodTypeAny
    
    switch (question.type) {
      case QuestionType.TEXT_INPUT:
        fieldSchema = z.string()
        break
      case QuestionType.NUMERIC_INPUT:
        fieldSchema = z.number()
        break
      case QuestionType.DATE:
      case QuestionType.DATETIME:
        fieldSchema = z.date()
        break
      case QuestionType.SINGLE_SELECT:
        fieldSchema = z.string()
        break
      case QuestionType.MULTI_SELECT:
        fieldSchema = z.array(z.string())
        break
      case QuestionType.YES_NO:
        fieldSchema = z.boolean()
        break
      case QuestionType.FILE_UPLOAD:
        fieldSchema = z.any().optional()
        break
      default:
        fieldSchema = z.any().optional()
    }
    
    // Apply required validation
    if (!question.required) {
      fieldSchema = fieldSchema.optional()
    }
    
    // Apply custom validation rules
    question.validation?.forEach((rule) => {
      switch (rule.type) {
        case 'min_length':
          if (fieldSchema instanceof z.ZodString) {
            fieldSchema = fieldSchema.min(rule.value, rule.message)
          }
          break
        case 'max_length':
          if (fieldSchema instanceof z.ZodString) {
            fieldSchema = fieldSchema.max(rule.value, rule.message)
          }
          break
        case 'min_value':
          if (fieldSchema instanceof z.ZodNumber) {
            fieldSchema = fieldSchema.min(rule.value, rule.message)
          }
          break
        case 'max_value':
          if (fieldSchema instanceof z.ZodNumber) {
            fieldSchema = fieldSchema.max(rule.value, rule.message)
          }
          break
        case 'pattern':
          if (fieldSchema instanceof z.ZodString) {
            fieldSchema = fieldSchema.regex(new RegExp(rule.value), rule.message)
          }
          break
      }
    })
    
    schemaFields[question.id] = fieldSchema
  })
  
  return z.object(schemaFields)
}

interface UseFormExecutionOptions {
  instanceId: string
  readonly?: boolean
  autoSaveEnabled?: boolean
  autoSaveDelay?: number
  onSave?: (instanceId: string, responses: ResponseData[]) => void
  onSubmit?: (instanceId: string) => void
  onError?: (error: any) => void
}

interface UseFormExecutionReturn {
  // Form instance data
  instance: FormInstance | null
  template: FormTemplate | null
  isLoading: boolean
  error: any
  
  // Form state
  form: UseFormReturn<any>
  progress: number
  answeredQuestions: number
  totalQuestions: number
  canSubmit: boolean
  
  // Form actions
  saveResponse: (isDraft?: boolean) => Promise<void>
  submitForm: () => Promise<void>
  
  // Auto-save state
  lastSaved: Date | null
  isSaving: boolean
  isSubmitting: boolean
  
  // Utility functions
  calculateProgress: () => number
  getFormData: () => Record<string, any>
  resetForm: () => void
}

export function useFormExecution({
  instanceId,
  readonly = false,
  autoSaveEnabled = true,
  autoSaveDelay = 2000,
  onSave,
  onSubmit,
  onError
}: UseFormExecutionOptions): UseFormExecutionReturn {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  
  // Fetch form instance data
  const { 
    data: instanceResponse, 
    isLoading, 
    error: instanceError 
  } = useQuery({
    queryKey: queryKeys.surveys.instance(instanceId),
    queryFn: () => surveyApi.getInstance(instanceId),
    enabled: !!instanceId,
  })
  
  const instance = instanceResponse?.data as FormInstance | null
  // Note: In a real implementation, template would be fetched separately or included in the instance response
  const template = (instance as any)?.template as FormTemplate | null
  
  // Create validation schema based on template
  const validationSchema = template ? createFormValidationSchema(template) : z.object({})
  
  // Initialize form with existing response data
  const form = useForm({
    resolver: template ? zodResolver(validationSchema) as any : undefined,
    defaultValues: instance?.responseData?.reduce((acc, response) => {
      acc[response.questionId] = response.value
      return acc
    }, {} as Record<string, any>) || {},
    mode: 'onChange',
  })
  
  // Auto-save mutation
  const saveResponseMutation = useMutation({
    mutationFn: ({ responses, isDraft = true }: { responses: ResponseData[]; isDraft?: boolean }) =>
      surveyApi.saveResponse(instanceId, responses, isDraft),
    onSuccess: (_, { isDraft }) => {
      setLastSaved(new Date())
      if (onSave && instance) {
        const responses = Object.entries(form.getValues()).map(([questionId, value]) => ({
          questionId,
          value,
          metadata: { savedAt: new Date(), isDraft }
        }))
        onSave(instanceId, responses)
      }
      
      if (!isDraft) {
        toast.success('Responses saved successfully')
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to save responses'
      toast.error(errorMessage)
      if (onError) {
        onError(error)
      }
    },
  })
  
  // Submit form mutation
  const submitMutation = useMutation({
    mutationFn: () => surveyApi.submitSurvey(instanceId),
    onSuccess: () => {
      toast.success('Form submitted successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.instance(instanceId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.instances() })
      
      if (onSubmit) {
        onSubmit(instanceId)
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to submit form'
      toast.error(errorMessage)
      if (onError) {
        onError(error)
      }
    },
  })
  
  // Calculate form completion progress
  const calculateProgress = useCallback(() => {
    if (!template?.questions) return 0
    
    const formData = form.getValues()
    const answeredQuestions = template.questions.filter(question => {
      const value = formData[question.id]
      return value !== undefined && value !== null && value !== ''
    })
    
    return Math.round((answeredQuestions.length / template.questions.length) * 100)
  }, [template?.questions, form])
  
  const progress = calculateProgress()
  const answeredQuestions = template?.questions ? Math.round((progress / 100) * template.questions.length) : 0
  const totalQuestions = template?.questions?.length || 0
  
  const canSubmit = !readonly && 
                   instance?.status === FormStatus.DRAFT && 
                   progress === 100 && 
                   form.formState.isValid
  
  // Auto-save functionality
  useAutoSave({
    watch: form.watch,
    onSave: (data) => {
      if (!readonly && 
          instance?.status === FormStatus.DRAFT && 
          autoSaveEnabled &&
          !saveResponseMutation.isPending) {
        const responses: ResponseData[] = Object.entries(data).map(([questionId, value]) => ({
          questionId,
          value,
          metadata: { autoSaved: true, timestamp: new Date() }
        }))
        saveResponseMutation.mutate({ responses, isDraft: true })
      }
    },
    delay: autoSaveDelay,
    enabled: autoSaveEnabled && !readonly && instance?.status === FormStatus.DRAFT,
  })
  
  // Update form values when instance data changes
  useEffect(() => {
    if (instance?.responseData) {
      const formData = instance.responseData.reduce((acc, response) => {
        acc[response.questionId] = response.value
        return acc
      }, {} as Record<string, any>)
      
      Object.entries(formData).forEach(([key, value]) => {
        form.setValue(key, value)
      })
    }
  }, [instance?.responseData, form])
  
  // Manual save function
  const saveResponse = useCallback(async (isDraft = true) => {
    const formData = form.getValues()
    const responses: ResponseData[] = Object.entries(formData).map(([questionId, value]) => ({
      questionId,
      value,
      metadata: { manualSave: true, timestamp: new Date() }
    }))
    
    await saveResponseMutation.mutateAsync({ responses, isDraft })
  }, [form, saveResponseMutation])
  
  // Submit form function
  const submitForm = useCallback(async () => {
    setIsSubmitting(true)
    
    try {
      // First validate the form
      const isValid = await form.trigger()
      
      if (!isValid) {
        toast.error('Please fix validation errors before submitting')
        return
      }
      
      // Save final responses
      await saveResponse(false)
      
      // Submit the form
      await submitMutation.mutateAsync()
      
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [form, saveResponse, submitMutation])
  
  // Get current form data
  const getFormData = useCallback(() => {
    return form.getValues()
  }, [form])
  
  // Reset form to initial state
  const resetForm = useCallback(() => {
    form.reset()
    setLastSaved(null)
  }, [form])
  
  return {
    // Form instance data
    instance,
    template,
    isLoading,
    error: instanceError,
    
    // Form state
    form,
    progress,
    answeredQuestions,
    totalQuestions,
    canSubmit,
    
    // Form actions
    saveResponse,
    submitForm,
    
    // Auto-save state
    lastSaved,
    isSaving: saveResponseMutation.isPending,
    isSubmitting: isSubmitting || submitMutation.isPending,
    
    // Utility functions
    calculateProgress,
    getFormData,
    resetForm,
  }
}