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
import { IRole } from '@/types/database';
import { useRole } from './useRole';

const RoleFormSchema = z.object({
  RoleName: z.string().min(1, "Role name is required"),
});

export const RoleTab: React.FC = () => {
  const { pathname, search } = useLocation();
  const fullUrl = pathname + search;
  const { hasPermission } = useAuth();

  const { roles, loading, addRole, updateRole, deleteRole, refresh} = useRole();

  const [activeForm, setActiveForm] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);

  const roleForm = useForm<z.infer<typeof RoleFormSchema>>({
    resolver: zodResolver(RoleFormSchema),
    defaultValues: {
      RoleName: "",
    },
  });

  const handleAddRole = () => {
    setSelectedRole(null);
    roleForm.reset({ RoleName: "" });
    setActiveForm(true);
  };

  const handleEditRole = (role: IRole) => {
    setSelectedRole(role);
    roleForm.reset({
      RoleName: role.RoleName,
    });
    setActiveForm(true);
  };

  const handleDeleteRole = async (roleID: number) => {
    await deleteRole(roleID);
  };

  const onRoleSubmit = async (data: z.infer<typeof RoleFormSchema>) => {
    if (selectedRole) {
      await updateRole({
        ...selectedRole,
        RoleName: data.RoleName,
      });
    } else {
      await addRole({
        RoleName: data.RoleName,
      });
    }

    setActiveForm(false);
    setSelectedRole(null);
    refresh();
    roleForm.reset({ RoleName: "", });
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Roles</h2>


            {hasPermission(fullUrl, 'CanAdd') && (
              <Button onClick={handleAddRole} className="flex items-center gap-2">
                <Plus size={16} />
                Add Role
              </Button>
            )}
          </div>

          {activeForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{selectedRole ? "Edit Role" : "Add Role"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...roleForm}>
                  <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={roleForm.control}
                        name="RoleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter Role Name" {...field} />
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
                        {selectedRole ? "Update Role" : "Create Role"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Role List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 p-4 bg-muted/50 font-medium text-sm">
                  <div className="col-span-1">Role</div>
                </div>
                {roles.map((role) => (
                  <div
                    key={role.RoleID}
                    className="grid grid-cols-4 p-4 border-t text-sm items-center"
                  >
                    <div className="col-span-1">{role.RoleName}</div>
                    <div className="col-span-3 flex justify-end gap-2">
                      {hasPermission(fullUrl, 'CanUpdate') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
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
                          onClick={() => handleDeleteRole(role.RoleID)}
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