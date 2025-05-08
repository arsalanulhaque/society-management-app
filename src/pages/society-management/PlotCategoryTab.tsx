import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { PenSquare, Plus, Trash2 } from 'lucide-react';
import { IPlotCategory } from '@/types/database';
import { usePlotCategory } from './usePlotCategory';
import { IconTooltip } from '@/components/common/IconTooltip';

const PlotCategoryFormSchema = z.object({
  CategoryName: z.string().min(1, "Category name is required"),
});

export const PlotCategoryTab: React.FC = () => {
  const { pathname, search } = useLocation();
  const fullUrl = pathname + search;
  const { user, hasPermission } = useAuth();

  const {
    plotCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    loading,
    refresh,
  } = usePlotCategory();

  const [activeForm, setActiveForm] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<IPlotCategory | null>(null);

  const categoryForm = useForm<z.infer<typeof PlotCategoryFormSchema>>({
    resolver: zodResolver(PlotCategoryFormSchema),
    defaultValues: {
      CategoryName: "",
    },
  });

  const handleAddCategory = () => {
    setSelectedCategory(null);
    categoryForm.reset({ CategoryName: "", });
    setActiveForm(true);
  };

  const handleEditCategory = (category: IPlotCategory) => {
    setSelectedCategory(category);
    categoryForm.reset({
      CategoryName: category.CategoryName,
    });
    setActiveForm(true);
  };

  const handleDeleteCategory = async (categoryID: number) => {
    await deleteCategory(categoryID);
  };

  const onPlotCategorySubmit = async (data: z.infer<typeof PlotCategoryFormSchema>) => {
    if (selectedCategory) {
      await updateCategory({
        ...selectedCategory,
        CategoryName: data.CategoryName,
      });
    } else {
      await addCategory({
        CategoryName: data.CategoryName,
      });
    }

    setActiveForm(false);
    setSelectedCategory(null);
    refresh();
    categoryForm.reset({ CategoryName: "", });
  };

  return (
    <div className="space-y-4 border p-4 rounded-md ">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold">Plot Categories</h2>


            {hasPermission(fullUrl, 'CanAdd') && (
              <Button onClick={handleAddCategory} className="flex items-center gap-2">
                <Plus size={16} />
                Add Category
              </Button>
            )}
          </div>

          {activeForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{selectedCategory ? "Edit Plot Category" : "Add Plot Category"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...categoryForm}>
                  <form onSubmit={categoryForm.handleSubmit(onPlotCategorySubmit)} className="space-y-4">
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
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => setActiveForm(false)}>
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

          <div className="rounded-md border">
            <div className="grid grid-cols-4 p-4 bg-muted/50 font-medium text-sm">
              <div className="col-span-1">Category Name</div>
            </div>
            {plotCategories.map((category) => (
              <div
                key={category.CategoryID}
                className="grid grid-cols-4 p-4 border-t text-sm items-center"
              >
                <div className="col-span-1">{category.CategoryName}</div>
                <div className="col-span-3 flex justify-end gap-2">
                  {hasPermission(fullUrl, 'CanUpdate') && (
                    <IconTooltip tooltip='Edit'>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        className="flex items-center gap-1 bg-slate-200 text-slate-500 hover:bg-slate-100"
                      >
                        <PenSquare size={14} />
                      </Button>
                    </IconTooltip>
                  )}
                  {hasPermission(fullUrl, 'CanDelete') && (
                    <IconTooltip tooltip='Delete'>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.CategoryID)}
                        className="flex items-center gap-1 bg-slate-200 text-red-500 hover:text-red-500 hover:bg-slate-100"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </IconTooltip>
                  )}
                </div>
              </div>
            ))}
          </div>

        </>)}
    </div>
  );
};
