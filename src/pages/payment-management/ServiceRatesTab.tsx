import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, PenSquare, Plus, Trash2, WalletCards } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useServiceRates } from './useServiceRates';
import { IServiceRate } from '@/types/database';
import { YearDropdown } from '@/components/common/year-dropdown/YearDropdown';
import { Switch } from "@/components/ui/switch";
import useMonths from "@/hooks/useMonths"
import { Label } from '@/components/ui/label';

const ServiceRateSchema = z.object({
  PlotTypeID: z.coerce.number().min(1, 'Type is required'),
  PlotTypeRate: z.coerce.number().min(1, 'Type Rate is required'),
  PlotCategoryID: z.coerce.number().min(1, 'Category is required'),
  PlotCategoryRate: z.coerce.number().min(1, 'Category Rate is required'),
  FloorID: z.coerce.number().min(1, 'Floor is required'),
  FloorRate: z.coerce.number().min(1, 'Per Floor Rate is required'),
  TotalAmount: z.number(),
  StartMonth: z.coerce.number().min(1, 'Start Month is required'),
  StartYear: z.coerce.number().min(1, 'Start Year is required'),
  EndMonth: z.coerce.number().min(1, 'End Month is required'),
  EndYear: z.coerce.number().min(1, 'End Year is required'),
  IsActive: z.boolean()
});

