/**
 * Security Tables Migration
 * 
 * Creates tables for audit logging and session management
 * Requirements: 12.1, 12.4
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create audit_logs table
  await knex.schema.createTable('audit_logs', (table) => {
    table.string('id', 100).primary();
    table.uuid('user_id').notNullable();
    table.uuid('tenant_id').notNullable();
    table.string('action', 100).notNullable();
    table.string('resource', 100).notNullable();
    table.string('resource_id', 100).nullable();
    table.string('ip_address', 45).notNullable(); // IPv6 compatible
    table.text('user_agent').nullable();
    table.string('request_method', 10).notNullable();
    table.string('request_path', 500).notNullable();
    table.text('request_body').nullable();
    table.integer('response_status').nullable();
    table.string('session_id', 100).nullable();
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

    // Indexes for performance
    table.index(['user_id']);
    table.index(['tenant_id']);
    table.index(['action']);
    table.index(['resource']);
    table.index(['created_at']);
    table.index(['user_id', 'created_at']);
    table.index(['tenant_id', 'created_at']);
  });

  // Create user_sessions table
  await knex.schema.createTable('user_sessions', (table) => {
    table.string('id', 100).primary();
    table.uuid('user_id').notNullable();
    table.uuid('tenant_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('last_accessed_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('expires_at').notNullable();
    table.string('ip_address', 45).notNullable();
    table.text('user_agent').nullable();
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamp('invalidated_at').nullable();
    table.jsonb('metadata').nullable();

    // Indexes for performance
    table.index(['user_id']);
    table.index(['tenant_id']);
    table.index(['is_active']);
    table.index(['expires_at']);
    table.index(['user_id', 'is_active']);
    table.index(['created_at']);
  });

  // Create security_events table for tracking security-related events
  await knex.schema.createTable('security_events', (table) => {
    table.string('id', 100).primary();
    table.uuid('user_id').nullable(); // Nullable for anonymous events
    table.uuid('tenant_id').nullable();
    table.string('event_type', 100).notNullable(); // login_failed, suspicious_activity, etc.
    table.string('severity', 20).notNullable(); // low, medium, high, critical
    table.string('ip_address', 45).notNullable();
    table.text('user_agent').nullable();
    table.text('description').notNullable();
    table.jsonb('event_data').nullable();
    table.boolean('resolved').defaultTo(false).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('resolved_at').nullable();
    table.uuid('resolved_by').nullable();

    // Indexes for performance
    table.index(['event_type']);
    table.index(['severity']);
    table.index(['resolved']);
    table.index(['created_at']);
    table.index(['user_id', 'created_at']);
    table.index(['tenant_id', 'created_at']);
  });

  // Create data_access_logs table for tracking sensitive data access
  await knex.schema.createTable('data_access_logs', (table) => {
    table.string('id', 100).primary();
    table.uuid('user_id').notNullable();
    table.uuid('tenant_id').notNullable();
    table.string('data_type', 100).notNullable(); // member, provider, report, etc.
    table.string('data_id', 100).nullable(); // ID of the accessed data
    table.string('access_type', 50).notNullable(); // read, search, export, etc.
    table.string('ip_address', 45).notNullable();
    table.text('user_agent').nullable();
    table.jsonb('access_details').nullable(); // Search terms, filters, etc.
    table.integer('record_count').nullable(); // Number of records accessed
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

    // Indexes for performance
    table.index(['user_id']);
    table.index(['tenant_id']);
    table.index(['data_type']);
    table.index(['access_type']);
    table.index(['created_at']);
    table.index(['user_id', 'data_type', 'created_at']);
  });

  // Create password_history table for password policy enforcement
  await knex.schema.createTable('password_history', (table) => {
    table.string('id', 100).primary();
    table.uuid('user_id').notNullable();
    table.string('password_hash', 255).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

    // Indexes
    table.index(['user_id']);
    table.index(['created_at']);
  });

  // Create login_attempts table for tracking failed login attempts
  await knex.schema.createTable('login_attempts', (table) => {
    table.string('id', 100).primary();
    table.string('email', 255).notNullable();
    table.string('ip_address', 45).notNullable();
    table.boolean('successful').notNullable();
    table.text('failure_reason').nullable();
    table.text('user_agent').nullable();
    table.timestamp('attempted_at').defaultTo(knex.fn.now()).notNullable();

    // Indexes for performance and security monitoring
    table.index(['email']);
    table.index(['ip_address']);
    table.index(['successful']);
    table.index(['attempted_at']);
    table.index(['email', 'successful', 'attempted_at']);
    table.index(['ip_address', 'successful', 'attempted_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('login_attempts');
  await knex.schema.dropTableIfExists('password_history');
  await knex.schema.dropTableIfExists('data_access_logs');
  await knex.schema.dropTableIfExists('security_events');
  await knex.schema.dropTableIfExists('user_sessions');
  await knex.schema.dropTableIfExists('audit_logs');
}