/**
 * Audit Logging Middleware
 * 
 * Implements basic audit logging for form access and user actions
 * Requirements: 12.1, 12.4
 */

import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database.service';

export interface AuditLogEntry {
  id: string;
  userId: string;
  tenantId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  requestMethod: string;
  requestPath: string;
  requestBody?: any;
  responseStatus?: number;
  timestamp: Date;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface AuditableAction {
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

class AuditLogger {
  private db = DatabaseService.getInstance().getConnection();

  /**
   * Log an audit entry
   */
  async logEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      await this.db('audit_logs').insert({
        id: this.generateId(),
        user_id: entry.userId,
        tenant_id: entry.tenantId,
        action: entry.action,
        resource: entry.resource,
        resource_id: entry.resourceId,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        request_method: entry.requestMethod,
        request_path: entry.requestPath,
        request_body: entry.requestBody ? JSON.stringify(entry.requestBody) : null,
        response_status: entry.responseStatus,
        session_id: entry.sessionId,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        created_at: new Date()
      });
    } catch (error) {
      // Log audit failures to console but don't fail the request
      console.error('Audit logging failed:', error);
    }
  }

  /**
   * Log form access
   */
  async logFormAccess(
    userId: string,
    tenantId: string,
    action: 'view' | 'create' | 'update' | 'delete' | 'submit',
    formType: 'category' | 'type' | 'template' | 'instance',
    formId: string,
    req: Request,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEntry({
      userId,
      tenantId,
      action: `form_${action}`,
      resource: `form_${formType}`,
      resourceId: formId,
      ipAddress: this.getClientIp(req),
      userAgent: req.get('User-Agent') || 'Unknown',
      requestMethod: req.method,
      requestPath: req.path,
      requestBody: this.sanitizeRequestBody(req.body),
      sessionId: (req as any).session?.id,
      metadata
    });
  }

  /**
   * Log user authentication events
   */
  async logAuthEvent(
    userId: string,
    tenantId: string,
    action: 'login' | 'logout' | 'login_failed' | 'password_reset',
    req: Request,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEntry({
      userId,
      tenantId,
      action: `auth_${action}`,
      resource: 'authentication',
      ipAddress: this.getClientIp(req),
      userAgent: req.get('User-Agent') || 'Unknown',
      requestMethod: req.method,
      requestPath: req.path,
      sessionId: (req as any).session?.id,
      metadata
    });
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    userId: string,
    tenantId: string,
    action: 'read' | 'search' | 'export',
    dataType: 'member' | 'provider' | 'report',
    req: Request,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEntry({
      userId,
      tenantId,
      action: `data_${action}`,
      resource: dataType,
      ipAddress: this.getClientIp(req),
      userAgent: req.get('User-Agent') || 'Unknown',
      requestMethod: req.method,
      requestPath: req.path,
      requestBody: this.sanitizeRequestBody(req.body),
      sessionId: (req as any).session?.id,
      metadata
    });
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIp(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'Unknown'
    );
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return null;

    // Remove sensitive fields
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'dob'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

const auditLogger = new AuditLogger();

/**
 * Middleware to automatically log API requests
 */
export const auditMiddleware = (options: {
  logAllRequests?: boolean;
  logFormAccess?: boolean;
  logDataAccess?: boolean;
} = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    // Continue with request first
    next();

    // Log after response is sent (non-blocking)
    res.on('finish', () => {
      // Use setImmediate to avoid blocking the response
      setImmediate(async () => {
        try {
          const user = req.user;
          if (!user) return; // Skip if no authenticated user

          const duration = Date.now() - startTime;
          const metadata = {
            duration,
            responseSize: res.get('Content-Length'),
            success: res.statusCode < 400
          };

          // Log based on request path and options
          if (options.logFormAccess && req.path.includes('/form')) {
            await auditLogger.logFormAccess(
              user.userId,
              user.tenantId,
              req.method === 'GET' ? 'view' : 
              req.method === 'POST' ? 'create' :
              req.method === 'PUT' || req.method === 'PATCH' ? 'update' : 'delete',
              req.path.includes('/categories') ? 'category' :
              req.path.includes('/types') ? 'type' :
              req.path.includes('/templates') ? 'template' : 'instance',
              req.params['id'] || 'unknown',
              req,
              metadata
            );
          } else if (options.logDataAccess && (req.path.includes('/members') || req.path.includes('/providers'))) {
            await auditLogger.logDataAccess(
              user.userId,
              user.tenantId,
              req.method === 'GET' ? 'read' : 'search',
              req.path.includes('/members') ? 'member' : 'provider',
              req,
              metadata
            );
          } else if (options.logAllRequests) {
            await auditLogger.logEntry({
              userId: user.userId,
              tenantId: user.tenantId,
              action: `api_${req.method.toLowerCase()}`,
              resource: 'api_endpoint',
              resourceId: req.path,
              ipAddress: auditLogger['getClientIp'](req),
              userAgent: req.get('User-Agent') || 'Unknown',
              requestMethod: req.method,
              requestPath: req.path,
              requestBody: auditLogger['sanitizeRequestBody'](req.body),
              responseStatus: res.statusCode,
              sessionId: (req as any).session?.id,
              metadata
            });
          }
        } catch (error) {
          console.error('Audit middleware error:', error);
        }
      });
    });
  };
};

/**
 * Manual audit logging functions for specific events
 */
export const audit = {
  logFormAccess: auditLogger.logFormAccess.bind(auditLogger),
  logAuthEvent: auditLogger.logAuthEvent.bind(auditLogger),
  logDataAccess: auditLogger.logDataAccess.bind(auditLogger),
  logEntry: auditLogger.logEntry.bind(auditLogger)
};

export default auditMiddleware;