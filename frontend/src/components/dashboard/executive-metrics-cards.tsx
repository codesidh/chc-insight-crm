"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getIcon } from "@/lib/icon-utils"
import { MetricCard } from "@/types/dashboard"

interface ExecutiveMetricsCardsProps {
  metrics: MetricCard[]
}

export function ExecutiveMetricsCards({ metrics }: ExecutiveMetricsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const IconComponent = getIcon(metric.icon)
        const isPositive = metric.changeType === "positive"

        return (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge 
                  variant={isPositive ? "default" : "secondary"}
                  className={`text-xs ${
                    isPositive 
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {metric.change}
                </Badge>
                <span>{metric.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}