// app/dashboard/products/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Star, Package, Tag, Clock, CheckCircle, ArrowLeft, Loader2, Eye, Edit, Trash2, Plus, ShoppingCart, MapPin, CreditCard, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ActionsDropdown, type ActionItem } from '@/widgets/ActionsDropdown/ActionsDropdown';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { CustomSelect, type selectField } from '@/widgets/custom-select/CustomSelect';
import ProductForm from '../ProductForm';
import ProductVariantForm from '../ProductVariantForm';
import ProductVariantsList from '../ProductVariantsList';
import { Dispatch, SetStateAction, useState } from 'react';

interface Variant {
    id: string;
    sku: string;
    attributes: Record<string, string>;
    price: number;
    discount_amount: number;
    stock: number;
    is_default: boolean;
    is_active: boolean;
    images?: Array<{ url: string; alt_text: string; type: string }>;
}

interface Category {
    id: string | null;
    name: string | null;
    slug: string | null;
}

interface ProductData {
    id: string;
    title: string;
    slug: string;
    description: string;
    meta_title: string | null;
    meta_description: string | null;
    category: Category;
    features: string[];
    options: Record<string, string[]>;
    status: string;
    is_featured: boolean;
    is_bestseller: boolean;
    is_new: boolean;
    average_rating: number;
    total_reviews: number;
    variants: Variant[];
    created_at: string;
    updated_at: string;
    published_at: string | null;
}

const fetchProductById = async (productId: string): Promise<ProductData> => {
    if (!productId) throw new Error("Product ID is required");

    const response = await securityAxios.get(
        endpoints.products.AdminGetProductDetails.replace(":id", productId)
    );

    if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch product");
    }

    return response.data.data;
};

