/**
 * Zod validation schemas for CHC Insight CRM
 * Hierarchical Form Management System
 */

import { z } from 'zod';
import {
  FormCategoryType,
  CaseFormType,
  AssessmentFormType,
  FormStatus,
  QuestionType,
  UserRole,
  Priority
} from './index';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

const FormCategoryTypeSchema = z.nativeEnum(FormCategoryType);
const CaseFormTypeSchema = z.nativeEnum(CaseFormType);
const AssessmentFormTypeSchema = z.nativeEnum(AssessmentFormType);
const FormStatusSchema = z.nativeEnum(FormStatus);
const QuestionTypeSchema = z.nativeEnum(QuestionType);
const UserRoleSchema = z.nativeEnum(UserRole);
const PrioritySchema = z.nativeEnum(Priority);

// ============================================================================
// BASE SCHEMAS
// ============================================================================

const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
});

const AuditTrailSchema = z.object({
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
});

// ============================================================================
// CONTACT AND ADDRESS SCHEMAS
// ============================================================================

const AddressSchema = z.object({
  street1: z.string().min(1).max(255),
  street2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().length(2), // US state code
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/) // US zip code format
});

const ContactInfoSchema = z.object({
  phone: z.string().regex(/^\+?[\d\s\-().]+$/).optional(),
  email: z.string().email().optional(),
  address: AddressSchema.optional()
});

// ============================================================================
// FORM HIERARCHY SCHEMAS
// ============================================================================

const FormCategorySchema = BaseEntitySchema.merge(AuditTrailSchema).extend({
  name: FormCategoryTypeSchema,
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true)
});

const BusinessRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000),
  ruleType: z.enum(['due_date', 'assignment', 'validation', 'escalation']),
  conditions: z.record(z.any()),
  actions: z.record(z.any()),
  isActive: z.boolean().default(true)
});

const FormTypeSchema = BaseEntitySchema.merge(AuditTrailSchema).extend({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  businessRules: z.array(BusinessRuleSchema).default([]),
  isActive: z.boolean().default(true)
});

// ============================================================================
// QUESTION AND VALIDATION SCHEMAS
// ============================================================================

const ValidationRuleSchema = z.object({
  type: z.enum(['required', 'minLength', 'maxLength', 'pattern', 'min', 'max', 'email', 'phone']),
  value: z.any().optional(),
  message: z.string().min(1).max(255)
});

const QuestionOptionSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(255),
  value: z.string().min(1).max(255),
  order: z.number().int().min(0)
});

const ConditionalRuleSchema = z.object({
  id: z.string().uuid(),
  condition: z.object({
    questionId: z.string().uuid(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
    value: z.any().optional()
  }),
  action: z.enum(['show', 'hide', 'require', 'disable']),
  targetQuestionIds: z.array(z.string().uuid())
});

const QuestionSchema = z.object({
  id: z.string().uuid(),
  type: QuestionTypeSchema,
  text: z.string().min(1).max(1000),
  required: z.boolean().default(false),
  validation: z.array(ValidationRuleSchema).default([]),
  conditionalLogic: z.array(ConditionalRuleSchema).optional(),
  options: z.array(QuestionOptionSchema).optional(),
  defaultValue: z.any().optional(),
  helpText: z.string().max(500).optional(),
  prePopulationMapping: z.string().max(255).optional(),
  order: z.number().int().min(0)
});

// ============================================================================
// WORKFLOW SCHEMAS
// ============================================================================

const NotificationConfigSchema = z.object({
  type: z.enum(['email', 'sms', 'in_app']),
  template: z.string().min(1).max(255),
  recipients: z.array(z.string().email()),
  conditions: z.record(z.any()).optional()
});

const WorkflowStateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: z.enum(['initial', 'intermediate', 'final']),
  permissions: z.array(z.string()),
  notifications: z.array(NotificationConfigSchema).optional()
});

const WorkflowTransitionSchema = z.object({
  id: z.string().uuid(),
  fromStateId: z.string().uuid(),
  toStateId: z.string().uuid(),
  action: z.string().min(1).max(255),
  conditions: z.record(z.any()).optional(),
  requiredRole: UserRoleSchema.optional()
});

