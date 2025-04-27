// hooks/usePlotCategory.ts
import { useEffect, useState } from 'react';
import { IPlotCategory } from '@/types/database';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:4000/api';

export const usePlotCategory = () => {
  const [plotCategories, setPlotCategories] = useState<IPlotCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPlotCategories = async () => {
    try {
      setLoading(true);
      setTimeout(() => { }, 15000)
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/plot-category`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch plot categories');
      const data = await response.json();
      setPlotCategories(data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (newCategory: Omit<IPlotCategory, 'CategoryID'>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/plot-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newCategory),
      });

      const data = await response.json();
      if (data?.success)
        toast.success('Plot category updated successfully');
      else
        toast.error(data.message);

      if (!response.ok) {
        toast.error('Failed to update plot category')
        throw new Error('Failed to update plot category');
      }
      setLoading(false);
    } catch (error) {
      console.error('Add error:', error);
      setLoading(false);
    }
  };

  const updateCategory = async (updated: IPlotCategory) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/plot-category/${updated.CategoryID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      const data = await response.json();
      if (data.success)
        toast.success('Plot category updated successfully');
      else
        toast.error(data.message);

      if (!response.ok) throw new Error('Failed to update plot category');
      setLoading(false);
    } catch (error) {
      console.error('Update error:', error);
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryID: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/plot-category/${categoryID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success)
        toast.success('Plot category updated successfully');
      else
        toast.error(data.message);

      setPlotCategories(prev => prev.filter(cat => cat.CategoryID !== categoryID));
      if (!response.ok) throw new Error('Failed to delete plot category');
      setLoading(false);
    } catch (error) {
      console.error('Delete error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlotCategories();
  }, []);

  return {
    plotCategories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refresh: fetchPlotCategories,
  };
};