// Update status mutation
const updateProductStatus = async (productId: string, status: string) => {
    const response = await securityAxios.put(
        endpoints.products.adminUpdateProduct.replace(":id", productId),
        { status }
    );
    return response.data;
};

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const productId = params?.id as string;

    // State for dialogs
    const [editingProduct, setEditingProduct] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<selectField | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addingVariant, setAddingVariant] = useState(false);
    const [viewingVariants, setViewingVariants] = useState(false);

    // Status options
    const statusOptions: selectField[] = [
        { id: 'draft', label: 'Draft', value: 'draft' },
        { id: 'published', label: 'Published', value: 'published' },
        { id: 'archived', label: 'Archived', value: 'archived' },
    ];

    const {
        data: product,
        isLoading,
        isError,
        error,
    } = useQuery<ProductData, Error>({
        queryKey: ["product-detail", productId],
        queryFn: () => fetchProductById(productId),
        enabled: !!productId,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

    if (isError) {
        console.error("Product fetch error:", error);
        toast.error(error?.message || "Failed to load product details");
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "published":
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900";
            case "draft":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800";
            case "archived":
                return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900";
            default:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900";
        }
    };

    // Handle status update
    const handleUpdateStatus = async () => {
        if (!selectedStatus) {
            toast.error("Please select a status");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await updateProductStatus(productId, selectedStatus.value);
            if (response.success) {
                toast.success(`Product status updated to ${selectedStatus.label}`);
                setUpdatingStatus(false);
                setSelectedStatus(undefined);
                queryClient.invalidateQueries({ queryKey: ["product-detail", productId] });
                queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            } else {
                toast.error(response.message || "Failed to update status");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete product
    const handleDeleteProduct = async () => {
        if (confirm(`Delete product "${product?.title}"? This action cannot be undone.`)) {
            try {
                const response = await securityAxios.delete(
                    endpoints.products.adminDeleteProduct.replace(":id", productId)
                );
                if (response.data.success) {
                    toast.success(`Product ${product?.title} deleted successfully`);
                    router.push('/dashboard/products');
                } else {
                    toast.error(response.data.message || "Failed to delete product");
                }
            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to delete product");
            }
        }
    };

    // Define actions for this page
    const getProductActions = (productData: ProductData): ActionItem[] => {
        const actions: ActionItem[] = [];

        // Edit Product
        actions.push({
            label: 'Edit Product',
            icon: <Edit />,
            onClick: () => setEditingProduct(true),
            color: 'blue',
        });

        // Add Variant
        actions.push({
            label: 'Add Variant',
            icon: <Plus />,
            onClick: () => setAddingVariant(true),
            color: 'violet',
        });

        // View Variants
        if (productData.variants && productData.variants.length > 0) {
            actions.push({
                label: 'View Variants',
                icon: <Package />,
                onClick: () => setViewingVariants(true),
                color: 'amber',
            });
        }

        // Update Status
        actions.push({
            label: 'Update Status',
            icon: <PackageCheck />,
            onClick: () => setUpdatingStatus(true),
            color: 'emerald',
        });

        // Delete Product
        actions.push({
            label: 'Delete Product',
            icon: <Trash2 />,
            variant: 'destructive',
            onClick: handleDeleteProduct,
        });

        return actions;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-900 dark:text-gray-100" />
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading product details...</p>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="container mx-auto py-12 px-4">
                <Card className="max-w-2xl mx-auto p-8 text-center border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Product Not Found</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        We couldn't find the product you're looking for.
                    </p>
                    <Button asChild variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg">
                        <Link href="/dashboard/products">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Products
                        </Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Back Button */}
            <div className="mb-6">
                <Button asChild variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg">
                    <Link href="/dashboard/products">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Products
                    </Link>
                </Button>
            </div>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.title}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Slug: {product.slug}</p>
                    </div>
                    <ActionsDropdown
                        actions={getProductActions(product)}
                        maxVisible={4}
                        showLabels={true}
                        buttonSize="md"
                    />
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                    <Badge className={`${getStatusColor(product.status)} rounded-lg px-3 py-1 text-xs font-medium`}>
                        {product.status || 'Unknown'}
                    </Badge>
                    {product.is_featured && (
                        <Badge className="bg-gray-900 text-white dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-1 text-xs font-medium">
                            Featured
                        </Badge>
                    )}
                    {product.is_bestseller && (
                        <Badge className="bg-gray-900 text-white dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-1 text-xs font-medium">
                            Bestseller
                        </Badge>
                    )}
                    {product.is_new && (
                        <Badge className="bg-gray-900 text-white dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-1 text-xs font-medium">
                            New Arrival
                        </Badge>
                    )}
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-800" />

                {/* Rating */}
                {product.average_rating > 0 && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.floor(product.average_rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300 dark:text-gray-700"
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{product.average_rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">({product.total_reviews} reviews)</span>
                    </div>
                )}

                {/* Description and Category */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white text-lg font-semibold">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                                {product.description || 'No description provided.'}
                            </p>
                        </CardContent>
                    </Card>

                    {product.category?.name && (
                        <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg font-semibold">
                                    <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium text-gray-900 dark:text-white">{product.category.name}</p>
                                {product.category.slug && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Slug: {product.category.slug}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                    <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg font-semibold">
                                <CheckCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                Features
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {product.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Variant Options */}
                {product.options && Object.keys(product.options).length > 0 && (
                    <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg font-semibold">
                                <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                Variant Options
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                                Available options for product variants
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {Object.entries(product.options).map(([key, values]) => (
                                    <div key={key}>
                                        <p className="font-medium capitalize mb-2 text-gray-900 dark:text-white">{key}:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {values.map((value) => (
                                                <Badge key={value} variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-1 text-xs">
                                                    {value}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Variants Table */}
                {product.variants && product.variants.length > 0 && (
                    <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white text-lg font-semibold">Variants ({product.variants.length})</CardTitle>
                            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                                All available product variants
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-gray-200 dark:border-gray-800 hover:bg-transparent">
                                        <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400">Default</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400">SKU</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400">Attributes</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400">Price</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400">Discount</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400">Final Price</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400">Stock</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {product.variants.map((variant) => {
                                        const finalPrice = variant.price - (variant.discount_amount || 0);
                                        return (
                                            <TableRow key={variant.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                                <TableCell>
                                                    {variant.is_default && (
                                                        <Badge className="bg-gray-900 text-white dark:bg-gray-800 dark:text-gray-100 rounded-lg px-2 py-0.5 text-[10px] font-medium">
                                                            Default
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-gray-900 dark:text-white">{variant.sku}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.entries(variant.attributes || {}).map(([k, v]) => (
                                                            <Badge key={k} variant="secondary" className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-0.5 text-[10px]">
                                                                {k}: {v}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-900 dark:text-white">${variant.price.toFixed(2)}</TableCell>
                                                <TableCell className="text-sm text-gray-900 dark:text-white">
                                                    {variant.discount_amount > 0 ? `-$${variant.discount_amount.toFixed(2)}` : "-"}
                                                </TableCell>
                                                <TableCell className="font-semibold text-sm text-gray-900 dark:text-white">
                                                    ${finalPrice.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`text-sm ${variant.stock === 0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                                                        {variant.stock}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={variant.is_active ? "default" : "secondary"} className={`rounded-lg px-2 py-0.5 text-[10px] font-medium ${variant.is_active
                                                        ? "bg-gray-900 text-white dark:bg-gray-800 dark:text-gray-100"
                                                        : "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400"
                                                        }`}>
                                                        {variant.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Timestamps */}
                <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg font-semibold">
                            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            Timestamps
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                            <p className="font-medium text-gray-900 dark:text-white">{formatDate(product.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Updated</p>
                            <p className="font-medium text-gray-900 dark:text-white">{formatDate(product.updated_at)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Published</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {product.published_at ? formatDate(product.published_at) : "Not published"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* SEO Metadata */}
                {(product.meta_title || product.meta_description) && (
                    <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white text-lg font-semibold">SEO Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {product.meta_title && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Meta Title</p>
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">{product.meta_title}</p>
                                </div>
                            )}
                            {product.meta_description && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Meta Description</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.meta_description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Edit Product Dialog */}
            <CustomDialog
                title="Edit Product"
                description="Update the product details."
                open={editingProduct}
                onOpenChange={(open) => !open && setEditingProduct(false)}
                contentWidth="max-w-[800px]"
            >
                <ProductForm
                    productId={product.id}
                    onSuccess={() => {
                        setEditingProduct(false);
                        queryClient.invalidateQueries({ queryKey: ["product-detail", productId] });
                        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                    }}
                    onCancel={() => setEditingProduct(false)}
                />
            </CustomDialog>

            {/* Update Status Dialog */}
            <CustomDialog
                title="Update Product Status"
                description={`Update status for ${product.title}`}
                open={updatingStatus}
                onOpenChange={(open) => !open && setUpdatingStatus(false)}
                contentWidth="max-w-md"
            >
                <div className="space-y-4">
                    <CustomSelect
                        selectField={selectedStatus}
                        setSelectField={setSelectedStatus as Dispatch<SetStateAction<string | selectField | undefined>>}
                        items={statusOptions}
                        placeholder="Select status"
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setUpdatingStatus(false)}
                            className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={isSubmitting || !selectedStatus}
                            className="bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
                        >
                            {isSubmitting ? "Updating..." : "Update Status"}
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            {/* Add Variant Dialog */}
            <CustomDialog
                title="Add Product Variant"
                description="Add a new variant to this product."
                open={addingVariant}
                onOpenChange={(open) => !open && setAddingVariant(false)}
                contentWidth="max-w-[1200px]"
            >
                <ProductVariantForm
                    productId={product.id}
                    onSuccess={() => {
                        setAddingVariant(false);
                        queryClient.invalidateQueries({ queryKey: ["product-detail", productId] });
                        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                    }}
                />
            </CustomDialog>

            {/* View Variants Dialog */}
            <CustomDialog
                title="Product Variants"
                description={`Manage variants for ${product.title}`}
                open={viewingVariants}
                onOpenChange={(open) => !open && setViewingVariants(false)}
                contentWidth="max-w-[1200px]"
            >
                <ProductVariantsList
                    productId={product.id}
                    productTitle={product.title}
                    onClose={() => setViewingVariants(false)}
                />
            </CustomDialog>
        </div>
    );
}