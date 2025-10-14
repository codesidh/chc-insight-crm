/**
 * Form Hierarchy Management Routes
 * 
 * Defines API routes for the hierarchical form structure:
 * Categories → Types → Templates → Instances
 * 
 * Requirements: 1.1, 1.4, 9.1
 */

import { Router } from 'express';
import { FormHierarchyController } from '../controllers/form-hierarchy.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const formHierarchyController = new FormHierarchyController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ============================================================================
// FORM CATEGORIES (Level 1)
// ============================================================================

/**
 * Form Categories Routes
 * Base path: /api/form-categories
 */

// GET /api/form-categories - Get all form categories
router.get('/form-categories', formHierarchyController.getFormCategories);

// GET /api/form-categories/:id - Get specific form category
router.get('/form-categories/:id', formHierarchyController.getFormCategoryById);

// POST /api/form-categories - Create new form category
router.post('/form-categories', formHierarchyController.createFormCategory);

// PUT /api/form-categories/:id - Update form category
router.put('/form-categories/:id', formHierarchyController.updateFormCategory);

// DELETE /api/form-categories/:id - Delete form category (soft delete)
router.delete('/form-categories/:id', formHierarchyController.deleteFormCategory);

// ============================================================================
// FORM TYPES (Level 2)
// ============================================================================

/**
 * Form Types Routes
 * Base paths: 
 * - /api/form-categories/:categoryId/types (nested under category)
 * - /api/form-types/:id (direct access)
 */

// GET /api/form-categories/:categoryId/types - Get all form types for a category
router.get('/form-categories/:categoryId/types', formHierarchyController.getFormTypes);

// GET /api/form-types/:id - Get specific form type
router.get('/form-types/:id', formHierarchyController.getFormTypeById);

// POST /api/form-categories/:categoryId/types - Create new form type
router.post('/form-categories/:categoryId/types', formHierarchyController.createFormType);

// PUT /api/form-types/:id - Update form type
router.put('/form-types/:id', formHierarchyController.updateFormType);

// DELETE /api/form-types/:id - Delete form type (soft delete)
router.delete('/form-types/:id', formHierarchyController.deleteFormType);

// ============================================================================
// FORM TEMPLATES (Level 3)
// ============================================================================

/**
 * Form Templates Routes
 * Base paths:
 * - /api/form-types/:typeId/templates (nested under type)
 * - /api/form-templates/:id (direct access)
 */

// GET /api/form-types/:typeId/templates - Get all form templates for a type
router.get('/form-types/:typeId/templates', formHierarchyController.getFormTemplates);

// GET /api/form-templates/:id - Get specific form template
router.get('/form-templates/:id', formHierarchyController.getFormTemplateById);

// GET /api/form-types/:typeId/templates/latest/:name - Get latest version of template by name
router.get('/form-types/:typeId/templates/latest/:name', formHierarchyController.getLatestTemplateVersion);

// POST /api/form-types/:typeId/templates - Create new form template
router.post('/form-types/:typeId/templates', formHierarchyController.createFormTemplate);

// POST /api/form-templates/:id/copy - Copy existing template
router.post('/form-templates/:id/copy', formHierarchyController.copyFormTemplate);

// PUT /api/form-templates/:id - Update form template
router.put('/form-templates/:id', formHierarchyController.updateFormTemplate);

// DELETE /api/form-templates/:id - Delete form template (soft delete)
router.delete('/form-templates/:id', formHierarchyController.deleteFormTemplate);

// ============================================================================
// FORM INSTANCES (Level 4)
// ============================================================================

/**
 * Form Instances Routes
 * Base paths:
 * - /api/form-templates/:templateId/instances (nested under template)
 * - /api/form-instances/:id (direct access)
 */

// GET /api/form-templates/:templateId/instances - Get all form instances for a template
router.get('/form-templates/:templateId/instances', formHierarchyController.getFormInstances);

// GET /api/form-instances/:id - Get specific form instance
router.get('/form-instances/:id', formHierarchyController.getFormInstanceById);

// POST /api/form-templates/:templateId/instances - Create new form instance
router.post('/form-templates/:templateId/instances', formHierarchyController.createFormInstance);

// PUT /api/form-instances/:id - Update form instance
router.put('/form-instances/:id', formHierarchyController.updateFormInstance);

// DELETE /api/form-instances/:id - Delete form instance (soft delete)
router.delete('/form-instances/:id', formHierarchyController.deleteFormInstance);

// ============================================================================
// UTILITY ROUTES
// ============================================================================

/**
 * Utility Routes for form hierarchy management
 */

// GET /api/form-hierarchy/summary - Get form hierarchy summary
router.get('/form-hierarchy/summary', formHierarchyController.getFormHierarchySummary);

export default router;