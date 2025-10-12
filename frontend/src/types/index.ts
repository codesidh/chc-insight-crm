// Core type definitions for CHC Insight CRM

export type Theme = 'dark' | 'light' | 'system'

export type Priority = 'low' | 'medium' | 'high'

export type Status = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'

export type UserRole = 
  | 'administrator'
  | 'service_coordinator'
  | 'um_nurse'
  | 'qm_staff'
  | 'communications_team'
  | 'manager'

export type SurveyType = 
  | 'initial_assessment'
  | 'reassessment'
  | 'provider_survey'
  | 'incident_report'
  | 'satisfaction_survey'
  | 'custom'

export type QuestionType = 
  | 'text_input'
  | 'numeric_input'
  | 'date'
  | 'datetime'
  | 'single_select'
  | 'multi_select'
  | 'yes_no'
  | 'file_upload'
  | 'section_header'

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface StatusBadgeProps extends BaseComponentProps {
  status: Status
  variant?: 'default' | 'outline'
}

export interface PriorityBadgeProps extends BaseComponentProps {
  priority: Priority
  variant?: 'default' | 'outline'
}

// Form types
export interface FormFieldProps extends BaseComponentProps {
  label?: string
  description?: string
  error?: string
  required?: boolean
}

// Chart types for data visualization
export interface ChartDataPoint {
  name: string
  value: number
  color?: string
}

export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

// API response types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}