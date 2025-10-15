'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight, 

  User,
  Calendar,
  AlertCircle,
  Send
} from 'lucide-react'
import { format } from 'date-fns'

import { FormInstance, FormStatus } from '@/types'
import { FormStatusBadgeExtended } from './form-status-badge'

interface WorkflowStatusManagerProps {
  instance: FormInstance
  onStatusChange: (status: FormStatus, comment?: string) => void
  onAssign: (userId: string) => void
  currentUserId: string
  userRole: string
  readonly?: boolean
}

interface WorkflowAction {
  id: string
  label: string
  status: FormStatus
  icon: React.ComponentType<any>
  variant: 'default' | 'destructive' | 'outline' | 'secondary'
  requiresComment?: boolean
  allowedRoles?: string[]
}

// Define workflow actions based on current status
const getAvailableActions = (currentStatus: FormStatus, userRole: string): WorkflowAction[] => {
  const actions: WorkflowAction[] = []
  
  switch (currentStatus) {
    case FormStatus.DRAFT:
      // No workflow actions available for draft - user needs to submit first
      break
      
    case FormStatus.PENDING:
      if (['manager', 'administrator', 'qm_staff'].includes(userRole)) {
        actions.push({
          id: 'approve',
          label: 'Approve',
          status: FormStatus.APPROVED,
          icon: CheckCircle,
          variant: 'default',
          allowedRoles: ['manager', 'administrator', 'qm_staff']
        })
        
        actions.push({
          id: 'reject',
          label: 'Reject',
          status: FormStatus.REJECTED,
          icon: XCircle,
          variant: 'destructive',
          requiresComment: true,
          allowedRoles: ['manager', 'administrator', 'qm_staff']
        })
      }
      break
      
    case FormStatus.APPROVED:
      if (['manager', 'administrator'].includes(userRole)) {
        actions.push({
          id: 'complete',
          label: 'Mark Complete',
          status: FormStatus.COMPLETED,
          icon: CheckCircle,
          variant: 'default',
          allowedRoles: ['manager', 'administrator']
        })
      }
      break
      
    case FormStatus.REJECTED:
      // Rejected forms typically go back to draft when edited
      break
      
    case FormStatus.COMPLETED:
      // No further actions for completed forms
      break
      
    case FormStatus.CANCELLED:
      // No actions for cancelled forms
      break
  }
  
  return actions.filter(action => 
    !action.allowedRoles || action.allowedRoles.includes(userRole)
  )
}

// Workflow timeline component
interface WorkflowTimelineProps {
  instance: FormInstance
}

function WorkflowTimeline({ instance }: WorkflowTimelineProps) {
  const timelineEvents = [
    {
      status: 'Created',
      date: instance.createdAt,
      icon: Clock,
      description: 'Form instance created'
    },
    ...(instance.submittedAt ? [{
      status: 'Submitted',
      date: instance.submittedAt,
      icon: Send,
      description: 'Form submitted for review'
    }] : []),
    ...(instance.approvedAt ? [{
      status: instance.status === FormStatus.APPROVED ? 'Approved' : 'Completed',
      date: instance.approvedAt,
      icon: CheckCircle,
      description: instance.status === FormStatus.APPROVED ? 'Form approved' : 'Form completed'
    }] : [])
  ]
  
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Workflow Timeline</h4>
      <div className="space-y-3">
        {timelineEvents.map((event, index) => {
          const Icon = event.icon
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-3 w-3 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">{event.status}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.date), 'MMM d, yyyy \'at\' h:mm a')}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{event.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function WorkflowStatusManager({
  instance,
  onStatusChange,
  onAssign: _onAssign,
  currentUserId: _currentUserId,
  userRole,
  readonly = false
}: WorkflowStatusManagerProps) {
  const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null)
  const [comment, setComment] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const availableActions = getAvailableActions(instance.status, userRole)
  const canTakeAction = !readonly && availableActions.length > 0
  
  const handleActionSelect = (action: WorkflowAction) => {
    setSelectedAction(action)
    setComment('')
  }
  
  const handleActionConfirm = async () => {
    if (!selectedAction) return
    
    if (selectedAction.requiresComment && !comment.trim()) {
      return // Comment is required
    }
    
    setIsProcessing(true)
    try {
      await onStatusChange(selectedAction.status, comment.trim() || undefined)
      setSelectedAction(null)
      setComment('')
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleActionCancel = () => {
    setSelectedAction(null)
    setComment('')
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Workflow Status</CardTitle>
            <CardDescription>
              Current status and available workflow actions
            </CardDescription>
          </div>
          <FormStatusBadgeExtended
            status={instance.status}
            submittedAt={instance.submittedAt || undefined}
            approvedAt={instance.approvedAt || undefined}
            dueDate={instance.dueDate || undefined}
            showTimestamp={true}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Assignment Information */}
        {instance.assignedTo && (
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Assigned to:</span>
            <span className="font-medium">{instance.assignedTo}</span>
          </div>
        )}
        
        {/* Due Date Information */}
        {instance.dueDate && (
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Due date:</span>
            <span className={`font-medium ${
              new Date() > new Date(instance.dueDate) ? 'text-red-600' : 'text-foreground'
            }`}>
              {format(new Date(instance.dueDate), 'MMM d, yyyy')}
            </span>
            {new Date() > new Date(instance.dueDate) && (
              <Badge variant="destructive" className="text-xs">Overdue</Badge>
            )}
          </div>
        )}
        
        <Separator />
        
        {/* Workflow Timeline */}
        <WorkflowTimeline instance={instance} />
        
        {/* Available Actions */}
        {canTakeAction && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Available Actions</h4>
              
              {!selectedAction ? (
                <div className="flex flex-wrap gap-2">
                  {availableActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <Button
                        key={action.id}
                        variant={action.variant}
                        size="sm"
                        onClick={() => handleActionSelect(action)}
                        className="gap-2"
                      >
                        <Icon className="h-3 w-3" />
                        {action.label}
                      </Button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">
                          Confirm action: {selectedAction.label}
                        </p>
                        <p className="text-sm">
                          This will change the form status to{' '}
                          <Badge variant="outline">{selectedAction.status}</Badge>
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                  
                  {selectedAction.requiresComment && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Comment <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        placeholder="Please provide a reason for this action..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}
                  
                  {!selectedAction.requiresComment && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Comment (optional)</label>
                      <Textarea
                        placeholder="Add a comment about this action..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleActionConfirm}
                      disabled={
                        isProcessing || 
                        (selectedAction.requiresComment && !comment.trim())
                      }
                      variant={selectedAction.variant}
                      size="sm"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Confirm {selectedAction.label}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleActionCancel}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* No Actions Available */}
        {!canTakeAction && instance.status !== FormStatus.DRAFT && (
          <>
            <Separator />
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                {readonly 
                  ? 'Viewing in read-only mode'
                  : 'No workflow actions available for your role'
                }
              </p>
            </div>
          </>
        )}
        
        {/* Draft Status Info */}
        {instance.status === FormStatus.DRAFT && (
          <>
            <Separator />
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This form is in draft status. Submit the form to start the approval workflow.
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  )
}