// Dashboard-specific types
export interface MetricCard {
  id: string
  title: string
  value: string
  change: string
  changeLabel: string
  changeType: "positive" | "negative"
  icon: string
}

export interface FormTypeData {
  name: string
  total: number
  completed: number
  completionRate: number
  avgCompletionTime: string
}

export interface CategoryData {
  total: number
  completed: number
  completionRate: number
  types: Record<string, FormTypeData>
}

export interface FormCategoryBreakdown {
  cases: CategoryData
  assessments: CategoryData
}

export interface StatusDistribution {
  status: string
  count: number
  percentage: number
  color: string
}

export interface ComplianceData {
  month: string
  cases: number
  assessments: number
  overall: number
}

export interface ProductivityData {
  week: string
  formsCompleted: number
  avgCompletionTime: number
  staffUtilization: number
}

export interface DashboardAlert {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  action: string
  timestamp: string
}

export interface ExecutiveDashboardData {
  metrics: {
    formCompletion: {
      totalForms: number
      completedForms: number
      completionRate: number
      change: string
      changeType: "positive" | "negative"
    }
    categoryBreakdown: FormCategoryBreakdown
    statusDistribution: StatusDistribution[]
    complianceRates: ComplianceData[]
    productivityTrends: ProductivityData[]
  }
  kpis: MetricCard[]
  alerts: DashboardAlert[]
}