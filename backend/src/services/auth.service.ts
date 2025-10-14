import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Knex } from 'knex';
import { User, UserRole, Permission, UserContext } from '../types';
import { LoginCredentialsSchema, UserContextSchema } from '../types/validation-schemas';
import config from '../config/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserContext;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  constructor(private db: Knex) {}

  /**
   * Authenticate user with email and password
   */
  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Validate input
      const validatedCredentials = LoginCredentialsSchema.parse(credentials);

      // Find user by email
      const user = await this.db('users')
        .select('*')
        .where('email', validatedCredentials.email)
        .where('is_active', true)
        .first();

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(validatedCredentials.password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Get user roles and permissions
      const userContext = await this.buildUserContext(user.id, user.tenant_id);

      // Generate tokens
      const tokens = await this.generateTokens(userContext);

      // Update last login
      await this.db('users')
        .where('id', user.id)
        .update({ last_login: new Date() });

      return {
        success: true,
        user: userContext,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Validate JWT token and return user context
   */
  async validateToken(token: string): Promise<UserContext | null> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      // Check if token is expired
      if (decoded.exp < Date.now() / 1000) {
        return null;
      }

      // Rebuild user context to ensure fresh data
      return await this.buildUserContext(decoded.userId, decoded.tenantId);
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair | null> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
      
      // Verify user still exists and is active
      const user = await this.db('users')
        .select('id', 'tenant_id', 'is_active')
        .where('id', decoded.userId)
        .where('is_active', true)
        .first();

      if (!user) {
        return null;
      }

      // Build fresh user context
      const userContext = await this.buildUserContext(user.id, user.tenant_id);
      
      // Generate new tokens
      return await this.generateTokens(userContext);
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  /**
   * Logout user (invalidate session)
   */
  async logout(userId: string): Promise<void> {
    try {
      // In a production system, you might want to maintain a blacklist of tokens
      // For now, we'll just log the logout action
      console.log(`User ${userId} logged out at ${new Date().toISOString()}`);
      
      // Could implement token blacklisting here if needed
      // await this.addToTokenBlacklist(token);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Reset password (send reset email)
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const user = await this.db('users')
        .select('id', 'email', 'first_name', 'last_name')
        .where('email', email)
        .where('is_active', true)
        .first();

      if (!user) {
        // Don't reveal if email exists or not for security
        return;
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      // In a real implementation, you would:
      // 1. Store the reset token in database with expiration
      // 2. Send email with reset link
      // 3. Provide endpoint to verify token and update password

      console.log(`Password reset requested for user ${user.id}. Reset token: ${resetToken}`);
      
      // TODO: Implement email service integration
      // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error('Password reset error:', error);
    }
  }

  /**
   * Hash password for storage
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Build complete user context with roles and permissions
   */
  private async buildUserContext(userId: string, tenantId: string): Promise<UserContext> {
    // Get user roles
    const userRoles = await this.db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .select('roles.*')
      .where('user_roles.user_id', userId);

    // Aggregate all permissions from roles
    const allPermissions: Permission[] = [];
    for (const role of userRoles) {
      if (role.permissions && Array.isArray(role.permissions)) {
        allPermissions.push(...role.permissions);
      }
    }

    // Remove duplicate permissions
    const uniquePermissions = allPermissions.filter((permission, index, self) => 
      index === self.findIndex(p => p.resource === permission.resource && 
        JSON.stringify(p.actions) === JSON.stringify(permission.actions))
    );

    const userContext: UserContext = {
      userId,
      tenantId,
      roles: userRoles,
      permissions: uniquePermissions,
      sessionId: this.generateSessionId()
    };

    return UserContextSchema.parse(userContext);
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(userContext: UserContext): Promise<TokenPair> {
    const accessTokenPayload = {
      userId: userContext.userId,
      tenantId: userContext.tenantId,
      sessionId: userContext.sessionId,
      type: 'access'
    };

    const refreshTokenPayload = {
      userId: userContext.userId,
      tenantId: userContext.tenantId,
      sessionId: userContext.sessionId,
      type: 'refresh'
    };

    const accessToken = jwt.sign(
      accessTokenPayload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpirationTime(config.jwt.expiresIn)
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Parse expiration time string to seconds
   */
  private parseExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600;
    }
  }
}

export default AuthService;