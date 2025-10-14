'use client'

/**
 * Design System Showcase
 * 
 * Demonstrates the CHC Insight CRM design system using shadcn/ui components
 * with clean CSS custom properties theming.
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle, ThemeStatus } from '@/providers/theme-provider'

export function DesignSystemShowcase() {

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Design System Showcase</h1>
          <p className="text-muted-foreground mt-2">
            CHC Insight CRM design system using shadcn/ui components and healthcare theming
          </p>
          <div className="mt-2">
            <ThemeStatus />
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Color Palette Section */}
      <Card>
        <CardHeader>
          <CardTitle>Color System</CardTitle>
          <CardDescription>
            Healthcare-focused color palette using shadcn/ui default theming
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default shadcn/ui Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Theme Colors</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-2 bg-primary border" />
                <p className="text-xs text-muted-foreground">Primary</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-2 bg-secondary border" />
                <p className="text-xs text-muted-foreground">Secondary</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-2 bg-accent border" />
                <p className="text-xs text-muted-foreground">Accent</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-2 bg-muted border" />
                <p className="text-xs text-muted-foreground">Muted</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Status Colors</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-2 bg-green-500 border" />
                <p className="text-xs text-muted-foreground">Success</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-2 bg-yellow-500 border" />
                <p className="text-xs text-muted-foreground">Warning</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-2 bg-red-500 border" />
                <p className="text-xs text-muted-foreground">Error</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-2 bg-blue-500 border" />
                <p className="text-xs text-muted-foreground">Info</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Section */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Scale</CardTitle>
          <CardDescription>
            Consistent typography using Inter font with modular scale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h1 className="text-5xl font-bold">Heading 1 - Display</h1>
          <h2 className="text-4xl font-semibold">Heading 2 - Page Title</h2>
          <h3 className="text-3xl font-semibold">Heading 3 - Section</h3>
          <h4 className="text-2xl font-semibold">Heading 4 - Subsection</h4>
          <h5 className="text-xl font-medium">Heading 5 - Component</h5>
          <h6 className="text-lg font-medium">Heading 6 - Label</h6>
          <p className="text-base">Body text - Regular paragraph content with proper line height for readability.</p>
          <p className="text-sm text-muted-foreground">Small text - Captions and secondary information.</p>
          <p className="text-xs text-muted-foreground">Extra small text - Fine print and metadata.</p>
        </CardContent>
      </Card>

      {/* Component Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Component Variants</CardTitle>
          <CardDescription>
            Button sizes, status badges, and interactive elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buttons */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          <Separator />

          {/* Status Badges */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Status Badges</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Completed</Badge>
              <Badge variant="secondary">Approved</Badge>
              <Badge variant="outline">Pending</Badge>
              <Badge variant="destructive">Rejected</Badge>
            </div>
          </div>

          <Separator />

          {/* Priority Indicators */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Priority Indicators</h3>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
              <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>
              <Badge className="bg-gray-100 text-gray-800 border-gray-200">Normal</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress and Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Indicators</CardTitle>
          <CardDescription>Various progress and metric displays</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Survey Completion</span>
              <span>85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Quality Score</span>
              <span>92%</span>
            </div>
            <Progress value={92} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Staff Productivity</span>
              <span>78%</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-sm text-muted-foreground">Compliance Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <div className="text-sm text-muted-foreground">Surveys Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Patterns</CardTitle>
          <CardDescription>
            Responsive grid layouts for dashboard and data display
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Metrics Grid</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="text-2xl font-bold">1,{i}23</div>
                    <div className="text-sm text-muted-foreground">Metric {i}</div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Card Grid</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <CardTitle className="text-lg">Card {i}</CardTitle>
                    <CardDescription>Sample card content with description</CardDescription>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}