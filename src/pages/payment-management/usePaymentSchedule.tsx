import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { IPaymentSchedule } from '@/types/database';

const API_BASE_URL = 'http://localhost:4000/api';

export const usePaymentSchedule = () => {
  const [schedules, setSchedules] = useState<IPaymentSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSchedules(data.data);
    } catch (err) {
      toast.error('Failed to load payment schedules');
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async (schedule: Omit<IPaymentSchedule, 'PaymentScheduleID'>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(schedule),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Payment schedule added');
        fetchSchedules();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error adding schedule');
    }
  };

  const updateSchedule = async (schedule: IPaymentSchedule) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-schedule/${schedule.PaymentScheduleID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(schedule),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Payment schedule updated');
        fetchSchedules();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error updating schedule');
    }
  };

  const deleteSchedule = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-schedule/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Schedule deleted');
        setSchedules((prev) => prev.filter((s) => s.PaymentScheduleID !== id));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error deleting schedule');
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return {
    schedules,
    loading,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    refresh: fetchSchedules,
  };
};
