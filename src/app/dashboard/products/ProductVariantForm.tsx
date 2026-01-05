// "use client";

// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormDescription,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import securityAxios from "@/axios-instances/SecurityAxios";
// import { endpoints } from "@/constants/endpoints/endpoints";
// import { useState, useEffect } from "react";
// import { Switch } from "@/components/ui/switch";
// import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
// import Image from "next/image";

// const formSchema = z.object({
//   sku: z.string().min(1, { message: "SKU is required" }),
//   price: z.coerce.number().min(0, "Price must be positive"),
//   stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  
//   // Update: Explicitly define key and value types for the record
//   attributes: z.record(z.string(), z.string()).default({}),
  
//   discount_amount: z.coerce.number().min(0).default(0),
//   is_default: z.boolean().default(false),
  
//   weight: z.coerce.number().min(0).optional(),
//   height: z.coerce.number().min(0).optional(),
//   width: z.coerce.number().min(0).optional(),
//   depth: z.coerce.number().min(0).optional(),
//   low_stock_threshold: z.coerce.number().min(0).default(5),
// }).refine((data) => data.discount_amount <= data.price, {
//   message: "Discount cannot exceed price",
//   path: ["discount_amount"],
// });

// // ALWAYS use z.infer for the resolver to work correctly in strict mode
// type FormData = z.infer<typeof formSchema>;


// interface ProductOption {
//   key: string;
//   label: string;
//   values: string[];
// }

// interface Product {
//   id: string;
//   title: string;
//   options?: Record<string, string[]>;
// }

// export default function ProductVariantForm({ productId }: { productId: string }) {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoadingProduct, setIsLoadingProduct] = useState(true);
//   const [product, setProduct] = useState<Product | null>(null);
//   const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  
//   // Image upload state
//   const [images, setImages] = useState<File[]>([]);
//   const [imagePreviews, setImagePreviews] = useState<string[]>([]);
//   const [imageAltTexts, setImageAltTexts] = useState<string[]>([]);
  
//   // Initialize form with dynamic attribute fields
//   const form = useForm<FormData>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       sku: "",
//       price: 0,
//       stock: 0,
//       attributes: {},
//       discount_amount: 0,
//       is_default: false,
//       weight: undefined,
//       height: undefined,
//       width: undefined,
//       depth: undefined,
//       low_stock_threshold: 5,
//     },
//   });

//   // Fetch product details on component mount
//   useEffect(() => {
//     fetchProductDetails();
//   }, [productId]);

//   const fetchProductDetails = async () => {
//     try {
//       setIsLoadingProduct(true);
//       const response = await securityAxios.get(
//         endpoints.products.getProductDetails.replace(":id", productId)
//       );
      
//       if (response.data.success) {
//         const productData = response.data.data;
//         setProduct(productData);
        
//         // Extract product options for dynamic form fields
//         if (productData.options) {
//           const options: ProductOption[] = Object.entries(productData.options).map(([key, values]) => ({
//             key,
//             label: key.charAt(0).toUpperCase() + key.slice(1),
//             values: Array.isArray(values) ? values : [],
//           }));
//           setProductOptions(options);
          
//           // Initialize attributes object with empty values for each option
//           const initialAttributes: Record<string, string> = {};
//           options.forEach(option => {
//             initialAttributes[option.key] = "";
//           });
//           form.setValue("attributes", initialAttributes);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching product details:", error);
//       toast.error("Failed to load product details");
//     } finally {
//       setIsLoadingProduct(false);
//     }
//   };

//   // Handle image upload
//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
    
//     if (files.length + images.length > 10) {
//       toast.error("Maximum 10 images allowed");
//       return;
//     }
    
//     files.forEach((file) => {
//       // Validate file type
//       if (!file.type.startsWith('image/')) {
//         toast.error(`File ${file.name} is not an image`);
//         return;
//       }
      
//       // Validate file size (max 5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error(`File ${file.name} exceeds 5MB limit`);
//         return;
//       }
      
//       setImages(prev => [...prev, file]);
//       setImageAltTexts(prev => [...prev, ""]);
      
//       // Create preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreviews(prev => [...prev, reader.result as string]);
//       };
//       reader.readAsDataURL(file);
//     });
    
