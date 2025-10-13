import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  PaginationState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table,
} from '@tanstack/react-table'
import { useState } from 'react'

// Default table configuration
export const defaultTableConfig = {
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
}

// Table state management hook
export function useTableState(initialConfig = defaultTableConfig) {
  const [sorting, setSorting] = useState<SortingState>(initialConfig.sorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialConfig.columnFilters)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialConfig.columnVisibility)
  const [pagination, setPagination] = useState<PaginationState>(initialConfig.pagination)
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  return {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    pagination,
    setPagination,
    rowSelection,
    setRowSelection,
    globalFilter,
    setGlobalFilter,
  }
}

// Enhanced table hook with common functionality
export function useDataTable<TData>({
  data,
  columns,
  pageCount,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  enableRowSelection = false,
  enableMultiRowSelection = true,
  initialState = defaultTableConfig,
}: {
  data: TData[]
  columns: ColumnDef<TData>[]
  pageCount?: number
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  enableRowSelection?: boolean
  enableMultiRowSelection?: boolean
  initialState?: typeof defaultTableConfig
}) {
  const tableState = useTableState(initialState)

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      sorting: tableState.sorting,
      columnFilters: tableState.columnFilters,
      columnVisibility: tableState.columnVisibility,
      pagination: tableState.pagination,
      rowSelection: tableState.rowSelection,
      globalFilter: tableState.globalFilter,
    },
    enableRowSelection,
    enableMultiRowSelection,
    onSortingChange: tableState.setSorting,
    onColumnFiltersChange: tableState.setColumnFilters,
    onColumnVisibilityChange: tableState.setColumnVisibility,
    onPaginationChange: tableState.setPagination,
    onRowSelectionChange: tableState.setRowSelection,
    onGlobalFilterChange: tableState.setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    ...(manualFiltering ? {} : { getFilteredRowModel: getFilteredRowModel() }),
    ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    manualPagination,
    manualSorting,
    manualFiltering,
  })

  return {
    table,
    ...tableState,
  }
}

// Common column definitions factory functions
export const commonColumns = {
  // Selection column factory
  select: () => ({
    id: 'select',
    header: 'Select',
    enableSorting: false,
    enableHiding: false,
  }),

  // Actions column factory
  actions: () => ({
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    enableHiding: false,
  }),

  // Status badge column factory
  status: (accessor: string) => ({
    accessorKey: accessor,
    header: 'Status',
    cell: ({ getValue }: { getValue: () => unknown }) => {
      const status = getValue() as string
      return status
    },
  }),

  // Date column factory
  date: (accessor: string, header: string) => ({
    accessorKey: accessor,
    header,
    cell: ({ getValue }: { getValue: () => unknown }) => {
      const date = getValue() as string | Date
      return date ? new Date(date).toLocaleDateString() : '-'
    },
  }),

  // DateTime column factory
  dateTime: (accessor: string, header: string) => ({
    accessorKey: accessor,
    header,
    cell: ({ getValue }: { getValue: () => unknown }) => {
      const date = getValue() as string | Date
      return date ? new Date(date).toLocaleString() : '-'
    },
  }),

  // User column factory
  user: (accessor: string, header: string) => ({
    accessorKey: accessor,
    header,
    cell: ({ getValue }: { getValue: () => unknown }) => {
      const user = getValue() as { name: string; email?: string; avatar?: string }
      return user.name
    },
  }),
}

// Utility functions
export function getStatusBadgeClasses(status: string): string {
  const statusClasses: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  }

  return statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

// Table pagination info
export function getTablePaginationInfo<TData>(table: Table<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const startRow = pageIndex * pageSize + 1
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)

  return {
    startRow,
    endRow,
    totalRows,
    currentPage: pageIndex + 1,
    totalPages: table.getPageCount(),
  }
}

// Export types for better TypeScript support
export type TableState = ReturnType<typeof useTableState>
export type DataTableOptions<TData> = Parameters<typeof useDataTable<TData>>[0]