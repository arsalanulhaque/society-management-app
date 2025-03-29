
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, Banknote, Wrench, KeyRound } from 'lucide-react';
import UtilitiesBillsTab from '@/components/management/UtilitiesBillsTab';
import MonthlyMaintenanceTab from '@/components/management/MonthlyMaintenanceTab';
import ExportOptions from '@/components/management/ExportOptions';
import AccessControlTab from '@/components/management/AccessControlTab';
import { usePermissions } from '@/hooks/use-permissions';

const ManagementPanel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userRole } = usePermissions();
  const defaultTab = 'utilities-bills';
  const tabFromUrl = searchParams.get('tab');
  const initialTab = tabFromUrl || defaultTab;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update the active tab when the URL search parameters change
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else {
      // If no tab is specified in the URL, set it to the default tab
      setActiveTab(defaultTab);
    }
  }, [tabFromUrl]);

  // Update URL when tab changes - safely using the navigate function instead of directly manipulating the URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without triggering a navigation/reload
    navigate(`/management-panel?tab=${value}`, { replace: true });
  };

  return (
    <MainLayout showBackButton>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Management Panel</h1>
          <p className="text-muted-foreground mt-1">
            Manage utility bills, maintenance fees, requests, and access control.
          </p>
        </div>

        <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="utilities-bills" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Utility Bills/Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="monthly-maintenance" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              <span>Monthly Maintenance</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance-requests" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span>Maintenance Requests</span>
            </TabsTrigger>
            <TabsTrigger value="access-control" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              <span>Access Control</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="utilities-bills" className="mt-6">
            <UtilitiesBillsTab />
          </TabsContent>
          
          <TabsContent value="monthly-maintenance" className="mt-6">
            <MonthlyMaintenanceTab />
          </TabsContent>
          
          <TabsContent value="maintenance-requests" className="mt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium">Maintenance Requests</h3>
              <p>This feature is under development.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="access-control" className="mt-6">
            <AccessControlTab />
          </TabsContent>
        </Tabs>

        <ExportOptions />
      </div>
    </MainLayout>
  );
};

export default ManagementPanel;
