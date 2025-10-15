"use client"

import dynamic from 'next/dynamic'
import { ChartSkeleton } from '@/components/ui/loading-skeleton'

// Dynamically import chart components to reduce initial bundle size
export const ComplianceAreaChart = dynamic(
  () => import('./chart-examples').then(mod => ({ default: mod.ComplianceAreaChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

export const SurveyTypePieChart = dynamic(
  () => import('./chart-examples').then(mod => ({ default: mod.SurveyTypePieChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

export const ProductivityBarChart = dynamic(
  () => import('./chart-examples').then(mod => ({ default: mod.ProductivityBarChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

export const ComplianceLineChart = dynamic(
  () => import('./chart-examples').then(mod => ({ default: mod.ComplianceLineChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

export const DashboardChartsExample = dynamic(
  () => import('./chart-examples').then(mod => ({ default: mod.DashboardChartsExample })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)