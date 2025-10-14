import { Knex } from 'knex';
import { User, Role, UserRole } from '../types';
import { 
  CreateUserSchema, 
  UpdateUserSchema,
  UserSchema 
} from '../types/validation-schemas';
import { AuthService } from './auth.service';

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  region?: string;
  memberPanel?: string[];
  providerNetwork?: string[];
  roleIds: string[];
  createdBy: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  region?: string;
  memberPanel?: string[];
  providerNetwork?: string[];
  isActive?: boolean;
  updatedBy: string;
}

export class UserService {
  constructor(
    private db: Knex,
    private authService: AuthService
  ) {}

  /**
   * Create a new user with roles
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    const trx = await this.db.transaction();
    
    try {
      // Validate input
      const validatedData = CreateUserSchema.parse({
        ...userData,
        password: undefined // Remove password from validation as it's handled separately
      });

      // Check if email already exists in tenant
      const existingUser = await trx('users')
        .where('email', userData.email)
        .where('tenant_id', userData.tenantId)
        .first();

      if (existingUser) {
        throw new Error('User with this email already exists in this tenant');
      }

      // Hash password
      const passwordHash = await this.authService.hashPassword(userData.password);

      // Create user
      const [user] = await trx('users')
        .insert({
          tenant_id: userData.tenantId,
          email: userData.email,
          password_hash: passwordHash,
          first_name: userData.firstName,
          last_name: userData.lastName,
          region: userData.region,
          member_panel: userData.memberPanel ? JSON.stringify(userData.memberPanel) : null,
          provider_network: userData.providerNetwork ? JSON.stringify(userData.providerNetwork) : null,
          created_by: userData.createdBy,
          is_active: true
        })
        .returning('*');

      // Assign roles
      if (userData.roleIds && userData.roleIds.length > 0) {
        const roleAssignments = userData.roleIds.map(roleId => ({
          user_id: user.id,
          role_id: roleId,
          assigned_by: userData.createdBy
        }));

        await trx('user_roles').insert(roleAssignments);
      }

      await trx.commit();
      
      return UserSchema.parse(user);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    const trx = await this.db.transaction();
    
    try {
      // Validate input
      const validatedData = UpdateUserSchema.parse(userData);

      // Check if user exists
      const existingUser = await trx('users')
        .where('id', userId)
        .first();

      if (!existingUser) {
        throw new Error('User not found');
      }

      // Check email uniqueness if email is being updated
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await trx('users')
          .where('email', userData.email)
          .where('tenant_id', existingUser.tenant_id)
          .where('id', '!=', userId)
          .first();

        if (emailExists) {
          throw new Error('User with this email already exists in this tenant');
        }
      }

      // Update user
      const [updatedUser] = await trx('users')
        .where('id', userId)
        .update({
          ...validatedData,
          member_panel: userData.memberPanel ? JSON.stringify(userData.memberPanel) : existingUser.member_panel,
          provider_network: userData.providerNetwork ? JSON.stringify(userData.providerNetwork) : existingUser.provider_network,
          updated_by: userData.updatedBy,
          updated_at: new Date()
        })
        .returning('*');

      await trx.commit();
      
      return UserSchema.parse(updatedUser);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Get user by ID with roles
   */
  async getUserById(userId: string): Promise<User | null> {
    const user = await this.db('users')
      .select('*')
      .where('id', userId)
      .first();

    if (!user) {
      return null;
    }

    return UserSchema.parse(user);
  }

  /**
   * Get user by email within tenant
   */
  async getUserByEmail(email: string, tenantId: string): Promise<User | null> {
    const user = await this.db('users')
      .select('*')
      .where('email', email)
      .where('tenant_id', tenantId)
      .first();

    if (!user) {
      return null;
    }

    return UserSchema.parse(user);
  }

