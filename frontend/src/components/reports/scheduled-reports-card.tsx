"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Clock, Mail, Settings } from "lucide-react"
import { format } from "date-fns"
import { ScheduledReport } from "@/types/reports"

interface ScheduledReportsCardProps {
  reports: ScheduledReport[]
  onToggleActive: (reportId: string, isActive: boolean) => void
  onEdit: (report: ScheduledReport) => void
}

export function ScheduledReportsCard({ reports, onToggleActive, onEdit }: ScheduledReportsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scheduled Reports
        </CardTitle>
        <CardDescription>
          Automated report generation schedules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scheduled reports configured</p>
            <p className="text-sm">Create a report schedule to automate delivery</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{report.name}</h4>
                  <Badge variant="outline">
                    {report.schedule}
                  </Badge>
                  <Badge variant="secondary">
                    {report.format.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Next run: {format(new Date(report.nextRun), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={report.isActive}
                  onCheckedChange={(checked) => onToggleActive(report.id, checked)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(report)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}