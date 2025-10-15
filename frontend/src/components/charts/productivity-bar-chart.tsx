"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ProductivityBarChartProps {
  data: Array<{
    week: string
    formsCompleted: number
    avgCompletionTime: number
    staffUtilization: number
  }>
  className?: string
}

const chartConfig = {
  formsCompleted: {
    label: "Forms Completed",
    color: "hsl(var(--chart-1))",
  },
  staffUtilization: {
    label: "Staff Utilization %",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ProductivityBarChart({ data, className }: ProductivityBarChartProps) {
  return (
    <ChartContainer config={chartConfig} className={className}>
      <BarChart
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
          dataKey="week"
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
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <Bar
          dataKey="formsCompleted"
          fill="var(--color-formsCompleted)"
          radius={4}
        />
      </BarChart>
    </ChartContainer>
  )
}