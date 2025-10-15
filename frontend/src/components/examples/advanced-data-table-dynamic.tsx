"use client"

import dynamic from 'next/dynamic'
import { TableSkeleton } from '@/components/ui/loading-skeleton'

// Dynamically import the heavy advanced data table component
const AdvancedDataTableExample = dynamic(
  () => import('./advanced-data-table-example').then(mod => ({ default: mod.AdvancedDataTableExample })),
  {
    loading: () => <TableSkeleton />,
    ssr: false, // Disable SSR for this heavy component
  }
)

export { AdvancedDataTableExample as AdvancedDataTableExampleDynamic }