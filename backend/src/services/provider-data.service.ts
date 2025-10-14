import { Knex } from 'knex';
import { ProviderData, ApiResponse } from '../types';
import { ProviderDataSchema } from '../types/validation-schemas';

export interface ProviderSearchFilters {
  name?: string;
  npi?: string;
  taxonomy?: string;
  providerEntity?: string;
  providerType?: string;
  providerTypeCode?: string;
  organizationType?: string;
  specialty?: string;
  specialtyCode?: string;
  subSpecialty?: string;
  networkStatus?: 'in_network' | 'out_of_network' | 'pending' | 'terminated';
  relationshipSpecialistName?: string;
  lastUpdatedFrom?: Date;
  lastUpdatedTo?: Date;
}

export class ProviderDataService {
  constructor(private db: Knex) {}

  /**
   * Get provider data by ID
   */
  async getProviderById(providerId: string): Promise<ApiResponse<ProviderData>> {
    try {
      const provider = await this.db('provider_data')
        .where('id', providerId)
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

      const providerData = this.mapDbToProviderData(provider);
      const validatedProvider = ProviderDataSchema.parse(providerData);

      return {
        success: true,
        data: validatedProvider,
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
   * Get provider data by NPI
   */
  async getProviderByNPI(npi: string): Promise<ApiResponse<ProviderData>> {
    try {
      const provider = await this.db('provider_data')
        .where('npi', npi)
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

      const providerData = this.mapDbToProviderData(provider);
      const validatedProvider = ProviderDataSchema.parse(providerData);

      return {
        success: true,
        data: validatedProvider,
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
   * Search providers with filters and pagination
   */
  async searchProviders(
    filters: ProviderSearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{ providers: ProviderData[]; total: number }>> {
    try {
      let query = this.db('provider_data');

      // Apply filters
      if (filters.name) {
        query = query.where('name', 'ilike', `%${filters.name}%`);
      }

      if (filters.npi) {
        query = query.where('npi', 'ilike', `%${filters.npi}%`);
      }

      if (filters.taxonomy) {
        query = query.where('taxonomy', 'ilike', `%${filters.taxonomy}%`);
      }

      if (filters.providerEntity) {
        query = query.where('provider_entity', 'ilike', `%${filters.providerEntity}%`);
      }

      if (filters.providerType) {
        query = query.where('provider_type', 'ilike', `%${filters.providerType}%`);
      }

      if (filters.providerTypeCode) {
        query = query.where('provider_type_code', filters.providerTypeCode);
      }

      if (filters.organizationType) {
        query = query.where('organization_type', 'ilike', `%${filters.organizationType}%`);
      }

      if (filters.specialty) {
        query = query.where('specialty', 'ilike', `%${filters.specialty}%`);
      }

      if (filters.specialtyCode) {
        query = query.where('specialty_code', filters.specialtyCode);
      }

      if (filters.subSpecialty) {
        query = query.where('sub_specialty', 'ilike', `%${filters.subSpecialty}%`);
      }

      if (filters.networkStatus) {
        query = query.where('network_status', filters.networkStatus);
      }

      if (filters.relationshipSpecialistName) {
        query = query.where('relationship_specialist_name', 'ilike', `%${filters.relationshipSpecialistName}%`);
      }

      if (filters.lastUpdatedFrom) {
        query = query.where('last_updated', '>=', filters.lastUpdatedFrom);
      }

      if (filters.lastUpdatedTo) {
        query = query.where('last_updated', '<=', filters.lastUpdatedTo);
      }

      // Get total count
      const totalResult = await query.clone().count('* as count').first();
      const total = parseInt(totalResult?.['count'] as string || '0');

      // Get paginated results
      const providers = await query
        .select('*')
        .orderBy('name', 'asc')
        .limit(limit)
        .offset((page - 1) * limit);

      const providerData = providers.map(provider => {
        const mapped = this.mapDbToProviderData(provider);
        return ProviderDataSchema.parse(mapped);
      });

      return {
        success: true,
        data: { providers: providerData, total },
        metadata: {
          total,
          page,
          limit,
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
   * Get providers by network status
   */
  async getProvidersByNetworkStatus(
    networkStatus: 'in_network' | 'out_of_network' | 'pending' | 'terminated',
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{ providers: ProviderData[]; total: number }>> {
    try {
      const query = this.db('provider_data')
        .where('network_status', networkStatus);

      // Get total count
      const totalResult = await query.clone().count('* as count').first();
      const total = parseInt(totalResult?.['count'] as string || '0');

      // Get paginated results
      const providers = await query
        .select('*')
        .orderBy('name', 'asc')
        .limit(limit)
        .offset((page - 1) * limit);

      const providerData = providers.map(provider => {
        const mapped = this.mapDbToProviderData(provider);
        return ProviderDataSchema.parse(mapped);
      });

      return {
        success: true,
        data: { providers: providerData, total },
        metadata: {
          total,
          page,
          limit,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_FETCH_ERROR',
          message: 'Failed to fetch providers by network status',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get providers by specialty
   */
  async getProvidersBySpecialty(
    specialty: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{ providers: ProviderData[]; total: number }>> {
    try {
      const query = this.db('provider_data')
        .where('specialty', 'ilike', `%${specialty}%`);

      // Get total count
      const totalResult = await query.clone().count('* as count').first();
      const total = parseInt(totalResult?.['count'] as string || '0');

      // Get paginated results
      const providers = await query
        .select('*')
        .orderBy('name', 'asc')
        .limit(limit)
        .offset((page - 1) * limit);

      const providerData = providers.map(provider => {
        const mapped = this.mapDbToProviderData(provider);
        return ProviderDataSchema.parse(mapped);
      });

      return {
        success: true,
        data: { providers: providerData, total },
        metadata: {
          total,
          page,
          limit,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_FETCH_ERROR',
          message: 'Failed to fetch providers by specialty',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get provider statistics by network status
   */
  async getProviderStatsByNetworkStatus(): Promise<ApiResponse<Record<string, number>>> {
    try {
      const stats = await this.db('provider_data')
        .select('network_status')
        .count('* as count')
        .groupBy('network_status');

      const networkStats: Record<string, number> = {};
      for (const stat of stats) {
        const networkStatus = stat['network_status'] as string;
        if (networkStatus) {
          networkStats[networkStatus] = parseInt(stat['count'] as string) || 0;
        }
      }

      return {
        success: true,
        data: networkStats,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Failed to fetch provider statistics',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get provider statistics by specialty
   */
  async getProviderStatsBySpecialty(): Promise<ApiResponse<Record<string, number>>> {
    try {
      const stats = await this.db('provider_data')
        .select('specialty')
        .count('* as count')
        .groupBy('specialty')
        .orderBy('count', 'desc')
        .limit(20); // Top 20 specialties

      const specialtyStats: Record<string, number> = {};
      for (const stat of stats) {
        const specialty = stat['specialty'] as string;
        if (specialty) {
          specialtyStats[specialty] = parseInt(stat['count'] as string) || 0;
        }
      }

      return {
        success: true,
        data: specialtyStats,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Failed to fetch provider specialty statistics',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get providers by relationship specialist
   */
  async getProvidersByRelationshipSpecialist(
    relationshipSpecialistName: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{ providers: ProviderData[]; total: number }>> {
    try {
      const query = this.db('provider_data')
        .where('relationship_specialist_name', 'ilike', `%${relationshipSpecialistName}%`);

      // Get total count
      const totalResult = await query.clone().count('* as count').first();
      const total = parseInt(totalResult?.['count'] as string || '0');

      // Get paginated results
      const providers = await query
        .select('*')
        .orderBy('name', 'asc')
        .limit(limit)
        .offset((page - 1) * limit);

      const providerData = providers.map(provider => {
        const mapped = this.mapDbToProviderData(provider);
        return ProviderDataSchema.parse(mapped);
      });

      return {
        success: true,
        data: { providers: providerData, total },
        metadata: {
          total,
          page,
          limit,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_FETCH_ERROR',
          message: 'Failed to fetch providers by relationship specialist',
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
    limit: number = 10
  ): Promise<ApiResponse<ProviderData[]>> {
    try {
      const providers = await this.db('provider_data')
        .where(function() {
          this.where('name', 'ilike', `%${query}%`)
            .orWhere('npi', 'ilike', `%${query}%`)
            .orWhere('specialty', 'ilike', `%${query}%`);
        })
        .where('network_status', 'in_network') // Only active network providers
        .select('*')
        .orderBy('name', 'asc')
        .limit(limit);

      const providerData = providers.map(provider => {
        const mapped = this.mapDbToProviderData(provider);
        return ProviderDataSchema.parse(mapped);
      });

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

export default ProviderDataService;