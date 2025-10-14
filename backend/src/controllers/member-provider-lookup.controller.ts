import { Request, Response } from 'express';
import { MemberProviderLookupService, MemberProviderLookupFilters } from '../services/member-provider-lookup.service';
import { z } from 'zod';

const QuickSearchSchema = z.object({
  query: z.string().min(1).max(255),
  memberQuery: z.string().optional(),
  providerQuery: z.string().optional(),
  memberZone: z.enum(['SW', 'SE', 'NE', 'NW', 'LC']).optional(),
  providerNetworkStatus: z.enum(['in_network', 'out_of_network', 'pending', 'terminated']).optional(),
  providerSpecialty: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(10)
});

const MemberProviderValidationSchema = z.object({
  memberDataId: z.string().min(1),
  providerId: z.string().min(1)
});

export class MemberProviderLookupController {
  private lookupService: MemberProviderLookupService;

  constructor(lookupService: MemberProviderLookupService) {
    this.lookupService = lookupService;
  }

  /**
   * Quick search for both members and providers
   * Used for form pre-population dropdowns
   */
  quickSearch = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate search parameters
      const searchValidation = QuickSearchSchema.safeParse(req.query);
      if (!searchValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            details: searchValidation.error.errors
          }
        });
        return;
      }

      const { query, memberQuery, providerQuery, memberZone, providerNetworkStatus, providerSpecialty, limit } = searchValidation.data;

      const filters: MemberProviderLookupFilters = {
        memberQuery,
        providerQuery,
        memberZone,
        providerNetworkStatus,
        providerSpecialty,
        limit
      };

      const result = await this.lookupService.quickSearch(query, filters);

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
   * Quick search members only
   */
  quickSearchMembers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, memberZone, limit = 10 } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameter is required'
          }
        });
        return;
      }

      const result = await this.lookupService.quickSearchMembers(
        query,
        memberZone as 'SW' | 'SE' | 'NE' | 'NW' | 'LC' | undefined,
        parseInt(limit as string) || 10
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
   * Quick search providers only
   */
  quickSearchProviders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, networkStatus, specialty, limit = 10 } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameter is required'
          }
        });
        return;
      }

      const result = await this.lookupService.quickSearchProviders(
        query,
        networkStatus as 'in_network' | 'out_of_network' | 'pending' | 'terminated' | undefined,
        specialty as string | undefined,
        parseInt(limit as string) || 10
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
   * Get member and provider data for form pre-population
   */
  getMemberAndProvider = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memberDataId, providerId } = req.params;

      if (!memberDataId || !providerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Both memberDataId and providerId are required'
          }
        });
        return;
      }

      const result = await this.lookupService.getMemberAndProvider(memberDataId, providerId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'MEMBER_NOT_FOUND' || result.error?.code === 'PROVIDER_NOT_FOUND' ? 404 : 400;
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
   * Get providers by member zone
   */
  getProvidersByMemberZone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memberZone } = req.params;
      const { specialty, limit = 20 } = req.query;

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

      const result = await this.lookupService.getProvidersByMemberZone(
        memberZone as 'SW' | 'SE' | 'NE' | 'NW' | 'LC',
        specialty as string | undefined,
        parseInt(limit as string) || 20
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
   * Get members by service coordinator
   */
  getMembersByServiceCoordinator = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assignedSCID } = req.params;
      const { limit = 20 } = req.query;

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

      const result = await this.lookupService.getMembersByServiceCoordinator(
        assignedSCID,
        parseInt(limit as string) || 20
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
   * Validate member and provider combination
   */
  validateMemberProviderCombination = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validationResult = MemberProviderValidationSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const { memberDataId, providerId } = validationResult.data;

      const result = await this.lookupService.validateMemberProviderCombination(memberDataId, providerId);

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

export default MemberProviderLookupController;