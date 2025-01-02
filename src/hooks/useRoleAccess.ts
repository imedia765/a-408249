import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'member' | 'collector' | 'admin' | null;

export const useRoleAccess = () => {
  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      console.log('Fetching user role...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('No session found');
        return null;
      }

      console.log('Session user:', session.user.id);

      const { data: role, error } = await supabase.rpc('get_user_role', {
        user_auth_id: session.user.id
      });

      if (error) {
        console.error('Error fetching role:', error);
        throw error;
      }

      console.log('Fetched role:', role);
      return role as UserRole;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  });

  const canAccessTab = (tab: string): boolean => {
    console.log('Checking access for tab:', tab, 'User role:', userRole);
    
    if (!userRole) return false;

    switch (userRole) {
      case 'admin':
        return true;
      case 'collector':
        return ['dashboard', 'users'].includes(tab);
      case 'member':
        return tab === 'dashboard';
      default:
        return false;
    }
  };

  return {
    userRole,
    roleLoading,
    canAccessTab,
  };
};