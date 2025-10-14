# Enhanced Member and Provider Data Models with Service Coordinator Normalization

## Overview

This document describes the enhanced member and provider data models implemented for the CHC Insight CRM system. These models support comprehensive member and provider management for Long-Term Services and Supports (LTSS) within Managed Care Organization (MCO) environments.

**Key Enhancement**: Service Coordinator data has been normalized into a separate table with proper foreign key relationships, eliminating data redundancy and improving data integrity.

## Member Data Model

### Core Fields

The enhanced `MemberData` interface includes the following fields:

#### Identifiers
- `memberDataId`: Primary identifier for the member data record
- `medicaidId`: State Medicaid identifier
- `hcinId`: Health Care Identification Number

#### Personal Information
- `firstName`: Member's first name
- `lastName`: Member's last name
- `dateOfBirth`: Member's date of birth

#### Plan Information
- `planId`: Plan identifier
- `planCategory`: Type of plan coverage (`Medical`, `RX`, `Vision`)
- `planType`: Plan type (`NFCE` - Nursing Facility Care Eligible, `NFI` - Nursing Facility Ineligible)
- `planSubType`: Plan sub-type (`HCBS` - Home and Community Based Services, `NF` - Nursing Facility, `NFI`)

#### Eligibility and Waiver Information
- `eligEffectiveDate`: Eligibility effective date
- `eligTermDate`: Eligibility termination date (optional)
- `waiverCode`: Waiver program code (`20`, `37`, `38`, `39`)
- `waiverEffectiveDate`: Waiver effective date
- `waiverTermDate`: Waiver termination date (optional)

#### Plan Status
- `aligned`: Whether member is aligned with MCO (`Y`, `N`)
- `planDual`: Whether member has dual Medicare/Medicaid eligibility (`Y`, `N`)
- `dsnpName`: Dual Special Needs Plan name (`Amerihealth`, `Keystone First`, `Aetna`, `UPMC`, `PHW`)

#### Geographic and Care Coordination
- `memberZone`: Geographic service zone (`SW`, `SE`, `NE`, `NW`, `LC`)
- `picsScore`: Pennsylvania Independent Care Score (0-100)
- `assignedSCID`: Assigned Service Coordinator identifier

#### Service Coordinator Reference
- `assignedSCID`: Service Coordinator business identifier (foreign key reference)
- `serviceCoordinator`: Optional populated ServiceCoordinator object via join

#### Audit and Contact Information
- `lastUpdated`: Last update timestamp
- `contactInfo`: Contact information (optional JSON object)

## Service Coordinator Data Model

### Core Fields

The `ServiceCoordinator` interface includes the following fields:

#### Identifiers and Personal Information
- `id`: Primary UUID identifier
- `tenantId`: Tenant reference for multi-tenancy
- `scid`: Service Coordinator business identifier
- `firstName`, `lastName`: Personal name information
- `email`: Primary email address
- `phone`: Phone number (optional)

#### Organization and Location
- `organization`: Organization name
- `zone`: Geographic service zone (`SW`, `SE`, `NE`, `NW`, `LC`)

#### Hierarchy Management
- `supervisorId`: Reference to supervising service coordinator (optional)
- `managerId`: Reference to managing service coordinator (optional)
- `directorId`: Reference to directing service coordinator (optional)

#### Capacity and Status
- `isActive`: Active status flag
- `maxCaseload`: Maximum number of members that can be assigned (optional)
- `currentCaseload`: Current number of assigned members

#### Professional Information
- `specializations`: Array of specialization areas (optional)
- `licenseNumber`: Professional license number (optional)
- `hireDate`: Employment start date

#### Audit Information
- `createdBy`, `updatedBy`: User references for audit trail
- `createdAt`, `updatedAt`: Timestamp information
- `lastUpdated`: Last modification timestamp

### Database Schema

#### Service Coordinators Table

```sql
CREATE TABLE service_coordinators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  scid VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  organization VARCHAR(255) NOT NULL,
  zone ENUM('SW', 'SE', 'NE', 'NW', 'LC') NOT NULL,
  supervisor_id UUID REFERENCES service_coordinators(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES service_coordinators(id) ON DELETE SET NULL,
  director_id UUID REFERENCES service_coordinators(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  max_caseload INTEGER,
  current_caseload INTEGER DEFAULT 0 NOT NULL,
  specializations JSON,
  license_number VARCHAR(50),
  hire_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tenant_id, scid),
  UNIQUE(tenant_id, email)
);
```

#### Member Data Table (Updated)

