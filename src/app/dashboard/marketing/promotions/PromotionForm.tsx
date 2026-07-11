'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, X, Upload, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import VariantSelector from './VariantSelector';
import { formatCurrency } from '@/lib/currency';

interface PromotionFormProps {
    promotionId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

interface PromotionItem {
    variant_id: string;
    sku: string;
    product_title: string;
    quantity: number;
    is_free: boolean;
    price: number;
    attributes?: Record<string, string>;
}

const formSchema = z.object({
    name: z.string().min(2, { message: "Promotion name must be at least 2 characters" }),
    description: z.string().optional(),
    bundle_price: z.string().min(1, { message: "Bundle price is required" }),
    starts_at: z.string().min(1, { message: "Start date is required" }),
    ends_at: z.string().optional().nullable(),
    meta_title: z.string().max(200, { message: "Meta title cannot exceed 200 characters" }).optional(),
    meta_description: z.string().max(500, { message: "Meta description cannot exceed 500 characters" }).optional(),
});

type FormData = z.input<typeof formSchema>;

// Fetch promotion for update
const fetchPromotion = async (id: string) => {
    const response = await securityAxios.get(endpoints.promotions.adminDetails.replace(':id', id));
    return response.data.data;
};

export default function PromotionForm({ promotionId, onSuccess, onCancel }: PromotionFormProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [items, setItems] = useState<PromotionItem[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [showVariantSelector, setShowVariantSelector] = useState(false);
    const [isFormReady, setIsFormReady] = useState(false);

    const queryClient = useQueryClient();
    const isUpdateMode = !!promotionId;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            bundle_price: "",
            starts_at: "",
            ends_at: "",
            meta_title: "",
            meta_description: "",
        },
    });

    // Query for single promotion (update mode)
    const { data: promotionData, isLoading: isLoadingPromotion } = useQuery({
        queryKey: ['promotion', promotionId],
        queryFn: () => fetchPromotion(promotionId!),
        enabled: isUpdateMode && !!promotionId,
        staleTime: 0,
    });

    // Set form values when data is loaded
    useEffect(() => {
        if (promotionData) {
            // Format datetime-local values
            const formatDateTimeLocal = (dateStr: string) => {
                if (!dateStr) return "";
                const date = new Date(dateStr);
                return date.toISOString().slice(0, 16);
            };

            form.setValue('name', promotionData.name || "");
            form.setValue('description', promotionData.description || "");
            form.setValue('bundle_price', promotionData.bundle_price?.toString() || "");
            form.setValue('starts_at', formatDateTimeLocal(promotionData.starts_at));
            form.setValue('ends_at', promotionData.ends_at ? formatDateTimeLocal(promotionData.ends_at) : "");
            form.setValue('meta_title', promotionData.meta_title || "");
            form.setValue('meta_description', promotionData.meta_description || "");

            // Set items
            if (promotionData.items) {
                const loadedItems = promotionData.items.map((item: any) => ({
                    variant_id: item.variant_id,
                    sku: item.sku,
                    product_title: item.product_title,
                    quantity: item.quantity,
                    is_free: item.is_free,
                    price: item.original_price,
                    attributes: item.attributes,
                }));
                setItems(loadedItems);
            }

            // Set existing images
            if (promotionData.images && promotionData.images.length > 0) {
                setExistingImages(promotionData.images);
            }

            setIsFormReady(true);
        } else if (!isUpdateMode) {
            setIsFormReady(true);
        }
    }, [promotionData, form, isUpdateMode]);

    const handleAddItem = (variant: any) => {
        // Check if variant already exists
        const exists = items.some(item => item.variant_id === variant.id);
        if (exists) {
            toast.error("This variant is already in the bundle");
            return;
        }

        setItems([
            ...items,
            {
                variant_id: variant.id,
                sku: variant.sku,
                product_title: variant.product.title,
                quantity: 1,
                is_free: false,
                price: variant.price,
                attributes: variant.attributes,
            }
        ]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemQuantityChange = (index: number, quantity: number) => {
        const newItems = [...items];
        newItems[index].quantity = quantity;
        setItems(newItems);
    };

    const handleItemFreeToggle = (index: number, isFree: boolean) => {
        const newItems = [...items];
        newItems[index].is_free = isFree;
        setItems(newItems);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Validate file size and type
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 5MB limit`);
                return false;
            }
            return true;
        });

        setImages([...images, ...validFiles]);

        const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
        setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
        e.target.value = '';
    };

    const handleRemoveNewImage = (index: number) => {
        URL.revokeObjectURL(imagePreviewUrls[index]);
        setImages(images.filter((_, i) => i !== index));
        setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (imageId: string) => {
        setExistingImages(existingImages.filter(img => img.id !== imageId));
    };

    const createMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const formData = new FormData();
            formData.append('data', JSON.stringify({
                name: data.name.trim(),
                description: data.description?.trim() || "",
                bundle_price: parseFloat(data.bundle_price),
                starts_at: data.starts_at,
                ends_at: data.ends_at || null,
                meta_title: data.meta_title?.trim() || "",
                meta_description: data.meta_description?.trim() || "",
                items: items.map(item => ({
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    is_free: item.is_free,
                })),
            }));

            images.forEach(image => {
                formData.append('images', image);
            });

            const response = await securityAxios.post(endpoints.promotions.create, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success("Promotion created successfully");
            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
            form.reset();
            setItems([]);
            setImages([]);
            setExistingImages([]);
            setImagePreviewUrls([]);
            onSuccess?.();
        },
        onError: (error: any) => {
            console.error("Create error:", error);
            toast.error(error?.response?.data?.message || "Failed to create promotion");
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const formData = new FormData();

            // Build update payload
            const updateData: any = {
                name: data.name.trim(),
                description: data.description?.trim() || "",
                bundle_price: parseFloat(data.bundle_price),
                starts_at: data.starts_at,
                ends_at: data.ends_at || null,
                meta_title: data.meta_title?.trim() || "",
                meta_description: data.meta_description?.trim() || "",
                items: items.map(item => ({
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    is_free: item.is_free,
                })),
            };

            // Get IDs of images to keep (existing images not removed)
            const keepImageIds = existingImages.map(img => img.id);
            if (keepImageIds.length > 0) {
                updateData.keep_image_ids = keepImageIds;
            }

            formData.append('data', JSON.stringify(updateData));

            // Add new images
            images.forEach(image => {
                formData.append('images', image);
            });

            // Use POST with _method=PUT for update with files
            formData.append('_method', 'PUT');

            const response = await securityAxios.post(
                endpoints.promotions.update.replace(':id', promotionId!),
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data;
        },
        onSuccess: () => {
            toast.success("Promotion updated successfully");
            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
            queryClient.invalidateQueries({ queryKey: ['promotion', promotionId] });
            onSuccess?.();
        },
        onError: (error: any) => {
            console.error("Update error:", error);
            toast.error(error?.response?.data?.message || "Failed to update promotion");
        },
    });

    const onSubmit = (data: FormData) => {
        if (items.length === 0) {
            toast.error("At least one item is required");
            return;
        }

        if (isUpdateMode) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const isLoading = (isUpdateMode && !isFormReady) || isLoadingPromotion;

    const totalOriginalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const bundlePrice = parseFloat(form.watch('bundle_price')) || 0;
    const savings = totalOriginalPrice - bundlePrice;
    const savingsPercentage = totalOriginalPrice > 0 ? (savings / totalOriginalPrice * 100).toFixed(1) : 0;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-6 p-6 border rounded-lg bg-card">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {isUpdateMode ? "Edit Promotion" : "Create Promotion"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {isUpdateMode ? "Update the promotion details" : "Create a new bundle deal"}
                        </p>
                    </div>

                    {/* Basic Information */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Promotion Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Summer Bundle Sale" {...field} disabled={isSubmitting} />
                                </FormControl>
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
                                    <Textarea placeholder="Describe your promotion..." rows={3} {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="bundle_price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bundle Price *</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    {items.length > 0 && (
                                        <FormDescription>
                                            Original: {formatCurrency(totalOriginalPrice)} | Savings: {formatCurrency(savings)} ({savingsPercentage}%)
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="starts_at"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date *</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ends_at"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Date (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} value={field.value || ""} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Items Section */}
                <div className="space-y-4 p-6 border rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">Bundle Items</h3>
                            <p className="text-sm text-muted-foreground">Products included in this bundle</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowVariantSelector(true)}>
                            <Plus size={14} className="mr-1" />
                            Add Item
                        </Button>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                            <Package size={40} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500">No items added yet</p>
                            <p className="text-sm text-gray-400">Click "Add Item" to include products in this bundle</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{item.product_title}</p>
                                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                        {item.attributes && Object.entries(item.attributes).map(([key, val]) => (
                                            <span key={key} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded mr-1">
                                                {key}: {val}
                                            </span>
                                        ))}
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm">Quantity:</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemQuantityChange(idx, parseInt(e.target.value) || 1)}
                                                    className="w-20 h-8"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={item.is_free}
                                                    onCheckedChange={(checked) => handleItemFreeToggle(idx, checked as boolean)}
                                                    id={`free-${idx}`}
                                                    disabled={isSubmitting}
                                                />
                                                <Label htmlFor={`free-${idx}`} className="text-sm cursor-pointer">Free Item</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-900 dark:text-white">{formatCurrency(item.price)} each</p>
                                        <p className="text-sm text-gray-500">Total: {formatCurrency(item.price * item.quantity)}</p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveItem(idx)}
                                            className="mt-1 text-rose-600 hover:text-rose-700"
                                            disabled={isSubmitting}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Images Section */}
                <div className="space-y-4 p-6 border rounded-lg">
                    <div>
                        <h3 className="text-lg font-semibold">Promotion Images</h3>
                        <p className="text-sm text-muted-foreground">Upload images for the promotion banner</p>
                    </div>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div className="flex flex-wrap gap-4">
                            {existingImages.map((img) => (
                                <div key={img.id} className="relative">
                                    <img src={img.url} alt={img.alt_text} className="w-24 h-24 object-cover rounded-lg border" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(img.id)}
                                        className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1"
                                        disabled={isSubmitting}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New Images Preview */}
                    <div className="flex flex-wrap gap-4">
                        {imagePreviewUrls.map((url, idx) => (
                            <div key={`new-${idx}`} className="relative">
                                <img src={url} alt={`Preview ${idx}`} className="w-24 h-24 object-cover rounded-lg border" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveNewImage(idx)}
                                    className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        <label className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                            <Upload size={20} className="text-gray-400" />
                            <span className="text-xs text-gray-500 mt-1">Upload</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={isSubmitting}
                            />
                        </label>
                    </div>
                </div>

                {/* Advanced Options (SEO) */}
                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced} className="border rounded-lg">
                    <div className="p-6">
                        <CollapsibleTrigger asChild>
                            <Button type="button" variant="ghost" className="w-full justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Advanced Options</h3>
                                    <p className="text-sm text-muted-foreground">SEO and metadata settings</p>
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
                                            <Input placeholder="SEO title" {...field} value={field.value || ""} disabled={isSubmitting} />
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
                                            <Textarea placeholder="SEO description" {...field} value={field.value || ""} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CollapsibleContent>
                    </div>
                </Collapsible>

                {/* Variant Selector Modal */}
                <CustomDialog
                    title="Add Product Variant"
                    description="Select a product variant to add to this bundle"
                    open={showVariantSelector}
                    onOpenChange={setShowVariantSelector}
                    contentWidth="max-w-4xl"
                >
                    <VariantSelector
                        onSelect={(variant) => {
                            handleAddItem(variant);
                            setShowVariantSelector(false);
                        }}
                        onClose={() => setShowVariantSelector(false)}
                    />
                </CustomDialog>

                {/* Form Actions */}
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
                            isUpdateMode ? "Update Promotion" : "Create Promotion"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
