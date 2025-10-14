"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getComplianceData, getSurveyTypeData, getProductivityData } from "@/lib/example-data"

// Extract data from JSON using utility functions
const complianceData = getComplianceData()
const surveyTypeData = getSurveyTypeData()
const productivityData = getProductivityData()

// Fixed chart configurations with proper color variables
const complianceChartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "Pending", 
    color: "hsl(var(--chart-2))",
  },
  overdue: {
    label: "Overdue",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const surveyTypeChartConfig = {
  count: {
    label: "Survey Count",
  },
} satisfies ChartConfig

const productivityChartConfig = {
  surveys: {
    label: "Surveys Completed",
    color: "hsl(var(--chart-1))",
  },
  avgTime: {
    label: "Avg Time (min)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ComplianceAreaChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Survey Compliance Trends</CardTitle>
        <CardDescription>
          Monthly survey completion rates and overdue tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={complianceChartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={complianceData}>
            <defs>
              <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-pending)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-pending)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillOverdue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-overdue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-overdue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="overdue"
              type="natural"
              fill="url(#fillOverdue)"
              stroke="var(--color-overdue)"
              stackId="a"
            />
            <Area
              dataKey="pending"
              type="natural"
              fill="url(#fillPending)"
              stroke="var(--color-pending)"
              stackId="a"
            />
            <Area
              dataKey="completed"
              type="natural"
              fill="url(#fillCompleted)"
              stroke="var(--color-completed)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function SurveyTypePieChart() {
  // Define colors for pie chart
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Survey Type Distribution</CardTitle>
        <CardDescription>
          Breakdown of survey types completed this month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={surveyTypeChartConfig} className="aspect-auto h-[250px] w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={surveyTypeData}
              dataKey="count"
              nameKey="type"
              innerRadius={60}
              strokeWidth={5}
            >
              {surveyTypeData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="type" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ProductivityBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Productivity Metrics</CardTitle>
        <CardDescription>
          Survey completion count and average time per user
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={productivityChartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart data={productivityData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="user"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.split(" ")[0]} // Show first name only
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar 
              dataKey="surveys" 
              fill="var(--color-surveys)" 
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ComplianceLineChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion Rate Trend</CardTitle>
        <CardDescription>
          Monthly survey completion percentage over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={complianceChartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart data={complianceData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Line
              dataKey="completed"
              type="monotone"
              stroke="var(--color-completed)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-completed)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "var(--color-completed)",
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Example of a dashboard with multiple charts
export function DashboardChartsExample() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="md:col-span-2">
        <ComplianceAreaChart />
      </div>
      <div>
        <SurveyTypePieChart />
      </div>
      <div className="md:col-span-2">
        <ProductivityBarChart />
      </div>
      <div>
        <ComplianceLineChart />
      </div>
    </div>
  )
}