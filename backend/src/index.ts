import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import config from '@/config/environment';
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { auditMiddleware } from '@/middleware/audit.middleware';
import { securityHeadersMiddleware, rateLimitMiddleware } from '@/middleware/security-headers.middleware';
// Validation middleware available for use
import { DatabaseService } from '@/services/database.service';
import { createAuthRoutes } from '@/routes/auth.routes';

import formHierarchyRoutes from '@/routes/form-hierarchy.routes';
import formBuilderRoutes from '@/routes/form-builder.routes';
import memberProviderRoutes from '@/routes/member-provider-lookup.routes';
import integrationRoutes from '@/routes/integration.routes';

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Compression middleware
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers middleware
app.use(securityHeadersMiddleware);

// Health check endpoint (before middleware to avoid conflicts)
app.get('/health', async (_req, res) => {
  try {
    const dbHealth = await DatabaseService.healthCheck();
    const isHealthy = dbHealth.overall;

    // Ensure we only send one response
    if (!res.headersSent) {
      res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] || '1.0.0',
        environment: config.nodeEnv,
        database: dbHealth,
      });
    }
  } catch (error) {
    // Ensure we only send one response
    if (!res.headersSent) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] || '1.0.0',
        environment: config.nodeEnv,
        error: 'Database health check failed',
      });
    }
  }
});

// Rate limiting middleware
app.use('/api/', rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100 // requests per window
}));

// Request logging middleware
app.use(requestLogger);

// Audit logging middleware
app.use('/api/', auditMiddleware({
  logFormAccess: true,
  logDataAccess: true,
  logAllRequests: false // Set to true for comprehensive logging
}));

// Initialize routes after database is available
let authRoutes: express.Router;

// API routes
app.get('/api', (_req, res) => {
  res.json({
    message: 'CHC Insight CRM API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// API Documentation (public access)
app.get('/api/docs', (_req, res) => {
  res.json({
    title: 'CHC Insight CRM API Documentation',
    version: '1.0.0',
    description: 'Long-Term Services and Supports (LTSS) Case and Assessment Management API',
    baseUrl: '/api',
    endpoints: {
      authentication: {
        'POST /api/auth/login': 'User login',
        'POST /api/auth/logout': 'User logout',
        'POST /api/auth/refresh': 'Refresh access token',
        'GET /api/auth/me': 'Get current user profile'
      },
      formHierarchy: {
        'GET /api/form-categories': 'List form categories',
        'POST /api/form-categories': 'Create form category',
        'GET /api/form-categories/:id': 'Get form category',
        'PUT /api/form-categories/:id': 'Update form category',
        'DELETE /api/form-categories/:id': 'Delete form category',
        'GET /api/form-types': 'List form types',
        'POST /api/form-types': 'Create form type',
        'GET /api/form-types/:id': 'Get form type',
        'PUT /api/form-types/:id': 'Update form type',
        'DELETE /api/form-types/:id': 'Delete form type'
      },
      formBuilder: {
        'GET /api/form-templates': 'List form templates',
        'POST /api/form-templates': 'Create form template',
        'GET /api/form-templates/:id': 'Get form template',
        'PUT /api/form-templates/:id': 'Update form template',
        'DELETE /api/form-templates/:id': 'Delete form template',
        'POST /api/form-templates/:id/copy': 'Copy form template',
        'GET /api/form-instances': 'List form instances',
        'POST /api/form-instances': 'Create form instance',
        'GET /api/form-instances/:id': 'Get form instance',
        'PUT /api/form-instances/:id': 'Update form instance',
        'POST /api/form-instances/:id/submit': 'Submit form instance'
      },
      memberProvider: {
        'GET /api/members/search': 'Search members',
        'GET /api/members/:id': 'Get member details',
        'GET /api/providers/search': 'Search providers',
        'GET /api/providers/:id': 'Get provider details'
      },
      integration: {
        'GET /api/integration/status': 'Get integration status',
        'POST /api/integration/sync': 'Trigger data sync'
      },
      system: {
        'GET /health': 'System health check',
        'GET /api': 'API information',
        'GET /api/docs': 'This documentation'
      }
    },
    authentication: {
      type: 'Bearer Token (JWT)',
      header: 'Authorization: Bearer <token>',
      loginEndpoint: '/api/auth/login',
      note: 'Most endpoints require authentication except /health, /api, and /api/docs'
    },
    defaultCredentials: {
      email: 'admin@chc-insight.com',
      password: 'admin123',
      note: 'Default admin credentials for initial setup'
    },
    responseFormat: {
      success: {
        success: true,
        data: '...',
        metadata: {
          timestamp: '2025-01-01T00:00:00.000Z'
        }
      },
      error: {
        success: false,
        error: {
          code: 'ERROR_CODE',
          message: 'Error description'
        }
      }
    }
  });
});

// Authentication routes (will be initialized after database connection)
app.use('/api/auth', (req, res, next) => {
  if (!authRoutes) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Authentication service is initializing'
    });
  }
  return authRoutes(req, res, next);
});

// Form hierarchy routes
app.use('/api', formHierarchyRoutes);

// Form builder routes
app.use('/api', formBuilderRoutes);

// Member and provider lookup routes
app.use('/api', memberProviderRoutes);

// Integration and health check routes
app.use('/api', integrationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorHandler);

const port = config.port;

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connections
    await DatabaseService.initialize();

    // Initialize routes with database connection
    const db = DatabaseService.getKnexInstance();
    authRoutes = createAuthRoutes(db);

    // Start the server
    const server = app.listen(port, () => {
      console.log(`🚀 CHC Insight CRM Backend running on port ${port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${port}/health`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('🔒 HTTP server closed');

        try {
          await DatabaseService.shutdown();
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer();

export default app;
