import React, { useEffect, useState } from 'react';
import { useLocation, } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, PenSquare, Plus, Trash2 } from 'lucide-react';
import { IMenuActionsMap, IMenuActionsMapView, IMenuTable } from '@/types/database';
import { useForm } from 'react-hook-form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from '@/components/ui/select'; // Adjust the import path as needed
import { useMenuActionsMap } from './useMenuActionsMap';

const PlotFormSchema = z.object({
  ActionID: z.coerce.number().min(1, "Action is required"),
  MenuID: z.coerce.number().min(1, "Menu is required"),
})

export const MenuActionsMapTab: React.FC = () => {
  const { pathname, search } = useLocation();
  const fullUrl = pathname + search;
  const { hasPermission } = useAuth();
  const { menuActions,
    menus,
    actions,
    loading,
    filterMenuList,
    setFilterMenuList,
    addMenuActionsMap,
    updateMenuActionsMap,
    deleteMenuActionsMap,
    refresh,
    filteredMenuActions } = useMenuActionsMap();
  const [activeForm, setActiveForm] = useState<boolean>(false);
  const [selectedMenuActionsMap, setSelectedMenuActionsMap] = useState<IMenuActionsMap | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<IMenuTable | null>(null);

  const menuActionMapForm = useForm<z.infer<typeof PlotFormSchema>>({
    resolver: zodResolver(PlotFormSchema),
    defaultValues: {
      ActionID: 0,
      MenuID: 0,
    },
  });

  useEffect(() => {
    if (selectedMenu?.ParentMenuID === 0) {
      const selectedAction = actions.find(a => a.ActionID.toString() === menuActionMapForm.getValues("ActionID")?.toString());
      if (selectedAction?.ActionName !== 'View') {
        menuActionMapForm.setValue("ActionID", 0); // Reset to default
      }
    }
  }, [selectedMenu?.ParentMenuID, menuActionMapForm.getValues("ActionID"), actions]);

  const handleAddMenuActionMap = () => {
    setSelectedMenuActionsMap(null);
    menuActionMapForm.reset({
      ActionID: 0,
      MenuID: 0,
    });
    setActiveForm(true);
  };

  const handleEditMenuActionMap = (menuActionsMap: IMenuActionsMap) => {
    setSelectedMenuActionsMap(menuActionsMap);
    menuActionMapForm.reset({
      ActionID: menuActionsMap.ActionID,
      MenuID: menuActionsMap.MenuID,
    });
    setActiveForm(true);
  };

  const handleDeleteMenuActionMap = async (menuActionID: number) => {
    await deleteMenuActionsMap(menuActionID);
  };

  const onMenuActionMapSubmit = async (data: z.infer<typeof PlotFormSchema>) => {
    const menuActionMapData = {
      ...(selectedMenuActionsMap ?? { MenuActionID: 0 }), // If MenuActionID is required, give a fallback or conditionally add it
      ActionID: data.ActionID,
      MenuID: data.MenuID,
    }

    if (selectedMenuActionsMap) {
      await updateMenuActionsMap(menuActionMapData);
    } else {
      await addMenuActionsMap(menuActionMapData);
    }

    setActiveForm(false);
    // setSelectedMenuActionsMap(null);
    refresh();

    menuActionMapForm.reset({ MenuID: 0, ActionID: 0 });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Menu Actions Mapping</h2>
        {hasPermission(fullUrl, 'CanAdd') &&
          (
            <Button onClick={handleAddMenuActionMap} className="flex items-center gap-2">
              <Plus size={16} />
              Add Mapping
            </Button>
          )}
      </div>

      {activeForm && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{selectedMenuActionsMap ? "Edit Menu Action Map" : "Add Menu Action Map"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...menuActionMapForm}>
              <form onSubmit={menuActionMapForm.handleSubmit(onMenuActionMapSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={menuActionMapForm.control}
                    name="MenuID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Menu</FormLabel>
                        <FormControl>
                          <Select onValueChange={(val) => {
                            const selected = menus.find(item => item.MenuID.toString() === val);
                            setSelectedMenu(selected ?? null);
                            field.onChange(val); // still keep react-hook-form in sync
                          }} value={field.value.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Menu" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Choose an option</SelectItem>
                              {
                                menus?.map(item => {
                                  return <SelectItem value={item.MenuID.toString()}>{item.MenuName}</SelectItem>
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
                    control={menuActionMapForm.control}
                    name="ActionID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value?.toString() || "0"}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Action" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Choose an option</SelectItem>
                              {
                                actions
                                  .filter(item => selectedMenu?.ParentMenuID === 0 ? item.ActionName === 'View' : true)
                                  .map(item => (
                                    <SelectItem key={item.ActionID} value={item.ActionID.toString()}>
                                      {item.ActionName}
                                    </SelectItem>
                                  ))
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
                  <Button type="submit">{selectedMenuActionsMap ? "Update Menu Actions Map" : "Create Menu Actions Map"}</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              </div>
            </CardContent>
          </Card>
        </div> */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Select
                  onValueChange={(menu) => setFilterMenuList(menus.find(m => m.MenuID.toString() === menu))}
                  value={filterMenuList?.MenuID?.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Menu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Choose an option</SelectItem>
                    {
                      menus?.map(item => {
                        return <SelectItem value={item.MenuID.toString()}
                          className={item.ParentMenuID !== 0 ? 'pl-8' : 'pl-6'}
                        >
                          {item.ParentMenuID !== 0 ? '↳ ' + item.MenuName : item.MenuName}
                        </SelectItem>
                      })
                    }
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader >
              <div>
                <CardTitle>Actions for {filterMenuList?.MenuName}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 p-4 bg-muted/50 font-medium text-sm">
                  <div className="col-span-2">Menu Name</div>
                  <div className="col-span-1">Action Name</div>

                  {hasPermission(fullUrl, 'CanUpdate') || hasPermission(fullUrl, 'CanDelete') && (<div className="col-span-3"></div>)}
                </div>
                {filteredMenuActions?.map(item => (
                  <div key={item.MenuActionID} className="grid grid-cols-6 p-4 border-t items-center text-sm">
                    <div className="col-span-2">{item?.MenuName}</div>
                    <div className="col-span-1">{item?.ActionName}</div>
                    <div className="col-span-3 flex gap-2">
                      {hasPermission(fullUrl, 'CanUpdate') &&
                        (<Button variant="outline" size="sm" onClick={() => handleEditMenuActionMap(item)} className="flex items-center gap-1">
                          <PenSquare size={14} />
                          <span>Edit</span>
                        </Button>)}
                      {hasPermission(fullUrl, 'CanDelete') && (<Button variant="outline" size="sm" onClick={() => handleDeleteMenuActionMap(item.MenuActionID)} className="text-red-500 hover:text-red-600 flex items-center gap-1">
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
    </div >
  );
};