The member data is stored in the `member_data` table with the following structure:

```sql
CREATE TABLE member_data (
  member_data_id VARCHAR(50) PRIMARY KEY,
  medicaid_id VARCHAR(50) NOT NULL UNIQUE,
  hcin_id VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  plan_category ENUM('Medical', 'RX', 'Vision') NOT NULL,
  plan_type ENUM('NFCE', 'NFI') NOT NULL,
  plan_sub_type ENUM('HCBS', 'NF', 'NFI') NOT NULL,
  elig_effective_date DATE NOT NULL,
  elig_term_date DATE,
  waiver_code ENUM('20', '37', '38', '39') NOT NULL,
  waiver_effective_date DATE NOT NULL,
  waiver_term_date DATE,
  aligned ENUM('Y', 'N') NOT NULL,
  plan_dual ENUM('Y', 'N') NOT NULL,
  dsnp_name ENUM('Amerihealth', 'Keystone First', 'Aetna', 'UPMC', 'PHW') NOT NULL,
  member_zone ENUM('SW', 'SE', 'NE', 'NW', 'LC') NOT NULL,
  pics_score INTEGER CHECK (pics_score BETWEEN 0 AND 100) NOT NULL,
  assigned_scid VARCHAR(50) NOT NULL,
  service_coordinator_id UUID REFERENCES service_coordinators(id) ON DELETE SET NULL,
  contact_info JSON,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Provider Data Model

### Core Fields

The enhanced `ProviderData` interface includes the following fields:

#### Identifiers
- `id`: Primary identifier for the provider record
- `name`: Provider or organization name
- `npi`: 10-digit National Provider Identifier

#### Classification
- `taxonomy`: Healthcare provider taxonomy code
- `providerEntity`: Type of provider entity (individual, organization, etc.)
- `providerType`: Detailed provider type classification
- `providerTypeCode`: Standardized provider type code
- `organizationType`: Type of healthcare organization

#### Specialty Information
- `specialty`: Primary medical specialty
- `specialtyCode`: Standardized specialty code
- `subSpecialty`: Sub-specialty or additional specialization

#### Network and Relationship Management
- `networkStatus`: Current network participation status (`in_network`, `out_of_network`, `pending`, `terminated`)
- `relationshipSpecialistName`: Assigned relationship specialist for provider management

#### Contact and Audit Information
- `contactInfo`: Contact information (JSON object with phone, email, address)
- `lastUpdated`: Last update timestamp

### Database Schema

The provider data is stored in the `provider_data` table with the following structure:

```sql
CREATE TABLE provider_data (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  npi VARCHAR(10) NOT NULL UNIQUE,
  taxonomy VARCHAR(50) NOT NULL,
  provider_entity VARCHAR(255) NOT NULL,
  provider_type VARCHAR(255) NOT NULL,
  provider_type_code VARCHAR(50) NOT NULL,
  organization_type VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  specialty_code VARCHAR(50) NOT NULL,
  sub_specialty VARCHAR(255) NOT NULL,
  network_status ENUM('in_network', 'out_of_network', 'pending', 'terminated') NOT NULL,
  relationship_specialist_name VARCHAR(255) NOT NULL,
  contact_info JSON NOT NULL,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Services

### Service Coordinator Service (`ServiceCoordinatorService`)

Provides comprehensive service coordinator management functionality:

#### Core Methods
- `createServiceCoordinator(data)`: Create new service coordinator
- `updateServiceCoordinator(scId, data)`: Update service coordinator information
- `getServiceCoordinatorById(scId)`: Get service coordinator by UUID
- `getServiceCoordinatorBySCID(scid, tenantId)`: Get service coordinator by business ID
- `searchServiceCoordinators(tenantId, filters, page, limit)`: Advanced search with filters
- `getServiceCoordinatorsByZone(tenantId, zone)`: Get service coordinators by zone
- `updateCaseload(scId, newCaseload, updatedBy)`: Update current caseload
- `getServiceCoordinatorHierarchy(scId)`: Get hierarchy (supervisor, manager, director)

#### Search Filters
- Personal information (name, email)
- Organization and zone filters
- Hierarchy filters (supervisor, manager, director)
- Status and capacity filters (active, caseload ranges)
- Professional information (specializations, hire date ranges)

#### Hierarchy Management
- Self-referencing foreign keys for organizational structure
- Automatic hierarchy resolution in queries
- Cascade handling for organizational changes

### Member Data Service (`MemberDataService`) - Updated

Provides comprehensive member data management functionality:

#### Core Methods
- `getMemberById(memberDataId)`: Get member by primary ID
- `getMemberByMedicaidId(medicaidId)`: Get member by Medicaid ID
- `getMemberByHcinId(hcinId)`: Get member by HCIN ID
- `searchMembers(filters, page, limit)`: Advanced search with filters
- `getMembersByServiceCoordinator(assignedSCID)`: Get members by SC
- `getMembersByZone(memberZone)`: Get members by geographic zone
- `getMemberStatsByZone()`: Get member statistics by zone

#### Search Filters
- Personal information (name, IDs)
- Plan information (category, type, sub-type)
- Waiver information (code, dates)
- Geographic and assignment filters
- Service coordinator filters (via join)
- Date range filters

#### Key Changes
- **Normalized Structure**: Service coordinator data retrieved via JOIN operations
- **Foreign Key Integrity**: Proper referential integrity with service coordinators table
- **Enhanced Queries**: Automatic population of service coordinator information
- **Improved Performance**: Reduced data redundancy and better query optimization

### Provider Data Service (`ProviderDataService`)

Provides comprehensive provider data management functionality:

#### Core Methods
- `getProviderById(providerId)`: Get provider by primary ID
- `getProviderByNPI(npi)`: Get provider by NPI
- `searchProviders(filters, page, limit)`: Advanced search with filters
- `getProvidersByNetworkStatus(status)`: Get providers by network status
- `getProvidersBySpecialty(specialty)`: Get providers by specialty
- `getProvidersByRelationshipSpecialist(name)`: Get providers by relationship specialist
- `quickSearchProviders(query)`: Quick search for form pre-population
- `getProviderStatsByNetworkStatus()`: Get provider statistics by network status
- `getProviderStatsBySpecialty()`: Get provider statistics by specialty

#### Search Filters
- Basic information (name, NPI, taxonomy)
- Classification filters (entity, type, organization)
- Specialty filters (primary, code, sub-specialty)
- Network status and relationship specialist
- Date range filters

### Combined Lookup Service (`MemberProviderLookupService`)

Provides integrated member and provider lookup functionality optimized for form pre-population:

#### Core Methods
- `quickSearch(query, filters)`: Search both members and providers
- `quickSearchMembers(query, zone, limit)`: Quick member search
- `quickSearchProviders(query, status, specialty, limit)`: Quick provider search
- `getMemberAndProvider(memberDataId, providerId)`: Get both records
- `getProvidersByMemberZone(zone, specialty)`: Get providers by member zone
- `getMembersByServiceCoordinator(scid)`: Get members by SC
- `validateMemberProviderCombination(memberDataId, providerId)`: Validate combination

## API Endpoints

### Service Coordinator Endpoints

```
POST /api/service-coordinators
PUT /api/service-coordinators/:scId
GET /api/service-coordinators/:scId
GET /api/service-coordinators/scid/:scid
GET /api/service-coordinators/search
GET /api/service-coordinators/zone/:zone
PUT /api/service-coordinators/:scId/caseload
GET /api/service-coordinators/:scId/hierarchy
```

### Member Data Endpoints

```
GET /api/member-data/:memberDataId
GET /api/member-data/medicaid/:medicaidId
GET /api/member-data/hcin/:hcinId
GET /api/member-data/search
GET /api/member-data/service-coordinator/:assignedSCID
GET /api/member-data/zone/:memberZone
GET /api/member-data/stats/zone
```

### Provider Data Endpoints

```
GET /api/provider-data/:providerId
GET /api/provider-data/npi/:npi
GET /api/provider-data/search
GET /api/provider-data/network-status/:networkStatus
GET /api/provider-data/specialty/:specialty
GET /api/provider-data/relationship-specialist/:relationshipSpecialistName
GET /api/provider-data/quick-search
GET /api/provider-data/stats/network-status
GET /api/provider-data/stats/specialty
```

### Combined Lookup Endpoints

```
GET /api/lookup/quick-search
GET /api/lookup/members/quick-search
GET /api/lookup/providers/quick-search
GET /api/lookup/member-provider/:memberDataId/:providerId
GET /api/lookup/providers/by-member-zone/:memberZone
GET /api/lookup/members/by-service-coordinator/:assignedSCID
POST /api/lookup/validate-member-provider
```

## Usage Examples

### Service Coordinator Management

```typescript
// Create a new service coordinator
const newSC = await fetch('/api/service-coordinators', {
  method: 'POST',
  body: JSON.stringify({
    scid: 'SC006',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@chc.org',
    organization: 'Community Health Partners',
    zone: 'SW',
    supervisorId: 'uuid-of-supervisor',
    maxCaseload: 25,
    specializations: ['HCBS', 'Geriatric Care'],
    hireDate: '2024-01-15'
  })
});

// Update caseload
const caseloadUpdate = await fetch('/api/service-coordinators/uuid/caseload', {
  method: 'PUT',
  body: JSON.stringify({ newCaseload: 20 })
});

// Get hierarchy information
const hierarchy = await fetch('/api/service-coordinators/uuid/hierarchy');
```

### Form Pre-population

```typescript
// Quick search for members and providers
const result = await fetch('/api/lookup/quick-search?query=John&limit=5');

// Get specific member and provider for form
const data = await fetch('/api/lookup/member-provider/MBR001/PRV001');

// Validate member-provider combination
const validation = await fetch('/api/lookup/validate-member-provider', {
  method: 'POST',
  body: JSON.stringify({ memberDataId: 'MBR001', providerId: 'PRV001' })
});
```

### Advanced Searches

```typescript
// Search service coordinators with filters
const serviceCoordinators = await fetch('/api/service-coordinators/search?' + new URLSearchParams({
  zone: 'SW',
  isActive: 'true',
  currentCaseloadMax: '20',
  specializations: 'HCBS',
  page: '1',
  limit: '20'
}));

// Search members with service coordinator zone filter
const members = await fetch('/api/member-data/search?' + new URLSearchParams({
  planCategory: 'Medical',
  memberZone: 'SW',
  serviceCoordinatorZone: 'SW', // Filter by SC zone via join
  picsScoreMin: '70',
  page: '1',
  limit: '20'
}));

// Search providers with filters
const providers = await fetch('/api/provider-data/search?' + new URLSearchParams({
  specialty: 'Internal Medicine',
  networkStatus: 'in_network',
  page: '1',
  limit: '20'
}));
```

## Security and Compliance

### Authentication and Authorization
- All endpoints require authentication via JWT tokens
- Role-based access control for different user types
- Audit trails for all data access and modifications

### Data Privacy
- PHI (Protected Health Information) handling compliance
- Secure data transmission and storage
- Access logging and monitoring

### Validation and Error Handling
- Comprehensive input validation using Zod schemas
- Standardized error response format
- Proper HTTP status codes and error messages

## Performance Considerations

### Database Optimization
- Comprehensive indexing strategy for common query patterns
- Optimized queries with proper joins and filtering
- Connection pooling for database connections

### Caching Strategy
- Redis caching for frequently accessed data
- Query result caching for expensive operations
- Cache invalidation strategies

### Pagination and Limits
- Consistent pagination across all list endpoints
- Configurable limits with reasonable defaults
- Total count information for UI pagination

## Benefits of Normalized Structure

### Data Integrity
- **Single Source of Truth**: Service coordinator information maintained in one place
- **Referential Integrity**: Foreign key constraints ensure data consistency
- **Cascade Operations**: Proper handling of organizational changes

### Performance Improvements
- **Reduced Storage**: Elimination of redundant service coordinator data
- **Optimized Queries**: Better query performance with proper indexing
- **Efficient Updates**: Update service coordinator info once, affects all related members

### Maintenance Benefits
- **Easier Updates**: Organizational changes require single table updates
- **Data Consistency**: No risk of inconsistent service coordinator information
- **Audit Trails**: Complete audit history for service coordinator changes

## Future Enhancements

### Potential Improvements
1. **Hierarchical Reporting**: Advanced reporting based on service coordinator hierarchy
2. **Workload Balancing**: Automatic member assignment based on caseload capacity
3. **Geographic Integration**: Enhanced geographic mapping between member zones and provider locations
4. **Advanced Analytics**: More sophisticated reporting and analytics capabilities
5. **Real-time Updates**: WebSocket integration for real-time caseload updates
6. **Bulk Operations**: Batch processing for large data imports/exports
7. **Advanced Validation**: Business rule validation for caseload limits and specializations
8. **Integration APIs**: Enhanced integration with external systems and staging databases

### Scalability Considerations
1. **Database Sharding**: Partition data by tenant or geographic region
2. **Read Replicas**: Implement read replicas for improved query performance
3. **Microservices**: Split into dedicated microservices for member, provider, and service coordinator management
4. **Event Sourcing**: Implement event sourcing for better audit trails and data consistency
5. **Caching Strategy**: Implement caching for frequently accessed service coordinator hierarchies