//     // Reset file input
//     e.target.value = '';
//   };

//   const removeImage = (index: number) => {
//     setImages(prev => prev.filter((_, i) => i !== index));
//     setImagePreviews(prev => prev.filter((_, i) => i !== index));
//     setImageAltTexts(prev => prev.filter((_, i) => i !== index));
//   };

//   const updateAltText = (index: number, text: string) => {
//     const newAltTexts = [...imageAltTexts];
//     newAltTexts[index] = text;
//     setImageAltTexts(newAltTexts);
//   };

//   const onSubmit = async (data: FormData) => {
//     try {
//       setIsSubmitting(true);
      
//       // Create FormData for multipart upload
//       const formData = new FormData();
      
//       // Add variant data
//       formData.append('sku', data.sku.trim());
//       formData.append('price', data.price.toString());
//       formData.append('stock', data.stock.toString());
//       formData.append('attributes', JSON.stringify(data.attributes));
//       formData.append('discount_amount', data.discount_amount.toString());
//       formData.append('is_default', data.is_default.toString());
//       formData.append('low_stock_threshold', data.low_stock_threshold.toString());
      
//       // Add optional dimensions
//       if (data.weight !== undefined) formData.append('weight', data.weight.toString());
//       if (data.height !== undefined) formData.append('height', data.height.toString());
//       if (data.width !== undefined) formData.append('width', data.width.toString());
//       if (data.depth !== undefined) formData.append('depth', data.depth.toString());
      
//       // Add images
//       images.forEach((image, index) => {
//         formData.append('images', image);
//         // Add alt text for each image
//         formData.append(`image_alt_texts[${index}]`, imageAltTexts[index] || `Image ${index + 1}`);
//       });
      
//       console.log("Submitting variant with", images.length, "images");

//       // Make POST request to create variant with images
//       const response = await securityAxios.post(
//         endpoints.products.createVariant.replace(":id", productId),
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         }
//       );

//       console.log("API Response:", response.data);

//       if (response.status === 201) {
//         const apiResponse = response.data;
        
//         if (apiResponse.success) {
//           toast.success(apiResponse.message || "Variant created successfully");
          
//           // Reset form and images
//           form.reset({
//             sku: "",
//             price: 0,
//             stock: 0,
//             attributes: form.getValues("attributes"),
//             discount_amount: 0,
//             is_default: false,
//             weight: undefined,
//             height: undefined,
//             width: undefined,
//             depth: undefined,
//             low_stock_threshold: 5,
//           });
          
//           setImages([]);
//           setImagePreviews([]);
//           setImageAltTexts([]);
//         } else {
//           toast.error(apiResponse.error || "Failed to create variant");
//         }
//       } else {
//         toast.error(`Unexpected status: ${response.status}`);
//       }
//     } catch (error: any) {
//       console.error("Error creating variant:", error);
      
//       // Handle validation errors
//       if (error?.response?.data?.errors) {
//         const validationErrors = error.response.data.errors;
        
//         // Display first validation error in toast
//         const firstErrorKey = Object.keys(validationErrors)[0];
//         const firstError = validationErrors[firstErrorKey];
        
//         if (Array.isArray(firstError)) {
//           toast.error(firstError[0]);
//         } else {
//           toast.error(firstError);
//         }
        
//         // Set form errors for specific fields
//         Object.keys(validationErrors).forEach((field) => {
//           if (field.startsWith('attributes.')) {
//             const attrField = field.replace('attributes.', '');
//             form.setError(`attributes.${attrField}` as any, {
//               type: "manual",
//               message: validationErrors[field],
//             });
//           } else {
//             const fieldName = field as keyof FormData;
//             const errorMessage = Array.isArray(validationErrors[field]) 
//               ? validationErrors[field][0] 
//               : validationErrors[field];
            
