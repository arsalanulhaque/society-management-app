import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, DollarSign, PenSquare, AlertCircle, Info, Users, Building, FileText, Plus, Trash2 } from 'lucide-react';
import { ServiceRatesTab } from './ServiceRatesTab';
import { PaymentPlanTab } from './PaymentPlanTab';

const PaymentManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'houses');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, activeTab]);

  return (
    <MainLayout showBackButton>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage houses, users, buildings, documents, and maintenance fee plans.
          </p>
        </div>

        <Tabs
          value={activeTab}
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="service-charges" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Service Charges</span>
            </TabsTrigger>
            <TabsTrigger value="payment-plans" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Payment Plans</span>
            </TabsTrigger>
            <TabsTrigger value="payment-receipt" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Payment Receipt</span>
            </TabsTrigger>
            <TabsTrigger value="payment-schedule" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Plots Type</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="service-charges" className="mt-6">
            <ServiceRatesTab />
          </TabsContent>

          <TabsContent value="payment-plans" className="mt-6">
            <PaymentPlanTab />
          </TabsContent>

          <TabsContent value="payment-receipt" className="mt-6">
          </TabsContent>

          <TabsContent value="payment-schedule" className="mt-6">
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default PaymentManagement;