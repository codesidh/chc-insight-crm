"use client"

import * as React from "react"
import { Home, Users, FileText, BarChart3, Building2 } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"


// Breadcrumb Examples
export function SurveyBreadcrumbExample() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">
            <Home className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/surveys">Surveys</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/surveys/templates">Templates</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Initial Assessment Template</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function MemberBreadcrumbExample() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/members">Members</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/members/M001234">John Doe (M001234)</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Assessment History</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

// Pagination Examples
export function WorkQueuePaginationExample() {
  const [currentPage, setCurrentPage] = React.useState(1)
  const totalPages = 12
  const itemsPerPage = 25
  const totalItems = 287

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} surveys
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="page-size">Items per page:</Label>
          <Select defaultValue="25">
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {/* First page */}
          <PaginationItem>
            <PaginationLink 
              href="#" 
              onClick={() => setCurrentPage(1)}
              isActive={currentPage === 1}
            >
              1
            </PaginationLink>
          </PaginationItem>
          
          {/* Ellipsis if needed */}
          {currentPage > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          
          {/* Current page and neighbors */}
          {Array.from({ length: 3 }, (_, i) => {
            const page = currentPage - 1 + i
            if (page > 1 && page < totalPages) {
              return (
                <PaginationItem key={page}>
                  <PaginationLink 
                    href="#" 
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            }
            return null
          })}
          
          {/* Ellipsis if needed */}
          {currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          
          {/* Last page */}
          {totalPages > 1 && (
            <PaginationItem>
              <PaginationLink 
                href="#" 
                onClick={() => setCurrentPage(totalPages)}
                isActive={currentPage === totalPages}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}
          
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

// Tabs Examples
export function SurveyDetailTabsExample() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">
          <FileText className="h-4 w-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="questions">
          Questions
          <Badge variant="secondary" className="ml-2">12</Badge>
        </TabsTrigger>
        <TabsTrigger value="logic">
          Logic Rules
          <Badge variant="secondary" className="ml-2">3</Badge>
        </TabsTrigger>
        <TabsTrigger value="workflow">
          Workflow
        </TabsTrigger>
        <TabsTrigger value="history">
          History
          <Badge variant="secondary" className="ml-2">8</Badge>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Survey Overview</CardTitle>
            <CardDescription>
              Basic information and configuration for this survey template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Survey Type</Label>
                <p className="text-sm text-muted-foreground">Initial Assessment</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge variant="default">Active</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-muted-foreground">March 15, 2024</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Modified</Label>
                <p className="text-sm text-muted-foreground">April 2, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="questions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Survey Questions</CardTitle>
            <CardDescription>
              Manage questions and their configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 1, text: "What is your current level of care?", type: "Single Select", required: true },
                { id: 2, text: "Please describe your living situation", type: "Text Area", required: true },
                { id: 3, text: "Do you require assistance with daily activities?", type: "Yes/No", required: true },
                { id: 4, text: "Upload any relevant medical documents", type: "File Upload", required: false },
              ].map((question) => (
                <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{question.text}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{question.type}</Badge>
                      {question.required && <Badge variant="secondary">Required</Badge>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="logic" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Conditional Logic Rules</CardTitle>
            <CardDescription>
              Configure question branching and conditional display
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  id: 1, 
                  condition: "If 'Level of Care' equals 'Nursing Home'", 
                  action: "Show 'Facility Information' section",
                  status: "Active"
                },
                { 
                  id: 2, 
                  condition: "If 'Requires Assistance' equals 'Yes'", 
                  action: "Show 'Care Needs Assessment' questions",
                  status: "Active"
                },
                { 
                  id: 3, 
                  condition: "If 'Age' is greater than 65", 
                  action: "Show 'Medicare Information' section",
                  status: "Draft"
                },
              ].map((rule) => (
                <div key={rule.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={rule.status === "Active" ? "default" : "secondary"}>
                          {rule.status}
                        </Badge>
                        <span className="text-sm font-medium">Rule {rule.id}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.condition}</p>
                      <p className="text-sm font-medium">{rule.action}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="workflow" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Configuration</CardTitle>
            <CardDescription>
              Configure approval workflow and assignment rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Approval Required</Label>
                <p className="text-sm text-muted-foreground">Yes</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Auto-Assignment</Label>
                <p className="text-sm text-muted-foreground">Enabled</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Due Date</Label>
                <p className="text-sm text-muted-foreground">30 days from assignment</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Escalation</Label>
                <p className="text-sm text-muted-foreground">7 days overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="history" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Change History</CardTitle>
            <CardDescription>
              Track all changes made to this survey template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "April 2, 2024", user: "Alice Johnson", action: "Modified question validation rules", version: "v1.3" },
                { date: "March 28, 2024", user: "Bob Smith", action: "Added new conditional logic rule", version: "v1.2" },
                { date: "March 20, 2024", user: "Carol Davis", action: "Updated workflow configuration", version: "v1.1" },
                { date: "March 15, 2024", user: "Alice Johnson", action: "Created initial template", version: "v1.0" },
              ].map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{entry.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.date} by {entry.user}
                    </p>
                  </div>
                  <Badge variant="outline">{entry.version}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export function DashboardTabsExample() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">
          <BarChart3 className="h-4 w-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="surveys">
          <FileText className="h-4 w-4 mr-2" />
          Surveys
          <Badge variant="secondary" className="ml-2">24</Badge>
        </TabsTrigger>
        <TabsTrigger value="members">
          <Users className="h-4 w-4 mr-2" />
          Members
        </TabsTrigger>
        <TabsTrigger value="providers">
          <Building2 className="h-4 w-4 mr-2" />
          Providers
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,567</div>
              <p className="text-xs text-muted-foreground">
                +156 new this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Surveys</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                -8 from yesterday
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="surveys">
        <Card>
          <CardHeader>
            <CardTitle>Recent Survey Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Survey management content would go here...</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="members">
        <Card>
          <CardHeader>
            <CardTitle>Member Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Member management content would go here...</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="providers">
        <Card>
          <CardHeader>
            <CardTitle>Provider Network</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Provider management content would go here...</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

// Combined Navigation Example
export function NavigationShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Breadcrumb Navigation</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Survey Management</Label>
            <SurveyBreadcrumbExample />
          </div>
          <Separator />
          <div>
            <Label className="text-sm font-medium">Member Profile</Label>
            <MemberBreadcrumbExample />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Pagination</h3>
        <WorkQueuePaginationExample />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Tab Navigation</h3>
        <DashboardTabsExample />
      </div>
    </div>
  )
}