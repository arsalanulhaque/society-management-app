
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Settings,
  Banknote,
  Home,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Users,
  Building,
  ClipboardList,
  Wrench,
  KeyRound,
  FileText,
  FileText as FileTextIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';
import { usePermissions } from '@/hooks/use-permissions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { IMenuItem, ISubMenuItem } from '@/types/menu';

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const menuItems = useMenu();
  const { canView } = usePermissions();
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);

  // useEffect(() => {
  const authorizedMenuItems = menuItems.filter(item => canView(item.path));
  // }, [menuItems]);

  useEffect(() => {
    // Automatically open parent menu when a submenu item is active
    menuItems.forEach(item => {
      if (item.subItems && item.subItems.some(subItem => isSubItemActive(subItem))) {
        setOpenSubMenus(prev => prev.includes(item.path) ? prev : [...prev, item.path]);
      }
    });
  }, [location.pathname, location.search]);

  const toggleSubMenu = (path: string) => {
    setOpenSubMenus(prev =>
      prev.includes(path)
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  const handleSubItemClick = (subItem: ISubMenuItem, event: React.MouseEvent) => {
    event.preventDefault();
    navigate(subItem.path);
  };

  // const menuItems: MenuItem[] = [
  //   {
  //     path: '/',
  //     title: 'Dashboard',
  //     icon: <LayoutDashboard className="h-5 w-5" />,
  //     Permission: 'canView'
  //   },
  //   {
  //     path: '/society-management',
  //     title: 'Admin Tools',
  //     icon: <Settings className="h-5 w-5" />,
  //     Permission: 'canView',
  //     subItems: [
  //       {
  //         path: '/admin-tools?tab=houses',
  //         title: 'Edit Houses',
  //         icon: <Home className="h-4 w-4" />,
  //         Permission: 'canView'
  //       },
  //       {
  //         path: '/admin-tools?tab=fee-plan',
  //         title: 'Edit Maintenance Fee Plan',
  //         icon: <DollarSign className="h-4 w-4" />,
  //         Permission: 'canView'
  //       },
  //       {
  //         path: '/admin-tools?tab=users',
  //         title: 'User Management',
  //         icon: <Users className="h-4 w-4" />,
  //         Permission: 'canView'
  //       },
  //       {
  //         path: '/admin-tools?tab=buildings',
  //         title: 'Building Registry',
  //         icon: <Building className="h-4 w-4" />,
  //         Permission: 'canView'
  //       },
  //       {
  //         path: '/admin-tools?tab=documents',
  //         title: 'Document Templates',
  //         icon: <FileTextIcon className="h-4 w-4" />,
  //         Permission: 'canView'
  //       }
  //     ]
  //   },
  //   {
  //     path: '/management-panel',
  //     title: 'Management Panel',
  //     icon: <Banknote className="h-5 w-5" />,
  //     Permission: 'canView',
  //     subItems: [
  //       {
  //         path: '/management-panel?tab=monthly-maintenance',
  //         title: 'Monthly Maintenance',
  //         icon: <ClipboardList className="h-4 w-4" />,
  //         Permission: 'canView'
  //       },
  //       {
  //         path: '/management-panel?tab=utilities-bills',
  //         title: 'Utilities Bills',
  //         icon: <DollarSign className="h-4 w-4" />,
  //         Permission: 'canView'
  //       },
  //       {
  //         path: '/management-panel?tab=maintenance-requests',
  //         title: 'Maintenance Requests',
  //         icon: <Wrench className="h-4 w-4" />,
  //         Permission: 'canView'
  //       },
  //       {
  //         path: '/management-panel?tab=access-control',
  //         title: 'Access Control',
  //         icon: <KeyRound className="h-4 w-4" />,
  //         Permission: 'canView'
  //       }
  //     ]
  //   }
  // ];


  // Fixed function to properly check if a menu item is active based on current location
  const isMenuActive = (item: IMenuItem) => {
    if (location.pathname === item.path) return true;

    if (item.subItems) {
      return item.subItems.some(subItem => isSubItemActive(subItem));
    }
    return false;
  };

  // Enhanced function to check if a specific sub-item is active
  const isSubItemActive = (subItem: ISubMenuItem) => {
    if (subItem.path.includes('?')) {
      const [basePath, queryPart] = subItem.path.split('?');

      if (location.pathname !== basePath) {
        return false;
      }

      // Extract tab value from query params
      const params = new URLSearchParams(queryPart);
      const tabValue = params.get('tab');

      if (!tabValue) return false;

      // Get tab value from current URL
      const currentParams = new URLSearchParams(location.search);
      const currentTab = currentParams.get('tab');

      // Check if current tab matches or if no tab is specified and this is the default
      return tabValue === currentTab ||
        (!currentTab && (
          (basePath === '/management-panel' && tabValue === 'utilities-bills') ||
          (basePath === '/admin-tools' && tabValue === 'houses')
        ));
    }
    return location.pathname === subItem.path;
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <FileText size={18} className="text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">Maintenance System</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {authorizedMenuItems.map((item, index) => (
            <SidebarMenuItem key={index}>
              {
                item.subItems.length === 0 ? (
                  <SidebarMenuButton asChild className={cn(location.pathname === item.path && "bg-primary/10 text-primary")} >
                    <Link to={item.path}> {item.icon} <span>{item.title}</span> </Link>
                  </SidebarMenuButton>
                ) : (
                  <Collapsible
                    open={openSubMenus.includes(item.path) || isMenuActive(item)}
                    onOpenChange={() => toggleSubMenu(item.path)}
                    className="w-full"
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={cn(
                          "justify-between pr-2",
                          (isMenuActive(item) || openSubMenus.includes(item.path)) && "bg-primary/10 text-primary"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span>{item.title}</span>
                        </div>
                        {openSubMenus.includes(item.path) ?
                          <ChevronDown className="h-4 w-4" /> :
                          <ChevronRight className="h-4 w-4" />
                        }
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-9 pr-2 py-1 space-y-1">
                      {item.subItems
                        .filter(subItem => canView(subItem.path))
                        .map((subItem, subIndex) => (
                          <a
                            key={subIndex}
                            href={subItem.path}
                            onClick={(e) => handleSubItemClick(subItem, e)}
                            className={cn(
                              "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md",
                              "hover:bg-primary/10 hover:text-primary transition-colors",
                              isSubItemActive(subItem) && "bg-primary/10 text-primary"
                            )}
                          >
                            {subItem.icon}
                            <span>{subItem.title}</span>
                          </a>
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