const ApprovalStepSchema = z.object({
  id: z.string().uuid(),
  order: z.number().int().min(1),
  approverRole: UserRoleSchema,
  approverUserId: z.string().uuid().optional(),
  isRequired: z.boolean().default(true),
  escalationTimeHours: z.number().int().min(1).optional()
});

const WorkflowConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  states: z.array(WorkflowStateSchema).min(1),
  transitions: z.array(WorkflowTransitionSchema),
  approvalChain: z.array(ApprovalStepSchema).optional()
});

// ============================================================================
// CONFIGURATION SCHEMAS
// ============================================================================

const DueDateRuleSchema = z.object({
  type: z.enum(['days_from_creation', 'days_from_assignment', 'business_days', 'calendar_days']),
  value: z.number().int().min(1),
  excludeWeekends: z.boolean().default(false),
  excludeHolidays: z.boolean().default(false)
});

const ReminderConfigSchema = z.object({
  enabled: z.boolean().default(true),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  daysBeforeDue: z.array(z.number().int().min(1)),
  escalationDays: z.number().int().min(1).optional()
});

const AssignmentRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  priority: z.number().int().min(1),
  criteria: z.object({
    region: z.array(z.string()).optional(),
    memberPanel: z.array(z.string()).optional(),
    providerNetwork: z.array(z.string()).optional(),
    formType: z.string().optional()
  }),
  assignTo: z.object({
    role: UserRoleSchema.optional(),
    userId: z.string().uuid().optional()
  }),
  isActive: z.boolean().default(true)
});

// ============================================================================
// FORM TEMPLATE AND INSTANCE SCHEMAS
// ============================================================================

const FormTemplateSchema = BaseEntitySchema.merge(AuditTrailSchema).extend({
  typeId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  version: z.number().int().min(1).default(1),
  questions: z.array(QuestionSchema).min(1),
  workflow: WorkflowConfigSchema,
  isActive: z.boolean().default(true),
  effectiveDate: z.date(),
  expirationDate: z.date().optional(),
  dueDateCalculation: DueDateRuleSchema.optional(),
  reminderFrequency: ReminderConfigSchema.optional(),
  autoAssignmentRules: z.array(AssignmentRuleSchema).optional()
});

const ResponseDataSchema = z.object({
  questionId: z.string().uuid(),
  value: z.any().optional(),
  metadata: z.record(z.any()).optional(),
  respondedAt: z.date()
});

const FormInstanceSchema = BaseEntitySchema.merge(AuditTrailSchema).extend({
  templateId: z.string().uuid(),
  memberId: z.string().max(50).optional(),
  providerId: z.string().max(50).optional(),
  assignedTo: z.string().uuid().optional(),
  status: FormStatusSchema.default(FormStatus.DRAFT),
  responseData: z.array(ResponseDataSchema).default([]),
  contextData: z.record(z.any()).default({}),
  dueDate: z.date().optional(),
  submittedAt: z.date().optional(),
  approvedAt: z.date().optional(),
  rejectedAt: z.date().optional(),
  rejectionReason: z.string().max(1000).optional()
});

// ============================================================================
// USER MANAGEMENT SCHEMAS
// ============================================================================

const PermissionSchema = z.object({
  resource: z.string().min(1).max(100),
  actions: z.array(z.string().min(1).max(50)),
  conditions: z.record(z.any()).optional()
});

const RoleSchema = BaseEntitySchema.extend({
  name: UserRoleSchema,
  description: z.string().max(500),
  permissions: z.array(PermissionSchema)
});

const UserSchema = BaseEntitySchema.merge(AuditTrailSchema).extend({
  email: z.string().email().max(255),
  passwordHash: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  isActive: z.boolean().default(true),
  lastLogin: z.date().optional(),
  region: z.string().max(100).optional(),
  memberPanel: z.array(z.string()).optional(),
  providerNetwork: z.array(z.string()).optional()
});

const UserRoleAssignmentSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
  assignedAt: z.date(),
  assignedBy: z.string().uuid()
});

// ============================================================================
// DATA PRE-POPULATION AND MANAGEMENT SCHEMAS
// ============================================================================

