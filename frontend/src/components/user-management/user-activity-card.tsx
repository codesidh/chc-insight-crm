"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, FileText, CheckCircle, UserPlus, Settings } from "lucide-react"
import { format } from "date-fns"
import { UserActivity } from "@/types/user-management"

interface UserActivityCardProps {
  activities: UserActivity[]
  users: Array<{ id: string; firstName: string; lastName: string }>
}

const actionConfig = {
  "form.submit": {
    icon: FileText,
    label: "Form Submitted",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
  },
  "form.approve": {
    icon: CheckCircle,
    label: "Form Approved",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
  },
  "report.generate": {
    icon: Activity,
    label: "Report Generated",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
  },
  "user.create": {
    icon: UserPlus,
    label: "User Created",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
  },
  "system.configure": {
    icon: Settings,
    label: "System Configured",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
  }
}

export function UserActivityCard({ activities, users }: UserActivityCardProps) {
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User"
  }

  const getActionConfig = (action: string) => {
    return actionConfig[action as keyof typeof actionConfig] || {
      icon: Activity,
      label: action,
      color: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent User Activity
        </CardTitle>
        <CardDescription>
          Latest user actions and system events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const config = getActionConfig(activity.action)
              const IconComponent = config.icon

              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${config.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{config.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.resource}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.details}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>By: {getUserName(activity.userId)}</span>
                      <span>{format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}