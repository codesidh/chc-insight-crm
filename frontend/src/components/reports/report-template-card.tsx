"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getIcon } from "@/lib/icon-utils"
import { ReportTemplate } from "@/types/reports"

interface ReportTemplateCardProps {
  template: ReportTemplate
  onGenerate: (template: ReportTemplate) => void
}

const categoryColors = {
  compliance: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  performance: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  analytics: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  audit: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
}

export function ReportTemplateCard({ template, onGenerate }: ReportTemplateCardProps) {
  const IconComponent = getIcon(template.icon)
  const categoryColor = categoryColors[template.category as keyof typeof categoryColors] || categoryColors.analytics

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="mt-1">
                {template.description}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className={categoryColor}>
            {template.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {template.parameters.length} parameter{template.parameters.length !== 1 ? 's' : ''}
          </div>
          <Button 
            onClick={() => onGenerate(template)}
            className="w-full"
          >
            Generate Report
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}