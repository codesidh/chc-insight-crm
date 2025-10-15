import { ReportsData } from '@/types/reports'
import reportsDataRaw from '@/data/app/reports_data.json'

export function getReportsData(): ReportsData {
  return reportsDataRaw as ReportsData
}