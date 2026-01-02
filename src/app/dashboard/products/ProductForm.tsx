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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";

// Zod Schema for Product with options
const formSchema = z.object({
  // Basic Information
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  category_id: z.string().min(1, { message: "Category is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  
  // Features (array of strings)
  features: z.array(z.string()).optional().default([]),
  
  // Options (object with string arrays)
  options: z.record(z.string(), z.array(z.string())).optional().default({}),
  
  // Status
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  
  // Flags
  is_featured: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_new: z.boolean().default(false),
  
  // SEO Fields
  meta_title: z.string().max(200, { message: "Meta title cannot exceed 200 characters" }).optional(),
  meta_description: z.string().max(500, { message: "Meta description cannot exceed 500 characters" }).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CategoryOption {
  id: string;
  name: string;
  full_path: string;
}

export default function ProductCreationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [newFeature, setNewFeature] = useState("");
  
  // State for managing options
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");
  const [currentOptionKey, setCurrentOptionKey] = useState<string | null>(null);
  
  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category_id: "",
      description: "",
      features: [],
      options: {},
      status: "draft",
      is_featured: false,
      is_bestseller: false,
      is_new: false,
      meta_title: "",
      meta_description: "",
    },
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await securityAxios.get(endpoints.products.listcategories);
      
      if (response.data.success) {
        const categoriesData = response.data.data.categories || [];
        setCategories(categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          full_path: cat.full_path,
        })));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Features management
  const addFeature = () => {
    if (newFeature.trim()) {
      const currentFeatures = form.getValues("features") || [];
      form.setValue("features", [...currentFeatures, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues("features") || [];
    const updatedFeatures = currentFeatures.filter((_, i) => i !== index);
    form.setValue("features", updatedFeatures);
  };

  // Options management
  const addOption = () => {
    if (newOptionName.trim()) {
      const currentOptions = form.getValues("options") || {};
      const optionKey = newOptionName.trim().toLowerCase().replace(/\s+/g, '_');
      
      if (!currentOptions[optionKey]) {
        form.setValue("options", {
          ...currentOptions,
          [optionKey]: []
        });
      }
      setNewOptionName("");
      setCurrentOptionKey(optionKey);
    }
  };

  const removeOption = (optionKey: string) => {
    const currentOptions = form.getValues("options") || {};
    const { [optionKey]: removed, ...remainingOptions } = currentOptions;
    form.setValue("options", remainingOptions);
    if (currentOptionKey === optionKey) {
      setCurrentOptionKey(null);
    }
  };

  const addOptionValue = () => {
    if (currentOptionKey && newOptionValue.trim()) {
      const currentOptions = form.getValues("options") || {};
      const currentValues = currentOptions[currentOptionKey] || [];
      
      if (!currentValues.includes(newOptionValue.trim())) {
        form.setValue("options", {
          ...currentOptions,
          [currentOptionKey]: [...currentValues, newOptionValue.trim()]
        });
      }
      setNewOptionValue("");
    }
  };

  const removeOptionValue = (optionKey: string, valueIndex: number) => {
    const currentOptions = form.getValues("options") || {};
    const currentValues = currentOptions[optionKey] || [];
    const updatedValues = currentValues.filter((_, i) => i !== valueIndex);
    
    form.setValue("options", {
      ...currentOptions,
      [optionKey]: updatedValues
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Prepare payload
      const payload: Record<string, any> = {
        title: data.title.trim(),
        category_id: data.category_id,
        description: data.description.trim(),
        status: data.status,
        is_featured: data.is_featured,
        is_bestseller: data.is_bestseller,
        is_new: data.is_new,
      };
      
      // Add features if any
      if (data.features && data.features.length > 0) {
        payload.features = data.features;
      }
      
      // Add options if any
      if (data.options && Object.keys(data.options).length > 0) {
        payload.options = data.options;
      }
      
      // Add SEO fields if provided
      if (data.meta_title?.trim()) {
        payload.meta_title = data.meta_title.trim();
      }
      
      if (data.meta_description?.trim()) {
        payload.meta_description = data.meta_description.trim();
      }
      
      console.log("Submitting product payload:", payload);

      // Make POST request to create product
      const response = await securityAxios.post(endpoints.products.addProduct, payload);

      console.log("API Response:", response.data);

      if (response.status === 201) {
        const apiResponse = response.data;
        
        if (apiResponse.success) {
          toast.success(apiResponse.message || "Product created successfully");
          
          // Reset form
          form.reset({
            title: "",
            category_id: "",
            description: "",
            features: [],
            options: {},
            status: "draft",
            is_featured: false,
            is_bestseller: false,
            is_new: false,
            meta_title: "",
            meta_description: "",
          });
          
          setNewFeature("");
          setNewOptionName("");
          setNewOptionValue("");
          setCurrentOptionKey(null);
        } else {
          toast.error(apiResponse.error || "Failed to create product");
        }
      } else {
        toast.error(`Unexpected status: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      
      // Handle validation errors
      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        
        // Display first validation error in toast
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
      } else if (error?.response?.status === 401) {
        toast.error("Please login to create products");
      } else if (error?.response?.status === 403) {
        toast.error("You don't have permission to create products");
      } else {
        toast.error("Failed to create product. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = form.watch("features") || [];
  const options = form.watch("options") || {};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6 p-6 border rounded-lg bg-card">
          <div>
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <p className="text-sm text-muted-foreground">
              Enter the basic details for your new product
            </p>
          </div>
          
          {/* Product Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Title *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Wireless Bluetooth Headphones"
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
          
          {/* Category Selection */}
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingCategories}
                >
                  <FormControl>
                    <SelectTrigger>
                      {isLoadingCategories ? (
                        <div className="flex items-center gap-2">
                          <span>Loading categories...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select a category" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex flex-col">
                          <span>{category.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {category.full_path}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the category where this product belongs
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Product Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your product in detail..."
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide detailed information about the product features and benefits
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Product Features */}
          <div>
            <FormLabel>Product Features</FormLabel>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature (e.g., 'Noise Cancelling')"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addFeature}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Features List */}
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {features.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No features added yet</p>
                ) : (
                  features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <FormDescription>
              Add key features of your product (optional)
            </FormDescription>
          </div>
        </div>
        
        {/* Product Options Section */}
        <div className="space-y-6 p-6 border rounded-lg bg-card">
          <div>
            <h3 className="text-lg font-semibold">Product Options</h3>
            <p className="text-sm text-muted-foreground">
              Define options for product variants (e.g., color, size, brand)
            </p>
          </div>
          
          {/* Add New Option */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
                placeholder="Option name (e.g., 'color', 'size', 'brand')"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addOption();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addOption}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormDescription>
              Create options that customers can choose from when selecting variants
            </FormDescription>
          </div>
          
          {/* Options List */}
          {Object.keys(options).length > 0 && (
            <div className="space-y-4">
              {Object.entries(options).map(([optionKey, values]) => (
                <div key={optionKey} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium capitalize">{optionKey.replace(/_/g, ' ')}</h4>
                      <p className="text-xs text-muted-foreground">
                        {optionKey}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeOption(optionKey)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Add values to selected option */}
                  {currentOptionKey === optionKey && (
                    <div className="flex gap-2">
                      <Input
                        value={newOptionValue}
                        onChange={(e) => setNewOptionValue(e.target.value)}
                        placeholder="Add a value (e.g., 'Red', 'Large', 'Sony')"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addOptionValue();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addOptionValue}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Option values list */}
                  <div className="space-y-2">
                    {Array.isArray(values) && values.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {values.map((value, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {value}
                            <button
                              type="button"
                              onClick={() => removeOptionValue(optionKey, index)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No values added yet. Click the option name to add values.
                      </p>
                    )}
                  </div>
                  
                  {/* Button to manage values */}
                  <Button
                    type="button"
                    onClick={() => setCurrentOptionKey(
                      currentOptionKey === optionKey ? null : optionKey
                    )}
                    variant="ghost"
                    size="sm"
                  >
                    {currentOptionKey === optionKey ? 'Done' : 'Manage Values'}
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {Object.keys(options).length === 0 && (
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">
                No options defined. Add options to create product variants.
              </p>
            </div>
          )}
        </div>
        
        {/* Status and Flags Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Selection */}
          <div className="space-y-4 p-6 border rounded-lg bg-card">
            <h4 className="font-semibold">Product Status</h4>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Draft: Not visible to customers
                    <br />
                    Published: Visible on store
                    <br />
                    Archived: Hidden from store
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Flags Section */}
          <div className="space-y-4 p-6 border rounded-lg bg-card">
            <h4 className="font-semibold">Product Flags</h4>
            
            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>
                      Display in featured products section
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_bestseller"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Bestseller</FormLabel>
                    <FormDescription>
                      Mark as a best-selling product
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_new"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>New Arrival</FormLabel>
                    <FormDescription>
                      Mark as a new product
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* SEO Section */}
        <div className="space-y-6 p-6 border rounded-lg bg-card">
          <div>
            <h3 className="text-lg font-semibold">SEO Settings</h3>
            <p className="text-sm text-muted-foreground">
              Optimize your product for search engines
            </p>
          </div>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="meta_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SEO-optimized title for search engines"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Custom title for search engine results pages (optional)
                  </FormDescription>
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
                    <Textarea
                      placeholder="Brief description for search engine results"
                      className="min-h-[80px]"
                      {...field}
                      value={field.value || ""}
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
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setNewOptionName("");
              setNewOptionValue("");
              setCurrentOptionKey(null);
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
            {isSubmitting ? "Creating Product..." : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}