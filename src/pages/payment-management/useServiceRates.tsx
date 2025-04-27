import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { IServiceRate } from '@/types/database';
import { usePlotCategory } from '../society-management/usePlotCategory';
import { usePlotType } from '../society-management/usePlotType';
import { usePlotFloor } from '../society-management/usePlotFloor';

const API_BASE_URL = 'http://localhost:4000/api';

export const useServiceRates = () => {
  const { plotCategories } = usePlotCategory();
  const { plotTypes } = usePlotType();
  const { plotFloors } = usePlotFloor();
  const [serviceRates, setServiceRates] = useState<IServiceRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/service-rate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setServiceRates(data.data as IServiceRate[]);
    } catch (err) {
      console.error('Fetch rates error:', err);
      toast.error('Failed to load service rates');
    } finally {
      setLoading(false);
    }
  };

  const addRate = async (rate: Omit<IServiceRate, 'RateID'>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/service-rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rate),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Rate added');
        fetchRates();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      toast.error('Error adding rate');
      return false;
    }
  };

  const updateRate = async (rate: IServiceRate) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/service-rate/${rate.RateID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rate),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Rate updated');
        fetchRates();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      toast.error('Error updating rate');
      return false;
    }
  };

  const deleteRate = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/service-rate/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Rate deleted');
        setServiceRates((prev) => prev.filter((r) => r.RateID !== id));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error deleting rate');
    }
  };

  const calculateTotal = (typeRate: number, categoryRate: number, floorRate: number) => {
    return Number(typeRate || 0) + Number(categoryRate || 0) + Number(floorRate || 0);
  };

  const handleGeneratePaymentPlan = (rate: IServiceRate) => { 

  }


  useEffect(() => {
    fetchRates();
  }, [plotCategories]);

  return {
    serviceRates,
    loading,
    addRate,
    updateRate,
    deleteRate,
    refresh: fetchRates,
    calculateTotal,
    handleGeneratePaymentPlan,
    plotCategories, plotTypes, plotFloors
  };
};
