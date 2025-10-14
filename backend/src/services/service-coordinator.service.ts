import { Knex } from 'knex';
import { ServiceCoordinator, ApiResponse } from '../types';
import { ServiceCoordinatorSchema, CreateServiceCoordinatorSchema, UpdateServiceCoordinatorSchema } from '../types/validation-schemas';

export interface ServiceCoordinatorSearchFilters {
  firstName?: string;
  lastName?: string;
  email?: string;
  organization?: string;
  zone?: 'SW' | 'SE' | 'NE' | 'NW' | 'LC';
  supervisorId?: string;
  managerId?: string;
  directorId?: string;
  isActive?: boolean;
  specializations?: string[];
  maxCaseloadMin?: number;
  maxCaseloadMax?: number;
  currentCaseloadMin?: number;
  currentCaseloadMax?: number;
  hireDateFrom?: Date;
  hireDateTo?: Date;
}

export interface CreateServiceCoordinatorRequest {
  tenantId: string;
  scid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization: string;
  zone: 'SW' | 'SE' | 'NE' | 'NW' | 'LC';
  supervisorId?: string;
  managerId?: string;
  directorId?: string;
  maxCaseload?: number;
  specializations?: string[];
  licenseNumber?: string;
  hireDate: Date;
  createdBy: string;
}

export interface UpdateServiceCoordinatorRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  zone?: 'SW' | 'SE' | 'NE' | 'NW' | 'LC';
  supervisorId?: string;
  managerId?: string;
  directorId?: string;
  isActive?: boolean;
  maxCaseload?: number;
  specializations?: string[];
  licenseNumber?: string;
  hireDate?: Date;
  updatedBy: string;
}

export class ServiceCoordinatorService {
  constructor(private db: Knex) {}

