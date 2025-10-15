"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react"
import { DashboardAlert } from "@/types/dashboard"

interface DashboardAlertsProps {
  alerts: DashboardAlert[]
}

const alertConfig = {
  info: {
    icon: Info,
    variant: "default" as const,
    className: "text-blue-600 dark:text-blue-400"
  },
  warning: {
    icon: AlertTriangle,
    variant: "secondary" as const,
    className: "text-yellow-600 dark:text-yellow-400"
  },
  error: {
    icon: AlertCircle,
    variant: "destructive" as const,
    className: "text-red-600 dark:text-red-400"
  },
  success: {
    icon: CheckCircle,
    variant: "default" as const,
    className: "text-green-600 dark:text-green-400"
  }
}

export function DashboardAlerts({ alerts }: DashboardAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            System Alerts
          </CardTitle>
          <CardDescription>
            No active alerts - all systems operating normally
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          System Alerts
          <Badge variant="secondary">{alerts.length}</Badge>
        </CardTitle>
        <CardDescription>
          Active alerts and notifications requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type]
          const IconComponent = config.icon

          return (
            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-muted ${config.className}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{alert.title}</h4>
                  <Badge variant={config.variant} className="text-xs">
                    {alert.type.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                  <Button variant="outline" size="sm">
                    {alert.action}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}