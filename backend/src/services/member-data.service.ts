import { Knex } from 'knex';
import { MemberData, ApiResponse } from '../types';
import { MemberDataSchema } from '../types/validation-schemas';

export interface MemberSearchFilters {
  medicaidId?: string;
  hcinId?: string;
  firstName?: string;
  lastName?: string;
  planCategory?: 'Medical' | 'RX' | 'Vision';
  planType?: 'NFCE' | 'NFI';
  planSubType?: 'HCBS' | 'NF' | 'NFI';
  waiverCode?: '20' | '37' | '38' | '39';
  aligned?: 'Y' | 'N';
  planDual?: 'Y' | 'N';
  dsnpName?: 'Amerihealth' | 'Keystone First' | 'Aetna' | 'UPMC' | 'PHW';
  memberZone?: 'SW' | 'SE' | 'NE' | 'NW' | 'LC';
  assignedSCID?: string;
  serviceCoordinatorZone?: 'SW' | 'SE' | 'NE' | 'NW' | 'LC'; // Filter by SC zone via join
  picsScoreMin?: number;
  picsScoreMax?: number;
  eligEffectiveDateFrom?: Date;
  eligEffectiveDateTo?: Date;
  waiverEffectiveDateFrom?: Date;
  waiverEffectiveDateTo?: Date;
}

export class MemberDataService {
  constructor(private db: Knex) { }

