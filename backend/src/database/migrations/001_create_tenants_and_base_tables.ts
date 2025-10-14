import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create tenants table first (required for all other tables)
  await knex.schema.createTable('tenants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('subdomain', 100).unique();
    table.jsonb('configuration').defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['is_active']);
    table.index(['subdomain']);
  });

  // Create users table (needed for audit trails)
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('email', 255).notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login');
    table.string('region', 100);
    table.jsonb('member_panel'); // Array of member IDs or criteria
    table.jsonb('provider_network'); // Array of provider IDs or network criteria
    table.uuid('created_by').references('id').inTable('users');
    table.uuid('updated_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Constraints
    table.unique(['tenant_id', 'email']);
    
    // Indexes
    table.index(['tenant_id']);
    table.index(['email']);
    table.index(['is_active']);
    table.index(['region']);
  });

  // Create roles table
  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.string('description', 500);
    table.jsonb('permissions').notNullable().defaultTo('[]');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Constraints
    table.unique(['tenant_id', 'name']);
    
    // Indexes
    table.index(['tenant_id']);
    table.index(['name']);
  });

  // Create user_roles junction table
  await knex.schema.createTable('user_roles', (table) => {
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE');
    table.uuid('assigned_by').notNullable().references('id').inTable('users');
    table.timestamp('assigned_at').defaultTo(knex.fn.now());
    
    // Primary key
    table.primary(['user_id', 'role_id']);
    
    // Indexes
    table.index(['user_id']);
    table.index(['role_id']);
  });

  // Create assignment_rules table
  await knex.schema.createTable('assignment_rules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('rule_name', 255).notNullable();
    table.string('survey_type', 100);
    table.jsonb('criteria').notNullable(); // Region, member panel, provider network criteria
    table.string('assigned_role', 100);
    table.uuid('assigned_user_id').references('id').inTable('users');
    table.integer('priority').defaultTo(1);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['tenant_id']);
    table.index(['survey_type']);
    table.index(['is_active']);
    table.index(['priority']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('assignment_rules');
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('roles');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('tenants');
}