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

// Zod Schema for Category
const formSchema = z.object({
  // Basic Information
  name: z.string().min(2, { message: "Category name must be at least 2 characters" }),
  description: z.string().optional(),
  
  // Parent Category
  parent_id: z.string().optional().nullable(),
  
  // SEO Fields
  meta_title: z.string().max(200, { message: "Meta title cannot exceed 200 characters" }).optional(),
  meta_description: z.string().max(500, { message: "Meta description cannot exceed 500 characters" }).optional(),
  
  // Status
  is_active: z.boolean().default(true),
}).refine((data) => {
  if (data.meta_title && data.meta_title.length < 5) {
    return false;
  }
  return true;
}, {
  message: "Meta title should be at least 5 characters if provided",
  path: ["meta_title"],
});

type FormData = z.infer<typeof formSchema>;

interface CategoryOption {
  id: string;
  name: string;
  full_path: string;
}

export default function CategoryCreationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentCategories, setParentCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Image upload states
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      parent_id: null,
      meta_title: "",
      meta_description: "",
      is_active: true,
    },
  });

  // Fetch parent categories on component mount
  useEffect(() => {
    fetchParentCategories();
  }, []);

  const fetchParentCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await securityAxios.get(endpoints.products.listcategories, {
        params: {
          limit: 100,
          include_inactive: false,
        }
      });

      if (response.data.success) {
        const categories = response.data.data.categories || [];
        setParentCategories(categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          full_path: cat.full_path || cat.name,
        })));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load parent categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("File must be an image");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    
    setImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    e.target.value = '';
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setIsUploadingImage(true);
      
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', data.name.trim());
      formData.append('description', data.description?.trim() || "");
      formData.append('is_active', data.is_active.toString());
      
      if (data.parent_id && data.parent_id !== "null") {
        formData.append('parent_id', data.parent_id);
      }
      
      if (data.meta_title?.trim()) {
        formData.append('meta_title', data.meta_title.trim());
      }
      
      if (data.meta_description?.trim()) {
        formData.append('meta_description', data.meta_description.trim());
      }
      
      // Add image if exists
      if (image) {
        formData.append('image', image);
      }
      
      console.log("Submitting category with image:", !!image);

      // Use multipart/form-data endpoint for category creation with image
      const response = await securityAxios.post(
        endpoints.products.addCategory, // Update this endpoint to handle multipart
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.status === 201 || response.data.success) {
        const apiResponse = response.data;
        
        toast.success(apiResponse.message || "Category created successfully");
        
        // Reset form
        form.reset({
          name: "",
          description: "",
          parent_id: null,
          meta_title: "",
          meta_description: "",
          is_active: true,
        });
        
        // Clear image
        removeImage();
        
        // Refresh parent categories list
        fetchParentCategories();
      } else {
        toast.error(apiResponse.error || "Failed to create category");
      }
    } catch (error: any) {
      console.error("Error creating category:", error);
      
      // Handle validation errors
      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        
        const firstErrorKey = Object.keys(validationErrors)[0];
        const firstError = validationErrors[firstErrorKey];
        
        if (Array.isArray(firstError)) {
          toast.error(firstError[0]);
        } else {
          toast.error(firstError);
        }
        
        // Set form errors
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
      } else if (error?.response?.status === 401) {
        toast.error("Please login to create categories");
      } else if (error?.response?.status === 403) {
        toast.error("You don't have permission to create categories");
      } else {
        toast.error("Failed to create category. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto">
        {/* Basic Information Section */}
        <div className="space-y-6 p-6 border rounded-lg bg-card">
          <div>
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <p className="text-sm text-muted-foreground">
              Enter the basic details for your new category
            </p>
          </div>
          
          {/* Category Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., iPhone, Mac, Accessories"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This will be displayed to customers and used to generate the URL slug
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Category Image Upload */}
          <div className="space-y-3">
            <FormLabel>Category Image</FormLabel>
            <div className="flex flex-col gap-4">
              {/* Image Preview */}
              {imagePreview ? (
                <div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden border">
                  <Image
                    src={imagePreview}
                    alt="Category preview"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full max-w-xs aspect-video border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Upload Button */}
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  id="category-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <div className="flex gap-2">
                  <label
                    htmlFor="category-image"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {image ? "Change Image" : "Upload Image"}
                  </label>
                  {image && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP up to 5MB. Recommended: 800x600px
                </p>
              </div>
            </div>
          </div>
          
          {/* Parent Category */}
          <FormField
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "null"}
                  disabled={isLoadingCategories || isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      {isLoadingCategories ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading categories...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select a parent category (optional)" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">None (Root Category)</SelectItem>
                    {parentCategories.map((category) => (
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
          
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe this category for customers and SEO..."
                    className="min-h-[100px]"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  This helps customers understand what products belong in this category
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Advanced Options Collapsible */}
        <Collapsible
          open={showAdvanced}
          onOpenChange={setShowAdvanced}
          className="border rounded-lg"
        >
          <div className="p-6">
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between p-0 hover:bg-transparent"
                disabled={isSubmitting}
              >
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Advanced Options</h3>
                  <p className="text-sm text-muted-foreground">
                    SEO settings and visibility controls
                  </p>
                </div>
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-6 pt-6">
              {/* SEO Section */}
              <div className="space-y-4">
                <h4 className="font-medium">SEO Settings</h4>
                
                {/* Meta Title */}
                <FormField
                  control={form.control}
                  name="meta_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optimized title for search engines"
                          {...field}
                          value={field.value || ""}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Custom title for search engine results pages (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Meta Description */}
                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description for search engine results"
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ""}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Appears in search results below the title (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Status Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Status</h4>
                
                {/* Active Status */}
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Category
                        </FormLabel>
                        <FormDescription>
                          Inactive categories won't be visible to customers
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              removeImage();
            }}
            disabled={isSubmitting}
          >
            Reset Form
          </Button>
          <Button 
            type="submit" 
            size="lg"
            className="min-w-[200px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploadingImage ? "Uploading..." : "Creating Category..."}
              </>
            ) : (
              "Create Category"
            )}
          </Button>
        </div>
        
        {/* Form Status */}
        {form.formState.isSubmitted && !form.formState.isSubmitting && (
          <div className="text-center text-sm text-muted-foreground">
            Category will be available immediately if marked as active
          </div>
        )}
      </form>
    </Form>
  );
}