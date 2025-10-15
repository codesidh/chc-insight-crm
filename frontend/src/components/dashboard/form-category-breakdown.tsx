"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FormCategoryBreakdown as FormCategoryBreakdownType, CategoryData } from "@/types/dashboard"

interface FormCategoryBreakdownProps {
  categories: FormCategoryBreakdownType
}

export function FormCategoryBreakdown({ categories }: FormCategoryBreakdownProps) {
  const renderCategoryCard = (title: string, data: CategoryData, color: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline" className={`${color} border-current`}>
            {data.completionRate.toFixed(1)}%
          </Badge>
        </CardTitle>
        <CardDescription>
          {data.completed} of {data.total} forms completed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={data.completionRate} className="h-2" />
        
        <div className="space-y-3">
          {Object.entries(data.types).map(([key, type]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{type.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {type.completed}/{type.total}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {type.completionRate.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress value={type.completionRate} className="h-1" />
              <div className="text-xs text-muted-foreground">
                Avg completion: {type.avgCompletionTime}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {renderCategoryCard(
        "Cases", 
        categories.cases, 
        "text-blue-600 dark:text-blue-400"
      )}
      {renderCategoryCard(
        "Assessments", 
        categories.assessments, 
        "text-green-600 dark:text-green-400"
      )}
    </div>
  )
}