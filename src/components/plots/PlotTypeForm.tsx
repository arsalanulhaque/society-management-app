
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { IPlotType } from '@/types/database';
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

// Define validation schema
const plotTypeFormSchema = z.object({
  typeId: z.number().optional(),
  typeName: z.string().min(1, 'Type name is required'),
});

type PlotTypeFormValues = z.infer<typeof plotTypeFormSchema>;

interface PlotTypeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IPlotType | null;
  onSuccess?: () => void;
}

export function PlotTypeForm({ open, onOpenChange, initialData, onSuccess }: PlotTypeFormProps) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<PlotTypeFormValues>({
    resolver: zodResolver(plotTypeFormSchema),
    defaultValues: {
      typeId: initialData?.TypeID || 0,
      typeName: initialData?.TypeName || '',
    },
  });

  // Reset form when initial data changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        typeId: initialData.TypeID,
        typeName: initialData.TypeName,
      });
    } else {
      form.reset({
        typeId: 0,
        typeName: '',
      });
    }
  }, [initialData, form]);

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: PlotTypeFormValues) {
    try {
      if (isEditing && values.typeId) {
        // Update existing plot type
        await fetch(`/api/plot-types/${values.typeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            typeName: values.typeName,
          }),
        });
        
        toast({
          title: "Success",
          description: "Plot type updated successfully",
        });
      } else {
        // Create new plot type
        await fetch('/api/plot-types', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            typeName: values.typeName,
          }),
        });
        
        toast({
          title: "Success",
          description: "Plot type added successfully",
        });
      }
      
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving plot type:', error);
      toast({
        title: "Error",
        description: "Failed to save plot type data. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Plot Type" : "Add New Plot Type"}
      description="Enter the plot type details below."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="typeName"
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
