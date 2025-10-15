"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ReportTemplate, ReportParameter, ExportFormat, SchedulingOption, ReportConfig } from "@/types/reports"

interface ReportGenerationDialogProps {
  template: ReportTemplate | null
  exportFormats: ExportFormat[]
  schedulingOptions: SchedulingOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (config: ReportConfig) => void
}

export function ReportGenerationDialog({
  template,
  exportFormats,
  schedulingOptions,
  open,
  onOpenChange,
  onGenerate
}: ReportGenerationDialogProps) {
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [exportFormat, setExportFormat] = useState<string>("excel")
  const [scheduleType, setScheduleType] = useState<string>("once")
  const [dateRange, setDateRange] = useState<{ from?: Date | undefined; to?: Date | undefined }>({})

  if (!template) return null

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => ({ ...prev, [paramName]: value }))
  }

  const handleGenerate = () => {
    const config: ReportConfig = {
      templateId: template.id,
      parameters,
      format: exportFormat,
      ...(scheduleType !== "once" && {
        schedule: {
          type: scheduleType,
          time: "09:00",
          recipients: []
        }
      })
    }
    onGenerate(config)
    onOpenChange(false)
  }

  const renderParameterInput = (param: ReportParameter) => {
    switch (param.type) {
      case "text":
        return (
          <Input
            value={parameters[param.name] || param.defaultValue || ""}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            placeholder={param.label}
          />
        )
      
      case "select":
        return (
          <Select
            value={parameters[param.name] || param.defaultValue}
            onValueChange={(value) => handleParameterChange(param.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${param.label}`} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case "multiSelect":
        const selectedValues = parameters[param.name] || param.defaultValue || []
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((value: string) => {
                const option = param.options?.find(opt => opt.value === value)
                return option ? (
                  <Badge key={value} variant="secondary">
                    {option.label}
                  </Badge>
                ) : null
              })}
            </div>
            <Select
              onValueChange={(value) => {
                const current = parameters[param.name] || []
                if (!current.includes(value)) {
                  handleParameterChange(param.name, [...current, value])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Add ${param.label}`} />
              </SelectTrigger>
              <SelectContent>
                {param.options?.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    disabled={selectedValues.includes(option.value)}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      
      case "dateRange":
        return (
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? format(dateRange.from, "PPP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? format(dateRange.to, "PPP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )
      
      default:
        return (
          <Input
            value={parameters[param.name] || param.defaultValue || ""}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            placeholder={param.label}
          />
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Report: {template.name}</DialogTitle>
          <DialogDescription>
            Configure parameters and options for your report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Parameters */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Report Parameters</h3>
            {template.parameters.map((param) => (
              <div key={param.name} className="space-y-2">
                <Label htmlFor={param.name}>
                  {param.label}
                  {param.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderParameterInput(param)}
              </div>
            ))}
          </div>

          {/* Export Format */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Export Format</h3>
            <div className="grid grid-cols-3 gap-3">
              {exportFormats.map((fmt) => (
                <div
                  key={fmt.value}
                  className={cn(
                    "border rounded-lg p-3 cursor-pointer transition-colors",
                    exportFormat === fmt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setExportFormat(fmt.value)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={exportFormat === fmt.value} />
                    <span className="font-medium">{fmt.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fmt.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Scheduling</h3>
            <div className="grid grid-cols-2 gap-3">
              {schedulingOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "border rounded-lg p-3 cursor-pointer transition-colors",
                    scheduleType === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setScheduleType(option.value)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={scheduleType === option.value} />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate}>
            {scheduleType === "once" ? (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Schedule Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}