'use client'

import { useState } from 'react'
import { useSurveyTemplates, useCreateSurveyTemplate } from '@/hooks/use-surveys'
import { useForm } from '@/hooks/use-form'
import { surveyTemplateSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus } from 'lucide-react'
import { AdvancedDataTable, DataTableItem } from '@/components/ui/advanced-data-table'

// Example survey template type
interface SurveyTemplate {
  id: string
  name: string
  description?: string
  type: string
  version: number
  isActive: boolean
  createdAt: string
  questionsCount: number
}

// Convert survey template to data table item
function surveyToDataTableItem(survey: SurveyTemplate): DataTableItem {
  return {
    id: parseInt(survey.id),
    header: survey.name,
    type: survey.type,
    status: survey.isActive ? 'Active' : 'Inactive',
    target: survey.version.toString(),
    limit: survey.questionsCount.toString(),
    reviewer: 'Assign reviewer',
  }
}





// Create survey form component
function CreateSurveyForm({ onSuccess }: { onSuccess: () => void }) {
  const createTemplate = useCreateSurveyTemplate()
  
  const form = useForm(surveyTemplateSchema, {
    defaultValues: {
      name: '',
      description: '',
      type: 'custom' as const,
      questions: [],
      businessRules: [],
      isActive: true,
      effectiveDate: new Date().toISOString().split('T')[0],
    } as any,
  })

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createTemplate.mutateAsync(data)
      form.reset()
      onSuccess()
    } catch (error) {
      // Error is handled by the mutation
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Survey Template</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Enter survey name"
            />
            {form.formState.errors['name'] && (
              <p className="text-sm text-destructive mt-1">
                {(form.formState.errors['name'] as any)?.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...form.register('description')}
              placeholder="Enter survey description"
            />
          </div>

          <div>
            <Label htmlFor="effectiveDate">Effective Date</Label>
            <Input
              id="effectiveDate"
              type="date"
              {...form.register('effectiveDate')}
            />
            {form.formState.errors['effectiveDate'] && (
              <p className="text-sm text-destructive mt-1">
                {(form.formState.errors['effectiveDate'] as any)?.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={createTemplate.isPending}
            className="w-full"
          >
            {createTemplate.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Survey
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Main survey list component
export function SurveyListExample() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination] = useState({ page: 1, limit: 10 })

  // Fetch survey templates with search and pagination
  const {
    data: surveysResponse,
    isLoading,
    error,
    refetch,
  } = useSurveyTemplates({
    search: searchQuery,
    page: pagination.page,
    limit: pagination.limit,
  })

  // Convert survey data to data table format
  const tableData = (surveysResponse?.data?.data || []).map(surveyToDataTableItem)

  const handleDataChange = (newData: DataTableItem[]) => {
    // Here you could sync changes back to the survey data
    console.log('Survey data updated:', newData)
  }



  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive">Error loading surveys: {error.message}</p>
            <Button onClick={() => refetch()} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Survey Templates</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Survey
        </Button>
      </div>

      {showCreateForm && (
        <CreateSurveyForm onSuccess={() => setShowCreateForm(false)} />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Templates</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search surveys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading surveys...</span>
            </div>
          ) : (
            <AdvancedDataTable 
              data={tableData}
              onDataChange={handleDataChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}