"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Import dynamic components to reduce initial bundle size
import {
  ComplianceAreaChart,
  SurveyTypePieChart,
  ProductivityBarChart,
  ComplianceLineChart,
  DashboardChartsExample,
} from "@/components/examples/chart-examples-dynamic"

import {
  ChartAreaInteractive,
} from "@/components/examples/interactive-chart-dynamic"

import {
  GlobalCommandPalette,
  MemberSearchCommand,
  ProviderSearchCommand,
  SurveySearchCommand,
  WorkQueueFilterCommand,
} from "@/components/examples/command-examples"

import {
  SurveyTemplateForm,
  MemberAssessmentForm,
} from "@/components/examples/form-examples-dynamic"

import {
  SurveyBreadcrumbExample,
  MemberBreadcrumbExample,
  WorkQueuePaginationExample,
  SurveyDetailTabsExample,
  DashboardTabsExample,
  NavigationShowcase,
} from "@/components/examples/navigation-examples"

import {
  CalendarsShowcase,
} from "@/components/examples/calendars-example"

import {
  Calendar01,
} from "@/components/examples/calendar01-example"

import {
  Calendar04,
} from "@/components/examples/calendar04-example"

export default function ExamplesPage() {
  return (
    <AppLayout headerTitle="Component Examples">
      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">shadcn/ui Component Examples</h1>
          <p className="text-muted-foreground">
            Comprehensive examples of shadcn/ui components configured for the CHC Insight CRM application.
            All components include proper validation, accessibility features, and responsive design.
          </p>
        </div>

        <Tabs defaultValue="charts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="charts">
              📊 Charts
              <Badge variant="secondary" className="ml-2">6</Badge>
            </TabsTrigger>
            <TabsTrigger value="commands">
              🔍 Commands
              <Badge variant="secondary" className="ml-2">5</Badge>
            </TabsTrigger>
            <TabsTrigger value="forms">
              📝 Forms
              <Badge variant="secondary" className="ml-2">2</Badge>
            </TabsTrigger>
            <TabsTrigger value="navigation">
              🧭 Navigation
              <Badge variant="secondary" className="ml-2">9</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chart Components with Recharts Integration</CardTitle>
                <CardDescription>
                  Interactive charts using Recharts with shadcn/ui styling and proper color theming.
                  All charts are responsive and include tooltips, legends, and accessibility features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Interactive Chart with Time Range</h3>
                  <ChartAreaInteractive />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Complete Dashboard Layout</h3>
                  <DashboardChartsExample />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Individual Chart Examples</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <ComplianceAreaChart />
                    <SurveyTypePieChart />
                    <ProductivityBarChart />
                    <ComplianceLineChart />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commands Tab */}
          <TabsContent value="commands" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Command Components for Search Interfaces</CardTitle>
                <CardDescription>
                  Command palettes and search interfaces with keyboard shortcuts, type-ahead functionality,
                  and proper categorization. Press ⌘K to open the global command palette.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Global Command Palette</h3>
                  <p className="text-sm text-muted-foreground">
                    Application-wide command palette with keyboard shortcuts (⌘K)
                  </p>
                  <GlobalCommandPalette />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Specialized Search Commands</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium">Member Search</h4>
                      <MemberSearchCommand onSelect={(member) => console.log("Selected member:", member)} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Provider Search</h4>
                      <ProviderSearchCommand onSelect={(provider) => console.log("Selected provider:", provider)} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Survey Template Search</h4>
                      <SurveySearchCommand onSelect={(survey) => console.log("Selected survey:", survey)} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Work Queue Filter</h4>
                      <WorkQueueFilterCommand onFilterChange={(filters) => console.log("Applied filters:", filters)} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Components with Validation</CardTitle>
                <CardDescription>
                  Advanced forms with React Hook Form, Zod validation, real-time error display,
                  file uploads, date pickers, and complex business rule validation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Survey Template Creation Form</h3>
                  <p className="text-sm text-muted-foreground">
                    Complex form with business rules, date validation, and conditional fields
                  </p>
                  <SurveyTemplateForm />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Member Assessment Form</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive assessment form with file uploads, checkbox groups, and nested validation
                  </p>
                  <MemberAssessmentForm />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Navigation Tab */}
          <TabsContent value="navigation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Navigation Components</CardTitle>
                <CardDescription>
                  Breadcrumbs, pagination, tabs, and other navigation components with responsive design,
                  keyboard navigation, and proper accessibility features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Complete Navigation Showcase</h3>
                  <NavigationShowcase />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Sidebar Calendar Component</h3>
                  <CalendarsShowcase />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Date Picker Calendars</h3>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium">Single Date Selection</h4>
                      <p className="text-sm text-muted-foreground">
                        Interactive date picker calendar with single date selection
                      </p>
                      <div className="flex justify-center">
                        <Calendar01 />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Date Range Selection</h4>
                      <p className="text-sm text-muted-foreground">
                        Calendar with range selection for start and end dates
                      </p>
                      <div className="flex justify-center">
                        <Calendar04 />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Individual Navigation Examples</h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-medium">Breadcrumb Navigation</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Survey Management</p>
                          <SurveyBreadcrumbExample />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Member Profile</p>
                          <MemberBreadcrumbExample />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-medium">Advanced Pagination</h4>
                      <WorkQueuePaginationExample />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-medium">Tabbed Interfaces</h4>
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Survey Detail Tabs</p>
                          <SurveyDetailTabsExample />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Dashboard Tabs</p>
                          <DashboardTabsExample />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>
              All components are built with modern web standards and best practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium">🎨 Design System</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Clean HSL color system</li>
                  <li>• Consistent typography scale</li>
                  <li>• Responsive design patterns</li>
                  <li>• Dark/light theme support</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">♿ Accessibility</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• WCAG AA compliant</li>
                  <li>• Keyboard navigation</li>
                  <li>• Screen reader support</li>
                  <li>• Focus management</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">⚡ Performance</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Lazy loading</li>
                  <li>• Memoized components</li>
                  <li>• Debounced inputs</li>
                  <li>• Optimized rendering</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}