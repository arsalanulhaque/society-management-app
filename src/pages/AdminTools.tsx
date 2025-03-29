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

const AdminTools: React.FC = () => {
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
          <h1 className="text-3xl font-bold tracking-tight">Admin Tools</h1>
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
            <TabsTrigger value="houses" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Edit Houses</span>
            </TabsTrigger>
            <TabsTrigger value="fee-plan" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Edit Fee Plan</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="buildings" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>Building Registry</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Document Templates</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="houses" className="mt-6">
            <EditHousesTab />
          </TabsContent>
          
          <TabsContent value="fee-plan" className="mt-6">
            <EditFeesPlanTab />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="buildings" className="mt-6">
            <BuildingRegistryTab />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <DocumentTemplatesTab />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

const EditHousesTab: React.FC = () => {
  const houseCategories = ['Category A', 'Category B', 'Category C'];
  const [selectedCategory, setSelectedCategory] = useState('Category A');
  
  const houses = [
    { id: 1, plotNumber: 'A-101', ownerName: 'John Doe', floors: 2, description: 'End Unit' },
    { id: 2, plotNumber: 'A-102', ownerName: 'Jane Smith', floors: 3, description: 'Corner Unit' },
    { id: 3, plotNumber: 'A-103', ownerName: 'Mike Johnson', floors: 2, description: 'Standard Unit' },
    { id: 4, plotNumber: 'A-104', ownerName: 'Sarah Williams', floors: 1, description: 'Studio Unit' },
    { id: 5, plotNumber: 'A-105', ownerName: 'Robert Brown', floors: 3, description: 'Penthouse' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={18} />
            Important Note
          </CardTitle>
          <CardDescription>
            By default, all categories and plot numbers have been added and cannot be changed in the future.
            You can only edit house owner details and floor plans via this page.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>House Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {houseCategories.map(category => (
                  <Button 
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Houses in {selectedCategory}</CardTitle>
                <CardDescription>
                  Edit owner details and floor plans
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 p-4 bg-muted/50 font-medium text-sm">
                  <div className="col-span-2">Plot No.</div>
                  <div className="col-span-3">Owner Name</div>
                  <div className="col-span-2">Floors</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {houses.map(house => (
                  <div key={house.id} className="grid grid-cols-12 p-4 border-t items-center text-sm">
                    <div className="col-span-2">{house.plotNumber}</div>
                    <div className="col-span-3">{house.ownerName}</div>
                    <div className="col-span-2">{house.floors}</div>
                    <div className="col-span-3">{house.description}</div>
                    <div className="col-span-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toast.success('Edit mode activated for ' + house.plotNumber)}
                        className="flex items-center gap-1"
                      >
                        <PenSquare size={14} />
                        <span>Edit</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const EditFeesPlanTab: React.FC = () => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [2023, 2024, 2025];
  
  const feePlans = [
    { category: 'Category A', baseAmount: 200, floorAmount: 50 },
    { category: 'Category B', baseAmount: 300, floorAmount: 75 },
    { category: 'Category C', baseAmount: 400, floorAmount: 100 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle size={18} />
            Important Note
          </CardTitle>
          <CardDescription>
            Select the month from which onwards the new fee will be applicable.
            You can edit the fee plan for each category and also edit the floor-wise amount.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Effective Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Effective From Month</label>
              <select className="w-full p-2 border rounded-md">
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Effective From Year</label>
              <select className="w-full p-2 border rounded-md">
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Fee Plans</CardTitle>
          <CardDescription>
            Configure base amount and per-floor charges for each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 p-4 bg-muted/50 font-medium text-sm">
              <div className="col-span-4">Category</div>
              <div className="col-span-3">Base Amount</div>
              <div className="col-span-3">Amount Per Floor</div>
              <div className="col-span-2">Actions</div>
            </div>
            {feePlans.map((plan, index) => (
              <div key={index} className="grid grid-cols-12 p-4 border-t items-center">
                <div className="col-span-4">{plan.category}</div>
                <div className="col-span-3">${plan.baseAmount}</div>
                <div className="col-span-3">${plan.floorAmount} per floor</div>
                <div className="col-span-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toast.success('Edit mode activated for ' + plan.category)}
                    className="flex items-center gap-1"
                  >
                    <PenSquare size={14} />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={() => toast.success('Fee plans saved successfully!')}
              className="flex items-center gap-2"
            >
              <DollarSign size={16} />
              Save Fee Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const UserManagementTab: React.FC = () => {
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

const BuildingRegistryTab: React.FC = () => {
  const plotTypes: IPlotType[] = [
    { TypeID: 1, TypeName: 'Residential' },
    { TypeID: 2, TypeName: 'Commercial' },
    { TypeID: 3, TypeName: 'Mixed Use' }
  ];

  const plotCategories: IPlotCategory[] = [
    { CategoryID: 1, CategoryName: 'Category A', CategoryType: 'A', Charges: 200 },
    { CategoryID: 2, CategoryName: 'Category B', CategoryType: 'B', Charges: 300 },
    { CategoryID: 3, CategoryName: 'Category C', CategoryType: 'C', Charges: 400 }
  ];

  const plotTypeFormSchema = z.object({
    TypeName: z.string().min(1, "Type name is required")
  });

  const plotCategoryFormSchema = z.object({
    CategoryName: z.string().min(1, "Category name is required"),
    CategoryType: z.string().min(1, "Category type is required"),
    Charges: z.coerce.number().min(0, "Charges must be a positive number")
  });

  const [activeForm, setActiveForm] = useState<'type' | 'category' | null>(null);
  const [selectedType, setSelectedType] = useState<IPlotType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<IPlotCategory | null>(null);

  const typeForm = useForm<z.infer<typeof plotTypeFormSchema>>({
    resolver: zodResolver(plotTypeFormSchema),
    defaultValues: {
      TypeName: ""
    }
  });

  const categoryForm = useForm<z.infer<typeof plotCategoryFormSchema>>({
    resolver: zodResolver(plotCategoryFormSchema),
    defaultValues: {
      CategoryName: "",
      CategoryType: "",
      Charges: 0
    }
  });

  const handleAddType = () => {
    setSelectedType(null);
    typeForm.reset({ TypeName: "" });
    setActiveForm('type');
  };

  const handleEditType = (type: IPlotType) => {
    setSelectedType(type);
    typeForm.reset({ TypeName: type.TypeName });
    setActiveForm('type');
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    categoryForm.reset({ CategoryName: "", CategoryType: "", Charges: 0 });
    setActiveForm('category');
  };

  const handleEditCategory = (category: IPlotCategory) => {
    setSelectedCategory(category);
    categoryForm.reset({
      CategoryName: category.CategoryName,
      CategoryType: category.CategoryType,
      Charges: category.Charges
    });
    setActiveForm('category');
  };

  const onTypeSubmit = (data: z.infer<typeof plotTypeFormSchema>) => {
    const action = selectedType ? "updated" : "created";
    toast.success(`Plot type ${action} successfully`);
    setActiveForm(null);
  };

  const onCategorySubmit = (data: z.infer<typeof plotCategoryFormSchema>) => {
    const action = selectedCategory ? "updated" : "created";
    toast.success(`Plot category ${action} successfully`);
    setActiveForm(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Plot Types</h2>
            <Button onClick={handleAddType} className="flex items-center gap-2">
              <Plus size={16} />
              Add Type
            </Button>
          </div>

          {activeForm === 'type' && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{selectedType ? "Edit Plot Type" : "Add Plot Type"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...typeForm}>
                  <form onSubmit={typeForm.handleSubmit(onTypeSubmit)} className="space-y-4">
                    <FormField
                      control={typeForm.control}
                      name="TypeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter plot type name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setActiveForm(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {selectedType ? "Update Type" : "Create Type"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Plot Types List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 p-4 bg-muted/50 font-medium text-sm">
                  <div className="col-span-4">Type Name</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {plotTypes.map(type => (
                  <div key={type.TypeID} className="grid grid-cols-6 p-4 border-t items-center text-sm">
                    <div className="col-span-4">{type.TypeName}</div>
                    <div className="col-span-2 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditType(type)}
                        className="flex items-center gap-1"
                      >
                        <PenSquare size={14} />
                        <span>Edit</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1 text-red-500 hover:text-red-600"
                        onClick={() => toast.success('Plot type deleted successfully')}
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Plot Categories</h2>
            <Button onClick={handleAddCategory} className="flex items-center gap-2">
              <Plus size={16} />
              Add Category
            </Button>
          </div>

          {activeForm === 'category' && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{selectedCategory ? "Edit Plot Category" : "Add Plot Category"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...categoryForm}>
                  <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={categoryForm.control}
                        name="CategoryName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter category name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={categoryForm.control}
                        name="CategoryType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category Type</FormLabel>
                            <FormControl>
                              <Input placeholder="A, B, C, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={categoryForm.control}
                        name="Charges"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Base Charges</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0.00" {...field} />
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
                        onClick={() => setActiveForm(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {selectedCategory ? "Update Category" : "Create Category"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Plot Categories List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-8 p-4 bg-muted/50 font-medium text-sm">
                  <div className="col-span-3">Category Name</div>
                  <div className="col-span-1">Type</div>
                  <div className="col-span-2">Base Charges</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {plotCategories.map(category => (
                  <div key={category.CategoryID} className="grid grid-cols-8 p-4 border-t items-center text-sm">
                    <div className="col-span-3">{category.CategoryName}</div>
                    <div className="col-span-1">{category.CategoryType}</div>
                    <div className="col-span-2">${category.Charges}</div>
                    <div className="col-span-2 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditCategory(category)}
                        className="flex items-center gap-1"
                      >
                        <PenSquare size={14} />
                        <span>Edit</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1 text-red-500 hover:text-red-600"
                        onClick={() => toast.success('Category deleted successfully')}
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
      </div>
    </div>
  );
};

const DocumentTemplatesTab: React.FC = () => {
  const documentTemplates = [
    { id: 1, name: 'Welcome Letter', description: 'Standard welcome letter for new residents', content: 'Dear {RESIDENT_NAME},\n\nWelcome to our community...' },
    { id: 2, name: 'Maintenance Request Form', description: 'Form for residents to request maintenance', content: 'Maintenance Request\n\nDate: {DATE}\nRequested by: {RESIDENT_NAME}\n...' },
    { id: 3, name: 'Late Payment Notice', description: 'Notice for late maintenance fee payments', content: 'NOTICE: LATE PAYMENT\n\nDear {RESIDENT_NAME},\n\nThis is to inform you that your payment...' }
  ];

  const templateFormSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    description: z.string().min(1, "Description is required"),
    content: z.string().min(1, "Content is required")
  });

  const [selectedTemplate, setSelectedTemplate] = useState<typeof documentTemplates[0] | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<z.infer<typeof templateFormSchema>>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      description: "",
      content: ""
    }
  });

  const handleAddTemplate = () => {
    setSelectedTemplate(null);
    form.reset({
      name: "",
      description: "",
      content: ""
    });
    setIsFormVisible(true);
    setPreviewMode(false);
  };

  const handleEditTemplate = (template: typeof documentTemplates[0]) => {
    setSelectedTemplate(template);
    form.reset({
      name: template.name,
      description: template.description,
      content: template.content
    });
    setIsFormVisible(true);
    setPreviewMode(false);
  };

  const handlePreviewTemplate = (template: typeof documentTemplates[0]) => {
    setSelectedTemplate(template);
    setPreviewMode(true);
  };

  const onSubmit = (data: z.infer<typeof templateFormSchema>) => {
    const action = selectedTemplate ? "updated" : "created";
    toast.success(`Document template ${action} successfully`);
    setIsFormVisible(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Document Templates</h2>
        <Button onClick={handleAddTemplate} className="flex items-center gap-2">
          <Plus size={16} />
          Add New Template
        </Button>
      </div>

      {isFormVisible && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{selectedTemplate ? "Edit Document Template" : "Add New Document Template"}</CardTitle>
            <CardDescription>
              {selectedTemplate ? "Update template details" : "Create a new document template"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter template name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter template description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormDescription>
                        Use placeholders like {"{RESIDENT_NAME}"}, {"{DATE}"}, etc. which will be replaced with actual values.
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter template content" 
                          className="min-h-[300px] font-mono"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsFormVisible(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedTemplate ? "Update Template" : "Create Template"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {previewMode && selectedTemplate && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Template Preview: {selectedTemplate.name}</CardTitle>
              <CardDescription>{selectedTemplate.description}</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setPreviewMode(false)}
            >
              Close Preview
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-6 rounded-md border whitespace-pre-wrap font-mono">
              {selectedTemplate.content}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Document Templates</CardTitle>
          <CardDescription>
            Manage document templates for various communication needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 p-4 bg-muted/50 font-medium text-sm">
              <div className="col-span-3">Template Name</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-4">Actions</div>
            </div>
            {documentTemplates.map(template => (
              <div key={template.id} className="grid grid-cols-12 p-4 border-t items-center text-sm">
                <div className="col-span-3">{template.name}</div>
                <div className="col-span-5">{template.description}</div>
                <div className="col-span-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePreviewTemplate(template)}
                    className="flex items-center gap-1"
                  >
                    <FileText size={14} />
                    <span>Preview</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditTemplate(template)}
                    className="flex items-center gap-1"
                  >
                    <PenSquare size={14} />
                    <span>Edit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1 text-red-500 hover:text-red-600"
                    onClick={() => toast.success('Template deleted successfully')}
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

export default AdminTools;
