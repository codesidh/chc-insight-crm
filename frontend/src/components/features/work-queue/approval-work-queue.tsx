'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  User, 
  Calendar, 
  Search, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ArrowUpDown
} from 'lucide-react'
import { format } from 'date-fns'

import { FormStatus } from '@/types'
import { queryKeys } from '@/lib/query-client'
import { FormStatusBadge } from '../survey-execution/form-status-badge'
import { useDebounce } from '@/hooks/use-debounce'

interface ApprovalWorkQueueProps {
  userId: string
  userRole: string
  onItemSelect?: (instanceId: string) => void
  className?: string
}

interface WorkQueueFilters {
  status?: FormStatus
  priority?: 'high' | 'medium' | 'low'
  category?: string | undefined
  search?: string
  sortBy?: 'dueDate' | 'submittedAt' | 'priority'
  sortOrder?: 'asc' | 'desc'
}

interface WorkQueueItem {
  id: string
  instanceId: string
  formName: string
  memberName?: string
  providerName?: string
  status: FormStatus
  priority: 'high' | 'medium' | 'low'
  dueDate?: Date
  submittedAt?: Date
  assignedTo?: string
  category: string
  type: string
}

// Mock data for demonstration
const mockWorkQueueItems: WorkQueueItem[] = [
  {
    id: '1',
    instanceId: 'inst-001',
    formName: 'BH Initial Referral v1.0',
    memberName: 'John Smith',
    providerName: 'Dr. Sarah Johnson',
    status: FormStatus.PENDING,
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    assignedTo: 'current-user',
    category: 'Cases',
    type: 'BH Referrals'
  },
  {
    id: '2',
    instanceId: 'inst-002',
    formName: 'Member Satisfaction Survey Q4',
    memberName: 'Jane Doe',
    status: FormStatus.PENDING,
    priority: 'medium',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    assignedTo: 'current-user',
    category: 'Assessments',
    type: 'Member Satisfaction'
  },
  {
    id: '3',
    instanceId: 'inst-003',
    formName: 'Provider Quality Review v2.0',
    providerName: 'Metro Health Clinic',
    status: FormStatus.PENDING,
    priority: 'low',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day overdue
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    assignedTo: 'current-user',
    category: 'Assessments',
    type: 'Provider Performance'
  }
]

