import React, { useState } from 'react';
import { useLocation, } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ChevronDown, Info, PenSquare, Plus, Trash2 } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from '@/components/ui/select'; // Adjust the import path as needed
import { useRolePermissions } from './useRolePermissions';
import * as Popover from "@radix-ui/react-popover";
import * as Checkbox from "@radix-ui/react-checkbox"
import PermissionsGroupingGrid from '@/components/common/PermissionsGroupingGrid';
import { IMenuActionsMap } from '@/types/database';

const RoleFormSchema = z.object({
  RoleName: z.string().min(1, "Role name is required"),
});

export const RolePermissionsMapTab: React.FC = () => {
  const { pathname, search } = useLocation();
  const fullUrl = pathname + search;
  const { hasPermission } = useAuth();

  const { roles,
    roleMenuActionsMap,
    filterRole, setFilterRole,
    loading, saveChanges } = useRolePermissions();


  // const toggleMenuOption = (id: number) => {
  //   setSelectedMenu((prev) => prev === id ? 0 : id);
  // }

  // const toggleActionOption = (id: number) => {
  //   setSelectedActions((prev) =>
  //     prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
  //   );
  // };

  return (
    <div className="space-y-4 border p-4 rounded-md ">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold">Roles - Permissions</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info size={18} />
                Important Note
              </CardTitle>
              <CardDescription>
                Select a Role to view or edit its permissions.
              </CardDescription>
            </CardHeader>
          </Card>


          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Col 1 - Left side (spanning 2 rows with 3 cards stacked vertically) */}
            <div className="space-y-4 md:col-span-1">
              {/* Select a Role */}
              <Card>
                <CardHeader >
                  <CardTitle >Select a Role:</CardTitle>
                </CardHeader>
                <CardContent className=''>
                  <Select
                    onValueChange={(role) =>
                      setFilterRole(roles.find((r) => r.RoleID.toString() === role))
                    }
                    value={filterRole?.RoleID?.toString() || "0"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Choose an option</SelectItem>
                      {roles?.map((item) => (
                        <SelectItem key={item.RoleID} value={item.RoleID.toString()}>
                          {item.RoleName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Select Some Menus */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>Select a Menu:</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-3 bg-white max-h-48 overflow-y-auto">
                    {menus.map((opt) => (
                      <label
                        key={`first-${opt.MenuID}`}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                      >
                        <Checkbox.Root
                          checked={selectedmenu === opt.MenuID}
                          onCheckedChange={() => toggleMenuOption(opt.MenuID)}
                          className="w-5 h-5 border rounded flex items-center justify-center data-[state=checked]:bg-blue-600"
                        >
                          <Checkbox.Indicator>
                            <Check className="w-4 h-4 text-white" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <span className="text-sm">{opt.MenuName}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card> */}

              {/* Available Actions */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>Available Actions:</CardTitle>
                </CardHeader>
                <CardContent>
                  {menus.filter((item) => item.MenuID === selectedmenu).length === 0 ? null : (
                    <div className="border rounded-md p-3 bg-white max-h-48 overflow-y-auto">
                      {menuActions
                        .filter((item) => item.MenuID === selectedmenu)
                        .map((opt) => (
                          <label
                            key={`second-${opt.ActionID}`}
                            className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                          >
                            <Checkbox.Root
                              checked={selectedAction.includes(opt.ActionID)}
                              onCheckedChange={() => toggleActionOption(opt.ActionID)}
                              className="w-5 h-5 border rounded flex items-center justify-center data-[state=checked]:bg-blue-600"
                            >
                              <Checkbox.Indicator>
                                <Check className="w-4 h-4 text-white" />
                              </Checkbox.Indicator>
                            </Checkbox.Root>
                            <span className="text-sm">{opt.ActionName}</span>
                          </label>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card> */}
            </div>

            {/* Col 2 & 3 - Role List spanning two rows */}
            <div className="md:col-span-2 row-span-2">

              <PermissionsGroupingGrid
                roleMenuActionsMap={roleMenuActionsMap}
                selectedRole={filterRole}
                saveChanges={saveChanges} />

            </div>
          </div>
        </>
      )}
    </div>
  );
};