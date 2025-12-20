"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
// import { CustomMultiSelect, selectField } from "@/components/widgets/custom-select/CustomMultiSelect";
import { useState } from "react";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";

// Zod Schema for validation
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  role: z.string().min(1, { message: "Please select a role" }),
  permissions: z.array(z.string()).min(1, { message: "Select at least one permission" }),
  isActive: z.boolean().default(true),
  phone: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

export default function UserCreationForm() {
  // const [selectedPermissions, setSelectedPermissions] = useState<selectField[]>([]);
  // const [selectedRole, setSelectedRole] = useState<selectField | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      permissions: [],
      isActive: true,
      phone: "",
      notes: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    // try {
    //   const payload = {
    //     ...data,
    //     role: selectedRole?.value,
    //     permissions: selectedPermissions.map(p => p.value),
    //   };

    //   const response = await securityAxios.post(endpoints.users.createStaff, payload);

    //   if (response.status === 201 || response.status === 200) {
    //     toast.success(response.data.message || "Staff user created successfully");
    //     form.reset();
    //     setSelectedPermissions([]);
    //     setSelectedRole(null);
    //   }
    // } catch (error: any) {
    //   console.error("Error creating user:", error);
    //   toast.error(
    //     error?.response?.data?.error || "Failed to create user. Please try again."
    //   );
    // }
  };

  // Role options
  // const roleOptions: selectField[] = [
  //   { id: 1, label: "Super Admin", value: "super_admin" },
  //   { id: 2, label: "Admin", value: "admin" },
  //   { id: 3, label: "Manager", value: "manager" },
  //   { id: 4, label: "Staff", value: "staff" },
  //   { id: 5, label: "Inventory Manager", value: "inventory_manager" },
  //   { id: 6, label: "Customer Support", value: "support" },
  // ];

  // // Permission options (customize as needed)
  // const permissionOptions: selectField[] = [
  //   { id: 1, label: "Manage Products", value: "manage_products" },
  //   { id: 2, label: "Manage Orders", value: "manage_orders" },
  //   { id: 3, label: "Manage Users", value: "manage_users" },
  //   { id: 4, label: "View Analytics", value: "view_analytics" },
  //   { id: 5, label: "Manage Categories", value: "manage_categories" },
  //   { id: 6, label: "Process Refunds", value: "process_refunds" },
  //   { id: 7, label: "Manage Promotions", value: "manage_promotions" },
  //   { id: 8, label: "View Reports", value: "view_reports" },
  // ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Admin / Staff User</h2>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
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
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password *</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Role & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Account Active</FormLabel>
              </FormItem>
            )}
          />
        </div>


        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information about this user..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6">
          <Button type="submit" size="lg" className="w-full md:w-auto">
            Create User
          </Button>
        </div>
      </form>
    </Form>
  );
}