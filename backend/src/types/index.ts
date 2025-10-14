/**
 * Core TypeScript interfaces and types for CHC Insight CRM
 * Hierarchical Form Management System
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Form Categories - Top level of hierarchy
 */
export enum FormCategoryType {
  CASES = 'cases',
  ASSESSMENTS = 'assessments'
}

/**
 * Case Form Types - Second level under Cases category
 */
export enum CaseFormType {
  BH_REFERRALS = 'bh_referrals',
  APPEALS = 'appeals',
  GRIEVANCES = 'grievances'
}

/**
 * Assessment Form Types - Second level under Assessments category
 */
export enum AssessmentFormType {
  HEALTH_RISK_HDM = 'health_risk_hdm',
  MEMBER_SATISFACTION = 'member_satisfaction',
  PROVIDER_PERFORMANCE = 'provider_performance'
}

/**
 * Form Instance Status
 */
export enum FormStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Question Types for form builder
 */
export enum QuestionType {
  TEXT_INPUT = 'text_input',
  NUMERIC_INPUT = 'numeric_input',
  DATE = 'date',
  DATETIME = 'datetime',
  SINGLE_SELECT = 'single_select',
  MULTI_SELECT = 'multi_select',
  YES_NO = 'yes_no',
  FILE_UPLOAD = 'file_upload',
  SECTION_HEADER = 'section_header'
}

/**
 * User Roles for RBAC
 */
export enum UserRole {
  ADMINISTRATOR = 'administrator',
  SERVICE_COORDINATOR = 'service_coordinator',
  UM_NURSE = 'um_nurse',
  QM_STAFF = 'qm_staff',
  COMMUNICATIONS_TEAM = 'communications_team',
  MANAGER = 'manager'
}

/**
 * Workflow Priority Levels
 */
export enum Priority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4,
  CRITICAL = 5
}

// ============================================================================
// BASE INTERFACES
// ============================================================================

/**
 * Base entity interface with common fields
 */
export interface BaseEntity {
  id: string;
  tenantId: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Audit trail interface for tracking changes
 */
export interface AuditTrail {
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// ============================================================================
// HIERARCHICAL FORM INTERFACES
// ============================================================================

/**
 * Form Category (Level 1) - Cases or Assessments
 */
export interface FormCategory extends BaseEntity, AuditTrail {
  name: FormCategoryType;
  description?: string;
  isActive: boolean;
}

/**
 * Form Type (Level 2) - Specific types within categories
 */
export interface FormType extends BaseEntity, AuditTrail {
  categoryId: string;
  name: string; // e.g., 'BH Referrals', 'Health Risk (HDM)'
  description?: string;
  businessRules: BusinessRule[];
  isActive: boolean;
}

/**
 * Form Template (Level 3) - Versioned templates
 */
export interface FormTemplate extends BaseEntity, AuditTrail {
  typeId: string;
  name: string; // e.g., 'BH Initial Referral v1.0'
  description?: string;
  version: number;
  questions: Question[];
  workflow: WorkflowConfig;
  isActive: boolean;
  effectiveDate: Date;
  expirationDate?: Date;
  dueDateCalculation?: DueDateRule;
  reminderFrequency?: ReminderConfig;
  autoAssignmentRules?: AssignmentRule[];
}

/**
 * Form Instance (Level 4) - Actual form executions
 */
export interface FormInstance extends BaseEntity, AuditTrail {
  templateId: string;
  memberId?: string;
  providerId?: string;
  assignedTo?: string;
  status: FormStatus;
  responseData: ResponseData[];
  contextData: Record<string, any>;
  dueDate?: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

// ============================================================================
// FORM BUILDING INTERFACES
// ============================================================================

/**
 * Question definition for form templates
 */
export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  validation: ValidationRule[];
  conditionalLogic?: ConditionalRule[];
  options?: QuestionOption[];
  defaultValue?: any;
  helpText?: string;
  prePopulationMapping?: string; // maps to staging table field
  order: number;
}

/**
 * Question options for select-type questions
 */
export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  order: number;
}

/**
 * Validation rules for questions
 */
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'email' | 'phone';
  value?: any;
  message: string;
}

/**
 * Conditional logic for question branching
 */
