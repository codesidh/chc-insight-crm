import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Knex } from 'knex';
import { UserContext } from '../types';
import { AuthService } from '../services/auth.service';
import config from '../config/environment';

// Extend Express Request interface to include user context
declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
      tenantId?: string;
    }
  }
}

export class AuthMiddleware {
  constructor(
    private db: Knex,
    private authService: AuthService
  ) {}

  /**
   * Middleware to authenticate JWT token
   */
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Access token required'
          }
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      const userContext = await this.authService.validateToken(token);
      
      if (!userContext) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token'
          }
        });
        return;
      }

      // Attach user context to request
      req.user = userContext;
      req.tenantId = userContext.tenantId;
      
      next();
    } catch (error) {
      console.error('Authentication middleware error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Authentication failed'
        }
      });
    }
  };

  /**
   * Middleware to check if user has required role
   */
  requireRole = (requiredRoles: string | string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      const userRoles = req.user.roles.map(role => role.name as string);
      
      const hasRequiredRole = roles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions'
          }
        });
        return;
      }

      next();
    };
  };

  /**
   * Middleware to check if user has required permission
   */
  requirePermission = (resource: string, action: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const hasPermission = req.user.permissions.some(permission => 
        permission.resource === resource && 
        permission.actions.includes(action)
      );

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Permission denied: ${action} on ${resource}`
          }
        });
        return;
      }

      next();
    };
  };

  /**
   * Middleware to enforce tenant isolation
   */
  enforceTenantIsolation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.tenantId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      // Set tenant context for database queries
      await this.db.raw('SET app.current_tenant = ?', [req.tenantId]);
      
      next();
    } catch (error) {
      console.error('Tenant isolation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TENANT_ERROR',
          message: 'Tenant isolation failed'
        }
      });
    }
  };

  /**
   * Optional authentication - doesn't fail if no token provided
   */
  optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const userContext = await this.authService.validateToken(token);
        
        if (userContext) {
          req.user = userContext;
          req.tenantId = userContext.tenantId;
        }
      }
      
      next();
    } catch (error) {
      // Log error but don't fail the request
      console.error('Optional auth error:', error);
      next();
    }
  };

  /**
   * Middleware to validate API key for external integrations
   */
  validateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        res.status(401).json({
          success: false,
          error: {
            code: 'API_KEY_REQUIRED',
            message: 'API key required'
          }
        });
        return;
      }

      // Validate API key against database
      const apiKeyRecord = await this.db('api_keys')
        .select('*')
        .where('key_hash', this.hashApiKey(apiKey))
        .where('is_active', true)
        .where('expires_at', '>', new Date())
        .first();

      if (!apiKeyRecord) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_API_KEY',
            message: 'Invalid or expired API key'
          }
        });
        return;
      }

      // Set tenant context from API key
      req.tenantId = apiKeyRecord.tenant_id;
      
      // Update last used timestamp
      await this.db('api_keys')
        .where('id', apiKeyRecord.id)
        .update({ last_used_at: new Date() });

      next();
    } catch (error) {
      console.error('API key validation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'API_KEY_ERROR',
          message: 'API key validation failed'
        }
      });
    }
  };

  /**
   * Hash API key for secure storage
   */
  private hashApiKey(apiKey: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }
}

/**
 * Factory function to create auth middleware with dependencies
 */
export const createAuthMiddleware = (db: Knex): AuthMiddleware => {
  const authService = new AuthService(db);
  return new AuthMiddleware(db, authService);
};

/**
 * Simple auth middleware function for routes
 * This creates a basic JWT authentication middleware
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token required'
        }
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    // Attach user context to request
    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      roles: decoded.roles || [],
      permissions: decoded.permissions || [],
      sessionId: decoded.sessionId
    };
    req.tenantId = decoded.tenantId;
    
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
};

export default AuthMiddleware;