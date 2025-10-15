import { ExecutiveDashboardData } from '@/types/dashboard'
import executiveDashboardDataRaw from '@/data/app/executive_dashboard_data.json'

export function getExecutiveDashboardData(): ExecutiveDashboardData {
  return executiveDashboardDataRaw as ExecutiveDashboardData
}