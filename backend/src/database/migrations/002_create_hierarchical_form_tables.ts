import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create form_status enum type
  await knex.raw(`
    CREATE TYPE form_status AS ENUM (
      'draft',
      'pending', 
      'approved',
      'rejected',
      'completed',
      'cancelled'
    )
  `);

  // Create question_type enum type
  await knex.raw(`
    CREATE TYPE question_type AS ENUM (
      'text_input',
      'numeric_input',
      'date',
      'datetime',
      'single_select',
      'multi_select',
      'yes_no',
      'file_upload',
      'section_header'
    )
  `);

  // Create user_role enum type
  await knex.raw(`
    CREATE TYPE user_role AS ENUM (
      'administrator',
      'service_coordinator',
      'um_nurse',
      'qm_staff',
      'communications_team',
      'manager'
    )
  `);

  // Level 1: Form Categories (Cases, Assessments)
  await knex.schema.createTable('form_categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name', 100).notNullable(); // 'cases' or 'assessments'
    table.string('description', 500);
    table.boolean('is_active').defaultTo(true);
    table.uuid('created_by').notNullable().references('id').inTable('users');
    table.uuid('updated_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Constraints
    table.unique(['tenant_id', 'name']);
    
    // Indexes
    table.index(['tenant_id']);
    table.index(['name']);
    table.index(['is_active']);
  });

  // Level 2: Form Types (BH Referrals, Appeals, Health Risk, etc.)
  await knex.schema.createTable('form_types', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('category_id').notNullable().references('id').inTable('form_categories').onDelete('CASCADE');
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name', 255).notNullable(); // 'BH Referrals', 'Health Risk (HDM)', etc.
    table.string('description', 500);
    table.jsonb('business_rules').defaultTo('[]');
    table.boolean('is_active').defaultTo(true);
    table.uuid('created_by').notNullable().references('id').inTable('users');
    table.uuid('updated_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Constraints
    table.unique(['category_id', 'name']);
    
    // Indexes
    table.index(['category_id']);
    table.index(['tenant_id']);
    table.index(['name']);
    table.index(['is_active']);
  });

  // Level 3: Form Templates (Versioned templates)
  await knex.schema.createTable('form_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('type_id').notNullable().references('id').inTable('form_types').onDelete('CASCADE');
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name', 255).notNullable(); // 'BH Initial Referral v1.0'
    table.string('description', 1000);
    table.integer('version').notNullable().defaultTo(1);
    table.jsonb('template_data').notNullable(); // Questions and configuration
    table.jsonb('workflow_config'); // Workflow configuration
    table.boolean('is_active').defaultTo(true);
    table.timestamp('effective_date').notNullable();
    table.timestamp('expiration_date');
    table.uuid('created_by').notNullable().references('id').inTable('users');
    table.uuid('updated_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Constraints
    table.unique(['type_id', 'name', 'version']);
    
    // Indexes
    table.index(['type_id']);
    table.index(['tenant_id']);
    table.index(['name']);
    table.index(['version']);
    table.index(['is_active']);
    table.index(['effective_date']);
    table.index(['expiration_date']);
  });

  // Level 4: Form Instances (Actual form executions)
  await knex.schema.createTable('form_instances', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('template_id').notNullable().references('id').inTable('form_templates').onDelete('CASCADE');
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('member_id', 50); // External member ID
    table.string('provider_id', 50); // External provider ID
    table.uuid('assigned_to').references('id').inTable('users');
    table.specificType('status', 'form_status').notNullable().defaultTo('draft');
    table.jsonb('response_data').defaultTo('[]'); // Array of responses
    table.jsonb('context_data').defaultTo('{}'); // Additional context
    table.timestamp('due_date');
    table.timestamp('submitted_at');
    table.timestamp('approved_at');
    table.timestamp('rejected_at');
    table.string('rejection_reason', 1000);
    table.uuid('created_by').notNullable().references('id').inTable('users');
    table.uuid('updated_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['template_id']);
    table.index(['tenant_id']);
    table.index(['member_id']);
    table.index(['provider_id']);
    table.index(['assigned_to']);
    table.index(['status']);
    table.index(['due_date']);
    table.index(['created_at']);
    table.index(['submitted_at']);
  });

  // Workflow instances for form processing
  await knex.schema.createTable('workflow_instances', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('form_instance_id').notNullable().references('id').inTable('form_instances').onDelete('CASCADE');
    table.string('workflow_type', 100).notNullable();
    table.string('current_state', 100).notNullable();
    table.jsonb('state_data').defaultTo('{}');
    table.timestamp('due_date');
    table.integer('priority').defaultTo(3); // 1-5 scale
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['form_instance_id']);
    table.index(['workflow_type']);
    table.index(['current_state']);
    table.index(['due_date']);
    table.index(['priority']);
  });

  // Workflow tasks for individual steps
  await knex.schema.createTable('workflow_tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('workflow_instance_id').notNullable().references('id').inTable('workflow_instances').onDelete('CASCADE');
    table.string('task_name', 255).notNullable();
    table.string('task_type', 100).notNullable(); // 'approval', 'review', 'assignment'
    table.uuid('assigned_to').references('id').inTable('users');
    table.specificType('assigned_role', 'user_role');
    table.string('status', 50).notNullable().defaultTo('pending'); // 'pending', 'completed', 'skipped'
    table.jsonb('task_data').defaultTo('{}');
    table.timestamp('due_date');
    table.timestamp('completed_at');
    table.string('completion_notes', 1000);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['workflow_instance_id']);
    table.index(['assigned_to']);
    table.index(['assigned_role']);
    table.index(['status']);
    table.index(['due_date']);
  });

  // Member staging data (for pre-population)
  await knex.schema.createTable('member_staging', (table) => {
    table.string('member_id', 50).primary();
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.date('date_of_birth').notNullable();
    table.string('plan_type', 100);
    table.string('ltss_type', 100);
    table.string('level_of_care', 100);
    table.decimal('pics_score', 5, 2); // PICS score with 2 decimal places
    table.string('assigned_coordinator', 255);
    table.jsonb('contact_info').defaultTo('{}');
    table.jsonb('additional_data').defaultTo('{}');
    table.timestamp('last_updated').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['tenant_id']);
    table.index(['first_name', 'last_name']);
    table.index(['assigned_coordinator']);
    table.index(['last_updated']);
  });

  // Provider staging data (for pre-population)
  await knex.schema.createTable('provider_staging', (table) => {
    table.string('provider_id', 50).primary();
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('npi', 10).notNullable(); // NPI is always 10 digits
    table.string('name', 255).notNullable();
    table.string('specialty', 255);
    table.string('network_status', 50); // 'in_network', 'out_of_network', 'pending'
    table.jsonb('contact_info').defaultTo('{}');
    table.jsonb('additional_data').defaultTo('{}');
    table.timestamp('last_updated').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['tenant_id']);
    table.index(['npi']);
    table.index(['name']);
    table.index(['specialty']);
    table.index(['network_status']);
    table.index(['last_updated']);
  });

  // Audit log for tracking all changes
  await knex.schema.createTable('audit_log', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('table_name', 100).notNullable();
    table.string('record_id', 255).notNullable();
    table.string('action', 50).notNullable(); // 'INSERT', 'UPDATE', 'DELETE'
    table.jsonb('old_values');
    table.jsonb('new_values');
    table.uuid('changed_by').references('id').inTable('users');
    table.string('change_reason', 500);
    table.timestamp('changed_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['tenant_id']);
    table.index(['table_name']);
    table.index(['record_id']);
    table.index(['action']);
    table.index(['changed_by']);
    table.index(['changed_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_log');
  await knex.schema.dropTableIfExists('provider_staging');
  await knex.schema.dropTableIfExists('member_staging');
  await knex.schema.dropTableIfExists('workflow_tasks');
  await knex.schema.dropTableIfExists('workflow_instances');
  await knex.schema.dropTableIfExists('form_instances');
  await knex.schema.dropTableIfExists('form_templates');
  await knex.schema.dropTableIfExists('form_types');
  await knex.schema.dropTableIfExists('form_categories');
  
  // Drop enum types
  await knex.raw('DROP TYPE IF EXISTS user_role');
  await knex.raw('DROP TYPE IF EXISTS question_type');
  await knex.raw('DROP TYPE IF EXISTS form_status');
}