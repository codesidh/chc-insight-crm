'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { ApprovalWorkQueue } from '@/components/features/work-queue/approval-work-queue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users,
  TrendingUp,
  Settings
} from 'lucide-react'

// Mock data for demonstration
const workQueueStats = {
  totalPending: 12,
  overdue: 3,
  completedToday: 8,
  averageProcessingTime: '2.3 hours',
  teamWorkload: [
    { name: 'Sarah Johnson', pending: 4, completed: 12 },
    { name: 'Mike Chen', pending: 3, completed: 8 },
    { name: 'Lisa Rodriguez', pending: 5, completed: 15 }
  ]
}

function WorkQueueStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{workQueueStats.totalPending}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting your review
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{workQueueStats.overdue}</div>
          <p className="text-xs text-muted-foreground">
            Require immediate attention
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{workQueueStats.completedToday}</div>
          <p className="text-xs text-muted-foreground">
            Forms processed today
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{workQueueStats.averageProcessingTime}</div>
          <p className="text-xs text-muted-foreground">
            Per form review
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function TeamWorkload() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Workload
        </CardTitle>
        <CardDescription>
          Current workload distribution across team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workQueueStats.teamWorkload.map((member, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{member.name}</p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>{member.pending} pending</span>
                  <span>{member.completed} completed this week</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={member.pending > 4 ? 'destructive' : 'secondary'}>
                  {member.pending} pending
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function WorkQueuePage() {
  const handleItemSelect = (instanceId: string) => {
    // Navigate to form execution page in readonly mode
    window.location.href = `/surveys/execute/${instanceId}?readonly=true`
  }

  return (
    <AppLayout headerTitle="Work Queue">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Work Queue</h1>
                  <p className="text-muted-foreground text-lg">
                    Manage form approvals and workflow tasks
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Queue Settings
                  </Button>
                </div>
              </div>

              {/* Stats Overview */}
              <WorkQueueStats />

              {/* Main Content */}
              <Tabs defaultValue="queue" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="queue">Approval Queue</TabsTrigger>
                  <TabsTrigger value="team">Team Overview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="queue" className="space-y-6">
                  <ApprovalWorkQueue
                    userId="current-user-id"
                    userRole="manager"
                    onItemSelect={handleItemSelect}
                  />
                </TabsContent>
                
                <TabsContent value="team" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <TeamWorkload />
                    
                    {/* Additional team metrics could go here */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance Metrics</CardTitle>
                        <CardDescription>
                          Team performance over the last 30 days
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Average Response Time</span>
                            <Badge variant="outline">2.3 hours</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Approval Rate</span>
                            <Badge variant="outline">94%</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Forms Processed</span>
                            <Badge variant="outline">156</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Quality Score</span>
                            <Badge variant="default">Excellent</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}