import React, { useState } from 'react';
import { useLocation, } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, PenSquare, Plus, Trash2 } from 'lucide-react';
import { IPlot, IPlotType, IPlotFloor } from '@/types/database';
import { useForm } from 'react-hook-form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from '@/components/ui/select'; // Adjust the import path as needed
import { usePlot } from './usePlot';

const PlotFormSchema = z.object({
  HouseNo: z.string().min(1, "House number is required"),
  CategoryID: z.coerce.number().min(1, "Category is required"),
  FloorID: z.coerce.number().min(1, 'Floor is required'),
  TypeID: z.coerce.number().min(1, 'Type is required'),
})

export const PlotsTab: React.FC = () => {
  const { pathname, search } = useLocation();
  const fullUrl = pathname + search;
  const { user, hasPermission } = useAuth();
  const { addPlots, updatePlot, deletePlot, refresh, loading,
    filteredPlots, filterCategory, setFilterCategory, filterType, setFilterType,
    plotCategories, plotTypes, plotFloors } = usePlot();
  const [activeForm, setActiveForm] = useState<boolean>(false);
  const [selectedPlot, setSelectedPlot] = useState<IPlot | null>(null);

  const plotForm = useForm<z.infer<typeof PlotFormSchema>>({
    resolver: zodResolver(PlotFormSchema),
    defaultValues: {
      HouseNo: "",
      CategoryID: 0,
      FloorID: 0,
      TypeID: 0,
    },
  });

  const handleAddPlot = () => {
    setSelectedPlot(null);
    plotForm.reset({
      HouseNo: "",
      CategoryID: 0,
      FloorID: 0,
      TypeID: 0,
    });
    setActiveForm(true);
  };

  const handleEditPlot = (plot: IPlot) => {
    setSelectedPlot(plot);
    plotForm.reset({
      HouseNo: plot.HouseNo,
      CategoryID: plot.CategoryID,
      FloorID: plot.FloorID,
      TypeID: plot.TypeID,
    });
    setActiveForm(true);
  };

  const handleDeletePlot = async (plotID: number) => {
    await deletePlot(plotID);
  };

  const onPlotSubmit = async (data: z.infer<typeof PlotFormSchema>) => {
    const plotData = {
      ...(selectedPlot ?? { PlotID: 0 }), // If PlotID is required, give a fallback or conditionally add it
      HouseNo: data.HouseNo,
      CategoryID: data.CategoryID,
      FloorID: data.FloorID,
      TypeID: data.TypeID,
    }


    if (selectedPlot) {
      await updatePlot(plotData);
    } else {
      await addPlots(plotData);
    }

    setActiveForm(false);
    setSelectedPlot(null);
    refresh();

    plotForm.reset({ HouseNo: "", CategoryID: 0, FloorID: 0, TypeID: 0 });
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Plot Management</h2>
            {hasPermission(fullUrl, 'CanAdd') &&
              (
                <Button onClick={handleAddPlot} className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Plot
                </Button>
              )}
          </div>

          {activeForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{selectedPlot ? "Edit Plot" : "Add Plot"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...plotForm}>
                  <form onSubmit={plotForm.handleSubmit(onPlotSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={plotForm.control}
                        name="HouseNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>House No</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter house no" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={plotForm.control}
                        name="CategoryID"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value.toString()}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Plot Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Choose an option</SelectItem>
                                  {
                                    plotCategories?.map(item => {
                                      return <SelectItem value={item.CategoryID.toString()}>{item.CategoryName}</SelectItem>
                                    })
                                  }
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={plotForm.control}
                        name="TypeID"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value.toString()}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Plot Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Choose an option</SelectItem>
                                  {
                                    plotTypes.map(item => {
                                      return <SelectItem value={item.TypeID.toString()}>{item.TypeName}</SelectItem>
                                    })
                                  }
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={plotForm.control}
                        name="FloorID"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Floor</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value.toString()}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Number of Floors" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Choose an option</SelectItem>
                                  {
                                    plotFloors.map(item => {
                                      return <SelectItem value={item.FloorID.toString()}>{item.Floor}</SelectItem>
                                    })
                                  }
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => setActiveForm(null)}>Cancel</Button>
                      <Button type="submit">{selectedPlot ? "Update Plot" : "Create Plot"}</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

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
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Select
                      onValueChange={(category) => setFilterCategory(plotCategories.find(c => c.CategoryID.toString() === category))}
                      value={filterCategory?.CategoryID?.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Plot Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Choose an option</SelectItem>
                        {
                          plotCategories?.map(item => {
                            return <SelectItem value={item.CategoryID.toString()}
                            >{item.CategoryName}</SelectItem>
                          })
                        }
                      </SelectContent>
                    </Select>

                    <Select
                      onValueChange={(type) => setFilterType(plotTypes.find(t => t.TypeID.toString() === type))}
                      value={filterType?.TypeID?.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Plot Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Choose an option</SelectItem>
                        {
                          plotTypes?.map(item => {
                            return <SelectItem value={item.TypeID.toString()}
                            >{item.TypeName}</SelectItem>
                          })
                        }
                      </SelectContent>
                    </Select>

                    {/* {plotCategories.map(category => (
                  <Button
                    key={category.CategoryID}
                    variant={filterCategory?.CategoryID === category?.CategoryID ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setFilterCategory(category)} >
                    {category.CategoryName}
                  </Button>
                ))} */}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Houses in {filterCategory?.CategoryName}</CardTitle>
                    <CardDescription>
                      Edit owner details and floor plans
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 p-4 bg-muted/50 font-medium text-sm">
                      <div className="col-span-2">Plot No.</div>
                      <div className="col-span-3">Category</div>
                      <div className="col-span-3">Type</div>
                      <div className="col-span-2">Floors</div>
                      {hasPermission(fullUrl, 'CanUpdate') || hasPermission(fullUrl, 'CanDelete') && (<div className="col-span-2">Actions</div>)}
                    </div>
                    {filteredPlots?.map(plot => (
                      <div key={plot.PlotID} className="grid grid-cols-12 p-4 border-t items-center text-sm">
                        <div className="col-span-2">{plot?.HouseNo}</div>
                        <div className="col-span-3">{plot?.CategoryName}</div>
                        <div className="col-span-3">{plot?.TypeName}</div>
                        <div className="col-span-2">{plot?.Floor}</div>
                        <div className="col-span-2 flex gap-2">
                          {hasPermission(fullUrl, 'CanUpdate') &&
                            (<Button variant="outline" size="sm" onClick={() => handleEditPlot(plot)} className="flex items-center gap-1">
                              <PenSquare size={14} />
                              <span>Edit</span>
                            </Button>)}
                          {hasPermission(fullUrl, 'CanDelete') && (<Button variant="outline" size="sm" onClick={() => handleDeletePlot(plot.PlotID)} className="text-red-500 hover:text-red-600 flex items-center gap-1">
                            <Trash2 size={14} />
                          </Button>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};