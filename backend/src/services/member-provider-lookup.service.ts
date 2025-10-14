import { Knex } from 'knex';
import { MemberData, ProviderData, ApiResponse } from '../types';
import { MemberDataService } from './member-data.service';
import { ProviderDataService } from './provider-data.service';

export interface QuickSearchResult {
  members: MemberData[];
  providers: ProviderData[];
}

export interface MemberProviderLookupFilters {
  memberQuery?: string;
  providerQuery?: string;
  memberZone?: 'SW' | 'SE' | 'NE' | 'NW' | 'LC';
  providerNetworkStatus?: 'in_network' | 'out_of_network' | 'pending' | 'terminated';
  providerSpecialty?: string;
  limit?: number;
}

/**
 * Combined service for member and provider lookup operations
 * Optimized for form pre-population and quick searches
 */
export class MemberProviderLookupService {
  private memberDataService: MemberDataService;
  private providerDataService: ProviderDataService;

  constructor(private db: Knex) {
    this.memberDataService = new MemberDataService(db);
    this.providerDataService = new ProviderDataService(db);
  }

  /**
   * Quick search for both members and providers
   * Used for form pre-population dropdowns
   */
  async quickSearch(
    query: string,
    filters?: MemberProviderLookupFilters
  ): Promise<ApiResponse<QuickSearchResult>> {
    try {
      const limit = filters?.limit || 10;

      // Search members
      const memberPromise = this.quickSearchMembers(
        filters?.memberQuery || query,
        filters?.memberZone,
        limit
      );

      // Search providers
      const providerPromise = this.quickSearchProviders(
        filters?.providerQuery || query,
        filters?.providerNetworkStatus,
        filters?.providerSpecialty,
        limit
      );

      const [memberResult, providerResult] = await Promise.all([
        memberPromise,
        providerPromise
      ]);

      if (!memberResult.success || !providerResult.success) {
        return {
          success: false,
          error: {
            code: 'SEARCH_ERROR',
            message: 'Failed to perform quick search',
            details: {
              memberError: memberResult.error,
              providerError: providerResult.error
            }
          }
        };
      }

      return {
        success: true,
        data: {
          members: memberResult.data || [],
          providers: providerResult.data || []
        },
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Failed to perform quick search',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Quick search members for form pre-population
   */
  async quickSearchMembers(
    query: string,
    memberZone?: 'SW' | 'SE' | 'NE' | 'NW' | 'LC',
    limit: number = 10
  ): Promise<ApiResponse<MemberData[]>> {
    try {
      let dbQuery = this.db('member_data')
        .where(function() {
          this.where('first_name', 'ilike', `%${query}%`)
            .orWhere('last_name', 'ilike', `%${query}%`)
            .orWhere('medicaid_id', 'ilike', `%${query}%`)
            .orWhere('hcin_id', 'ilike', `%${query}%`);
        });

      if (memberZone) {
        dbQuery = dbQuery.where('member_zone', memberZone);
      }

      const members = await dbQuery
        .select('*')
        .orderBy('last_name', 'asc')
        .orderBy('first_name', 'asc')
        .limit(limit);

      const memberData = members.map(member => this.mapDbToMemberData(member));

      return {
        success: true,
        data: memberData,
        metadata: { timestamp: new Date() }
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
   * Quick search providers for form pre-population
   */
  async quickSearchProviders(
    query: string,
    networkStatus?: 'in_network' | 'out_of_network' | 'pending' | 'terminated',
    specialty?: string,
    limit: number = 10
  ): Promise<ApiResponse<ProviderData[]>> {
    try {
      let dbQuery = this.db('provider_data')
        .where(function() {
          this.where('name', 'ilike', `%${query}%`)
            .orWhere('npi', 'ilike', `%${query}%`)
            .orWhere('specialty', 'ilike', `%${query}%`);
        });

      if (networkStatus) {
        dbQuery = dbQuery.where('network_status', networkStatus);
      } else {
        // Default to in-network providers for form pre-population
        dbQuery = dbQuery.where('network_status', 'in_network');
      }

      if (specialty) {
        dbQuery = dbQuery.where('specialty', 'ilike', `%${specialty}%`);
      }

      const providers = await dbQuery
        .select('*')
        .orderBy('name', 'asc')
        .limit(limit);

      const providerData = providers.map(provider => this.mapDbToProviderData(provider));

      return {
        success: true,
        data: providerData,
        metadata: { timestamp: new Date() }
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
   * Get member and provider data for form pre-population
   * Used when both member and provider IDs are known
   */
  async getMemberAndProvider(
    memberDataId: string,
    providerId: string
  ): Promise<ApiResponse<{ member: MemberData; provider: ProviderData }>> {
    try {
      const [memberResult, providerResult] = await Promise.all([
        this.memberDataService.getMemberById(memberDataId),
        this.providerDataService.getProviderById(providerId)
      ]);

      if (!memberResult.success) {
        return {
          success: false,
          error: memberResult.error!
        };
      }

      if (!providerResult.success) {
        return {
          success: false,
          error: providerResult.error!
        };
      }

      return {
        success: true,
        data: {
          member: memberResult.data!,
          provider: providerResult.data!
        },
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LOOKUP_ERROR',
          message: 'Failed to get member and provider data',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get providers by member zone for targeted searches
   */
  async getProvidersByMemberZone(
    _memberZone: 'SW' | 'SE' | 'NE' | 'NW' | 'LC',
    specialty?: string,
    limit: number = 20
  ): Promise<ApiResponse<ProviderData[]>> {
    try {
      // This is a simplified implementation
      // In a real system, you might have geographic mapping between member zones and providers
      let query = this.db('provider_data')
        .where('network_status', 'in_network');

      if (specialty) {
        query = query.where('specialty', 'ilike', `%${specialty}%`);
      }

      const providers = await query
        .select('*')
        .orderBy('name', 'asc')
        .limit(limit);

      const providerData = providers.map(provider => this.mapDbToProviderData(provider));

      return {
        success: true,
        data: providerData,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_SEARCH_ERROR',
          message: 'Failed to get providers by member zone',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get members by service coordinator for assignment workflows
   */
  async getMembersByServiceCoordinator(
    assignedSCID: string,
    limit: number = 20
  ): Promise<ApiResponse<MemberData[]>> {
    const result = await this.memberDataService.getMembersByServiceCoordinator(assignedSCID, 1, limit);
    
    if (result.success) {
      return {
        success: true,
        data: result.data!.members,
        metadata: { timestamp: new Date() }
      };
    }
    
    return {
      success: false,
      error: result.error!
    };
  }

  /**
   * Validate member and provider combination for form submissions
   */
  async validateMemberProviderCombination(
    memberDataId: string,
    providerId: string
  ): Promise<ApiResponse<{ valid: boolean; reason?: string }>> {
    try {
      const result = await this.getMemberAndProvider(memberDataId, providerId);

      if (!result.success) {
        return {
          success: true,
          data: {
            valid: false,
            reason: 'Member or provider not found'
          },
          metadata: { timestamp: new Date() }
        };
      }

      const { provider } = result.data!;

      // Basic validation rules
      if (provider.networkStatus !== 'in_network') {
        return {
          success: true,
          data: {
            valid: false,
            reason: 'Provider is not in network'
          },
          metadata: { timestamp: new Date() }
        };
      }

      // Additional validation logic can be added here
      // For example, checking if provider specialty matches member needs

      return {
        success: true,
        data: { valid: true },
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to validate member-provider combination',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Map database row to MemberData interface
   */
  private mapDbToMemberData(dbRow: any): MemberData {
    const memberData: MemberData = {
      memberDataId: dbRow.member_data_id,
      medicaidId: dbRow.medicaid_id,
      hcinId: dbRow.hcin_id,
      firstName: dbRow.first_name,
      lastName: dbRow.last_name,
      dateOfBirth: new Date(dbRow.date_of_birth),
      planId: dbRow.plan_id,
      planCategory: dbRow.plan_category,
      planType: dbRow.plan_type,
      planSubType: dbRow.plan_sub_type,
      eligEffectiveDate: new Date(dbRow.elig_effective_date),
      waiverCode: dbRow.waiver_code,
      waiverEffectiveDate: new Date(dbRow.waiver_effective_date),
      aligned: dbRow.aligned,
      planDual: dbRow.plan_dual,
      dsnpName: dbRow.dsnp_name,
      memberZone: dbRow.member_zone,
      picsScore: dbRow.pics_score,
      assignedSCID: dbRow.assigned_scid,
      lastUpdated: new Date(dbRow.last_updated),
      serviceCoordinator: dbRow.sc_name ? {
        id: dbRow.sc_id || '',
        tenantId: dbRow.tenant_id || '',
        scid: dbRow.assigned_scid,
        firstName: dbRow.sc_first_name || '',
        lastName: dbRow.sc_last_name || '',
        email: dbRow.sc_email || '',
        organization: dbRow.sc_org || '',
        zone: dbRow.sc_zone || 'SW',
        isActive: true,
        currentCaseload: 0,
        hireDate: new Date(),
        lastUpdated: new Date(),
        createdBy: '',
        createdAt: new Date()
      } : undefined
    };

    // Handle optional fields
    if (dbRow.elig_term_date) {
      memberData.eligTermDate = new Date(dbRow.elig_term_date);
    }
    
    if (dbRow.waiver_term_date) {
      memberData.waiverTermDate = new Date(dbRow.waiver_term_date);
    }
    
    if (dbRow.contact_info) {
      memberData.contactInfo = JSON.parse(dbRow.contact_info);
    }

    return memberData;
  }

  /**
   * Map database row to ProviderData interface
   */
  private mapDbToProviderData(dbRow: any): ProviderData {
    return {
      id: dbRow.id,
      name: dbRow.name,
      npi: dbRow.npi,
      taxonomy: dbRow.taxonomy,
      providerEntity: dbRow.provider_entity,
      providerType: dbRow.provider_type,
      providerTypeCode: dbRow.provider_type_code,
      organizationType: dbRow.organization_type,
      specialty: dbRow.specialty,
      specialtyCode: dbRow.specialty_code,
      subSpecialty: dbRow.sub_specialty,
      networkStatus: dbRow.network_status,
      contactInfo: JSON.parse(dbRow.contact_info || '{}'),
      relationshipSpecialistName: dbRow.relationship_specialist_name,
      lastUpdated: new Date(dbRow.last_updated)
    };
  }
}

export default MemberProviderLookupService;