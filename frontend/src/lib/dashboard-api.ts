/**
 * Dashboard API Client
 * 
 * Handles API calls for dashboard data from the CHC Insight CRM backend
 */

import { ApiResponse } from '@/types';

// Mock authentication token for development
const AUTH_TOKEN = 'dev-token-123';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface DashboardMetrics {
  totalCategories: number;
  totalTypes: number;
  totalTemplates: number;
  totalInstances: number;
  draftInstances: number;
  pendingInstances: number;
  approvedInstances: number;
  completedInstances: number;
}

interface FormHierarchySummary {
  category_id: string;
  category_name: string;
  type_count: string;
  template_count: string;
  instance_count: string;
  draft_count: string;
  pending_count: string;
  approved_count: string;
  completed_count: string;
}

interface RecentActivity {
  id: string;
  type: 'form_created' | 'instance_completed' | 'template_updated' | 'workflow_approved';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'warning';
}

class DashboardAPI {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get form hierarchy summary for dashboard metrics
   */
  async getFormHierarchySummary(): Promise<ApiResponse<FormHierarchySummary[]>> {
    try {
      return await this.fetchWithAuth('/form-hierarchy/summary');
    } catch (error) {
      console.error('Failed to fetch form hierarchy summary:', error);
      // Return mock data for development
      return {
        success: true,
        data: [
          {
            category_id: '1',
            category_name: 'Member Assessments',
            type_count: '3',
            template_count: '8',
            instance_count: '45',
            draft_count: '12',
            pending_count: '18',
            approved_count: '10',
            completed_count: '5'
          },
          {
            category_id: '2',
            category_name: 'Provider Evaluations',
            type_count: '2',
            template_count: '5',
            instance_count: '28',
            draft_count: '8',
            pending_count: '12',
            approved_count: '6',
            completed_count: '2'
          },
          {
            category_id: '3',
            category_name: 'Quality Surveys',
            type_count: '4',
            template_count: '12',
            instance_count: '67',
            draft_count: '15',
            pending_count: '25',
            approved_count: '20',
            completed_count: '7'
          }
        ],
        metadata: { timestamp: new Date() }
      };
    }
  }

  /**
   * Get dashboard metrics aggregated from form hierarchy
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const summaryResponse = await this.getFormHierarchySummary();
    
    if (!summaryResponse.success || !summaryResponse.data) {
      throw new Error('Failed to fetch dashboard metrics');
    }

    const summary = summaryResponse.data;
    
    return {
      totalCategories: summary.length,
      totalTypes: summary.reduce((sum, item) => sum + parseInt(item.type_count), 0),
      totalTemplates: summary.reduce((sum, item) => sum + parseInt(item.template_count), 0),
      totalInstances: summary.reduce((sum, item) => sum + parseInt(item.instance_count), 0),
      draftInstances: summary.reduce((sum, item) => sum + parseInt(item.draft_count), 0),
      pendingInstances: summary.reduce((sum, item) => sum + parseInt(item.pending_count), 0),
      approvedInstances: summary.reduce((sum, item) => sum + parseInt(item.approved_count), 0),
      completedInstances: summary.reduce((sum, item) => sum + parseInt(item.completed_count), 0),
    };
  }

  /**
   * Get recent activity (mock data for now)
   */
  async getRecentActivity(): Promise<RecentActivity[]> {
    // Mock recent activity data
    return [
      {
        id: '1',
        type: 'instance_completed',
        title: 'Member Assessment Completed',
        description: 'John Doe - Care Plan Review',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        status: 'success'
      },
      {
        id: '2',
        type: 'template_updated',
        title: 'Template Updated',
        description: 'Provider Quality Survey v2.1',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        status: 'success'
      },
      {
        id: '3',
        type: 'workflow_approved',
        title: 'Workflow Approved',
        description: 'Survey deployment pending',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        status: 'pending'
      },
      {
        id: '4',
        type: 'form_created',
        title: 'New Form Template',
        description: 'Member Satisfaction Survey',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'success'
      }
    ];
  }

  /**
   * Get form instance status distribution for charts
   */
  async getInstanceStatusDistribution(): Promise<Array<{ status: string; count: number; percentage: number }>> {
    const metrics = await this.getDashboardMetrics();
    const total = metrics.totalInstances;
    
    return [
      {
        status: 'Draft',
        count: metrics.draftInstances,
        percentage: Math.round((metrics.draftInstances / total) * 100)
      },
      {
        status: 'Pending',
        count: metrics.pendingInstances,
        percentage: Math.round((metrics.pendingInstances / total) * 100)
      },
      {
        status: 'Approved',
        count: metrics.approvedInstances,
        percentage: Math.round((metrics.approvedInstances / total) * 100)
      },
      {
        status: 'Completed',
        count: metrics.completedInstances,
        percentage: Math.round((metrics.completedInstances / total) * 100)
      }
    ];
  }

  /**
   * Get form activity over time (mock data for charts)
   */
  async getFormActivityOverTime(): Promise<Array<{ date: string; created: number; completed: number }>> {
    // Mock time series data for the last 30 days
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        created: Math.floor(Math.random() * 10) + 1,
        completed: Math.floor(Math.random() * 8) + 1
      });
    }
    
    return data;
  }
}

export const dashboardAPI = new DashboardAPI();
export type { DashboardMetrics, FormHierarchySummary, RecentActivity };