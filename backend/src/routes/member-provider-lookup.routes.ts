/**
 * Member and Provider Lookup Routes
 * 
 * Defines API routes for member and provider data management:
 * - Member and provider search with type-ahead
 * - Data pre-population for form instances
 * - Mock data generation for development and testing
 * - Staging data management
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

import { Router } from 'express';
import { MemberProviderLookupController } from '../controllers/member-provider-lookup.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const memberProviderController = new MemberProviderLookupController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ============================================================================
// MEMBER ROUTES
// ============================================================================

/**
 * Member Management Routes
 * Base path: /api/members
 */

// GET /api/members/search - Search members with type-ahead
router.get('/members/search', memberProviderController.searchMembers);

// GET /api/members/:memberId - Get member by ID
router.get('/members/:memberId', memberProviderController.getMemberById);

// POST /api/members - Create or update member data
router.post('/members', memberProviderController.upsertMemberData);

// POST /api/members/bulk-import - Bulk import member data
router.post('/members/bulk-import', memberProviderController.bulkImportMembers);

// ============================================================================
// PROVIDER ROUTES
// ============================================================================

/**
 * Provider Management Routes
 * Base path: /api/providers
 */

// GET /api/providers/search - Search providers with type-ahead
router.get('/providers/search', memberProviderController.searchProviders);

// GET /api/providers/:providerId - Get provider by ID
router.get('/providers/:providerId', memberProviderController.getProviderById);

// POST /api/providers - Create or update provider data
router.post('/providers', memberProviderController.upsertProviderData);

// POST /api/providers/bulk-import - Bulk import provider data
router.post('/providers/bulk-import', memberProviderController.bulkImportProviders);

// ============================================================================
// DATA PRE-POPULATION ROUTES
// ============================================================================

/**
 * Pre-population Routes
 * Base path: /api/pre-population
 */

// GET /api/pre-population - Get pre-population data for form instances
router.get('/pre-population', memberProviderController.getPrePopulationData);

// ============================================================================
// MOCK DATA GENERATION ROUTES
// ============================================================================

/**
 * Mock Data Generation Routes (Development/Testing)
 * Base path: /api/mock-data
 */

// POST /api/mock-data/members - Generate mock member data
router.post('/mock-data/members', memberProviderController.generateMockMembers);

// POST /api/mock-data/providers - Generate mock provider data
router.post('/mock-data/providers', memberProviderController.generateMockProviders);

// ============================================================================
// STAGING DATA UTILITY ROUTES
// ============================================================================

/**
 * Staging Data Utility Routes
 * Base path: /api/staging-data
 */

// GET /api/staging-data/stats - Get staging data statistics
router.get('/staging-data/stats', memberProviderController.getStagingDataStats);

// DELETE /api/staging-data/clear - Clear staging data (development/testing only)
router.delete('/staging-data/clear', memberProviderController.clearStagingData);

export default router;