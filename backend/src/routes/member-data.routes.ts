import { Router } from 'express';
import { MemberDataController } from '../controllers/member-data.controller';
import { MemberDataService } from '../services/member-data.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { DatabaseService } from '../services/database.service';

const router = Router();

// Initialize services and controller
const databaseService = DatabaseService.getInstance();
const memberDataService = new MemberDataService(databaseService.getConnection());
const memberDataController = new MemberDataController(memberDataService);

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/member-data/:memberDataId
 * @desc Get member by member data ID
 * @access Private
 */
router.get('/:memberDataId', memberDataController.getMemberById);

/**
 * @route GET /api/member-data/medicaid/:medicaidId
 * @desc Get member by Medicaid ID
 * @access Private
 */
router.get('/medicaid/:medicaidId', memberDataController.getMemberByMedicaidId);

/**
 * @route GET /api/member-data/hcin/:hcinId
 * @desc Get member by HCIN ID
 * @access Private
 */
router.get('/hcin/:hcinId', memberDataController.getMemberByHcinId);

/**
 * @route GET /api/member-data/search
 * @desc Search members with filters and pagination
 * @access Private
 * @query {string} [medicaidId] - Filter by Medicaid ID (partial match)
 * @query {string} [hcinId] - Filter by HCIN ID (partial match)
 * @query {string} [firstName] - Filter by first name (partial match)
 * @query {string} [lastName] - Filter by last name (partial match)
 * @query {string} [planCategory] - Filter by plan category (Medical, RX, Vision)
 * @query {string} [planType] - Filter by plan type (NFCE, NFI)
 * @query {string} [planSubType] - Filter by plan sub type (HCBS, NF, NFI)
 * @query {string} [waiverCode] - Filter by waiver code (20, 37, 38, 39)
 * @query {string} [aligned] - Filter by aligned status (Y, N)
 * @query {string} [planDual] - Filter by plan dual status (Y, N)
 * @query {string} [dsnpName] - Filter by DSNP name
 * @query {string} [memberZone] - Filter by member zone (SW, SE, NE, NW, LC)
 * @query {string} [assignedSCID] - Filter by assigned Service Coordinator ID
 * @query {string} [scZone] - Filter by Service Coordinator zone
 * @query {number} [picsScoreMin] - Filter by minimum PICS score
 * @query {number} [picsScoreMax] - Filter by maximum PICS score
 * @query {string} [eligEffectiveDateFrom] - Filter by eligibility effective date from
 * @query {string} [eligEffectiveDateTo] - Filter by eligibility effective date to
 * @query {string} [waiverEffectiveDateFrom] - Filter by waiver effective date from
 * @query {string} [waiverEffectiveDateTo] - Filter by waiver effective date to
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=20] - Number of items per page
 */
router.get('/search', memberDataController.searchMembers);

/**
 * @route GET /api/member-data/service-coordinator/:assignedSCID
 * @desc Get members by Service Coordinator ID
 * @access Private
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=20] - Number of items per page
 */
router.get('/service-coordinator/:assignedSCID', memberDataController.getMembersByServiceCoordinator);

/**
 * @route GET /api/member-data/zone/:memberZone
 * @desc Get members by zone
 * @access Private
 * @param {string} memberZone - Member zone (SW, SE, NE, NW, LC)
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=20] - Number of items per page
 */
router.get('/zone/:memberZone', memberDataController.getMembersByZone);

/**
 * @route GET /api/member-data/stats/zone
 * @desc Get member statistics by zone
 * @access Private
 */
router.get('/stats/zone', memberDataController.getMemberStatsByZone);

export default router;