  /**
   * Create a new service coordinator
   */
  async createServiceCoordinator(data: CreateServiceCoordinatorRequest): Promise<ApiResponse<ServiceCoordinator>> {
    const trx = await this.db.transaction();
    
    try {
      // Validate input
      CreateServiceCoordinatorSchema.parse({
        tenantId: data.tenantId,
        scid: data.scid,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        organization: data.organization,
        zone: data.zone,
        supervisorId: data.supervisorId,
        managerId: data.managerId,
        directorId: data.directorId,
        maxCaseload: data.maxCaseload,
        specializations: data.specializations,
        licenseNumber: data.licenseNumber,
        hireDate: data.hireDate,
        createdBy: data.createdBy,
        isActive: true,
        lastUpdated: new Date()
      });

      // Check if SCID already exists in tenant
      const existingSC = await trx('service_coordinators')
        .where('scid', data.scid)
        .where('tenant_id', data.tenantId)
        .first();

      if (existingSC) {
        await trx.rollback();
        return {
          success: false,
          error: {
            code: 'SC_EXISTS',
            message: 'Service Coordinator with this SCID already exists in this tenant'
          }
        };
      }

      // Check if email already exists in tenant
      const existingEmail = await trx('service_coordinators')
        .where('email', data.email)
        .where('tenant_id', data.tenantId)
        .first();

      if (existingEmail) {
        await trx.rollback();
        return {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Service Coordinator with this email already exists in this tenant'
          }
        };
      }

      // Create service coordinator
      const [serviceCoordinator] = await trx('service_coordinators')
        .insert({
          tenant_id: data.tenantId,
          scid: data.scid,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          organization: data.organization,
          zone: data.zone,
          supervisor_id: data.supervisorId,
          manager_id: data.managerId,
          director_id: data.directorId,
          is_active: true,
          max_caseload: data.maxCaseload,
          current_caseload: 0,
          specializations: data.specializations ? JSON.stringify(data.specializations) : null,
          license_number: data.licenseNumber,
          hire_date: data.hireDate,
          created_by: data.createdBy,
          last_updated: new Date()
        })
        .returning('*');

      await trx.commit();
      
      const mappedSC = this.mapDbToServiceCoordinator(serviceCoordinator);
      const validatedSC = ServiceCoordinatorSchema.parse(mappedSC);

      return {
        success: true,
        data: validatedSC,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      await trx.rollback();
      return {
        success: false,
        error: {
          code: 'SC_CREATE_ERROR',
          message: 'Failed to create service coordinator',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Update service coordinator information
   */
  async updateServiceCoordinator(scId: string, data: UpdateServiceCoordinatorRequest): Promise<ApiResponse<ServiceCoordinator>> {
    const trx = await this.db.transaction();
    
    try {
      // Validate input
      const validatedData = UpdateServiceCoordinatorSchema.parse(data);

      // Check if service coordinator exists
      const existingSC = await trx('service_coordinators')
        .where('id', scId)
        .first();

      if (!existingSC) {
        await trx.rollback();
        return {
          success: false,
          error: {
            code: 'SC_NOT_FOUND',
            message: 'Service Coordinator not found'
          }
        };
      }

      // Check email uniqueness if email is being updated
      if (data.email && data.email !== existingSC.email) {
        const emailExists = await trx('service_coordinators')
          .where('email', data.email)
          .where('tenant_id', existingSC.tenant_id)
          .where('id', '!=', scId)
          .first();

        if (emailExists) {
          await trx.rollback();
          return {
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: 'Service Coordinator with this email already exists in this tenant'
            }
          };
        }
      }

      // Update service coordinator
      const updateData: any = {
        ...validatedData,
        specializations: data.specializations ? JSON.stringify(data.specializations) : existingSC.specializations,
        updated_by: data.updatedBy,
        updated_at: new Date(),
        last_updated: new Date()
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const [updatedSC] = await trx('service_coordinators')
        .where('id', scId)
        .update(updateData)
        .returning('*');

      await trx.commit();
      
      const mappedSC = this.mapDbToServiceCoordinator(updatedSC);
      const validatedSC = ServiceCoordinatorSchema.parse(mappedSC);

      return {
        success: true,
        data: validatedSC,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      await trx.rollback();
      return {
        success: false,
        error: {
          code: 'SC_UPDATE_ERROR',
          message: 'Failed to update service coordinator',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get service coordinator by ID
   */
  async getServiceCoordinatorById(scId: string): Promise<ApiResponse<ServiceCoordinator>> {
    try {
      const sc = await this.db('service_coordinators')
        .where('id', scId)
        .first();

      if (!sc) {
        return {
          success: false,
          error: {
            code: 'SC_NOT_FOUND',
            message: 'Service Coordinator not found'
          }
        };
      }

      const mappedSC = this.mapDbToServiceCoordinator(sc);
      const validatedSC = ServiceCoordinatorSchema.parse(mappedSC);

      return {
        success: true,
        data: validatedSC,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SC_FETCH_ERROR',
          message: 'Failed to fetch service coordinator',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get service coordinator by SCID
   */
  async getServiceCoordinatorBySCID(scid: string, tenantId: string): Promise<ApiResponse<ServiceCoordinator>> {
    try {
      const sc = await this.db('service_coordinators')
        .where('scid', scid)
        .where('tenant_id', tenantId)
        .first();

      if (!sc) {
        return {
          success: false,
          error: {
            code: 'SC_NOT_FOUND',
            message: 'Service Coordinator not found'
          }
        };
      }

      const mappedSC = this.mapDbToServiceCoordinator(sc);
      const validatedSC = ServiceCoordinatorSchema.parse(mappedSC);

      return {
        success: true,
        data: validatedSC,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SC_FETCH_ERROR',
          message: 'Failed to fetch service coordinator',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Search service coordinators with filters and pagination
   */
  async searchServiceCoordinators(
    tenantId: string,
    filters: ServiceCoordinatorSearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{ serviceCoordinators: ServiceCoordinator[]; total: number }>> {
    try {
      let query = this.db('service_coordinators')
        .where('tenant_id', tenantId);

      // Apply filters
      if (filters.firstName) {
        query = query.where('first_name', 'ilike', `%${filters.firstName}%`);
      }

      if (filters.lastName) {
        query = query.where('last_name', 'ilike', `%${filters.lastName}%`);
      }

      if (filters.email) {
        query = query.where('email', 'ilike', `%${filters.email}%`);
      }

      if (filters.organization) {
        query = query.where('organization', 'ilike', `%${filters.organization}%`);
      }

      if (filters.zone) {
        query = query.where('zone', filters.zone);
      }

      if (filters.supervisorId) {
        query = query.where('supervisor_id', filters.supervisorId);
      }

      if (filters.managerId) {
        query = query.where('manager_id', filters.managerId);
      }

      if (filters.directorId) {
        query = query.where('director_id', filters.directorId);
      }

      if (filters.isActive !== undefined) {
        query = query.where('is_active', filters.isActive);
      }

      if (filters.maxCaseloadMin !== undefined) {
        query = query.where('max_caseload', '>=', filters.maxCaseloadMin);
      }

      if (filters.maxCaseloadMax !== undefined) {
        query = query.where('max_caseload', '<=', filters.maxCaseloadMax);
      }

      if (filters.currentCaseloadMin !== undefined) {
        query = query.where('current_caseload', '>=', filters.currentCaseloadMin);
      }

      if (filters.currentCaseloadMax !== undefined) {
        query = query.where('current_caseload', '<=', filters.currentCaseloadMax);
      }

      if (filters.hireDateFrom) {
        query = query.where('hire_date', '>=', filters.hireDateFrom);
      }

      if (filters.hireDateTo) {
        query = query.where('hire_date', '<=', filters.hireDateTo);
      }

      if (filters.specializations && filters.specializations.length > 0) {
        // Search for any of the specified specializations in the JSON array
        const specializationConditions = filters.specializations.map(spec => 
          `specializations::text ILIKE '%"${spec}"%'`
        ).join(' OR ');
        query = query.whereRaw(`(${specializationConditions})`);
      }

      // Get total count
      const totalResult = await query.clone().count('* as count').first();
      const total = parseInt(totalResult?.['count'] as string || '0');

      // Get paginated results
      const serviceCoordinators = await query
        .select('*')
        .orderBy('last_name', 'asc')
        .orderBy('first_name', 'asc')
        .limit(limit)
        .offset((page - 1) * limit);

      const scData = serviceCoordinators.map(sc => {
        const mapped = this.mapDbToServiceCoordinator(sc);
        return ServiceCoordinatorSchema.parse(mapped);
      });

      return {
        success: true,
        data: { serviceCoordinators: scData, total },
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
          code: 'SC_SEARCH_ERROR',
          message: 'Failed to search service coordinators',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get service coordinators by zone
   */
  async getServiceCoordinatorsByZone(
    tenantId: string,
    zone: 'SW' | 'SE' | 'NE' | 'NW' | 'LC',
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{ serviceCoordinators: ServiceCoordinator[]; total: number }>> {
    try {
      const query = this.db('service_coordinators')
        .where('tenant_id', tenantId)
        .where('zone', zone)
        .where('is_active', true);

      // Get total count
      const totalResult = await query.clone().count('* as count').first();
      const total = parseInt(totalResult?.['count'] as string || '0');

      // Get paginated results
      const serviceCoordinators = await query
        .select('*')
        .orderBy('last_name', 'asc')
        .orderBy('first_name', 'asc')
        .limit(limit)
        .offset((page - 1) * limit);

      const scData = serviceCoordinators.map(sc => {
        const mapped = this.mapDbToServiceCoordinator(sc);
        return ServiceCoordinatorSchema.parse(mapped);
      });

      return {
        success: true,
        data: { serviceCoordinators: scData, total },
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
          code: 'SC_FETCH_ERROR',
          message: 'Failed to fetch service coordinators by zone',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Update service coordinator caseload
   */
  async updateCaseload(scId: string, newCaseload: number, updatedBy: string): Promise<ApiResponse<ServiceCoordinator>> {
    try {
      const [updatedSC] = await this.db('service_coordinators')
        .where('id', scId)
        .update({
          current_caseload: newCaseload,
          updated_by: updatedBy,
          updated_at: new Date(),
          last_updated: new Date()
        })
        .returning('*');

      if (!updatedSC) {
        return {
          success: false,
          error: {
            code: 'SC_NOT_FOUND',
            message: 'Service Coordinator not found'
          }
        };
      }

      const mappedSC = this.mapDbToServiceCoordinator(updatedSC);
      const validatedSC = ServiceCoordinatorSchema.parse(mappedSC);

      return {
        success: true,
        data: validatedSC,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SC_UPDATE_ERROR',
          message: 'Failed to update service coordinator caseload',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get service coordinator hierarchy (supervisor, manager, director)
   */
  async getServiceCoordinatorHierarchy(scId: string): Promise<ApiResponse<{
    serviceCoordinator: ServiceCoordinator;
    supervisor?: ServiceCoordinator;
    manager?: ServiceCoordinator;
    director?: ServiceCoordinator;
  }>> {
    try {
      const sc = await this.db('service_coordinators')
        .where('id', scId)
        .first();

      if (!sc) {
        return {
          success: false,
          error: {
            code: 'SC_NOT_FOUND',
            message: 'Service Coordinator not found'
          }
        };
      }

      const hierarchy: any = {
        serviceCoordinator: ServiceCoordinatorSchema.parse(this.mapDbToServiceCoordinator(sc))
      };

      // Get supervisor
      if (sc.supervisor_id) {
        const supervisor = await this.db('service_coordinators')
          .where('id', sc.supervisor_id)
          .first();
        if (supervisor) {
          hierarchy.supervisor = ServiceCoordinatorSchema.parse(this.mapDbToServiceCoordinator(supervisor));
        }
      }

      // Get manager
      if (sc.manager_id) {
        const manager = await this.db('service_coordinators')
          .where('id', sc.manager_id)
          .first();
        if (manager) {
          hierarchy.manager = ServiceCoordinatorSchema.parse(this.mapDbToServiceCoordinator(manager));
        }
      }

      // Get director
      if (sc.director_id) {
        const director = await this.db('service_coordinators')
          .where('id', sc.director_id)
          .first();
        if (director) {
          hierarchy.director = ServiceCoordinatorSchema.parse(this.mapDbToServiceCoordinator(director));
        }
      }

      return {
        success: true,
        data: hierarchy,
        metadata: { timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SC_HIERARCHY_ERROR',
          message: 'Failed to fetch service coordinator hierarchy',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Map database row to ServiceCoordinator interface
   */
  private mapDbToServiceCoordinator(dbRow: any): ServiceCoordinator {
    const sc: ServiceCoordinator = {
      id: dbRow.id,
      tenantId: dbRow.tenant_id,
      scid: dbRow.scid,
      firstName: dbRow.first_name,
      lastName: dbRow.last_name,
      email: dbRow.email,
      organization: dbRow.organization,
      zone: dbRow.zone,
      isActive: dbRow.is_active,
      currentCaseload: dbRow.current_caseload,
      hireDate: new Date(dbRow.hire_date),
      lastUpdated: new Date(dbRow.last_updated),
      createdAt: new Date(dbRow.created_at),
      createdBy: dbRow.created_by
    };

    // Handle optional fields
    if (dbRow.phone) {
      sc.phone = dbRow.phone;
    }

    if (dbRow.supervisor_id) {
      sc.supervisorId = dbRow.supervisor_id;
    }

    if (dbRow.manager_id) {
      sc.managerId = dbRow.manager_id;
    }

    if (dbRow.director_id) {
      sc.directorId = dbRow.director_id;
    }

    if (dbRow.max_caseload) {
      sc.maxCaseload = dbRow.max_caseload;
    }

    if (dbRow.specializations) {
      sc.specializations = JSON.parse(dbRow.specializations);
    }

    if (dbRow.license_number) {
      sc.licenseNumber = dbRow.license_number;
    }

    if (dbRow.updated_at) {
      sc.updatedAt = new Date(dbRow.updated_at);
    }

    if (dbRow.updated_by) {
      sc.updatedBy = dbRow.updated_by;
    }

    return sc;
  }
}

export default ServiceCoordinatorService;