/**
 * Integration Routes
 * 
 * API routes for integration testing and health checks
 * Requirements: All MVP requirements integration
 */

import { Router } from 'express';
import { IntegrationController } from '../controllers/integration.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const integrationController = new IntegrationController();

// ============================================================================
// HEALTH CHECK ROUTES
// ============================================================================

/**
 * GET /api/integration/health
 * Comprehensive health check for all MVP components
 */
router.get('/integration/health', integrationController.healthCheck);

/**
 * GET /api/integration/mvp-status
 * Get detailed MVP component status
 * Requires authentication
 */
router.get('/integration/mvp-status', authMiddleware, integrationController.getMVPStatus);

// ============================================================================
// INTEGRATION TEST ROUTES
// ============================================================================

/**
 * POST /api/integration/test
 * Run integration tests for all MVP components
 * Requires authentication
 */
router.post('/integration/test', authMiddleware, integrationController.testIntegration);

export default router;