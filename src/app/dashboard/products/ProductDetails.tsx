'use client';

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Star, Package, Tag, Clock, Calendar, CheckCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface ProductDetailCardProps {
    productId: string;
    onClose?: () => void;
}

const fetchProductById = async (productId: string): Promise<ProductData> => {
    if (!productId) throw new Error("Product ID is required");

    const response = await securityAxios.get(
        endpoints.products.getProductDetails.replace(":id", productId)
    );

    console.log("API Response:", response.data);

    if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch product");
    }

    return response.data.data;
};

export default function ProductDetailCard({ productId, onClose }: ProductDetailCardProps) {
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
            case "published": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case "draft": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
            case "archived": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
            default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                <p className="mt-4 text-muted-foreground">Loading product details...</p>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <Card className="max-w-2xl mx-auto p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h2>
                <p className="text-muted-foreground mb-6">
                    We couldn't find the product you're looking for.
                </p>
                <Button onClick={onClose} variant="outline">Close</Button>
            </Card>
        );
    }

    return (
        <div className="space-y-6 max-h-[80vh] overflow-y-auto p-2">
            {/* Header with close button */}
            <div className="flex justify-between items-start  top-0 bg-white dark:bg-[#09090b] z-10 pb-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold">{product.title}</h1>
                    <p className="text-sm text-muted-foreground">Slug: {product.slug}</p>
                </div>

            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(product.status)}>
                    {product.status || 'Unknown'}
                </Badge>
                {product.is_featured && <Badge variant="default">Featured</Badge>}
                {product.is_bestseller && <Badge variant="default" className="bg-amber-500">Bestseller</Badge>}
                {product.is_new && <Badge variant="default" className="bg-emerald-500">New Arrival</Badge>}
            </div>

            <Separator />

            {/* Rating */}
            {product.average_rating > 0 && (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(product.average_rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                        ))}
                    </div>
                    <span className="font-medium">{product.average_rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({product.total_reviews} reviews)</span>
                </div>
            )}

            {/* Description and Category */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                            {product.description || 'No description provided.'}
                        </p>
                    </CardContent>
                </Card>

                {product.category?.name && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{product.category.name}</p>
                            {product.category.slug && (
                                <p className="text-sm text-muted-foreground">Slug: {product.category.slug}</p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Features
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {product.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Variant Options */}
            {product.options && Object.keys(product.options).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Variant Options
                        </CardTitle>
                        <CardDescription>Available options for product variants</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            {Object.entries(product.options).map(([key, values]) => (
                                <div key={key}>
                                    <p className="font-medium capitalize mb-2">{key}:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {values.map((value) => (
                                            <Badge key={value} variant="outline">{value}</Badge>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Variants ({product.variants.length})</CardTitle>
                        <CardDescription>All available product variants</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Default</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Attributes</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Final Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {product.variants.map((variant) => {
                                    const finalPrice = variant.price - (variant.discount_amount || 0);
                                    return (
                                        <TableRow key={variant.id}>
                                            <TableCell>
                                                {variant.is_default && <Badge variant="default">Default</Badge>}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.entries(variant.attributes || {}).map(([k, v]) => (
                                                        <Badge key={k} variant="secondary" className="text-xs">
                                                            {k}: {v}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>${variant.price.toFixed(2)}</TableCell>
                                            <TableCell>
                                                {variant.discount_amount > 0 ? `-$${variant.discount_amount.toFixed(2)}` : "-"}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                ${finalPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <span className={variant.stock === 0 ? "text-red-500" : ""}>
                                                    {variant.stock}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={variant.is_active ? "default" : "secondary"}>
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Timestamps
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">{formatDate(product.created_at)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Updated</p>
                        <p className="font-medium">{formatDate(product.updated_at)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Published</p>
                        <p className="font-medium">
                            {product.published_at ? formatDate(product.published_at) : "Not published"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* SEO Metadata */}
            {(product.meta_title || product.meta_description) && (
                <Card>
                    <CardHeader>
                        <CardTitle>SEO Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {product.meta_title && (
                            <div>
                                <p className="text-sm text-muted-foreground">Meta Title</p>
                                <p className="font-medium">{product.meta_title}</p>
                            </div>
                        )}
                        {product.meta_description && (
                            <div>
                                <p className="text-sm text-muted-foreground">Meta Description</p>
                                <p className="text-sm">{product.meta_description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}