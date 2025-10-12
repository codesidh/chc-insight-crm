/**
 * Application configuration
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api',
    timeout: 30000, // 30 seconds
  },

  // Application Settings
  app: {
    name: 'CHC Insight CRM',
    version: process.env['NEXT_PUBLIC_APP_VERSION'] || '1.0.0',
    environment: process.env['NODE_ENV'] || 'development',
  },

  // Authentication
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    sessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
  },

  // UI Configuration
  ui: {
    defaultPageSize: 25,
    maxPageSize: 100,
    debounceDelay: 300, // milliseconds
    autoSaveDelay: 2000, // milliseconds
  },

  // File Upload
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },

  // Feature Flags
  features: {
    enableAnalytics: process.env['NEXT_PUBLIC_ENABLE_ANALYTICS'] === 'true',
    enableNotifications: process.env['NEXT_PUBLIC_ENABLE_NOTIFICATIONS'] !== 'false',
    enableDarkMode: process.env['NEXT_PUBLIC_ENABLE_DARK_MODE'] !== 'false',
    enableBetaFeatures: process.env['NEXT_PUBLIC_ENABLE_BETA_FEATURES'] === 'true',
  },

  // External Services
  services: {
    analytics: {
      googleAnalyticsId: process.env['NEXT_PUBLIC_GA_ID'],
    },
    monitoring: {
      sentryDsn: process.env['NEXT_PUBLIC_SENTRY_DSN'],
    },
  },
} as const;

// Type-safe environment variables
export const env = {
  NODE_ENV: process.env['NODE_ENV'] as 'development' | 'production' | 'test',
  NEXT_PUBLIC_API_URL: process.env['NEXT_PUBLIC_API_URL'],
  NEXT_PUBLIC_APP_VERSION: process.env['NEXT_PUBLIC_APP_VERSION'],
  NEXT_PUBLIC_ENABLE_ANALYTICS: process.env['NEXT_PUBLIC_ENABLE_ANALYTICS'],
  NEXT_PUBLIC_ENABLE_NOTIFICATIONS: process.env['NEXT_PUBLIC_ENABLE_NOTIFICATIONS'],
  NEXT_PUBLIC_ENABLE_DARK_MODE: process.env['NEXT_PUBLIC_ENABLE_DARK_MODE'],
  NEXT_PUBLIC_ENABLE_BETA_FEATURES: process.env['NEXT_PUBLIC_ENABLE_BETA_FEATURES'],
  NEXT_PUBLIC_GA_ID: process.env['NEXT_PUBLIC_GA_ID'],
  NEXT_PUBLIC_SENTRY_DSN: process.env['NEXT_PUBLIC_SENTRY_DSN'],
} as const;
