/**
 * Member and Provider Lookup Service
 * 
 * Handles member and provider data management including:
 * - Staging table operations for member and provider data
 * - Basic search functionality with type-ahead
 * - Data pre-population for form instances
 * - Mock data generation for development and testing
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import {
  MemberData,
  ProviderData,
  ContactInfo,
  Address,
  ApiResponse,
  PaginationParams
} from '../types';
import {
  MemberDataSchema,
  ProviderDataSchema,
  MemberSearchSchema,
  ProviderSearchSchema
} from '../types/validation-schemas';
import { DatabaseService } from './database.service';

export interface MemberSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  planType: string;
  ltssType: string;
  levelOfCare: string;
  picsScore: number;
  assignedCoordinator: string;
  lastUpdated: Date;
}

export interface ProviderSearchResult {
  id: string;
  npi: string;
  name: string;
  specialty: string;
  networkStatus: string;
  contactInfo: ContactInfo;
  lastUpdated: Date;
}

export interface PrePopulationData {
  memberData?: MemberData;
  providerData?: ProviderData;
  priorAssessments?: any[]; // Will be expanded in future iterations
}

export class MemberProviderLookupService {
  private db: Knex;

  constructor() {
    this.db = DatabaseService.getInstance().getConnection();
  }

  // ============================================================================
  // MEMBER MANAGEMENT
  // ============================================================================

  /**
   * Search members with type-ahead functionality
   */
  async searchMembers(
    query: string,
    tenantId: string,
    limit: number = 10
  ): Promise<ApiResponse<MemberSearchResult[]>> {
    try {
      // Validate input
      const validatedInput = MemberSearchSchema.parse({ query, limit });

      // Build search query
      const searchQuery = this.db('member_staging')
        .where('tenant_id', tenantId)
        .where(function () {
          this.where('first_name', 'ilike', `%${validatedInput.query}%`)
            .orWhere('last_name', 'ilike', `%${validatedInput.query}%`)
            .orWhere('member_id', 'ilike', `%${validatedInput.query}%`)
            .orWhereRaw("CONCAT(first_name, ' ', last_name) ilike ?", [`%${validatedInput.query}%`]);
        })
        .orderByRaw("CASE WHEN first_name ilike ? THEN 1 WHEN last_name ilike ? THEN 2 ELSE 3 END",
          [`${validatedInput.query}%`, `${validatedInput.query}%`])
        .orderBy('last_name')
        .orderBy('first_name')
        .limit(validatedInput.limit);

      const members = await searchQuery;

      const results: MemberSearchResult[] = members.map(member => ({
        id: member.member_id,
        firstName: member.first_name,
        lastName: member.last_name,
        dateOfBirth: member.date_of_birth,
        planType: member.plan_type,
        ltssType: member.ltss_type,
        levelOfCare: member.level_of_care,
        picsScore: member.pics_score,
        assignedCoordinator: member.assigned_coordinator,
        lastUpdated: member.last_updated
      }));

      return {
        success: true,
        data: results,
        metadata: {
          total: results.length,
          limit: validatedInput.limit,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MEMBER_SEARCH_ERROR',
          message: 'Failed to search members',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get member by ID
   */
  async getMemberById(memberId: string, tenantId: string): Promise<ApiResponse<MemberData>> {
    try {
      const member = await this.db('member_staging')
        .where({ member_id: memberId, tenant_id: tenantId })
        .first();

      if (!member) {
        return {
          success: false,
          error: {
            code: 'MEMBER_NOT_FOUND',
            message: 'Member not found'
          }
        };
      }

      const memberData: MemberData = {
        id: member.member_id,
        firstName: member.first_name,
        lastName: member.last_name,
        dateOfBirth: member.date_of_birth,
        planType: member.plan_type,
        ltssType: member.ltss_type,
        levelOfCare: member.level_of_care,
        picsScore: member.pics_score,
        assignedCoordinator: member.assigned_coordinator,
        contactInfo: member.contact_info || {}
      };

      return {
        success: true,
        data: memberData,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MEMBER_FETCH_ERROR',
          message: 'Failed to fetch member data',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Create or update member data in staging table
   */
  async upsertMemberData(
    memberData: MemberData,
    tenantId: string
  ): Promise<ApiResponse<MemberData>> {
    try {
      // Validate member data
      const validatedData = MemberDataSchema.parse(memberData);

      const memberRecord = {
        member_id: validatedData.id,
        tenant_id: tenantId,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        date_of_birth: validatedData.dateOfBirth,
        plan_type: validatedData.planType,
        ltss_type: validatedData.ltssType,
        level_of_care: validatedData.levelOfCare,
        pics_score: validatedData.picsScore,
        assigned_coordinator: validatedData.assignedCoordinator,
        contact_info: JSON.stringify(validatedData.contactInfo),
        last_updated: new Date()
      };

      // Use upsert (INSERT ... ON CONFLICT)
      await this.db('member_staging')
        .insert(memberRecord)
        .onConflict(['member_id'])
        .merge([
          'first_name', 'last_name', 'date_of_birth', 'plan_type',
          'ltss_type', 'level_of_care', 'pics_score', 'assigned_coordinator',
          'contact_info', 'last_updated'
        ]);

      return {
        success: true,
        data: validatedData,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MEMBER_UPSERT_ERROR',
          message: 'Failed to upsert member data',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Bulk import member data
   */
  async bulkImportMembers(
    membersData: MemberData[],
    tenantId: string
  ): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    try {
      const errors: string[] = [];
      let imported = 0;

      // Process in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < membersData.length; i += batchSize) {
        const batch = membersData.slice(i, i + batchSize);

        for (const memberData of batch) {
          try {
            const result = await this.upsertMemberData(memberData, tenantId);
            if (result.success) {
              imported++;
            } else {
              errors.push(`Member ${memberData.id}: ${result.error?.message}`);
            }
          } catch (error) {
            errors.push(`Member ${memberData.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      return {
        success: true,
        data: { imported, errors },
        metadata: {
          total: membersData.length,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BULK_IMPORT_ERROR',
          message: 'Failed to bulk import members',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  // ============================================================================
  // PROVIDER MANAGEMENT
  // ============================================================================

  /**
   * Search providers with type-ahead functionality
   */
  async searchProviders(
    query: string,
    tenantId: string,
    limit: number = 10
  ): Promise<ApiResponse<ProviderSearchResult[]>> {
    try {
      // Validate input
      const validatedInput = ProviderSearchSchema.parse({ query, limit });

      // Build search query
      const searchQuery = this.db('provider_staging')
        .where('tenant_id', tenantId)
        .where(function () {
          this.where('name', 'ilike', `%${validatedInput.query}%`)
            .orWhere('npi', 'ilike', `%${validatedInput.query}%`)
            .orWhere('provider_id', 'ilike', `%${validatedInput.query}%`)
            .orWhere('specialty', 'ilike', `%${validatedInput.query}%`);
        })
        .orderByRaw("CASE WHEN name ilike ? THEN 1 WHEN npi ilike ? THEN 2 ELSE 3 END",
          [`${validatedInput.query}%`, `${validatedInput.query}%`])
        .orderBy('name')
        .limit(validatedInput.limit);

      const providers = await searchQuery;

      const results: ProviderSearchResult[] = providers.map(provider => ({
        id: provider.provider_id,
        npi: provider.npi,
        name: provider.name,
        specialty: provider.specialty,
        networkStatus: provider.network_status,
        contactInfo: provider.contact_info || {},
        lastUpdated: provider.last_updated
      }));

      return {
        success: true,
        data: results,
        metadata: {
          total: results.length,
          limit: validatedInput.limit,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_SEARCH_ERROR',
          message: 'Failed to search providers',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get provider by ID
   */
  async getProviderById(providerId: string, tenantId: string): Promise<ApiResponse<ProviderData>> {
    try {
      const provider = await this.db('provider_staging')
        .where({ provider_id: providerId, tenant_id: tenantId })
        .first();

      if (!provider) {
        return {
          success: false,
          error: {
            code: 'PROVIDER_NOT_FOUND',
            message: 'Provider not found'
          }
        };
      }

      const providerData: ProviderData = {
        id: provider.provider_id,
        npi: provider.npi,
        name: provider.name,
        specialty: provider.specialty,
        networkStatus: provider.network_status,
        contactInfo: provider.contact_info || {}
      };

      return {
        success: true,
        data: providerData,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_FETCH_ERROR',
          message: 'Failed to fetch provider data',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Create or update provider data in staging table
   */
  async upsertProviderData(
    providerData: ProviderData,
    tenantId: string
  ): Promise<ApiResponse<ProviderData>> {
    try {
      // Validate provider data
      const validatedData = ProviderDataSchema.parse(providerData);

      const providerRecord = {
        provider_id: validatedData.id,
        tenant_id: tenantId,
        npi: validatedData.npi,
        name: validatedData.name,
        specialty: validatedData.specialty,
        network_status: validatedData.networkStatus,
        contact_info: JSON.stringify(validatedData.contactInfo),
        last_updated: new Date()
      };

      // Use upsert (INSERT ... ON CONFLICT)
      await this.db('provider_staging')
        .insert(providerRecord)
        .onConflict(['provider_id'])
        .merge([
          'npi', 'name', 'specialty', 'network_status',
          'contact_info', 'last_updated'
        ]);

      return {
        success: true,
        data: validatedData,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_UPSERT_ERROR',
          message: 'Failed to upsert provider data',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Bulk import provider data
   */
  async bulkImportProviders(
    providersData: ProviderData[],
    tenantId: string
  ): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    try {
      const errors: string[] = [];
      let imported = 0;

      // Process in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < providersData.length; i += batchSize) {
        const batch = providersData.slice(i, i + batchSize);

        for (const providerData of batch) {
          try {
            const result = await this.upsertProviderData(providerData, tenantId);
            if (result.success) {
              imported++;
            } else {
              errors.push(`Provider ${providerData.id}: ${result.error?.message}`);
            }
          } catch (error) {
            errors.push(`Provider ${providerData.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      return {
        success: true,
        data: { imported, errors },
        metadata: {
          total: providersData.length,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BULK_IMPORT_ERROR',
          message: 'Failed to bulk import providers',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  // ============================================================================
  // DATA PRE-POPULATION
  // ============================================================================

  /**
   * Get pre-population data for form instances
   */
  async getPrePopulationData(
    memberId?: string,
    providerId?: string,
    tenantId?: string
  ): Promise<ApiResponse<PrePopulationData>> {
    try {
      if (!tenantId) {
        return {
          success: false,
          error: {
            code: 'TENANT_REQUIRED',
            message: 'Tenant ID is required'
          }
        };
      }

      const prePopData: PrePopulationData = {};

      // Get member data if provided
      if (memberId) {
        const memberResult = await this.getMemberById(memberId, tenantId);
        if (memberResult.success) {
          prePopData.memberData = memberResult.data;
        }
      }

      // Get provider data if provided
      if (providerId) {
        const providerResult = await this.getProviderById(providerId, tenantId);
        if (providerResult.success) {
          prePopData.providerData = providerResult.data;
        }
      }

      // TODO: Get prior assessments (will be implemented in future iterations)
      prePopData.priorAssessments = [];

      return {
        success: true,
        data: prePopData,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PREPOPULATION_ERROR',
          message: 'Failed to get pre-population data',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  // ============================================================================
  // MOCK DATA GENERATION
  // ============================================================================

  /**
   * Generate mock member data for development and testing
   */
  async generateMockMembers(count: number, tenantId: string): Promise<ApiResponse<MemberData[]>> {
    try {
      const mockMembers: MemberData[] = [];
      const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Ashley'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
      const planTypes = ['Medicaid', 'Medicare', 'Dual Eligible', 'Commercial'];
      const ltssTypes = ['Home Care', 'Adult Day Care', 'Assisted Living', 'Nursing Home'];
      const levelsOfCare = ['Low', 'Medium', 'High', 'Critical'];
      const coordinators = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown'];

      for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

        const mockMember: MemberData = {
          id: `MBR${String(i + 1).padStart(6, '0')}`,
          firstName,
          lastName,
          dateOfBirth: new Date(1940 + Math.floor(Math.random() * 60), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          planType: planTypes[Math.floor(Math.random() * planTypes.length)],
          ltssType: ltssTypes[Math.floor(Math.random() * ltssTypes.length)],
          levelOfCare: levelsOfCare[Math.floor(Math.random() * levelsOfCare.length)],
          picsScore: Math.floor(Math.random() * 100),
          assignedCoordinator: coordinators[Math.floor(Math.random() * coordinators.length)],
          contactInfo: {
            phone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
            address: {
              street1: `${Math.floor(Math.random() * 9999) + 1} Main St`,
              city: 'Anytown',
              state: 'NY',
              zipCode: `${Math.floor(Math.random() * 90000) + 10000}`
            }
          }
        };

        mockMembers.push(mockMember);
      }

      // Insert mock data into staging table
      const importResult = await this.bulkImportMembers(mockMembers, tenantId);

      if (!importResult.success) {
        return importResult;
      }

      return {
        success: true,
        data: mockMembers,
        metadata: {
          total: count,
          imported: importResult.data?.imported || 0,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MOCK_GENERATION_ERROR',
          message: 'Failed to generate mock member data',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Generate mock provider data for development and testing
   */
  async generateMockProviders(count: number, tenantId: string): Promise<ApiResponse<ProviderData[]>> {
    try {
      const mockProviders: ProviderData[] = [];
      const providerNames = [
        'City Medical Center', 'Regional Health System', 'Community Hospital', 'Family Care Clinic',
        'Specialty Medical Group', 'Primary Care Associates', 'Advanced Healthcare', 'Metro Health Services',
        'Comprehensive Care Center', 'Integrated Health Network'
      ];
      const specialties = [
        'Primary Care', 'Cardiology', 'Neurology', 'Orthopedics', 'Psychiatry',
        'Geriatrics', 'Internal Medicine', 'Family Medicine', 'Endocrinology', 'Pulmonology'
      ];
      const networkStatuses = ['in_network', 'out_of_network', 'pending'];

      for (let i = 0; i < count; i++) {
        const name = providerNames[Math.floor(Math.random() * providerNames.length)];

        const mockProvider: ProviderData = {
          id: `PRV${String(i + 1).padStart(6, '0')}`,
          npi: String(Math.floor(Math.random() * 9000000000) + 1000000000), // 10-digit NPI
          name: `${name} ${i + 1}`,
          specialty: specialties[Math.floor(Math.random() * specialties.length)],
          networkStatus: networkStatuses[Math.floor(Math.random() * networkStatuses.length)],
          contactInfo: {
            phone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
            address: {
              street1: `${Math.floor(Math.random() * 9999) + 1} Medical Blvd`,
              city: 'Healthcare City',
              state: 'NY',
              zipCode: `${Math.floor(Math.random() * 90000) + 10000}`
            }
          }
        };

        mockProviders.push(mockProvider);
      }

      // Insert mock data into staging table
      const importResult = await this.bulkImportProviders(mockProviders, tenantId);

      if (!importResult.success) {
        return importResult;
      }

      return {
        success: true,
        data: mockProviders,
        metadata: {
          total: count,
          imported: importResult.data?.imported || 0,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MOCK_GENERATION_ERROR',
          message: 'Failed to generate mock provider data',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get staging data statistics
   */
  async getStagingDataStats(tenantId: string): Promise<ApiResponse<{
    memberCount: number;
    providerCount: number;
    lastMemberUpdate: Date | null;
    lastProviderUpdate: Date | null;
  }>> {
    try {
      const [memberStats, providerStats] = await Promise.all([
        this.db('member_staging')
          .where('tenant_id', tenantId)
          .count('* as count')
          .max('last_updated as last_update')
          .first(),
        this.db('provider_staging')
          .where('tenant_id', tenantId)
          .count('* as count')
          .max('last_updated as last_update')
          .first()
      ]);

      return {
        success: true,
        data: {
          memberCount: parseInt(memberStats?.count as string) || 0,
          providerCount: parseInt(providerStats?.count as string) || 0,
          lastMemberUpdate: memberStats?.last_update || null,
          lastProviderUpdate: providerStats?.last_update || null
        },
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Failed to get staging data statistics',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Clear staging data for a tenant (for testing purposes)
   */
  async clearStagingData(tenantId: string): Promise<ApiResponse<void>> {
    try {
      await Promise.all([
        this.db('member_staging').where('tenant_id', tenantId).del(),
        this.db('provider_staging').where('tenant_id', tenantId).del()
      ]);

      return {
        success: true,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLEAR_DATA_ERROR',
          message: 'Failed to clear staging data',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }
}