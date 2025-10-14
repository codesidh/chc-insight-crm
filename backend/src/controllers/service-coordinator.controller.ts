import { Request, Response } from 'express';
import { ServiceCoordinatorService, ServiceCoordinatorSearchFilters, CreateServiceCoordinatorRequest, UpdateServiceCoordinatorRequest } from '../services/service-coordinator.service';
import { PaginationParamsSchema, CreateServiceCoordinatorSchema, UpdateServiceCoordinatorSchema } from '../types/validation-schemas';
import { z } from 'zod';

const ServiceCoordinatorSearchFiltersSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  organization: z.string().optional(),
  zone: z.enum(['SW', 'SE', 'NE', 'NW', 'LC']).optional(),
  supervisorId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  directorId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  specializations: z.array(z.string()).optional(),
  maxCaseloadMin: z.number().int().min(0).optional(),
  maxCaseloadMax: z.number().int().min(0).optional(),
  currentCaseloadMin: z.number().int().min(0).optional(),
  currentCaseloadMax: z.number().int().min(0).optional(),
  hireDateFrom: z.string().datetime().optional(),
  hireDateTo: z.string().datetime().optional()
});

const UpdateCaseloadSchema = z.object({
  newCaseload: z.number().int().min(0),
  updatedBy: z.string().uuid()
});

export class ServiceCoordinatorController {
  private serviceCoordinatorService: ServiceCoordinatorService;

  constructor(serviceCoordinatorService: ServiceCoordinatorService) {
    this.serviceCoordinatorService = serviceCoordinatorService;
  }

  /**
   * Create a new service coordinator
   */
  createServiceCoordinator = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      // Validate request body
      const validationResult = CreateServiceCoordinatorSchema.safeParse({
        ...req.body,
        tenantId,
        createdBy: userId
      });

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

      const createRequest: CreateServiceCoordinatorRequest = {
        ...validationResult.data,
        tenantId,
        createdBy: userId
      };

      const result = await this.serviceCoordinatorService.createServiceCoordinator(createRequest);

      if (result.success) {
        res.status(201).json(result);
      } else {
        const statusCode = result.error?.code === 'SC_EXISTS' || result.error?.code === 'EMAIL_EXISTS' ? 409 : 400;
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
   * Update service coordinator information
   */
  updateServiceCoordinator = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      if (!scId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Service Coordinator ID is required'
          }
        });
        return;
      }

      // Validate request body
      const validationResult = UpdateServiceCoordinatorSchema.safeParse({
        ...req.body,
        updatedBy: userId
      });

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

      const updateRequest: UpdateServiceCoordinatorRequest = {
        ...validationResult.data,
        updatedBy: userId
      };

      const result = await this.serviceCoordinatorService.updateServiceCoordinator(scId, updateRequest);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'SC_NOT_FOUND' ? 404 : 
                          result.error?.code === 'EMAIL_EXISTS' ? 409 : 400;
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
   * Get service coordinator by ID
   */
  getServiceCoordinatorById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scId } = req.params;

      if (!scId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Service Coordinator ID is required'
          }
        });
        return;
      }

      const result = await this.serviceCoordinatorService.getServiceCoordinatorById(scId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'SC_NOT_FOUND' ? 404 : 400;
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
   * Get service coordinator by SCID
   */
  getServiceCoordinatorBySCID = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scid } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      if (!scid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Service Coordinator ID (SCID) is required'
          }
        });
        return;
      }

      const result = await this.serviceCoordinatorService.getServiceCoordinatorBySCID(scid, tenantId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'SC_NOT_FOUND' ? 404 : 400;
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
   * Search service coordinators with filters and pagination
   */
  searchServiceCoordinators = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
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

      // Validate search filters
      const filtersValidation = ServiceCoordinatorSearchFiltersSchema.safeParse(req.query);
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
      const filters: ServiceCoordinatorSearchFilters = {
        ...filtersValidation.data,
        hireDateFrom: filtersValidation.data.hireDateFrom 
          ? new Date(filtersValidation.data.hireDateFrom) 
          : undefined,
        hireDateTo: filtersValidation.data.hireDateTo 
          ? new Date(filtersValidation.data.hireDateTo) 
          : undefined
      };

      const result = await this.serviceCoordinatorService.searchServiceCoordinators(tenantId, filters, page, limit);

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
   * Get service coordinators by zone
   */
  getServiceCoordinatorsByZone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { zone } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      if (!zone || !['SW', 'SE', 'NE', 'NW', 'LC'].includes(zone)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid zone is required (SW, SE, NE, NW, LC)'
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

      const result = await this.serviceCoordinatorService.getServiceCoordinatorsByZone(
        tenantId,
        zone as 'SW' | 'SE' | 'NE' | 'NW' | 'LC',
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
   * Update service coordinator caseload
   */
  updateCaseload = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      if (!scId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Service Coordinator ID is required'
          }
        });
        return;
      }

      // Validate request body
      const validationResult = UpdateCaseloadSchema.safeParse({
        ...req.body,
        updatedBy: userId
      });

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

      const { newCaseload } = validationResult.data;

      const result = await this.serviceCoordinatorService.updateCaseload(scId, newCaseload, userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'SC_NOT_FOUND' ? 404 : 400;
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
   * Get service coordinator hierarchy
   */
  getServiceCoordinatorHierarchy = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scId } = req.params;

      if (!scId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Service Coordinator ID is required'
          }
        });
        return;
      }

      const result = await this.serviceCoordinatorService.getServiceCoordinatorHierarchy(scId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'SC_NOT_FOUND' ? 404 : 400;
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
}

export default ServiceCoordinatorController;