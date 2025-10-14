/**
 * Form Hierarchy Management Controller
 * 
 * Handles HTTP requests for the hierarchical form structure:
 * Categories → Types → Templates → Instances
 * 
 * Requirements: 1.1, 1.4, 9.1
 */

import { Request, Response } from 'express';
import { FormHierarchyService } from '../services/form-hierarchy.service';
import {
  PaginationParamsSchema,
  CreateFormCategorySchema,
  UpdateFormCategorySchema,
  CreateFormTypeSchema,
  UpdateFormTypeSchema,
  CreateFormTemplateSchema,
  UpdateFormTemplateSchema,
  CreateFormInstanceSchema,
  UpdateFormInstanceSchema,
  FormInstanceFilterSchema
} from '../types/validation-schemas';

export class FormHierarchyController {
  private formHierarchyService: FormHierarchyService;

  constructor() {
    this.formHierarchyService = new FormHierarchyService();
  }

  // ============================================================================
  // FORM CATEGORIES (Level 1)
  // ============================================================================

  /**
   * GET /api/form-categories
   * Get all form categories for a tenant
   */
  getFormCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      // Parse pagination parameters
      const paginationResult = PaginationParamsSchema.safeParse(req.query);
      const pagination = paginationResult.success ? paginationResult.data : undefined;

      // Parse filters
      const filters = {
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        name: req.query.name as string
      };

