/**
 * Form Hierarchy Management Service
 * 
 * Handles CRUD operations for the hierarchical form structure:
 * Categories → Types → Templates → Instances
 * 
 * Requirements: 1.1, 1.4, 9.1
 */

import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import {
  FormCategory,
  FormType,
  FormTemplate,
  FormInstance,
  FormCategoryType,
  FormStatus,
  CreateFormCategorySchema,
  UpdateFormCategorySchema,
  CreateFormTypeSchema,
  UpdateFormTypeSchema,
  CreateFormTemplateSchema,
  UpdateFormTemplateSchema,
  CreateFormInstanceSchema,
  UpdateFormInstanceSchema,
  PaginationParams,
  FilterParams,
  ApiResponse
} from '../types';
import { DatabaseService } from './database.service';

export class FormHierarchyService {
  private db: Knex;

  constructor() {
    this.db = DatabaseService.getInstance().getConnection();
  }

  // ============================================================================
  // FORM CATEGORIES (Level 1)
  // ============================================================================

  /**
   * Get all form categories for a tenant
   */
  async getFormCategories(
    tenantId: string,
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<FormCategory[]>> {
    try {
      let query = this.db('form_categories')
        .where('tenant_id', tenantId)
        .orderBy('name');

      // Apply filters
      if (filters?.isActive !== undefined) {
        query = query.where('is_active', filters.isActive);
      }

      if (filters?.name) {
        query = query.where('name', 'ilike', `%${filters.name}%`);
      }

      // Apply pagination
      if (pagination) {
        const offset = (pagination.page - 1) * pagination.limit;
        query = query.offset(offset).limit(pagination.limit);
      }

      const categories = await query;
      const total = await this.db('form_categories')
        .where('tenant_id', tenantId)
        .count('* as count')
        .first();

      return {
        success: true,
        data: categories,
        metadata: {
          total: parseInt(total?.count as string) || 0,
          page: pagination?.page || 1,
          limit: pagination?.limit || categories.length,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CATEGORY_FETCH_ERROR',
          message: 'Failed to fetch form categories',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get a specific form category by ID
   */
  async getFormCategoryById(id: string, tenantId: string): Promise<ApiResponse<FormCategory>> {
    try {
      const category = await this.db('form_categories')
        .where({ id, tenant_id: tenantId })
        .first();

      if (!category) {
        return {
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Form category not found'
          }
        };
      }

      return {
        success: true,
        data: category,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CATEGORY_FETCH_ERROR',
          message: 'Failed to fetch form category',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Create a new form category
   */
  async createFormCategory(
    categoryData: Omit<FormCategory, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<ApiResponse<FormCategory>> {
    try {
      // Validate input
      const validatedData = CreateFormCategorySchema.parse({
        ...categoryData,
        createdBy: userId
      });

      // Check if category already exists
      const existing = await this.db('form_categories')
        .where({
          tenant_id: validatedData.tenantId,
          name: validatedData.name
        })
        .first();

      if (existing) {
        return {
          success: false,
          error: {
            code: 'CATEGORY_EXISTS',
            message: 'Form category with this name already exists'
          }
        };
      }

      const categoryId = uuidv4();
      const now = new Date();

      const newCategory = {
        id: categoryId,
        tenant_id: validatedData.tenantId,
        name: validatedData.name,
        description: validatedData.description,
        is_active: validatedData.isActive,
        created_by: userId,
        created_at: now,
        updated_at: now
      };

      await this.db('form_categories').insert(newCategory);

      const created = await this.db('form_categories')
        .where('id', categoryId)
        .first();

      return {
        success: true,
        data: created,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CATEGORY_CREATE_ERROR',
          message: 'Failed to create form category',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Update an existing form category
   */
  async updateFormCategory(
    id: string,
    tenantId: string,
    updates: Partial<FormCategory>,
    userId: string
  ): Promise<ApiResponse<FormCategory>> {
    try {
      // Validate input
      const validatedUpdates = UpdateFormCategorySchema.parse({
        ...updates,
        updatedBy: userId
      });

      // Check if category exists
      const existing = await this.db('form_categories')
        .where({ id, tenant_id: tenantId })
        .first();

      if (!existing) {
        return {
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Form category not found'
          }
        };
      }

      const updateData = {
        ...validatedUpdates,
        updated_by: userId,
        updated_at: new Date()
      };

      await this.db('form_categories')
        .where({ id, tenant_id: tenantId })
        .update(updateData);

      const updated = await this.db('form_categories')
        .where('id', id)
        .first();

      return {
        success: true,
        data: updated,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CATEGORY_UPDATE_ERROR',
          message: 'Failed to update form category',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Delete a form category (soft delete by setting is_active to false)
   */
  async deleteFormCategory(id: string, tenantId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      // Check if category exists
      const existing = await this.db('form_categories')
        .where({ id, tenant_id: tenantId })
        .first();

      if (!existing) {
        return {
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Form category not found'
          }
        };
      }

      // Check if category has active form types
      const activeTypes = await this.db('form_types')
        .where({ category_id: id, is_active: true })
        .count('* as count')
        .first();

      if (parseInt(activeTypes?.count as string) > 0) {
        return {
          success: false,
          error: {
            code: 'CATEGORY_HAS_ACTIVE_TYPES',
            message: 'Cannot delete category with active form types'
          }
        };
      }

      // Soft delete
      await this.db('form_categories')
        .where({ id, tenant_id: tenantId })
        .update({
          is_active: false,
          updated_by: userId,
          updated_at: new Date()
        });

      return {
        success: true,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CATEGORY_DELETE_ERROR',
          message: 'Failed to delete form category',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  // ============================================================================
  // FORM TYPES (Level 2)
  // ============================================================================

  /**
   * Get all form types for a category
   */
  async getFormTypes(
    categoryId: string,
    tenantId: string,
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<FormType[]>> {
    try {
      let query = this.db('form_types')
        .where({ category_id: categoryId, tenant_id: tenantId })
        .orderBy('name');

      // Apply filters
      if (filters?.isActive !== undefined) {
        query = query.where('is_active', filters.isActive);
      }

      if (filters?.name) {
        query = query.where('name', 'ilike', `%${filters.name}%`);
      }

      // Apply pagination
      if (pagination) {
        const offset = (pagination.page - 1) * pagination.limit;
        query = query.offset(offset).limit(pagination.limit);
      }

      const types = await query;
      const total = await this.db('form_types')
        .where({ category_id: categoryId, tenant_id: tenantId })
        .count('* as count')
        .first();

      return {
        success: true,
        data: types,
        metadata: {
          total: parseInt(total?.count as string) || 0,
          page: pagination?.page || 1,
          limit: pagination?.limit || types.length,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TYPE_FETCH_ERROR',
          message: 'Failed to fetch form types',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get a specific form type by ID
   */
  async getFormTypeById(id: string, tenantId: string): Promise<ApiResponse<FormType>> {
    try {
      const type = await this.db('form_types')
        .where({ id, tenant_id: tenantId })
        .first();

      if (!type) {
        return {
          success: false,
          error: {
            code: 'TYPE_NOT_FOUND',
            message: 'Form type not found'
          }
        };
      }

      return {
        success: true,
        data: type,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TYPE_FETCH_ERROR',
          message: 'Failed to fetch form type',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Create a new form type
   */
  async createFormType(
    typeData: Omit<FormType, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<ApiResponse<FormType>> {
    try {
      // Validate input
      const validatedData = CreateFormTypeSchema.parse({
        ...typeData,
        createdBy: userId
      });

      // Check if category exists
      const category = await this.db('form_categories')
        .where({ id: validatedData.categoryId, tenant_id: validatedData.tenantId })
        .first();

      if (!category) {
        return {
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Parent form category not found'
          }
        };
      }

      // Check if type already exists in this category
      const existing = await this.db('form_types')
        .where({
          category_id: validatedData.categoryId,
          name: validatedData.name
        })
        .first();

      if (existing) {
        return {
          success: false,
          error: {
            code: 'TYPE_EXISTS',
            message: 'Form type with this name already exists in this category'
          }
        };
      }

      const typeId = uuidv4();
      const now = new Date();

      const newType = {
        id: typeId,
        category_id: validatedData.categoryId,
        tenant_id: validatedData.tenantId,
        name: validatedData.name,
        description: validatedData.description,
        business_rules: JSON.stringify(validatedData.businessRules || []),
        is_active: validatedData.isActive,
        created_by: userId,
        created_at: now,
        updated_at: now
      };

      await this.db('form_types').insert(newType);

      const created = await this.db('form_types')
        .where('id', typeId)
        .first();

      return {
        success: true,
        data: created,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TYPE_CREATE_ERROR',
          message: 'Failed to create form type',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Update an existing form type
   */
  async updateFormType(
    id: string,
    tenantId: string,
    updates: Partial<FormType>,
    userId: string
  ): Promise<ApiResponse<FormType>> {
    try {
      // Validate input
      const validatedUpdates = UpdateFormTypeSchema.parse({
        ...updates,
        updatedBy: userId
      });

      // Check if type exists
      const existing = await this.db('form_types')
        .where({ id, tenant_id: tenantId })
        .first();

      if (!existing) {
        return {
          success: false,
          error: {
            code: 'TYPE_NOT_FOUND',
            message: 'Form type not found'
          }
        };
      }

      const updateData: any = {
        updated_by: userId,
        updated_at: new Date()
      };

      // Handle specific fields
      if (validatedUpdates.name) updateData.name = validatedUpdates.name;
      if (validatedUpdates.description !== undefined) updateData.description = validatedUpdates.description;
      if (validatedUpdates.businessRules) updateData.business_rules = JSON.stringify(validatedUpdates.businessRules);
      if (validatedUpdates.isActive !== undefined) updateData.is_active = validatedUpdates.isActive;

      await this.db('form_types')
        .where({ id, tenant_id: tenantId })
        .update(updateData);

      const updated = await this.db('form_types')
        .where('id', id)
        .first();

      return {
        success: true,
        data: updated,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TYPE_UPDATE_ERROR',
          message: 'Failed to update form type',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Delete a form type (soft delete)
   */
  async deleteFormType(id: string, tenantId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      // Check if type exists
      const existing = await this.db('form_types')
        .where({ id, tenant_id: tenantId })
        .first();

      if (!existing) {
        return {
          success: false,
          error: {
            code: 'TYPE_NOT_FOUND',
            message: 'Form type not found'
          }
        };
      }

      // Check if type has active templates
      const activeTemplates = await this.db('form_templates')
        .where({ type_id: id, is_active: true })
        .count('* as count')
        .first();

      if (parseInt(activeTemplates?.count as string) > 0) {
        return {
          success: false,
          error: {
            code: 'TYPE_HAS_ACTIVE_TEMPLATES',
            message: 'Cannot delete form type with active templates'
          }
        };
      }

      // Soft delete
      await this.db('form_types')
        .where({ id, tenant_id: tenantId })
        .update({
          is_active: false,
          updated_by: userId,
          updated_at: new Date()
        });

      return {
        success: true,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TYPE_DELETE_ERROR',
          message: 'Failed to delete form type',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  // ============================================================================
  // FORM TEMPLATES (Level 3)
  // ============================================================================

  /**
   * Get all form templates for a type
   */
  async getFormTemplates(
    typeId: string,
    tenantId: string,
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<FormTemplate[]>> {
    try {
      let query = this.db('form_templates')
        .where({ type_id: typeId, tenant_id: tenantId })
        .orderBy([{ column: 'name' }, { column: 'version', order: 'desc' }]);

      // Apply filters
      if (filters?.isActive !== undefined) {
        query = query.where('is_active', filters.isActive);
      }

      if (filters?.name) {
        query = query.where('name', 'ilike', `%${filters.name}%`);
      }

      if (filters?.version) {
        query = query.where('version', filters.version);
      }

      // Apply pagination
      if (pagination) {
        const offset = (pagination.page - 1) * pagination.limit;
        query = query.offset(offset).limit(pagination.limit);
      }

      const templates = await query;
      const total = await this.db('form_templates')
        .where({ type_id: typeId, tenant_id: tenantId })
        .count('* as count')
        .first();

      return {
        success: true,
        data: templates,
        metadata: {
          total: parseInt(total?.count as string) || 0,
          page: pagination?.page || 1,
          limit: pagination?.limit || templates.length,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TEMPLATE_FETCH_ERROR',
          message: 'Failed to fetch form templates',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get a specific form template by ID
   */
  async getFormTemplateById(id: string, tenantId: string): Promise<ApiResponse<FormTemplate>> {
    try {
      const template = await this.db('form_templates')
        .where({ id, tenant_id: tenantId })
        .first();

      if (!template) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Form template not found'
          }
        };
      }

      return {
        success: true,
        data: template,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TEMPLATE_FETCH_ERROR',
          message: 'Failed to fetch form template',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get the latest version of a template by name and type
   */
  async getLatestTemplateVersion(
    name: string,
    typeId: string,
    tenantId: string
  ): Promise<ApiResponse<FormTemplate>> {
    try {
      const template = await this.db('form_templates')
        .where({ name, type_id: typeId, tenant_id: tenantId })
        .orderBy('version', 'desc')
        .first();

      if (!template) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Form template not found'
          }
        };
      }

      return {
        success: true,
        data: template,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TEMPLATE_FETCH_ERROR',
          message: 'Failed to fetch form template',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Create a new form template
   */
  async createFormTemplate(
    templateData: Omit<FormTemplate, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<ApiResponse<FormTemplate>> {
    try {
      // Validate input
      const validatedData = CreateFormTemplateSchema.parse({
        ...templateData,
        createdBy: userId
      });

      // Check if form type exists
      const type = await this.db('form_types')
        .where({ id: validatedData.typeId, tenant_id: validatedData.tenantId })
        .first();

      if (!type) {
        return {
          success: false,
          error: {
            code: 'TYPE_NOT_FOUND',
            message: 'Parent form type not found'
          }
        };
      }

      // Get next version number for this template name
      const latestVersion = await this.db('form_templates')
        .where({ name: validatedData.name, type_id: validatedData.typeId })
        .max('version as max_version')
        .first();

      const nextVersion = (latestVersion?.max_version || 0) + 1;

      const templateId = uuidv4();
      const now = new Date();

      const newTemplate = {
        id: templateId,
        type_id: validatedData.typeId,
        tenant_id: validatedData.tenantId,
        name: validatedData.name,
        description: validatedData.description,
        version: nextVersion,
        template_data: JSON.stringify({
          questions: validatedData.questions,
          dueDateCalculation: validatedData.dueDateCalculation,
          reminderFrequency: validatedData.reminderFrequency,
          autoAssignmentRules: validatedData.autoAssignmentRules
        }),
        workflow_config: JSON.stringify(validatedData.workflow),
        is_active: validatedData.isActive,
        effective_date: validatedData.effectiveDate,
        expiration_date: validatedData.expirationDate,
        created_by: userId,
        created_at: now,
        updated_at: now
      };

      await this.db('form_templates').insert(newTemplate);

      const created = await this.db('form_templates')
        .where('id', templateId)
        .first();

      return {
        success: true,
        data: created,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TEMPLATE_CREATE_ERROR',
          message: 'Failed to create form template',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Copy an existing template to create a new version or variant
   */
  async copyFormTemplate(
    sourceId: string,
    tenantId: string,
    newName?: string,
    targetTypeId?: string,
    userId?: string
  ): Promise<ApiResponse<FormTemplate>> {
    try {
      // Get source template
      const sourceTemplate = await this.db('form_templates')
        .where({ id: sourceId, tenant_id: tenantId })
        .first();

      if (!sourceTemplate) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Source template not found'
          }
        };
      }

      // Determine target type and name
      const finalTypeId = targetTypeId || sourceTemplate.type_id;
      const finalName = newName || `${sourceTemplate.name} (Copy)`;

      // Get next version number
      const latestVersion = await this.db('form_templates')
        .where({ name: finalName, type_id: finalTypeId })
        .max('version as max_version')
        .first();

      const nextVersion = (latestVersion?.max_version || 0) + 1;

      const templateId = uuidv4();
      const now = new Date();

      const newTemplate = {
        id: templateId,
        type_id: finalTypeId,
        tenant_id: tenantId,
        name: finalName,
        description: sourceTemplate.description,
        version: nextVersion,
        template_data: sourceTemplate.template_data,
        workflow_config: sourceTemplate.workflow_config,
        is_active: true,
        effective_date: now,
        expiration_date: sourceTemplate.expiration_date,
        created_by: userId || sourceTemplate.created_by,
        created_at: now,
        updated_at: now
      };

      await this.db('form_templates').insert(newTemplate);

      const created = await this.db('form_templates')
        .where('id', templateId)
        .first();

      return {
        success: true,
        data: created,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TEMPLATE_COPY_ERROR',
          message: 'Failed to copy form template',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Update an existing form template
   */
  async updateFormTemplate(
    id: string,
    tenantId: string,
    updates: Partial<FormTemplate>,
    userId: string
  ): Promise<ApiResponse<FormTemplate>> {
    try {
      // Validate input
      const validatedUpdates = UpdateFormTemplateSchema.parse({
        ...updates,
        updatedBy: userId
      });

      // Check if template exists
      const existing = await this.db('form_templates')
        .where({ id, tenant_id: tenantId })
        .first();

      if (!existing) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Form template not found'
          }
        };
      }

      const updateData: any = {
        updated_by: userId,
        updated_at: new Date()
      };

      // Handle specific fields
      if (validatedUpdates.name) updateData.name = validatedUpdates.name;
      if (validatedUpdates.description !== undefined) updateData.description = validatedUpdates.description;
      if (validatedUpdates.isActive !== undefined) updateData.is_active = validatedUpdates.isActive;
      if (validatedUpdates.effectiveDate) updateData.effective_date = validatedUpdates.effectiveDate;
      if (validatedUpdates.expirationDate !== undefined) updateData.expiration_date = validatedUpdates.expirationDate;

      if (validatedUpdates.questions || validatedUpdates.dueDateCalculation || 
          validatedUpdates.reminderFrequency || validatedUpdates.autoAssignmentRules) {
        const currentTemplateData = JSON.parse(existing.template_data || '{}');
        const newTemplateData = {
          ...currentTemplateData,
          ...(validatedUpdates.questions && { questions: validatedUpdates.questions }),
          ...(validatedUpdates.dueDateCalculation && { dueDateCalculation: validatedUpdates.dueDateCalculation }),
          ...(validatedUpdates.reminderFrequency && { reminderFrequency: validatedUpdates.reminderFrequency }),
          ...(validatedUpdates.autoAssignmentRules && { autoAssignmentRules: validatedUpdates.autoAssignmentRules })
        };
        updateData.template_data = JSON.stringify(newTemplateData);
      }

      if (validatedUpdates.workflow) {
        updateData.workflow_config = JSON.stringify(validatedUpdates.workflow);
      }

      await this.db('form_templates')
        .where({ id, tenant_id: tenantId })
        .update(updateData);

      const updated = await this.db('form_templates')
        .where('id', id)
        .first();

      return {
        success: true,
        data: updated,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TEMPLATE_UPDATE_ERROR',
          message: 'Failed to update form template',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Delete a form template (soft delete)
   */
  async deleteFormTemplate(id: string, tenantId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      // Check if template exists
      const existing = await this.db('form_templates')
        .where({ id, tenant_id: tenantId })
        .first();

      if (!existing) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Form template not found'
          }
        };
      }

      // Check if template has active instances
      const activeInstances = await this.db('form_instances')
        .where({ template_id: id })
        .whereIn('status', ['draft', 'pending', 'approved'])
        .count('* as count')
        .first();

      if (parseInt(activeInstances?.count as string) > 0) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_HAS_ACTIVE_INSTANCES',
            message: 'Cannot delete template with active form instances'
          }
        };
      }

      // Soft delete
      await this.db('form_templates')
        .where({ id, tenant_id: tenantId })
        .update({
          is_active: false,
          updated_by: userId,
          updated_at: new Date()
        });

      return {
        success: true,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TEMPLATE_DELETE_ERROR',
          message: 'Failed to delete form template',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  // ============================================================================
  // FORM INSTANCES (Level 4)
  // ============================================================================

  /**
   * Get all form instances for a template
   */
  async getFormInstances(
    templateId: string,
    tenantId: string,
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<FormInstance[]>> {
    try {
      let query = this.db('form_instances')
        .where({ template_id: templateId, tenant_id: tenantId })
        .orderBy('created_at', 'desc');

      // Apply filters
      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.whereIn('status', filters.status);
        } else {
          query = query.where('status', filters.status);
        }
      }

      if (filters?.assignedTo) {
        query = query.where('assigned_to', filters.assignedTo);
      }

      if (filters?.memberId) {
        query = query.where('member_id', filters.memberId);
      }

      if (filters?.providerId) {
        query = query.where('provider_id', filters.providerId);
      }

      if (filters?.dueDateFrom) {
        query = query.where('due_date', '>=', filters.dueDateFrom);
      }

      if (filters?.dueDateTo) {
        query = query.where('due_date', '<=', filters.dueDateTo);
      }

      // Apply pagination
      if (pagination) {
        const offset = (pagination.page - 1) * pagination.limit;
        query = query.offset(offset).limit(pagination.limit);
      }

      const instances = await query;
      const total = await this.db('form_instances')
        .where({ template_id: templateId, tenant_id: tenantId })
        .count('* as count')
        .first();

      return {
        success: true,
        data: instances,
        metadata: {
          total: parseInt(total?.count as string) || 0,
          page: pagination?.page || 1,
          limit: pagination?.limit || instances.length,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INSTANCE_FETCH_ERROR',
          message: 'Failed to fetch form instances',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get a specific form instance by ID
   */
  async getFormInstanceById(id: string, tenantId: string): Promise<ApiResponse<FormInstance>> {
    try {
      const instance = await this.db('form_instances')
        .where({ id, tenant_id: tenantId })
        .first();

      if (!instance) {
        return {
          success: false,
          error: {
            code: 'INSTANCE_NOT_FOUND',
            message: 'Form instance not found'
          }
        };
      }

      return {
        success: true,
        data: instance,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INSTANCE_FETCH_ERROR',
          message: 'Failed to fetch form instance',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Create a new form instance
   */
  async createFormInstance(
    instanceData: Omit<FormInstance, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<ApiResponse<FormInstance>> {
    try {
      // Validate input
      const validatedData = CreateFormInstanceSchema.parse({
        ...instanceData,
        createdBy: userId
      });

      // Check if template exists and is active
      const template = await this.db('form_templates')
        .where({ id: validatedData.templateId, tenant_id: validatedData.tenantId, is_active: true })
        .first();

      if (!template) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Active form template not found'
          }
        };
      }

      // Check for duplicate instances if member/provider specified
      if (validatedData.memberId || validatedData.providerId) {
        const duplicateQuery = this.db('form_instances')
          .where({ template_id: validatedData.templateId })
          .whereIn('status', ['draft', 'pending', 'approved']);

        if (validatedData.memberId) {
          duplicateQuery.where('member_id', validatedData.memberId);
        }

        if (validatedData.providerId) {
          duplicateQuery.where('provider_id', validatedData.providerId);
        }

        const duplicate = await duplicateQuery.first();

        if (duplicate) {
          return {
            success: false,
            error: {
              code: 'DUPLICATE_INSTANCE',
              message: 'An active form instance already exists for this member/provider'
            }
          };
        }
      }

      const instanceId = uuidv4();
      const now = new Date();

      // Calculate due date if template has due date rules
      let dueDate = validatedData.dueDate;
      if (!dueDate && template.template_data) {
        const templateData = JSON.parse(template.template_data);
        if (templateData.dueDateCalculation) {
          dueDate = this.calculateDueDate(templateData.dueDateCalculation, now);
        }
      }

      const newInstance = {
        id: instanceId,
        template_id: validatedData.templateId,
        tenant_id: validatedData.tenantId,
        member_id: validatedData.memberId,
        provider_id: validatedData.providerId,
        assigned_to: validatedData.assignedTo,
        status: validatedData.status || FormStatus.DRAFT,
        response_data: JSON.stringify(validatedData.responseData || []),
        context_data: JSON.stringify(validatedData.contextData || {}),
        due_date: dueDate,
        created_by: userId,
        created_at: now,
        updated_at: now
      };

      await this.db('form_instances').insert(newInstance);

      const created = await this.db('form_instances')
        .where('id', instanceId)
        .first();

      return {
        success: true,
        data: created,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INSTANCE_CREATE_ERROR',
          message: 'Failed to create form instance',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Update an existing form instance
   */
  async updateFormInstance(
    id: string,
    tenantId: string,
    updates: Partial<FormInstance>,
    userId: string
  ): Promise<ApiResponse<FormInstance>> {
    try {
      // Validate input
      const validatedUpdates = UpdateFormInstanceSchema.parse({
        ...updates,
        updatedBy: userId
      });

      // Check if instance exists
      const existing = await this.db('form_instances')
        .where({ id, tenant_id: tenantId })
        .first();

      if (!existing) {
        return {
          success: false,
          error: {
            code: 'INSTANCE_NOT_FOUND',
            message: 'Form instance not found'
          }
        };
      }

      const updateData: any = {
        updated_by: userId,
        updated_at: new Date()
      };

      // Handle specific fields
      if (validatedUpdates.assignedTo !== undefined) updateData.assigned_to = validatedUpdates.assignedTo;
      if (validatedUpdates.status) updateData.status = validatedUpdates.status;
      if (validatedUpdates.responseData) updateData.response_data = JSON.stringify(validatedUpdates.responseData);
      if (validatedUpdates.contextData) updateData.context_data = JSON.stringify(validatedUpdates.contextData);
      if (validatedUpdates.dueDate !== undefined) updateData.due_date = validatedUpdates.dueDate;
      if (validatedUpdates.rejectionReason !== undefined) updateData.rejection_reason = validatedUpdates.rejectionReason;

      // Handle status-specific timestamps
      if (validatedUpdates.status === FormStatus.PENDING && !existing.submitted_at) {
        updateData.submitted_at = new Date();
      }
      if (validatedUpdates.status === FormStatus.APPROVED && !existing.approved_at) {
        updateData.approved_at = new Date();
      }
      if (validatedUpdates.status === FormStatus.REJECTED && !existing.rejected_at) {
        updateData.rejected_at = new Date();
      }

      await this.db('form_instances')
        .where({ id, tenant_id: tenantId })
        .update(updateData);

      const updated = await this.db('form_instances')
        .where('id', id)
        .first();

      return {
        success: true,
        data: updated,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INSTANCE_UPDATE_ERROR',
          message: 'Failed to update form instance',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Delete a form instance (soft delete by setting status to cancelled)
   */
  async deleteFormInstance(id: string, tenantId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      // Check if instance exists
      const existing = await this.db('form_instances')
        .where({ id, tenant_id: tenantId })
        .first();

      if (!existing) {
        return {
          success: false,
          error: {
            code: 'INSTANCE_NOT_FOUND',
            message: 'Form instance not found'
          }
        };
      }

      // Check if instance can be deleted (only draft or rejected instances)
      if (!['draft', 'rejected'].includes(existing.status)) {
        return {
          success: false,
          error: {
            code: 'INSTANCE_CANNOT_DELETE',
            message: 'Only draft or rejected instances can be deleted'
          }
        };
      }

      // Soft delete by setting status to cancelled
      await this.db('form_instances')
        .where({ id, tenant_id: tenantId })
        .update({
          status: FormStatus.CANCELLED,
          updated_by: userId,
          updated_at: new Date()
        });

      return {
        success: true,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INSTANCE_DELETE_ERROR',
          message: 'Failed to delete form instance',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate due date based on due date rules
   */
  private calculateDueDate(dueDateRule: any, baseDate: Date): Date {
    const dueDate = new Date(baseDate);
    
    switch (dueDateRule.type) {
      case 'days_from_creation':
      case 'days_from_assignment':
        dueDate.setDate(dueDate.getDate() + dueDateRule.value);
        break;
      case 'business_days':
        let businessDaysAdded = 0;
        while (businessDaysAdded < dueDateRule.value) {
          dueDate.setDate(dueDate.getDate() + 1);
          const dayOfWeek = dueDate.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
            businessDaysAdded++;
          }
        }
        break;
      case 'calendar_days':
      default:
        dueDate.setDate(dueDate.getDate() + dueDateRule.value);
        break;
    }

    return dueDate;
  }

  /**
   * Get form hierarchy summary for a tenant
   */
  async getFormHierarchySummary(tenantId: string): Promise<ApiResponse<any>> {
    try {
      const summary = await this.db.raw(`
        SELECT 
          fc.id as category_id,
          fc.name as category_name,
          COUNT(DISTINCT ft.id) as type_count,
          COUNT(DISTINCT ftemp.id) as template_count,
          COUNT(DISTINCT fi.id) as instance_count,
          COUNT(DISTINCT CASE WHEN fi.status = 'draft' THEN fi.id END) as draft_count,
          COUNT(DISTINCT CASE WHEN fi.status = 'pending' THEN fi.id END) as pending_count,
          COUNT(DISTINCT CASE WHEN fi.status = 'approved' THEN fi.id END) as approved_count,
          COUNT(DISTINCT CASE WHEN fi.status = 'completed' THEN fi.id END) as completed_count
        FROM form_categories fc
        LEFT JOIN form_types ft ON fc.id = ft.category_id AND ft.is_active = true
        LEFT JOIN form_templates ftemp ON ft.id = ftemp.type_id AND ftemp.is_active = true
        LEFT JOIN form_instances fi ON ftemp.id = fi.template_id
        WHERE fc.tenant_id = ? AND fc.is_active = true
        GROUP BY fc.id, fc.name
        ORDER BY fc.name
      `, [tenantId]);

      return {
        success: true,
        data: summary.rows,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SUMMARY_FETCH_ERROR',
          message: 'Failed to fetch form hierarchy summary',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }
}