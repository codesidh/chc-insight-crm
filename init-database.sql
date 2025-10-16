-- CHC Insight CRM Database Initialization
-- Essential tables for MVP deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    configuration JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    region VARCHAR(100),
    member_panel JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_tenant_name ON roles(tenant_id, name);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_user_role ON user_roles(user_id, role_id);

-- Create form_categories table
CREATE TABLE IF NOT EXISTS form_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_form_categories_tenant_name ON form_categories(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_form_categories_is_active ON form_categories(is_active);

-- Create form_types table
CREATE TABLE IF NOT EXISTS form_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES form_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_form_types_category_name ON form_types(category_id, name);
CREATE INDEX IF NOT EXISTS idx_form_types_is_active ON form_types(is_active);

-- Create form_templates table
CREATE TABLE IF NOT EXISTS form_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type_id UUID NOT NULL REFERENCES form_types(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    questions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_form_templates_type_id ON form_templates(type_id);
CREATE INDEX IF NOT EXISTS idx_form_templates_is_active ON form_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_form_templates_is_published ON form_templates(is_published);

-- Create form_instances table
CREATE TABLE IF NOT EXISTS form_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,
    member_id VARCHAR(255),
    provider_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    responses JSONB DEFAULT '{}',
    submitted_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_form_instances_template_id ON form_instances(template_id);
CREATE INDEX IF NOT EXISTS idx_form_instances_status ON form_instances(status);
CREATE INDEX IF NOT EXISTS idx_form_instances_member_id ON form_instances(member_id);
CREATE INDEX IF NOT EXISTS idx_form_instances_provider_id ON form_instances(provider_id);

-- Create knex_migrations table for migration tracking
CREATE TABLE IF NOT EXISTS knex_migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    batch INTEGER,
    migration_time TIMESTAMP DEFAULT NOW()
);

-- Insert initial migration records
INSERT INTO knex_migrations (name, batch) VALUES 
('001_create_tenants_and_base_tables.js', 1),
('002_create_hierarchical_form_tables.js', 1)
ON CONFLICT DO NOTHING;

-- Create default tenant
INSERT INTO tenants (id, name, subdomain, is_active) VALUES 
('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'default', true)
ON CONFLICT DO NOTHING;

-- Create default admin user (password: admin123)
INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, is_active) VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin@chc-insight.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', 'Admin', 'User', true)
ON CONFLICT DO NOTHING;

-- Create default admin role
INSERT INTO roles (id, tenant_id, name, description, permissions, is_active, created_by) VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Administrator', 'Full system access', '["*"]', true, '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Create default form categories
INSERT INTO form_categories (id, tenant_id, name, description, display_order, created_by) VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Cases', 'Case management forms', 1, '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Assessments', 'Assessment forms', 2, '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Create default form types
INSERT INTO form_types (id, tenant_id, category_id, name, description, display_order, created_by) VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Initial Assessment', 'Initial member assessment', 1, '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Care Plan Review', 'Periodic care plan review', 1, '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

COMMIT;