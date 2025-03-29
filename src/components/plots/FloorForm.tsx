
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { IFloor } from '@/types/database';
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
const floorFormSchema = z.object({
  floorId: z.number().optional(),
  floor: z.string().min(1, 'Floor name is required'),
  charges: z.coerce.number().min(0, 'Charges must be a positive number'),
});

type FloorFormValues = z.infer<typeof floorFormSchema>;

interface FloorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IFloor | null;
  onSuccess?: () => void;
}

export function FloorForm({ open, onOpenChange, initialData, onSuccess }: FloorFormProps) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<FloorFormValues>({
    resolver: zodResolver(floorFormSchema),
    defaultValues: {
      floorId: initialData?.FloorID || 0,
      floor: initialData?.Floor || '',
      charges: initialData?.Charges || 0,
    },
  });

  // Reset form when initial data changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        floorId: initialData.FloorID,
        floor: initialData.Floor,
        charges: initialData.Charges,
      });
    } else {
      form.reset({
        floorId: 0,
        floor: '',
        charges: 0,
      });
    }
  }, [initialData, form]);

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: FloorFormValues) {
    try {
      if (isEditing && values.floorId) {
        // Update existing floor
        await fetch(`/api/floors/${values.floorId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            floor: values.floor,
            charges: values.charges,
          }),
        });
        
        toast({
          title: "Success",
          description: "Floor updated successfully",
        });
      } else {
        // Create new floor
        await fetch('/api/floors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            floor: values.floor,
            charges: values.charges,
          }),
        });
        
        toast({
          title: "Success",
          description: "Floor added successfully",
        });
      }
      
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving floor:', error);
      toast({
        title: "Error",
        description: "Failed to save floor data. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Floor" : "Add New Floor"}
      description="Enter the floor details below."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Floor Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter floor name" {...field} />
                </FormControl>
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
