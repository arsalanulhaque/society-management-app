import { useEffect, useState } from 'react';
import { IRole, IRoleMenuActionsMap } from '@/types/database';
import { toast } from 'sonner';
import { useRole } from './useRole';
import { useMenu } from './useMenu';
import { useAction } from './useAction';
import { useMenuActionsMap } from './useMenuActionsMap';

const API_BASE_URL = 'http://localhost:4000/api';

export const useRolePermissions = () => {
  const { roles } = useRole();
  const [roleMenuActionsMap, setRoleMenuActionsMap] = useState<IRoleMenuActionsMap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterRole, setFilterRole] = useState<IRole>(roles[0]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/role-permissions/${filterRole?.RoleID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch permissions');
      const data = await response.json();
      setRoleMenuActionsMap(data.data as IRoleMenuActionsMap[]);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterRole && filterRole.RoleID > 0)
      fetchPermissions()
    setLoading(false)
  }, [filterRole, filterRole?.RoleID, loading]);

  const saveChanges = async (mapping: IRoleMenuActionsMap[]) => {
    try {
      setLoading(true);

      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/role-permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // if you're using token auth
        },
        body: JSON.stringify({ RoleMenuActions: mapping }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error('Failed to save permissions');
      if (data.success) {
        toast.success('Permission updated successfully!');
      } else {
        toast.error('Failed to update permissions!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!');
    }
    finally {
      setLoading(false);
      
    }
  };

  return {
    roles,
    roleMenuActionsMap,
    filterRole, setFilterRole,
    loading,
    saveChanges
  };
};
