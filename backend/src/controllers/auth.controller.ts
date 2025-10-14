import { Request, Response } from 'express';
import { Knex } from 'knex';
import { AuthService } from '../services/auth.service';
import { 
  LoginCredentialsSchema, 
 
} from '../types/validation-schemas';
import { ApiResponse } from '../types';

export class AuthController {
  constructor(
    private db: Knex,
    private authService: AuthService
  ) {}

  /**
   * POST /auth/login
   * Authenticate user and return JWT tokens
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials = LoginCredentialsSchema.parse(req.body);
      const result = await this.authService.authenticate(credentials);

      if (!result.success) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: result.error || 'Authentication failed'
          }
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          tokenType: 'Bearer'
        },
        metadata: {
          timestamp: new Date()
        }
      } as ApiResponse);
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Invalid login credentials format'
        }
      } as ApiResponse);
    }
  };

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_REQUIRED',
            message: 'Refresh token is required'
          }
        } as ApiResponse);
        return;
      }

      const tokens = await this.authService.refreshToken(refreshToken);

      if (!tokens) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token'
          }
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          tokenType: 'Bearer'
        },
        metadata: {
          timestamp: new Date()
        }
      } as ApiResponse);
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TOKEN_REFRESH_ERROR',
          message: 'Failed to refresh token'
        }
      } as ApiResponse);
    }
  };

  /**
   * POST /auth/logout
   * Logout user and invalidate session
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      if (req.user) {
        await this.authService.logout(req.user.userId);
      }

      res.json({
        success: true,
        data: {
          message: 'Logged out successfully'
        },
        metadata: {
          timestamp: new Date()
        }
      } as ApiResponse);
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Failed to logout'
        }
      } as ApiResponse);
    }
  };

  /**
   * POST /auth/forgot-password
   * Send password reset email
   */
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_REQUIRED',
            message: 'Email is required'
          }
        } as ApiResponse);
        return;
      }

      await this.authService.resetPassword(email);

      // Always return success for security (don't reveal if email exists)
      res.json({
        success: true,
        data: {
          message: 'If the email exists, a password reset link has been sent'
        },
        metadata: {
          timestamp: new Date()
        }
      } as ApiResponse);
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FORGOT_PASSWORD_ERROR',
          message: 'Failed to process password reset request'
        }
      } as ApiResponse);
    }
  };

  /**
   * GET /auth/me
   * Get current user information
   */
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        } as ApiResponse);
        return;
      }

      // Get full user details
      const user = await this.db('users')
        .select('id', 'email', 'first_name', 'last_name', 'is_active', 'last_login', 'region')
        .where('id', req.user.userId)
        .first();

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: {
          user: {
            ...user,
            roles: req.user.roles,
            permissions: req.user.permissions
          }
        },
        metadata: {
          timestamp: new Date()
        }
      } as ApiResponse);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_USER_ERROR',
          message: 'Failed to get user information'
        }
      } as ApiResponse);
    }
  };

  /**
   * POST /auth/change-password
   * Change user password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        } as ApiResponse);
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: {
            code: 'PASSWORDS_REQUIRED',
            message: 'Current password and new password are required'
          }
        } as ApiResponse);
        return;
      }

      // Get current user
      const user = await this.db('users')
        .select('password_hash')
        .where('id', req.user.userId)
        .first();

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        } as ApiResponse);
        return;
      }

      // Verify current password
      const bcrypt = require('bcryptjs');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CURRENT_PASSWORD',
            message: 'Current password is incorrect'
          }
        } as ApiResponse);
        return;
      }

      // Hash new password
      const newPasswordHash = await this.authService.hashPassword(newPassword);

      // Update password
      await this.db('users')
        .where('id', req.user.userId)
        .update({
          password_hash: newPasswordHash,
          updated_by: req.user.userId,
          updated_at: new Date()
        });

      res.json({
        success: true,
        data: {
          message: 'Password changed successfully'
        },
        metadata: {
          timestamp: new Date()
        }
      } as ApiResponse);
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CHANGE_PASSWORD_ERROR',
          message: 'Failed to change password'
        }
      } as ApiResponse);
    }
  };
}

/**
 * Factory function to create auth controller with dependencies
 */
export const createAuthController = (db: Knex): AuthController => {
  const authService = new AuthService(db);
  return new AuthController(db, authService);
};

export default AuthController;