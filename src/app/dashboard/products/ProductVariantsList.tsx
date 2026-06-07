'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Edit, Trash2, Star, Package, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { DataTable } from '@/widgets/Customtable/DataTable';
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import ProductVariantForm from './ProductVariantForm';

interface Variant {
    id: string;
    sku: string;
    price: number;
    discount_amount: number;
    discounted_price: number;
    stock: number;
    attributes: Record<string, string>;
    is_default: boolean;
    is_active: boolean;
    images: any[];
}

interface ProductVariantsListProps {
    productId: string;
    productTitle: string;
    onClose: () => void;
}

const fetchVariants = async (productId: string): Promise<Variant[]> => {
    const response = await securityAxios.get(endpoints.products.AdminGetProductDetails.replace(':id', productId));
    return response.data.data.variants || [];
};

const deleteVariant = async (variantId: string) => {
    const response = await securityAxios.delete(endpoints.products.adminDeleteVariant.replace(':id', variantId));
    return response.data;
};

export default function ProductVariantsList({ productId, productTitle, onClose }: ProductVariantsListProps) {
    const queryClient = useQueryClient();
    const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

    const { data: variants, isLoading, refetch } = useQuery({
        queryKey: ['product-variants', productId],
        queryFn: () => fetchVariants(productId),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteVariant,
        onSuccess: () => {
            toast.success('Variant deleted successfully');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to delete variant');
        },
    });

    const handleDelete = (variant: Variant) => {
        if (confirm(`Delete variant "${variant.sku}"? This action cannot be undone.`)) {
            deleteMutation.mutate(variant.id);
        }
    };

    const actions = [
        {
            label: 'Edit Variant',
            icon: <Edit size={14} />,
            onClick: (variant: Variant) => setEditingVariant(variant),
        },
        {
            label: 'Delete Variant',
            icon: <Trash2 size={14} />,
            variant: 'destructive' as const,
            onClick: handleDelete,
        },
    ];

    const displayConfigs = [
        {
            id: 'view-details',
            label: 'View Details',
            icon: <Package size={14} />,
            getData: (item: Variant) => item,
            excludeKeys: ['id', 'images'],
        },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4">

            <Separator />

            {variants && variants.length > 0 ? (
                <DataTable
                    data={variants.map(v => {
                        const { sku, images, ...rest } = v;
                        return { sku: v.sku, images: v.images, ...rest };
                    })}
                    displayConfigs={displayConfigs}
                    actions={actions}
                    excludeColumns={['id']}
                    dots={{
                        is_default: {
                            true: 'emerald',
                            false: 'zinc',
                        },
                        is_active: {
                            true: 'emerald',
                            false: 'rose',
                        },
                    }}
                    images={{
                        images: (variant: Variant) => {
                            if (variant.images && variant.images.length > 0) {
                                return variant.images.map(img => img.url);
                            }
                            return [];
                        }
                    }}
                    links={{
                        sku: (variant: Variant) => `/dashboard/products/variants/${variant.id}`,
                    }}
                    emptyTitle="No Variants Found"
                    emptyDescription="Add variants to this product to offer different options."
                />
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                        <Package className="h-12 w-12 text-muted-foreground" />
                        <div className="text-center">
                            <h3 className="font-semibold">No Variants Yet</h3>
                            <p className="text-sm text-muted-foreground">
                                Add variants to offer different options like colors, sizes, or models.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Edit Variant Dialog */}
            <CustomDialog
                title="Edit Variant"
                description="Update the variant details."
                open={!!editingVariant}
                onOpenChange={(open) => !open && setEditingVariant(null)}
                contentWidth="max-w-[1200px]"
            >
                {editingVariant && (
                    <ProductVariantForm
                        productId={productId}
                        variantId={editingVariant.id}
                        onSuccess={() => {
                            setEditingVariant(null);
                            refetch();
                            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                        }}
                        onCancel={() => setEditingVariant(null)}
                    />
                )}
            </CustomDialog>
        </div>
    );
}