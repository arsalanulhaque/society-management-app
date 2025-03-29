
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, PlusCircle, Edit, Trash2, KeyRound, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { IRole, IMenu, IRoleMenuMapping } from '@/types/database';

const roleFormSchema = z.object({
  roleName: z.string().min(2, { message: "Role name must be at least 2 characters." })
});

const menuFormSchema = z.object({
  menuName: z.string().min(2, { message: "Menu name must be at least 2 characters." }),
  menuURL: z.string().optional(),
  parentMenuID: z.number().optional().nullable(),
  roleID: z.number().optional().nullable()
});

const AccessControlTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [editingRole, setEditingRole] = useState<IRole | null>(null);
  const [editingMenu, setEditingMenu] = useState<IMenu | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch roles, menus, and permissions
  const { data: roles, isLoading: rolesLoading, refetch: refetchRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.getRoles(),
  });

  const { data: menus, isLoading: menusLoading, refetch: refetchMenus } = useQuery({
    queryKey: ['menus'],
    queryFn: () => api.getMenus(),
  });

  const { data: permissions, isLoading: permissionsLoading, refetch: refetchPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => api.getPermissions(),
  });

  // Setup forms for roles and menus
  const roleForm = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      roleName: ""
    }
  });

  const menuForm = useForm<z.infer<typeof menuFormSchema>>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      menuName: "",
      menuURL: "",
      parentMenuID: null,
      roleID: null
    }
  });

  // Reset forms when editing item changes
  useEffect(() => {
    if (editingRole) {
      roleForm.setValue("roleName", editingRole.RoleName);
    } else {
      roleForm.reset();
    }
  }, [editingRole, roleForm]);

  useEffect(() => {
    if (editingMenu) {
      menuForm.setValue("menuName", editingMenu.MenuName);
      menuForm.setValue("menuURL", editingMenu.MenuURL || "");
      menuForm.setValue("parentMenuID", editingMenu.ParentMenuID);
      menuForm.setValue("roleID", editingMenu.RoleID || null);
    } else {
      menuForm.reset();
    }
  }, [editingMenu, menuForm]);

  // Set first role as selected when data loads
  useEffect(() => {
    if (roles?.data?.length && !selectedRole) {
      setSelectedRole(roles.data[0].RoleID);
    }
  }, [roles, selectedRole]);

  // Handle form submissions
  const onRoleSubmit = async (values: z.infer<typeof roleFormSchema>) => {
    try {
      // Mock API call (replace with actual API)
      console.log("Role submit:", values, editingRole);
      toast({
        title: editingRole ? "Role updated" : "Role created",
        description: `Role "${values.roleName}" has been ${editingRole ? "updated" : "saved"}.`,
      });
      
      setRoleDialogOpen(false);
      setEditingRole(null);
      await refetchRoles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onMenuSubmit = async (values: z.infer<typeof menuFormSchema>) => {
    try {
      // Mock API call (replace with actual API)
      console.log("Menu submit:", values, editingMenu);
      toast({
        title: editingMenu ? "Menu updated" : "Menu created",
        description: `Menu "${values.menuName}" has been ${editingMenu ? "updated" : "saved"}.`,
      });
      
      setMenuDialogOpen(false);
      setEditingMenu(null);
      await refetchMenus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save menu. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update permission toggle
  const handlePermissionToggle = async (roleId: number, menuId: number, permission: 'CanView' | 'CanAdd' | 'CanEdit' | 'CanDelete', currentValue: boolean) => {
    try {
      // Mock API call (replace with actual API)
      console.log(`Toggle ${permission} for roleId=${roleId}, menuId=${menuId} to ${!currentValue}`);
      toast({
        title: "Permission updated",
        description: `Permission has been ${!currentValue ? "granted" : "revoked"}.`,
      });
      await refetchPermissions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permission. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete handlers
  const handleDeleteRole = async (roleId: number, roleName: string) => {
    if (confirm(`Are you sure you want to delete role "${roleName}"?`)) {
      try {
        // Mock API call (replace with actual API)
        console.log(`Delete role ${roleId}`);
        toast({
          title: "Role deleted",
          description: `Role "${roleName}" has been deleted.`,
        });
        await refetchRoles();
        
        // Reset selected role if the deleted one was selected
        if (selectedRole === roleId && roles?.data?.length) {
          setSelectedRole(roles.data[0].RoleID);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete role. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteMenu = async (menuId: number, menuName: string) => {
    if (confirm(`Are you sure you want to delete menu "${menuName}"?`)) {
      try {
        // Mock API call (replace with actual API)
        console.log(`Delete menu ${menuId}`);
        toast({
          title: "Menu deleted",
          description: `Menu "${menuName}" has been deleted.`,
        });
        await refetchMenus();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete menu. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Helper function to get permission for a role-menu combination
  const getPermission = (roleId: number, menuId: number, permission: 'CanView' | 'CanAdd' | 'CanEdit' | 'CanDelete'): boolean => {
    if (!permissions?.data) return false;
    const mapping = permissions.data.find(p => p.RoleID === roleId && p.MenuID === menuId);
    return mapping ? mapping[permission] : false;
  };

  // Helper function to get role name
  const getRoleName = (roleId: number | null | undefined): string => {
    if (!roleId || !roles?.data) return "None";
    const role = roles.data.find(r => r.RoleID === roleId);
    return role ? role.RoleName : "None";
  };

  // Render loading state
  if (rolesLoading || menusLoading || permissionsLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading access control data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">Roles Management</TabsTrigger>
          <TabsTrigger value="menus">Menu Management</TabsTrigger>
          <TabsTrigger value="permissions">Rights & Permissions</TabsTrigger>
        </TabsList>

        {/* Roles Management Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Roles</h2>
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingRole(null)} className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" /> 
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingRole ? "Edit Role" : "Add New Role"}</DialogTitle>
                  <DialogDescription>
                    {editingRole 
                      ? "Update the details for this role." 
                      : "Create a new role to assign to users and manage permissions."}
                  </DialogDescription>
                </DialogHeader>
                <Form {...roleForm}>
                  <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-4">
                    <FormField
                      control={roleForm.control}
                      name="roleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter role name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">
                        {editingRole ? "Update Role" : "Create Role"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role ID</TableHead>
                    <TableHead>Role Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles?.data?.length ? (
                    roles.data.map((role) => (
                      <TableRow key={role.RoleID}>
                        <TableCell>{role.RoleID}</TableCell>
                        <TableCell>{role.RoleName}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setEditingRole(role);
                                setRoleDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteRole(role.RoleID, role.RoleName)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No roles found. Add a role to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menu Management Tab */}
        <TabsContent value="menus" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Menus</h2>
            <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingMenu(null)} className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Menu
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingMenu ? "Edit Menu" : "Add New Menu"}</DialogTitle>
                  <DialogDescription>
                    {editingMenu 
                      ? "Update the details for this menu item." 
                      : "Create a new menu item to build your application's navigation."}
                  </DialogDescription>
                </DialogHeader>
                <Form {...menuForm}>
                  <form onSubmit={menuForm.handleSubmit(onMenuSubmit)} className="space-y-4">
                    <FormField
                      control={menuForm.control}
                      name="menuName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Menu Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter menu name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={menuForm.control}
                      name="menuURL"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Menu URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="/path-to-page" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={menuForm.control}
                      name="parentMenuID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Menu</FormLabel>
                          <FormControl>
                            <select 
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value?.toString() || ""}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                            >
                              <option value="">None (Top Level)</option>
                              {menus?.data?.map(menu => (
                                <option key={menu.MenuID} value={menu.MenuID}>
                                  {menu.MenuName}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={menuForm.control}
                      name="roleID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <select 
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value?.toString() || ""}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                            >
                              <option value="">All Roles</option>
                              {roles?.data?.map(role => (
                                <option key={role.RoleID} value={role.RoleID}>
                                  {role.RoleName}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">
                        {editingMenu ? "Update Menu" : "Create Menu"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Menu ID</TableHead>
                    <TableHead>Menu Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus?.data?.length ? (
                    menus.data.map((menu) => (
                      <TableRow key={menu.MenuID}>
                        <TableCell>{menu.MenuID}</TableCell>
                        <TableCell>{menu.MenuName}</TableCell>
                        <TableCell>{menu.MenuURL || "-"}</TableCell>
                        <TableCell>
                          {menu.ParentMenuID 
                            ? menus.data.find(m => m.MenuID === menu.ParentMenuID)?.MenuName || "-" 
                            : "-"}
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          {menu.RoleID ? (
                            <>
                              <Shield className="h-4 w-4 text-primary" />
                              {getRoleName(menu.RoleID)}
                            </>
                          ) : "All Roles"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setEditingMenu(menu);
                                setMenuDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteMenu(menu.MenuID, menu.MenuName)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No menus found. Add a menu to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rights & Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Rights & Permissions</h2>

            <div className="flex items-center gap-2">
              <Label htmlFor="role-select">Select Role:</Label>
              <select
                id="role-select"
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedRole?.toString() || ""}
                onChange={(e) => setSelectedRole(Number(e.target.value))}
              >
                {roles?.data?.map(role => (
                  <option key={role.RoleID} value={role.RoleID}>
                    {role.RoleName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Menu Permissions</CardTitle>
              <CardDescription>
                Configure what actions each role can perform on different menus
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Menu</TableHead>
                    <TableHead className="text-center">View</TableHead>
                    <TableHead className="text-center">Add</TableHead>
                    <TableHead className="text-center">Edit</TableHead>
                    <TableHead className="text-center">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus?.data?.length && selectedRole ? (
                    menus.data.map((menu) => (
                      <TableRow key={menu.MenuID}>
                        <TableCell className="font-medium">{menu.MenuName}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={getPermission(selectedRole, menu.MenuID, 'CanView')}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(
                                selectedRole, 
                                menu.MenuID, 
                                'CanView', 
                                getPermission(selectedRole, menu.MenuID, 'CanView')
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={getPermission(selectedRole, menu.MenuID, 'CanAdd')}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(
                                selectedRole, 
                                menu.MenuID, 
                                'CanAdd', 
                                getPermission(selectedRole, menu.MenuID, 'CanAdd')
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={getPermission(selectedRole, menu.MenuID, 'CanEdit')}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(
                                selectedRole, 
                                menu.MenuID, 
                                'CanEdit', 
                                getPermission(selectedRole, menu.MenuID, 'CanEdit')
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={getPermission(selectedRole, menu.MenuID, 'CanDelete')}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(
                                selectedRole, 
                                menu.MenuID, 
                                'CanDelete', 
                                getPermission(selectedRole, menu.MenuID, 'CanDelete')
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {!roles?.data?.length 
                          ? "No roles found. Create roles first." 
                          : "No menus found. Create menus first."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccessControlTab;