  /**
   * Get member data by member data ID with service coordinator information
   */
  async getMemberById(memberDataId: string): Promise<ApiResponse<MemberData>> {
    try {
      const member = await this.db('member_data')
        .leftJoin('service_coordinators', 'member_data.service_coordinator_id', 'service_coordinators.id')
        .select(
          'member_data.*',
          'service_coordinators.scid as sc_scid',
          'service_coordinators.first_name as sc_first_name',
          'service_coordinators.last_name as sc_last_name',
          'service_coordinators.email as sc_email',
          'service_coordinators.phone as sc_phone',
          'service_coordinators.organization as sc_organization',
          'service_coordinators.zone as sc_zone',
          'service_coordinators.is_active as sc_is_active',
          'service_coordinators.max_caseload as sc_max_caseload',
          'service_coordinators.current_caseload as sc_current_caseload',
          'service_coordinators.specializations as sc_specializations',
          'service_coordinators.license_number as sc_license_number',
          'service_coordinators.hire_date as sc_hire_date'
        )
        .where('member_data.member_data_id', memberDataId)
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

      const memberData = this.mapDbToMemberData(member);

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
   * Get member data by Medicaid ID
   */
  async getMemberByMedicaidId(medicaidId: string): Promise<ApiResponse<MemberData>> {
    try {
      const member = await this.db('member_data')
        .where('medicaid_id', medicaidId)
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

      const memberData = this.mapDbToMemberData(member);
      const validatedMember = MemberDataSchema.parse(memberData);

      return {
        success: true,
        data: validatedMember,
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
   * Get member data by HCIN ID
   */
  async getMemberByHcinId(hcinId: string): Promise<ApiResponse<MemberData>> {
    try {
      const member = await this.db('member_data')
        .where('hcin_id', hcinId)
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

      const memberData = this.mapDbToMemberData(member);
      const validatedMember = MemberDataSchema.parse(memberData);

      return {
        success: true,
        data: validatedMember,
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
   * Search members with filters and pagination
   */
  async searchMembers(
    filters: MemberSearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{ members: MemberData[]; total: number }>> {
    try {
      let query = this.db('member_data');

      // Apply filters
      if (filters.medicaidId) {
        query = query.where('medicaid_id', 'ilike', `%${filters.medicaidId}%`);
      }

      if (filters.hcinId) {
        query = query.where('hcin_id', 'ilike', `%${filters.hcinId}%`);
      }

      if (filters.firstName) {
        query = query.where('first_name', 'ilike', `%${filters.firstName}%`);
      }

      if (filters.lastName) {
        query = query.where('last_name', 'ilike', `%${filters.lastName}%`);
      }

      if (filters.planCategory) {
        query = query.where('plan_category', filters.planCategory);
      }

      if (filters.planType) {
        query = query.where('plan_type', filters.planType);
      }

      if (filters.planSubType) {
        query = query.where('plan_sub_type', filters.planSubType);
      }

      if (filters.waiverCode) {
        query = query.where('waiver_code', filters.waiverCode);
      }

      if (filters.aligned) {
        query = query.where('aligned', filters.aligned);
      }

      if (filters.planDual) {
        query = query.where('plan_dual', filters.planDual);
      }

      if (filters.dsnpName) {
        query = query.where('dsnp_name', filters.dsnpName);
      }

      if (filters.memberZone) {
        query = query.where('member_zone', filters.memberZone);
      }

      if (filters.assignedSCID) {
        query = query.where('assigned_scid', 'ilike', `%${filters.assignedSCID}%`);
      }

      if (filters.serviceCoordinatorZone) {
        query = query
          .join('service_coordinators', 'member_data.service_coordinator_id', 'service_coordinators.id')
          .where('service_coordinators.zone', filters.serviceCoordinatorZone);
      }

      if (filters.picsScoreMin !== undefined) {
        query = query.where('pics_score', '>=', filters.picsScoreMin);
      }

      if (filters.picsScoreMax !== undefined) {
        query = query.where('pics_score', '<=', filters.picsScoreMax);
      }

      if (filters.eligEffectiveDateFrom) {
        query = query.where('elig_effective_date', '>=', filters.eligEffectiveDateFrom);
      }

      if (filters.eligEffectiveDateTo) {
        query = query.where('elig_effective_date', '<=', filters.eligEffectiveDateTo);
      }

      if (filters.waiverEffectiveDateFrom) {
        query = query.where('waiver_effective_date', '>=', filters.waiverEffectiveDateFrom);
      }

      if (filters.waiverEffectiveDateTo) {
        query = query.where('waiver_effective_date', '<=', filters.waiverEffectiveDateTo);
      }

      // Get total count
      const totalResult = await query.clone().count('* as count').first();
      const total = parseInt(totalResult?.['count'] as string || '0');

      // Get paginated results
      const members = await query
        .select('*')
        .orderBy('last_name', 'asc')
        .orderBy('first_name', 'asc')
        .limit(limit)
        .offset((page - 1) * limit);

      const memberData = members.map(member => {
        const mapped = this.mapDbToMemberData(member);
        return MemberDataSchema.parse(mapped);
      });

      return {
        success: true,
        data: { members: memberData, total },
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
          code: 'MEMBER_SEARCH_ERROR',
          message: 'Failed to search members',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get members by Service Coordinator ID
   */
  async getMembersByServiceCoordinator(
    assignedSCID: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{ members: MemberData[]; total: number }>> {
    try {
      const query = this.db('member_data')
        .where('assigned_scid', assignedSCID);

      // Get total count
      const totalResult = await query.clone().count('* as count').first();
      const total = parseInt(totalResult?.['count'] as string || '0');

      // Get paginated results
      const members = await query
        .select('*')
        .orderBy('last_name', 'asc')
        .orderBy('first_name', 'asc')
        .limit(limit)
        .offset((page - 1) * limit);

      const memberData = members.map(member => {
        const mapped = this.mapDbToMemberData(member);
        return MemberDataSchema.parse(mapped);
      });

      return {
        success: true,
        data: { members: memberData, total },
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
          code: 'MEMBER_FETCH_ERROR',
          message: 'Failed to fetch members by service coordinator',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get members by zone
   */
  async getMembersByZone(
    memberZone: 'SW' | 'SE' | 'NE' | 'NW' | 'LC',
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{ members: MemberData[]; total: number }>> {
    try {
      const query = this.db('member_data')
        .where('member_zone', memberZone);

      // Get total count
      const totalResult = await query.clone().count('* as count').first();
      const total = parseInt(totalResult?.['count'] as string || '0');

      // Get paginated results
      const members = await query
        .select('*')
        .orderBy('last_name', 'asc')
        .orderBy('first_name', 'asc')
        .limit(limit)
        .offset((page - 1) * limit);

      const memberData = members.map(member => {
        const mapped = this.mapDbToMemberData(member);
        return MemberDataSchema.parse(mapped);
      });

      return {
        success: true,
        data: { members: memberData, total },
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
          code: 'MEMBER_FETCH_ERROR',
          message: 'Failed to fetch members by zone',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get member statistics by zone
   */
  async getMemberStatsByZone(): Promise<ApiResponse<Record<string, number>>> {
    try {
      const stats = await this.db('member_data')
        .select('member_zone')
        .count('* as count')
        .groupBy('member_zone');

      const zoneStats: Record<string, number> = {};
      stats.forEach(stat => {
        const zone = stat['member_zone'] as string;
        const count = parseInt(stat['count'] as string);
        zoneStats[zone] = count;
      });

      return {
        success: true,
        data: zoneStats,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Failed to fetch member statistics',
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
      lastUpdated: new Date(dbRow.last_updated)
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

    // Map service coordinator data if available
    if (dbRow.sc_scid) {
      memberData.serviceCoordinator = {
        id: dbRow.service_coordinator_id,
        tenantId: dbRow.tenant_id,
        scid: dbRow.sc_scid,
        firstName: dbRow.sc_first_name,
        lastName: dbRow.sc_last_name,
        email: dbRow.sc_email,
        organization: dbRow.sc_organization,
        zone: dbRow.sc_zone,
        isActive: dbRow.sc_is_active,
        currentCaseload: dbRow.sc_current_caseload,
        hireDate: new Date(dbRow.sc_hire_date),
        lastUpdated: new Date(dbRow.last_updated),
        createdAt: new Date(dbRow.created_at),
        createdBy: dbRow.created_by
      };

      // Handle optional SC fields
      if (dbRow.sc_phone) {
        memberData.serviceCoordinator.phone = dbRow.sc_phone;
      }

      if (dbRow.sc_max_caseload) {
        memberData.serviceCoordinator.maxCaseload = dbRow.sc_max_caseload;
      }

      if (dbRow.sc_specializations) {
        memberData.serviceCoordinator.specializations = JSON.parse(dbRow.sc_specializations);
      }

      if (dbRow.sc_license_number) {
        memberData.serviceCoordinator.licenseNumber = dbRow.sc_license_number;
      }
    }

    return memberData;
  }
}

export default MemberDataService;