export const ServiceRatesTab: React.FC = () => {
  const { pathname, search } = useLocation();
  const fullUrl = pathname + search;
  const { user, hasPermission } = useAuth();
  const { serviceRates, handleGeneratePaymentPlan, addRate, updateRate, deleteRate, refresh, plotCategories, plotTypes, plotFloors, calculateTotal } = useServiceRates();
  const { months, findMonthByValue, } = useMonths()
  const [activeForm, setActiveForm] = useState(false);
  const [selectedRate, setSelectedRate] = useState<IServiceRate | null>(null);

  const form = useForm<z.infer<typeof ServiceRateSchema>>({
    resolver: zodResolver(ServiceRateSchema),
    defaultValues: {
      PlotTypeID: 0,
      PlotTypeRate: 0,
      PlotCategoryID: 0,
      PlotCategoryRate: 0,
      FloorID: 0,
      FloorRate: 0,
      TotalAmount: 0,
      StartMonth: 0,
      StartYear: new Date().getFullYear(),
      EndMonth: 0,
      EndYear: new Date().getFullYear(),
      IsActive: false,
    },
  });

  const {
    watch,
    setValue,
  } = form;

  // Watch rate fields
  const typeRate = watch("PlotTypeRate");
  const categoryRate = watch("PlotCategoryRate");
  const floorRate = watch("FloorRate");

  // Auto update TotalAmount
  useEffect(() => {
    const total = calculateTotal(typeRate, categoryRate, floorRate);
    setValue("TotalAmount", total);
  }, [typeRate, categoryRate, floorRate, setValue, calculateTotal]);

  const handleAdd = () => {
    setSelectedRate(null);
    form.reset({
      PlotTypeID: 0, PlotTypeRate: 0,
      PlotCategoryID: 0, PlotCategoryRate: 0,
      FloorID: 0, FloorRate: 0,
      StartMonth: 0, StartYear: 0,
      EndMonth: 0, EndYear: 0,
      IsActive: false, TotalAmount: 0
    });
    setActiveForm(true);
  };

  const handleEdit = (rate: IServiceRate) => {
    setSelectedRate(rate);
    form.reset(rate)
    // PlotTypeID: 0, PlotTypeRate: 0,
    // PlotCategoryID: 0, PlotCategoryRate: 0,
    // FloorID: 0, FloorRate: 0,
    // Month: 0, Year: 0,
    // IsActive: false, TotalAmount: 0
    // });
    setActiveForm(true);
  };

  const handleDelete = async (id: number) => {
    await deleteRate(id);
  };

  const onSubmit = async (data: z.infer<typeof ServiceRateSchema>) => {
    const payload = {
      ...(selectedRate ?? { RateID: 0 }),
      ...data,
    };

    let isSuccess = false;
    if (selectedRate)
      isSuccess = await updateRate(payload);
    else
      isSuccess = await addRate(payload);
    if (isSuccess) {
      setActiveForm(false);
      setSelectedRate(null);
      refresh();

      form.reset({
        PlotTypeID: 0, PlotTypeRate: 0,
        PlotCategoryID: 0, PlotCategoryRate: 0,
        FloorID: 0, FloorRate: 0,
        StartMonth: 0, StartYear: 0,
        EndMonth: 0, EndYear: 0,
        IsActive: false, TotalAmount: 0
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Charges</h2>
        {hasPermission(fullUrl, 'CanAdd') && (
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus size={16} /> New Charges
          </Button>
        )}
      </div>

      {activeForm && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{selectedRate ? 'Edit Rate' : 'Add Rate'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Start Month */}
                  <FormField control={form.control}
                    name="StartMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Month</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field?.value?.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a Month" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Choose an option</SelectItem>
                              <SelectItem value="1">January</SelectItem>
                              <SelectItem value="2">February</SelectItem>
                              <SelectItem value="3">March</SelectItem>
                              <SelectItem value="4">April</SelectItem>
                              <SelectItem value="5">May</SelectItem>
                              <SelectItem value="6">June</SelectItem>
                              <SelectItem value="7">July</SelectItem>
                              <SelectItem value="8">August</SelectItem>
                              <SelectItem value="9">September</SelectItem>
                              <SelectItem value="10">October</SelectItem>
                              <SelectItem value="11">November</SelectItem>
                              <SelectItem value="12">December</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Start Year */}
                  <FormField control={form.control}
                    name="StartYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Year</FormLabel>
                        <FormControl>
                          <YearDropdown value={field.value?.toString()} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* End Month */}
                  <FormField control={form.control}
                    name="EndMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Month</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field?.value?.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a Month" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Choose an option</SelectItem>
                              <SelectItem value="1">January</SelectItem>
                              <SelectItem value="2">February</SelectItem>
                              <SelectItem value="3">March</SelectItem>
                              <SelectItem value="4">April</SelectItem>
                              <SelectItem value="5">May</SelectItem>
                              <SelectItem value="6">June</SelectItem>
                              <SelectItem value="7">July</SelectItem>
                              <SelectItem value="8">August</SelectItem>
                              <SelectItem value="9">September</SelectItem>
                              <SelectItem value="10">October</SelectItem>
                              <SelectItem value="11">November</SelectItem>
                              <SelectItem value="12">December</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Start Year */}
                  <FormField control={form.control}
                    name="EndYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Year</FormLabel>
                        <FormControl>
                          <YearDropdown value={field.value?.toString()} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Type ID */}
                  <FormField control={form.control}
                    name="PlotTypeID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Choose an option</SelectItem>
                              {plotTypes.map((item) => (
                                <SelectItem key={item.TypeID} value={item.TypeID.toString()}>{item.TypeName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Type-wise Rate */}
                  <FormField control={form.control}
                    name="PlotTypeRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type Rate</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Category ID */}
                  <FormField control={form.control}
                    name="PlotCategoryID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Choose an option</SelectItem>
                              {plotCategories.map((item) => (
                                <SelectItem key={item.CategoryID} value={item.CategoryID.toString()}>{item.CategoryName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Category-wise Rate */}
                  <FormField control={form.control}
                    name="PlotCategoryRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Rate</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Floor ID */}
                  <FormField control={form.control}
                    name="FloorID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Floor</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Floor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Choose an option</SelectItem>
                              {plotFloors.map((item) => (
                                <SelectItem key={item.FloorID} value={item.FloorID.toString()}>{item.Floor}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Floor-wise Rate */}
                  <FormField control={form.control}
                    name="FloorRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Floor Rate</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Is Active (Status) */}
                  <FormField control={form.control}
                    name="IsActive"
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center space-x-3 space-y-0"'>
                        <FormControl>
                          <Switch className="border border-gray-500" checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Active Plan?</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Total Amount */}
                  <FormField control={form.control}
                    name="TotalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="h-10 flex items-center px-3 py-2 rounded-md border border-input bg-muted text-md font-medium">
                            Total Amount: {parseInt(field?.value.toString()).toFixed(2) ?? '0.00'} PKR
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setActiveForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{selectedRate ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={18} /> Important Note
          </CardTitle>
          <CardDescription>
            Set rates per category combination for billing purposes.
          </CardDescription>
        </CardHeader>
      </Card>



      {serviceRates.map((rate) => (
        <div className="grid grid-cols-2 space-x-4">
          <Card >
            <CardHeader className='bg-muted/50'>
              <CardTitle>
                <div className="grid grid-cols-2 flex gap-2 ">
                  <div className='flex justify-start'>Period: {findMonthByValue(rate.StartMonth)}/{rate.StartYear} - {findMonthByValue(rate.EndMonth)}/{rate.EndYear}</div>
                  <div className='flex justify-end'>Status:&nbsp; {rate.IsActive ? <span>Active</span> : <span>InActive</span>}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>

              <div key={rate.RateID} className="border-t pt-4">
                <div className="grid grid-cols-3 flex gap-2 text-md">
                  {/* className="grid grid-cols-6 p-4 border-t items-center text-sm"> */}
                  <div className='col-span-1 font-medium'>
                    <p>Plot Type:</p>
                    <p>Category:</p>
                    <p>Plot Floor:</p>
                    <p className="py-2">&nbsp;</p>

                  </div>

                  <div className='col-span-1'>
                    <p>{rate.TypeName}</p>
                    <p>{rate.CategoryName}</p>
                    <p>{rate.Floor}</p>
                    <p className="border-t border-b py-2 font-medium">Total Amount:</p>
                  </div>

                  <div className='col-span-1'>
                    <p>Rs. {rate.PlotTypeRate}</p>
                    <p>Rs. {rate.PlotCategoryRate}</p>
                    <p>Rs. {rate.FloorRate}</p>
                    <p className="border-t border-b py-2 font-medium">Rs. {rate.TotalAmount}</p>
                  </div>

                  <div className="col-span-3 flex justify-end gap-2">
                    {hasPermission(fullUrl, 'CanGeneratePaymentPlan') && (
                      <Button variant="outline" size="sm" onClick={() => handleGeneratePaymentPlan(rate)} className="flex items-center gap-1">
                        <WalletCards size={14} /> Generate Payment Plan
                      </Button>
                    )}
                    {hasPermission(fullUrl, 'CanUpdate') && (
                      <Button variant="outline" size="sm" onClick={() => handleEdit(rate)} className="flex items-center gap-1">
                        <PenSquare size={14} /> Edit
                      </Button>
                    )}
                    {hasPermission(fullUrl, 'CanDelete') && (
                      <Button variant="outline" size="sm" onClick={() => handleDelete(rate.RateID)} className="text-red-500 hover:text-red-600 flex items-center gap-1">
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>))}

    </div>
  );
};
