"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ComplianceAreaChartProps {
  data: Array<{
    month: string
    cases: number
    assessments: number
    overall: number
  }>
  className?: string
}

const chartConfig = {
  cases: {
    label: "Cases",
    color: "hsl(var(--chart-1))",
  },
  assessments: {
    label: "Assessments", 
    color: "hsl(var(--chart-2))",
  },
  overall: {
    label: "Overall",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function ComplianceAreaChart({ data, className }: ComplianceAreaChartProps) {
  return (
    <ChartContainer config={chartConfig} className={className}>
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
          top: 12,
          bottom: 12,
        }}
      >
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
          domain={[85, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Area
          dataKey="overall"
          type="natural"
          fill="var(--color-overall)"
          fillOpacity={0.4}
          stroke="var(--color-overall)"
          strokeWidth={2}
        />
        <Area
          dataKey="cases"
          type="natural"
          fill="var(--color-cases)"
          fillOpacity={0.3}
          stroke="var(--color-cases)"
          strokeWidth={2}
        />
        <Area
          dataKey="assessments"
          type="natural"
          fill="var(--color-assessments)"
          fillOpacity={0.3}
          stroke="var(--color-assessments)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}