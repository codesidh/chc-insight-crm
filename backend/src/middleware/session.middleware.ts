/**
 * Session Management Middleware
 * 
 * Implements session management and timeout enforcement
 * Requirements: 12.1, 12.4
 */

import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database.service';
import { audit } from './audit.middleware';

export interface SessionData {
  id: string;
  userId: string;
  tenantId: string;
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface SessionConfig {
  maxAge: number; // Session timeout in milliseconds
  renewalThreshold: number; // Renew session if accessed within this time before expiry
  maxConcurrentSessions: number; // Maximum concurrent sessions per user
  requireSecure: boolean; // Require HTTPS for session cookies
  sameSite: 'strict' | 'lax' | 'none'; // SameSite cookie attribute
}

class SessionManager {
  private db = DatabaseService.getInstance().getConnection();
  private config: SessionConfig;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = {
      maxAge: 8 * 60 * 60 * 1000, // 8 hours default
      renewalThreshold: 30 * 60 * 1000, // 30 minutes before expiry
      maxConcurrentSessions: 3,
      requireSecure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      ...config
    };
  }

  /**
   * Create a new session
   */
  async createSession(
    userId: string,
    tenantId: string,
    req: Request
  ): Promise<SessionData> {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.maxAge);

    // Clean up old sessions for this user
    await this.cleanupUserSessions(userId);

    const sessionData: SessionData = {
      id: sessionId,
      userId,
      tenantId,
      createdAt: now,
      lastAccessedAt: now,
      expiresAt,
      ipAddress: this.getClientIp(req),
      userAgent: req.get('User-Agent') || 'Unknown',
      isActive: true
    };

    // Store session in database
    await this.db('user_sessions').insert({
      id: sessionId,
      user_id: userId,
      tenant_id: tenantId,
      created_at: now,
      last_accessed_at: now,
      expires_at: expiresAt,
      ip_address: sessionData.ipAddress,
      user_agent: sessionData.userAgent,
      is_active: true,
      metadata: null
    });

    // Log session creation
    await audit.logAuthEvent(userId, tenantId, 'login', req, {
      sessionId,
      expiresAt: expiresAt.toISOString()
    });

