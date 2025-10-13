import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Workflow, 
  Plus, 
  Play, 
  Pause,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  ArrowRight,
  Settings
} from 'lucide-react';

export default function WorkflowsPage() {
  return (
    <AppLayout headerTitle="Workflows">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Workflow Management</h1>
              <p className="text-muted-foreground text-lg">
                Configure approval workflows, track progress, and manage task assignments.
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Workflow
            </Button>
          </div>

          {/* Workflow Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                <Workflow className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">
                  Currently running
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+8</span> from yesterday
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4h</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">-0.3h</span> improvement
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Active Workflows */}
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>
                Currently running workflow processes and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Workflow Item */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Workflow className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Survey Approval Process</h4>
                      <p className="text-sm text-muted-foreground">
                        Multi-stage approval for survey deployment
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs">Content Review</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs">Legal Approval</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span className="text-xs">Final Review</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="default">Running</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        12 pending tasks
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Workflow Item */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Workflow className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Member Onboarding</h4>
                      <p className="text-sm text-muted-foreground">
                        Automated member enrollment and verification
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs">Data Validation</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs">Eligibility Check</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs">Welcome Package</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="default">Running</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        8 pending tasks
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Workflow Item */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <Workflow className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Provider Quality Review</h4>
                      <p className="text-sm text-muted-foreground">
                        Quarterly provider performance evaluation
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span className="text-xs">Data Collection</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span className="text-xs">Analysis</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span className="text-xs">Report Generation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="secondary">Paused</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Scheduled for Q1 2025
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>
                Tasks requiring your attention or approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Survey &ldquo;Member Satisfaction Q4&rdquo; awaiting legal review</p>
                      <p className="text-xs text-muted-foreground">Assigned to Legal Team • Due in 2 days</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">New member enrollment requires eligibility verification</p>
                      <p className="text-xs text-muted-foreground">Assigned to Enrollment Team • Due today</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Process</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Provider contract renewal requires approval</p>
                      <p className="text-xs text-muted-foreground">Assigned to Contract Manager • Overdue by 1 day</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Approve</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Create Workflow</CardTitle>
                    <CardDescription>
                      Design a new approval workflow
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Workflow Templates</CardTitle>
                    <CardDescription>
                      Browse pre-built workflow templates
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Task Queue</CardTitle>
                    <CardDescription>
                      View all pending tasks
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}