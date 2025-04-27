import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, DollarSign, PenSquare, AlertCircle, Info, Users, Building, FileText, Plus, Trash2 } from 'lucide-react';
import { PlotsTab } from './PlotsTab';
import { UserManagementTab } from './UserManagementTab';
import { PlotTypeTab } from './PlotTypeTab';
import { PlotCategoryTab } from './PlotCategoryTab';
import { PlotFloorTab } from './PlotFloorTab';
import { useAuth } from '@/contexts/AuthContext';
import Unauthorized from '@/pages/Unauthorized';

const SocietyManagement: React.FC = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { menus, hasPermission } = useAuth();
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
          <h1 className="text-3xl font-bold tracking-tight">Society Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage houses, users, buildings, documents, and maintenance fee plans.
          </p>
        </div>

        <Tabs
          value={activeTab}
          className="w-full"
          onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="plots" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Plots Management</span>
            </TabsTrigger>
            <TabsTrigger value="plot-users" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Plots Users</span>
            </TabsTrigger>
            <TabsTrigger value="plot-category" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Plots Category</span>
            </TabsTrigger>
            <TabsTrigger value="plot-type" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Plots Type</span>
            </TabsTrigger>
            <TabsTrigger value="plot-floors" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Plots Floors</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plots" className="mt-6">
            {hasPermission(location.pathname + location.search, "CanView") === true ? <PlotsTab /> : <Unauthorized />}
          </TabsContent>

          <TabsContent value="plot-users" className="mt-6">
            {hasPermission(location.pathname + location.search, "CanView") === true ? <UserManagementTab /> : <Unauthorized />}
          </TabsContent>

          <TabsContent value="plot-category" className="mt-6">
            {hasPermission(location.pathname + location.search, "CanView") === true ? <PlotCategoryTab /> : <Unauthorized />}
          </TabsContent>

          <TabsContent value="plot-type" className="mt-6">
            {hasPermission(location.pathname + location.search, "CanView") === true ? <PlotTypeTab /> : <Unauthorized />}
          </TabsContent>

          <TabsContent value="plot-floors" className="mt-6">
            {hasPermission(location.pathname + location.search, "CanView") === true ? <PlotFloorTab /> : <Unauthorized />}
          </TabsContent>

        </Tabs>
      </div>
    </MainLayout>
  );
};


export default SocietyManagement;