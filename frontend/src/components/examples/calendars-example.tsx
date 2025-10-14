"use client"

import * as React from "react"
import { Calendars } from "@/components/ui/calendars"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Sample calendar data
const sampleCalendars = [
  {
    name: "Personal",
    items: [
      "Vacation Days",
      "Doctor Appointments", 
      "Family Events",
      "Personal Tasks"
    ]
  },
  {
    name: "Work",
    items: [
      "Team Meetings",
      "Project Deadlines",
      "Client Calls",
      "Training Sessions",
      "Performance Reviews"
    ]
  },
  {
    name: "Healthcare",
    items: [
      "Member Assessments",
      "Provider Reviews",
      "Compliance Audits",
      "Survey Deadlines",
      "Workflow Reviews"
    ]
  }
]

export function CalendarsExample() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sidebar Calendars</CardTitle>
        <CardDescription>
          Collapsible calendar groups with active state indicators
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border rounded-md">
          <Calendars calendars={sampleCalendars} />
        </div>
      </CardContent>
    </Card>
  )
}

export function CalendarsShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Sidebar Calendar Component</h3>
        <p className="text-sm text-muted-foreground mb-4">
          A collapsible calendar component designed for sidebar navigation with active state indicators.
        </p>
        <CalendarsExample />
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium">Features</h4>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Collapsible calendar groups with smooth animations</li>
          <li>• Active state indicators with checkmarks</li>
          <li>• Responsive design for sidebar integration</li>
          <li>• Keyboard navigation support</li>
          <li>• Customizable calendar items and grouping</li>
        </ul>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium">Usage</h4>
        <div className="bg-muted p-4 rounded-md">
          <pre className="text-sm">
{`import { Calendars } from "@/components/ui/calendars"

const calendars = [
  {
    name: "Personal",
    items: ["Vacation Days", "Appointments"]
  },
  {
    name: "Work", 
    items: ["Meetings", "Deadlines"]
  }
]

<Calendars calendars={calendars} />`}
          </pre>
        </div>
      </div>
    </div>
  )
}