
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/api/api';
import { IPlot, IPlotCategory, IFloor, IPlotType } from '@/types/database';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Define validation schema
const plotFormSchema = z.object({
  plotId: z.number().optional(),
  houseNo: z.string().min(1, 'House number is required'),
  categoryId: z.coerce.number().min(1, 'Category is required'),
  floorId: z.coerce.number().min(1, 'Floor is required'),
  typeId: z.coerce.number().min(1, 'Type is required'),
});

type PlotFormValues = z.infer<typeof plotFormSchema>;

interface PlotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IPlot | null;
  onSuccess?: () => void;
}

export function PlotForm({ open, onOpenChange, initialData, onSuccess }: PlotFormProps) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<PlotFormValues>({
    resolver: zodResolver(plotFormSchema),
    defaultValues: {
      plotId: initialData?.PlotID || 0,
      houseNo: initialData?.HouseNo || '',
      categoryId: initialData?.CategoryID || 0,
      floorId: initialData?.FloorID || 0,
      typeId: initialData?.TypeID || 0,
    },
  });

  // Reset form when initial data changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        plotId: initialData.PlotID,
        houseNo: initialData.HouseNo,
        categoryId: initialData.CategoryID,
        floorId: initialData.FloorID,
        typeId: initialData.TypeID,
      });
    } else {
      form.reset({
        plotId: 0,
        houseNo: '',
        categoryId: 0,
        floorId: 0,
        typeId: 0,
      });
    }
  }, [initialData, form]);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/plot-categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json() as Promise<IPlotCategory[]>;
    },
  });

  // Fetch floors
  const { data: floors, isLoading: floorsLoading } = useQuery({
    queryKey: ['floors'],
    queryFn: async () => {
      const response = await fetch('/api/floors');
      if (!response.ok) {
        throw new Error('Failed to fetch floors');
      }
      return response.json() as Promise<IFloor[]>;
    },
  });

  // Fetch plot types
  const { data: plotTypes, isLoading: plotTypesLoading } = useQuery({
    queryKey: ['plotTypes'],
    queryFn: async () => {
      const response = await fetch('/api/plot-types');
      if (!response.ok) {
        throw new Error('Failed to fetch plot types');
      }
      return response.json() as Promise<IPlotType[]>;
    },
  });

  const isLoading = categoriesLoading || floorsLoading || plotTypesLoading || form.formState.isSubmitting;

  async function onSubmit(values: PlotFormValues) {
    try {
      if (isEditing && values.plotId) {
        await api.updatePlot(values.plotId, {
          HouseNo: values.houseNo,
          CategoryID: values.categoryId,
          FloorID: values.floorId,
          TypeID: values.typeId,
        });
        toast({
          title: "Success",
          description: "Plot updated successfully",
        });
      } else {
        await api.createPlot({
          HouseNo: values.houseNo,
          CategoryID: values.categoryId,
          FloorID: values.floorId,
          TypeID: values.typeId,
        });
        toast({
          title: "Success",
          description: "Plot added successfully",
        });
      }
      
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving plot:', error);
      toast({
        title: "Error",
        description: "Failed to save plot data. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Plot" : "Add New Plot"}
      description="Enter the plot details below."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="houseNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>House Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter house number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value.toString()}
                  disabled={categoriesLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.CategoryID} value={category.CategoryID.toString()}>
                        {category.CategoryName} (Type: {category.CategoryType})
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
            name="floorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Floor</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value.toString()}
                  disabled={floorsLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {floors?.map((floor) => (
                      <SelectItem key={floor.FloorID} value={floor.FloorID.toString()}>
                        {floor.Floor} (Charges: ${floor.Charges})
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
            name="typeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plot Type</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value.toString()}
                  disabled={plotTypesLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plot type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {plotTypes?.map((type) => (
                      <SelectItem key={type.TypeID} value={type.TypeID.toString()}>
                        {type.TypeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
