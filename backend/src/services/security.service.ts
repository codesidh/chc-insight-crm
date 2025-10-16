/**
 * Security Service
 * 
 * Manages security policies, compliance checks, and security monitoring
 * Requirements: 12.1, 12.4
 */

import { Knex } from 'knex';
import bcrypt from 'bcryptjs';
import { DatabaseService } from './database.service';

export interface SecurityPolicy {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse: number; // Number of previous passwords to check
    maxAge: number; // Password expiry in days
  };
  sessionPolicy: {
    maxAge: number; // Session timeout in milliseconds
    maxConcurrentSessions: number;
    requireSecure: boolean;
  };
  accountLockout: {
    maxFailedAttempts: number;
    lockoutDuration: number; // in minutes
    resetAfterSuccess: boolean;
  };
  auditPolicy: {
    retentionPeriod: number; // in days
    logAllAccess: boolean;
    logFailedAttempts: boolean;
    alertOnSuspiciousActivity: boolean;
  };
}

export interface SecurityEvent {
  id: string;
  userId?: string;
  tenantId?: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent?: string;
  description: string;
  eventData?: Record<string, any>;
  resolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  successful: boolean;
  failureReason?: string;
  userAgent?: string;
  attemptedAt: Date;
}

export class SecurityService {
  private db: Knex;
  private defaultPolicy: SecurityPolicy;