    return sessionData;
  }

  /**
   * Validate and refresh session
   */
  async validateSession(sessionId: string, req: Request): Promise<SessionData | null> {
    try {
      const session = await this.db('user_sessions')
        .where('id', sessionId)
        .where('is_active', true)
        .first();

      if (!session) {
        return null;
      }

      const now = new Date();
      const expiresAt = new Date(session.expires_at);

      // Check if session has expired
      if (now > expiresAt) {
        await this.invalidateSession(sessionId);
        return null;
      }

      // Check if IP address matches (optional security check)
      const currentIp = this.getClientIp(req);
      if (session.ip_address !== currentIp) {
        console.warn(`Session IP mismatch: ${session.ip_address} vs ${currentIp}`);
        // Could invalidate session here for strict security
      }

      // Update last accessed time
      await this.db('user_sessions')
        .where('id', sessionId)
        .update({
          last_accessed_at: now
        });

      // Check if session needs renewal
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      if (timeUntilExpiry < this.config.renewalThreshold) {
        const newExpiresAt = new Date(now.getTime() + this.config.maxAge);
        await this.db('user_sessions')
          .where('id', sessionId)
          .update({
            expires_at: newExpiresAt
          });
      }

      return {
        id: session.id,
        userId: session.user_id,
        tenantId: session.tenant_id,
        createdAt: new Date(session.created_at),
        lastAccessedAt: now,
        expiresAt: new Date(session.expires_at),
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        isActive: session.is_active,
        metadata: session.metadata ? JSON.parse(session.metadata) : undefined
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  /**
   * Invalidate a session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    try {
      const session = await this.db('user_sessions')
        .where('id', sessionId)
        .first();

      if (session) {
        await this.db('user_sessions')
          .where('id', sessionId)
          .update({
            is_active: false,
            invalidated_at: new Date()
          });

        // Log session invalidation
        await audit.logAuthEvent(
          session.user_id,
          session.tenant_id,
          'logout',
          {} as Request, // Mock request for audit
          { sessionId, reason: 'manual_logout' }
        );
      }
    } catch (error) {
      console.error('Session invalidation error:', error);
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.db('user_sessions')
        .where('expires_at', '<', new Date())
        .orWhere('is_active', false)
        .del();

      return result;
    } catch (error) {
      console.error('Session cleanup error:', error);
      return 0;
    }
  }

  /**
   * Clean up old sessions for a user (keep only the most recent ones)
   */
  private async cleanupUserSessions(userId: string): Promise<void> {
    try {
      // Get all active sessions for user, ordered by creation date
      const sessions = await this.db('user_sessions')
        .where('user_id', userId)
        .where('is_active', true)
        .orderBy('created_at', 'desc');

      // If user has too many sessions, deactivate the oldest ones
      if (sessions.length >= this.config.maxConcurrentSessions) {
        const sessionsToDeactivate = sessions.slice(this.config.maxConcurrentSessions - 1);
        const sessionIds = sessionsToDeactivate.map(s => s.id);

        if (sessionIds.length > 0) {
          await this.db('user_sessions')
            .whereIn('id', sessionIds)
            .update({
              is_active: false,
              invalidated_at: new Date()
            });
        }
      }
    } catch (error) {
      console.error('User session cleanup error:', error);
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      const sessions = await this.db('user_sessions')
        .where('user_id', userId)
        .where('is_active', true)
        .where('expires_at', '>', new Date())
        .orderBy('last_accessed_at', 'desc');

      return sessions.map(session => ({
        id: session.id,
        userId: session.user_id,
        tenantId: session.tenant_id,
        createdAt: new Date(session.created_at),
        lastAccessedAt: new Date(session.last_accessed_at),
        expiresAt: new Date(session.expires_at),
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        isActive: session.is_active,
        metadata: session.metadata ? JSON.parse(session.metadata) : undefined
      }));
    } catch (error) {
      console.error('Get user sessions error:', error);
      return [];
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  private getClientIp(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'Unknown'
    );
  }
}

const sessionManager = new SessionManager();

/**
 * Middleware to enforce session timeout and management
 */
export const sessionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip session check for public endpoints
  const publicPaths = ['/health', '/api/auth/login', '/api/auth/register'];
  if (publicPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Get session ID from Authorization header or cookie
  const authHeader = req.headers.authorization;
  const sessionId = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : req.cookies?.sessionId;

  if (!sessionId) {
    res.status(401).json({
      success: false,
      error: {
        code: 'NO_SESSION',
        message: 'No session provided'
      }
    });
    return;
  }

  // Validate session
  sessionManager.validateSession(sessionId, req)
    .then(session => {
      if (!session) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_SESSION',
            message: 'Session expired or invalid'
          }
        });
        return;
      }

      // Attach session and user info to request
      (req as any).session = session;
      (req as any).user = {
        userId: session.userId,
        tenantId: session.tenantId,
        roles: [],
        permissions: [],
        sessionId: session.id
      };

      next();
    })
    .catch(error => {
      console.error('Session middleware error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SESSION_ERROR',
          message: 'Session validation failed'
        }
      });
    });
};

/**
 * Session management utilities
 */
export const session = {
  create: sessionManager.createSession.bind(sessionManager),
  validate: sessionManager.validateSession.bind(sessionManager),
  invalidate: sessionManager.invalidateSession.bind(sessionManager),
  cleanup: sessionManager.cleanupExpiredSessions.bind(sessionManager),
  getUserSessions: sessionManager.getUserSessions.bind(sessionManager)
};

// Schedule periodic cleanup of expired sessions
setInterval(() => {
  sessionManager.cleanupExpiredSessions()
    .then(count => {
      if (count > 0) {
        console.log(`Cleaned up ${count} expired sessions`);
      }
    })
    .catch(error => {
      console.error('Scheduled session cleanup failed:', error);
    });
}, 60 * 60 * 1000); // Run every hour

export default sessionMiddleware;