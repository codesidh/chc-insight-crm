"use client"

import { Pie, PieChart, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface FormStatusPieChartProps {
  data: Array<{
    status: string
    count: number
    percentage: number
    color: string
  }>
  className?: string
}

const chartConfig = {
  count: {
    label: "Forms",
  },
} satisfies ChartConfig

export function FormStatusPieChart({ data, className }: FormStatusPieChartProps) {
  return (
    <ChartContainer config={chartConfig} className={className}>
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={40}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}