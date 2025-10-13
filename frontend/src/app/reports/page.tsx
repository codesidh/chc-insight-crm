import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  Plus,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Building2,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function ReportsPage() {
  return (
    <AppLayout headerTitle="Reports">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
              <p className="text-muted-foreground">
                Generate, schedule, and manage comprehensive reports for compliance and business intelligence.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter Reports
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Report
              </Button>
            </div>
          </div>

          {/* Report Categories */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Member Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enrollment, satisfaction, and outcome reports
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  12 available reports
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-base">Provider Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Performance, quality, and network analysis
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  8 available reports
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-base">Compliance Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Regulatory and audit compliance reports
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  15 available reports
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-base">Executive Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  High-level dashboards and KPI summaries
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  6 available reports
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Recently generated and scheduled reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Q4 2024 Member Satisfaction Report</h4>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive member satisfaction analysis and trends
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">Generated: Dec 10, 2024</span>
                        <span className="text-xs text-muted-foreground">Size: 2.4 MB</span>
                        <span className="text-xs text-muted-foreground">Format: PDF</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Complete</Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                      <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Provider Performance Dashboard</h4>
                      <p className="text-sm text-muted-foreground">
                        Monthly provider quality metrics and performance indicators
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">Generated: Dec 8, 2024</span>
                        <span className="text-xs text-muted-foreground">Size: 1.8 MB</span>
                        <span className="text-xs text-muted-foreground">Format: Excel</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Complete</Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">HEDIS Compliance Report</h4>
                      <p className="text-sm text-muted-foreground">
                        Healthcare Effectiveness Data and Information Set measures
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">Generated: Dec 5, 2024</span>
                        <span className="text-xs text-muted-foreground">Size: 3.2 MB</span>
                        <span className="text-xs text-muted-foreground">Format: PDF</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Complete</Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                      <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Annual Compliance Audit Report</h4>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive regulatory compliance review and analysis
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">Scheduled: Dec 15, 2024</span>
                        <span className="text-xs text-muted-foreground">Est. Size: 4.5 MB</span>
                        <span className="text-xs text-muted-foreground">Format: PDF</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Scheduled</Badge>
                    <Button variant="ghost" size="sm" disabled>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Automated report generation schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Weekly Member Enrollment Report</p>
                      <p className="text-xs text-muted-foreground">Every Monday at 8:00 AM • Next: Dec 16, 2024</p>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Monthly Provider Quality Metrics</p>
                      <p className="text-xs text-muted-foreground">First Monday of each month • Next: Jan 6, 2025</p>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Quarterly Compliance Summary</p>
                      <p className="text-xs text-muted-foreground">End of each quarter • Next: Mar 31, 2025</p>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Daily Survey Response Summary</p>
                      <p className="text-xs text-muted-foreground">Daily at 6:00 PM • Next: Today at 6:00 PM</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Paused</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>
                Pre-built report templates for common use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    <h4 className="font-medium text-sm">Member Demographics</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Age, gender, geographic distribution analysis
                  </p>
                </div>

                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-sm">Care Plan Effectiveness</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Outcomes and goal achievement tracking
                  </p>
                </div>

                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-sm">Cost Analysis</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Service utilization and cost trends
                  </p>
                </div>

                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium text-sm">Quality Measures</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    HEDIS and CMS quality indicators
                  </p>
                </div>

                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    <h4 className="font-medium text-sm">Survey Analytics</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Response rates and satisfaction trends
                  </p>
                </div>

                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-sm">Network Adequacy</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Provider coverage and accessibility analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}