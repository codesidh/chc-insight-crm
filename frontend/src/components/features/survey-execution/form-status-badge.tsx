'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Ban
} from 'lucide-react'
import { FormStatus } from '@/types'
import { cn } from '@/lib/utils'

interface FormStatusBadgeProps {
  status: FormStatus
  className?: string
  showIcon?: boolean
}

const statusConfig = {
  [FormStatus.DRAFT]: {
    label: 'Draft',
    variant: 'secondary' as const,
    icon: FileText,
    className: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
  },
  [FormStatus.PENDING]: {
    label: 'Pending Review',
    variant: 'outline' as const,
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-600'
  },
  [FormStatus.APPROVED]: {
    label: 'Approved',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-600'
  },
  [FormStatus.REJECTED]: {
    label: 'Rejected',
    variant: 'destructive' as const,
    icon: XCircle,
    className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-600'
  },
  [FormStatus.COMPLETED]: {
    label: 'Completed',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600'
  },
  [FormStatus.CANCELLED]: {
    label: 'Cancelled',
    variant: 'outline' as const,
    icon: Ban,
    className: 'bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
  }
}

export function FormStatusBadge({ 
  status, 
  className, 
  showIcon = true 
}: FormStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  if (!config) {
    return (
      <Badge variant="outline" className={cn("gap-1", className)}>
        <AlertCircle className="h-3 w-3" />
        Unknown Status
      </Badge>
    )
  }

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "gap-1 font-medium",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  )
}

// Extended status badge with additional information
interface FormStatusBadgeExtendedProps extends FormStatusBadgeProps {
  submittedAt?: Date | undefined
  approvedAt?: Date | undefined
  dueDate?: Date | undefined
  showTimestamp?: boolean
}

export function FormStatusBadgeExtended({ 
  status, 
  submittedAt,
  approvedAt,
  dueDate,
  showTimestamp = false,
  className,
  showIcon = true
}: FormStatusBadgeExtendedProps) {
  const getTimestamp = () => {
    switch (status) {
      case FormStatus.PENDING:
      case FormStatus.REJECTED:
        return submittedAt
      case FormStatus.APPROVED:
      case FormStatus.COMPLETED:
        return approvedAt
      default:
        return null
    }
  }

  const timestamp = getTimestamp()
  const isOverdue = dueDate && new Date() > new Date(dueDate) && status === FormStatus.DRAFT

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <FormStatusBadge 
          status={status} 
          showIcon={showIcon}
          className={className as string}
        />
        
        {isOverdue && (
          <Badge variant="destructive" className="gap-1 text-xs">
            <AlertCircle className="h-3 w-3" />
            Overdue
          </Badge>
        )}
      </div>
      
      {showTimestamp && timestamp && (
        <span className="text-xs text-muted-foreground">
          {status === FormStatus.PENDING && 'Submitted: '}
          {status === FormStatus.APPROVED && 'Approved: '}
          {status === FormStatus.COMPLETED && 'Completed: '}
          {status === FormStatus.REJECTED && 'Rejected: '}
          {new Date(timestamp).toLocaleDateString()} at {new Date(timestamp).toLocaleTimeString()}
        </span>
      )}
      
      {dueDate && status === FormStatus.DRAFT && (
        <span className={cn(
          "text-xs",
          isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"
        )}>
          Due: {new Date(dueDate).toLocaleDateString()}
        </span>
      )}
    </div>
  )
}