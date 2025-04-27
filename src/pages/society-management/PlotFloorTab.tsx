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
import { IPlotFloor } from '@/types/database';
import { usePlotFloor } from './usePlotFloor';

const PlotFloorFormSchema = z.object({
  Floor: z.string().min(1, "Floor is required"),
});

export const PlotFloorTab: React.FC = () => {
  const { pathname, search } = useLocation();
  const fullUrl = pathname + search;
  const { user, hasPermission } = useAuth();

  const {
    plotFloors,
    addFloor,
    updateFloor,
    deleteFloor,
    loading,
    refresh,
  } = usePlotFloor();

  const [activeForm, setActiveForm] = useState<boolean>(false);
  const [selectedFloor, setSelectedFloor] = useState<IPlotFloor | null>(null);

  const floorForm = useForm<z.infer<typeof PlotFloorFormSchema>>({
    resolver: zodResolver(PlotFloorFormSchema),
    defaultValues: {
      Floor: "",
    },
  });

  const handleAddFloor = () => {
    setSelectedFloor(null);
    floorForm.reset({ Floor: "" });
    setActiveForm(true);
  };

  const handleEditFloor = (floor: IPlotFloor) => {
    setSelectedFloor(floor);
    floorForm.reset({
      Floor: floor.Floor,
    });
    setActiveForm(true);
  };

  const handleDeleteFloor = async (floorID: number) => {
    await deleteFloor(floorID);
  };

  const onPlotFloorSubmit = async (data: z.infer<typeof PlotFloorFormSchema>) => {
    if (selectedFloor) {
      await updateFloor({
        ...selectedFloor,
        Floor: data.Floor,
      });
    } else {
      await addFloor({
        Floor: data.Floor,
      });
    }

    setActiveForm(false);
    setSelectedFloor(null);
    refresh();
    floorForm.reset({ Floor: "", });
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Plot Floors</h2>


            {hasPermission(fullUrl, 'CanAdd') && (
              <Button onClick={handleAddFloor} className="flex items-center gap-2">
                <Plus size={16} />
                Add Floor
              </Button>
            )}
          </div>

          {activeForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{selectedFloor ? "Edit Floor" : "Add Floor"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...floorForm}>
                  <form onSubmit={floorForm.handleSubmit(onPlotFloorSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={floorForm.control}
                        name="Floor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Floor</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter floor" {...field} />
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
                        {selectedFloor ? "Update Floor" : "Create Floor"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Floor List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 p-4 bg-muted/50 font-medium text-sm">
                  <div className="col-span-1">Floor</div>
                </div>
                {plotFloors.map((floor) => (
                  <div
                    key={floor.FloorID}
                    className="grid grid-cols-4 p-4 border-t text-sm items-center"
                  >
                    <div className="col-span-1">{floor.Floor}</div>
                    <div className="col-span-3 flex justify-end gap-2">
                      {hasPermission(fullUrl, 'CanUpdate') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFloor(floor)}
                          className="flex items-center gap-1"
                        >
                          <PenSquare size={14} />
                          <span>Edit</span>
                        </Button>
                      )}
                      {hasPermission(fullUrl, 'CanDelete') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFloor(floor.FloorID)}
                          className="text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        </>)}
    </div>
  );
};
