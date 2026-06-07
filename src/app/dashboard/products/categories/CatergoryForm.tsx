// components/forms/CategoryForm.tsx - Simplified working version

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
  FormDescription,
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
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, ChevronDown, ChevronUp, Upload, X, Image as ImageIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Image from "next/image";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters" }),
  description: z.string().optional(),
  parent_id: z.string().optional().nullable(),
  meta_title: z.string().max(200, { message: "Meta title cannot exceed 200 characters" }).optional(),
  meta_description: z.string().max(500, { message: "Meta description cannot exceed 500 characters" }).optional(),
  is_active: z.boolean().default(true),
  is_hidden: z.boolean().default(false),
});

type FormData = z.input<typeof formSchema>;

interface CategoryOption {
  id: string;
  name: string;
  full_path: string;
}

interface CategoryFormProps {
  categoryId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Fetch all categories for parent dropdown
const fetchAllCategories = async () => {
  const response = await securityAxios.get(endpoints.products.adminlistCategories, {
    params: { limit: 100 }
  });
  return response.data.data.categories || [];
};

// Fetch single category for update
const fetchCategory = async (id: string) => {
  const response = await securityAxios.get(
    endpoints.products.adminGetCategoryDetails.replace(":id", id)
  );
  return response.data.data;
};

export default function CategoryForm({ categoryId, onSuccess, onCancel }: CategoryFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  const queryClient = useQueryClient();
  const isUpdateMode = !!categoryId;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      parent_id: null,
      meta_title: "",
      meta_description: "",
      is_active: true,
      is_hidden: false,
    },
  });

  // Query for all categories
  const { data: allCategories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['all-categories'],
    queryFn: () => fetchAllCategories(),
    staleTime: 5 * 60 * 1000,
  });

  // Query for single category
  const { data: categoryData, isLoading: isLoadingCategory } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => fetchCategory(categoryId!),
    enabled: isUpdateMode && !!categoryId,
    staleTime: 0,
  });

  // Set form values when data is loaded
  useEffect(() => {
    if (categoryData && allCategories) {
      console.log("Setting form values for:", categoryData.name);
      console.log("Parent ID to set:", categoryData.parent_id);

      // Find the parent to verify it exists
      const parentExists = allCategories.find((c: any) => c.id === categoryData.parent_id);
      console.log("Parent exists in list:", parentExists ? parentExists.name : "No");

      // Set all form values at once
      form.setValue('name', categoryData.name || "");
      form.setValue('description', categoryData.description || "");
      form.setValue('parent_id', categoryData.parent_id || null);
      form.setValue('meta_title', categoryData.meta_title || "");
      form.setValue('meta_description', categoryData.meta_description || "");
      form.setValue('is_active', categoryData.is_active ?? true);
      form.setValue('is_hidden', categoryData.is_hidden ?? false);

      // Set image
      if (categoryData.image && !removeExistingImage) {
        setImagePreview(categoryData.image);
      }

      setIsFormReady(true);
    } else if (!isUpdateMode && allCategories) {
      setIsFormReady(true);
    }
  }, [categoryData, allCategories, form, isUpdateMode, removeExistingImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("File must be an image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
    setRemoveExistingImage(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('description', data.description?.trim() || "");
      formData.append('is_active', data.is_active!.toString());
      formData.append('is_hidden', data.is_hidden!.toString());
      if (data.parent_id) formData.append('parent_id', data.parent_id);
      if (data.meta_title?.trim()) formData.append('meta_title', data.meta_title.trim());
      if (data.meta_description?.trim()) formData.append('meta_description', data.meta_description.trim());
      if (imageFile) formData.append('image', imageFile);

      const response = await securityAxios.post(endpoints.products.adminAddCategory, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: [endpoints.products.adminlistCategories] });
      queryClient.invalidateQueries({ queryKey: ['all-categories'] });
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Create error:", error);
      toast.error(error?.response?.data?.message || "Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        name: data.name,
        description: data.description,
        parent_id: data.parent_id || null,
        is_active: data.is_active,
        is_hidden: data.is_hidden,
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
      };

      // If no image changes, send as JSON
      if (!imageFile && !removeExistingImage) {
        const response = await securityAxios.put(
          endpoints.products.adminUpdateCategory.replace(":id", categoryId!),
          payload
        );
        return response.data;
      }

      // If image changes, use FormData
      const formData = new FormData();
      formData.append('_method', 'PUT'); // Method override
      formData.append('name', data.name.trim());
      formData.append('description', data.description?.trim() || "");
      formData.append('is_active', String(data.is_active));
      formData.append('is_hidden', String(data.is_hidden));
      if (data.parent_id) formData.append('parent_id', data.parent_id);
      if (data.meta_title?.trim()) formData.append('meta_title', data.meta_title.trim());
      if (data.meta_description?.trim()) formData.append('meta_description', data.meta_description.trim());

      if (removeExistingImage) {
        formData.append('remove_image', 'true');
      } else if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await securityAxios.post(
        endpoints.products.adminUpdateCategory.replace(":id", categoryId!),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: [endpoints.products.adminlistCategories] });
      queryClient.invalidateQueries({ queryKey: ['all-categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', categoryId] });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Failed to update category");
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Submitting with parent_id:", data.parent_id);
    if (isUpdateMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if ((isUpdateMode && !isFormReady) || isLoadingCategory) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Filter out current category from parent options
  const parentOptions = allCategories?.filter((cat: any) => !isUpdateMode || cat.id !== categoryId) || [];

  // Get current parent_id value
  const currentParentId = form.watch('parent_id');

  // Find the selected parent for display
  const selectedParent = parentOptions.find((cat: any) => cat.id === currentParentId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6 p-6 border rounded-lg bg-card">
          <div>
            <h3 className="text-lg font-semibold">
              {isUpdateMode ? "Edit Category" : "Create Category"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isUpdateMode ? "Update the category details" : "Enter the category details"}
            </p>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Category name" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Upload */}
          <div className="space-y-3">
            <FormLabel>Category Image</FormLabel>
            <div className="flex flex-col gap-4">
              {imagePreview ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md w-fit"
              >
                <Upload className="h-4 w-4" />
                {imagePreview ? "Change Image" : "Upload Image"}
              </label>
            </div>
          </div>

          {/* Parent Category Select - CRITICAL FIX */}
          <FormField
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category</FormLabel>
                <Select
                  value={field.value || "none"}
                  onValueChange={(value) => {
                    console.log("Setting parent_id to:", value === "none" ? null : value);
                    field.onChange(value === "none" ? null : value);
                  }}
                  disabled={isLoadingCategories || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {!field.value || field.value === "none" ? (
                        "None (Root Category)"
                      ) : (
                        selectedParent?.full_path || selectedParent?.name || "Select parent"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    {parentOptions.map((category: CategoryOption) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select a parent category to create a subcategory
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Category description" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Advanced Options */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced} className="border rounded-lg">
          <div className="p-6">
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="w-full justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Advanced Options</h3>
                  <p className="text-sm text-muted-foreground">SEO and visibility settings</p>
                </div>
                {showAdvanced ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-6 pt-6">
              <FormField
                control={form.control}
                name="meta_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input placeholder="SEO title" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meta_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="SEO description" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex justify-between items-center rounded-lg border p-4">
                    <div>
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Visible to customers</FormDescription>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_hidden"
                render={({ field }) => (
                  <FormItem className="flex justify-between items-center rounded-lg border p-4">
                    <div>
                      <FormLabel>Hidden</FormLabel>
                      <FormDescription>Only visible to admins</FormDescription>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </div>
        </Collapsible>

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUpdateMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              isUpdateMode ? "Update Category" : "Create Category"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}