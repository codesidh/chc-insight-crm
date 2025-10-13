import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics"

export default function MetricsPage() {
  return (
    <div className="@container/main space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Metrics</h1>
        <p className="text-muted-foreground">
          Key performance indicators for CHC Insight CRM
        </p>
      </div>
      
      <DashboardMetrics />
    </div>
  )
}