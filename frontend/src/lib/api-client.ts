// API Response types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  status: number
  code?: string
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API Client configuration
interface ApiClientConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
}

class ApiClient {
  private config: ApiClientConfig
  private authToken: string | null = null

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api',
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    }
  }

  // Set authentication token
  setAuthToken(token: string | null) {
    this.authToken = token
  }

  // Get authentication headers
  private getAuthHeaders(): Record<string, string> {
    const headers = { ...this.config.headers }
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }
    
    return headers
  }

  // Handle API errors
  private handleError(error: any): never {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }

    // Network error
    if (!error.response) {
      throw {
        message: 'Network error - please check your connection',
        status: 0,
        code: 'NETWORK_ERROR',
      } as ApiError
    }

    // HTTP error response
    const status = error.response?.status || 500
    const data = error.response?.data || {}
    
    throw {
      message: data.message || data.error || 'An unexpected error occurred',
      status,
      code: data.code || 'API_ERROR',
      details: data.details,
    } as ApiError
  }

  // Generic request method
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    options: {
      data?: any
      params?: Record<string, any>
      headers?: Record<string, string>
      timeout?: number
    } = {}
  ): Promise<T> {
    const { data, params, headers = {}, timeout = this.config.timeout } = options
    
    // Build URL with query parameters
    const url = new URL(endpoint, this.config.baseURL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    // Setup request headers
    const requestHeaders = {
      ...this.getAuthHeaders(),
      ...headers,
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        ...(data ? { body: JSON.stringify(data) } : {}),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      let responseData: any

      if (contentType?.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      // Handle HTTP errors
      if (!response.ok) {
        throw {
          response: {
            status: response.status,
            data: responseData,
          },
        }
      }

      return responseData
    } catch (error) {
      clearTimeout(timeoutId)
      this.handleError(error)
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, options?: { params?: Record<string, any>; headers?: Record<string, string> }): Promise<T> {
    return this.request<T>('GET', endpoint, options)
  }

  async post<T>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }): Promise<T> {
    return this.request<T>('POST', endpoint, { data, ...options })
  }

  async put<T>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }): Promise<T> {
    return this.request<T>('PUT', endpoint, { data, ...options })
  }

  async patch<T>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }): Promise<T> {
    return this.request<T>('PATCH', endpoint, { data, ...options })
  }

  async delete<T>(endpoint: string, options?: { headers?: Record<string, string> }): Promise<T> {
    return this.request<T>('DELETE', endpoint, options)
  }

  // File upload method
  async uploadFile<T>(endpoint: string, file: File, options?: { 
    onProgress?: (progress: number) => void
    additionalData?: Record<string, any>
  }): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options?.additionalData) {
      Object.entries(options.additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const headers = this.getAuthHeaders()
    delete headers['Content-Type'] // Let browser set content-type for FormData

    return this.request<T>('POST', endpoint, {
      data: formData,
      headers,
    })
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient()

// API service functions organized by domain
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<ApiResponse<{ user: any; token: string; refreshToken: string }>>('/auth/login', credentials),
  
  logout: () =>
    apiClient.post<ApiResponse>('/auth/logout'),
  
  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh', { refreshToken }),
  
  getCurrentUser: () =>
    apiClient.get<ApiResponse<any>>('/auth/me'),
  
  resetPassword: (email: string) =>
    apiClient.post<ApiResponse>('/auth/reset-password', { email }),
}

export const surveyApi = {
  // Survey templates
  getTemplates: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<any>>>('/surveys/templates', params ? { params } : undefined),
  
  getTemplate: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/surveys/templates/${id}`),
  
  createTemplate: (template: any) =>
    apiClient.post<ApiResponse<any>>('/surveys/templates', template),
  
  updateTemplate: (id: string, template: any) =>
    apiClient.put<ApiResponse<any>>(`/surveys/templates/${id}`, template),
  
  deleteTemplate: (id: string) =>
    apiClient.delete<ApiResponse>(`/surveys/templates/${id}`),
  
  copyTemplate: (id: string, name: string) =>
    apiClient.post<ApiResponse<any>>(`/surveys/templates/${id}/copy`, { name }),
  
  // Survey instances
  getInstances: (params?: { page?: number; limit?: number; status?: string; assignedTo?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<any>>>('/surveys/instances', params ? { params } : undefined),
  
  getInstance: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/surveys/instances/${id}`),
  
  createInstance: (templateId: string, context: any) =>
    apiClient.post<ApiResponse<any>>('/surveys/instances', { templateId, context }),
  
  saveResponse: (instanceId: string, responses: any[], isDraft = true) =>
    apiClient.patch<ApiResponse<any>>(`/surveys/instances/${instanceId}/responses`, { responses, isDraft }),
  
  submitSurvey: (instanceId: string) =>
    apiClient.post<ApiResponse<any>>(`/surveys/instances/${instanceId}/submit`),
  
  // File uploads
  uploadAttachment: (instanceId: string, file: File) =>
    apiClient.uploadFile<ApiResponse<any>>(`/surveys/instances/${instanceId}/attachments`, file),
}

export const memberApi = {
  search: (query: string, params?: { limit?: number }) =>
    apiClient.get<ApiResponse<any[]>>('/members/search', { params: { q: query, ...params } }),
  
  getMember: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/members/${id}`),
  
  getPrePopulationData: (memberId: string, providerId?: string) =>
    apiClient.get<ApiResponse<any>>('/members/pre-populate', { params: { memberId, providerId } }),
}

export const providerApi = {
  search: (query: string, params?: { limit?: number }) =>
    apiClient.get<ApiResponse<any[]>>('/providers/search', { params: { q: query, ...params } }),
  
  getProvider: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/providers/${id}`),
}

export const dashboardApi = {
  getMetrics: (filters?: Record<string, any>) =>
    apiClient.get<ApiResponse<any>>('/dashboard/metrics', filters ? { params: filters } : undefined),
  
  getComplianceData: (dateRange?: { start: string; end: string }) =>
    apiClient.get<ApiResponse<any>>('/dashboard/compliance', dateRange ? { params: dateRange } : undefined),
  
  getProductivityData: (userId?: string) =>
    apiClient.get<ApiResponse<any>>('/dashboard/productivity', { params: { userId } }),
}

export const workQueueApi = {
  getTasks: (userId: string, filters?: Record<string, any>) =>
    apiClient.get<ApiResponse<PaginatedResponse<any>>>('/work-queue/tasks', { params: { userId, ...filters } }),
  
  assignTask: (taskId: string, assigneeId: string) =>
    apiClient.patch<ApiResponse<any>>(`/work-queue/tasks/${taskId}/assign`, { assigneeId }),
  
  updateTaskStatus: (taskId: string, status: string, comment?: string) =>
    apiClient.patch<ApiResponse<any>>(`/work-queue/tasks/${taskId}/status`, { status, comment }),
}

export const reportApi = {
  getTemplates: () =>
    apiClient.get<ApiResponse<any[]>>('/reports/templates'),
  
  generateReport: (config: any) =>
    apiClient.post<ApiResponse<any>>('/reports/generate', config),
  
  scheduleReport: (schedule: any) =>
    apiClient.post<ApiResponse<any>>('/reports/schedule', schedule),
  
  getReportHistory: (userId?: string) =>
    apiClient.get<ApiResponse<PaginatedResponse<any>>>('/reports/history', { params: { userId } }),
  
  downloadReport: (reportId: string) =>
    apiClient.get<Blob>(`/reports/${reportId}/download`),
}

// Export the API client for direct use if needed
export default apiClient