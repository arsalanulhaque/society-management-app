// hooks/useRole.ts
import { useEffect, useState } from 'react';
import { IRole } from '@/types/database';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:4000/api';

export const useRole = () => {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/role`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch role');
      const data = await response.json();
      setRoles(data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (newRole: Omit<IRole, 'RoleID'>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newRole),
      });

      const data = await response.json();
      if (data?.success)
        toast.success('Role added successfully');
      else
        toast.error(data.message);

      if (!response.ok) {
        toast.error('Failed to add role')
        throw new Error('Failed to add role');
      }
      setLoading(false);
    } catch (error) {
      console.error('Add role error:', error);
      setLoading(false);
    }
  };

  const updateRole = async (updated: IRole) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/role/${updated.RoleID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      const data = await response.json();
      if (data.success)
        toast.success('Role updated successfully');
      else
        toast.error(data.message);

      if (!response.ok) throw new Error('Failed to update role');
      setLoading(false);
    } catch (error) {
      console.error('Update role error:', error);
      setLoading(false);
    }
  };

  const deleteRole = async (roleID: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/role/${roleID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success)
        toast.success('Role deleted successfully');
      else
        toast.error(data.message);

      setRoles(prev => prev.filter(cat => cat.RoleID !== roleID));
      if (!response.ok) throw new Error('Failed to delete role');
      setLoading(false);
    } catch (error) {
      console.error('Delete role error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    addRole,
    updateRole,
    deleteRole,
    refresh: fetchRoles,
  };
};
