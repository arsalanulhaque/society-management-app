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
import { IPlotType } from '@/types/database';
import { usePlotType } from './usePlotType';

const plotTypeFormSchema = z.object({
    TypeName: z.string().min(1, "Type name is required"),
});

export const PlotTypeTab: React.FC = () => {
    const {pathname, search} = useLocation();
      const fullUrl = pathname + search;
      const { user, hasPermission } = useAuth();

    const {
        plotTypes,
        addPlotType,
        updatePlotType,
        deletePlotType,
        loading,
        refresh,
    } = usePlotType();

    const [activeForm, setActiveForm] = useState<boolean>(false);
    const [selectedType, setSelectedType] = useState<IPlotType | null>(null);

    const typeForm = useForm<z.infer<typeof plotTypeFormSchema>>({
        resolver: zodResolver(plotTypeFormSchema),
        defaultValues: {
            TypeName: "",
        },
    });

    const handleAddType = () => {
        setSelectedType(null);
        typeForm.reset({ TypeName: "" });
        setActiveForm(true);
    };

    const handleEditType = (type: IPlotType) => {
        setSelectedType(type);
        typeForm.reset({ TypeName: type.TypeName });
        setActiveForm(true);
    };

    const handleDeleteType = async (typeID: number) => {
        await deletePlotType(typeID);
    };

    const onTypeSubmit = async (data: z.infer<typeof plotTypeFormSchema>) => {
        if (selectedType) {
            await updatePlotType({
                ...selectedType,
                TypeName: data.TypeName,
            });
        } else {
            await addPlotType({
                TypeName: data.TypeName,
            });
        }

        setActiveForm(false);
        setSelectedType(null);
        refresh();
        typeForm.reset({ TypeName: "" });
    };

    return (
        <div className="space-y-4">
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Plot Types</h2>

                        {hasPermission(fullUrl, 'CanAdd') && (
                            <Button onClick={handleAddType} className="flex items-center gap-2">
                                <Plus size={16} />
                                Add Type
                            </Button>
                        )}
                    </div>

                    {activeForm && (
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>{selectedType ? "Edit Plot Type" : "Add Plot Type"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...typeForm}>
                                    <form onSubmit={typeForm.handleSubmit(onTypeSubmit)} className="space-y-4">
                                        <FormField
                                            control={typeForm.control}
                                            name="TypeName"
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
                                        <div className="flex justify-end gap-2 mt-4">
                                            <Button type="button" variant="outline" onClick={() => setActiveForm(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">
                                                {selectedType ? "Update Type" : "Create Type"}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Plot Types List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <div className="grid grid-cols-6 p-4 bg-muted/50 font-medium text-sm">
                                    <div className="col-span-4">Type Name</div>
                                </div>
                                {plotTypes.map(type => (
                                    <div key={type.TypeID}
                                        className="grid grid-cols-4 p-4 border-t items-center text-sm"
                                    >
                                        <div className="col-span-1">{type.TypeName}</div>
                                        <div className="col-span-3 flex justify-end gap-2">
                                            {hasPermission(fullUrl, 'CanUpdate') && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditType(type)}
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
                                                    className="flex items-center gap-1 text-red-500 hover:text-red-600"
                                                    onClick={() => handleDeleteType(type.TypeID)}
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

