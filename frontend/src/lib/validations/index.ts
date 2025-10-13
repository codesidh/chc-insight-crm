import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
export const dateSchema = z.string().refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid date')

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const resetPasswordSchema = z.object({
  email: emailSchema,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// User management schemas
export const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
  email: emailSchema,
  role: z.string().min(1, 'Role is required'),
  region: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const createUserSchema = userSchema.extend({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const updateUserSchema = userSchema.partial().extend({
  id: z.string().uuid(),
})

// Survey template schemas
export const questionOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Option label is required'),
  value: z.string().min(1, 'Option value is required'),
})

export const validationRuleSchema = z.object({
  type: z.enum(['required', 'min', 'max', 'pattern', 'custom']),
  value: z.union([z.string(), z.number()]).optional(),
  message: z.string().min(1, 'Validation message is required'),
})

export const conditionalRuleSchema = z.object({
  questionId: z.string(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
  value: z.union([z.string(), z.number(), z.boolean()]),
  action: z.enum(['show', 'hide', 'require', 'optional']),
})

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum([
    'text_input',
    'numeric_input', 
    'date',
    'datetime',
    'single_select',
    'multi_select',
    'yes_no',
    'file_upload',
    'section_header'
  ]),
  text: z.string().min(1, 'Question text is required'),
  required: z.boolean().default(false),
  helpText: z.string().optional(),
  defaultValue: z.any().optional(),
  options: z.array(questionOptionSchema).optional(),
  validation: z.array(validationRuleSchema).default([]),
  conditionalLogic: z.array(conditionalRuleSchema).default([]),
  prePopulationMapping: z.string().optional(),
})

export const businessRuleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Rule name is required'),
  type: z.enum(['due_date', 'assignment', 'notification', 'validation']),
  conditions: z.array(conditionalRuleSchema),
  actions: z.record(z.string(), z.any()),
})

export const workflowConfigSchema = z.object({
  states: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['draft', 'pending', 'approved', 'rejected', 'completed']),
  })),
  transitions: z.array(z.object({
    from: z.string(),
    to: z.string(),
    trigger: z.string(),
    conditions: z.array(conditionalRuleSchema).optional(),
  })),
})

export const surveyTemplateSchema = z.object({
  name: z.string().min(1, 'Survey name is required').max(255, 'Survey name is too long'),
  description: z.string().optional(),
  type: z.enum([
    'initial_assessment',
    'reassessment', 
    'provider_survey',
    'incident_report',
    'satisfaction_survey',
    'custom'
  ]),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
  businessRules: z.array(businessRuleSchema).default([]),
  workflow: workflowConfigSchema.optional(),
  isActive: z.boolean().default(true),
  effectiveDate: dateSchema,
  expirationDate: dateSchema.optional(),
})

export const updateSurveyTemplateSchema = surveyTemplateSchema.partial().extend({
  id: z.string().uuid(),
})

// Survey instance schemas
export const surveyContextSchema = z.object({
  memberId: z.string().optional(),
  providerId: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  dueDate: dateSchema.optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const responseDataSchema = z.object({
  questionId: z.string(),
  value: z.any(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const surveyInstanceSchema = z.object({
  templateId: z.string().uuid(),
  context: surveyContextSchema,
  responses: z.array(responseDataSchema).default([]),
})

export const updateSurveyInstanceSchema = z.object({
  responses: z.array(responseDataSchema),
  isDraft: z.boolean().default(true),
})

// Search and filter schemas
export const memberSearchSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters'),
  limit: z.number().min(1).max(100).default(10),
})

export const providerSearchSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters'),
  limit: z.number().min(1).max(100).default(10),
  specialty: z.string().optional(),
  networkStatus: z.enum(['in_network', 'out_of_network', 'both']).optional(),
})

// Dashboard and reporting schemas
export const dateRangeSchema = z.object({
  start: dateSchema,
  end: dateSchema,
}).refine((data) => new Date(data.start) <= new Date(data.end), {
  message: 'Start date must be before end date',
  path: ['end'],
})

export const dashboardFiltersSchema = z.object({
  dateRange: dateRangeSchema.optional(),
  region: z.string().optional(),
  surveyType: z.string().optional(),
  status: z.string().optional(),
})

export const reportConfigSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  templateId: z.string().uuid(),
  parameters: z.record(z.string(), z.any()).default({}),
  filters: dashboardFiltersSchema.default({}),
  format: z.enum(['excel', 'csv', 'pdf']).default('excel'),
  schedule: z.object({
    frequency: z.enum(['once', 'daily', 'weekly', 'monthly']),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    recipients: z.array(emailSchema).min(1, 'At least one recipient is required'),
  }).optional(),
})

// Work queue schemas
export const workQueueFiltersSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  assignedTo: z.string().uuid().optional(),
  dueDate: dateRangeSchema.optional(),
  surveyType: z.string().optional(),
})

export const taskUpdateSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'rejected']),
  comment: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
})

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 10 * 1024 * 1024, {
    message: 'File size must be less than 10MB',
  }).refine((file) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]
    return allowedTypes.includes(file.type)
  }, {
    message: 'File type not supported',
  }),
  description: z.string().optional(),
})

// Export type inference helpers
export type LoginFormData = z.infer<typeof loginSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type UserFormData = z.infer<typeof userSchema>
export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>
export type SurveyTemplateFormData = z.infer<typeof surveyTemplateSchema>
export type UpdateSurveyTemplateFormData = z.infer<typeof updateSurveyTemplateSchema>
export type SurveyInstanceFormData = z.infer<typeof surveyInstanceSchema>
export type UpdateSurveyInstanceFormData = z.infer<typeof updateSurveyInstanceSchema>
export type MemberSearchFormData = z.infer<typeof memberSearchSchema>
export type ProviderSearchFormData = z.infer<typeof providerSearchSchema>
export type DashboardFiltersFormData = z.infer<typeof dashboardFiltersSchema>
export type ReportConfigFormData = z.infer<typeof reportConfigSchema>
export type WorkQueueFiltersFormData = z.infer<typeof workQueueFiltersSchema>
export type TaskUpdateFormData = z.infer<typeof taskUpdateSchema>
export type FileUploadFormData = z.infer<typeof fileUploadSchema>