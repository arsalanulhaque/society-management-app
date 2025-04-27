import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, DollarSign, PenSquare, AlertCircle, Info, Users, Building, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IUser, IRole, IPlotType, IPlotCategory } from '@/types/database';
import { EditHousesTab } from './PlotsTab';

export const UserManagementTab: React.FC = () => {
    const users: IUser[] = [
      { UserID: 1, Username: 'admin', Password: '', FullName: 'Administrator', Email: 'admin@example.com', Phone: '555-1234', RoleID: 1, RoleName: 'Admin' },
      { UserID: 2, Username: 'manager', Password: '', FullName: 'Property Manager', Email: 'manager@example.com', Phone: '555-5678', RoleID: 2, RoleName: 'Manager' },
      { UserID: 3, Username: 'resident', Password: '', FullName: 'John Resident', Email: 'resident@example.com', Phone: '555-9012', RoleID: 3, RoleName: 'Resident' }
    ];
  
    const roles: IRole[] = [
      { RoleID: 1, RoleName: 'Admin' },
      { RoleID: 2, RoleName: 'Manager' },
      { RoleID: 3, RoleName: 'Resident' }
    ];
  
    const userFormSchema = z.object({
      Username: z.string().min(3, "Username must be at least 3 characters"),
      FullName: z.string().min(2, "Full name is required"),
      Email: z.string().email("Invalid email address"),
      Phone: z.string().optional(),
      RoleID: z.coerce.number({ required_error: "Please select a role" })
    });
  
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
  
    const form = useForm<z.infer<typeof userFormSchema>>({
      resolver: zodResolver(userFormSchema),
      defaultValues: {
        Username: "",
        FullName: "",
        Email: "",
        Phone: "",
        RoleID: 0
      }
    });
  
    const handleAddUser = () => {
      setSelectedUser(null);
      form.reset({
        Username: "",
        FullName: "",
        Email: "",
        Phone: "",
        RoleID: 0
      });
      setIsFormVisible(true);
    };
  
    const handleEditUser = (user: IUser) => {
      setSelectedUser(user);
      form.reset({
        Username: user.Username,
        FullName: user.FullName || "",
        Email: user.Email || "",
        Phone: user.Phone || "",
        RoleID: user.RoleID
      });
      setIsFormVisible(true);
    };
  
    const onSubmit = (data: z.infer<typeof userFormSchema>) => {
      const action = selectedUser ? "updated" : "created";
      toast.success(`User ${action} successfully`);
      setIsFormVisible(false);
    };
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">User Management</h2>
          <Button onClick={handleAddUser} className="flex items-center gap-2">
            <Plus size={16} />
            Add New User
          </Button>
        </div>
  
        {isFormVisible && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{selectedUser ? "Edit User" : "Add New User"}</CardTitle>
              <CardDescription>
                {selectedUser ? "Update user details" : "Create a new user account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="Username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="FullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
  
                    <FormField
                      control={form.control}
                      name="Email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
  
                    <FormField
                      control={form.control}
                      name="Phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
  
                    <FormField
                      control={form.control}
                      name="RoleID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <select 
                              className="w-full p-2 border rounded-md"
                              {...field}
                            >
                              <option value={0} disabled>Select a role</option>
                              {roles.map(role => (
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
                  </div>
  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsFormVisible(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {selectedUser ? "Update User" : "Create User"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
  
        <Card>
          <CardHeader>
            <CardTitle>Users List</CardTitle>
            <CardDescription>
              Manage all user accounts in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-4 bg-muted/50 font-medium text-sm">
                <div className="col-span-2">Username</div>
                <div className="col-span-3">Full Name</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Actions</div>
              </div>
              {users.map(user => (
                <div key={user.UserID} className="grid grid-cols-12 p-4 border-t items-center text-sm">
                  <div className="col-span-2">{user.Username}</div>
                  <div className="col-span-3">{user.FullName}</div>
                  <div className="col-span-3">{user.Email}</div>
                  <div className="col-span-2">{user.RoleName}</div>
                  <div className="col-span-2 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditUser(user)}
                      className="flex items-center gap-1"
                    >
                      <PenSquare size={14} />
                      <span>Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1 text-red-500 hover:text-red-600"
                      onClick={() => toast.success('User deleted successfully')}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };