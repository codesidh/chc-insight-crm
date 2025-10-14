import { Knex } from 'knex';
import bcrypt from 'bcryptjs';
import { UserRole } from '../../types';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data in reverse order of dependencies
  await knex('user_roles').del();
  await knex('roles').del();
  await knex('users').del();
  await knex('tenants').del();

  // Create default tenant
  const [tenant] = await knex('tenants').insert({
    name: 'CHC Insight Demo',
    subdomain: 'demo',
    configuration: JSON.stringify({
      branding: {
        primaryColor: '#0066cc',
        secondaryColor: '#004499'
      },
      features: {
        enabledModules: ['forms', 'workflows', 'reports', 'users']
      }
    }),
    is_active: true
  }).returning('*');

  console.log('Created tenant:', tenant.name);

  // Create default roles with permissions
  const roles = [
    {
      tenant_id: tenant.id,
      name: UserRole.ADMINISTRATOR,
      description: 'Full system access and administration capabilities',
      permissions: JSON.stringify([
        {
          resource: 'forms',
          actions: ['create', 'read', 'update', 'delete', 'assign', 'approve']
        },
        {
          resource: 'users',
          actions: ['create', 'read', 'update', 'delete', 'manage_roles']
        },
        {
          resource: 'reports',
          actions: ['create', 'read', 'schedule', 'export']
        },
        {
          resource: 'system',
          actions: ['configure', 'monitor', 'audit']
        },
        {
          resource: 'tenants',
          actions: ['create', 'read', 'update', 'delete']
        }
      ])
    },
    {
      tenant_id: tenant.id,
      name: UserRole.SERVICE_COORDINATOR,
      description: 'Service coordination and case management',
      permissions: JSON.stringify([
        {
          resource: 'forms',
          actions: ['create', 'read', 'update', 'submit']
        },
        {
          resource: 'members',
          actions: ['read', 'search']
        },
        {
          resource: 'providers',
          actions: ['read', 'search']
        },
        {
          resource: 'reports',
          actions: ['read', 'export']
        }
      ])
    },
    {
      tenant_id: tenant.id,
      name: UserRole.UM_NURSE,
      description: 'Utilization management and clinical review',
      permissions: JSON.stringify([
        {
          resource: 'forms',
          actions: ['read', 'update', 'approve', 'reject']
        },
        {
          resource: 'members',
          actions: ['read', 'search']
        },
        {
          resource: 'providers',
          actions: ['read', 'search']
        },
        {
          resource: 'reports',
          actions: ['read', 'export']
        },
        {
          resource: 'clinical_data',
          actions: ['read', 'update']
        }
      ])
    },
    {
      tenant_id: tenant.id,
      name: UserRole.QM_STAFF,
      description: 'Quality management and compliance',
      permissions: JSON.stringify([
        {
          resource: 'forms',
          actions: ['read', 'audit', 'approve']
        },
        {
          resource: 'reports',
          actions: ['create', 'read', 'schedule', 'export']
        },
        {
          resource: 'quality_metrics',
          actions: ['read', 'update', 'analyze']
        },
        {
          resource: 'compliance',
          actions: ['read', 'monitor', 'report']
        }
      ])
    },
    {
      tenant_id: tenant.id,
      name: UserRole.COMMUNICATIONS_TEAM,
      description: 'Member and provider communications',
      permissions: JSON.stringify([
        {
          resource: 'forms',
          actions: ['read', 'update']
        },
        {
          resource: 'members',
          actions: ['read', 'search', 'contact']
        },
        {
          resource: 'providers',
          actions: ['read', 'search', 'contact']
        },
        {
          resource: 'communications',
          actions: ['create', 'read', 'send']
        }
      ])
    },
    {
      tenant_id: tenant.id,
      name: UserRole.MANAGER,
      description: 'Team management and oversight',
      permissions: JSON.stringify([
        {
          resource: 'forms',
          actions: ['read', 'approve', 'assign', 'reassign']
        },
        {
          resource: 'reports',
          actions: ['create', 'read', 'schedule', 'export']
        },
        {
          resource: 'team',
          actions: ['view_performance', 'manage_workload']
        },
        {
          resource: 'users',
          actions: ['read', 'assign_work']
        }
      ])
    }
  ];

  const insertedRoles = await knex('roles').insert(roles).returning('*');
  console.log('Created roles:', insertedRoles.map(r => r.name));

  // Find administrator role
  const adminRole = insertedRoles.find(r => r.name === UserRole.ADMINISTRATOR);
  if (!adminRole) {
    throw new Error('Administrator role not created');
  }

  // Create default admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  
  const [adminUser] = await knex('users').insert({
    tenant_id: tenant.id,
    email: 'admin@chc-insight.com',
    password_hash: adminPasswordHash,
    first_name: 'System',
    last_name: 'Administrator',
    region: 'All',
    is_active: true,
    created_by: null // Self-created
  }).returning('*');

  console.log('Created admin user:', adminUser.email);

  // Assign administrator role to admin user
  await knex('user_roles').insert({
    user_id: adminUser.id,
    role_id: adminRole.id,
    assigned_by: adminUser.id
  });

  console.log('Assigned administrator role to admin user');

  // Create sample form categories
  const categories = [
    {
      tenant_id: tenant.id,
      name: 'cases',
      description: 'Case management forms including referrals, appeals, and grievances',
      is_active: true,
      created_by: adminUser.id
    },
    {
      tenant_id: tenant.id,
      name: 'assessments',
      description: 'Assessment forms for health risk, satisfaction, and performance evaluation',
      is_active: true,
      created_by: adminUser.id
    }
  ];

  const insertedCategories = await knex('form_categories').insert(categories).returning('*');
  console.log('Created form categories:', insertedCategories.map(c => c.name));

  // Create sample form types
  const casesCategory = insertedCategories.find(c => c.name === 'cases');
  const assessmentsCategory = insertedCategories.find(c => c.name === 'assessments');

  const formTypes = [
    // Cases types
    {
      category_id: casesCategory!.id,
      tenant_id: tenant.id,
      name: 'BH Referrals',
      description: 'Behavioral health referral forms',
      business_rules: JSON.stringify([
        {
          id: 'due_date_rule',
          name: 'Standard Due Date',
          description: 'Forms due within 5 business days',
          ruleType: 'due_date',
          conditions: {},
          actions: { daysFromCreation: 5, excludeWeekends: true },
          isActive: true
        }
      ]),
      is_active: true,
      created_by: adminUser.id
    },
    {
      category_id: casesCategory!.id,
      tenant_id: tenant.id,
      name: 'Appeals',
      description: 'Member appeal forms',
      business_rules: JSON.stringify([
        {
          id: 'urgent_due_date',
          name: 'Urgent Appeal Due Date',
          description: 'Appeals due within 2 business days',
          ruleType: 'due_date',
          conditions: {},
          actions: { daysFromCreation: 2, excludeWeekends: true },
          isActive: true
        }
      ]),
      is_active: true,
      created_by: adminUser.id
    },
    {
      category_id: casesCategory!.id,
      tenant_id: tenant.id,
      name: 'Grievances',
      description: 'Member grievance forms',
      business_rules: JSON.stringify([]),
      is_active: true,
      created_by: adminUser.id
    },
    // Assessment types
    {
      category_id: assessmentsCategory!.id,
      tenant_id: tenant.id,
      name: 'Health Risk (HDM)',
      description: 'Health risk assessment and health data management',
      business_rules: JSON.stringify([
        {
          id: 'annual_assessment',
          name: 'Annual Assessment Schedule',
          description: 'Annual assessments due within 30 days',
          ruleType: 'due_date',
          conditions: {},
          actions: { daysFromCreation: 30 },
          isActive: true
        }
      ]),
      is_active: true,
      created_by: adminUser.id
    },
    {
      category_id: assessmentsCategory!.id,
      tenant_id: tenant.id,
      name: 'Member Satisfaction',
      description: 'Member satisfaction surveys and feedback',
      business_rules: JSON.stringify([]),
      is_active: true,
      created_by: adminUser.id
    },
    {
      category_id: assessmentsCategory!.id,
      tenant_id: tenant.id,
      name: 'Provider Performance',
      description: 'Provider performance evaluation forms',
      business_rules: JSON.stringify([]),
      is_active: true,
      created_by: adminUser.id
    }
  ];

  const insertedFormTypes = await knex('form_types').insert(formTypes).returning('*');
  console.log('Created form types:', insertedFormTypes.map(t => t.name));

  // Create sample member staging data
  const memberStagingData = [
    {
      member_id: 'MBR001',
      tenant_id: tenant.id,
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: new Date('1985-06-15'),
      plan_type: 'Medicaid LTSS',
      ltss_type: 'Community Based',
      level_of_care: 'Intermediate',
      pics_score: 75.5,
      assigned_coordinator: 'Sarah Johnson',
      contact_info: JSON.stringify({
        phone: '555-0123',
        email: 'john.doe@email.com',
        address: {
          street1: '123 Main St',
          city: 'Anytown',
          state: 'NY',
          zipCode: '12345'
        }
      })
    },
    {
      member_id: 'MBR002',
      tenant_id: tenant.id,
      first_name: 'Jane',
      last_name: 'Smith',
      date_of_birth: new Date('1978-03-22'),
      plan_type: 'Medicaid LTSS',
      ltss_type: 'Nursing Home',
      level_of_care: 'Skilled',
      pics_score: 92.0,
      assigned_coordinator: 'Michael Brown',
      contact_info: JSON.stringify({
        phone: '555-0456',
        email: 'jane.smith@email.com',
        address: {
          street1: '456 Oak Ave',
          city: 'Somewhere',
          state: 'NY',
          zipCode: '12346'
        }
      })
    }
  ];

  await knex('member_staging').insert(memberStagingData);
  console.log('Created sample member staging data');

  // Create sample provider staging data
  const providerStagingData = [
    {
      provider_id: 'PRV001',
      tenant_id: tenant.id,
      npi: '1234567890',
      name: 'Behavioral Health Associates',
      specialty: 'Behavioral Health',
      network_status: 'in_network',
      contact_info: JSON.stringify({
        phone: '555-0789',
        email: 'contact@bha.com',
        address: {
          street1: '789 Professional Blvd',
          city: 'Healthcare City',
          state: 'NY',
          zipCode: '12347'
        }
      })
    },
    {
      provider_id: 'PRV002',
      tenant_id: tenant.id,
      npi: '0987654321',
      name: 'Community Care Services',
      specialty: 'Home Health',
      network_status: 'in_network',
      contact_info: JSON.stringify({
        phone: '555-0321',
        email: 'info@communitycare.com',
        address: {
          street1: '321 Care Lane',
          city: 'Service Town',
          state: 'NY',
          zipCode: '12348'
        }
      })
    }
  ];

  await knex('provider_staging').insert(providerStagingData);
  console.log('Created sample provider staging data');

  console.log('\n✅ Initial data seeding completed successfully!');
  console.log('\n📋 Default Login Credentials:');
  console.log('   Email: admin@chc-insight.com');
  console.log('   Password: admin123');
  console.log('\n⚠️  Please change the default password after first login!');
}