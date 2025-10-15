// Report-specific types
export interface ReportParameter {
  name: string
  label: string
  type: "text" | "select" | "multiSelect" | "dateRange" | "date" | "number"
  required?: boolean
  defaultValue?: any
  options?: Array<{ value: string; label: string }>
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  parameters: ReportParameter[]
}

export interface ExportFormat {
  value: string
  label: string
  icon: string
  description: string
}

export interface SchedulingOption {
  value: string
  label: string
  description: string
}

export interface ReportInstance {
  id: string
  name: string
  template: string
  generatedAt: string
  generatedBy: string
  status: "processing" | "completed" | "failed"
  format: string
  size: string | null
  downloadUrl: string | null
}

export interface ScheduledReport {
  id: string
  name: string
  template: string
  schedule: string
  nextRun: string
  recipients: string[]
  format: string
  isActive: boolean
}

export interface ReportConfig {
  templateId: string
  parameters: Record<string, any>
  format: string
  schedule?: {
    type: string
    time?: string
    dayOfWeek?: number
    dayOfMonth?: number
    recipients?: string[]
  }
}

export interface ReportsData {
  reportTemplates: ReportTemplate[]
  exportFormats: ExportFormat[]
  schedulingOptions: SchedulingOption[]
  recentReports: ReportInstance[]
  scheduledReports: ScheduledReport[]
}