//             form.setError(fieldName, {
//               type: "manual",
//               message: errorMessage,
//             });
//           }
//         });
//       } else if (error?.response?.data?.error) {
//         toast.error(error.response.data.error);
//       } else if (error?.response?.data?.message) {
//         toast.error(error.response.data.message);
//       } else if (error?.response?.status === 401) {
//         toast.error("Please login to create variants");
//       } else if (error?.response?.status === 403) {
//         toast.error("You don't have permission to create variants");
//       } else {
//         toast.error("Failed to create variant. Please try again.");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (isLoadingProduct) {
//     return (
//       <div className="flex items-center justify-center p-8">
//         <div className="flex items-center gap-2">
//           <Loader2 className="h-4 w-4 animate-spin" />
//           <span>Loading product details...</span>
//         </div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="p-8 text-center">
//         <p className="text-muted-foreground">Product not found</p>
//       </div>
//     );
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//         {/* Product Info Banner */}
//         <div className="p-4 border rounded-lg bg-muted/50">
//           <h2 className="text-lg font-semibold">Adding Variant to: {product.title}</h2>
//           <p className="text-sm text-muted-foreground">
//             Product ID: {productId}
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Left Column - Variant Data */}
//           <div className="space-y-6">
//             <div className="space-y-4 p-6 border rounded-lg bg-card">
//               <h3 className="font-semibold">Basic Information</h3>
              
//               <FormField
//                 control={form.control}
//                 name="sku"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>SKU *</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="e.g., PROD-001-RED-L"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormDescription>
//                       Unique stock keeping unit identifier
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
              
//               <FormField
//                 control={form.control}
//                 name="price"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Price *</FormLabel>
//                     <FormControl>
//                       <div className="relative">
//                         <span className="absolute left-3 top-2.5">$</span>
//                         <Input
//                           type="number"
//                           step="0.01"
//                           min="0"
//                           className="pl-8"
//                           placeholder="0.00"
//                           {...field}
//                         />
//                       </div>
//                     </FormControl>
//                     <FormDescription>
//                       Selling price per unit
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
              
//               <FormField
//                 control={form.control}
//                 name="discount_amount"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Discount Amount</FormLabel>
//                     <FormControl>
//                       <div className="relative">
//                         <span className="absolute left-3 top-2.5">$</span>
//                         <Input
//                           type="number"
//                           step="0.01"
//                           min="0"
//                           className="pl-8"
//                           placeholder="0.00"
//                           {...field}
//                         />
//                       </div>
//                     </FormControl>
//                     <FormDescription>
//                       Discount applied to the base price
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
              
//               <FormField
//                 control={form.control}
//                 name="stock"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Stock Quantity</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         min="0"
//                         placeholder="0"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormDescription>
//                       Available units in inventory
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
              
//               <FormField
//                 control={form.control}
//                 name="low_stock_threshold"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Low Stock Threshold</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         min="0"
//                         placeholder="5"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormDescription>
//                       Alert when stock falls below this number
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
            
//             {/* Default Variant Toggle */}
//             <div className="p-6 border rounded-lg bg-card">
//               <FormField
//                 control={form.control}
//                 name="is_default"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-row items-center justify-between">
//                     <div className="space-y-0.5">
//                       <FormLabel className="text-base">Default Variant</FormLabel>
//                       <FormDescription>
//                         Set as the default variant for this product
//                       </FormDescription>
//                     </div>
//                     <FormControl>
//                       <Switch
//                         checked={field.value}
//                         onCheckedChange={field.onChange}
//                       />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//             </div>
            
//             {/* Dimensions Section */}
//             <div className="space-y-4 p-6 border rounded-lg bg-card">
//               <h3 className="font-semibold">Dimensions (Optional)</h3>
              
//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="weight"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Weight (kg)</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           step="0.01"
//                           min="0"
//                           placeholder="0.00"
//                           {...field}
//                           value={field.value || ""}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 <FormField
//                   control={form.control}
//                   name="height"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Height (cm)</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           step="0.01"
//                           min="0"
//                           placeholder="0.00"
//                           {...field}
//                           value={field.value || ""}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 <FormField
//                   control={form.control}
//                   name="width"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Width (cm)</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           step="0.01"
//                           min="0"
//                           placeholder="0.00"
//                           {...field}
//                           value={field.value || ""}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 <FormField
//                   control={form.control}
//                   name="depth"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Depth (cm)</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           step="0.01"
//                           min="0"
//                           placeholder="0.00"
//                           {...field}
//                           value={field.value || ""}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Images and Attributes */}
//           <div className="space-y-6">
//             {/* Image Upload Section */}
//             <div className="space-y-4 p-6 border rounded-lg bg-card">
//               <h3 className="font-semibold">Variant Images</h3>
//               <FormDescription>
//                 Upload images for this variant. First image will be set as main image.
//               </FormDescription>
              
