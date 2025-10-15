// Core application types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  tenantId: string;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface Tenant {
  id: string;
  name: string;
  subdomain?: string;
  configuration: Record<string, any>;
  isActive: boolean;
}

// Hierarchical Form Structure Types
export interface FormCategory {
  id: string;
  name: string; // 'Cases' | 'Assessments'
  description?: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface FormType {
  id: string;
  categoryId: string;
  name: string; // 'BH Referrals', 'Health Risk (HDM)', etc.
  description?: string;
  tenantId: string;
  businessRules: BusinessRule[];
  isActive: boolean;
  createdAt: Date;
}

export interface FormTemplate {
  id: string;
  typeId: string;
  name: string; // 'BH Initial Referral v1.0'
  description?: string;
  version: number;
  tenantId: string;
  questions: Question[];
  workflow: WorkflowConfig;
  isActive: boolean;
  effectiveDate: Date;
  expirationDate?: Date;
  createdBy: string;
  dueDateCalculation?: DueDateRule;
  reminderFrequency?: ReminderConfig;
  autoAssignmentRules?: AssignmentRule[];
}

export interface FormInstance {
  id: string;
  templateId: string;
  tenantId: string;
  memberId?: string;
  providerId?: string;
  assignedTo?: string;
  status: FormStatus;
  responseData: ResponseData[];
  contextData: any;
  dueDate?: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy Survey types (for backward compatibility)
export interface SurveyTemplate extends FormTemplate {
  type: SurveyType;
}

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
  prePopulationMapping?: string;
}

// Legacy Survey Instance (for backward compatibility)
export interface SurveyInstance {
  id: string;
  templateId: string;
  tenantId: string;
  memberId?: string;
  providerId?: string;
  assignedTo?: string;
  status: SurveyStatus;
  responseData?: Record<string, any>;
  contextData?: Record<string, any>;
  dueDate?: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Form Category and Type Enums
export enum FormCategoryType {
  CASES = 'cases',
  ASSESSMENTS = 'assessments'
}

export enum CaseFormType {
  BH_REFERRALS = 'bh_referrals',
  APPEALS = 'appeals',
  GRIEVANCES = 'grievances'
}

export enum AssessmentFormType {
  HEALTH_RISK_HDM = 'health_risk_hdm',
  MEMBER_SATISFACTION = 'member_satisfaction',
  PROVIDER_PERFORMANCE = 'provider_performance'
}

export enum FormStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Legacy Enums (for backward compatibility)
export enum SurveyType {
  INITIAL_ASSESSMENT = 'initial_assessment',
  REASSESSMENT = 'reassessment',
  PROVIDER_SURVEY = 'provider_survey',
  INCIDENT_REPORT = 'incident_report',
  SATISFACTION_SURVEY = 'satisfaction_survey',
  CUSTOM = 'custom',
}

export enum QuestionType {
  TEXT_INPUT = 'text_input',
  NUMERIC_INPUT = 'numeric_input',
  DATE = 'date',
  DATETIME = 'datetime',
  SINGLE_SELECT = 'single_select',
  MULTI_SELECT = 'multi_select',
  YES_NO = 'yes_no',
  FILE_UPLOAD = 'file_upload',
  SECTION_HEADER = 'section_header',
}

export enum SurveyStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum UserRole {
  ADMINISTRATOR = 'administrator',
  SERVICE_COORDINATOR = 'service_coordinator',
  UM_NURSE = 'um_nurse',
  QM_STAFF = 'qm_staff',
  COMMUNICATIONS_TEAM = 'communications_team',
  MANAGER = 'manager',
}

// Additional interfaces
export interface ValidationRule {
  type: string;
  value?: any;
  message: string;
}

export interface ConditionalRule {
  condition: string;
  action: string;
  targetQuestionId: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: any;
}

export interface BusinessRule {
  id: string;
  type: string;
  configuration: Record<string, any>;
}

export interface WorkflowConfig {
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export interface WorkflowState {
  id: string;
  name: string;
  type: 'initial' | 'intermediate' | 'final';
}

export interface WorkflowTransition {
  from: string;
  to: string;
  trigger: string;
  conditions?: Record<string, any>;
}

// Additional Form-related interfaces
export interface ResponseData {
  questionId: string;
  value: any;
  metadata?: Record<string, any>;
}

export interface DueDateRule {
  type: 'days' | 'weeks' | 'months';
  value: number;
  businessDaysOnly?: boolean;
}

export interface ReminderConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  daysBeforeDue?: number;
}

export interface AssignmentRule {
  id: string;
  criteria: Record<string, any>;
  assignedRole?: string;
  assignedUserId?: string;
  priority: number;
}

// Form Builder specific types
export interface FormHierarchyNode {
  id: string;
  name: string;
  type: 'category' | 'type' | 'template';
  parentId?: string;
  children?: FormHierarchyNode[];
  metadata?: Record<string, any>;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  type: 'category' | 'type' | 'template';
  href?: string;
}