  /**
   * Get users by tenant with pagination
   */
  async getUsersByTenant(
    tenantId: string, 
    page: number = 1, 
    limit: number = 20,
    filters?: {
      isActive?: boolean;
      region?: string;
      search?: string;
    }
  ): Promise<{ users: User[]; total: number }> {
    let query = this.db('users')
      .where('tenant_id', tenantId);

    // Apply filters
    if (filters?.isActive !== undefined) {
      query = query.where('is_active', filters.isActive);
    }

    if (filters?.region) {
      query = query.where('region', filters.region);
    }

    if (filters?.search) {
      query = query.where(function() {
        this.whereILike('first_name', `%${filters.search}%`)
          .orWhereILike('last_name', `%${filters.search}%`)
          .orWhereILike('email', `%${filters.search}%`);
      });
    }

    // Get total count
    const totalResult = await query.clone().count('* as count').first();
    const total = parseInt(totalResult?.count as string || '0');

    // Get paginated results
    const users = await query
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      users: users.map(user => UserSchema.parse(user)),
      total
    };
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<void> {
    // Check if assignment already exists
    const existingAssignment = await this.db('user_roles')
      .where('user_id', userId)
      .where('role_id', roleId)
      .first();

    if (existingAssignment) {
      throw new Error('User already has this role assigned');
    }

    // Verify user and role exist and are in same tenant
    const user = await this.db('users').where('id', userId).first();
    const role = await this.db('roles').where('id', roleId).first();

    if (!user || !role) {
      throw new Error('User or role not found');
    }

    if (user.tenant_id !== role.tenant_id) {
      throw new Error('User and role must be in the same tenant');
    }

    // Create assignment
    await this.db('user_roles').insert({
      user_id: userId,
      role_id: roleId,
      assigned_by: assignedBy
    });
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleId: string): Promise<void> {
    const deletedCount = await this.db('user_roles')
      .where('user_id', userId)
      .where('role_id', roleId)
      .del();

    if (deletedCount === 0) {
      throw new Error('Role assignment not found');
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    const roles = await this.db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .select('roles.*')
      .where('user_roles.user_id', userId);

    return roles;
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(userId: string, deactivatedBy: string): Promise<void> {
    const updatedCount = await this.db('users')
      .where('id', userId)
      .update({
        is_active: false,
        updated_by: deactivatedBy,
        updated_at: new Date()
      });

    if (updatedCount === 0) {
      throw new Error('User not found');
    }
  }

  /**
   * Reactivate user
   */
  async reactivateUser(userId: string, reactivatedBy: string): Promise<void> {
    const updatedCount = await this.db('users')
      .where('id', userId)
      .update({
        is_active: true,
        updated_by: reactivatedBy,
        updated_at: new Date()
      });

    if (updatedCount === 0) {
      throw new Error('User not found');
    }
  }

  /**
   * Change user password (admin function)
   */
  async changeUserPassword(userId: string, newPassword: string, changedBy: string): Promise<void> {
    const passwordHash = await this.authService.hashPassword(newPassword);

    const updatedCount = await this.db('users')
      .where('id', userId)
      .update({
        password_hash: passwordHash,
        updated_by: changedBy,
        updated_at: new Date()
      });

    if (updatedCount === 0) {
      throw new Error('User not found');
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(roleId: string, tenantId: string): Promise<User[]> {
    const users = await this.db('users')
      .join('user_roles', 'users.id', 'user_roles.user_id')
      .select('users.*')
      .where('user_roles.role_id', roleId)
      .where('users.tenant_id', tenantId)
      .where('users.is_active', true);

    return users.map(user => UserSchema.parse(user));
  }

  /**
   * Search users for assignment
   */
  async searchUsers(
    tenantId: string,
    query: string,
    filters?: {
      region?: string;
      role?: string;
      limit?: number;
    }
  ): Promise<User[]> {
    let dbQuery = this.db('users')
      .where('tenant_id', tenantId)
      .where('is_active', true);

    // Apply search
    if (query) {
      dbQuery = dbQuery.where(function() {
        this.whereILike('first_name', `%${query}%`)
          .orWhereILike('last_name', `%${query}%`)
          .orWhereILike('email', `%${query}%`);
      });
    }

    // Apply filters
    if (filters?.region) {
      dbQuery = dbQuery.where('region', filters.region);
    }

    if (filters?.role) {
      dbQuery = dbQuery
        .join('user_roles', 'users.id', 'user_roles.user_id')
        .join('roles', 'user_roles.role_id', 'roles.id')
        .where('roles.name', filters.role);
    }

    const users = await dbQuery
      .select('users.*')
      .distinct()
      .limit(filters?.limit || 20)
      .orderBy('first_name', 'asc');

    return users.map(user => UserSchema.parse(user));
  }
}

export default UserService;