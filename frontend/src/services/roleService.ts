import type { UserRole, RoleData } from '@/types/auth';
import { getUserRole, saveUserRole, updateUserRole } from './api';

class RoleService {
  // Save role data to backend
  async saveRoleData(userId: string, role: UserRole, roleData: RoleData): Promise<void> {
    try {
      // We need to include the ID in the roleData for the backend to link it
      const dataWithId = { ...roleData, id: userId };
      await saveUserRole(role, dataWithId);
      console.log('Role data saved for user:', userId);
    } catch (error) {
      console.error('Error storing role data:', error);
      throw error;
    }
  }

  // Get role data from backend
  async getRoleData(userId: string): Promise<{ role: UserRole | null; roleData: RoleData | null }> {
    try {
      console.log('[RoleService] Fetching role data for userId:', userId);
      const response = await getUserRole(userId);
      console.log('[RoleService] API response:', response);

      if (response && response.role) {
        console.log('[RoleService] Role data found:', response.role);
        return {
          role: response.role as UserRole,
          roleData: response.roleData as RoleData
        };
      }

      console.log('[RoleService] No role data found for user');
      return { role: null, roleData: null };
    } catch (error) {
      console.error('[RoleService] Error retrieving role data:', error);
      return { role: null, roleData: null };
    }
  }

  // Check if user has completed role selection (now async)
  async hasRole(userId: string): Promise<boolean> {
    const { role } = await this.getRoleData(userId);
    return !!role;
  }

  // Legacy method kept for compatibility but now calls the main save method
  async saveRoleToClerk(userId: string, role: UserRole, roleData: RoleData): Promise<void> {
    await this.saveRoleData(userId, role, roleData);
  }

  // Update existing role data
  async updateRoleData(userId: string, role: UserRole, roleData: RoleData): Promise<void> {
    try {
      console.log('[RoleService] Updating role data for userId:', userId);
      const dataWithId = { ...roleData, id: userId };
      await updateUserRole(userId, role, dataWithId);
      console.log('[RoleService] Role data updated successfully');
    } catch (error) {
      console.error('[RoleService] Error updating role data:', error);
      throw error;
    }
  }
}

export const roleService = new RoleService();

