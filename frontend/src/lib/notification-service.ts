// Notification service for handling email notifications and in-app notifications
import { apiClient } from './api-client'

export interface NotificationRequest {
  type: 'email' | 'in_app' | 'both'
  recipients: string[]
  subject: string
  message: string
  templateId?: string
  templateData?: Record<string, any>
  priority?: 'low' | 'medium' | 'high'
  category?: 'form_submission' | 'approval_required' | 'status_change' | 'reminder' | 'system'
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
}

export interface NotificationPreferences {
  userId: string
  emailNotifications: {
    formSubmissions: boolean
    approvalRequests: boolean
    statusChanges: boolean
    reminders: boolean
    systemAlerts: boolean
  }
  inAppNotifications: {
    formSubmissions: boolean
    approvalRequests: boolean
    statusChanges: boolean
    reminders: boolean
    systemAlerts: boolean
  }
}

class NotificationService {
  // Send notification
  async sendNotification(request: NotificationRequest): Promise<{ success: boolean; messageId?: string }> {
    try {
      const response = await apiClient.post('/notifications/send', request)
      return response as { success: boolean; messageId?: string }
    } catch (error) {
      console.error('Failed to send notification:', error)
      throw error
    }
  }

  // Send form submission notification
  async notifyFormSubmission(formInstanceId: string, submittedBy: string, assignedTo?: string): Promise<void> {
    const notification: NotificationRequest = {
      type: 'both',
      recipients: assignedTo ? [assignedTo] : [], // Would get from assignment rules
      subject: 'New Form Submission Requires Review',
      message: `A new form has been submitted and requires your review.`,
      templateId: 'form_submission',
      templateData: {
        formInstanceId,
        submittedBy,
        reviewUrl: `${window.location.origin}/surveys/execute/${formInstanceId}?readonly=true`
      },
      priority: 'medium',
      category: 'form_submission'
    }

    await this.sendNotification(notification)
  }

  // Send approval notification
  async notifyApprovalRequired(formInstanceId: string, formName: string, approvers: string[]): Promise<void> {
    const notification: NotificationRequest = {
      type: 'both',
      recipients: approvers,
      subject: 'Form Approval Required',
      message: `The form "${formName}" requires your approval.`,
      templateId: 'approval_required',
      templateData: {
        formInstanceId,
        formName,
        approvalUrl: `${window.location.origin}/surveys/execute/${formInstanceId}?readonly=true`
      },
      priority: 'high',
      category: 'approval_required'
    }

    await this.sendNotification(notification)
  }

  // Send status change notification
  async notifyStatusChange(
    formInstanceId: string, 
    formName: string, 
    oldStatus: string, 
    newStatus: string, 
    recipients: string[],
    comment?: string
  ): Promise<void> {
    const notification: NotificationRequest = {
      type: 'both',
      recipients,
      subject: `Form Status Updated: ${formName}`,
      message: `The status of "${formName}" has been changed from ${oldStatus} to ${newStatus}.`,
      templateId: 'status_change',
      templateData: {
        formInstanceId,
        formName,
        oldStatus,
        newStatus,
        comment,
        viewUrl: `${window.location.origin}/surveys/execute/${formInstanceId}?readonly=true`
      },
      priority: 'medium',
      category: 'status_change'
    }

    await this.sendNotification(notification)
  }

  // Send reminder notification
  async notifyReminder(
    formInstanceId: string, 
    formName: string, 
    dueDate: Date, 
    assignedTo: string
  ): Promise<void> {
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    const notification: NotificationRequest = {
      type: 'both',
      recipients: [assignedTo],
      subject: `Reminder: Form Due ${daysUntilDue > 0 ? `in ${daysUntilDue} days` : 'today'}`,
      message: `The form "${formName}" is ${daysUntilDue > 0 ? `due in ${daysUntilDue} days` : 'due today'}.`,
      templateId: 'reminder',
      templateData: {
        formInstanceId,
        formName,
        dueDate: dueDate.toLocaleDateString(),
        daysUntilDue,
        completeUrl: `${window.location.origin}/surveys/execute/${formInstanceId}`
      },
      priority: daysUntilDue <= 1 ? 'high' : 'medium',
      category: 'reminder'
    }

    await this.sendNotification(notification)
  }

