'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Save, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  FileText,
  User,
  Building
} from 'lucide-react'
import { toast } from 'sonner'

import { FormInstance, FormTemplate, FormStatus, ResponseData } from '@/types'
import { surveyApi } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-client'
import { useAutoSave } from '@/hooks/use-form'
import { DynamicFormRenderer } from './dynamic-form-renderer'
import { FormProgressIndicator } from './form-progress-indicator'
import { FormStatusBadge } from './form-status-badge'
import { WorkflowStatusManager } from './workflow-status-manager'

interface FormExecutionInterfaceProps {
  instanceId: string
  readonly?: boolean
  onSubmit?: (instanceId: string) => void
  onSave?: (instanceId: string, responses: ResponseData[]) => void
}

// Create dynamic validation schema based on form template
const createFormValidationSchema = (template: FormTemplate) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {}
  
  template.questions.forEach((question) => {
    let fieldSchema: z.ZodTypeAny
    
    switch (question.type) {
      case 'text_input':
        fieldSchema = z.string()
        break
      case 'numeric_input':
        fieldSchema = z.number()
        break
      case 'date':
      case 'datetime':
        fieldSchema = z.date()
        break
      case 'single_select':
        fieldSchema = z.string()
        break
      case 'multi_select':
        fieldSchema = z.array(z.string())
        break
      case 'yes_no':
        fieldSchema = z.boolean()
        break
      case 'file_upload':
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

export function FormExecutionInterface({ 
  instanceId, 
  readonly = false,
  onSubmit,
  onSave 
}: FormExecutionInterfaceProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Fetch form instance data
  const { 
    data: instanceResponse, 
    isLoading: instanceLoading, 
    error: instanceError 
  } = useQuery({
    queryKey: queryKeys.surveys.instance(instanceId),
    queryFn: () => surveyApi.getInstance(instanceId),
    enabled: !!instanceId,
  })
  
  const instance = instanceResponse?.data as FormInstance
  // Note: In a real implementation, template would be fetched separately or included in the instance response
  const template = (instance as any)?.template as FormTemplate
  
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
    onSuccess: () => {
      setLastSaved(new Date())
      if (onSave && instance) {
        onSave(instanceId, Object.entries(form.getValues()).map(([questionId, value]) => ({
          questionId,
          value,
          metadata: { savedAt: new Date() }
        })))
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save responses')
    },
  })
  
  // Submit form mutation
  const submitMutation = useMutation({
    mutationFn: () => surveyApi.submitSurvey(instanceId),
    onSuccess: () => {
      toast.success('Form submitted successfully')
      if (onSubmit) {
        onSubmit(instanceId)
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit form')
    },
  })
  
  // Auto-save functionality
  useAutoSave({
    watch: form.watch,
    onSave: (data) => {
      if (!readonly && instance?.status === FormStatus.DRAFT) {
        const responses: ResponseData[] = Object.entries(data).map(([questionId, value]) => ({
          questionId,
          value,
          metadata: { autoSaved: true, timestamp: new Date() }
        }))
        saveResponseMutation.mutate({ responses, isDraft: true })
      }
    },
    delay: 2000,
    enabled: !readonly && instance?.status === FormStatus.DRAFT,
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
  
  // Handle pre-population from context data
  useEffect(() => {
    if (instance?.contextData?.prePopulationData && template?.questions) {
      const prePopData = instance.contextData.prePopulationData
      
      template.questions.forEach((question) => {
        if (question.prePopulationMapping && prePopData[question.prePopulationMapping]) {
          const currentValue = form.getValues(question.id)
          // Only pre-populate if field is empty
          if (!currentValue) {
            form.setValue(question.id, prePopData[question.prePopulationMapping])
          }
        }
      })
    }
  }, [instance?.contextData, template?.questions, form])
  
  // Handle manual save
  const handleSave = async () => {
    const formData = form.getValues()
    const responses: ResponseData[] = Object.entries(formData).map(([questionId, value]) => ({
      questionId,
      value,
      metadata: { manualSave: true, timestamp: new Date() }
    }))
    
    saveResponseMutation.mutate({ responses, isDraft: true })
  }
  
  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // First validate the form
      const isValid = await form.trigger()
      
      if (!isValid) {
        toast.error('Please fix validation errors before submitting')
        setIsSubmitting(false)
        return
      }
      
      // Save final responses
      const formData = form.getValues()
      const responses: ResponseData[] = Object.entries(formData).map(([questionId, value]) => ({
        questionId,
        value,
        metadata: { finalSubmission: true, timestamp: new Date() }
      }))
      
      await saveResponseMutation.mutateAsync({ responses, isDraft: false })
      
      // Submit the form
      await submitMutation.mutateAsync()
      
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Calculate form completion progress
  const calculateProgress = () => {
    if (!template?.questions) return 0
    
    const formData = form.getValues()
    const answeredQuestions = template.questions.filter(question => {
      const value = formData[question.id]
      return value !== undefined && value !== null && value !== ''
    })
    
    return Math.round((answeredQuestions.length / template.questions.length) * 100)
  }
  
  const progress = calculateProgress()
  const canSubmit = !readonly && 
                   instance?.status === FormStatus.DRAFT && 
                   progress === 100 && 
                   form.formState.isValid
  
  if (instanceLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading form...</span>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (instanceError || !instance || !template) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {instanceError?.message || 'Failed to load form. Please try again.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Form Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-2xl">{template.name}</CardTitle>
                <FormStatusBadge status={instance.status} />
              </div>
              {template.description && (
                <CardDescription className="text-base">
                  {template.description}
                </CardDescription>
              )}
            </div>
            
            <div className="text-right space-y-1">
              <div className="text-sm text-muted-foreground">
                Form ID: {instance.id.slice(0, 8)}...
              </div>
              {instance.dueDate && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  Due: {new Date(instance.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Indicator */}
          <FormProgressIndicator 
            progress={progress}
            totalQuestions={template.questions.length}
            answeredQuestions={Math.round((progress / 100) * template.questions.length)}
          />
        </CardHeader>
      </Card>
      
      {/* Context Information */}
      {(instance.memberId || instance.providerId) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Context Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {instance.memberId && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Member ID: {instance.memberId}</span>
                </div>
              )}
              {instance.providerId && (
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Provider ID: {instance.providerId}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Form Content */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <DynamicFormRenderer
              template={template}
              form={form}
              readonly={readonly}
              instanceId={instanceId}
            />
            
            {/* Form Actions */}
            {!readonly && instance.status === FormStatus.DRAFT && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {lastSaved && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Last saved: {lastSaved.toLocaleTimeString()}
                      </div>
                    )}
                    {saveResponseMutation.isPending && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                        Saving...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSave}
                      disabled={saveResponseMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting || submitMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting || submitMutation.isPending ? 'Submitting...' : 'Submit Form'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
      
      {/* Workflow Status Manager */}
      {instance.status !== FormStatus.DRAFT && (
        <WorkflowStatusManager
          instance={instance}
          onStatusChange={async (status, comment) => {
            // Handle status change
            console.log('Status change:', status, comment)
            // This would call the API to update status
          }}
          onAssign={async (userId) => {
            // Handle assignment
            console.log('Assign to:', userId)
            // This would call the API to assign the form
          }}
          currentUserId="current-user-id" // Would come from auth context
          userRole="manager" // Would come from auth context
          readonly={readonly}
        />
      )}
      
      {/* Validation Errors Summary */}
      {Object.keys(form.formState.errors).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Validation Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(form.formState.errors).map(([fieldName, error]) => {
                const question = template.questions.find(q => q.id === fieldName)
                return (
                  <Alert key={fieldName} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{question?.text || fieldName}:</strong> {(error as any)?.message || 'Invalid field'}
                    </AlertDescription>
                  </Alert>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}