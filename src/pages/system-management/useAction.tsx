// hooks/useAction.ts
import { useEffect, useState } from 'react';
import { IAction } from '@/types/database';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:4000/api';

export const useAction = () => {
  const [actions, setActions] = useState<IAction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchActions = async () => {
    try {
      setLoading(true);
      setTimeout(() => { }, 15000)
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/action`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch action');
      const data = await response.json();
      setActions(data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAction = async (newAction: Omit<IAction, 'ActionID'>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newAction),
      });

      const data = await response.json();
      if (data?.success)
        toast.success('Action updated successfully');
      else
        toast.error(data.message);

      if (!response.ok) {
        toast.error('Failed to update action')
        throw new Error('Failed to update action');
      }
      setLoading(false);
    } catch (error) {
      console.error('Add error:', error);
      setLoading(false);
    }
  };

  const updateAction = async (updated: IAction) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/action/${updated.ActionID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      const data = await response.json();
      if (data.success)
        toast.success('Action updated successfully');
      else
        toast.error(data.message);

      if (!response.ok) throw new Error('Failed to update action');
      setLoading(false);
    } catch (error) {
      console.error('Update error:', error);
      setLoading(false);
    }
  };

  const deleteAction = async (actionID: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/action/${actionID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success)
        toast.success('Action updated successfully');
      else
        toast.error(data.message);

      setActions(prev => prev.filter(cat => cat.ActionID !== actionID));
      if (!response.ok) throw new Error('Failed to delete action');
      setLoading(false);
    } catch (error) {
      console.error('Delete error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  return {
    actions,
    loading,
    addAction,
    updateAction,
    deleteAction,
    refresh: fetchActions,
  };
};
