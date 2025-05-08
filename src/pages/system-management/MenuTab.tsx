import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronDown, ChevronRight, Info, PenSquare, Plus, Trash2 } from 'lucide-react';
import { IMenuTable } from '@/types/database';
import { IMenuItem, ISubMenuItem } from '@/types/menu';
import { useForm, Controller } from 'react-hook-form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from '@/components/ui/select'; // Adjust the import path as needed
import { useMenu } from './useMenu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@radix-ui/react-collapsible';

const MenuFormSchema = z.object({
    MenuName: z.string().min(1, "Menu name is required"),
    MenuURL: z.coerce.number().min(1, "Menu URL is required"),
    ParentMenuID: z.coerce.number().min(1, 'Parent Menu is required'),
    Position: z.coerce.number().min(1, 'Poition is required'),
})

export const MenusTab: React.FC = () => {
    const { pathname, search } = useLocation();
    const fullUrl = pathname + search;
    const { menus, hasPermission } = useAuth();
    const { loading, addMenu, updateMenu, deleteMenu, refresh } = useMenu();
    const [activeForm, setActiveForm] = useState<boolean>(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);
    const menuForm = useForm<z.infer<typeof MenuFormSchema>>({
        resolver: zodResolver(MenuFormSchema),
        defaultValues: { MenuName: "", MenuURL: 0, ParentMenuID: 0, Position: 0, },
    });

    useEffect(() => {
        // Automatically open parent menu when a submenu item is active
        menus.forEach(item => {
            if (item.SubItems && item.SubItems.some(subItem => isSubItemActive(subItem))) {
                setOpenSubMenus(prev => prev.includes(item.Path) ? prev : [...prev, item.Path]);
            }
        });
    }, [location.pathname, location.search, menus]);

    const handleParentClick = (item: IMenuItem) => {
        toggleSubMenu(item.Path);
    };

    const toggleSubMenu = (path: string) => {
        setOpenSubMenus(prev =>
            prev.includes(path)
                ? prev.filter(item => item !== path)
                : [...prev, path]
        );
    };


    const isMenuActive = (item: IMenuItem) => {
        // if (location.pathname === item.Path) return true;
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

    const handleAddMenu = () => {
        setSelectedMenu(null);
        menuForm.reset({ MenuName: "", MenuURL: 0, ParentMenuID: 0, Position: 0, });
        setActiveForm(true);
    };

    const handleEditMenu = (menu: IMenuTable) => {
        setSelectedMenu(menu);
        menuForm.reset({ MenuName: "", MenuURL: 0, ParentMenuID: 0, Position: 0, });
        setActiveForm(true);
    };

    const handleDeleteMenu = async (menuID: number) => {
        await deleteMenu(menuID);
    };

    const onMenuSubmit = async (data: z.infer<typeof MenuFormSchema>) => {
        const menuData = {
            ...(selectedMenu ?? { MenuID: 0 }), // If MenuID is required, give a fallback or conditionally add it
            MenuName: data.MenuName,
            MenuURL: data.MenuURL,
            ParentMenuID: data.ParentMenuID,
            Position: data.Position,
        }


        if (selectedMenu) {
            await updateMenu(menuData);
        } else {
            await addMenu(menuData);
        }

        setActiveForm(false);
        setSelectedMenu(null);
        refresh();

        menuForm.reset({ HouseNo: "", CategoryID: 0, FloorID: 0, TypeID: 0 });
    };

    return (
        <div className="space-y-4 border p-4 rounded-md ">
            {loading ? (
                <p>Loading...</p>
            ) : (

                <SidebarMenu>
                    {menus.filter(item => hasPermission(item.Path, item.Permission)).map((item, index) => (
                        <SidebarMenuItem key={index}>
                            {(!item.SubItems || item.SubItems.length === 0) ? (
                                <SidebarMenuButton
                                    onClick={() => handleParentClick(item)}
                                    className={cn(location.pathname === item.Path && "bg-primary/10 text-primary")}
                                >
                                    {item.Icon}
                                    <span>{item.Title}</span>
                                </SidebarMenuButton>
                            ) : (
                                <Collapsible
                                    open={isMenuActive(item)}
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
                                                    onClick={() => setSelectedMenu(subItem)}
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

            )}
        </div>
    );
};