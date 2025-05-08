import { useEffect, useState, } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { IFullPaymentPlan, IPaymentPlanMaster, IPaymentPlanDetail, IServiceRate, IPlot } from '@/types/interfaces';

const API_BASE_URL = 'http://localhost:4000/api';

export const usePaymentPlan = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paramPaymentPlanID = queryParams.get('PaymentPlanID'); // get value of ?myParam=...

  const [paymentPlans, setPaymentPlans] = useState<IPaymentPlanMaster[]>();
  const [paymentDetails, setPaymentDetail] = useState<IPaymentPlanDetail>();
  const [fullPaymentPlan, setFullPaymentPlan] = useState<IFullPaymentPlan>();
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFullPaymentPlan = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-plan-full/${paramPaymentPlanID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Parse the JsonResult from the API response
      const response = await res.json();
      if (!res.ok) throw new Error(response.message);
      const data = JSON.parse(response.data[0][0].Result);
      // Assuming the data structure is like the one you provided
      const fullPaymentPlan: IFullPaymentPlan = {
        PaymentPlanMaster: JSON.parse(JSON.stringify(data.PaymentPlan)) as IPaymentPlanMaster, // PaymentPlan is already an object, so it's used directly
        PaymentPlanDetails: JSON.parse(JSON.stringify(data.Installments)) as IPaymentPlanDetail[], // Parse the stringified Installments array
        ServiceRate: JSON.parse(JSON.stringify(data.ServiceRates)) as IServiceRate, // Parse the stringified ServiceRates array
        Plots: JSON.parse(JSON.stringify(data.Plots)) as IPlot[], // Parse the stringified Plots array
      };

      setFullPaymentPlan(fullPaymentPlan);
    } catch (err) {
      toast.error('Failed to load payment plan');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPaymentPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/payment-plan/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Parse the JsonResult from the API response
      const response = await res.json();
      if (!res.ok) throw new Error(response.message);
      const data = response;

      setPaymentPlans(data.data as IPaymentPlanMaster[]);
    } catch (err) {
      toast.error('Failed to load payment plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramPaymentPlanID === null)
      fetchAllPaymentPlans()
    else fetchFullPaymentPlan();
  }, [location.search]);


  return {
    paymentPlans,
    fullPaymentPlan,
    loading,
    fetchAllPaymentPlans: fetchAllPaymentPlans,
  
    // addPlan,
    // updatePlan,
    // deletePlan,
    refresh: fetchFullPaymentPlan,
  };
};
