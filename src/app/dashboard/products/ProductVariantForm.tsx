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

// 1. Define strict schema with coercion for numbers
const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  attributes: z.record(z.string(), z.string()), 
  discount_amount: z.coerce.number().default(0),
  is_default: z.boolean().default(false),
  low_stock_threshold: z.coerce.number().int().default(5),
  weight: z.coerce.number().nullish(),
  height: z.coerce.number().nullish(),
  width: z.coerce.number().nullish(),
  depth: z.coerce.number().nullish(),
});

// 2. Infer the type but rename it to avoid conflict with native FormData
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

  // 3. Initialize Form with "as any" resolver to fix the build error
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
            
            // Initialize attributes
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
      toast.error("Max 10 images allowed");
      return;
    }
    
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
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

  const onSubmit = async (data: ProductVariantFormData) => {
    try {
      setIsSubmitting(true);
      // Use window.FormData to be explicit
      const submitData = new window.FormData();
      
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

      await securityAxios.post(
        endpoints.products.createVariant.replace(":id", productId),
        submitData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      toast.success("Variant created successfully");
      form.reset();
      setImages([]);
      setImagePreviews([]);
    } catch (error: any) {
      toast.error("Submission failed. Check backend logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct) return (
    <div className="flex justify-center p-12">
      <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-xl shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Left: Attributes & Data */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold border-b pb-2">Variant Details</h3>
            
            <FormField control={form.control} name="sku" render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl><Input placeholder="SKU-123" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="stock" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {productOptions.map((option) => (
              <FormField
                key={option.key}
                control={form.control}
                name={`attributes.${option.key}` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{option.label}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder={`Select ${option.label}`} /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {option.values.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            ))}

            <FormField control={form.control} name="is_default" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <FormLabel>Set as Default Variant</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
          </div>

          {/* Right: Media Upload */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold border-b pb-2">Images</h3>
            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="variant-img" />
              <label htmlFor="variant-img" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium">Click to upload variant images</p>
                <p className="text-xs text-gray-500 mt-1">Up to 10 images, max 5MB each</p>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg border overflow-hidden">
                  <Image src={src} alt="preview" fill className="object-cover" />
                  <button 
                    type="button" 
                    onClick={() => {
                      setImages(images.filter((_, idx) => idx !== i));
                      setImagePreviews(imagePreviews.filter((_, idx) => idx !== i));
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button variant="outline" type="button" onClick={() => form.reset()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="px-8">
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
            Create Variant
          </Button>
        </div>
      </form>
    </Form>
  );
}