//               {/* Image Upload Button */}
//               <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//                 <input
//                   type="file"
//                   id="variant-images"
//                   multiple
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   className="hidden"
//                 />
//                 <label
//                   htmlFor="variant-images"
//                   className="cursor-pointer flex flex-col items-center gap-2"
//                 >
//                   <Upload className="h-8 w-8 text-gray-400" />
//                   <span className="text-sm font-medium">Upload Images</span>
//                   <span className="text-xs text-gray-500">
//                     PNG, JPG, WebP up to 5MB each
//                   </span>
//                   <span className="text-xs text-gray-500">
//                     {images.length} of 10 images selected
//                   </span>
//                 </label>
//               </div>
              
//               {/* Image Previews */}
//               {imagePreviews.length > 0 && (
//                 <div className="space-y-4">
//                   <h4 className="text-sm font-medium">Selected Images ({imagePreviews.length})</h4>
//                   <div className="grid grid-cols-3 gap-4">
//                     {imagePreviews.map((preview, index) => (
//                       <div key={index} className="relative group">
//                         <div className="aspect-square relative overflow-hidden rounded-lg border">
//                           <Image
//                             src={preview}
//                             alt={`Preview ${index + 1}`}
//                             fill
//                             className="object-cover"
//                           />
//                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                             <Button
//                               type="button"
//                               variant="destructive"
//                               size="sm"
//                               onClick={() => removeImage(index)}
//                               className="opacity-100"
//                             >
//                               <X className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </div>
//                         <div className="mt-2">
//                           <Input
//                             type="text"
//                             placeholder="Alt text for SEO"
//                             value={imageAltTexts[index]}
//                             onChange={(e) => updateAltText(index, e.target.value)}
//                             className="text-xs"
//                           />
//                           <p className="text-xs text-gray-500 mt-1">
//                             {index === 0 ? "Main image" : "Gallery image"}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             {/* Dynamic Attributes Section */}
//             {productOptions.length > 0 ? (
//               <div className="space-y-4 p-6 border rounded-lg bg-card">
//                 <h3 className="font-semibold">Variant Attributes</h3>
//                 <FormDescription>
//                   Select values for each product option
//                 </FormDescription>
                
//                 {productOptions.map((option) => (
//                   <FormField
//                     key={option.key}
//                     control={form.control}
//                     name={`attributes.${option.key}`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{option.label}</FormLabel>
//                         <Select
//                           onValueChange={field.onChange}
//                           value={field.value}
//                         >
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder={`Select ${option.label.toLowerCase()}`} />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {option.values.map((value) => (
//                               <SelectItem key={value} value={value}>
//                                 {value}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="p-6 border rounded-lg bg-card">
//                 <p className="text-sm text-muted-foreground">
//                   This product has no options defined. Add options in product settings to create variants.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-end gap-4 pt-6">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => {
//               form.reset();
//               setImages([]);
//               setImagePreviews([]);
//               setImageAltTexts([]);
//             }}
//             disabled={isSubmitting}
//           >
//             Reset Form
//           </Button>
//           <Button 
//             type="submit" 
//             size="lg"
//             className="min-w-[200px]"
//             disabled={isSubmitting || productOptions.length === 0}
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Creating Variant...
//               </>
//             ) : (
//               "Create Variant"
//             )}
//           </Button>
//         </div>

//         {productOptions.length === 0 && (
//           <div className="text-center text-sm text-amber-600 bg-amber-50 p-4 rounded-lg">
//             Note: This product has no options defined. You need to add options to create variants.
//           </div>
//         )}
//       </form>
//     </Form>
//   );
// }
import React from 'react'

const ProductVariantForm = ({ productId }: { productId: string }) => {
  return (
    <div>ProductVariantForm{productId}</div>
  )
}

export default ProductVariantForm