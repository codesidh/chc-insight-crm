import { Router } from 'express';
import { ProviderDataController } from '../controllers/provider-data.controller';
import { ProviderDataService } from '../services/provider-data.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { DatabaseService } from '../services/database.service';

const router = Router();

// Initialize services and controller
const databaseService = DatabaseService.getInstance();
const providerDataService = new ProviderDataService(databaseService.getConnection());
const providerDataController = new ProviderDataController(providerDataService);

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/provider-data/:providerId
 * @desc Get provider by ID
 * @access Private
 */
router.get('/:providerId', providerDataController.getProviderById);

/**
 * @route GET /api/provider-data/npi/:npi
 * @desc Get provider by NPI
 * @access Private
 * @param {string} npi - 10-digit National Provider Identifier
 */
router.get('/npi/:npi', providerDataController.getProviderByNPI);

/**
 * @route GET /api/provider-data/search
 * @desc Search providers with filters and pagination
 * @access Private
 * @query {string} [name] - Filter by provider name (partial match)
 * @query {string} [npi] - Filter by NPI (partial match)
 * @query {string} [taxonomy] - Filter by taxonomy (partial match)
 * @query {string} [providerEntity] - Filter by provider entity (partial match)
 * @query {string} [providerType] - Filter by provider type (partial match)
 * @query {string} [providerTypeCode] - Filter by provider type code
 * @query {string} [organizationType] - Filter by organization type (partial match)
 * @query {string} [specialty] - Filter by specialty (partial match)
 * @query {string} [specialtyCode] - Filter by specialty code
 * @query {string} [subSpecialty] - Filter by sub-specialty (partial match)
 * @query {string} [networkStatus] - Filter by network status (in_network, out_of_network, pending, terminated)
 * @query {string} [relationshipSpecialistName] - Filter by relationship specialist name (partial match)
 * @query {string} [lastUpdatedFrom] - Filter by last updated date from
 * @query {string} [lastUpdatedTo] - Filter by last updated date to
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=20] - Number of items per page
 */
router.get('/search', providerDataController.searchProviders);

/**
 * @route GET /api/provider-data/network-status/:networkStatus
 * @desc Get providers by network status
 * @access Private
 * @param {string} networkStatus - Network status (in_network, out_of_network, pending, terminated)
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=20] - Number of items per page
 */
router.get('/network-status/:networkStatus', providerDataController.getProvidersByNetworkStatus);

/**
 * @route GET /api/provider-data/specialty/:specialty
 * @desc Get providers by specialty
 * @access Private
 * @param {string} specialty - Provider specialty
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=20] - Number of items per page
 */
router.get('/specialty/:specialty', providerDataController.getProvidersBySpecialty);

/**
 * @route GET /api/provider-data/relationship-specialist/:relationshipSpecialistName
 * @desc Get providers by relationship specialist
 * @access Private
 * @param {string} relationshipSpecialistName - Relationship specialist name
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=20] - Number of items per page
 */
router.get('/relationship-specialist/:relationshipSpecialistName', providerDataController.getProvidersByRelationshipSpecialist);

/**
 * @route GET /api/provider-data/quick-search
 * @desc Quick search providers for form pre-population
 * @access Private
 * @query {string} query - Search query (name, NPI, or specialty)
 * @query {number} [limit=10] - Maximum number of results to return
 */
router.get('/quick-search', providerDataController.quickSearchProviders);

/**
 * @route GET /api/provider-data/stats/network-status
 * @desc Get provider statistics by network status
 * @access Private
 */
router.get('/stats/network-status', providerDataController.getProviderStatsByNetworkStatus);

/**
 * @route GET /api/provider-data/stats/specialty
 * @desc Get provider statistics by specialty (top 20)
 * @access Private
 */
router.get('/stats/specialty', providerDataController.getProviderStatsBySpecialty);

export default router;