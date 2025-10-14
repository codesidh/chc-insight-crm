import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add composite indexes for hierarchical queries
  await knex.schema.alterTable('form_types', (table) => {
    table.index(['category_id', 'is_active'], 'idx_form_types_category_active');
    table.index(['tenant_id', 'category_id'], 'idx_form_types_tenant_category');
  });

  await knex.schema.alterTable('form_templates', (table) => {
    table.index(['type_id', 'is_active'], 'idx_form_templates_type_active');
    table.index(['type_id', 'version'], 'idx_form_templates_type_version');
    table.index(['tenant_id', 'type_id'], 'idx_form_templates_tenant_type');
    table.index(['effective_date', 'expiration_date'], 'idx_form_templates_date_range');
  });

  await knex.schema.alterTable('form_instances', (table) => {
    table.index(['template_id', 'status'], 'idx_form_instances_template_status');
    table.index(['assigned_to', 'status'], 'idx_form_instances_assigned_status');
    table.index(['tenant_id', 'status'], 'idx_form_instances_tenant_status');
    table.index(['member_id', 'template_id'], 'idx_form_instances_member_template');
    table.index(['provider_id', 'template_id'], 'idx_form_instances_provider_template');
    table.index(['due_date', 'status'], 'idx_form_instances_due_status');
    table.index(['created_at', 'status'], 'idx_form_instances_created_status');
  });

  await knex.schema.alterTable('workflow_instances', (table) => {
    table.index(['form_instance_id', 'current_state'], 'idx_workflow_instances_form_state');
    table.index(['workflow_type', 'current_state'], 'idx_workflow_instances_type_state');
    table.index(['due_date', 'priority'], 'idx_workflow_instances_due_priority');
  });

  await knex.schema.alterTable('workflow_tasks', (table) => {
    table.index(['assigned_to', 'status'], 'idx_workflow_tasks_assigned_status');
    table.index(['assigned_role', 'status'], 'idx_workflow_tasks_role_status');
    table.index(['workflow_instance_id', 'status'], 'idx_workflow_tasks_workflow_status');
    table.index(['due_date', 'status'], 'idx_workflow_tasks_due_status');
  });

  await knex.schema.alterTable('users', (table) => {
    table.index(['tenant_id', 'is_active'], 'idx_users_tenant_active');
    table.index(['region', 'is_active'], 'idx_users_region_active');
  });

  await knex.schema.alterTable('member_staging', (table) => {
    table.index(['tenant_id', 'first_name', 'last_name'], 'idx_member_staging_tenant_name');
    table.index(['tenant_id', 'assigned_coordinator'], 'idx_member_staging_tenant_coordinator');
  });

  await knex.schema.alterTable('provider_staging', (table) => {
    table.index(['tenant_id', 'name'], 'idx_provider_staging_tenant_name');
    table.index(['tenant_id', 'npi'], 'idx_provider_staging_tenant_npi');
    table.index(['tenant_id', 'specialty'], 'idx_provider_staging_tenant_specialty');
  });

  // Add full-text search indexes for PostgreSQL
  await knex.raw(`
    CREATE INDEX idx_member_staging_fulltext 
    ON member_staging 
    USING gin(to_tsvector('english', first_name || ' ' || last_name))
  `);

  await knex.raw(`
    CREATE INDEX idx_provider_staging_fulltext 
    ON provider_staging 
    USING gin(to_tsvector('english', name))
  `);

  // Add partial indexes for active records only
  await knex.raw(`
    CREATE INDEX idx_form_categories_active 
    ON form_categories (tenant_id, name) 
    WHERE is_active = true
  `);

  await knex.raw(`
    CREATE INDEX idx_form_types_active 
    ON form_types (category_id, name) 
    WHERE is_active = true
  `);

  await knex.raw(`
    CREATE INDEX idx_form_templates_active 
    ON form_templates (type_id, name, version) 
    WHERE is_active = true
  `);

  // Add check constraints for data integrity
  await knex.raw(`
    ALTER TABLE form_templates 
    ADD CONSTRAINT chk_form_templates_version_positive 
    CHECK (version > 0)
  `);

  await knex.raw(`
    ALTER TABLE form_templates 
    ADD CONSTRAINT chk_form_templates_date_range 
    CHECK (expiration_date IS NULL OR expiration_date > effective_date)
  `);

  await knex.raw(`
    ALTER TABLE workflow_instances 
    ADD CONSTRAINT chk_workflow_instances_priority 
    CHECK (priority >= 1 AND priority <= 5)
  `);

  await knex.raw(`
    ALTER TABLE member_staging 
    ADD CONSTRAINT chk_member_staging_pics_score 
    CHECK (pics_score IS NULL OR (pics_score >= 0 AND pics_score <= 100))
  `);

  await knex.raw(`
    ALTER TABLE provider_staging 
    ADD CONSTRAINT chk_provider_staging_npi_format 
    CHECK (npi ~ '^[0-9]{10}$')
  `);

  // Add triggers for updated_at timestamps
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql'
  `);

  // Apply the trigger to all tables with updated_at columns
  const tablesWithUpdatedAt = [
    'tenants',
    'users', 
    'roles',
    'assignment_rules',
    'form_categories',
    'form_types', 
    'form_templates',
    'form_instances',
    'workflow_instances',
    'workflow_tasks'
  ];

  for (const tableName of tablesWithUpdatedAt) {
    await knex.raw(`
      CREATE TRIGGER update_${tableName}_updated_at 
      BEFORE UPDATE ON ${tableName} 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  // Drop triggers
  const tablesWithUpdatedAt = [
    'tenants',
    'users', 
    'roles',
    'assignment_rules',
    'form_categories',
    'form_types', 
    'form_templates',
    'form_instances',
    'workflow_instances',
    'workflow_tasks'
  ];

  for (const tableName of tablesWithUpdatedAt) {
    await knex.raw(`DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON ${tableName}`);
  }

  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column()');

  // Drop check constraints
  await knex.raw('ALTER TABLE provider_staging DROP CONSTRAINT IF EXISTS chk_provider_staging_npi_format');
  await knex.raw('ALTER TABLE member_staging DROP CONSTRAINT IF EXISTS chk_member_staging_pics_score');
  await knex.raw('ALTER TABLE workflow_instances DROP CONSTRAINT IF EXISTS chk_workflow_instances_priority');
  await knex.raw('ALTER TABLE form_templates DROP CONSTRAINT IF EXISTS chk_form_templates_date_range');
  await knex.raw('ALTER TABLE form_templates DROP CONSTRAINT IF EXISTS chk_form_templates_version_positive');

  // Drop partial indexes
  await knex.raw('DROP INDEX IF EXISTS idx_form_templates_active');
  await knex.raw('DROP INDEX IF EXISTS idx_form_types_active');
  await knex.raw('DROP INDEX IF EXISTS idx_form_categories_active');

  // Drop full-text search indexes
  await knex.raw('DROP INDEX IF EXISTS idx_provider_staging_fulltext');
  await knex.raw('DROP INDEX IF EXISTS idx_member_staging_fulltext');

  // Drop composite indexes
  await knex.schema.alterTable('provider_staging', (table) => {
    table.dropIndex(['tenant_id', 'specialty'], 'idx_provider_staging_tenant_specialty');
    table.dropIndex(['tenant_id', 'npi'], 'idx_provider_staging_tenant_npi');
    table.dropIndex(['tenant_id', 'name'], 'idx_provider_staging_tenant_name');
  });

  await knex.schema.alterTable('member_staging', (table) => {
    table.dropIndex(['tenant_id', 'assigned_coordinator'], 'idx_member_staging_tenant_coordinator');
    table.dropIndex(['tenant_id', 'first_name', 'last_name'], 'idx_member_staging_tenant_name');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropIndex(['region', 'is_active'], 'idx_users_region_active');
    table.dropIndex(['tenant_id', 'is_active'], 'idx_users_tenant_active');
  });

  await knex.schema.alterTable('workflow_tasks', (table) => {
    table.dropIndex(['due_date', 'status'], 'idx_workflow_tasks_due_status');
    table.dropIndex(['workflow_instance_id', 'status'], 'idx_workflow_tasks_workflow_status');
    table.dropIndex(['assigned_role', 'status'], 'idx_workflow_tasks_role_status');
    table.dropIndex(['assigned_to', 'status'], 'idx_workflow_tasks_assigned_status');
  });

  await knex.schema.alterTable('workflow_instances', (table) => {
    table.dropIndex(['due_date', 'priority'], 'idx_workflow_instances_due_priority');
    table.dropIndex(['workflow_type', 'current_state'], 'idx_workflow_instances_type_state');
    table.dropIndex(['form_instance_id', 'current_state'], 'idx_workflow_instances_form_state');
  });

  await knex.schema.alterTable('form_instances', (table) => {
    table.dropIndex(['created_at', 'status'], 'idx_form_instances_created_status');
    table.dropIndex(['due_date', 'status'], 'idx_form_instances_due_status');
    table.dropIndex(['provider_id', 'template_id'], 'idx_form_instances_provider_template');
    table.dropIndex(['member_id', 'template_id'], 'idx_form_instances_member_template');
    table.dropIndex(['tenant_id', 'status'], 'idx_form_instances_tenant_status');
    table.dropIndex(['assigned_to', 'status'], 'idx_form_instances_assigned_status');
    table.dropIndex(['template_id', 'status'], 'idx_form_instances_template_status');
  });

  await knex.schema.alterTable('form_templates', (table) => {
    table.dropIndex(['effective_date', 'expiration_date'], 'idx_form_templates_date_range');
    table.dropIndex(['tenant_id', 'type_id'], 'idx_form_templates_tenant_type');
    table.dropIndex(['type_id', 'version'], 'idx_form_templates_type_version');
    table.dropIndex(['type_id', 'is_active'], 'idx_form_templates_type_active');
  });

  await knex.schema.alterTable('form_types', (table) => {
    table.dropIndex(['tenant_id', 'category_id'], 'idx_form_types_tenant_category');
    table.dropIndex(['category_id', 'is_active'], 'idx_form_types_category_active');
  });
}