import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('member_data', (table) => {
    // Primary identifier
    table.string('member_data_id', 50).primary();
    
    // Member identifiers
    table.string('medicaid_id', 50).notNullable().unique().index();
    table.string('hcin_id', 50).notNullable().unique().index();
    
    // Personal information
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.date('date_of_birth').notNullable();
    
    // Plan information
    table.string('plan_id', 50).notNullable();
    table.enum('plan_category', ['Medical', 'RX', 'Vision']).notNullable();
    table.enum('plan_type', ['NFCE', 'NFI']).notNullable();
    table.enum('plan_sub_type', ['HCBS', 'NF', 'NFI']).notNullable();
    
    // Eligibility dates
    table.date('elig_effective_date').notNullable();
    table.date('elig_term_date').nullable();
    
    // Waiver information
    table.enum('waiver_code', ['20', '37', '38', '39']).notNullable();
    table.date('waiver_effective_date').notNullable();
    table.date('waiver_term_date').nullable();
    
    // Plan status
    table.enum('aligned', ['Y', 'N']).notNullable();
    table.enum('plan_dual', ['Y', 'N']).notNullable();
    table.enum('dsnp_name', ['Amerihealth', 'Keystone First', 'Aetna', 'UPMC', 'PHW']).notNullable();
    
    // Geographic and assignment information
    table.enum('member_zone', ['SW', 'SE', 'NE', 'NW', 'LC']).notNullable().index();
    table.integer('pics_score').notNullable().checkBetween([0, 100]);
    table.string('assigned_scid', 50).notNullable().index();
    
    // Service Coordinator reference (foreign key)
    table.uuid('service_coordinator_id').nullable().references('id').inTable('service_coordinators').onDelete('SET NULL');
    
    // Contact information (JSON field)
    table.json('contact_info').nullable();
    
    // Audit fields
    table.timestamp('last_updated').notNullable().defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes for common queries
    table.index(['last_name', 'first_name']);
    table.index(['plan_category']);
    table.index(['plan_type']);
    table.index(['waiver_code']);
    table.index(['aligned']);
    table.index(['plan_dual']);
    table.index(['dsnp_name']);
    table.index(['pics_score']);
    table.index(['elig_effective_date']);
    table.index(['waiver_effective_date']);
    table.index(['service_coordinator_id']);
    
    // Composite indexes for common search patterns
    table.index(['member_zone', 'plan_category']);
    table.index(['assigned_scid', 'member_zone']);
    table.index(['plan_type', 'plan_sub_type']);
    table.index(['waiver_code', 'member_zone']);
  });

  // Add comments to the table
  await knex.raw(`
    COMMENT ON TABLE member_data IS 'Enhanced member data for LTSS managed care members';
    COMMENT ON COLUMN member_data.member_data_id IS 'Primary identifier for member data record';
    COMMENT ON COLUMN member_data.medicaid_id IS 'State Medicaid identifier';
    COMMENT ON COLUMN member_data.hcin_id IS 'Health Care Identification Number';
    COMMENT ON COLUMN member_data.plan_category IS 'Type of plan coverage: Medical, RX, or Vision';
    COMMENT ON COLUMN member_data.plan_type IS 'Plan type: NFCE (Nursing Facility Care Eligible) or NFI (Nursing Facility Ineligible)';
    COMMENT ON COLUMN member_data.plan_sub_type IS 'Plan sub-type: HCBS (Home and Community Based Services), NF (Nursing Facility), or NFI';
    COMMENT ON COLUMN member_data.waiver_code IS 'Waiver program code: 20, 37, 38, or 39';
    COMMENT ON COLUMN member_data.aligned IS 'Whether member is aligned with managed care organization';
    COMMENT ON COLUMN member_data.plan_dual IS 'Whether member has dual Medicare/Medicaid eligibility';
    COMMENT ON COLUMN member_data.dsnp_name IS 'Dual Special Needs Plan name';
    COMMENT ON COLUMN member_data.member_zone IS 'Geographic service zone assignment';
    COMMENT ON COLUMN member_data.pics_score IS 'Pennsylvania Independent Care Score (0-100)';
    COMMENT ON COLUMN member_data.assigned_scid IS 'Assigned Service Coordinator identifier (business key)';
    COMMENT ON COLUMN member_data.service_coordinator_id IS 'Foreign key reference to service_coordinators table';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('member_data');
}