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

export const BuildingRegistryTab: React.FC = () => {
  const plotTypes: IPlotType[] = [
    { TypeID: 1, TypeName: 'Residential' },
    { TypeID: 2, TypeName: 'Commercial' },
    { TypeID: 3, TypeName: 'Mixed Use' }
  ];

  const plotCategories: IPlotCategory[] = [
    { CategoryID: 1, CategoryName: 'Category A', Charges: 200 },
    { CategoryID: 2, CategoryName: 'Category B', Charges: 300 },
    { CategoryID: 3, CategoryName: 'Category C', Charges: 400 }
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
                        name="Charges"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Charges</FormLabel>
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
                  <div className="col-span-2">Base Charges</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {plotCategories.map(category => (
                  <div key={category.CategoryID} className="grid grid-cols-8 p-4 border-t items-center text-sm">
                    <div className="col-span-3">{category.CategoryName}</div>
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