
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/api/api';
import { IUser, IRole } from '@/types/database';
import { FormModal } from '@/components/common/FormModal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Define validation schema
const userFormSchema = z.object({
  userId: z.number().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .optional()
    .or(z.literal('')),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  roleId: z.coerce.number().min(1, 'Role is required'),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IUser | null;
  onSuccess?: () => void;
}

export function UserForm({ open, onOpenChange, initialData, onSuccess }: UserFormProps) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      userId: initialData?.UserID || 0,
      username: initialData?.Username || '',
      password: '', // Password is always empty when editing
      fullName: initialData?.FullName || '',
      email: initialData?.Email || '',
      phone: initialData?.Phone || '',
      roleId: initialData?.RoleID || 0,
    },
  });

  // Reset form when initial data changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        userId: initialData.UserID,
        username: initialData.Username,
        password: '', // Password is always empty when editing
        fullName: initialData.FullName || '',
        email: initialData.Email || '',
        phone: initialData.Phone || '',
        roleId: initialData.RoleID,
      });
    } else {
      form.reset({
        userId: 0,
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        roleId: 0,
      });
    }
  }, [initialData, form]);

  // Fetch roles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.getRoles();
      if (!response.success) {
        throw new Error('Failed to fetch roles');
      }
      return response.data;
    },
  });

  const isLoading = rolesLoading || form.formState.isSubmitting;

  async function onSubmit(values: UserFormValues) {
    try {
      if (isEditing && values.userId) {
        // Update existing user
        // Note: We're assuming an API endpoint for updating users
        // This would need to be implemented on the server
        await fetch(`/api/users/${values.userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            username: values.username,
            fullName: values.fullName,
            email: values.email,
            phone: values.phone || null,
            roleId: values.roleId,
            password: values.password ? values.password : undefined, // Only send password if provided
          }),
        });
        
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        // Create new user
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            username: values.username,
            password: values.password,
            fullName: values.fullName,
            email: values.email,
            phone: values.phone || null,
            roleId: values.roleId,
          }),
        });
        
        toast({
          title: "Success",
          description: "User created successfully",
        });
      }
      
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: "Failed to save user data. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit User" : "Add New User"}
      description="Enter the user details below."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter username" 
                    {...field} 
                    disabled={isEditing} // Cannot change username when editing
                  />
                </FormControl>
                {isEditing && (
                  <FormDescription>
                    Username cannot be changed after creation
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isEditing ? "New Password (optional)" : "Password"}</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder={isEditing ? "Enter new password" : "Enter password"} 
                    {...field} 
                  />
                </FormControl>
                {isEditing && (
                  <FormDescription>
                    Leave blank to keep current password
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Enter email address" 
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter phone number" 
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
            name="roleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value.toString()}
                  disabled={rolesLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles?.map((role: IRole) => (
                      <SelectItem key={role.RoleID} value={role.RoleID.toString()}>
                        {role.RoleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
