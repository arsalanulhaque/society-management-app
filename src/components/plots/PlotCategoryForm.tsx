
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { IPlotCategory } from '@/types/database';
import { FormModal } from '@/components/common/FormModal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define validation schema
const plotCategoryFormSchema = z.object({
  categoryId: z.number().optional(),
  categoryName: z.string().min(1, 'Category name is required'),
  categoryType: z.string().min(1, 'Category type is required').max(1, 'Category type must be a single character'),
  charges: z.coerce.number().min(0, 'Charges must be a positive number'),
});

type PlotCategoryFormValues = z.infer<typeof plotCategoryFormSchema>;

interface PlotCategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IPlotCategory | null;
  onSuccess?: () => void;
}

export function PlotCategoryForm({ open, onOpenChange, initialData, onSuccess }: PlotCategoryFormProps) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<PlotCategoryFormValues>({
    resolver: zodResolver(plotCategoryFormSchema),
    defaultValues: {
      categoryId: initialData?.CategoryID || 0,
      categoryName: initialData?.CategoryName || '',
      categoryType: initialData?.CategoryType || '',
      charges: initialData?.Charges || 0,
    },
  });

  // Reset form when initial data changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        categoryId: initialData.CategoryID,
        categoryName: initialData.CategoryName,
        categoryType: initialData.CategoryType,
        charges: initialData.Charges,
      });
    } else {
      form.reset({
        categoryId: 0,
        categoryName: '',
        categoryType: '',
        charges: 0,
      });
    }
  }, [initialData, form]);

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: PlotCategoryFormValues) {
    try {
      if (isEditing && values.categoryId) {
        // Update existing category
        await fetch(`/api/plot-categories/${values.categoryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            categoryName: values.categoryName,
            categoryType: values.categoryType,
            charges: values.charges,
          }),
        });
        
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        // Create new category
        await fetch('/api/plot-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            categoryName: values.categoryName,
            categoryType: values.categoryType,
            charges: values.charges,
          }),
        });
        
        toast({
          title: "Success",
          description: "Category added successfully",
        });
      }
      
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category data. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Common category types
  const categoryTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'R'];

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Category" : "Add New Category"}
      description="Enter the category details below."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="categoryName"
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
            control={form.control}
            name="categoryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="charges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Charges</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Enter charges" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </FormModal>
  );
}
