// app/dashboard/products/ProductForm.tsx
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
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

// Zod Schema for Product with options
const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  category_id: z.string().min(1, { message: "Category is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  features: z.array(z.string()).default([]),
  options: z.record(z.string(), z.array(z.string())).default({}),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  is_featured: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_new: z.boolean().default(false),
  meta_title: z.string().max(200, { message: "Meta title cannot exceed 200 characters" }).optional(),
  meta_description: z.string().max(500, { message: "Meta description cannot exceed 500 characters" }).optional(),
});

type FormData = z.input<typeof formSchema>;

interface CategoryOption {
  id: string;
  name: string;
  full_path: string;
}

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Fetch categories
const fetchCategories = async (): Promise<CategoryOption[]> => {
  const response = await securityAxios.get(endpoints.products.listCategories);
  if (response.data.success) {
    return response.data.data.categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      full_path: cat.full_path,
    }));
  }
  return [];
};

// Fetch product for update
const fetchProduct = async (id: string): Promise<any> => {
  const response = await securityAxios.get(endpoints.products.AdminGetProductDetails.replace(":id", id));
  return response.data.data;
};

// Create product mutation
const createProduct = async (data: FormData): Promise<any> => {
  const payload: Record<string, any> = {
    title: data.title.trim(),
    category_id: data.category_id,
    description: data.description.trim(),
    status: data.status,
    is_featured: data.is_featured,
    is_bestseller: data.is_bestseller,
    is_new: data.is_new,
  };

  if (data.features && data.features.length > 0) {
    payload.features = data.features;
  }
  if (data.options && Object.keys(data.options).length > 0) {
    payload.options = data.options;
  }
  if (data.meta_title?.trim()) {
    payload.meta_title = data.meta_title.trim();
  }
  if (data.meta_description?.trim()) {
    payload.meta_description = data.meta_description.trim();
  }

  const response = await securityAxios.post(endpoints.products.adminAddProduct, payload);
  return response.data;
};

// Update product mutation
const updateProduct = async (id: string, data: FormData): Promise<any> => {
  const payload: Record<string, any> = {
    title: data.title.trim(),
    category_id: data.category_id,
    description: data.description.trim(),
    status: data.status,
    is_featured: data.is_featured,
    is_bestseller: data.is_bestseller,
    is_new: data.is_new,
  };

  if (data.features && data.features.length > 0) {
    payload.features = data.features;
  }
  if (data.options && Object.keys(data.options).length > 0) {
    payload.options = data.options;
  }
  if (data.meta_title?.trim()) {
    payload.meta_title = data.meta_title.trim();
  }
  if (data.meta_description?.trim()) {
    payload.meta_description = data.meta_description.trim();
  }

  const response = await securityAxios.put(endpoints.products.adminUpdateProduct.replace(":id", id), payload);
  return response.data;
};

