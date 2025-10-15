// User Management types
export interface UserManagementUser {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  tenantId: string
  isActive: boolean
  lastLogin: string
  createdAt: string
  region: string
  memberPanel: string[]
  providerNetwork: string[]
}

export interface UserRole {
  id: string
  name: string
  description: string
  permissions: string[]
  color: string
}

export interface Region {
  value: string
  label: string
}

export interface MemberPanel {
  id: string
  name: string
  memberCount: number
}

export interface ProviderNetwork {
  id: string
  name: string
  providerCount: number
}

export interface TenantConfiguration {
  id: string
  name: string
  subdomain: string
  configuration: {
    branding: {
      primaryColor: string
      logo: string
      favicon: string
    }
    features: {
      multiTenant: boolean
      advancedReporting: boolean
      apiAccess: boolean
      customWorkflows: boolean
    }
    security: {
      passwordPolicy: {
        minLength: number
        requireUppercase: boolean
        requireLowercase: boolean
        requireNumbers: boolean
        requireSpecialChars: boolean
      }
      sessionTimeout: number
      maxLoginAttempts: number
    }
    notifications: {
      emailEnabled: boolean
      smsEnabled: boolean
      webhookEnabled: boolean
    }
  }
  isActive: boolean
  createdAt: string
}

export interface UserActivity {
  userId: string
  action: string
  resource: string
  timestamp: string
  details: string
}

export interface UserManagementData {
  users: UserManagementUser[]
  roles: UserRole[]
  regions: Region[]
  memberPanels: MemberPanel[]
  providerNetworks: ProviderNetwork[]
  tenantConfiguration: TenantConfiguration
  userActivity: UserActivity[]
}

export interface CreateUserRequest {
  email: string
  firstName: string
  lastName: string
  roles: string[]
  region: string
  memberPanel: string[]
  providerNetwork: string[]
  sendWelcomeEmail: boolean
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  roles?: string[]
  region?: string
  memberPanel?: string[]
  providerNetwork?: string[]
  isActive?: boolean
}