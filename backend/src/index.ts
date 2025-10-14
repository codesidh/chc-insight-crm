import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import config from '@/config/environment';
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { DatabaseService } from '@/services/database.service';
import { createAuthRoutes } from '@/routes/auth.routes';
import { createAuthMiddleware } from '@/middleware/auth.middleware';
import formHierarchyRoutes from '@/routes/form-hierarchy.routes';
import formBuilderRoutes from '@/routes/form-builder.routes';
import memberProviderRoutes from '@/routes/member-provider-lookup.routes';

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

// Request logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    const dbHealth = await DatabaseService.healthCheck();
    const isHealthy = dbHealth.overall;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] || '1.0.0',
      environment: config.nodeEnv,
      database: dbHealth,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] || '1.0.0',
      environment: config.nodeEnv,
      error: 'Database health check failed',
    });
  }
});

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

// Authentication routes (will be initialized after database connection)
app.use('/api/auth', (req, res, next) => {
  if (!authRoutes) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Authentication service is initializing'
    });
  }
  authRoutes(req, res, next);
});

// Form hierarchy routes
app.use('/api', formHierarchyRoutes);

// Form builder routes
app.use('/api', formBuilderRoutes);

// Member and provider lookup routes
app.use('/api', memberProviderRoutes);

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