function WorkQueueItemCard({ 
  item, 
  onSelect, 
  onQuickAction 
}: { 
  item: WorkQueueItem
  onSelect: (instanceId: string) => void
  onQuickAction: (instanceId: string, action: 'approve' | 'reject') => void
}) {
  const isOverdue = item.dueDate && new Date() > new Date(item.dueDate)
  const daysSinceSubmitted = item.submittedAt 
    ? Math.floor((Date.now() - new Date(item.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card className={`transition-all hover:shadow-md ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-sm">{item.formName}</h3>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getPriorityColor(item.priority)}`}
                >
                  {item.priority} priority
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>{item.category} • {item.type}</span>
                {daysSinceSubmitted > 0 && (
                  <span>Submitted {daysSinceSubmitted}d ago</span>
                )}
              </div>
            </div>
            <FormStatusBadge status={item.status} showIcon={false} />
          </div>
          
          {/* Context Information */}
          <div className="space-y-1">
            {item.memberName && (
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Member:</span>
                <span>{item.memberName}</span>
              </div>
            )}
            {item.providerName && (
              <div className="flex items-center space-x-2 text-sm">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Provider:</span>
                <span>{item.providerName}</span>
              </div>
            )}
          </div>
          
          {/* Due Date */}
          {item.dueDate && (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Due:</span>
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                {format(new Date(item.dueDate), 'MMM d, yyyy')}
              </span>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-2 w-2 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect(item.instanceId)}
              className="gap-1"
            >
              <Eye className="h-3 w-3" />
              Review
            </Button>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuickAction(item.instanceId, 'approve')}
                className="gap-1 text-green-600 hover:text-green-700"
              >
                <CheckCircle className="h-3 w-3" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuickAction(item.instanceId, 'reject')}
                className="gap-1 text-red-600 hover:text-red-700"
              >
                <XCircle className="h-3 w-3" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ApprovalWorkQueue({ 
  userId, 
  userRole: _userRole, 
  onItemSelect,
  className 
}: ApprovalWorkQueueProps) {
  const [filters, setFilters] = useState<WorkQueueFilters>({
    sortBy: 'dueDate',
    sortOrder: 'asc'
  })
  const [searchQuery, setSearchQuery] = useState('')
  
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  // In a real app, this would fetch from the API
  const { data: workQueueData, isLoading } = useQuery({
    queryKey: queryKeys.workQueue.tasks(userId, { ...filters, search: debouncedSearch }),
    queryFn: () => {
      // Simulate API call
      return Promise.resolve({
        success: true,
        data: {
          data: mockWorkQueueItems,
          pagination: {
            page: 1,
            limit: 20,
            total: mockWorkQueueItems.length,
            totalPages: 1
          }
        }
      })
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
  
  const workQueueItems = workQueueData?.data?.data || []
  
  // Filter and sort items
  const filteredItems = workQueueItems
    .filter(item => {
      if (filters.status && item.status !== filters.status) return false
      if (filters.priority && item.priority !== filters.priority) return false
      if (filters.category && item.category !== filters.category) return false
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase()
        return (
          item.formName.toLowerCase().includes(searchLower) ||
          item.memberName?.toLowerCase().includes(searchLower) ||
          item.providerName?.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
    .sort((a, b) => {
      const { sortBy, sortOrder } = filters
      let comparison = 0
      
      switch (sortBy) {
        case 'dueDate':
          if (a.dueDate && b.dueDate) {
            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          }
          break
        case 'submittedAt':
          if (a.submittedAt && b.submittedAt) {
            comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
          }
          break
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
          break
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })
  
  const handleQuickAction = async (instanceId: string, action: 'approve' | 'reject') => {
    try {
      // In a real app, this would call the API
      console.log(`${action} form instance:`, instanceId)
      // await workQueueApi.updateTaskStatus(instanceId, action === 'approve' ? 'approved' : 'rejected')
    } catch (error) {
      console.error(`Failed to ${action} form:`, error)
    }
  }
  
  const handleItemSelect = (instanceId: string) => {
    if (onItemSelect) {
      onItemSelect(instanceId)
    } else {
      // Default behavior - navigate to form execution page
      window.location.href = `/surveys/execute/${instanceId}?readonly=true`
    }
  }
  
  // Group items by status
  const pendingItems = filteredItems.filter(item => item.status === FormStatus.PENDING)
  const overdueItems = filteredItems.filter(item => 
    item.dueDate && new Date() > new Date(item.dueDate)
  )
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Approval Work Queue</CardTitle>
              <CardDescription>
                Forms pending your review and approval
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {pendingItems.length} pending
              </Badge>
              {overdueItems.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {overdueItems.length} overdue
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forms, members, or providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  priority: value === 'all' ? undefined : value as any 
                }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  category: value === 'all' ? undefined : value as string
                }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Cases">Cases</SelectItem>
                  <SelectItem value="Assessments">Assessments</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc'
                  setFilters(prev => ({ ...prev, sortOrder: newOrder }))
                }}
                className="gap-1"
              >
                <ArrowUpDown className="h-3 w-3" />
                {filters.sortBy}
              </Button>
            </div>
          </div>
          
          {/* Work Queue Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All ({filteredItems.length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({overdueItems.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingItems.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                          <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                          <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <WorkQueueItemCard
                      key={item.id}
                      item={item}
                      onSelect={handleItemSelect}
                      onQuickAction={handleQuickAction}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No items in work queue</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="overdue" className="space-y-4">
              {overdueItems.length > 0 ? (
                <div className="space-y-4">
                  {overdueItems.map((item) => (
                    <WorkQueueItemCard
                      key={item.id}
                      item={item}
                      onSelect={handleItemSelect}
                      onQuickAction={handleQuickAction}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No overdue items</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {pendingItems.length > 0 ? (
                <div className="space-y-4">
                  {pendingItems.map((item) => (
                    <WorkQueueItemCard
                      key={item.id}
                      item={item}
                      onSelect={handleItemSelect}
                      onQuickAction={handleQuickAction}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending items</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}