/**
 * Form Builder Service
 * 
 * Handles form building functionality including:
 * - Question management (text, select, yes/no types for MVP)
 * - Form template copying and versioning
 * - Form preview functionality
 * - Basic conditional logic for questions
 * 
 * Requirements: 1.1, 1.2, 1.6
 */

import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import {
  Question,
  QuestionType,
  QuestionOption,
  ValidationRule,
  ConditionalRule,
  FormTemplate,
  ResponseData,
  ApiResponse
} from '../types';
import {
  QuestionSchema,
  QuestionOptionSchema,
  ValidationRuleSchema,
  ConditionalRuleSchema
} from '../types/validation-schemas';
import { DatabaseService } from './database.service';
import { FormHierarchyService } from './form-hierarchy.service';

export interface FormPreview {
  templateId: string;
  name: string;
  description?: string;
  questions: Question[];
  estimatedCompletionTime: number; // in minutes
  totalQuestions: number;
  requiredQuestions: number;
  conditionalQuestions: number;
}

export interface QuestionLibraryItem {
  type: QuestionType;
  label: string;
  description: string;
  icon: string;
  defaultConfig: Partial<Question>;
  supportedValidations: ValidationRule['type'][];
  supportsConditionalLogic: boolean;
}

export class FormBuilderService {
  private db: Knex;
  private formHierarchyService: FormHierarchyService;

  constructor() {
    this.db = DatabaseService.getInstance().getConnection();
    this.formHierarchyService = new FormHierarchyService();
  }

  // ============================================================================
  // QUESTION TYPE LIBRARY
  // ============================================================================

