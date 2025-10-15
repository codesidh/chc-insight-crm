'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/app-layout'
import { FormContextSelector } from '@/components/features/survey-execution/form-context-selector'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { surveyApi } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-client'
import { useCreateSurveyInstance } from '@/hooks/use-surveys'

interface FormStartPageProps {
  params: {
    templateId: string
  }
}

function FormStartSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Template Info Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-6 bg-muted rounded w-64 animate-pulse" />
                <div className="h-4 bg-muted rounded w-96 animate-pulse" />
              </div>
              <div className="h-5 bg-muted rounded w-16 animate-pulse" />
            </div>
            <div className="h-4 bg-muted rounded w-48 animate-pulse" />
          </div>
        </CardContent>
      </Card>
      
      {/* Context Selection Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-5 bg-muted rounded w-32 animate-pulse" />
              <div className="h-4 bg-muted rounded w-64 animate-pulse" />
            </div>
            
            {/* Search Skeletons */}
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded w-full animate-pulse" />
              <div className="h-10 bg-muted rounded w-full animate-pulse" />
            </div>
            
            {/* Actions Skeleton */}
            <div className="flex justify-between pt-4 border-t">
              <div className="h-4 bg-muted rounded w-32 animate-pulse" />
              <div className="flex space-x-2">
                <div className="h-10 bg-muted rounded w-20 animate-pulse" />
                <div className="h-10 bg-muted rounded w-24 animate-pulse" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Client component to handle form start
function FormStartContent({ templateId }: { templateId: string }) {
  const router = useRouter()
  const createInstanceMutation = useCreateSurveyInstance()
  
  // Fetch template data
  const { data: templateResponse, isLoading, error } = useQuery({
    queryKey: queryKeys.surveys.template(templateId),
    queryFn: () => surveyApi.getTemplate(templateId),
    enabled: !!templateId,
  })
  
  const template = templateResponse?.data
  
  const handleContextSelected = async (context: any) => {
    try {
      const response = await createInstanceMutation.mutateAsync({
        templateId,
        context
      })
      
      // Redirect to form execution
      router.push(`/surveys/execute/${response.data.id}`)
    } catch (error) {
      console.error('Failed to create form instance:', error)
      // Error is handled by the mutation's onError callback
    }
  }
  
  const handleCancel = () => {
    router.push('/surveys')
  }
  
  if (isLoading) {
    return <FormStartSkeleton />
  }
  
  if (error || !template) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || 'Failed to load form template. Please try again.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <FormContextSelector
      template={template}
      onContextSelected={handleContextSelected}
      onCancel={handleCancel}
    />
  )
}

export default function FormStartPage({ params }: FormStartPageProps) {
  const { templateId } = params
  
  return (
    <AppLayout 
      headerTitle="Start New Form"
    >
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6">
              <Suspense fallback={<FormStartSkeleton />}>
                <FormStartContent templateId={templateId} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

// Note: generateMetadata cannot be used with 'use client' directive
// Metadata would need to be handled differently in a client component