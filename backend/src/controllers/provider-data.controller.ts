import { Request, Response } from 'express';
import { ProviderDataService, ProviderSearchFilters } from '../services/provider-data.service';
import { PaginationParamsSchema } from '../types/validation-schemas';
import { z } from 'zod';

const ProviderSearchFiltersSchema = z.object({
  name: z.string().optional(),
  npi: z.string().optional(),
  taxonomy: z.string().optional(),
  providerEntity: z.string().optional(),
  providerType: z.string().optional(),
  providerTypeCode: z.string().optional(),
  organizationType: z.string().optional(),
  specialty: z.string().optional(),
  specialtyCode: z.string().optional(),
  subSpecialty: z.string().optional(),
  networkStatus: z.enum(['in_network', 'out_of_network', 'pending', 'terminated']).optional(),
  relationshipSpecialistName: z.string().optional(),
  lastUpdatedFrom: z.string().datetime().optional(),
  lastUpdatedTo: z.string().datetime().optional()
});

const QuickSearchSchema = z.object({
  query: z.string().min(1).max(255),
  limit: z.number().int().min(1).max(50).default(10)
});

export class ProviderDataController {
  private providerDataService: ProviderDataService;

  constructor(providerDataService: ProviderDataService) {
    this.providerDataService = providerDataService;
  }

  /**
   * Get provider by ID
   */
  getProviderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { providerId } = req.params;

      if (!providerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Provider ID is required'
          }
        });
        return;
      }

      const result = await this.providerDataService.getProviderById(providerId);

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
   * Get provider by NPI
   */
  getProviderByNPI = async (req: Request, res: Response): Promise<void> => {
    try {
      const { npi } = req.params;

      if (!npi || npi.length !== 10) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid 10-digit NPI is required'
          }
        });
        return;
      }

      const result = await this.providerDataService.getProviderByNPI(npi);

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
   * Search providers with filters and pagination
   */
  searchProviders = async (req: Request, res: Response): Promise<void> => {
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
      const filtersValidation = ProviderSearchFiltersSchema.safeParse(req.query);
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
      const filters: ProviderSearchFilters = {
        ...filtersValidation.data,
        lastUpdatedFrom: filtersValidation.data.lastUpdatedFrom 
          ? new Date(filtersValidation.data.lastUpdatedFrom) 
          : undefined,
        lastUpdatedTo: filtersValidation.data.lastUpdatedTo 
          ? new Date(filtersValidation.data.lastUpdatedTo) 
          : undefined
      };

      const result = await this.providerDataService.searchProviders(filters, page, limit);

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
   * Get providers by network status
   */
  getProvidersByNetworkStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { networkStatus } = req.params;

      if (!networkStatus || !['in_network', 'out_of_network', 'pending', 'terminated'].includes(networkStatus)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid network status is required (in_network, out_of_network, pending, terminated)'
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

      const result = await this.providerDataService.getProvidersByNetworkStatus(
        networkStatus as 'in_network' | 'out_of_network' | 'pending' | 'terminated', 
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
   * Get providers by specialty
   */
  getProvidersBySpecialty = async (req: Request, res: Response): Promise<void> => {
    try {
      const { specialty } = req.params;

      if (!specialty) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Specialty is required'
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

      const result = await this.providerDataService.getProvidersBySpecialty(
        specialty, 
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
   * Get providers by relationship specialist
   */
  getProvidersByRelationshipSpecialist = async (req: Request, res: Response): Promise<void> => {
    try {
      const { relationshipSpecialistName } = req.params;

      if (!relationshipSpecialistName) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Relationship specialist name is required'
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

      const result = await this.providerDataService.getProvidersByRelationshipSpecialist(
        relationshipSpecialistName, 
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
   * Quick search providers for form pre-population
   */
  quickSearchProviders = async (req: Request, res: Response): Promise<void> => {
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

      const { query, limit } = searchValidation.data;

      const result = await this.providerDataService.quickSearchProviders(query, limit);

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
   * Get provider statistics by network status
   */
  getProviderStatsByNetworkStatus = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.providerDataService.getProviderStatsByNetworkStatus();

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
   * Get provider statistics by specialty
   */
  getProviderStatsBySpecialty = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.providerDataService.getProviderStatsBySpecialty();

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

export default ProviderDataController;