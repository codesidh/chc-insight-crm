'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormProgressIndicatorProps {
  progress: number
  totalQuestions: number
  answeredQuestions: number
  className?: string
}

export function FormProgressIndicator({ 
  progress, 
  totalQuestions, 
  answeredQuestions,
  className 
}: FormProgressIndicatorProps) {


  const getProgressVariant = (progress: number) => {
    if (progress === 100) return 'default'
    if (progress >= 75) return 'secondary'
    if (progress >= 50) return 'outline'
    return 'destructive'
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Form Completion</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress 
          value={progress} 
          className="h-2"
        />
      </div>
      
      {/* Progress Details */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              {answeredQuestions} answered
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Circle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {totalQuestions - answeredQuestions} remaining
            </span>
          </div>
        </div>
        
        <Badge variant={getProgressVariant(progress)} className="text-xs">
          {progress === 100 ? 'Complete' : 
           progress >= 75 ? 'Almost Done' :
           progress >= 50 ? 'In Progress' : 
           'Getting Started'}
        </Badge>
      </div>
      
      {/* Completion Status */}
      {progress === 100 && (
        <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300 font-medium">
            All questions completed! Ready to submit.
          </span>
        </div>
      )}
      
      {progress < 100 && progress > 0 && (
        <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {totalQuestions - answeredQuestions} question{totalQuestions - answeredQuestions !== 1 ? 's' : ''} remaining
          </span>
        </div>
      )}
    </div>
  )
}