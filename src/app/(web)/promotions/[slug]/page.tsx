// app/(web)/packages/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { Gift, Clock, Package, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { endpoints } from "@/constants/endpoints/endpoints";
import unAuthenticatedAxios from "@/axios-instances/UnAuthenticatedAxios";
import { PromotionType } from "@/types/promotionTypes";
import { ProductType } from "@/types/productTypes";
import AddToCartButton from "./AddToCartButton";
import Product from "../../products/Product";
// Define the type for the page props
interface PageProps {
    params: Promise<{ slug: string }>;
}

// Helper to convert promotion item to ProductType
const convertToProductType = (item: any, promotion: PromotionType): ProductType => {
    return {
        id: item.variant_id,
        title: item.product_title,
        slug: item.product_slug || "",
        description: "",
        features: [],
        options: {},
        min_price: item.original_price,
        max_price: item.original_price,
        average_rating: 0,
        total_reviews: 0,
        is_featured: false,
        is_bestseller: false,
        is_new: false,
        category: null,
        default_variant: {
            id: item.variant_id,
            sku: item.sku,
            attributes: item.attributes || {},
            price: item.original_price,
            discounted_price: item.is_free ? 0 : item.original_price,
            discount_percentage: item.is_free ? 100 : 0,
            discount_amount: item.is_free ? item.original_price : 0,
            is_in_stock: true,
            stock_status: "in_stock",
            is_default: true,
            images: item.image ? [{ url: item.image, alt_text: "", image_type: "main", order: 0, id: "" }] : [],
        },
        variants: [],
    };
};

const formatDate = (dateString: string | null): string => {
    if (!dateString) return "No end date";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

// Fetch package data
async function getPackage(slug: string) {
    try {
        const response = await unAuthenticatedAxios.get(
            `${endpoints.promotions.promotionDetails.replace(":slug", slug)}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching package:", error);
        return null;
    }
}

export default async function PackageDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const promotion = await getPackage(slug);

    if (!promotion) {
        notFound();
    }

    const hasImages = promotion.images && promotion.images.length > 0;
    const mainImage = hasImages ? promotion.images[0] : null;
    const itemCount = promotion.items.length;
    const freeItemCount = promotion.free_items.length;
    const bundleSku = `bundle_${promotion.id}`;

    return (
        <section className="relative py-28 bg-cover bg-center">
            <div className="mx-auto container px-4 md:px-6">


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Image */}
                    <div>
                        {mainImage ? (
                            <div className="relative w-full aspect-[4/2] lg:aspect-[4/4] md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                                <Image
                                    src={mainImage.url}
                                    alt={mainImage.alt_text || promotion.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        ) : (
                            <div className="relative w-full h-80 md:h-[500px] rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                                <Package className="h-20 w-20 text-slate-300" />
                            </div>
                        )}

                        {/* Date Range */}
                        <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1 text-destructive">
                                <Clock size={16} />
                                <span>Ends: {formatDate(promotion.ends_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <h1 className="text-2xl md:text-2xl font-bold text-slate-900">
                                {promotion.name}
                            </h1>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-500">Bundle</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-sm text-slate-500">{itemCount} items</span>
                                {freeItemCount > 0 && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span className="text-sm text-emerald-600 font-medium">
                                            {freeItemCount} free
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {promotion.description && (
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {promotion.description}
                            </p>
                        )}

                        {/* Price Section */}
                        <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                            <div className="flex items-baseline justify-between flex-wrap gap-2">
                                <div>
                                    <span className="text-2xl font-bold text-slate-900">
                                        ${promotion.bundle_price.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-slate-400 line-through ml-3">
                                        ${promotion.original_total.toFixed(2)}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                    Save ${promotion.savings_amount.toFixed(2)}
                                </span>
                            </div>

                            <p className="text-xs text-slate-500">
                                Bundle price for all {itemCount} items
                                {freeItemCount > 0 && (
                                    <span className="ml-2 text-emerald-600">
                                        ({freeItemCount} free item{freeItemCount !== 1 ? 's' : ''})
                                    </span>
                                )}
                            </p>

                            {/* Add to Cart Component */}
                            <AddToCartButton
                                promotion={promotion}
                                bundleSku={bundleSku}
                                bundleImage={mainImage?.url || promotion.items[0]?.image || ""}
                            />
                        </div>

                        {/* Stock Status */}
                        {!promotion.has_stock && (
                            <p className="text-center text-sm text-rose-600 font-medium">
                                Sorry, this bundle is currently out of stock.
                            </p>
                        )}
                    </div>
                </div>

                {/* Bundle Items Section */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Bundle Includes ({itemCount} items)
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {promotion.items.map((item: any, idx: number) => (
                            <Product
                                key={idx}
                                product={convertToProductType(item, promotion)}
                                isMinimal={true}
                            />
                        ))}
                    </div>
                </div>

                {/* Free Items Section */}
                {freeItemCount > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Gift className="h-5 w-5 text-emerald-500" />
                            Free Items ({freeItemCount})
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {promotion.free_items.map((item: any, idx: number) => (
                                <div key={idx} className="relative">
                                    <Product
                                        product={convertToProductType(item, promotion)}
                                        isMinimal={true}
                                    />
                                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        FREE
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}