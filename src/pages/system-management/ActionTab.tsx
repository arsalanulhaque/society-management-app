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
import { IAction } from '@/types/database';
import { useAction } from './useAction';
import { IconTooltip } from '@/components/common/IconTooltip';

const ActionFormSchema = z.object({
  ActionName: z.string().min(1, "Action name is required"),
});

export const ActionTab: React.FC = () => {
  const { pathname, search } = useLocation();
  const fullUrl = pathname + search;
  const { hasPermission } = useAuth();

  const { actions, loading, addAction, updateAction, deleteAction, refresh } = useAction();

  const [activeForm, setActiveForm] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<IAction | null>(null);

  const actionForm = useForm<z.infer<typeof ActionFormSchema>>({
    resolver: zodResolver(ActionFormSchema),
    defaultValues: {
      ActionName: "",
    },
  });

  const handleAddAction = () => {
    setSelectedAction(null);
    actionForm.reset({ ActionName: "" });
    setActiveForm(true);
  };

  const handleEditAction = (action: IAction) => {
    setSelectedAction(action);
    actionForm.reset({
      ActionName: action.ActionName,
    });
    setActiveForm(true);
  };

  const handleDeleteAction = async (actionID: number) => {
    await deleteAction(actionID);
  };

  const onActionSubmit = async (data: z.infer<typeof ActionFormSchema>) => {
    if (selectedAction) {
      await updateAction({
        ...selectedAction,
        ActionName: data.ActionName,
      });
    } else {
      await addAction({
        ActionName: data.ActionName,
      });
    }

    setActiveForm(false);
    setSelectedAction(null);
    refresh();
    actionForm.reset({ ActionName: "", });
  };

  return (
    <div className="space-y-4 border p-4 rounded-md ">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold">Actions</h2>
            {hasPermission(fullUrl, 'CanAdd') && (
              <Button onClick={handleAddAction} className="flex items-center gap-2">
                <Plus size={16} />
                Add Action
              </Button>
            )}
          </div>

          {activeForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{selectedAction ? "Edit Action" : "Add Action"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...actionForm}>
                  <form onSubmit={actionForm.handleSubmit(onActionSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={actionForm.control}
                        name="ActionName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter Action Name" {...field} />
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
                        {selectedAction ? "Update Action" : "Create Action"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <div className="rounded-md border">
            <div className="grid grid-cols-4 p-4 bg-muted/50 font-medium text-sm">
              <div className="col-span-1">Action</div>
            </div>
            {actions.map((action) => (
              <div
                key={action.ActionID}
                className="grid grid-cols-4 p-4 border-t text-sm items-center"
              >
                <div className="col-span-1">{action.ActionName}</div>
                <div className="col-span-3 flex justify-end gap-2">
                  {hasPermission(fullUrl, 'CanUpdate') && (
                    <IconTooltip tooltip='Edit' >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAction(action)}
                        className="flex items-center gap-1 bg-slate-200 text-slate-500 hover:bg-slate-100">
                        <PenSquare size={14} />
                      </Button>
                    </IconTooltip>
                  )}
                  {hasPermission(fullUrl, 'CanDelete') && (
                    <IconTooltip tooltip='Delete'>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAction(action.ActionID)}
                        className="flex items-center gap-1 bg-slate-200 text-red-500 hover:text-red-500 hover:bg-slate-100">
                        <Trash2 size={14} />
                      </Button>
                    </IconTooltip>
                  )}
                </div>
              </div>
            ))}
          </div>

        </>)
      }
    </div >
  );
};