const ServiceCoordinatorSchema = BaseEntitySchema.merge(AuditTrailSchema).extend({
  scid: z.string().min(1).max(50),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().regex(/^\+?[\d\s\-().]+$/).optional(),
  organization: z.string().min(1).max(255),
  zone: z.enum(['SW', 'SE', 'NE', 'NW', 'LC']),
  supervisorId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  directorId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
  maxCaseload: z.number().int().min(1).optional(),
  currentCaseload: z.number().int().min(0).default(0),
  specializations: z.array(z.string()).optional(),
  licenseNumber: z.string().max(50).optional(),
  hireDate: z.date(),
  lastUpdated: z.date()
});

const MemberDataSchema = z.object({
  memberDataId: z.string().max(50),
  medicaidId: z.string().min(1).max(50),
  hcinId: z.string().min(1).max(50),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.date(),
  planId: z.string().min(1).max(50),
  planCategory: z.enum(['Medical', 'RX', 'Vision']),
  planType: z.enum(['NFCE', 'NFI']),
  planSubType: z.enum(['HCBS', 'NF', 'NFI']),
  eligEffectiveDate: z.date(),
  eligTermDate: z.date().optional(),
  waiverCode: z.enum(['20', '37', '38', '39']),
  waiverEffectiveDate: z.date(),
  waiverTermDate: z.date().optional(),
  aligned: z.enum(['Y', 'N']),
  planDual: z.enum(['Y', 'N']),
  dsnpName: z.enum(['Amerihealth', 'Keystone First', 'Aetna', 'UPMC', 'PHW']),
  memberZone: z.enum(['SW', 'SE', 'NE', 'NW', 'LC']),
  picsScore: z.number().min(0).max(100),
  assignedSCID: z.string().min(1).max(50), // Foreign key reference
  lastUpdated: z.date(),
  contactInfo: ContactInfoSchema.optional(),
  serviceCoordinator: ServiceCoordinatorSchema.optional() // Populated via join
});

const ProviderDataSchema = z.object({
  id: z.string().max(50),
  name: z.string().min(1).max(255),
  npi: z.string().length(10), // NPI is always 10 digits
  taxonomy: z.string().min(1).max(50),
  providerEntity: z.string().min(1).max(255),
  providerType: z.string().min(1).max(255),
  providerTypeCode: z.string().min(1).max(50),
  organizationType: z.string().min(1).max(255),
  specialty: z.string().min(1).max(255),
  specialtyCode: z.string().min(1).max(50),
  subSpecialty: z.string().min(1).max(255),
  networkStatus: z.enum(['in_network', 'out_of_network', 'pending', 'terminated']),
  contactInfo: ContactInfoSchema,
  relationshipSpecialistName: z.string().min(1).max(255),
  lastUpdated: z.date()
});

// ============================================================================
// TENANT CONFIGURATION SCHEMAS
// ============================================================================

const DatabaseConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  database: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  ssl: z.boolean().default(false)
});

const EmailConfigSchema = z.object({
  provider: z.enum(['smtp', 'sendgrid', 'ses']),
  configuration: z.record(z.any())
});

const SftpConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  username: z.string().min(1),
  password: z.string().optional(),
  privateKey: z.string().optional()
});

const TenantConfigSchema = z.object({
  branding: z.object({
    logo: z.string().url().optional(),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
  }).optional(),
  features: z.object({
    enabledModules: z.array(z.string()),
    customFields: z.record(z.any()).optional()
  }).optional(),
  integrations: z.object({
    stagingDatabase: DatabaseConfigSchema.optional(),
    emailService: EmailConfigSchema.optional(),
    sftpServer: SftpConfigSchema.optional()
  }).optional()
});

const TenantSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(255),
  subdomain: z.string().regex(/^[a-z0-9-]+$/).max(50).optional(),
  configuration: TenantConfigSchema,
  isActive: z.boolean().default(true)
});

// ============================================================================
// API SCHEMAS
// ============================================================================

const ApiErrorSchema = z.object({
  code: z.string().min(1).max(50),
  message: z.string().min(1).max(500),
  details: z.record(z.any()).optional(),
  stack: z.string().optional()
});

const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: ApiErrorSchema.optional(),
  metadata: z.object({
    total: z.number().int().min(0).optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).optional(),
    timestamp: z.date()
  }).optional()
});

const PaginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().max(100).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

// ============================================================================
// CREATE/UPDATE SCHEMAS (for API endpoints)
// ============================================================================

const CreateFormCategorySchema = FormCategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

