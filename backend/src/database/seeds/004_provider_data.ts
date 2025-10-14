import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing entries
  await knex('provider_data').del();

  // Sample provider data
  const providerData = [
    {
      id: 'PRV001',
      name: 'Philadelphia General Hospital',
      npi: '1234567890',
      taxonomy: '282N00000X',
      provider_entity: 'Organization',
      provider_type: 'General Acute Care Hospital',
      provider_type_code: 'HOSP001',
      organization_type: 'Hospital System',
      specialty: 'Internal Medicine',
      specialty_code: 'IM001',
      sub_specialty: 'Geriatric Medicine',
      network_status: 'in_network',
      relationship_specialist_name: 'Jennifer Adams',
      contact_info: JSON.stringify({
        phone: '215-555-1000',
        email: 'admin@phillygeneral.org',
        address: {
          street1: '1000 Medical Center Dr',
          city: 'Philadelphia',
          state: 'PA',
          zipCode: '19107'
        }
      }),
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: 'PRV002',
      name: 'Dr. Sarah Mitchell, MD',
      npi: '2345678901',
      taxonomy: '207Q00000X',
      provider_entity: 'Individual',
      provider_type: 'Family Medicine Physician',
      provider_type_code: 'PHYS002',
      organization_type: 'Solo Practice',
      specialty: 'Family Medicine',
      specialty_code: 'FM001',
      sub_specialty: 'Preventive Medicine',
      network_status: 'in_network',
      relationship_specialist_name: 'Michael Roberts',
      contact_info: JSON.stringify({
        phone: '610-555-2000',
        email: 'office@drmitchell.com',
        address: {
          street1: '500 Health Plaza',
          street2: 'Suite 200',
          city: 'West Chester',
          state: 'PA',
          zipCode: '19380'
        }
      }),
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: 'PRV003',
      name: 'Northeast Rehabilitation Center',
      npi: '3456789012',
      taxonomy: '324500000X',
      provider_entity: 'Organization',
      provider_type: 'Rehabilitation Hospital',
      provider_type_code: 'REHAB001',
      organization_type: 'Specialty Hospital',
      specialty: 'Physical Medicine & Rehabilitation',
      specialty_code: 'PMR001',
      sub_specialty: 'Neurological Rehabilitation',
      network_status: 'in_network',
      relationship_specialist_name: 'Lisa Chen',
      contact_info: JSON.stringify({
        phone: '570-555-3000',
        email: 'info@nerehab.org',
        address: {
          street1: '300 Recovery Way',
          city: 'Scranton',
          state: 'PA',
          zipCode: '18505'
        }
      }),
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: 'PRV004',
      name: 'Community Home Health Services',
      npi: '4567890123',
      taxonomy: '251E00000X',
      provider_entity: 'Organization',
      provider_type: 'Home Health Agency',
      provider_type_code: 'HHA001',
      organization_type: 'Home Health Agency',
      specialty: 'Home Health Care',
      specialty_code: 'HHC001',
      sub_specialty: 'Skilled Nursing',
      network_status: 'in_network',
      relationship_specialist_name: 'David Park',
      contact_info: JSON.stringify({
        phone: '814-555-4000',
        email: 'services@communityhh.com',
        address: {
          street1: '400 Care Circle',
          city: 'Erie',
          state: 'PA',
          zipCode: '16503'
        }
      }),
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: 'PRV005',
      name: 'Dr. Robert Kim, MD',
      npi: '5678901234',
      taxonomy: '207RG0100X',
      provider_entity: 'Individual',
      provider_type: 'Gastroenterologist',
      provider_type_code: 'PHYS005',
      organization_type: 'Group Practice',
      specialty: 'Gastroenterology',
      specialty_code: 'GI001',
      sub_specialty: 'Hepatology',
      network_status: 'pending',
      relationship_specialist_name: 'Amanda Foster',
      contact_info: JSON.stringify({
        phone: '717-555-5000',
        email: 'drkim@digestivehealth.com',
        address: {
          street1: '600 Wellness Blvd',
          street2: 'Medical Building C',
          city: 'Lancaster',
          state: 'PA',
          zipCode: '17603'
        }
      }),
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: 'PRV006',
      name: 'Suburban Nursing Home',
      npi: '6789012345',
      taxonomy: '314000000X',
      provider_entity: 'Organization',
      provider_type: 'Skilled Nursing Facility',
      provider_type_code: 'SNF001',
      organization_type: 'Long-term Care Facility',
      specialty: 'Long-term Care',
      specialty_code: 'LTC001',
      sub_specialty: 'Memory Care',
      network_status: 'out_of_network',
      relationship_specialist_name: 'Karen Williams',
      contact_info: JSON.stringify({
        phone: '215-555-6000',
        email: 'admin@suburbannh.org',
        address: {
          street1: '700 Senior Way',
          city: 'Norristown',
          state: 'PA',
          zipCode: '19401'
        }
      }),
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: 'PRV007',
      name: 'Dr. Maria Rodriguez, LCSW',
      npi: '7890123456',
      taxonomy: '104100000X',
      provider_entity: 'Individual',
      provider_type: 'Clinical Social Worker',
      provider_type_code: 'SW001',
      organization_type: 'Solo Practice',
      specialty: 'Clinical Social Work',
      specialty_code: 'CSW001',
      sub_specialty: 'Geriatric Social Work',
      network_status: 'in_network',
      relationship_specialist_name: 'Thomas Lee',
      contact_info: JSON.stringify({
        phone: '610-555-7000',
        email: 'mrodriguez@behavioralhealth.com',
        address: {
          street1: '800 Counseling Center Dr',
          city: 'Reading',
          state: 'PA',
          zipCode: '19601'
        }
      }),
      last_updated: new Date(),
      created_at: new Date()
    },
    {
      id: 'PRV008',
      name: 'Central PA Medical Equipment',
      npi: '8901234567',
      taxonomy: '332B00000X',
      provider_entity: 'Organization',
      provider_type: 'Durable Medical Equipment Supplier',
      provider_type_code: 'DME001',
      organization_type: 'Medical Equipment Supplier',
      specialty: 'Durable Medical Equipment',
      specialty_code: 'DME001',
      sub_specialty: 'Mobility Equipment',
      network_status: 'terminated',
      relationship_specialist_name: 'Rachel Green',
      contact_info: JSON.stringify({
        phone: '717-555-8000',
        email: 'sales@centralpadme.com',
        address: {
          street1: '900 Equipment Blvd',
          city: 'Harrisburg',
          state: 'PA',
          zipCode: '17101'
        }
      }),
      last_updated: new Date(),
      created_at: new Date()
    }
  ];

  // Insert sample data
  await knex('provider_data').insert(providerData);
}