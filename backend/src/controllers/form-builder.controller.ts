/**
 * Form Builder Controller
 * 
 * Handles HTTP requests for form building functionality:
 * - Question management (text, select, yes/no types for MVP)
 * - Form template copying and versioning
 * - Form preview functionality
 * - Basic conditional logic for questions
 * 
 * Requirements: 1.1, 1.2, 1.6
 */

import { Request, Response } from 'express';
import { FormBuilderService } from '../services/form-builder.service';
import {
  QuestionSchema,
  ConditionalRuleSchema
} from '../types/validation-schemas';
import { z } from 'zod';

export class FormBuilderController {
  private formBuilderService: FormBuilderService;

  constructor() {
    this.formBuilderService = new FormBuilderService();
  }

  // ============================================================================
  // QUESTION TYPE LIBRARY
  // ============================================================================

  /**
   * GET /api/form-builder/question-types
   * Get available question types for form building
   */
  getQuestionTypeLibrary = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = this.formBuilderService.getQuestionTypeLibrary();

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
  // QUESTION MANAGEMENT
  // ============================================================================

  /**
   * POST /api/form-templates/:templateId/questions
   * Create a new question for a template
   */
  createQuestion = async (req: Request, res: Response): Promise<void> => {
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
      const validationResult = QuestionSchema.omit({ id: true }).safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid question data',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const result = await this.formBuilderService.createQuestion(
        templateId,
        tenantId,
        validationResult.data,
        userId
      );

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
   * PUT /api/form-templates/:templateId/questions/:questionId
   * Update an existing question in a template
   */
  updateQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateId, questionId } = req.params;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      // Validate request body (partial question update)
      const validationResult = QuestionSchema.partial().safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid question data',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const result = await this.formBuilderService.updateQuestion(
        templateId,
        tenantId,
        questionId,
        validationResult.data,
        userId
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.code === 'TEMPLATE_NOT_FOUND' ? 404 :
                          result.error?.code === 'QUESTION_NOT_FOUND' ? 404 : 400;
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
   * DELETE /api/form-templates/:templateId/questions/:questionId
   * Delete a question from a template
   */
  deleteQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateId, questionId } = req.params;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const result = await this.formBuilderService.deleteQuestion(
        templateId,
        tenantId,
        questionId,
        userId
      );

      if (result.success) {
        res.status(204).send();
      } else {
        const statusCode = result.error?.code === 'TEMPLATE_NOT_FOUND' ? 404 :
                          result.error?.code === 'QUESTION_NOT_FOUND' ? 404 : 400;
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
   * PUT /api/form-templates/:templateId/questions/reorder
   * Reorder questions in a template
   */
  reorderQuestions = async (req: Request, res: Response): Promise<void> => {
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
      const reorderSchema = z.object({
        questionOrder: z.array(z.object({
          questionId: z.string().uuid(),
          order: z.number().int().min(0)
        }))
      });

      const validationResult = reorderSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid reorder data',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const result = await this.formBuilderService.reorderQuestions(
        templateId,
        tenantId,
        validationResult.data.questionOrder,
        userId
      );

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

  // ============================================================================
  // TEMPLATE VERSIONING
  // ============================================================================

  /**
   * POST /api/form-templates/:templateId/versions
   * Create a new version of an existing template
   */
  createTemplateVersion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateId } = req.params;
      const { versionNotes } = req.body;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const result = await this.formBuilderService.createTemplateVersion(
        templateId,
        tenantId,
        versionNotes,
        userId
      );

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
   * GET /api/form-types/:typeId/templates/:templateName/versions
   * Get version history for a template
   */
  getTemplateVersionHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { typeId, templateName } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tenant ID required' }
        });
        return;
      }

      const result = await this.formBuilderService.getTemplateVersionHistory(
        templateName,
        typeId,
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
  // FORM PREVIEW
  // ============================================================================

  /**
   * GET /api/form-templates/:templateId/preview
   * Generate form preview for a template
   */
  generateFormPreview = async (req: Request, res: Response): Promise<void> => {
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

      // Parse sample data from query parameters if provided
      let sampleData: Record<string, any> | undefined;
      if (req.query.sampleData) {
        try {
          sampleData = JSON.parse(req.query.sampleData as string);
        } catch {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_SAMPLE_DATA',
              message: 'Sample data must be valid JSON'
            }
          });
          return;
        }
      }

      const result = await this.formBuilderService.generateFormPreview(
        templateId,
        tenantId,
        sampleData
      );

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

  // ============================================================================
  // CONDITIONAL LOGIC
  // ============================================================================

  /**
   * POST /api/form-templates/:templateId/validate-conditional-logic
   * Validate conditional logic rules for a template
   */
  validateConditionalLogic = async (req: Request, res: Response): Promise<void> => {
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

      // Validate request body
      const validationSchema = z.object({
        rules: z.array(ConditionalRuleSchema)
      });

      const validationResult = validationSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid conditional logic rules',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const result = await this.formBuilderService.validateConditionalLogic(
        templateId,
        tenantId,
        validationResult.data.rules
      );

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
   * POST /api/form-builder/apply-conditional-logic
   * Apply conditional logic to a set of questions with response data
   */
  applyConditionalLogic = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validationSchema = z.object({
        questions: z.array(QuestionSchema),
        responseData: z.record(z.any())
      });

      const validationResult = validationSchema.safeParse(req.body);

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

      const { questions, responseData } = validationResult.data;
      const visibleQuestions = this.formBuilderService.applyConditionalLogic(questions, responseData);

      res.status(200).json({
        success: true,
        data: {
          visibleQuestions,
          totalQuestions: questions.length,
          visibleCount: visibleQuestions.length,
          hiddenCount: questions.length - visibleQuestions.length
        },
        metadata: { timestamp: new Date() }
      });
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
   * POST /api/form-builder/validate-question
   * Validate question configuration
   */
  validateQuestionConfiguration = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validationResult = QuestionSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid question data',
            details: validationResult.error.errors
          }
        });
        return;
      }

      const validationResults = this.formBuilderService.validateQuestionConfiguration(validationResult.data);

      res.status(200).json({
        success: true,
        data: validationResults,
        metadata: { timestamp: new Date() }
      });
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