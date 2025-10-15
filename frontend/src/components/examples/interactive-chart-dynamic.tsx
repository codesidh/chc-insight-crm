"use client"

import dynamic from 'next/dynamic'
import { ChartSkeleton } from '@/components/ui/loading-skeleton'

export const ChartAreaInteractive = dynamic(
  () => import('./interactive-chart-example').then(mod => ({ default: mod.ChartAreaInteractive })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)