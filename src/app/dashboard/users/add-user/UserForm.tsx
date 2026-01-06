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
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const RoleEnum = z.enum(["admin", "staff", "customer"]);

// Simplified Zod Schema - only required fields
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  first_name: z.string().min(2, { message: "First name must be at least 2 characters" }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  role: RoleEnum.refine(Boolean, {
    message: "Role is required",
  }),
}).refine((data) => data.password.length >= 8, {
  message: "Password must be at least 8 characters",
  path: ["password"],
});

type FormData = z.input<typeof formSchema>;
// Role options for Django API
const roleOptions = [
  { value: "admin", label: "Administrator" },
  { value: "staff", label: "Staff" },
  { value: "customer", label: "Customer" },
] as const;

export default function UserCreationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient()


  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "customer",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Prepare payload with only required fields
      const payload = {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
      };

      console.log("Submitting payload:", payload);

      // Use the Django admin user registration endpoint
      const response = await securityAxios.post(endpoints.auth.registerUser, payload);

      console.log("API Response:", response.data);

      if (response.status === 201) {
        const apiResponse = response.data;

        if (apiResponse.success) {
          toast.success(apiResponse.message || "User created successfully");
          form.reset(); // Reset form after successful submission
          queryClient.invalidateQueries(
            { queryKey: [endpoints.products.listcategories], exact: false }
          )
        } else {
          toast.error(apiResponse.error || "Failed to create user");
        }
      } else {
        toast.error(`Unexpected status: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Error creating user:", error);

      // Handle Django validation errors
      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;

        // Display first validation error
        const firstErrorKey = Object.keys(validationErrors)[0];
        const firstError = validationErrors[firstErrorKey];

        if (Array.isArray(firstError)) {
          toast.error(firstError[0]);
        } else {
          toast.error(firstError);
        }

        // Set form errors for specific fields
        Object.keys(validationErrors).forEach((field) => {
          const fieldName = field as keyof FormData;
          const errorMessage = Array.isArray(validationErrors[field])
            ? validationErrors[field][0]
            : validationErrors[field];

          form.setError(fieldName, {
            type: "manual",
            message: errorMessage,
          });
        });
      } else if (error?.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create user. Please try again.");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Password</FormLabel>{" "}
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...field}
                    className="pr-10"
                  />

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-black"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role Selection */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            size="lg"
            className="w-full"
          >
            Create User
          </Button>
        </div>

        {/* Form Status */}
        {form.formState.isSubmitting && (
          <div className="text-center">
            <p className="text-sm text-blue-600">Creating user...</p>
          </div>
        )}
      </form>
    </Form>
  );
}