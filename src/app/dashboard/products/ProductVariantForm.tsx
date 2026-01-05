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
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

// Schema with all fields
const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  attributes: z.record(z.string(),z.string()), 
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
  options?: Record<string, string[]>;
}

export default function ProductVariantForm({ productId }: { productId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageAltTexts, setImageAltTexts] = useState<string[]>([]);

  // Bypass TypeScript errors with 'as any' as requested
  const form = useForm<ProductVariantFormData>({
    resolver: zodResolver(variantSchema) as any,
    defaultValues: {
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

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoadingProduct(true);
        const response = await securityAxios.get(
          endpoints.products.getProductDetails.replace(":id", productId)
        );
        
        if (response.data.success) {
          const productData = response.data.data;
          setProduct(productData);
          
          if (productData.options) {
            const options: ProductOption[] = Object.entries(productData.options).map(([key, values]) => ({
              key,
              label: key.charAt(0).toUpperCase() + key.slice(1),
              values: Array.isArray(values) ? values : [],
            }));
            setProductOptions(options);
            
            const initialAttributes: Record<string, string> = {};
            options.forEach(option => {
              initialAttributes[option.key] = "";
            });
            form.setValue("attributes", initialAttributes);
          }
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Failed to load product details");
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProductDetails();
  }, [productId, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length > 10) {
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

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageAltTexts(prev => prev.filter((_, i) => i !== index));
  };

  const updateAltText = (index: number, text: string) => {
    const newAltTexts = [...imageAltTexts];
    newAltTexts[index] = text;
    setImageAltTexts(newAltTexts);
  };

  const onSubmit = async (data: ProductVariantFormData) => {
    try {
      setIsSubmitting(true);
      
      const submitData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'attributes') {
          submitData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          submitData.append(key, value.toString());
        }
      });
      
      // Add images
      images.forEach((image, index) => {
        submitData.append('images', image);
        submitData.append(`image_alt_texts[${index}]`, imageAltTexts[index] || `Image ${index + 1}`);
      });

      console.log("Submitting variant data:", data);
      console.log("Image count:", images.length);

      const response = await securityAxios.post(
        endpoints.products.createVariant.replace(":id", productId),
        submitData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        toast.success(response.data.message || "Variant created successfully");
        
        // Reset form but keep attributes structure
        form.reset({
          sku: "",
          price: 0,
          stock: 0,
          attributes: form.getValues("attributes"), // Keep attribute structure
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
      } else {
        toast.error(response.data.error || "Failed to create variant");
      }
    } catch (error: any) {
      console.error("Error creating variant:", error);
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.entries(errors).forEach(([field, messages]) => {
          const errorMessage = Array.isArray(messages) ? messages[0] : String(messages);
          form.setError(field as any, {
            type: "manual",
            message: errorMessage,
          });
        });
        toast.error("Please fix the validation errors");
      } else {
        toast.error(error.response?.data?.error || "Failed to create variant");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct) return (
    <div className="flex justify-center items-center p-12 min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        <p className="text-gray-600">Loading product details...</p>
      </div>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-xl shadow-sm border">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Create Product Variant</h2>
          <p className="text-gray-600 mt-1">Add a new variant to {product?.title}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column */}
          <div className="space-y-6">
            <div className="border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Variant Information</h3>
              
              <FormField control={form.control} name="sku" render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., PROD-001-RED-L" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="discount_amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="low_stock_threshold" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Stock Threshold</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="5"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Attributes */}
            {productOptions.length > 0 && (
              <div className="border rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold">Variant Attributes</h3>
                
                {productOptions.map((option) => (
                  <FormField
                    key={option.key}
                    control={form.control}
                    name={`attributes.${option.key}` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{option.label} *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${option.label.toLowerCase()}`} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {option.values.map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            )}

            {/* Dimensions */}
            <div className="border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Dimensions (Optional)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="width" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="depth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depth (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Default Variant */}
            <div className="border rounded-lg p-6">
              <FormField control={form.control} name="is_default" render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Default Variant</FormLabel>
                    <FormDescription>
                      Set as the default variant for this product
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )} />
            </div>
          </div>

          {/* Right Column: Images */}
          <div className="space-y-6">
            <div className="border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Variant Images</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  id="variant-img" 
                />
                <label 
                  htmlFor="variant-img" 
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <Upload className="h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Click to upload images</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 5MB each</p>
                  </div>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Selected Images ({imagePreviews.length}/10)</h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative">
                        <div className="aspect-square relative rounded-lg border overflow-hidden">
                          <Image 
                            src={src} 
                            alt={`Preview ${i + 1}`} 
                            fill 
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <Input
                          type="text"
                          placeholder="Alt text"
                          value={imageAltTexts[i]}
                          onChange={(e) => updateAltText(i, e.target.value)}
                          className="text-sm h-8 mt-2"
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
        <div className="flex justify-end gap-4 border-t pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              form.reset();
              setImages([]);
              setImagePreviews([]);
              setImageAltTexts([]);
            }}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || productOptions.length === 0} 
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Creating...
              </>
            ) : (
              "Create Variant"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}