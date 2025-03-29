
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import AppSidebar from './AppSidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children,
  showBackButton = false
}) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header showBackButton={showBackButton} />
          <main className="flex-1 p-6 overflow-auto animate-fade-in">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        <Toaster position="top-right" />
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
