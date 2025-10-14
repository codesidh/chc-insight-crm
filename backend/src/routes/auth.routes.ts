import { Router } from 'express';
import { Knex } from 'knex';
import { createAuthController } from '../controllers/auth.controller';
import { createAuthMiddleware } from '../middleware/auth.middleware';

/**
 * Authentication routes
 * Handles user login, logout, token refresh, and password management
 */
export const createAuthRoutes = (db: Knex): Router => {
  const router = Router();
  const authController = createAuthController(db);
  const authMiddleware = createAuthMiddleware(db);

  // Public routes (no authentication required)
  
  /**
   * POST /auth/login
   * Authenticate user with email and password
   * 
   * Body:
   * {
   *   "email": "user@example.com",
   *   "password": "password123"
   * }
   * 
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "user": { ... },
   *     "accessToken": "jwt_token",
   *     "refreshToken": "refresh_token",
   *     "tokenType": "Bearer"
   *   }
   * }
   */
  router.post('/login', authController.login);

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   * 
   * Body:
   * {
   *   "refreshToken": "refresh_token"
   * }
   * 
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "accessToken": "new_jwt_token",
   *     "refreshToken": "new_refresh_token",
   *     "expiresIn": 3600,
   *     "tokenType": "Bearer"
   *   }
   * }
   */
  router.post('/refresh', authController.refreshToken);

  /**
   * POST /auth/forgot-password
   * Send password reset email
   * 
   * Body:
   * {
   *   "email": "user@example.com"
   * }
   * 
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "message": "If the email exists, a password reset link has been sent"
   *   }
   * }
   */
  router.post('/forgot-password', authController.forgotPassword);

  // Protected routes (authentication required)

  /**
   * POST /auth/logout
   * Logout current user and invalidate session
   * 
   * Headers:
   * Authorization: Bearer <access_token>
   * 
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "message": "Logged out successfully"
   *   }
   * }
   */
  router.post('/logout', authMiddleware.authenticate, authController.logout);

  /**
   * GET /auth/me
   * Get current authenticated user information
   * 
   * Headers:
   * Authorization: Bearer <access_token>
   * 
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "user": {
   *       "id": "uuid",
   *       "email": "user@example.com",
   *       "firstName": "John",
   *       "lastName": "Doe",
   *       "roles": [...],
   *       "permissions": [...]
   *     }
   *   }
   * }
   */
  router.get('/me', authMiddleware.authenticate, authController.getCurrentUser);

  /**
   * POST /auth/change-password
   * Change user password
   * 
   * Headers:
   * Authorization: Bearer <access_token>
   * 
   * Body:
   * {
   *   "currentPassword": "old_password",
   *   "newPassword": "new_password"
   * }
   * 
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "message": "Password changed successfully"
   *   }
   * }
   */
  router.post('/change-password', authMiddleware.authenticate, authController.changePassword);

  return router;
};

export default createAuthRoutes;