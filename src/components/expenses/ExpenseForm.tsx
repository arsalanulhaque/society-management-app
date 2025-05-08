
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/api/api';
import { ISocietyExpense } from '@/types/database';
import { FormModal } from '@/components/common/FormModal';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';

// Define validation schema
const expenseFormSchema = z.object({
  expenseId: z.number().optional(),
  expanseType: z.string().min(1, 'Expense type is required'),
  expanseTitle: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  monthYear: z.string().min(1, 'Month/Year is required'),
  amount: z.coerce.number().min(0, 'Amount must be a positive number'),
  isPaid: z.boolean().default(false),
  paidOnDate: z.date().optional().nullable(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ISocietyExpense | null;
  onSuccess?: () => void;
}

export function ExpenseForm({ open, onOpenChange, initialData, onSuccess }: ExpenseFormProps) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  // Format date string to Date object and vice versa
  const parseDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      expenseId: initialData?.ExpenseID || 0,
      expanseType: initialData?.ExpanseType || '',
      expanseTitle: initialData?.ExpanseTitle || '',
      description: initialData?.Description || '',
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
        expenseId: initialData.ExpenseID,
        expanseType: initialData.ExpanseType,
        expanseTitle: initialData.ExpanseTitle || '',
        description: initialData.Description || '',
        monthYear: initialData.MonthYear,
        amount: initialData.Amount,
        isPaid: initialData.IsPaid,
        paidOnDate: parseDate(initialData.PaidOnDate),
      });
    } else {
      form.reset({
        expenseId: 0,
        expanseType: '',
        expanseTitle: '',
        description: '',
        monthYear: format(new Date(), 'MM/yyyy'),
        amount: 0,
        isPaid: false,
        paidOnDate: null,
      });
    }
  }, [initialData, form]);

  // Watch isPaid to conditionally render paidOnDate field
  const isPaid = form.watch('isPaid');

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: ExpenseFormValues) {
    try {
      const expenseData = {
        ExpanseType: values.expanseType,
        ExpanseTitle: values.expanseTitle,
        Description: values.description || null,
        MonthYear: values.monthYear,
        Amount: values.amount,
        IsPaid: values.isPaid,
        PaidOnDate: values.isPaid && values.paidOnDate
          ? format(values.paidOnDate, 'yyyy-MM-dd')
          : null,
      };

      if (isEditing && values.expenseId) {
        await api.updateExpense(values.expenseId, expenseData);
        toast({
          title: "Success",
          description: "Expense updated successfully",
        });
      } else {
        await api.createExpense(expenseData);
        toast({
          title: "Success",
          description: "Expense added successfully",
        });
      }

      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: "Error",
        description: "Failed to save expense data. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Common expense types
  const expenseTypes = [
    'Maintenance',
    'Repairs',
    'Utilities',
    'Security',
    'Cleaning',
    'Administrative',
    'Insurance',
    'Taxes',
    'Other'
  ];

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
      title={isEditing ? "Edit Expense" : "Add New Expense"}
      description="Enter the expense details below."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="expanseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expense Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expense type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expenseTypes.map((type) => (
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
            name="expanseTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter expense title" {...field} />
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
                  <Textarea
                    placeholder="Enter description (optional)"
                    className="resize-none"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
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
