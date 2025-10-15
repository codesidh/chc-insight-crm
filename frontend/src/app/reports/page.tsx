"use client"

import { useState } from "react"
import { AppLayout } from '@/components/layout/app-layout'
import { ReportTemplateCard } from "@/components/reports/report-template-card"
import { ReportGenerationDialog } from "@/components/reports/report-generation-dialog"
import { RecentReportsTable } from "@/components/reports/recent-reports-table"
import { ScheduledReportsCard } from "@/components/reports/scheduled-reports-card"
import { getReportsData } from "@/lib/reports-data"
import { ReportTemplate, ReportConfig, ReportInstance, ScheduledReport } from "@/types/reports"
import { toast } from "sonner"

export default function ReportsPage() {
  const reportsData = getReportsData()
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleGenerateReport = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    setDialogOpen(true)
  }

  const handleReportGeneration = (config: ReportConfig) => {
    // In a real app, this would call the API
    console.log("Generating report with config:", config)
    toast.success("Report generation started", {
      description: "You will be notified when the report is ready for download."
    })
  }

  const handleDownloadReport = (report: ReportInstance) => {
    // In a real app, this would trigger the download
    console.log("Downloading report:", report.id)
    toast.success("Download started", {
      description: `Downloading ${report.name}`
    })
  }

  const handleToggleSchedule = (reportId: string, isActive: boolean) => {
    // In a real app, this would call the API
    console.log("Toggling schedule:", reportId, isActive)
    toast.success(isActive ? "Schedule activated" : "Schedule deactivated")
  }

  const handleEditSchedule = (report: ScheduledReport) => {
    // In a real app, this would open an edit dialog
    console.log("Editing schedule:", report.id)
    toast.info("Schedule editing coming soon")
  }

  return (
    <AppLayout headerTitle="Reports">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
              {/* Page Header */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                <p className="text-muted-foreground text-lg">
                  Generate and manage reports for compliance and performance tracking
                </p>
              </div>

              {/* Report Templates */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Report Templates</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reportsData.reportTemplates.map((template) => (
                    <ReportTemplateCard
                      key={template.id}
                      template={template}
                      onGenerate={handleGenerateReport}
                    />
                  ))}
                </div>
              </div>

              {/* Recent Reports and Scheduled Reports */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <RecentReportsTable
                    reports={reportsData.recentReports}
                    onDownload={handleDownloadReport}
                  />
                </div>
                <div className="space-y-4">
                  <ScheduledReportsCard
                    reports={reportsData.scheduledReports}
                    onToggleActive={handleToggleSchedule}
                    onEdit={handleEditSchedule}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Generation Dialog */}
      <ReportGenerationDialog
        template={selectedTemplate}
        exportFormats={reportsData.exportFormats}
        schedulingOptions={reportsData.schedulingOptions}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onGenerate={handleReportGeneration}
      />
    </AppLayout>
  )
}