  // Send overdue notification
  async notifyOverdue(
    formInstanceId: string, 
    formName: string, 
    dueDate: Date, 
    assignedTo: string,
    escalationRecipients?: string[]
  ): Promise<void> {
    const daysOverdue = Math.ceil((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    
    const recipients = [assignedTo, ...(escalationRecipients || [])]
    
    const notification: NotificationRequest = {
      type: 'both',
      recipients,
      subject: `OVERDUE: Form ${daysOverdue} days past due`,
      message: `The form "${formName}" is ${daysOverdue} days overdue and requires immediate attention.`,
      templateId: 'overdue',
      templateData: {
        formInstanceId,
        formName,
        dueDate: dueDate.toLocaleDateString(),
        daysOverdue,
        completeUrl: `${window.location.origin}/surveys/execute/${formInstanceId}`
      },
      priority: 'high',
      category: 'reminder'
    }

    await this.sendNotification(notification)
  }

  // Get notification preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get(`/notifications/preferences/${userId}`)
      return (response as any).data
    } catch (error) {
      console.error('Failed to get notification preferences:', error)
      throw error
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.put(`/notifications/preferences/${userId}`, preferences)
      return (response as any).data
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
      throw error
    }
  }

  // Get email templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await apiClient.get('/notifications/templates')
      return (response as any).data
    } catch (error) {
      console.error('Failed to get email templates:', error)
      throw error
    }
  }

  // Get notification history
  async getNotificationHistory(
    userId: string, 
    filters?: {
      category?: string
      startDate?: Date
      endDate?: Date
      limit?: number
    }
  ): Promise<any[]> {
    try {
      const params: any = {}
      if (filters?.category) params.category = filters.category
      if (filters?.startDate) params.startDate = filters.startDate.toISOString()
      if (filters?.endDate) params.endDate = filters.endDate.toISOString()
      if (filters?.limit) params.limit = filters.limit

      const response = await apiClient.get(`/notifications/history/${userId}`, { params })
      return (response as any).data
    } catch (error) {
      console.error('Failed to get notification history:', error)
      throw error
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }

  // Bulk mark notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/users/${userId}/read-all`)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }
}

// Create and export the notification service instance
export const notificationService = new NotificationService()

// Workflow-specific notification helpers
export const workflowNotifications = {
  // Handle form submission workflow
  async handleFormSubmission(formInstanceId: string, submittedBy: string): Promise<void> {
    try {
      // Get assignment rules to determine who should be notified
      // This would typically come from the form template or assignment rules
      const assignedTo = 'manager-user-id' // Would be determined by assignment rules
      
      await notificationService.notifyFormSubmission(formInstanceId, submittedBy, assignedTo)
    } catch (error) {
      console.error('Failed to handle form submission notifications:', error)
    }
  },

  // Handle approval workflow
  async handleApprovalRequired(formInstanceId: string, formName: string): Promise<void> {
    try {
      // Get list of approvers based on form type and business rules
      const approvers = ['manager-1', 'qm-staff-1'] // Would be determined by workflow rules
      
      await notificationService.notifyApprovalRequired(formInstanceId, formName, approvers)
    } catch (error) {
      console.error('Failed to handle approval notifications:', error)
    }
  },

  // Handle status change workflow
  async handleStatusChange(
    formInstanceId: string,
    formName: string,
    oldStatus: string,
    newStatus: string,
    comment?: string
  ): Promise<void> {
    try {
      // Determine who should be notified based on status change
      const recipients: string[] = []
      
      // Always notify the original submitter
      recipients.push('submitter-user-id') // Would get from form instance
      
      // If approved, notify relevant stakeholders
      if (newStatus === 'approved') {
        recipients.push('coordinator-user-id')
      }
      
      // If rejected, notify submitter and their manager
      if (newStatus === 'rejected') {
        recipients.push('submitter-manager-id')
      }
      
      await notificationService.notifyStatusChange(
        formInstanceId,
        formName,
        oldStatus,
        newStatus,
        recipients,
        comment
      )
    } catch (error) {
      console.error('Failed to handle status change notifications:', error)
    }
  },

  // Handle reminder workflow
  async handleReminders(): Promise<void> {
    try {
      // This would typically be called by a scheduled job
      // Get all forms that are due soon or overdue
      const formsNeedingReminders: any[] = [] // Would query from database
      
      for (const form of formsNeedingReminders) {
        const dueDate = new Date(form.dueDate)
        const now = new Date()
        
        if (dueDate < now) {
          // Overdue
          await notificationService.notifyOverdue(
            form.id,
            form.name,
            dueDate,
            form.assignedTo,
            form.escalationRecipients
          )
        } else {
          // Due soon
          await notificationService.notifyReminder(
            form.id,
            form.name,
            dueDate,
            form.assignedTo
          )
        }
      }
    } catch (error) {
      console.error('Failed to handle reminder notifications:', error)
    }
  }
}

export default notificationService