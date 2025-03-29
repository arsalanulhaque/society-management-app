
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/api/api';
import { IReceivable, IPlot } from '@/types/database';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, CalendarIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

// Define validation schema
const receivableFormSchema = z.object({
  receivableId: z.number().optional(),
  plotId: z.coerce.number().min(1, 'Plot is required'),
  monthYear: z.string().min(1, 'Month/Year is required'),
  amount: z.coerce.number().min(0, 'Amount must be a positive number'),
  isPaid: z.boolean().default(false),
  paidOnDate: z.date().optional().nullable(),
});

type ReceivableFormValues = z.infer<typeof receivableFormSchema>;

interface ReceivableFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IReceivable | null;
  onSuccess?: () => void;
}

export function ReceivableForm({ open, onOpenChange, initialData, onSuccess }: ReceivableFormProps) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  // Format date string to Date object and vice versa
  const parseDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  const form = useForm<ReceivableFormValues>({
    resolver: zodResolver(receivableFormSchema),
    defaultValues: {
      receivableId: initialData?.ReceivableID || 0,
      plotId: initialData?.PlotID || 0,
      monthYear: initialData?.MonthYear || '',
      amount: initialData?.Amount || 0,
      isPaid: initialData?.IsPaid || false,
      paidOnDate: parseDate(initialData?.PaidOnDate || null),
    },
  });

  // Reset form when initial data changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        receivableId: initialData.ReceivableID,
        plotId: initialData.PlotID,
        monthYear: initialData.MonthYear,
        amount: initialData.Amount,
        isPaid: initialData.IsPaid,
        paidOnDate: parseDate(initialData.PaidOnDate),
      });
    } else {
      form.reset({
        receivableId: 0,
        plotId: 0,
        monthYear: format(new Date(), 'MM/yyyy'),
        amount: 0,
        isPaid: false,
        paidOnDate: null,
      });
    }
  }, [initialData, form]);

  // Watch isPaid to conditionally render paidOnDate field
  const isPaid = form.watch('isPaid');

  // Fetch plots
  const { data: plots, isLoading: plotsLoading } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const response = await api.getPlots();
      if (!response.success) {
        throw new Error('Failed to fetch plots');
      }
      return response.data;
    },
  });

  const isLoading = plotsLoading || form.formState.isSubmitting;

  async function onSubmit(values: ReceivableFormValues) {
    try {
      const receivableData = {
        PlotID: values.plotId,
        MonthYear: values.monthYear,
        Amount: values.amount,
        IsPaid: values.isPaid,
        PaidOnDate: values.isPaid && values.paidOnDate 
          ? format(values.paidOnDate, 'yyyy-MM-dd') 
          : null,
      };

      if (isEditing && values.receivableId) {
        await api.updateReceivable(values.receivableId, receivableData);
        toast({
          title: "Success",
          description: "Receivable updated successfully",
        });
      } else {
        await api.createReceivable(receivableData);
        toast({
          title: "Success",
          description: "Receivable added successfully",
        });
      }
      
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving receivable:', error);
      toast({
        title: "Error",
        description: "Failed to save receivable data. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Generate month/year options for the last 2 years and next year
  const getMonthYearOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Generate options for past 2 years, current year, and next year
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        // Format month to have leading zero if needed
        const formattedMonth = month < 10 ? `0${month}` : `${month}`;
        options.push(`${formattedMonth}/${year}`);
      }
    }
    
    return options;
  };

  const monthYearOptions = getMonthYearOptions();

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Receivable" : "Add New Receivable"}
      description="Enter the receivable details below."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="plotId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plot</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value.toString()}
                  disabled={plotsLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plot" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {plots?.map((plot: IPlot) => (
                      <SelectItem key={plot.PlotID} value={plot.PlotID.toString()}>
                        {plot.HouseNo} - {plot.CategoryName || ''}
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
            name="monthYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Month/Year</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month/year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {monthYearOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Enter amount" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isPaid"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Paid</FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          {isPaid && (
            <FormField
              control={form.control}
              name="paidOnDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Payment Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
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
