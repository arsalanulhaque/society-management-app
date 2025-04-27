// hooks/usePlotCategory.ts
import { useEffect, useState } from 'react';
import { IPlot, IPlotCategory, IPlotType } from '@/types/database';
import { toast } from 'sonner';
import { usePlotCategory } from './usePlotCategory';
import { usePlotType } from './usePlotType';
import { usePlotFloor } from './usePlotFloor';

const API_BASE_URL = 'http://localhost:4000/api';

export const usePlot = () => {
  const { plotCategories } = usePlotCategory();
  const { plotTypes } = usePlotType();
  const { plotFloors } = usePlotFloor();
  const [plots, setPlots] = useState<IPlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<IPlotCategory>(plotCategories[0]);
  const [filterType, setFilterType] = useState<IPlotType>(plotTypes[0]);

  const fetchPlots = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/plot`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch plot');
      const data = await response.json();

      setPlots(data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setFilterCategory(plotCategories[0])
      setFilterType(plotTypes[0])
    }
  };

  const getFilteredPlots = () => {
    return plots.filter(plot => {
      // Category filter
      const categoryMatch =
        !filterCategory || filterCategory.CategoryID === 0 || plot.CategoryID === filterCategory.CategoryID;

      const typeMatch =
        !filterType || filterType.TypeID === 0 || plot.TypeID === filterType.TypeID;
      return categoryMatch && typeMatch
    });
  };

  const addPlots = async (newPlot: Omit<IPlot, 'PlotID'>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/plot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newPlot),
      });

      const data = await response.json();
      if (data?.success)
        toast.success('Plot updated successfully');
      else
        toast.error(data.message);

      if (!response.ok) {
        toast.error('Failed to update plot')
        throw new Error('Failed to update plot');
      }
      setLoading(false);
    } catch (error) {
      console.error('Add error:', error);
      setLoading(false);
    }
  };

  const updatePlot = async (updated: IPlot) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/plot/${updated.PlotID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      const data = await response.json();
      if (data.success)
        toast.success('Plot updated successfully');
      else
        toast.error(data.message);

      if (!response.ok) throw new Error('Failed to update plot');
      setLoading(false);
    } catch (error) {
      console.error('Update error:', error);
      setLoading(false);
    }
  };

  const deletePlot = async (plotID: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/plot/${plotID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success)
        toast.success('Plot updated successfully');
      else
        toast.error(data.message);

      setPlots(prev => prev.filter(cat => cat.PlotID !== plotID));
      if (!response.ok) throw new Error('Failed to delete plot');
      setLoading(false);
    } catch (error) {
      console.error('Delete error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlots();
  }, [plotCategories]);

  return {
    plots,
    loading,
    addPlots,
    updatePlot,
    deletePlot,
    refresh: fetchPlots,
    filteredPlots: getFilteredPlots(),
    filterCategory,
    setFilterCategory,
    filterType, setFilterType,
    plotCategories, plotTypes, plotFloors
  };
};
