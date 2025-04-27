import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, DollarSign, PenSquare, AlertCircle, Info, Users, Building, FileText, Plus, Trash2 } from 'lucide-react';
import { MenusTab } from './MenuTab';
import { ActionTab } from './ActionTab';
import { MenuActionsMapTab } from './MenuActionsMapTab';
import { RoleTab } from './RoleTab';
import { RolePermissionsMapTab } from './RolePermissionsMapTab';

const SystemManagement: React.FC = () => {
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
          <h1 className="text-3xl font-bold tracking-tight">Society Management</h1>
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
            <TabsTrigger value="action" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Action</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Menu</span>
            </TabsTrigger>
            <TabsTrigger value="map-menu-actions" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Map Menu-Actions</span>
            </TabsTrigger>
            <TabsTrigger value="role" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Roles</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Permissions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="action" className="mt-6">
            <ActionTab />
          </TabsContent>

          <TabsContent value="menu" className="mt-6">
            <MenusTab />
          </TabsContent>

          <TabsContent value="map-menu-actions" className="mt-6">
            <MenuActionsMapTab />
          </TabsContent>

          <TabsContent value="role" className="mt-6">
            <RoleTab />
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <RolePermissionsMapTab/>
          </TabsContent>

        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SystemManagement;