export interface ConditionalRule {
  id: string;
  condition: {
    questionId: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
  action: 'show' | 'hide' | 'require' | 'disable';
  targetQuestionIds: string[];
}

/**
 * Response data for form instances
 */
export interface ResponseData {
  questionId: string;
  value: any;
  metadata?: Record<string, any>;
  respondedAt: Date;
}

// ============================================================================
// BUSINESS RULES AND WORKFLOW
// ============================================================================

/**
 * Business rules for form types
 */
export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'due_date' | 'assignment' | 'validation' | 'escalation';
  conditions: Record<string, any>;
  actions: Record<string, any>;
  isActive: boolean;
}

/**
 * Workflow configuration for form templates
 */
export interface WorkflowConfig {
  id: string;
  name: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  approvalChain?: ApprovalStep[];
}

/**
 * Workflow state definition
 */
export interface WorkflowState {
  id: string;
  name: string;
  type: 'initial' | 'intermediate' | 'final';
  permissions: string[];
  notifications?: NotificationConfig[];
}

/**
 * Workflow transition definition
 */
export interface WorkflowTransition {
  id: string;
  fromStateId: string;
  toStateId: string;
  action: string;
  conditions?: Record<string, any>;
  requiredRole?: UserRole;
}

/**
 * Approval step in workflow
 */
export interface ApprovalStep {
  id: string;
  order: number;
  approverRole: UserRole;
  approverUserId?: string;
  isRequired: boolean;
  escalationTimeHours?: number;
}

// ============================================================================
// USER MANAGEMENT AND RBAC
// ============================================================================

/**
 * User entity
 */
export interface User extends BaseEntity, AuditTrail {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin?: Date;
  region?: string;
  memberPanel?: string[]; // Array of member IDs or criteria
  providerNetwork?: string[]; // Array of provider IDs or network criteria
}

/**
 * Role definition
 */
export interface Role extends BaseEntity {
  name: UserRole;
  description: string;
  permissions: Permission[];
}

/**
 * Permission definition
 */
export interface Permission {
  resource: string; // e.g., 'forms', 'users', 'reports'
  actions: string[]; // e.g., ['create', 'read', 'update', 'delete']
  conditions?: Record<string, any>; // Additional conditions
}

/**
 * User role assignment
 */
export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy: string;
}

// ============================================================================
// DATA PRE-POPULATION
// ============================================================================

/**
 * Member data for pre-population
 */
export interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  planType: string;
  ltssType: string;
  levelOfCare: string;
  picsScore: number;
  assignedCoordinator: string;
  contactInfo: ContactInfo;
}

/**
 * Provider data for pre-population
 */
export interface ProviderData {
  id: string;
  npi: string;
  name: string;
  specialty: string;
  networkStatus: string;
  contactInfo: ContactInfo;
}

/**
 * Contact information
 */
export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: Address;
}

/**
 * Address information
 */
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
}

// ============================================================================
// CONFIGURATION AND RULES
// ============================================================================

/**
 * Due date calculation rule
 */
export interface DueDateRule {
  type: 'days_from_creation' | 'days_from_assignment' | 'business_days' | 'calendar_days';
  value: number;
  excludeWeekends?: boolean;
  excludeHolidays?: boolean;
}

/**
 * Reminder configuration
 */
export interface ReminderConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  daysBeforeDue: number[];
  escalationDays?: number;
}

/**
 * Assignment rule for automatic routing
 */
export interface AssignmentRule {
  id: string;
  name: string;
  priority: number;
  criteria: {
    region?: string[];
    memberPanel?: string[];
    providerNetwork?: string[];
    formType?: string;
  };
  assignTo: {
    role?: UserRole;
    userId?: string;
  };
  isActive: boolean;
}

/**
 * Notification configuration
 */
export interface NotificationConfig {
  type: 'email' | 'sms' | 'in_app';
  template: string;
  recipients: string[];
  conditions?: Record<string, any>;
}

// ============================================================================
// MULTI-TENANT SUPPORT
// ============================================================================

/**
 * Tenant configuration
 */
export interface Tenant extends BaseEntity {
  name: string;
  subdomain?: string;
  configuration: TenantConfig;
  isActive: boolean;
}

/**
 * Tenant-specific configuration
 */
export interface TenantConfig {
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  features?: {
    enabledModules: string[];
    customFields?: Record<string, any>;
  };
  integrations?: {
    stagingDatabase?: DatabaseConfig;
    emailService?: EmailConfig;
    sftpServer?: SftpConfig;
  };
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

/**
 * Email service configuration
 */
export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'ses';
  configuration: Record<string, any>;
}

/**
 * SFTP configuration
 */
export interface SftpConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp: Date;
  };
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter parameters for queries
 */
export interface FilterParams {
  [key: string]: any;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export * from './validation-schemas';