  constructor() {
    this.db = DatabaseService.getInstance().getConnection();
    this.defaultPolicy = {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventReuse: 5,
        maxAge: 90 // 90 days
      },
      sessionPolicy: {
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
        maxConcurrentSessions: 3,
        requireSecure: process.env['NODE_ENV'] === 'production'
      },
      accountLockout: {
        maxFailedAttempts: 5,
        lockoutDuration: 30, // 30 minutes
        resetAfterSuccess: true
      },
      auditPolicy: {
        retentionPeriod: 365, // 1 year
        logAllAccess: true,
        logFailedAttempts: true,
        alertOnSuspiciousActivity: true
      }
    };
  }

  /**
   * Validate password against security policy
   */
  async validatePassword(
    password: string,
    userId?: string,
    policy?: Partial<SecurityPolicy['passwordPolicy']>
  ): Promise<{ valid: boolean; errors: string[] }> {
    const passwordPolicy = { ...this.defaultPolicy.passwordPolicy, ...policy };
    const errors: string[] = [];

    // Check minimum length
    if (password.length < passwordPolicy.minLength) {
      errors.push(`Password must be at least ${passwordPolicy.minLength} characters long`);
    }

    // Check character requirements
    if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check against previous passwords if user ID provided
    if (userId && passwordPolicy.preventReuse > 0) {
      const previousPasswords = await this.db('password_history')
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(passwordPolicy.preventReuse);

      for (const prevPassword of previousPasswords) {
        if (await bcrypt.compare(password, prevPassword.password_hash)) {
          errors.push('Password cannot be the same as a recently used password');
          break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Store password in history
   */
  async storePasswordHistory(userId: string, passwordHash: string): Promise<void> {
    const id = `pwd_hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db('password_history').insert({
      id,
      user_id: userId,
      password_hash: passwordHash,
      created_at: new Date()
    });

    // Clean up old password history beyond the retention limit
    const retentionLimit = this.defaultPolicy.passwordPolicy.preventReuse;
    const oldPasswords = await this.db('password_history')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .offset(retentionLimit);

    if (oldPasswords.length > 0) {
      const oldIds = oldPasswords.map(p => p.id);
      await this.db('password_history').whereIn('id', oldIds).del();
    }
  }

  /**
   * Check if account is locked due to failed login attempts
   */
  async isAccountLocked(email: string, ipAddress?: string): Promise<{
    locked: boolean;
    lockoutExpiry?: Date;
    remainingAttempts?: number;
  }> {
    const policy = this.defaultPolicy.accountLockout;
    const lockoutWindow = new Date(Date.now() - policy.lockoutDuration * 60 * 1000);

    // Get recent failed attempts
    let query = this.db('login_attempts')
      .where('email', email)
      .where('successful', false)
      .where('attempted_at', '>', lockoutWindow)
      .orderBy('attempted_at', 'desc');

    // Optionally filter by IP address for more granular lockout
    if (ipAddress) {
      query = query.where('ip_address', ipAddress);
    }

    const failedAttempts = await query;

    if (failedAttempts.length >= policy.maxFailedAttempts) {
      const latestAttempt = failedAttempts[0];
      const lockoutExpiry = new Date(
        new Date(latestAttempt.attempted_at).getTime() + policy.lockoutDuration * 60 * 1000
      );

      return {
        locked: true,
        lockoutExpiry
      };
    }

    return {
      locked: false,
      remainingAttempts: policy.maxFailedAttempts - failedAttempts.length
    };
  }

  /**
   * Record login attempt
   */
  async recordLoginAttempt(
    email: string,
    ipAddress: string,
    successful: boolean,
    failureReason?: string,
    userAgent?: string
  ): Promise<void> {
    const id = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await this.db('login_attempts').insert({
      id,
      email,
      ip_address: ipAddress,
      successful,
      failure_reason: failureReason,
      user_agent: userAgent,
      attempted_at: new Date()
    });

    // If successful and policy requires reset, clear failed attempts
    if (successful && this.defaultPolicy.accountLockout.resetAfterSuccess) {
      await this.db('login_attempts')
        .where('email', email)
        .where('successful', false)
        .del();
    }
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    ipAddress: string,
    options: {
      userId?: string;
      tenantId?: string;
      userAgent?: string;
      eventData?: Record<string, any>;
    } = {}
  ): Promise<string> {
    const id = `sec_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await this.db('security_events').insert({
      id,
      user_id: options.userId,
      tenant_id: options.tenantId,
      event_type: eventType,
      severity,
      ip_address: ipAddress,
      user_agent: options.userAgent,
      description,
      event_data: options.eventData ? JSON.stringify(options.eventData) : null,
      resolved: false,
      created_at: new Date()
    });

    // Alert on high/critical severity events
    if (['high', 'critical'].includes(severity)) {
      await this.alertSecurityTeam(eventType, severity, description, options);
    }

    return id;
  }

  /**
   * Get security events
   */
  async getSecurityEvents(filters: {
    userId?: string;
    tenantId?: string;
    eventType?: string;
    severity?: string;
    resolved?: boolean;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {}): Promise<{ events: SecurityEvent[]; total: number }> {
    let query = this.db('security_events').select('*');

    // Apply filters
    if (filters.userId) query = query.where('user_id', filters.userId);
    if (filters.tenantId) query = query.where('tenant_id', filters.tenantId);
    if (filters.eventType) query = query.where('event_type', filters.eventType);
    if (filters.severity) query = query.where('severity', filters.severity);
    if (filters.resolved !== undefined) query = query.where('resolved', filters.resolved);
    if (filters.startDate) query = query.where('created_at', '>=', filters.startDate);
    if (filters.endDate) query = query.where('created_at', '<=', filters.endDate);

    // Get total count
    const totalResult = await query.clone().count('* as count').first();
    const total = parseInt(totalResult?.['count'] as string) || 0;

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    const events = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      events: events.map(event => ({
        id: event.id,
        userId: event.user_id,
        tenantId: event.tenant_id,
        eventType: event.event_type,
        severity: event.severity,
        ipAddress: event.ip_address,
        userAgent: event.user_agent,
        description: event.description,
        eventData: event.event_data ? JSON.parse(event.event_data) : undefined,
        resolved: event.resolved,
        createdAt: new Date(event.created_at),
        resolvedAt: event.resolved_at ? new Date(event.resolved_at) : undefined,
        resolvedBy: event.resolved_by
      })),
      total
    };
  }

  /**
   * Resolve security event
   */
  async resolveSecurityEvent(eventId: string, resolvedBy: string): Promise<void> {
    await this.db('security_events')
      .where('id', eventId)
      .update({
        resolved: true,
        resolved_at: new Date(),
        resolved_by: resolvedBy
      });
  }

  /**
   * Clean up old audit logs and security data
   */
  async cleanupOldData(): Promise<{
    auditLogsDeleted: number;
    securityEventsDeleted: number;
    loginAttemptsDeleted: number;
  }> {
    const retentionDate = new Date(
      Date.now() - this.defaultPolicy.auditPolicy.retentionPeriod * 24 * 60 * 60 * 1000
    );

    const auditLogsDeleted = await this.db('audit_logs')
      .where('created_at', '<', retentionDate)
      .del();

    const securityEventsDeleted = await this.db('security_events')
      .where('created_at', '<', retentionDate)
      .where('resolved', true)
      .del();

    // Keep login attempts for shorter period (30 days)
    const loginRetentionDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const loginAttemptsDeleted = await this.db('login_attempts')
      .where('attempted_at', '<', loginRetentionDate)
      .del();

    return {
      auditLogsDeleted,
      securityEventsDeleted,
      loginAttemptsDeleted
    };
  }

  /**
   * Get security compliance report
   */
  async getComplianceReport(tenantId?: string): Promise<{
    passwordCompliance: number;
    sessionCompliance: number;
    auditCompliance: number;
    overallScore: number;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    let passwordScore = 100;
    let sessionScore = 100;
    let auditScore = 100;

    // Check password compliance
    const weakPasswords = await this.checkWeakPasswords(tenantId);
    if (weakPasswords > 0) {
      passwordScore -= Math.min(50, weakPasswords * 10);
      recommendations.push(`${weakPasswords} users have weak passwords that should be updated`);
    }

    // Check session compliance
    const longSessions = await this.checkLongRunningSessions(tenantId);
    if (longSessions > 0) {
      sessionScore -= Math.min(30, longSessions * 5);
      recommendations.push(`${longSessions} sessions exceed recommended duration`);
    }

    // Check audit compliance
    const auditGaps = await this.checkAuditGaps(tenantId);
    if (auditGaps > 0) {
      auditScore -= Math.min(40, auditGaps * 10);
      recommendations.push(`${auditGaps} days with incomplete audit logs`);
    }

    const overallScore = Math.round((passwordScore + sessionScore + auditScore) / 3);

    return {
      passwordCompliance: passwordScore,
      sessionCompliance: sessionScore,
      auditCompliance: auditScore,
      overallScore,
      recommendations
    };
  }

  /**
   * Alert security team about critical events
   */
  private async alertSecurityTeam(
    eventType: string,
    severity: string,
    description: string,
    options: any
  ): Promise<void> {
    // In a real implementation, this would send alerts via email, Slack, etc.
    console.warn(`🚨 SECURITY ALERT [${severity.toUpperCase()}]: ${eventType}`, {
      description,
      ...options,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Check for weak passwords (placeholder implementation)
   */
  private async checkWeakPasswords(_tenantId?: string): Promise<number> {
    // This would check password strength in a real implementation
    return 0;
  }

  /**
   * Check for long-running sessions
   */
  private async checkLongRunningSessions(tenantId?: string): Promise<number> {
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = new Date(Date.now() - maxSessionAge);

    let query = this.db('user_sessions')
      .where('is_active', true)
      .where('created_at', '<', cutoff);

    if (tenantId) {
      query = query.where('tenant_id', tenantId);
    }

    const result = await query.count('* as count').first();
    return parseInt(result?.['count'] as string) || 0;
  }

  /**
   * Check for audit log gaps
   */
  private async checkAuditGaps(_tenantId?: string): Promise<number> {
    // This would check for days without audit logs in a real implementation
    return 0;
  }
}

export default SecurityService;