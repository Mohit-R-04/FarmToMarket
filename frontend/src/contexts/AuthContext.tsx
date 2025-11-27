import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from "react";
import { useUser } from '@clerk/clerk-react';
import { roleService } from '@/services/roleService';
import type { UserRole, RoleData, User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: boolean;
  saveRole: (role: UserRole, roleData: RoleData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Clerk user with our user format
  useEffect(() => {
    const syncUser = async () => {
      console.log('[AuthContext] syncUser called, clerkLoaded:', clerkLoaded, 'clerkUser:', clerkUser?.id);

      if (!clerkLoaded) {
        console.log('[AuthContext] Clerk not loaded yet, waiting...');
        return;
      }

      if (clerkUser) {
        try {
          console.log('[AuthContext] Fetching role data for user:', clerkUser.id);
          const roleData = await roleService.getRoleData(clerkUser.id);
          console.log('[AuthContext] Role data received:', roleData);

          // Convert Clerk user to our User format
          const appUser: User = {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            phone: clerkUser.primaryPhoneNumber?.phoneNumber,
            role: roleData.role || undefined, // Remove default fallback
            roleData: roleData.roleData || {} as RoleData,
          };

          console.log('[AuthContext] Setting user state:', appUser);
          setUser(appUser);
        } catch (error) {
          console.error('[AuthContext] Error syncing user:', error);
          // Fallback user if backend fails - assume no role initially
          const fallbackUser = {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            phone: clerkUser.primaryPhoneNumber?.phoneNumber,
          };
          console.log('[AuthContext] Setting fallback user (no role):', fallbackUser);
          setUser(fallbackUser);
        }
      } else {
        console.log('[AuthContext] No clerk user, setting user to null');
        setUser(null);
      }

      setLoading(false);
      console.log('[AuthContext] syncUser complete');
    };

    syncUser();
  }, [clerkUser, clerkLoaded]);

  const saveRole = async (role: UserRole, roleData: RoleData) => {
    if (!clerkUser) {
      throw new Error('User not authenticated');
    }

    // Save role data with user ID
    await roleService.saveRoleData(clerkUser.id, role, roleData);

    // Update user state
    const appUser: User = {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress,
      phone: clerkUser.primaryPhoneNumber?.phoneNumber,
      role,
      roleData,
    };
    setUser(appUser);

    // Optionally sync with backend/Clerk metadata
    await roleService.saveRoleToClerk(clerkUser.id, role, roleData);
  };

  const refreshUser = async () => {
    // Trigger re-sync
    if (clerkUser) {
      const roleData = await roleService.getRoleData(clerkUser.id);
      const appUser: User = {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        phone: clerkUser.primaryPhoneNumber?.phoneNumber,
        role: roleData.role || undefined,
        roleData: roleData.roleData || {} as RoleData,
      };
      setUser(appUser);
    }
  };

  const value: AuthContextType = {
    user,
    loading: !clerkLoaded || loading,
    isAuthenticated: !!clerkUser,
    hasRole: !!user?.role, // Check if role is present
    saveRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
