import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { IPaymentPlan } from '@/types/database';

const API_BASE_URL = 'http://localhost:4000/api';

export const usePaymentPlan = () => {
  const [paymentPlans, setPaymentPlans] = useState<IPaymentPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-plan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPaymentPlans(data.data);
    } catch (err) {
      toast.error('Failed to load payment plans');
    } finally {
      setLoading(false);
    }
  };

  const addPlan = async (plan: Omit<IPaymentPlan, 'PaymentPlanID'>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(plan),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Payment plan added');
        fetchPlans();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error adding plan');
    }
  };

  const updatePlan = async (plan: IPaymentPlan) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-plan/${plan.PaymentPlanID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(plan),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Payment plan updated');
        fetchPlans();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error updating plan');
    }
  };

  const deletePlan = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-plan/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Plan deleted');
        setPaymentPlans((prev) => prev.filter((p) => p.PaymentPlanID !== id));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error deleting plan');
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    paymentPlans,
    loading,
    addPlan,
    updatePlan,
    deletePlan,
    refresh: fetchPlans,
  };
};
