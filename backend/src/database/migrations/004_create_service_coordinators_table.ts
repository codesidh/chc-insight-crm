import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('service_coordinators', (table) => {
    // Primary identifier
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    
    // Service Coordinator identifier
    table.string('scid', 50).notNullable();
    
    // Personal information
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('email', 255).notNullable();
    table.string('phone', 20).nullable();
    
    // Organization and location
    table.string('organization', 255).notNullable();
    table.enum('zone', ['SW', 'SE', 'NE', 'NW', 'LC']).notNullable().index();
    
    // Hierarchy references (self-referencing foreign keys)
    table.uuid('supervisor_id').nullable().references('id').inTable('service_coordinators').onDelete('SET NULL');
    table.uuid('manager_id').nullable().references('id').inTable('service_coordinators').onDelete('SET NULL');
    table.uuid('director_id').nullable().references('id').inTable('service_coordinators').onDelete('SET NULL');
    
    // Status and capacity
    table.boolean('is_active').defaultTo(true).index();
    table.integer('max_caseload').nullable();
    table.integer('current_caseload').defaultTo(0).notNullable();
    
    // Professional information
    table.json('specializations').nullable(); // Array of specializations
    table.string('license_number', 50).nullable();
    table.date('hire_date').notNullable();
    
    // Audit fields
    table.uuid('created_by').notNullable().references('id').inTable('users');
    table.uuid('updated_by').nullable().references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').nullable();
    table.timestamp('last_updated').notNullable().defaultTo(knex.fn.now());
    
    // Unique constraints
    table.unique(['tenant_id', 'scid']);
    table.unique(['tenant_id', 'email']);
    
    // Indexes for common queries
    table.index(['tenant_id']);
    table.index(['scid']);
    table.index(['email']);
    table.index(['first_name', 'last_name']);
    table.index(['organization']);
    table.index(['supervisor_id']);
    table.index(['manager_id']);
    table.index(['director_id']);
    table.index(['current_caseload']);
    table.index(['max_caseload']);
    table.index(['hire_date']);
    table.index(['last_updated']);
    
    // Composite indexes for common search patterns
    table.index(['tenant_id', 'zone', 'is_active']);
    table.index(['tenant_id', 'organization', 'zone']);
    table.index(['zone', 'current_caseload']);
  });

  // Add comments to the table
  await knex.raw(`
    COMMENT ON TABLE service_coordinators IS 'Service coordinators for member care coordination and case management';
    COMMENT ON COLUMN service_coordinators.id IS 'Primary UUID identifier';
    COMMENT ON COLUMN service_coordinators.tenant_id IS 'Reference to tenant for multi-tenancy';
    COMMENT ON COLUMN service_coordinators.scid IS 'Service Coordinator identifier (business key)';
    COMMENT ON COLUMN service_coordinators.zone IS 'Geographic service zone assignment';
    COMMENT ON COLUMN service_coordinators.supervisor_id IS 'Reference to supervising service coordinator';
    COMMENT ON COLUMN service_coordinators.manager_id IS 'Reference to managing service coordinator';
    COMMENT ON COLUMN service_coordinators.director_id IS 'Reference to directing service coordinator';
    COMMENT ON COLUMN service_coordinators.max_caseload IS 'Maximum number of members that can be assigned';
    COMMENT ON COLUMN service_coordinators.current_caseload IS 'Current number of assigned members';
    COMMENT ON COLUMN service_coordinators.specializations IS 'JSON array of specialization areas (e.g., HCBS, Behavioral Health)';
    COMMENT ON COLUMN service_coordinators.license_number IS 'Professional license number if applicable';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('service_coordinators');
}