      const result = await this.formHierarchyService.getFormCategories(tenantId, pagination, filters);

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
   * GET /api/form-categories/:id
   * Get a specific form category by ID
   */
  getFormCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      const result = await this.formHierarchyService.getFormCategoryById(id, tenantId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'CATEGORY_NOT_FOUND' ? 404 : 400;
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
   * POST /api/form-categories
   * Create a new form category
   */
  createFormCategory = async (req: Request, res: Response): Promise<void> => {
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
      const validationResult = CreateFormCategorySchema.safeParse({
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

      const result = await this.formHierarchyService.createFormCategory(validationResult.data, userId);

      if (result.success) {
        res.status(201).json(result);
      } else {
        const statusCode = result.error?.code === 'CATEGORY_EXISTS' ? 409 : 400;
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
   * PUT /api/form-categories/:id
   * Update an existing form category
   */
  updateFormCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
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
      const validationResult = UpdateFormCategorySchema.safeParse({
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

      const result = await this.formHierarchyService.updateFormCategory(id, tenantId, validationResult.data, userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'CATEGORY_NOT_FOUND' ? 404 : 400;
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
   * DELETE /api/form-categories/:id
   * Delete a form category (soft delete)
   */
  deleteFormCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const result = await this.formHierarchyService.deleteFormCategory(id, tenantId, userId);

      if (result.success) {
        res.status(204).send();
      } else {
        const statusCode = result.error?.code === 'CATEGORY_NOT_FOUND' ? 404 : 400;
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

  // ============================================================================
  // FORM TYPES (Level 2)
  // ============================================================================

  /**
   * GET /api/form-categories/:categoryId/types
   * Get all form types for a category
   */
  getFormTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      // Parse pagination parameters
      const paginationResult = PaginationParamsSchema.safeParse(req.query);
      const pagination = paginationResult.success ? paginationResult.data : undefined;

      // Parse filters
      const filters = {
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        name: req.query.name as string
      };

      const result = await this.formHierarchyService.getFormTypes(categoryId, tenantId, pagination, filters);

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
   * GET /api/form-types/:id
   * Get a specific form type by ID
   */
  getFormTypeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      const result = await this.formHierarchyService.getFormTypeById(id, tenantId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'TYPE_NOT_FOUND' ? 404 : 400;
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
   * POST /api/form-categories/:categoryId/types
   * Create a new form type
   */
  createFormType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.params;
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
      const validationResult = CreateFormTypeSchema.safeParse({
        ...req.body,
        categoryId,
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

      const result = await this.formHierarchyService.createFormType(validationResult.data, userId);

      if (result.success) {
        res.status(201).json(result);
      } else {
        const statusCode = result.error?.code === 'TYPE_EXISTS' ? 409 : 
                          result.error?.code === 'CATEGORY_NOT_FOUND' ? 404 : 400;
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
   * PUT /api/form-types/:id
   * Update an existing form type
   */
  updateFormType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
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
      const validationResult = UpdateFormTypeSchema.safeParse({
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

      const result = await this.formHierarchyService.updateFormType(id, tenantId, validationResult.data, userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'TYPE_NOT_FOUND' ? 404 : 400;
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
   * DELETE /api/form-types/:id
   * Delete a form type (soft delete)
   */
  deleteFormType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const result = await this.formHierarchyService.deleteFormType(id, tenantId, userId);

      if (result.success) {
        res.status(204).send();
      } else {
        const statusCode = result.error?.code === 'TYPE_NOT_FOUND' ? 404 : 400;
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

  // ============================================================================
  // FORM TEMPLATES (Level 3)
  // ============================================================================

  /**
   * GET /api/form-types/:typeId/templates
   * Get all form templates for a type
   */
  getFormTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      const { typeId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      // Parse pagination parameters
      const paginationResult = PaginationParamsSchema.safeParse(req.query);
      const pagination = paginationResult.success ? paginationResult.data : undefined;

      // Parse filters
      const filters = {
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        name: req.query.name as string,
        version: req.query.version ? parseInt(req.query.version as string) : undefined
      };

      const result = await this.formHierarchyService.getFormTemplates(typeId, tenantId, pagination, filters);

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
   * GET /api/form-templates/:id
   * Get a specific form template by ID
   */
  getFormTemplateById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      const result = await this.formHierarchyService.getFormTemplateById(id, tenantId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'TEMPLATE_NOT_FOUND' ? 404 : 400;
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
   * GET /api/form-types/:typeId/templates/latest/:name
   * Get the latest version of a template by name
   */
  getLatestTemplateVersion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { typeId, name } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      const result = await this.formHierarchyService.getLatestTemplateVersion(name, typeId, tenantId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'TEMPLATE_NOT_FOUND' ? 404 : 400;
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
   * POST /api/form-types/:typeId/templates
   * Create a new form template
   */
  createFormTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { typeId } = req.params;
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
      const validationResult = CreateFormTemplateSchema.safeParse({
        ...req.body,
        typeId,
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

      const result = await this.formHierarchyService.createFormTemplate(validationResult.data, userId);

      if (result.success) {
        res.status(201).json(result);
      } else {
        const statusCode = result.error?.code === 'TYPE_NOT_FOUND' ? 404 : 400;
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
   * POST /api/form-templates/:id/copy
   * Copy an existing template
   */
  copyFormTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { newName, targetTypeId } = req.body;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const result = await this.formHierarchyService.copyFormTemplate(id, tenantId, newName, targetTypeId, userId);

      if (result.success) {
        res.status(201).json(result);
      } else {
        const statusCode = result.error?.code === 'TEMPLATE_NOT_FOUND' ? 404 : 400;
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
   * PUT /api/form-templates/:id
   * Update an existing form template
   */
  updateFormTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
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
      const validationResult = UpdateFormTemplateSchema.safeParse({
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

      const result = await this.formHierarchyService.updateFormTemplate(id, tenantId, validationResult.data, userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'TEMPLATE_NOT_FOUND' ? 404 : 400;
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
   * DELETE /api/form-templates/:id
   * Delete a form template (soft delete)
   */
  deleteFormTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const result = await this.formHierarchyService.deleteFormTemplate(id, tenantId, userId);

      if (result.success) {
        res.status(204).send();
      } else {
        const statusCode = result.error?.code === 'TEMPLATE_NOT_FOUND' ? 404 : 400;
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

  // ============================================================================
  // FORM INSTANCES (Level 4)
  // ============================================================================

  /**
   * GET /api/form-templates/:templateId/instances
   * Get all form instances for a template
   */
  getFormInstances = async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      // Parse pagination parameters
      const paginationResult = PaginationParamsSchema.safeParse(req.query);
      const pagination = paginationResult.success ? paginationResult.data : undefined;

      // Parse filters
      const filterResult = FormInstanceFilterSchema.safeParse(req.query);
      const filters = filterResult.success ? filterResult.data : {};

      const result = await this.formHierarchyService.getFormInstances(templateId, tenantId, pagination, filters);

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
   * GET /api/form-instances/:id
   * Get a specific form instance by ID
   */
  getFormInstanceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      const result = await this.formHierarchyService.getFormInstanceById(id, tenantId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'INSTANCE_NOT_FOUND' ? 404 : 400;
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
   * POST /api/form-templates/:templateId/instances
   * Create a new form instance
   */
  createFormInstance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateId } = req.params;
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
      const validationResult = CreateFormInstanceSchema.safeParse({
        ...req.body,
        templateId,
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

      const result = await this.formHierarchyService.createFormInstance(validationResult.data, userId);

      if (result.success) {
        res.status(201).json(result);
      } else {
        const statusCode = result.error?.code === 'TEMPLATE_NOT_FOUND' ? 404 : 
                          result.error?.code === 'DUPLICATE_INSTANCE' ? 409 : 400;
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
   * PUT /api/form-instances/:id
   * Update an existing form instance
   */
  updateFormInstance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
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
      const validationResult = UpdateFormInstanceSchema.safeParse({
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

      const result = await this.formHierarchyService.updateFormInstance(id, tenantId, validationResult.data, userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'INSTANCE_NOT_FOUND' ? 404 : 400;
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
   * DELETE /api/form-instances/:id
   * Delete a form instance (soft delete)
   */
  deleteFormInstance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const result = await this.formHierarchyService.deleteFormInstance(id, tenantId, userId);

      if (result.success) {
        res.status(204).send();
      } else {
        const statusCode = result.error?.code === 'INSTANCE_NOT_FOUND' ? 404 : 400;
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

  // ============================================================================
  // UTILITY ENDPOINTS
  // ============================================================================

  /**
   * GET /api/form-hierarchy/summary
   * Get form hierarchy summary for a tenant
   */
  getFormHierarchySummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      const result = await this.formHierarchyService.getFormHierarchySummary(tenantId);

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