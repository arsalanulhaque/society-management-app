import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { IPaymentReceipt } from '@/types/database';

const API_BASE_URL = 'http://localhost:4000/api';

export const usePaymentReceipt = () => {
  const [receipts, setReceipts] = useState<IPaymentReceipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-receipt`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setReceipts(data.data);
    } catch (err) {
      toast.error('Failed to load payment receipts');
    } finally {
      setLoading(false);
    }
  };

  const addReceipt = async (receipt: Omit<IPaymentReceipt, 'ReceiptID'>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(receipt),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Payment receipt added');
        fetchReceipts();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error adding receipt');
    }
  };

  const updateReceipt = async (receipt: IPaymentReceipt) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-receipt/${receipt.ReceiptID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(receipt),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Payment receipt updated');
        fetchReceipts();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error updating receipt');
    }
  };

  const deleteReceipt = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-receipt/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Receipt deleted');
        setReceipts((prev) => prev.filter((r) => r.ReceiptID !== id));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error deleting receipt');
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return {
    receipts,
    loading,
    addReceipt,
    updateReceipt,
    deleteReceipt,
    refresh: fetchReceipts,
  };
};
