import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing entries
  await knex('member_data').del();

  // Get service coordinators for references
  const serviceCoordinators = await knex('service_coordinators').select('id', 'scid');
  const scMap = serviceCoordinators.reduce((acc, sc) => {
    acc[sc.scid] = sc.id;
    return acc;
  }, {} as Record<string, string>);

  // Sample member data
  const memberData = [
    {
      member_data_id: 'MBR001',
      medicaid_id: 'PA123456789',
      hcin_id: 'HCIN001234567',
      first_name: 'John',
      last_name: 'Smith',
      date_of_birth: '1965-03-15',
      plan_id: 'PLN001',
      plan_category: 'Medical',
      plan_type: 'NFCE',
      plan_sub_type: 'HCBS',
      elig_effective_date: '2024-01-01',
      elig_term_date: null,
      waiver_code: '20',
      waiver_effective_date: '2024-01-01',
      waiver_term_date: null,
      aligned: 'Y',
      plan_dual: 'Y',
      dsnp_name: 'Amerihealth',
      member_zone: 'SW',
      pics_score: 75,
      assigned_scid: 'SC001',
      service_coordinator_id: scMap['SC001'],
      contact_info: JSON.stringify({
        phone: '215-555-0123',
        email: 'john.smith@email.com',
        address: {
          street1: '123 Main St',
          street2: 'Apt 2B',
          city: 'Philadelphia',
          state: 'PA',
          zipCode: '19101'
        }
      }),
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      member_data_id: 'MBR002',
      medicaid_id: 'PA987654321',
      hcin_id: 'HCIN987654321',
      first_name: 'Maria',
      last_name: 'Garcia',
      date_of_birth: '1972-08-22',
      plan_id: 'PLN002',
      plan_category: 'Medical',
      plan_type: 'NFI',
      plan_sub_type: 'NFI',
      elig_effective_date: '2024-02-01',
      elig_term_date: null,
      waiver_code: '37',
      waiver_effective_date: '2024-02-01',
      waiver_term_date: null,
      aligned: 'Y',
      plan_dual: 'N',
      dsnp_name: 'Keystone First',
      member_zone: 'SE',
      pics_score: 82,
      assigned_scid: 'SC002',
      service_coordinator_id: scMap['SC002'],
      contact_info: JSON.stringify({
        phone: '610-555-0456',
        email: 'maria.garcia@email.com',
        address: {
          street1: '456 Oak Ave',
          city: 'Chester',
          state: 'PA',
          zipCode: '19013'
        }
      }),
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      member_data_id: 'MBR003',
      medicaid_id: 'PA456789123',
      hcin_id: 'HCIN456789123',
      first_name: 'Robert',
      last_name: 'Johnson',
      date_of_birth: '1958-12-10',
      plan_id: 'PLN003',
      plan_category: 'Medical',
      plan_type: 'NFCE',
      plan_sub_type: 'NF',
      elig_effective_date: '2023-11-15',
      elig_term_date: null,
      waiver_code: '38',
      waiver_effective_date: '2023-11-15',
      waiver_term_date: null,
      aligned: 'Y',
      plan_dual: 'Y',
      dsnp_name: 'Aetna',
      member_zone: 'NE',
      pics_score: 91,
      assigned_scid: 'SC003',
      service_coordinator_id: scMap['SC003'],
      contact_info: JSON.stringify({
        phone: '570-555-0789',
        address: {
          street1: '789 Pine St',
          city: 'Scranton',
          state: 'PA',
          zipCode: '18503'
        }
      }),
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      member_data_id: 'MBR004',
      medicaid_id: 'PA789123456',
      hcin_id: 'HCIN789123456',
      first_name: 'Linda',
      last_name: 'Williams',
      date_of_birth: '1970-05-18',
      plan_id: 'PLN004',
      plan_category: 'RX',
      plan_type: 'NFI',
      plan_sub_type: 'HCBS',
      elig_effective_date: '2024-03-01',
      elig_term_date: null,
      waiver_code: '39',
      waiver_effective_date: '2024-03-01',
      waiver_term_date: null,
      aligned: 'N',
      plan_dual: 'N',
      dsnp_name: 'UPMC',
      member_zone: 'NW',
      pics_score: 68,
      assigned_scid: 'SC004',
      service_coordinator_id: scMap['SC004'],
      contact_info: JSON.stringify({
        phone: '814-555-0321',
        email: 'linda.williams@email.com',
        address: {
          street1: '321 Elm Dr',
          city: 'Erie',
          state: 'PA',
          zipCode: '16501'
        }
      }),
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      member_data_id: 'MBR005',
      medicaid_id: 'PA321654987',
      hcin_id: 'HCIN321654987',
      first_name: 'James',
      last_name: 'Brown',
      date_of_birth: '1963-09-25',
      plan_id: 'PLN005',
      plan_category: 'Vision',
      plan_type: 'NFCE',
      plan_sub_type: 'HCBS',
      elig_effective_date: '2024-01-15',
      elig_term_date: null,
      waiver_code: '20',
      waiver_effective_date: '2024-01-15',
      waiver_term_date: null,
      aligned: 'Y',
      plan_dual: 'Y',
      dsnp_name: 'PHW',
      member_zone: 'LC',
      pics_score: 79,
      assigned_scid: 'SC005',
      service_coordinator_id: scMap['SC005'],
      contact_info: JSON.stringify({
        phone: '717-555-0654',
        address: {
          street1: '654 Maple Ln',
          city: 'Lancaster',
          state: 'PA',
          zipCode: '17601'
        }
      }),
      last_updated: new Date(),
      created_at: new Date()
    }
  ];

  // Insert sample data
  await knex('member_data').insert(memberData);
}