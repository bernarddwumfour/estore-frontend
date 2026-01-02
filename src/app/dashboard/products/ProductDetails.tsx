'use client';

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import Spinner from "@/widgets/loaders/Spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Star, Package, Tag, Clock, Calendar, CheckCircle } from "lucide-react";

interface Variant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  discount_amount: number;
  stock: number;
  is_default: boolean;
  is_active: boolean;
}

interface Category {
  id: string | null;
  name: string | null;
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

interface ProductDetailDisplayProps {
  product: ProductData;
}

interface ProductData {
  id: string;
  title: string;
  slug: string;
  description: string;
  meta_title: string | null;
  meta_description: string | null;
  category: {
    id: string | null;
    name: string | null;
  };
  features: string[];
  options: Record<string, string[]>;
  status: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  average_rating: number;
  total_reviews: number;
  variants: Array<{
    id: string;
    sku: string;
    attributes: Record<string, string>;
    price: number;
    discount_amount: number;
    stock: number;
    is_default: boolean;
    is_active: boolean;
  }>;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

const fetchProductById = async (productId: string): Promise<ProductData> => {
  if (!productId) throw new Error("Product ID is required");

  const response = await securityAxios.get(
    endpoints.products.getProductDetails.replace(":id", productId)
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch product");
  }

  return response.data.data;
};

export default function ProductDetailCard({productId}:{productId:string}) {

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery<ProductData, Error>({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId as string),
    enabled: !!productId, // Only run if productId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Handle error state
  if (isError) {
    toast.error(error?.message || "Failed to load product details");
  }

  return (
    <div className="min-h-screen py-12">
      <div className="containe">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        )}

        {isError && (
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Product Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find the product you're looking for.
            </p>
           
          </Card>
        )}

        {product && <ProductDetailDisplay product={product} />}
      </div>
    </div>
  );
}


function ProductDetailDisplay({ product }: ProductDetailDisplayProps) {
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
        switch (status.toLowerCase()) {
            case "published": return "bg-green-100 text-green-800";
            case "draft": return "bg-gray-100 text-gray-800";
            case "archived": return "bg-red-100 text-red-800";
            default: return "bg-blue-100 text-blue-800";
        }
    };

    return (
        <div className="space-y-8 w-full mx-auto p-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <div className="flex flex-wrap items-center gap-3">
                    <Badge className={getStatusColor(product.status)}>
                        {product.status}
                    </Badge>
                    {product.is_featured && <Badge variant="secondary">Featured</Badge>}
                    {product.is_bestseller && <Badge className="bg-orange-100 text-orange-800">Bestseller</Badge>}
                    {product.is_new && <Badge className="bg-purple-100 text-purple-800">New</Badge>}
                    <span className="text-sm text-gray-500">Slug: {product.slug}</span>
                </div>
            </div>

            <Separator />

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(product.average_rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                    ))}
                </div>
                <span className="font-medium">{product.average_rating.toFixed(1)}</span>
                <span className="text-gray-600">({product.total_reviews} reviews)</span>
            </div>

            <div className="flex gap-4 ">
                {/* Description */}
                <Card className="w-2/3">
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                    </CardContent>
                </Card>

                {product.category.name && (
                    <Card className="w-1/3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{product.category.name}</p>
                            <p className="text-sm text-gray-500">ID: {product.category.id}</p>
                        </CardContent>
                    </Card>
                )}


            </div>

            {/* Category & Features */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Variant Options */}
                {Object.keys(product.options).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Variant Options
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {Object.entries(product.options).map(([key, values]) => (
                                    <div key={key}>
                                        <p className="font-medium capitalize">{key}:</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {values.map(value => (
                                                <Badge key={value} variant="outline">{value}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {product.features.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Key Features
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {product.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>





            {/* Variants Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Variants ({product.variants.length})</CardTitle>
                    <CardDescription>All available product variants</CardDescription>
                </CardHeader>
                <CardContent>
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
                                const finalPrice = variant.price - variant.discount_amount;
                                return (
                                    <TableRow key={variant.id}>
                                        <TableCell>
                                            {variant.is_default && <Badge>Default</Badge>}
                                        </TableCell>
                                        <TableCell className="font-mono">{variant.sku}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(variant.attributes).map(([k, v]) => (
                                                    <Badge key={k} variant="secondary" className="text-xs">
                                                        {k}: {v}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>${variant.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-green-600">
                                            {variant.discount_amount > 0 ? `-$${variant.discount_amount.toFixed(2)}` : "-"}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            ${finalPrice.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <span className={variant.stock === 0 ? "text-red-600" : ""}>
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

            {/* Timestamps */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Timestamps
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(product.created_at)}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500">Updated</p>
                        <p className="font-medium flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(product.updated_at)}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500">Published</p>
                        <p className="font-medium flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {product.published_at ? formatDate(product.published_at) : "Not published"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Meta SEO */}
            {(product.meta_title || product.meta_description) && (
                <Card>
                    <CardHeader>
                        <CardTitle>SEO Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {product.meta_title && <p><strong>Title:</strong> {product.meta_title}</p>}
                        {product.meta_description && <p><strong>Description:</strong> {product.meta_description}</p>}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}