  /**
   * Get available question types for MVP (text, select, yes/no only)
   */
  getQuestionTypeLibrary(): ApiResponse<QuestionLibraryItem[]> {
    try {
      const questionTypes: QuestionLibraryItem[] = [
        {
          type: QuestionType.TEXT_INPUT,
          label: 'Text Input',
          description: 'Single line text input field',
          icon: 'type',
          defaultConfig: {
            type: QuestionType.TEXT_INPUT,
            required: false,
            validation: [
              { type: 'maxLength', value: 255, message: 'Text must be less than 255 characters' }
            ]
          },
          supportedValidations: ['required', 'minLength', 'maxLength', 'pattern', 'email', 'phone'],
          supportsConditionalLogic: true
        },
        {
          type: QuestionType.SINGLE_SELECT,
          label: 'Single Select',
          description: 'Dropdown or radio button selection',
          icon: 'list',
          defaultConfig: {
            type: QuestionType.SINGLE_SELECT,
            required: false,
            options: [
              { id: uuidv4(), label: 'Option 1', value: 'option1', order: 0 },
              { id: uuidv4(), label: 'Option 2', value: 'option2', order: 1 }
            ]
          },
          supportedValidations: ['required'],
          supportsConditionalLogic: true
        },
        {
          type: QuestionType.YES_NO,
          label: 'Yes/No',
          description: 'Boolean toggle or checkbox',
          icon: 'check-square',
          defaultConfig: {
            type: QuestionType.YES_NO,
            required: false,
            options: [
              { id: uuidv4(), label: 'Yes', value: 'yes', order: 0 },
              { id: uuidv4(), label: 'No', value: 'no', order: 1 }
            ]
          },
          supportedValidations: ['required'],
          supportsConditionalLogic: true
        },
        {
          type: QuestionType.SECTION_HEADER,
          label: 'Section Header',
          description: 'Organize form sections with headers',
          icon: 'heading',
          defaultConfig: {
            type: QuestionType.SECTION_HEADER,
            required: false,
            validation: []
          },
          supportedValidations: [],
          supportsConditionalLogic: false
        }
      ];

      return {
        success: true,
        data: questionTypes,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LIBRARY_FETCH_ERROR',
          message: 'Failed to fetch question type library',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  // ============================================================================
  // QUESTION MANAGEMENT
  // ============================================================================

  /**
   * Create a new question for a template
   */
  async createQuestion(
    templateId: string,
    tenantId: string,
    questionData: Omit<Question, 'id'>,
    userId: string
  ): Promise<ApiResponse<Question>> {
    try {
      // Validate question data
      const validatedQuestion = QuestionSchema.parse({
        ...questionData,
        id: uuidv4()
      });

      // Validate question options if present
      if (validatedQuestion.options) {
        validatedQuestion.options = validatedQuestion.options.map(option => 
          QuestionOptionSchema.parse(option)
        );
      }

      // Validate conditional logic if present
      if (validatedQuestion.conditionalLogic) {
        validatedQuestion.conditionalLogic = validatedQuestion.conditionalLogic.map(rule =>
          ConditionalRuleSchema.parse(rule)
        );
      }

      // Get current template
      const templateResult = await this.formHierarchyService.getFormTemplateById(templateId, tenantId);
      if (!templateResult.success || !templateResult.data) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Form template not found'
          }
        };
      }

      const template = templateResult.data;
      const templateData = JSON.parse(template.template_data || '{}');
      const currentQuestions = templateData.questions || [];

      // Add new question
      const updatedQuestions = [...currentQuestions, validatedQuestion];

      // Update template with new question
      const updateResult = await this.formHierarchyService.updateFormTemplate(
        templateId,
        tenantId,
        { questions: updatedQuestions },
        userId
      );

      if (!updateResult.success) {
        return updateResult;
      }

      return {
        success: true,
        data: validatedQuestion,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'QUESTION_CREATE_ERROR',
          message: 'Failed to create question',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Update an existing question in a template
   */
  async updateQuestion(
    templateId: string,
    tenantId: string,
    questionId: string,
    updates: Partial<Question>,
    userId: string
  ): Promise<ApiResponse<Question>> {
    try {
      // Get current template
      const templateResult = await this.formHierarchyService.getFormTemplateById(templateId, tenantId);
      if (!templateResult.success || !templateResult.data) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Form template not found'
          }
        };
      }

      const template = templateResult.data;
      const templateData = JSON.parse(template.template_data || '{}');
      const currentQuestions = templateData.questions || [];

      // Find and update question
      const questionIndex = currentQuestions.findIndex((q: Question) => q.id === questionId);
      if (questionIndex === -1) {
        return {
          success: false,
          error: {
            code: 'QUESTION_NOT_FOUND',
            message: 'Question not found in template'
          }
        };
      }

      const updatedQuestion = { ...currentQuestions[questionIndex], ...updates };

      // Validate updated question
      const validatedQuestion = QuestionSchema.parse(updatedQuestion);

      // Update questions array
      const updatedQuestions = [...currentQuestions];
      updatedQuestions[questionIndex] = validatedQuestion;

      // Update template
      const updateResult = await this.formHierarchyService.updateFormTemplate(
        templateId,
        tenantId,
        { questions: updatedQuestions },
        userId
      );

      if (!updateResult.success) {
        return updateResult;
      }

      return {
        success: true,
        data: validatedQuestion,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'QUESTION_UPDATE_ERROR',
          message: 'Failed to update question',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Delete a question from a template
   */
  async deleteQuestion(
    templateId: string,
    tenantId: string,
    questionId: string,
    userId: string
  ): Promise<ApiResponse<void>> {
    try {
      // Get current template
      const templateResult = await this.formHierarchyService.getFormTemplateById(templateId, tenantId);
      if (!templateResult.success || !templateResult.data) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Form template not found'
          }
        };
      }

      const template = templateResult.data;
      const templateData = JSON.parse(template.template_data || '{}');
      const currentQuestions = templateData.questions || [];

      // Remove question
      const updatedQuestions = currentQuestions.filter((q: Question) => q.id !== questionId);

      if (updatedQuestions.length === currentQuestions.length) {
        return {
          success: false,
          error: {
            code: 'QUESTION_NOT_FOUND',
            message: 'Question not found in template'
          }
        };
      }

      // Update template
      const updateResult = await this.formHierarchyService.updateFormTemplate(
        templateId,
        tenantId,
        { questions: updatedQuestions },
        userId
      );

      if (!updateResult.success) {
        return updateResult;
      }

      return {
        success: true,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'QUESTION_DELETE_ERROR',
          message: 'Failed to delete question',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Reorder questions in a template
   */
  async reorderQuestions(
    templateId: string,
    tenantId: string,
    questionOrder: { questionId: string; order: number }[],
    userId: string
  ): Promise<ApiResponse<Question[]>> {
    try {
      // Get current template
      const templateResult = await this.formHierarchyService.getFormTemplateById(templateId, tenantId);
      if (!templateResult.success || !templateResult.data) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Form template not found'
          }
        };
      }

      const template = templateResult.data;
      const templateData = JSON.parse(template.template_data || '{}');
      const currentQuestions = templateData.questions || [];

      // Create order map
      const orderMap = new Map(questionOrder.map(item => [item.questionId, item.order]));

      // Update question orders and sort
      const updatedQuestions = currentQuestions
        .map((question: Question) => ({
          ...question,
          order: orderMap.get(question.id) ?? question.order
        }))
        .sort((a: Question, b: Question) => a.order - b.order);

      // Update template
      const updateResult = await this.formHierarchyService.updateFormTemplate(
        templateId,
        tenantId,
        { questions: updatedQuestions },
        userId
      );

      if (!updateResult.success) {
        return updateResult;
      }

      return {
        success: true,
        data: updatedQuestions,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'QUESTION_REORDER_ERROR',
          message: 'Failed to reorder questions',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  // ============================================================================
  // TEMPLATE VERSIONING AND COPYING
  // ============================================================================

  /**
   * Create a new version of an existing template
   */
  async createTemplateVersion(
    sourceTemplateId: string,
    tenantId: string,
    versionNotes?: string,
    userId?: string
  ): Promise<ApiResponse<FormTemplate>> {
    try {
      // Get source template
      const sourceResult = await this.formHierarchyService.getFormTemplateById(sourceTemplateId, tenantId);
      if (!sourceResult.success || !sourceResult.data) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Source template not found'
          }
        };
      }

      const sourceTemplate = sourceResult.data;

      // Create new version using copy functionality
      const copyResult = await this.formHierarchyService.copyFormTemplate(
        sourceTemplateId,
        tenantId,
        sourceTemplate.name, // Same name for versioning
        sourceTemplate.type_id,
        userId || sourceTemplate.created_by
      );

      if (!copyResult.success) {
        return copyResult;
      }

      // Update description with version notes if provided
      if (versionNotes && copyResult.data) {
        const updateResult = await this.formHierarchyService.updateFormTemplate(
          copyResult.data.id,
          tenantId,
          { 
            description: versionNotes ? 
              `${sourceTemplate.description || ''}\n\nVersion Notes: ${versionNotes}`.trim() :
              sourceTemplate.description
          },
          userId || sourceTemplate.created_by
        );

        if (updateResult.success) {
          return updateResult;
        }
      }

      return copyResult;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VERSION_CREATE_ERROR',
          message: 'Failed to create template version',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get version history for a template
   */
  async getTemplateVersionHistory(
    templateName: string,
    typeId: string,
    tenantId: string
  ): Promise<ApiResponse<FormTemplate[]>> {
    try {
      const result = await this.formHierarchyService.getFormTemplates(
        typeId,
        tenantId,
        undefined,
        { name: templateName }
      );

      if (!result.success) {
        return result;
      }

      // Sort by version descending
      const sortedVersions = (result.data || []).sort((a, b) => b.version - a.version);

      return {
        success: true,
        data: sortedVersions,
        metadata: { 
          total: sortedVersions.length,
          timestamp: new Date() 
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VERSION_HISTORY_ERROR',
          message: 'Failed to fetch template version history',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  // ============================================================================
  // FORM PREVIEW FUNCTIONALITY
  // ============================================================================

  /**
   * Generate form preview for a template
   */
  async generateFormPreview(
    templateId: string,
    tenantId: string,
    sampleData?: Record<string, any>
  ): Promise<ApiResponse<FormPreview>> {
    try {
      // Get template
      const templateResult = await this.formHierarchyService.getFormTemplateById(templateId, tenantId);
      if (!templateResult.success || !templateResult.data) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Form template not found'
          }
        };
      }

      const template = templateResult.data;
      const templateData = JSON.parse(template.template_data || '{}');
      const questions = templateData.questions || [];

      // Calculate preview metrics
      const totalQuestions = questions.length;
      const requiredQuestions = questions.filter((q: Question) => q.required).length;
      const conditionalQuestions = questions.filter((q: Question) => 
        q.conditionalLogic && q.conditionalLogic.length > 0
      ).length;

      // Estimate completion time (rough calculation)
      const estimatedCompletionTime = this.calculateEstimatedCompletionTime(questions);

      // Apply conditional logic if sample data provided
      let visibleQuestions = questions;
      if (sampleData) {
        visibleQuestions = this.applyConditionalLogic(questions, sampleData);
      }

      const preview: FormPreview = {
        templateId: template.id,
        name: template.name,
        description: template.description,
        questions: visibleQuestions,
        estimatedCompletionTime,
        totalQuestions,
        requiredQuestions,
        conditionalQuestions
      };

      return {
        success: true,
        data: preview,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PREVIEW_GENERATE_ERROR',
          message: 'Failed to generate form preview',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  // ============================================================================
  // CONDITIONAL LOGIC ENGINE
  // ============================================================================

  /**
   * Apply conditional logic to determine visible questions
   */
  applyConditionalLogic(questions: Question[], responseData: Record<string, any>): Question[] {
    const visibleQuestions: Question[] = [];
    const responseMap = new Map(Object.entries(responseData));

    for (const question of questions) {
      let isVisible = true;

      // Check conditional logic rules
      if (question.conditionalLogic && question.conditionalLogic.length > 0) {
        isVisible = this.evaluateConditionalRules(question.conditionalLogic, responseMap);
      }

      if (isVisible) {
        visibleQuestions.push(question);
      }
    }

    return visibleQuestions;
  }

  /**
   * Evaluate conditional rules for a question
   */
  private evaluateConditionalRules(
    rules: ConditionalRule[],
    responseMap: Map<string, any>
  ): boolean {
    // For MVP, we'll use simple AND logic (all rules must pass)
    return rules.every(rule => this.evaluateCondition(rule.condition, responseMap));
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: ConditionalRule['condition'],
    responseMap: Map<string, any>
  ): boolean {
    const responseValue = responseMap.get(condition.questionId);

    if (responseValue === undefined || responseValue === null) {
      return false;
    }

    switch (condition.operator) {
      case 'equals':
        return responseValue === condition.value;
      case 'not_equals':
        return responseValue !== condition.value;
      case 'contains':
        return String(responseValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'greater_than':
        return Number(responseValue) > Number(condition.value);
      case 'less_than':
        return Number(responseValue) < Number(condition.value);
      default:
        return false;
    }
  }

  /**
   * Validate conditional logic rules
   */
  async validateConditionalLogic(
    templateId: string,
    tenantId: string,
    rules: ConditionalRule[]
  ): Promise<ApiResponse<{ isValid: boolean; errors: string[] }>> {
    try {
      // Get template to validate question references
      const templateResult = await this.formHierarchyService.getFormTemplateById(templateId, tenantId);
      if (!templateResult.success || !templateResult.data) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Form template not found'
          }
        };
      }

      const template = templateResult.data;
      const templateData = JSON.parse(template.template_data || '{}');
      const questions = templateData.questions || [];
      const questionIds = new Set(questions.map((q: Question) => q.id));

      const errors: string[] = [];

      for (const rule of rules) {
        // Validate referenced question exists
        if (!questionIds.has(rule.condition.questionId)) {
          errors.push(`Referenced question ${rule.condition.questionId} does not exist`);
        }

        // Validate target questions exist
        for (const targetId of rule.targetQuestionIds) {
          if (!questionIds.has(targetId)) {
            errors.push(`Target question ${targetId} does not exist`);
          }
        }

        // Check for circular dependencies (basic check)
        if (rule.targetQuestionIds.includes(rule.condition.questionId)) {
          errors.push(`Circular dependency detected: question cannot reference itself`);
        }
      }

      return {
        success: true,
        data: {
          isValid: errors.length === 0,
          errors
        },
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to validate conditional logic',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate estimated completion time for a form
   */
  private calculateEstimatedCompletionTime(questions: Question[]): number {
    let totalMinutes = 0;

    for (const question of questions) {
      switch (question.type) {
        case QuestionType.TEXT_INPUT:
          totalMinutes += 0.5; // 30 seconds per text input
          break;
        case QuestionType.SINGLE_SELECT:
        case QuestionType.YES_NO:
          totalMinutes += 0.25; // 15 seconds per selection
          break;
        case QuestionType.SECTION_HEADER:
          totalMinutes += 0.1; // 6 seconds to read header
          break;
        default:
          totalMinutes += 0.5;
      }
    }

    // Add base time for form loading and submission
    totalMinutes += 1;

    return Math.ceil(totalMinutes);
  }

  /**
   * Validate question configuration
   */
  validateQuestionConfiguration(question: Question): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate question type specific requirements
    switch (question.type) {
      case QuestionType.SINGLE_SELECT:
      case QuestionType.YES_NO:
        if (!question.options || question.options.length === 0) {
          errors.push('Selection questions must have at least one option');
        }
        break;
      case QuestionType.TEXT_INPUT:
        // Text inputs are always valid for MVP
        break;
      case QuestionType.SECTION_HEADER:
        if (!question.text || question.text.trim().length === 0) {
          errors.push('Section headers must have text');
        }
        break;
    }

    // Validate conditional logic references
    if (question.conditionalLogic) {
      for (const rule of question.conditionalLogic) {
        if (!rule.condition.questionId) {
          errors.push('Conditional logic must reference a valid question');
        }
        if (!rule.targetQuestionIds || rule.targetQuestionIds.length === 0) {
          errors.push('Conditional logic must specify target questions');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}