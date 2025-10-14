/**
 * Member and Provider Lookup Controller
 * 
 * Handles HTTP requests for member and provider data management:
 * - Member and provider search with type-ahead
 * - Data pre-population for form instances
 * - Mock data generation for development and testing
 * - Staging data management
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

import { Request, Response } from 'express';
import { MemberProviderLookupService } from '../services/member-provider-lookup.service';
import {
  MemberDataSchema,
  ProviderDataSchema,
  MemberSearchSchema,
  ProviderSearchSchema
} from '../types/validation-schemas';
import { z } from 'zod';

export class MemberProviderLookupController {
  private memberProviderService: MemberProviderLookupService;

  constructor() {
    this.memberProviderService = new MemberProviderLookupService();
  }

  // ============================================================================
  // MEMBER SEARCH AND MANAGEMENT
  // ============================================================================

  /**
   * GET /api/members/search
   * Search members with type-ahead functionality
   */
  searchMembers = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      // Validate query parameters
      const validationResult = MemberSearchSchema.safeParse(req.query);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const { query, limit } = validationResult.data;

      const result = await this.memberProviderService.searchMembers(query, tenantId, limit);

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
   * GET /api/members/:memberId
   * Get member by ID
   */
  getMemberById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memberId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      const result = await this.memberProviderService.getMemberById(memberId, tenantId);

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
   * POST /api/members
   * Create or update member data
   */
  upsertMemberData = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      // Validate request body
      const validationResult = MemberDataSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid member data',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const result = await this.memberProviderService.upsertMemberData(validationResult.data, tenantId);

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
   * POST /api/members/bulk-import
   * Bulk import member data
   */
  bulkImportMembers = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      // Validate request body
      const validationSchema = z.object({
        members: z.array(MemberDataSchema)
      });

      const validationResult = validationSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid member data array',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const result = await this.memberProviderService.bulkImportMembers(
        validationResult.data.members,
        tenantId
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

  // ============================================================================
  // PROVIDER SEARCH AND MANAGEMENT
  // ============================================================================

  /**
   * GET /api/providers/search
   * Search providers with type-ahead functionality
   */
  searchProviders = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      // Validate query parameters
      const validationResult = ProviderSearchSchema.safeParse(req.query);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const { query, limit } = validationResult.data;

      const result = await this.memberProviderService.searchProviders(query, tenantId, limit);

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
   * GET /api/providers/:providerId
   * Get provider by ID
   */
  getProviderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { providerId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      const result = await this.memberProviderService.getProviderById(providerId, tenantId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'PROVIDER_NOT_FOUND' ? 404 : 400;
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
   * POST /api/providers
   * Create or update provider data
   */
  upsertProviderData = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      // Validate request body
      const validationResult = ProviderDataSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid provider data',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const result = await this.memberProviderService.upsertProviderData(validationResult.data, tenantId);

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
   * POST /api/providers/bulk-import
   * Bulk import provider data
   */
  bulkImportProviders = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      // Validate request body
      const validationSchema = z.object({
        providers: z.array(ProviderDataSchema)
      });

      const validationResult = validationSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid provider data array',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const result = await this.memberProviderService.bulkImportProviders(
        validationResult.data.providers,
        tenantId
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

  // ============================================================================
  // DATA PRE-POPULATION
  // ============================================================================

  /**
   * GET /api/pre-population
   * Get pre-population data for form instances
   */
  getPrePopulationData = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;
      const { memberId, providerId } = req.query;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      const result = await this.memberProviderService.getPrePopulationData(
        memberId as string,
        providerId as string,
        tenantId
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

  // ============================================================================
  // MOCK DATA GENERATION
  // ============================================================================

  /**
   * POST /api/mock-data/members
   * Generate mock member data for development and testing
   */
  generateMockMembers = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      // Validate request body
      const validationSchema = z.object({
        count: z.number().int().min(1).max(1000).default(50)
      });

      const validationResult = validationSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid count parameter',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const result = await this.memberProviderService.generateMockMembers(
        validationResult.data.count,
        tenantId
      );

      if (result.success) {
        res.status(201).json(result);
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
   * POST /api/mock-data/providers
   * Generate mock provider data for development and testing
   */
  generateMockProviders = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      // Validate request body
      const validationSchema = z.object({
        count: z.number().int().min(1).max(1000).default(25)
      });

      const validationResult = validationSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid count parameter',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const result = await this.memberProviderService.generateMockProviders(
        validationResult.data.count,
        tenantId
      );

      if (result.success) {
        res.status(201).json(result);
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

  // ============================================================================
  // UTILITY ENDPOINTS
  // ============================================================================

  /**
   * GET /api/staging-data/stats
   * Get staging data statistics
   */
  getStagingDataStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      const result = await this.memberProviderService.getStagingDataStats(tenantId);

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
   * DELETE /api/staging-data/clear
   * Clear staging data for a tenant (for testing purposes)
   */
  clearStagingData = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      // Only allow in development/test environments
      if (process.env.NODE_ENV === 'production') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Clear staging data is not allowed in production'
          }
        });
        return;
      }

      const result = await this.memberProviderService.clearStagingData(tenantId);

      if (result.success) {
        res.status(204).send();
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