import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/app-layout';
import { Activity, CheckCircle } from 'lucide-react';
import { getIcon } from '@/lib/icon-utils';
import { getDashboardData } from '@/lib/app-data';

export default function DashboardPage() {
  const dashboardData = getDashboardData();
  
  return (
    <AppLayout headerTitle="Dashboard">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
              {/* Welcome Section */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{dashboardData.welcomeMessage.title}</h1>
                <p className="text-muted-foreground text-lg">
                  {dashboardData.welcomeMessage.description}
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {dashboardData.stats.map((stat) => {
                  const IconComponent = getIcon(stat.icon);

                  return (
                    <Card key={stat.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                          {stat.change && (
                            <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-yellow-600'}>
                              {stat.change}
                            </span>
                          )} {stat.changeLabel}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Feature Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dashboardData.featureCards.map((card) => {
                  const IconComponent = getIcon(card.icon);

                  return (
                    <Card key={card.id} className="transition-all hover:shadow-lg">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{card.title}</CardTitle>
                            <CardDescription>
                              {card.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="w-full">
                          {card.buttonText}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Recent Activity & Status */}
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Latest system activities and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dashboardData.recentActivity.map((activity) => {
                      const IconComponent = getIcon(activity.icon);

                      const colorClasses = {
                        green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
                        blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
                        yellow: "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400",
                        red: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                      }[activity.iconColor] || "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400";

                      return (
                        <div key={activity.id} className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colorClasses}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      System Status
                    </CardTitle>
                    <CardDescription>
                      Current development and deployment status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dashboardData.systemStatus.map((status) => {
                      const IconComponent = getIcon(status.icon);

                      return (
                        <div key={status.id} className="flex items-center justify-between">
                          <span className="font-medium">{status.title}</span>
                          <Badge variant={status.variant as any} className="gap-1">
                            <IconComponent className="h-3 w-3" />
                            {status.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts for efficient workflow management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {dashboardData.quickActions.map((action) => {
                      const IconComponent = getIcon(action.icon);

                      return (
                        <Button key={action.id} variant="outline" className="h-auto flex-col gap-2 p-4">
                          <IconComponent className="h-6 w-6" />
                          <span className="text-sm">{action.title}</span>
                        </Button>
                      );
                    })}
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