const UpdateFormCategorySchema = CreateFormCategorySchema.partial().extend({
  updatedBy: z.string().uuid()
});

const CreateFormTypeSchema = FormTypeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

const UpdateFormTypeSchema = CreateFormTypeSchema.partial().extend({
  updatedBy: z.string().uuid()
});

const CreateFormTemplateSchema = FormTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

const UpdateFormTemplateSchema = CreateFormTemplateSchema.partial().extend({
  updatedBy: z.string().uuid()
});

const CreateFormInstanceSchema = FormInstanceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

const UpdateFormInstanceSchema = CreateFormInstanceSchema.partial().extend({
  updatedBy: z.string().uuid()
});

const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true
}).extend({
  password: z.string().min(8).max(128)
});

const UpdateUserSchema = CreateUserSchema.partial().extend({
  updatedBy: z.string().uuid()
});

const CreateServiceCoordinatorSchema = ServiceCoordinatorSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentCaseload: true
});

const UpdateServiceCoordinatorSchema = CreateServiceCoordinatorSchema.partial().extend({
  updatedBy: z.string().uuid()
});

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const AuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().min(1),
  tokenType: z.string().default('Bearer')
});

const UserContextSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  roles: z.array(RoleSchema),
  permissions: z.array(PermissionSchema),
  sessionId: z.string().uuid()
});

// ============================================================================
// SEARCH AND FILTER SCHEMAS
// ============================================================================

const MemberSearchSchema = z.object({
  query: z.string().min(1).max(255),
  limit: z.number().int().min(1).max(50).default(10)
});

const ProviderSearchSchema = z.object({
  query: z.string().min(1).max(255),
  limit: z.number().int().min(1).max(50).default(10)
});

const FormInstanceFilterSchema = z.object({
  status: z.array(FormStatusSchema).optional(),
  assignedTo: z.string().uuid().optional(),
  memberId: z.string().optional(),
  providerId: z.string().optional(),
  templateId: z.string().uuid().optional(),
  dueDateFrom: z.date().optional(),
  dueDateTo: z.date().optional(),
  createdFrom: z.date().optional(),
  createdTo: z.date().optional()
});

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export {
  // Enum schemas
  FormCategoryTypeSchema,
  CaseFormTypeSchema,
  AssessmentFormTypeSchema,
  FormStatusSchema,
  QuestionTypeSchema,
  UserRoleSchema,
  PrioritySchema,

  // Base schemas
  BaseEntitySchema,
  AuditTrailSchema,

  // Contact schemas
  AddressSchema,
  ContactInfoSchema,

  // Form hierarchy schemas
  FormCategorySchema,
  FormTypeSchema,
  FormTemplateSchema,
  FormInstanceSchema,

  // Question schemas
  QuestionSchema,
  QuestionOptionSchema,
  ValidationRuleSchema,
  ConditionalRuleSchema,
  ResponseDataSchema,

  // Workflow schemas
  WorkflowConfigSchema,
  WorkflowStateSchema,
  WorkflowTransitionSchema,
  ApprovalStepSchema,

  // User management schemas
  UserSchema,
  RoleSchema,
  PermissionSchema,
  UserRoleAssignmentSchema,

  // Configuration schemas
  DueDateRuleSchema,
  ReminderConfigSchema,
  AssignmentRuleSchema,
  NotificationConfigSchema,

  // Data schemas
  ServiceCoordinatorSchema,
  MemberDataSchema,
  ProviderDataSchema,

  // Tenant schemas
  TenantSchema,
  TenantConfigSchema,

  // API schemas
  ApiResponseSchema,
  ApiErrorSchema,
  PaginationParamsSchema,

  // Create/Update schemas
  CreateFormCategorySchema,
  UpdateFormCategorySchema,
  CreateFormTypeSchema,
  UpdateFormTypeSchema,
  CreateFormTemplateSchema,
  UpdateFormTemplateSchema,
  CreateFormInstanceSchema,
  UpdateFormInstanceSchema,
  CreateUserSchema,
  UpdateUserSchema,
  CreateServiceCoordinatorSchema,
  UpdateServiceCoordinatorSchema,

  // Auth schemas
  LoginCredentialsSchema,
  AuthTokenSchema,
  UserContextSchema,

  // Search schemas
  MemberSearchSchema,
  ProviderSearchSchema,
  FormInstanceFilterSchema
};