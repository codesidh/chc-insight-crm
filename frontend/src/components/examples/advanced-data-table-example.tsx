"use client"

import { useState } from "react"
import { AdvancedDataTable, DataTableItem } from "@/components/ui/advanced-data-table"

const sampleData: DataTableItem[] = [
  {
    id: 1,
    header: "Executive Summary",
    type: "Executive Summary",
    status: "Done",
    target: "2",
    limit: "3",
    reviewer: "Eddie Lake",
  },
  {
    id: 2,
    header: "Technical Approach Overview",
    type: "Technical Approach",
    status: "In Progress",
    target: "5",
    limit: "8",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 3,
    header: "System Architecture",
    type: "Design",
    status: "Not Started",
    target: "3",
    limit: "5",
    reviewer: "Assign reviewer",
  },
  {
    id: 4,
    header: "Data Management Strategy",
    type: "Capabilities",
    status: "In Progress",
    target: "4",
    limit: "6",
    reviewer: "Emily Whalen",
  },
  {
    id: 5,
    header: "Security and Compliance",
    type: "Focus Documents",
    status: "Done",
    target: "2",
    limit: "4",
    reviewer: "Eddie Lake",
  },
  {
    id: 6,
    header: "Implementation Timeline",
    type: "Narrative",
    status: "Not Started",
    target: "1",
    limit: "2",
    reviewer: "Assign reviewer",
  },
  {
    id: 7,
    header: "Quality Assurance Plan",
    type: "Technical Approach",
    status: "In Progress",
    target: "3",
    limit: "4",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 8,
    header: "Risk Management",
    type: "Capabilities",
    status: "Done",
    target: "2",
    limit: "3",
    reviewer: "Emily Whalen",
  },
]

export function AdvancedDataTableExample() {
  const [data, setData] = useState<DataTableItem[]>(sampleData)

  const handleDataChange = (newData: DataTableItem[]) => {
    setData(newData)
    // Here you could also sync with your backend
    console.log("Data updated:", newData)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Advanced Data Table</h1>
        <p className="text-muted-foreground">
          A comprehensive data table with drag-and-drop reordering, inline editing, 
          and detailed drawer views.
        </p>
      </div>
      
      <AdvancedDataTable 
        data={data} 
        onDataChange={handleDataChange}
      />
    </div>
  )
}