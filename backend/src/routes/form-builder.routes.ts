/**
 * Form Builder Routes
 * 
 * Defines API routes for form building functionality:
 * - Question management (text, select, yes/no types for MVP)
 * - Form template copying and versioning
 * - Form preview functionality
 * - Basic conditional logic for questions
 * 
 * Requirements: 1.1, 1.2, 1.6
 */

import { Router } from 'express';
import { FormBuilderController } from '../controllers/form-builder.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const formBuilderController = new FormBuilderController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ============================================================================
// QUESTION TYPE LIBRARY
// ============================================================================

/**
 * Question Type Library Routes
 * Base path: /api/form-builder
 */

// GET /api/form-builder/question-types - Get available question types
router.get('/form-builder/question-types', formBuilderController.getQuestionTypeLibrary);

// ============================================================================
// QUESTION MANAGEMENT
// ============================================================================

/**
 * Question Management Routes
 * Base path: /api/form-templates/:templateId/questions
 */

// POST /api/form-templates/:templateId/questions - Create new question
router.post('/form-templates/:templateId/questions', formBuilderController.createQuestion);

// PUT /api/form-templates/:templateId/questions/:questionId - Update question
router.put('/form-templates/:templateId/questions/:questionId', formBuilderController.updateQuestion);

// DELETE /api/form-templates/:templateId/questions/:questionId - Delete question
router.delete('/form-templates/:templateId/questions/:questionId', formBuilderController.deleteQuestion);

// PUT /api/form-templates/:templateId/questions/reorder - Reorder questions
router.put('/form-templates/:templateId/questions/reorder', formBuilderController.reorderQuestions);

// ============================================================================
// TEMPLATE VERSIONING
// ============================================================================

/**
 * Template Versioning Routes
 */

// POST /api/form-templates/:templateId/versions - Create new template version
router.post('/form-templates/:templateId/versions', formBuilderController.createTemplateVersion);

// GET /api/form-types/:typeId/templates/:templateName/versions - Get version history
router.get('/form-types/:typeId/templates/:templateName/versions', formBuilderController.getTemplateVersionHistory);

// ============================================================================
// FORM PREVIEW
// ============================================================================

/**
 * Form Preview Routes
 */

// GET /api/form-templates/:templateId/preview - Generate form preview
router.get('/form-templates/:templateId/preview', formBuilderController.generateFormPreview);

// ============================================================================
// CONDITIONAL LOGIC
// ============================================================================

/**
 * Conditional Logic Routes
 */

// POST /api/form-templates/:templateId/validate-conditional-logic - Validate conditional logic
router.post('/form-templates/:templateId/validate-conditional-logic', formBuilderController.validateConditionalLogic);

// POST /api/form-builder/apply-conditional-logic - Apply conditional logic to questions
router.post('/form-builder/apply-conditional-logic', formBuilderController.applyConditionalLogic);

// ============================================================================
// UTILITY ROUTES
// ============================================================================

/**
 * Utility Routes for form building
 */

// POST /api/form-builder/validate-question - Validate question configuration
router.post('/form-builder/validate-question', formBuilderController.validateQuestionConfiguration);

export default router;