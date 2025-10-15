"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppLayout } from "@/components/layout/app-layout"
import { ExecutiveMetricsCards } from "@/components/dashboard/executive-metrics-cards"
import { FormCategoryBreakdown } from "@/components/dashboard/form-category-breakdown"
import { DashboardAlerts } from "@/components/dashboard/dashboard-alerts"
import { ComplianceAreaChart } from "@/components/charts/compliance-area-chart"
import { FormStatusPieChart } from "@/components/charts/form-status-pie-chart"
import { ProductivityBarChart } from "@/components/charts/productivity-bar-chart"
import { getExecutiveDashboardData } from "@/lib/dashboard-data"

export default function ExecutiveDashboardPage() {
  const { metrics, kpis, alerts } = getExecutiveDashboardData()

  return (
    <AppLayout headerTitle="Executive Dashboard">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
              {/* Page Header */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
                <p className="text-muted-foreground text-lg">
                  Form completion metrics, compliance rates, and performance analytics
                </p>
              </div>

              {/* Key Performance Indicators */}
              <ExecutiveMetricsCards metrics={kpis} />

              {/* Form Category Breakdown */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Form Completion by Category</h2>
                <FormCategoryBreakdown categories={metrics.categoryBreakdown} />
              </div>

              {/* Charts Section */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Compliance Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Rate Trends</CardTitle>
                    <CardDescription>
                      Monthly compliance rates by form category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ComplianceAreaChart 
                      data={metrics.complianceRates}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>

                {/* Form Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Form Status Distribution</CardTitle>
                    <CardDescription>
                      Current status breakdown of all forms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center">
                      <FormStatusPieChart 
                        data={metrics.statusDistribution}
                        className="h-[300px]"
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {metrics.statusDistribution.map((item) => (
                        <div key={item.status} className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium">{item.status}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Productivity Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Productivity Trends</CardTitle>
                  <CardDescription>
                    Forms completed and staff utilization over the past 4 weeks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductivityBarChart 
                    data={metrics.productivityTrends}
                    className="h-[300px]"
                  />
                </CardContent>
              </Card>

              {/* Alerts and Notifications */}
              <DashboardAlerts alerts={alerts} />

              {/* Summary Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Summary Statistics</CardTitle>
                  <CardDescription>
                    Key metrics and performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <h4 className="font-medium">Overall Performance</h4>
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.formCompletion.completionRate}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Completion rate ({metrics.formCompletion.change} from last month)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Total Forms Processed</h4>
                      <div className="text-2xl font-bold">
                        {metrics.formCompletion.totalForms.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {metrics.formCompletion.completedForms.toLocaleString()} completed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Categories</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Cases:</span>
                          <span className="font-medium">
                            {metrics.categoryBreakdown.cases.completionRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Assessments:</span>
                          <span className="font-medium">
                            {metrics.categoryBreakdown.assessments.completionRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}