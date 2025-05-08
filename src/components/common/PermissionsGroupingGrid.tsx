import * as React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";

import { IRole, IRoleMenuActionsMap } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { FC, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion"; // Import motion from framer-motion

interface RolePermissionsLayoutProps {
  selectedRole: IRole;
  roleMenuActionsMap: IRoleMenuActionsMap[];
  saveChanges: (mappings: IRoleMenuActionsMap[]) => void;
}

const PermissionsGroupingGrid: FC<RolePermissionsLayoutProps> = ({
  selectedRole,
  roleMenuActionsMap,
  saveChanges,
}) => {
  const [localMappings, setLocalMappings] = useState<IRoleMenuActionsMap[]>([]);
  const [originalMappings, setOriginalMappings] = useState<IRoleMenuActionsMap[]>([]);
  const [firstModifiedId, setFirstModifiedId] = useState<number | null>(null);
  const [openSubMenus, setOpenSubMenus] = useState<string>("0");

  const firstModifiedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (roleMenuActionsMap && roleMenuActionsMap.length > 0) {
      setLocalMappings(roleMenuActionsMap);
      setOriginalMappings(roleMenuActionsMap);
    }
  }, [roleMenuActionsMap]);

  useEffect(() => {
    if (localMappings.length > 0) {
      const firstModified = localMappings.find((item) => isModified(item));
      if (firstModified) {
        setFirstModifiedId(firstModified.RoleMenuActionID);
      } else {
        setFirstModifiedId(null);
      }
    }
  }, [localMappings]);

  useEffect(() => {
    if (firstModifiedRef.current) {
      firstModifiedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [firstModifiedId]);

  const handleCheckboxChange = (updatedItem: IRoleMenuActionsMap, newValue: boolean) => {
    const updatedMappings = localMappings.map((item) =>
      item === updatedItem
        ? { ...item, IsAllowed: newValue === true ? 1 : 0 }
        : item
    );
    setLocalMappings(updatedMappings);
  };

  const isModified = (item: IRoleMenuActionsMap) => {
    const original = originalMappings.find((o) => o.RoleMenuActionID === item.RoleMenuActionID);
    return original ? original.IsAllowed !== item.IsAllowed : false;
  };

  const anyChanges = localMappings.some((item) => isModified(item));

  const handleSave = () => {
    saveChanges(localMappings);
  };

  return (
    <div>
      {selectedRole?.RoleID > 0 ?
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {selectedRole ? `Permissions for ${selectedRole.RoleName}` : 'Please select a Role!'}
              </CardTitle>
              {anyChanges && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setLocalMappings(originalMappings)}
                    variant="outline"
                    className="border-gray-400 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="h-2/3">
            {selectedRole ? (
              <div className="border rounded-md bg-white overflow-y-auto w-full text-sm">
                {/* Top-Level Grouping */}
                {Array.from(
                  new Set(
                    localMappings
                      .filter((item) => item.ParentMenuID === 0)
                      .map((item) => item.MenuID)
                  )
                ).map((parentMenuID) => {
                  const parentMenu = localMappings.find((m) => m.MenuID === parentMenuID);
                  if (!parentMenu) return null;

                  return (
                    <div key={parentMenu.MenuID} className="border-t">
                      <Collapsible
                        open={openSubMenus.includes(parentMenu.MenuID.toString())}
                        onOpenChange={() => setOpenSubMenus(parentMenu.MenuID.toString())}
                      >
                        <CollapsibleTrigger className="p-4 bg-gray-100 hover:bg-gray-200 text-left w-full font-semibold">
                          <div className="flex items-center gap-2">
                            {openSubMenus.includes(parentMenu.MenuID.toString()) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            {parentMenu.MenuName}
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent
                          as={motion.div}
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.5 }}
                          className="space-y-4 bg-gray-50 p-4"
                        >
                          {/* Sub Menus */}
                          {Array.from(
                            new Set(
                              localMappings
                                .filter((item) => item.ParentMenuID === parentMenuID)
                                .map((item) => item.MenuName)
                            )
                          ).map((menuName) => {
                            const subMenuItems = localMappings.filter(
                              (item) =>
                                item.MenuName === menuName &&
                                item.ParentMenuID === parentMenuID
                            );

                            return (
                              <div key={menuName} className="space-y-2 border-b pb-4">
                                <div className="text-sm font-semibold">{menuName}</div>

                                <div className="border bg-white overflow-y-auto w-full text-sm rounded-md">
                                  {/* Action Headers */}
                                  <div className="grid grid-cols-8 gap-2 p-2 bg-muted/50 text-sm font-semibold text-gray-600">
                                    {subMenuItems.map((action) => (
                                      <div
                                        key={`header-${action.RoleMenuActionID}`}
                                        className={`flex justify-center items-center ${action.ActionName.length > 10 ? "col-span-2" : "col-span-1"}`}
                                      >
                                        {action.ActionName}
                                      </div>
                                    ))}
                                  </div>

                                  {/* Action Checkboxes */}
                                  <div className="grid grid-cols-8 gap-2 p-2 bg-white text-sm">
                                    {subMenuItems.map((action) => {
                                      const isThisModified = isModified(action);

                                      return (
                                        <div
                                          key={`action-${action.RoleMenuActionID}`}
                                          className={`flex justify-center items-center ${action.ActionName.length > 10 ? "col-span-2" : "col-span-1"}`}
                                        >
                                          <div
                                            className={`rounded-md p-1 ${isThisModified ? "ring-2 ring-blue-400" : ""}`}
                                            ref={action.RoleMenuActionID === firstModifiedId ? firstModifiedRef : null}
                                          >
                                            <Checkbox.Root
                                              checked={!!localMappings.find(i =>
                                                i.ActionID === action.ActionID &&
                                                i.MenuID === action.MenuID &&
                                                i.RoleID === action.RoleID
                                              )?.IsAllowed}
                                              onCheckedChange={(checked) =>
                                                handleCheckboxChange(localMappings.find(i =>
                                                  i.ActionID === action.ActionID &&
                                                  i.MenuID === action.MenuID &&
                                                  i.RoleID === action.RoleID
                                                ), checked === true)
                                              }
                                              className="w-5 h-5 border border-gray-400 rounded-sm flex items-center justify-center data-[state=checked]:bg-blue-600"
                                            >
                                              <Checkbox.Indicator>
                                                <Check className="w-4 h-4 text-white" />
                                              </Checkbox.Indicator>
                                            </Checkbox.Root>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </CardContent>
        </Card>
        : <></>
      }
    </div>
  );
};

export default PermissionsGroupingGrid;
