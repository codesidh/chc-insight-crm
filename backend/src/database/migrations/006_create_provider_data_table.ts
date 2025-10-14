import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('provider_data', (table) => {
    // Primary identifier
    table.string('id', 50).primary();
    
    // Provider identifiers and basic information
    table.string('name', 255).notNullable();
    table.string('npi', 10).notNullable().unique().index();
    table.string('taxonomy', 50).notNullable();
    
    // Provider classification
    table.string('provider_entity', 255).notNullable();
    table.string('provider_type', 255).notNullable();
    table.string('provider_type_code', 50).notNullable();
    table.string('organization_type', 255).notNullable();
    
    // Specialty information
    table.string('specialty', 255).notNullable();
    table.string('specialty_code', 50).notNullable();
    table.string('sub_specialty', 255).notNullable();
    
    // Network and relationship information
    table.enum('network_status', ['in_network', 'out_of_network', 'pending', 'terminated']).notNullable().index();
    table.string('relationship_specialist_name', 255).notNullable();
    
    // Contact information (JSON field)
    table.json('contact_info').notNullable();
    
    // Audit fields
    table.timestamp('last_updated').notNullable().defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes for common queries
    table.index(['name']);
    table.index(['taxonomy']);
    table.index(['provider_type']);
    table.index(['provider_type_code']);
    table.index(['organization_type']);
    table.index(['specialty']);
    table.index(['specialty_code']);
    table.index(['sub_specialty']);
    table.index(['relationship_specialist_name']);
    table.index(['last_updated']);
    
    // Composite indexes for common search patterns
    table.index(['network_status', 'specialty']);
    table.index(['provider_type', 'specialty']);
    table.index(['specialty', 'sub_specialty']);
    table.index(['network_status', 'provider_type']);
  });

  // Add comments to the table
  await knex.raw(`
    COMMENT ON TABLE provider_data IS 'Enhanced provider data for healthcare network management';
    COMMENT ON COLUMN provider_data.id IS 'Primary identifier for provider record';
    COMMENT ON COLUMN provider_data.name IS 'Provider or organization name';
    COMMENT ON COLUMN provider_data.npi IS '10-digit National Provider Identifier';
    COMMENT ON COLUMN provider_data.taxonomy IS 'Healthcare provider taxonomy code';
    COMMENT ON COLUMN provider_data.provider_entity IS 'Type of provider entity (individual, organization, etc.)';
    COMMENT ON COLUMN provider_data.provider_type IS 'Detailed provider type classification';
    COMMENT ON COLUMN provider_data.provider_type_code IS 'Standardized provider type code';
    COMMENT ON COLUMN provider_data.organization_type IS 'Type of healthcare organization';
    COMMENT ON COLUMN provider_data.specialty IS 'Primary medical specialty';
    COMMENT ON COLUMN provider_data.specialty_code IS 'Standardized specialty code';
    COMMENT ON COLUMN provider_data.sub_specialty IS 'Sub-specialty or additional specialization';
    COMMENT ON COLUMN provider_data.network_status IS 'Current network participation status';
    COMMENT ON COLUMN provider_data.relationship_specialist_name IS 'Assigned relationship specialist for provider management';
    COMMENT ON COLUMN provider_data.contact_info IS 'JSON object containing phone, email, and address information';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('provider_data');
}