export default function ProductForm({ productId, onSuccess, onCancel }: ProductFormProps) {
  const [newFeature, setNewFeature] = useState("");
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");
  const [currentOptionKey, setCurrentOptionKey] = useState<string | null>(null);
  const [isFormReady, setIsFormReady] = useState(false);

  const queryClient = useQueryClient();
  const isUpdateMode = !!productId;

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

  // Query for categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['product-form-categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  // Query for product data (update mode)
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId!),
    enabled: isUpdateMode && !!productId,
    staleTime: 0,
  });

  // Populate form when product data is loaded
  useEffect(() => {
    if (productData) {
      form.reset({
        title: productData.title || "",
        category_id: productData.category?.id || "",
        description: productData.description || "",
        features: productData.features || [],
        options: productData.options || {},
        status: productData.status || "draft",
        is_featured: productData.is_featured ?? false,
        is_bestseller: productData.is_bestseller ?? false,
        is_new: productData.is_new ?? false,
        meta_title: productData.meta_title || "",
        meta_description: productData.meta_description || "",
      });
      setIsFormReady(true);
    } else if (!isUpdateMode && categories) {
      setIsFormReady(true);
    }
  }, [productData, categories, form, isUpdateMode]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
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
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorData = error?.response?.data;
      if (errorData?.errors) {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          form.setError(field as keyof FormData, {
            message: Array.isArray(messages) ? messages[0] : String(messages),
          });
        });
        toast.error("Please fix the validation errors");
      } else {
        toast.error(errorData?.message || "Failed to create product");
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateProduct(id, data),
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorData = error?.response?.data;
      if (errorData?.errors) {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          form.setError(field as keyof FormData, {
            message: Array.isArray(messages) ? messages[0] : String(messages),
          });
        });
        toast.error("Please fix the validation errors");
      } else {
        toast.error(errorData?.message || "Failed to update product");
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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

  const onSubmit = (data: FormData) => {
    if (isUpdateMode && productId) {
      updateMutation.mutate({ id: productId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if ((isUpdateMode && !isFormReady) || isLoadingProduct) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    );
  }

  const features = form.watch("features") || [];
  const options = form.watch("options") || {};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isUpdateMode ? "Edit Product" : "Basic Information"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isUpdateMode ? "Update the product details" : "Enter the basic details for your new product"}
            </p>
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Product Title *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Wireless Bluetooth Headphones"
                    {...field}
                    disabled={isSubmitting}
                    className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400">
                  This will be displayed to customers and used to generate the URL slug
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Category *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCategories || isSubmitting}>
                  <FormControl>
                    <SelectTrigger className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white">
                      {isLoadingCategories ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading categories...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select a category" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-900">
                        <div className="flex flex-col">
                          <span>{category.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{category.full_path}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-gray-500 dark:text-gray-400">
                  Choose the category where this product belongs
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
                <FormLabel className="text-gray-700 dark:text-gray-300">Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your product in detail..."
                    className="min-h-[150px] border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400">
                  Provide detailed information about the product features and benefits
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Product Features */}
          <div>
            <FormLabel className="text-gray-700 dark:text-gray-300">Product Features</FormLabel>
            <div className="space-y-3 mt-2">
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature (e.g., 'Noise Cancelling')"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                  disabled={isSubmitting}
                  className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
                <Button
                  type="button"
                  onClick={addFeature}
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100  dark:bg-gray-800 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {features.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No features added yet</p>
                ) : (
                  features.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <FormDescription className="text-gray-500 dark:text-gray-400 mt-2">
              Add key features of your product (optional)
            </FormDescription>
          </div>
        </div>

        {/* Product Options Section */}
        <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Options</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Define options for product variants (e.g., color, size, brand)</p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
                placeholder="Option name (e.g., 'color', 'size', 'brand')"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
                disabled={isSubmitting}
                className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
              <Button
                type="button"
                onClick={addOption}
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100  dark:bg-gray-800 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormDescription className="text-gray-500 dark:text-gray-400">
              Create options that customers can choose from when selecting variants
            </FormDescription>
          </div>

          {Object.keys(options).length > 0 && (
            <div className="space-y-4">
              {Object.entries(options).map(([optionKey, values]) => (
                <div key={optionKey} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg space-y-3 bg-gray-50 dark:bg-gray-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">{optionKey.replace(/_/g, ' ')}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{optionKey}</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeOption(optionKey)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {currentOptionKey === optionKey && (
                    <div className="flex gap-2">
                      <Input
                        value={newOptionValue}
                        onChange={(e) => setNewOptionValue(e.target.value)}
                        placeholder="Add a value (e.g., 'Red', 'Large', 'Sony')"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOptionValue(); } }}
                        disabled={isSubmitting}
                        className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      />
                      <Button
                        type="button"
                        onClick={addOptionValue}
                        variant="outline"
                        size="sm"
                        disabled={isSubmitting}
                        className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {Array.isArray(values) && values.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {values.map((value, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="flex items-center gap-1 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {value}
                            <button
                              type="button"
                              onClick={() => removeOptionValue(optionKey, index)}
                              className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No values added yet. Click below to add values.</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={() => setCurrentOptionKey(currentOptionKey === optionKey ? null : optionKey)}
                    variant="ghost"
                    size="sm"
                    disabled={isSubmitting}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {currentOptionKey === optionKey ? 'Done' : 'Manage Values'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {Object.keys(options).length === 0 && (
            <div className="text-center p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">No options defined. Add options to create product variants.</p>
            </div>
          )}
        </div>

        {/* Status and Flags Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black">
            <h4 className="font-semibold text-gray-900 dark:text-white">Product Status</h4>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                      <SelectItem value="draft" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-900">Draft</SelectItem>
                      <SelectItem value="published" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-900">Published</SelectItem>
                      <SelectItem value="archived" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-900">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-gray-500 dark:text-gray-400">
                    Draft: Not visible to customers<br />
                    Published: Visible on store<br />
                    Archived: Hidden from store
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black">
            <h4 className="font-semibold text-gray-900 dark:text-white">Product Flags</h4>

            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-gray-700 dark:text-gray-300">Featured</FormLabel>
                    <FormDescription className="text-gray-500 dark:text-gray-400">Display in featured products section</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                      className="data-[state=checked]:bg-gray-900 dark:data-[state=checked]:bg-gray-700"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_bestseller"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-gray-700 dark:text-gray-300">Bestseller</FormLabel>
                    <FormDescription className="text-gray-500 dark:text-gray-400">Mark as a best-selling product</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                      className="data-[state=checked]:bg-gray-900 dark:data-[state=checked]:bg-gray-700"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_new"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-gray-700 dark:text-gray-300">New Arrival</FormLabel>
                    <FormDescription className="text-gray-500 dark:text-gray-400">Mark as a new product</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                      className="data-[state=checked]:bg-gray-900 dark:data-[state=checked]:bg-gray-700"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SEO Section */}
        <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Optimize your product for search engines</p>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="meta_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Meta Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SEO-optimized title for search engines"
                      {...field}
                      value={field.value || ""}
                      disabled={isSubmitting}
                      className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-500 dark:text-gray-400">
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
                  <FormLabel className="text-gray-700 dark:text-gray-300">Meta Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description for search engine results"
                      className="min-h-[80px] border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      {...field}
                      value={field.value || ""}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-500 dark:text-gray-400">
                    Appears in search results below the title (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </Button>
          )}
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
            className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            size="lg"
            className="min-w-[200px] bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUpdateMode ? "Updating Product..." : "Creating Product..."}
              </>
            ) : (
              isUpdateMode ? "Update Product" : "Create Product"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}