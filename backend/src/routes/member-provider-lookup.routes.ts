import { Router } from 'express';
import { MemberProviderLookupController } from '../controllers/member-provider-lookup.controller';
import { MemberProviderLookupService } from '../services/member-provider-lookup.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { DatabaseService } from '../services/database.service';

const router = Router();

// Initialize services and controller
const databaseService = DatabaseService.getInstance();
const lookupService = new MemberProviderLookupService(databaseService.getConnection());
const lookupController = new MemberProviderLookupController(lookupService);

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/lookup/quick-search
 * @desc Quick search for both members and providers
 * @access Private
 * @query {string} query - Search query for both members and providers
 * @query {string} [memberQuery] - Specific search query for members
 * @query {string} [providerQuery] - Specific search query for providers
 * @query {string} [memberZone] - Filter members by zone (SW, SE, NE, NW, LC)
 * @query {string} [providerNetworkStatus] - Filter providers by network status
 * @query {string} [providerSpecialty] - Filter providers by specialty
 * @query {number} [limit=10] - Maximum number of results per category
 */
router.get('/quick-search', lookupController.quickSearch);

/**
 * @route GET /api/lookup/members/quick-search
 * @desc Quick search members only
 * @access Private
 * @query {string} query - Search query (name, Medicaid ID, HCIN ID)
 * @query {string} [memberZone] - Filter by member zone (SW, SE, NE, NW, LC)
 * @query {number} [limit=10] - Maximum number of results
 */
router.get('/members/quick-search', lookupController.quickSearchMembers);

/**
 * @route GET /api/lookup/providers/quick-search
 * @desc Quick search providers only
 * @access Private
 * @query {string} query - Search query (name, NPI, specialty)
 * @query {string} [networkStatus] - Filter by network status (defaults to in_network)
 * @query {string} [specialty] - Filter by specialty
 * @query {number} [limit=10] - Maximum number of results
 */
router.get('/providers/quick-search', lookupController.quickSearchProviders);

/**
 * @route GET /api/lookup/member-provider/:memberDataId/:providerId
 * @desc Get member and provider data for form pre-population
 * @access Private
 * @param {string} memberDataId - Member data ID
 * @param {string} providerId - Provider ID
 */
router.get('/member-provider/:memberDataId/:providerId', lookupController.getMemberAndProvider);

/**
 * @route GET /api/lookup/providers/by-member-zone/:memberZone
 * @desc Get providers by member zone for targeted searches
 * @access Private
 * @param {string} memberZone - Member zone (SW, SE, NE, NW, LC)
 * @query {string} [specialty] - Filter by provider specialty
 * @query {number} [limit=20] - Maximum number of results
 */
router.get('/providers/by-member-zone/:memberZone', lookupController.getProvidersByMemberZone);

/**
 * @route GET /api/lookup/members/by-service-coordinator/:assignedSCID
 * @desc Get members by service coordinator for assignment workflows
 * @access Private
 * @param {string} assignedSCID - Service Coordinator ID
 * @query {number} [limit=20] - Maximum number of results
 */
router.get('/members/by-service-coordinator/:assignedSCID', lookupController.getMembersByServiceCoordinator);

/**
 * @route POST /api/lookup/validate-member-provider
 * @desc Validate member and provider combination for form submissions
 * @access Private
 * @body {string} memberDataId - Member data ID
 * @body {string} providerId - Provider ID
 */
router.post('/validate-member-provider', lookupController.validateMemberProviderCombination);

export default router;