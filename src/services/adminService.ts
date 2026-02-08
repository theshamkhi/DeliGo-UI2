import { apiClient } from './api';
import {
    User,
    RegisterData,
    Role,
    CreateRoleData,
    Permission,
    CreatePermissionData,
} from '../types';

/**
 * Admin Service - For user, role, and permission management
 * All endpoints require MANAGER role
 */
export const adminService = {
    // ============================================
    // User Management
    // ============================================

    /**
     * Get all users
     */
    async getUsers(): Promise<User[]> {
        return await apiClient.get<User[]>('/admin/users');
    },

    /**
     * Get a specific user by ID
     */
    async getUserById(userId: string): Promise<User> {
        return await apiClient.get<User>(`/admin/users/${userId}`);
    },

    /**
     * Get users by role
     */
    async getUsersByRole(roleName: string): Promise<User[]> {
        return await apiClient.get<User[]>(`/admin/users/role/${roleName}`);
    },

    /**
     * Create a new user (uses unified registration)
     */
    async createUser(data: RegisterData): Promise<User> {
        return await apiClient.post<User>('/admin/users', data);
    },

    /**
     * Update a user's information
     */
    async updateUser(userId: string, data: RegisterData): Promise<User> {
        return await apiClient.put<User>(`/admin/users/${userId}`, data);
    },

    /**
     * Delete a user
     */
    async deleteUser(userId: string): Promise<void> {
        return await apiClient.delete<void>(`/admin/users/${userId}`);
    },

    /**
     * Activate a user account
     */
    async activateUser(userId: string): Promise<void> {
        return await apiClient.patch<void>(`/admin/users/${userId}/activate`);
    },

    /**
     * Deactivate a user account
     */
    async deactivateUser(userId: string): Promise<void> {
        return await apiClient.patch<void>(`/admin/users/${userId}/deactivate`);
    },

    // ============================================
    // Role Management
    // ============================================

    /**
     * Get all roles
     */
    async getRoles(): Promise<Role[]> {
        return await apiClient.get<Role[]>('/admin/roles');
    },

    /**
     * Get a specific role by ID
     */
    async getRoleById(roleId: string): Promise<Role> {
        return await apiClient.get<Role>(`/admin/roles/${roleId}`);
    },

    /**
     * Create a new role
     */
    async createRole(data: CreateRoleData): Promise<Role> {
        return await apiClient.post<Role>('/admin/roles', data);
    },

    /**
     * Update an existing role
     */
    async updateRole(roleId: string, data: CreateRoleData): Promise<Role> {
        return await apiClient.put<Role>(`/admin/roles/${roleId}`, data);
    },

    /**
     * Delete a role
     */
    async deleteRole(roleId: string): Promise<void> {
        return await apiClient.delete<void>(`/admin/roles/${roleId}`);
    },

    /**
     * Get permissions for a role
     */
    async getPermissionsForRole(roleId: string): Promise<Permission[]> {
        return await apiClient.get<Permission[]>(`/admin/roles/${roleId}/permissions`);
    },

    /**
     * Assign a permission to a role
     */
    async assignPermissionToRole(roleId: string, permissionId: string): Promise<Role> {
        return await apiClient.post<Role>(`/admin/roles/${roleId}/permissions/${permissionId}`);
    },

    /**
     * Remove a permission from a role
     */
    async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role> {
        return await apiClient.delete<Role>(`/admin/roles/${roleId}/permissions/${permissionId}`);
    },

    // ============================================
    // Permission Management
    // ============================================

    /**
     * Get all permissions
     */
    async getPermissions(): Promise<Permission[]> {
        return await apiClient.get<Permission[]>('/admin/permissions');
    },

    /**
     * Get a specific permission by ID
     */
    async getPermissionById(permissionId: string): Promise<Permission> {
        return await apiClient.get<Permission>(`/admin/permissions/${permissionId}`);
    },

    /**
     * Create a new permission
     */
    async createPermission(data: CreatePermissionData): Promise<Permission> {
        return await apiClient.post<Permission>('/admin/permissions', data);
    },

    /**
     * Update an existing permission
     */
    async updatePermission(permissionId: string, data: CreatePermissionData): Promise<Permission> {
        return await apiClient.put<Permission>(`/admin/permissions/${permissionId}`, data);
    },

    /**
     * Delete a permission
     */
    async deletePermission(permissionId: string): Promise<void> {
        return await apiClient.delete<void>(`/admin/permissions/${permissionId}`);
    },

    /**
     * Get permissions by resource type
     */
    async getPermissionsByResource(resource: string): Promise<Permission[]> {
        return await apiClient.get<Permission[]>(`/admin/permissions/resource/${resource}`);
    },
};