import { Request, Response } from 'express';
import { MemberDataService, MemberSearchFilters } from '../services/member-data.service';
import { PaginationParamsSchema } from '../types/validation-schemas';
import { z } from 'zod';

const MemberSearchFiltersSchema = z.object({
  medicaidId: z.string().optional(),
  hcinId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  planCategory: z.enum(['Medical', 'RX', 'Vision']).optional(),
  planType: z.enum(['NFCE', 'NFI']).optional(),
  planSubType: z.enum(['HCBS', 'NF', 'NFI']).optional(),
  waiverCode: z.enum(['20', '37', '38', '39']).optional(),
  aligned: z.enum(['Y', 'N']).optional(),
  planDual: z.enum(['Y', 'N']).optional(),
  dsnpName: z.enum(['Amerihealth', 'Keystone First', 'Aetna', 'UPMC', 'PHW']).optional(),
  memberZone: z.enum(['SW', 'SE', 'NE', 'NW', 'LC']).optional(),
  assignedSCID: z.string().optional(),
  scZone: z.string().optional(),
  picsScoreMin: z.number().min(0).max(100).optional(),
  picsScoreMax: z.number().min(0).max(100).optional(),
  eligEffectiveDateFrom: z.string().datetime().optional(),
  eligEffectiveDateTo: z.string().datetime().optional(),
  waiverEffectiveDateFrom: z.string().datetime().optional(),
  waiverEffectiveDateTo: z.string().datetime().optional()
});

export class MemberDataController {
  private memberDataService: MemberDataService;

  constructor(memberDataService: MemberDataService) {
    this.memberDataService = memberDataService;
  }

  /**
   * Get member by member data ID
   */
  getMemberById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memberDataId } = req.params;

      if (!memberDataId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Member data ID is required'
          }
        });
        return;
      }

      const result = await this.memberDataService.getMemberById(memberDataId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'MEMBER_NOT_FOUND' ? 404 : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      });
    }
  };

  /**
   * Get member by Medicaid ID
   */
  getMemberByMedicaidId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { medicaidId } = req.params;

      if (!medicaidId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Medicaid ID is required'
          }
        });
        return;
      }

      const result = await this.memberDataService.getMemberByMedicaidId(medicaidId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'MEMBER_NOT_FOUND' ? 404 : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      });
    }
  };

  /**
   * Get member by HCIN ID
   */
  getMemberByHcinId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { hcinId } = req.params;

      if (!hcinId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'HCIN ID is required'
          }
        });
        return;
      }

      const result = await this.memberDataService.getMemberByHcinId(hcinId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'MEMBER_NOT_FOUND' ? 404 : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      });
    }
  };

  /**
   * Search members with filters and pagination
   */
  searchMembers = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate pagination parameters
      const paginationValidation = PaginationParamsSchema.safeParse(req.query);
      if (!paginationValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid pagination parameters',
            details: paginationValidation.error.errors
          }
        });
        return;
      }

      // Validate search filters
      const filtersValidation = MemberSearchFiltersSchema.safeParse(req.query);
      if (!filtersValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search filters',
            details: filtersValidation.error.errors
          }
        });
        return;
      }

      const { page, limit } = paginationValidation.data;
      const filters: MemberSearchFilters = {
        ...filtersValidation.data,
        eligEffectiveDateFrom: filtersValidation.data.eligEffectiveDateFrom 
          ? new Date(filtersValidation.data.eligEffectiveDateFrom) 
          : undefined,
        eligEffectiveDateTo: filtersValidation.data.eligEffectiveDateTo 
          ? new Date(filtersValidation.data.eligEffectiveDateTo) 
          : undefined,
        waiverEffectiveDateFrom: filtersValidation.data.waiverEffectiveDateFrom 
          ? new Date(filtersValidation.data.waiverEffectiveDateFrom) 
          : undefined,
        waiverEffectiveDateTo: filtersValidation.data.waiverEffectiveDateTo 
          ? new Date(filtersValidation.data.waiverEffectiveDateTo) 
          : undefined
      };

      const result = await this.memberDataService.searchMembers(filters, page, limit);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      });
    }
  };

  /**
   * Get members by Service Coordinator ID
   */
  getMembersByServiceCoordinator = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assignedSCID } = req.params;

      if (!assignedSCID) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Service Coordinator ID is required'
          }
        });
        return;
      }

      // Validate pagination parameters
      const paginationValidation = PaginationParamsSchema.safeParse(req.query);
      if (!paginationValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid pagination parameters',
            details: paginationValidation.error.errors
          }
        });
        return;
      }

      const { page, limit } = paginationValidation.data;

      const result = await this.memberDataService.getMembersByServiceCoordinator(
        assignedSCID, 
        page, 
        limit
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      });
    }
  };

  /**
   * Get members by zone
   */
  getMembersByZone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memberZone } = req.params;

      if (!memberZone || !['SW', 'SE', 'NE', 'NW', 'LC'].includes(memberZone)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid member zone is required (SW, SE, NE, NW, LC)'
          }
        });
        return;
      }

      // Validate pagination parameters
      const paginationValidation = PaginationParamsSchema.safeParse(req.query);
      if (!paginationValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid pagination parameters',
            details: paginationValidation.error.errors
          }
        });
        return;
      }

      const { page, limit } = paginationValidation.data;

      const result = await this.memberDataService.getMembersByZone(
        memberZone as 'SW' | 'SE' | 'NE' | 'NW' | 'LC', 
        page, 
        limit
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      });
    }
  };

  /**
   * Get member statistics by zone
   */
  getMemberStatsByZone = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.memberDataService.getMemberStatsByZone();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      });
    }
  };
}

export default MemberDataController;