// app/dashboard/variants/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Package, Tag, ArrowLeft, Loader2, Edit, Trash2, DollarSign, Box, Ruler, Image as ImageIcon, Star, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ActionsDropdown, type ActionItem } from '@/widgets/actions-dropdown/ActionsDropdown';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import ProductVariantForm from '@/app/dashboard/products/(components)/ProductVariantForm';
import Image from 'next/image';
import { useState } from 'react';
import { formatCurrency } from '@/lib/currency';

interface VariantImage {
    id: string;
    url: string;
    alt_text: string;
    type: string;
    order: number;
}

interface VariantData {
    id: string;
    sku: string;
    price: number;
    discount_amount: number;
    discounted_price: number;
    stock: number;
    attributes: Record<string, string>;
    is_default: boolean;
    is_active: boolean;
    low_stock_threshold: number;
    weight?: number;
    height?: number;
    width?: number;
    depth?: number;
    images: VariantImage[];
    product: {
        id: string;
        title: string;
        slug: string;
        status?: string;
        category?: {
            id: string;
            name: string;
        };
    };
    created_at: string;
    updated_at: string;
}

const fetchVariantById = async (variantId: string): Promise<VariantData> => {
    const response = await securityAxios.get(endpoints.products.adminGetVariantDetails.replace(":id", variantId));
    if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch variant");
    }
    return response.data.data;
};

// Bulk action for single variant
const updateVariantStatus = async (variantId: string, action: string) => {
    const response = await securityAxios.post(endpoints.products.adminBulkVariantActions, {
        action,
        variant_ids: [variantId],
    });
    return response.data;
};

