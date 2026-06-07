// app/dashboard/products/ProductVariantForm.tsx
'use client';

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
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { CustomSelect, selectField } from "@/widgets/custom-select/CustomSelect";

// Schema with all fields
const variantSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  attributes: z.record(z.string(), z.string()),
  discount_amount: z.coerce.number().min(0).default(0),
  is_default: z.boolean().default(false),
  low_stock_threshold: z.coerce.number().int().min(0).default(5),
  weight: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
  width: z.coerce.number().min(0).optional(),
  depth: z.coerce.number().min(0).optional(),
});

type ProductVariantFormData = z.infer<typeof variantSchema>;

interface ProductOption {
  key: string;
  label: string;
  values: string[];
}

interface Product {
  id: string;
  title: string;
  options?: Record<string, string[]> | string;
}

interface ProductVariantFormProps {
  productId?: string;
  variantId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Fetch all products
const fetchAllProducts = async (): Promise<Product[]> => {
  const response = await securityAxios.get(endpoints.products.adminListProducts);
  return response.data.data.products || [];
};

// Fetch product details
const fetchProductDetails = async (id: string): Promise<any> => {
  const response = await securityAxios.get(endpoints.products.AdminGetProductDetails.replace(":id", id));
  return response.data.data;
};

// Fetch variant details
const fetchVariantDetails = async (id: string): Promise<any> => {
  const response = await securityAxios.get(
    endpoints.products.adminGetVariantDetails?.replace(":id", id) || `/api/products/admin/variants/${id}/`
  );
  return response.data.data;
};

// Create variant mutation
const createVariant = async (productId: string, data: FormData): Promise<any> => {
  const response = await securityAxios.post(
    endpoints.products.adminCreateVariant.replace(":id", productId),
    data,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

// Update variant mutation
const updateVariant = async (variantId: string, data: FormData): Promise<any> => {
  const response = await securityAxios.put(
    endpoints.products.adminUpdateVariant?.replace(":id", variantId) || `/api/products/admin/variants/${variantId}/update/`,
    data,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

export default function ProductVariantForm({ productId: propProductId, variantId, onSuccess, onCancel }: ProductVariantFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageAltTexts, setImageAltTexts] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);
  const [attributeSelections, setAttributeSelections] = useState<Record<string, selectField | undefined>>({});
  const [isFormReady, setIsFormReady] = useState(false);

  const queryClient = useQueryClient();
  const isUpdateMode = !!variantId;
  const hasPreSelectedProduct = !!propProductId;

  const form = useForm<ProductVariantFormData>({
    resolver: zodResolver(variantSchema) as any,
    defaultValues: {
      product_id: propProductId || "",
      sku: "",
      price: 0,
      stock: 0,
      attributes: {},
      discount_amount: 0,
      is_default: false,
      low_stock_threshold: 5,
      weight: undefined,
      height: undefined,
      width: undefined,
      depth: undefined,
    },
  });

  const watchProductId = form.watch("product_id");
  const currentProductId = watchProductId || propProductId;

  // Query for products list (only when no product is pre-selected and not in update mode)
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: [endpoints.products.adminListProducts],
    queryFn: fetchAllProducts,
    enabled: !hasPreSelectedProduct && !isUpdateMode,
    staleTime: 5 * 60 * 1000,
  });

  // Query for product details
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: [endpoints.products.AdminGetProductDetails, currentProductId],
    queryFn: () => fetchProductDetails(currentProductId!),
    enabled: !!currentProductId,
    staleTime: 0,
  });

  // Query for variant details (update mode only)
  const { data: variantData, isLoading: isLoadingVariant } = useQuery({
    queryKey: [endpoints.products.adminGetVariantDetails, variantId],
    queryFn: () => fetchVariantDetails(variantId!),
    enabled: isUpdateMode && !!variantId,
    staleTime: 0,
  });

  // Helper function to parse product options
  const parseProductOptions = (optionsData: any): Record<string, string[]> => {
    if (!optionsData) return {};

    if (typeof optionsData === 'object' && !Array.isArray(optionsData)) {
      return optionsData;
    }

    if (typeof optionsData === 'string') {
      try {
        const parsed = JSON.parse(optionsData);
        return parsed;
      } catch (e) {
        console.error("Error parsing options JSON:", e);
        return {};
      }
    }

    return {};
  };

  // Set product options when product data loads
  useEffect(() => {
    if (productData) {
      const parsedOptions = parseProductOptions(productData.options);

      if (parsedOptions && Object.keys(parsedOptions).length > 0) {
        const options: ProductOption[] = Object.entries(parsedOptions).map(([key, values]) => ({
          key,
          label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          values: Array.isArray(values) ? values : [],
        }));

        const initialAttributes: Record<string, string> = {};
        const initialSelections: Record<string, selectField | undefined> = {};

        options.forEach(option => {
          initialAttributes[option.key] = "";
          initialSelections[option.key] = undefined;
        });

        form.setValue("attributes", initialAttributes);
        setAttributeSelections(initialSelections);
      }
    }
  }, [productData, form]);

  // Populate form when variant data is loaded (update mode)
  useEffect(() => {
    if (variantData && productData) {
      form.reset({
        product_id: variantData.product.id,
        sku: variantData.sku || "",
        price: variantData.price || 0,
        stock: variantData.stock || 0,
        attributes: variantData.attributes || {},
        discount_amount: variantData.discount_amount || 0,
        is_default: variantData.is_default || false,
        low_stock_threshold: variantData.low_stock_threshold || 5,
        weight: variantData.weight,
        height: variantData.height,
        width: variantData.width,
        depth: variantData.depth,
      });

      // Set attribute selections for update mode
      if (variantData.attributes && productData?.options) {
        const parsedOptions = parseProductOptions(productData.options);
        const selections: Record<string, selectField | undefined> = {};
        Object.keys(parsedOptions).forEach(optionKey => {
          const value = variantData.attributes[optionKey];
          if (value) {
            selections[optionKey] = {
              id: value,
              label: value,
              value: value
            };
          }
        });
        setAttributeSelections(selections);
      }

      if (variantData.images && variantData.images.length > 0) {
        setExistingImages(variantData.images);
        setImagePreviews(variantData.images.map((img: any) => img.url));
      }

      setIsFormReady(true);
    } else if (!isUpdateMode && productData) {
      setIsFormReady(true);
    }
  }, [variantData, productData, form, isUpdateMode]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: FormData }) => createVariant(productId, data),
    onSuccess: () => {
      toast.success("Variant created successfully");
      queryClient.invalidateQueries({ queryKey: [endpoints.products.adminListProducts] });
      queryClient.invalidateQueries({ queryKey: [endpoints.products.AdminGetProductDetails] });
      queryClient.invalidateQueries({ queryKey: [endpoints.products.adminListVariants] });

      form.reset({
        product_id: propProductId || "",
        sku: "",
        price: 0,
        stock: 0,
        attributes: {},
        discount_amount: 0,
        is_default: false,
        low_stock_threshold: 5,
        weight: undefined,
        height: undefined,
        width: undefined,
        depth: undefined,
      });
      setImages([]);
      setImagePreviews([]);
      setImageAltTexts([]);
      setAttributeSelections({});
      setRemoveImageIds([]);

      onSuccess?.();
    },
    onError: (error: any) => {
      const errorData = error?.response?.data;
      if (errorData?.errors) {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          form.setError(field as any, {
            message: Array.isArray(messages) ? messages[0] : String(messages),
          });
        });
        toast.error("Please fix the validation errors");
      } else {
        toast.error(errorData?.message || "Failed to create variant");
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: FormData }) => updateVariant(variantId, data),
    onSuccess: () => {
      toast.success("Variant updated successfully");
      // Invalidate all product and variant related queries
      queryClient.invalidateQueries({ queryKey: [endpoints.products.adminListProducts] });
      queryClient.invalidateQueries({ queryKey: [endpoints.products.AdminGetProductDetails] });
      queryClient.invalidateQueries({ queryKey: [endpoints.products.adminListVariants] });
      queryClient.invalidateQueries({ queryKey: [endpoints.products.adminGetVariantDetails, variantId] });

      onSuccess?.();
    },
    onError: (error: any) => {
      const errorData = error?.response?.data;
      if (errorData?.errors) {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          form.setError(field as any, {
            message: Array.isArray(messages) ? messages[0] : String(messages),
          });
        });
        toast.error("Please fix the validation errors");
      } else {
        toast.error(errorData?.message || "Failed to update variant");
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Loading state - only shows when necessary (matches ProductForm pattern)
  if ((isUpdateMode && !isFormReady) || isLoadingVariant || (isUpdateMode && isLoadingProduct)) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    );
  }

  const handleAttributeChange = (optionKey: string, selectedItem: selectField) => {
    const currentAttributes = form.getValues("attributes");
    form.setValue("attributes", {
      ...currentAttributes,
      [optionKey]: selectedItem.value
    });

    setAttributeSelections(prev => ({
      ...prev,
      [optionKey]: selectedItem
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length + existingImages.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    validFiles.forEach((file) => {
      setImages(prev => [...prev, file]);
      setImageAltTexts(prev => [...prev, ""]);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeExistingImage = (imageId: string, index: number) => {
    setRemoveImageIds(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageAltTexts(prev => prev.filter((_, i) => i !== index));
  };

  const updateExistingAltText = (index: number, text: string) => {
    const updated = [...existingImages];
    updated[index].alt_text = text;
    setExistingImages(updated);
  };

  const updateNewAltText = (index: number, text: string) => {
    const updated = [...imageAltTexts];
    updated[index] = text;
    setImageAltTexts(updated);
  };

  const onSubmit = (data: ProductVariantFormData) => {
    const submitData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'attributes') {
        submitData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        submitData.append(key, value.toString());
      }
    });

    images.forEach((image, index) => {
      submitData.append('images', image);
      submitData.append(`image_alt_texts[${index}]`, imageAltTexts[index] || `Image ${index + 1}`);
    });

    if (removeImageIds.length > 0) {
      submitData.append('remove_images', JSON.stringify(removeImageIds));
    }

    if (isUpdateMode && variantId) {
      updateMutation.mutate({ variantId, data: submitData });
    } else {
      createMutation.mutate({ productId: data.product_id, data: submitData });
    }
  };

  const productOptions: ProductOption[] = productData?.options ?
    Object.entries(parseProductOptions(productData.options)).map(([key, values]) => ({
      key,
      label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      values: Array.isArray(values) ? values : [],
    })) : [];

  const hasAttributes = productOptions.length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isUpdateMode ? "Edit Product Variant" : "Create Product Variant"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isUpdateMode ? "Update variant for" : "Add a new variant to"} {productData?.title || "a product"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Variant Information</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure the basic details for this variant</p>
              </div>

              {/* Product Selection - Only show if no pre-selected product and not in update mode */}
              {!hasPreSelectedProduct && !isUpdateMode && (
                <FormField
                  control={form.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Product *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || isLoadingProducts}>
                        <FormControl>
                          <SelectTrigger className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white">
                            {isLoadingProducts ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading products...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder="Select a product" />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                          {products?.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-900">
                              {p.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-gray-500 dark:text-gray-400">
                        Select the product this variant belongs to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Show selected product info when pre-selected or in update mode */}
              {(hasPreSelectedProduct || isUpdateMode) && productData && (
                <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Product</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{productData.title}</p>
                </div>
              )}

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">SKU *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., PROD-001-RED-L"
                        {...field}
                        disabled={isSubmitting}
                        className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500 dark:text-gray-400">
                      Stock Keeping Unit - unique identifier for this variant
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Price *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isSubmitting}
                          className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Stock Quantity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isSubmitting}
                          className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discount_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Discount Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isSubmitting}
                          className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="low_stock_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Low Stock Threshold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="5"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isSubmitting}
                          className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500 dark:text-gray-400">
                        Alert when stock falls below this number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Attributes with CustomSelect */}
            {hasAttributes && (
              <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Variant Attributes</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Select values for each product attribute</p>
                </div>
                {productOptions.map((option) => {
                  const selectItems: selectField[] = option.values.map(value => ({
                    id: value,
                    label: value,
                    value: value
                  }));

                  return (
                    <div key={option.key} className="space-y-2">
                      <FormLabel className="text-gray-700 dark:text-gray-300">{option.label} *</FormLabel>
                      <CustomSelect
                        selectField={attributeSelections[option.key]}
                        items={selectItems}
                        placeholder={`Select ${option.label.toLowerCase()}`}
                        onValueChange={(selectedItem) => handleAttributeChange(option.key, selectedItem)}
                      />
                      {form.formState.errors.attributes?.[option.key] && (
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                          {form.formState.errors.attributes[option.key]?.message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dimensions */}
            <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dimensions (Optional)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Physical measurements for shipping calculations</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isSubmitting}
                        className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Height (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isSubmitting}
                        className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="width" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Width (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isSubmitting}
                        className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="depth" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Depth (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isSubmitting}
                        className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Default Variant */}
            <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black">
              <FormField control={form.control} name="is_default" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-gray-700 dark:text-gray-300">Default Variant</FormLabel>
                    <FormDescription className="text-gray-500 dark:text-gray-400">
                      Set as the default variant for this product
                    </FormDescription>
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
              )} />
            </div>
          </div>

          {/* Right Column: Images */}
          <div className="space-y-6">
            <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Variant Images</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload images specific to this variant</p>
              </div>

              <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="variant-img"
                  disabled={isSubmitting}
                />
                <label htmlFor="variant-img" className="cursor-pointer flex flex-col items-center gap-3">
                  <Upload className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload images</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, WebP up to 5MB each</p>
                  </div>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Images ({imagePreviews.length}/10)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative">
                        <div className="aspect-square relative rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900/30">
                          <Image src={src} alt={`Preview ${i + 1}`} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              if (i < existingImages.length) {
                                removeExistingImage(existingImages[i].id, i);
                              } else {
                                removeNewImage(i - existingImages.length);
                              }
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <Input
                          type="text"
                          placeholder="Alt text"
                          value={
                            i < existingImages.length
                              ? existingImages[i].alt_text || ""
                              : imageAltTexts[i - existingImages.length] || ""
                          }
                          onChange={(e) => {
                            if (i < existingImages.length) {
                              updateExistingAltText(i, e.target.value);
                            } else {
                              updateNewAltText(i - existingImages.length, e.target.value);
                            }
                          }}
                          className="text-sm h-8 mt-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                          disabled={isSubmitting}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
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
              form.reset({
                product_id: propProductId || "",
                sku: "",
                price: 0,
                stock: 0,
                attributes: {},
                discount_amount: 0,
                is_default: false,
                low_stock_threshold: 5,
                weight: undefined,
                height: undefined,
                width: undefined,
                depth: undefined,
              });
              setImages([]);
              setImagePreviews([]);
              setImageAltTexts([]);
              setAttributeSelections({});
              setRemoveImageIds([]);
            }}
            disabled={isSubmitting}
            className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
          >
            Reset
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
                {isUpdateMode ? "Updating Variant..." : "Creating Variant..."}
              </>
            ) : (
              isUpdateMode ? "Update Variant" : "Create Variant"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}