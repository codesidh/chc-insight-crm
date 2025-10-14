import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing entries
  await knex('service_coordinators').del();

  // Get a tenant ID (assuming we have at least one tenant)
  const tenant = await knex('tenants').first();
  if (!tenant) {
    throw new Error('No tenant found. Please run tenant seeds first.');
  }

  // Get a user ID for created_by (assuming we have at least one user)
  const user = await knex('users').first();
  if (!user) {
    throw new Error('No user found. Please run user seeds first.');
  }

  // Sample service coordinators data
  const serviceCoordinators = [
    // Directors (top level)
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      tenant_id: tenant.id,
      scid: 'DIR001',
      first_name: 'Robert',
      last_name: 'Wilson',
      email: 'robert.wilson@chc.org',
      phone: '215-555-1001',
      organization: 'Community Health Partners',
      zone: 'SW',
      supervisor_id: null,
      manager_id: null,
      director_id: null,
      is_active: true,
      max_caseload: null, // Directors don't carry cases
      current_caseload: 0,
      specializations: JSON.stringify(['Leadership', 'LTSS Management']),
      license_number: null,
      hire_date: '2020-01-15',
      created_by: user.id,
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      tenant_id: tenant.id,
      scid: 'DIR002',
      first_name: 'Patricia',
      last_name: 'Taylor',
      email: 'patricia.taylor@chc.org',
      phone: '610-555-1002',
      organization: 'Southeast Care Coordination',
      zone: 'SE',
      supervisor_id: null,
      manager_id: null,
      director_id: null,
      is_active: true,
      max_caseload: null,
      current_caseload: 0,
      specializations: JSON.stringify(['Leadership', 'Quality Management']),
      license_number: null,
      hire_date: '2019-08-20',
      created_by: user.id,
      last_updated: new Date(),
      created_at: new Date()
    },
    
    // Managers (second level)
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      tenant_id: tenant.id,
      scid: 'MGR001',
      first_name: 'Lisa',
      last_name: 'Davis',
      email: 'lisa.davis@chc.org',
      phone: '215-555-1003',
      organization: 'Community Health Partners',
      zone: 'SW',
      supervisor_id: null,
      manager_id: null,
      director_id: '550e8400-e29b-41d4-a716-446655440001', // Reports to DIR001
      is_active: true,
      max_caseload: 10, // Managers may carry small caseloads
      current_caseload: 3,
      specializations: JSON.stringify(['Case Management', 'HCBS']),
      license_number: 'LSW123456',
      hire_date: '2021-03-10',
      created_by: user.id,
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      tenant_id: tenant.id,
      scid: 'MGR002',
      first_name: 'Thomas',
      last_name: 'Anderson',
      email: 'thomas.anderson@chc.org',
      phone: '610-555-1004',
      organization: 'Southeast Care Coordination',
      zone: 'SE',
      supervisor_id: null,
      manager_id: null,
      director_id: '550e8400-e29b-41d4-a716-446655440002', // Reports to DIR002
      is_active: true,
      max_caseload: 8,
      current_caseload: 2,
      specializations: JSON.stringify(['Case Management', 'Behavioral Health']),
      license_number: 'LCSW789012',
      hire_date: '2021-06-15',
      created_by: user.id,
      last_updated: new Date(),
      created_at: new Date()
    },
    
    // Supervisors (third level)
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      tenant_id: tenant.id,
      scid: 'SUP001',
      first_name: 'Michael',
      last_name: 'Brown',
      email: 'michael.brown@chc.org',
      phone: '215-555-1005',
      organization: 'Community Health Partners',
      zone: 'SW',
      supervisor_id: null,
      manager_id: '550e8400-e29b-41d4-a716-446655440003', // Reports to MGR001
      director_id: '550e8400-e29b-41d4-a716-446655440001',
      is_active: true,
      max_caseload: 15,
      current_caseload: 8,
      specializations: JSON.stringify(['HCBS', 'Geriatric Care']),
      license_number: 'LSW345678',
      hire_date: '2022-01-20',
      created_by: user.id,
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      tenant_id: tenant.id,
      scid: 'SUP002',
      first_name: 'Jennifer',
      last_name: 'Lee',
      email: 'jennifer.lee@chc.org',
      phone: '610-555-1006',
      organization: 'Southeast Care Coordination',
      zone: 'SE',
      supervisor_id: null,
      manager_id: '550e8400-e29b-41d4-a716-446655440004', // Reports to MGR002
      director_id: '550e8400-e29b-41d4-a716-446655440002',
      is_active: true,
      max_caseload: 12,
      current_caseload: 6,
      specializations: JSON.stringify(['Behavioral Health', 'Crisis Intervention']),
      license_number: 'LCSW456789',
      hire_date: '2022-04-05',
      created_by: user.id,
      last_updated: new Date(),
      created_at: new Date()
    },
    
    // Service Coordinators (front-line staff)
    {
      id: '550e8400-e29b-41d4-a716-446655440007',
      tenant_id: tenant.id,
      scid: 'SC001',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@chc.org',
      phone: '215-555-1007',
      organization: 'Community Health Partners',
      zone: 'SW',
      supervisor_id: '550e8400-e29b-41d4-a716-446655440005', // Reports to SUP001
      manager_id: '550e8400-e29b-41d4-a716-446655440003',
      director_id: '550e8400-e29b-41d4-a716-446655440001',
      is_active: true,
      max_caseload: 25,
      current_caseload: 18,
      specializations: JSON.stringify(['HCBS', 'Adult Services']),
      license_number: 'LSW567890',
      hire_date: '2023-02-15',
      created_by: user.id,
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440008',
      tenant_id: tenant.id,
      scid: 'SC002',
      first_name: 'David',
      last_name: 'Martinez',
      email: 'david.martinez@chc.org',
      phone: '610-555-1008',
      organization: 'Southeast Care Coordination',
      zone: 'SE',
      supervisor_id: '550e8400-e29b-41d4-a716-446655440006', // Reports to SUP002
      manager_id: '550e8400-e29b-41d4-a716-446655440004',
      director_id: '550e8400-e29b-41d4-a716-446655440002',
      is_active: true,
      max_caseload: 30,
      current_caseload: 22,
      specializations: JSON.stringify(['NFI', 'Behavioral Health']),
      license_number: 'LCSW678901',
      hire_date: '2023-05-10',
      created_by: user.id,
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440009',
      tenant_id: tenant.id,
      scid: 'SC003',
      first_name: 'Amanda',
      last_name: 'White',
      email: 'amanda.white@chc.org',
      phone: '570-555-1009',
      organization: 'Northeast Health Services',
      zone: 'NE',
      supervisor_id: null, // No supervisor assigned yet
      manager_id: null,
      director_id: null,
      is_active: true,
      max_caseload: 28,
      current_caseload: 15,
      specializations: JSON.stringify(['HCBS', 'Nursing Facility Transition']),
      license_number: 'LSW789012',
      hire_date: '2023-08-01',
      created_by: user.id,
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      tenant_id: tenant.id,
      scid: 'SC004',
      first_name: 'Christopher',
      last_name: 'Davis',
      email: 'christopher.davis@chc.org',
      phone: '814-555-1010',
      organization: 'Northwest Care Management',
      zone: 'NW',
      supervisor_id: null,
      manager_id: null,
      director_id: null,
      is_active: true,
      max_caseload: 26,
      current_caseload: 19,
      specializations: JSON.stringify(['HCBS', 'Rural Services']),
      license_number: 'LSW890123',
      hire_date: '2023-09-15',
      created_by: user.id,
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      tenant_id: tenant.id,
      scid: 'SC005',
      first_name: 'Michelle',
      last_name: 'Thompson',
      email: 'michelle.thompson@chc.org',
      phone: '717-555-1011',
      organization: 'Lancaster County Services',
      zone: 'LC',
      supervisor_id: null,
      manager_id: null,
      director_id: null,
      is_active: true,
      max_caseload: 24,
      current_caseload: 16,
      specializations: JSON.stringify(['HCBS', 'Aging Services']),
      license_number: 'LSW901234',
      hire_date: '2023-11-01',
      created_by: user.id,
      last_updated: new Date(),
      created_at: new Date()
    }
  ];

  // Insert sample data
  await knex('service_coordinators').insert(serviceCoordinators);
}