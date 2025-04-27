// hooks/usePlotPlotType.ts
import { useEffect, useState } from 'react';
import { IPlotType } from '@/types/database';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:4000/api';

export const usePlotType = () => {
  const [plotTypes, setPlotTypes] = useState<IPlotType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPlotTypes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/plot-type`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch plot types');
      const data = await response.json();
      setPlotTypes(data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPlotType = async (newPlotType: Omit<IPlotType, 'TypeID'>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/plot-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newPlotType),
      });

      const data = await response.json();
      if (data?.success)
        toast.success('Plot type added successfully');
      else
        toast.error(data.message);

      if (!response.ok) {
        toast.error('Failed to add plot type')
        throw new Error('Failed to update plot type');
      }
      setLoading(false);
    } catch (error) {
      console.error('Add error:', error);
      setLoading(false);
    }
  };

  const updatePlotType = async (updated: IPlotType) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/plot-type/${updated.TypeID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      const data = await response.json();
      if (data.success)
        toast.success('Plot type updated successfully');
      else
        toast.error(data.message);

      if (!response.ok) throw new Error('Failed to update plot type');
      setLoading(false);
    } catch (error) {
      console.error('Update error:', error);
      setLoading(false);
    }
  };

  const deletePlotType = async (typeID: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/plot-type/${typeID}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, },
      });

      const data = await response.json();
      if (data.success)
        toast.success('Plot type updated successfully');
      else
        toast.error(data.message);

      setPlotTypes(prev => prev.filter(cat => cat.TypeID !== typeID));
      if (!response.ok) throw new Error('Failed to delete plot type');
      setLoading(false);
    } catch (error) {
      console.error('Delete error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlotTypes();
  }, []);

  return {
    plotTypes,
    loading,
    addPlotType,
    updatePlotType,
    deletePlotType,
    refresh: fetchPlotTypes,
  };
};