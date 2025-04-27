// hooks/usePlotFloor.ts
import { useEffect, useState } from 'react';
import { IPlotFloor } from '@/types/database';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:4000/api';

export const usePlotFloor = () => {
  const [plotFloors, setPlotFloors] = useState<IPlotFloor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPlotFloors = async () => {
    try {
      setLoading(true);
      setTimeout(() => { }, 15000)
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/plot-floor`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch plot floors');
      const data = await response.json();
      setPlotFloors(data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFloor = async (newFloor: Omit<IPlotFloor, 'FloorID'>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/plot-floor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newFloor),
      });

      const data = await response.json();
      if (data?.success)
        toast.success('Plot floor updated successfully');
      else
        toast.error(data.message);

      if (!response.ok) {
        toast.error('Failed to update plot floor')
        throw new Error('Failed to update plot floor');
      }
      setLoading(false);
    } catch (error) {
      console.error('Add error:', error);
      setLoading(false);
    }
  };

  const updateFloor = async (updated: IPlotFloor) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/plot-floor/${updated.FloorID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      const data = await response.json();
      if (data.success)
        toast.success('Plot floor updated successfully');
      else
        toast.error(data.message);

      if (!response.ok) throw new Error('Failed to update plot floor');
      setLoading(false);
    } catch (error) {
      console.error('Update error:', error);
      setLoading(false);
    }
  };

  const deleteFloor = async (floorID: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/plot-floor/${floorID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success)
        toast.success('Plot floor updated successfully');
      else
        toast.error(data.message);

      setPlotFloors(prev => prev.filter(cat => cat.FloorID !== floorID));
      if (!response.ok) throw new Error('Failed to delete plot floor');
      setLoading(false);
    } catch (error) {
      console.error('Delete error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlotFloors();
  }, []);

  return {
    plotFloors,
    loading,
    addFloor,
    updateFloor,
    deleteFloor,
    refresh: fetchPlotFloors,
  };
};
