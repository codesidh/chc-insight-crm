import { Suspense } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { FormExecutionInterface } from '@/components/features/survey-execution/form-execution-interface'
import { Card, CardContent } from '@/components/ui/card'

interface FormExecutionPageProps {
  params: {
    instanceId: string
  }
  searchParams: {
    readonly?: string
  }
}

function FormExecutionSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded w-64 animate-pulse" />
                <div className="h-4 bg-muted rounded w-96 animate-pulse" />
              </div>
              <div className="h-6 bg-muted rounded w-20 animate-pulse" />
            </div>
            
            {/* Progress Skeleton */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                <div className="h-4 bg-muted rounded w-12 animate-pulse" />
              </div>
              <div className="h-2 bg-muted rounded w-full animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Form Content Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Question Skeletons */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 bg-muted rounded w-48 animate-pulse" />
                <div className="h-10 bg-muted rounded w-full animate-pulse" />
              </div>
            ))}
            
            {/* Actions Skeleton */}
            <div className="flex justify-between pt-4 border-t">
              <div className="h-4 bg-muted rounded w-32 animate-pulse" />
              <div className="flex space-x-2">
                <div className="h-10 bg-muted rounded w-24 animate-pulse" />
                <div className="h-10 bg-muted rounded w-28 animate-pulse" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function FormExecutionPage({ 
  params, 
  searchParams 
}: FormExecutionPageProps) {
  const { instanceId } = params
  const readonly = searchParams.readonly === 'true'
  
  return (
    <AppLayout 
      headerTitle={readonly ? "View Form" : "Complete Form"}
    >
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6">
              <Suspense fallback={<FormExecutionSkeleton />}>
                <FormExecutionInterface
                  instanceId={instanceId}
                  readonly={readonly}
                  onSubmit={(instanceId) => {
                    // Handle successful submission
                    console.log('Form submitted:', instanceId)
                    // Could redirect to success page or work queue
                  }}
                  onSave={(instanceId, responses) => {
                    // Handle successful save
                    console.log('Form saved:', instanceId, responses)
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

// Note: This is a server component, so generateMetadata would work here
// But keeping it simple for the MVP implementation