export default function VariantDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const variantId = params?.id as string;

    const [editingVariant, setEditingVariant] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: variant, isLoading, isError, error } = useQuery<VariantData, Error>({
        queryKey: ["variant-detail", variantId],
        queryFn: () => fetchVariantById(variantId),
        enabled: !!variantId,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleToggleActive = async () => {
        if (!variant) return;
        setIsSubmitting(true);
        try {
            const response = await updateVariantStatus(variant.id, variant.is_active ? 'deactivate' : 'activate');
            if (response.success) {
                toast.success(`Variant ${variant.is_active ? 'deactivated' : 'activated'} successfully`);
                queryClient.invalidateQueries({ queryKey: ["variant-detail", variantId] });
                queryClient.invalidateQueries({ queryKey: ['admin-variants'] });
            } else {
                toast.error(response.message || "Failed to update status");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleDefault = async () => {
        if (!variant) return;
        setIsSubmitting(true);
        try {
            const response = await updateVariantStatus(variant.id, variant.is_default ? 'unset_default' : 'set_default');
            if (response.success) {
                toast.success(`Variant ${variant.is_default ? 'unset as' : 'set as'} default successfully`);
                queryClient.invalidateQueries({ queryKey: ["variant-detail", variantId] });
                queryClient.invalidateQueries({ queryKey: ['admin-variants'] });
            } else {
                toast.error(response.message || "Failed to update default status");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update default status");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteVariant = async () => {
        if (!variant) return;
        if (confirm(`Delete variant "${variant.sku}"? This action cannot be undone.`)) {
            setIsSubmitting(true);
            try {
                const response = await securityAxios.delete(endpoints.products.adminDeleteVariant.replace(":id", variantId));
                if (response.data.success) {
                    toast.success(`Variant ${variant.sku} deleted successfully`);
                    router.push('/dashboard/variants');
                } else {
                    toast.error(response.data.message || "Failed to delete variant");
                }
            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to delete variant");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const getVariantActions = (variantData: VariantData): ActionItem[] => {
        const actions: ActionItem[] = [];

        actions.push({
            label: 'Edit Variant',
            icon: <Edit />,
            onClick: () => setEditingVariant(true),
            color: 'blue',
        });

        actions.push({
            label: variantData.is_active ? 'Deactivate' : 'Activate',
            icon: variantData.is_active ? <XCircle /> : <CheckCircle />,
            onClick: handleToggleActive,
            color: variantData.is_active ? 'rose' : 'emerald',
        });

        actions.push({
            label: variantData.is_default ? 'Unset as Default' : 'Set as Default',
            icon: <Star />,
            onClick: handleToggleDefault,
            color: 'amber',
        });

        actions.push({
            label: 'Delete Variant',
            icon: <Trash2 />,
            variant: 'destructive',
            onClick: handleDeleteVariant,
        });

        return actions;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-20">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                <p className="mt-4 text-sm text-muted-foreground">Loading variant details...</p>
            </div>
        );
    }

    if (isError || !variant) {
        return (
            <div className="container mx-auto py-12 px-4">
                <Card className="max-w-2xl mx-auto p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Variant Not Found</h2>
                    <p className="text-muted-foreground mb-6">
                        We couldn't find the variant you're looking for.
                    </p>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/products/variants">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Variants
                        </Link>
                    </Button>
                </Card>
            </div>
        );
    }

    const finalPrice = variant.price - variant.discount_amount;
    const isLowStock = variant.stock <= variant.low_stock_threshold && variant.stock > 0;

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            {/* Back Button */}
            <div className="mb-6">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/products/variants">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Variants
                    </Link>
                </Button>
            </div>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-bold">{variant.sku}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Product: <Link href={`/dashboard/products/${variant.product.slug}`} className="text-orange-600 hover:underline">
                                {variant.product.title}
                            </Link>
                        </p>
                    </div>
                    <ActionsDropdown
                        actions={getVariantActions(variant)}
                        maxVisible={3}
                        showLabels={true}
                        buttonSize="md"
                    />
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant={variant.is_active ? "default" : "secondary"}>
                        {variant.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {variant.is_default && <Badge className="bg-amber-500">Default Variant</Badge>}
                    {isLowStock && <Badge variant="destructive">Low Stock</Badge>}
                    {variant.stock === 0 && <Badge variant="destructive">Out of Stock</Badge>}
                </div>

                <Separator />

                {/* Pricing and Inventory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                Pricing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Original Price:</span>
                                <span className="font-medium">{formatCurrency(variant.price)}</span>
                            </div>
                            {variant.discount_amount > 0 && (
                                <>
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount:</span>
                                        <span>-{formatCurrency(variant.discount_amount)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold pt-2 border-t">
                                        <span>Final Price:</span>
                                        <span>{formatCurrency(finalPrice)}</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Box className="h-4 w-4 text-muted-foreground" />
                                Inventory
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Stock Quantity:</span>
                                <span className={`font-medium ${variant.stock === 0 ? "text-red-500" : isLowStock ? "text-amber-500" : ""}`}>
                                    {variant.stock} units
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Low Stock Threshold:</span>
                                <span>{variant.low_stock_threshold} units</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Attributes */}
                {Object.keys(variant.attributes).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Attributes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(variant.attributes).map(([key, value]) => (
                                    <div key={key} className="flex justify-between py-2 border-b last:border-0">
                                        <span className="font-medium capitalize">{key}:</span>
                                        <span className="text-muted-foreground">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Dimensions */}
                {(variant.weight || variant.height || variant.width || variant.depth) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Ruler className="h-4 w-4" />
                                Dimensions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {variant.weight && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Weight</p>
                                        <p className="font-medium">{variant.weight} kg</p>
                                    </div>
                                )}
                                {variant.height && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Height</p>
                                        <p className="font-medium">{variant.height} cm</p>
                                    </div>
                                )}
                                {variant.width && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Width</p>
                                        <p className="font-medium">{variant.width} cm</p>
                                    </div>
                                )}
                                {variant.depth && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Depth</p>
                                        <p className="font-medium">{variant.depth} cm</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Images */}
                {variant.images && variant.images.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Images
                            </CardTitle>
                            <CardDescription>{variant.images.length} image(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {variant.images.map((image) => (
                                    <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border">
                                        <Image
                                            src={image.url}
                                            alt={image.alt_text || "Variant image"}
                                            fill
                                            className="object-cover"
                                        />
                                        {image.type === 'main' && (
                                            <Badge className="absolute top-2 left-2 bg-black/70 text-white text-xs">
                                                Main
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Timestamps */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Timestamps
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Created</p>
                            <p className="font-medium">{formatDate(variant.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Updated</p>
                            <p className="font-medium">{formatDate(variant.updated_at)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Variant Dialog */}
            <CustomDialog
                title="Edit Variant"
                description="Update variant details"
                open={editingVariant}
                onOpenChange={(open) => !open && setEditingVariant(false)}
                contentWidth="max-w-[1200px]"
            >
                <ProductVariantForm
                    variantId={variant.id}
                    productId={variant.product.id}
                    onSuccess={() => {
                        setEditingVariant(false);
                        queryClient.invalidateQueries({ queryKey: ["variant-detail", variantId] });
                        queryClient.invalidateQueries({ queryKey: ['admin-variants'] });
                    }}
                    onCancel={() => setEditingVariant(false)}
                />
            </CustomDialog>
        </div>
    );
}
