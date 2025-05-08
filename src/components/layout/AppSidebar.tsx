import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { IMenuItem, ISubMenuItem } from '@/types/menu';
import { useAuth } from '@/contexts/AuthContext';

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { menus, hasPermission } = useAuth();
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);

  useEffect(() => {
    // Automatically open parent menu when a submenu item is active
    menus.forEach(item => {
      if (item.SubItems && item.SubItems.some(subItem => isSubItemActive(subItem))) {
        setOpenSubMenus(prev => prev.includes(item.Path) ? prev : [...prev, item.Path]);
      }
    });
  }, [location.pathname, location.search, menus]);

  const toggleSubMenu = (path: string) => {
    setOpenSubMenus(prev =>
      prev.includes(path)
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  const handleParentClick = (item: IMenuItem) => {
    toggleSubMenu(item.Path);
    navigate(item.Path);
  };

  const isMenuActive = (item: IMenuItem) => {
    if (location.pathname === item.Path) return true;
    if (item.SubItems) {
      return item.SubItems.some(subItem => isSubItemActive(subItem));
    }
    return false;
  };

  const isSubItemActive = (subItem: ISubMenuItem) => {
    const [basePath, queryPart] = subItem.Path.split('?');
    if (location.pathname !== basePath) return false;
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      const tabValue = params.get('tab');
      const currentParams = new URLSearchParams(location.search);
      const currentTab = currentParams.get('tab');
      return tabValue === currentTab;
    }
    return true;
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <FileText size={18} className="text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">Al-Ashraf Society</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menus.filter(item => hasPermission(item.Path, item.Permission)).map((item, index) => (
            <SidebarMenuItem key={index}>
              {(!item.SubItems || item.SubItems.length === 0) ? (
                <SidebarMenuButton
                  onClick={() => navigate(item.Path)}
                  className={cn(location.pathname === item.Path && "bg-primary/10 text-primary")}
                >
                  {item.Icon}
                  <span>{item.Title}</span>
                </SidebarMenuButton>
              ) : (
                <Collapsible
                  open={openSubMenus.includes(item.Path) || isMenuActive(item)}
                  onOpenChange={() => toggleSubMenu(item.Path)}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      onClick={() => handleParentClick(item)}
                      className={cn(
                        "justify-between pr-2",
                        (isMenuActive(item) || openSubMenus.includes(item.Path)) && "bg-primary/10 text-primary"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {item.Icon}
                        <span>{item.Title}</span>
                      </div>
                      {openSubMenus.includes(item.Path) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-9 pr-2 py-1 space-y-1">
                    {item.SubItems
                      .filter(subItem => hasPermission(subItem.Path, 'CanView'))
                      .map((subItem, subIndex) => (
                        <div
                          key={subIndex}
                          onClick={() => navigate(subItem.Path)}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer",
                            "hover:bg-primary/10 hover:text-primary transition-colors",
                            isSubItemActive(subItem) && "bg-primary/10 text-primary"
                          )}
                        >
                          {subItem.Icon}
                          <span>{subItem.Title}</span>
                        </div>
                      ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
