import { Router } from 'express';
import { ServiceCoordinatorController } from '../controllers/service-coordinator.controller';
import { ServiceCoordinatorService } from '../services/service-coordinator.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { DatabaseService } from '../services/database.service';

const router = Router();

// Initialize services and controller
const databaseService = DatabaseService.getInstance();
const serviceCoordinatorService = new ServiceCoordinatorService(databaseService.getConnection());
const serviceCoordinatorController = new ServiceCoordinatorController(serviceCoordinatorService);

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route POST /api/service-coordinators
 * @desc Create a new service coordinator
 * @access Private
 * @body {string} scid - Service Coordinator ID
 * @body {string} firstName - First name
 * @body {string} lastName - Last name
 * @body {string} email - Email address
 * @body {string} [phone] - Phone number
 * @body {string} organization - Organization name
 * @body {string} zone - Geographic zone (SW, SE, NE, NW, LC)
 * @body {string} [supervisorId] - Supervisor ID (UUID)
 * @body {string} [managerId] - Manager ID (UUID)
 * @body {string} [directorId] - Director ID (UUID)
 * @body {number} [maxCaseload] - Maximum caseload
 * @body {string[]} [specializations] - Array of specializations
 * @body {string} [licenseNumber] - Professional license number
 * @body {string} hireDate - Hire date (ISO string)
 */
router.post('/', serviceCoordinatorController.createServiceCoordinator);

/**
 * @route PUT /api/service-coordinators/:scId
 * @desc Update service coordinator information
 * @access Private
 * @param {string} scId - Service Coordinator UUID
 */
router.put('/:scId', serviceCoordinatorController.updateServiceCoordinator);

/**
 * @route GET /api/service-coordinators/:scId
 * @desc Get service coordinator by ID
 * @access Private
 * @param {string} scId - Service Coordinator UUID
 */
router.get('/:scId', serviceCoordinatorController.getServiceCoordinatorById);

/**
 * @route GET /api/service-coordinators/scid/:scid
 * @desc Get service coordinator by SCID
 * @access Private
 * @param {string} scid - Service Coordinator business ID
 */
router.get('/scid/:scid', serviceCoordinatorController.getServiceCoordinatorBySCID);

/**
 * @route GET /api/service-coordinators/search
 * @desc Search service coordinators with filters and pagination
 * @access Private
 * @query {string} [firstName] - Filter by first name (partial match)
 * @query {string} [lastName] - Filter by last name (partial match)
 * @query {string} [email] - Filter by email (partial match)
 * @query {string} [organization] - Filter by organization (partial match)
 * @query {string} [zone] - Filter by zone (SW, SE, NE, NW, LC)
 * @query {string} [supervisorId] - Filter by supervisor ID
 * @query {string} [managerId] - Filter by manager ID
 * @query {string} [directorId] - Filter by director ID
 * @query {boolean} [isActive] - Filter by active status
 * @query {string[]} [specializations] - Filter by specializations
 * @query {number} [maxCaseloadMin] - Filter by minimum max caseload
 * @query {number} [maxCaseloadMax] - Filter by maximum max caseload
 * @query {number} [currentCaseloadMin] - Filter by minimum current caseload
 * @query {number} [currentCaseloadMax] - Filter by maximum current caseload
 * @query {string} [hireDateFrom] - Filter by hire date from
 * @query {string} [hireDateTo] - Filter by hire date to
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=20] - Number of items per page
 */
router.get('/search', serviceCoordinatorController.searchServiceCoordinators);

/**
 * @route GET /api/service-coordinators/zone/:zone
 * @desc Get service coordinators by zone
 * @access Private
 * @param {string} zone - Geographic zone (SW, SE, NE, NW, LC)
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=20] - Number of items per page
 */
router.get('/zone/:zone', serviceCoordinatorController.getServiceCoordinatorsByZone);

/**
 * @route PUT /api/service-coordinators/:scId/caseload
 * @desc Update service coordinator caseload
 * @access Private
 * @param {string} scId - Service Coordinator UUID
 * @body {number} newCaseload - New caseload count
 */
router.put('/:scId/caseload', serviceCoordinatorController.updateCaseload);

/**
 * @route GET /api/service-coordinators/:scId/hierarchy
 * @desc Get service coordinator hierarchy (supervisor, manager, director)
 * @access Private
 * @param {string} scId - Service Coordinator UUID
 */
router.get('/:scId/hierarchy', serviceCoordinatorController.getServiceCoordinatorHierarchy);

export default router;