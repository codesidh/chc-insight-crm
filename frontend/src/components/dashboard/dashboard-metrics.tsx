import { Activity, Users, FileCheck, AlertTriangle } from "lucide-react"
import { MetricCard, MemberMetricCard, ProviderMetricCard, ComplianceMetricCard } from "@/components/ui/metric-card"

export function DashboardMetrics() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      <MemberMetricCard
        title="Total Active LTSS Members"
        value="2,847"
        trend={{
          value: "+8.2%",
          direction: "up",
          isPositive: true
        }}
        footer={{
          label: "Growing membership base",
          sublabel: "Enrollment up from last quarter",
          icon: Users
        }}
      />

      <ProviderMetricCard
        title="Active LTSS Providers"
        value="156"
        trend={{
          value: "+12",
          direction: "up",
          isPositive: true
        }}
        footer={{
          label: "Network expansion",
          sublabel: "New providers onboarded this month",
          icon: Activity
        }}
      />

      <ComplianceMetricCard
        title="LTSS Assessment Compliance"
        value="94.2%"
        trend={{
          value: "-2.1%",
          direction: "down",
          isPositive: false
        }}
        footer={{
          label: "Below target threshold",
          sublabel: "Requires attention for state compliance",
          icon: AlertTriangle
        }}
      />

      <MetricCard
        title="Overall Care Quality Rating"
        value="4.7/5.0"
        trend={{
          value: "+0.3",
          direction: "up",
          isPositive: true
        }}
        footer={{
          label: "Exceeding quality benchmarks",
          sublabel: "Member satisfaction remains high",
          icon: FileCheck
        }}
      />

    </div>
  )
}