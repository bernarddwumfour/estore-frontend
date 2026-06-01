"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PromotionType } from "@/types/promotionTypes";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Gift, Clock, Package, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/app/lib/store/cart-store";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { ProductType } from "@/types/productTypes";
import Product from "../../Product";
import { useRouter } from "next/navigation";

interface PromotionDetailModalProps {
    open: boolean;
    onClose: () => void;
    promotion: PromotionType;
}

const formatDate = (dateString: string | null): string => {
    if (!dateString) return "No end date";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

// Helper to convert promotion item to ProductType for the Product component
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

export default function PromotionDetailModal({ open, onClose, promotion }: PromotionDetailModalProps) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const addBundle = useCartStore((state) => state.addBundle);
    const updateBundleQuantity = useCartStore((state) => state.updateQuantity);
    const items = useCartStore((state) => state.items);

    const hasImages = promotion.images && promotion.images.length > 0;
    const mainImage = hasImages ? promotion.images[0] : null;
    const itemCount = promotion.items.length;
    const freeItemCount = promotion.free_items.length;

    // Bundle SKU
    const bundleSku = `bundle_${promotion.id}`;

    // Get existing bundle from cart
    const existingBundle = items.find(item => item.sku === bundleSku);
    const existingQuantity = existingBundle?.quantity || 0;

    // Reset quantity to 1 when modal opens, but also reflect if already in cart
    useEffect(() => {
        if (open) {
            // If already in cart, set quantity to the existing quantity, otherwise default to 1
            if (existingQuantity > 0) {
                setQuantity(existingQuantity);
            } else {
                setQuantity(1);
            }
        }
    }, [open, existingQuantity]);

    // Get the first image for the bundle
    const bundleImage = mainImage?.url || promotion.items[0]?.image || "";

    // Prepare bundle items for storage
    const prepareBundleItems = () => {
        const allItems = [...promotion.items, ...promotion.free_items];
        return allItems.map(item => ({
            id: item.variant_id,
            sku: item.sku,
            title: item.product_title,
            price: item.is_free ? 0 : item.original_price,
            quantity: item.quantity,
            imageUrl: item.image || "",
            variantId: item.variant_id,
        }));
    };

    const handleAddToCart = () => {
        setIsAdding(true);

        if (existingQuantity > 0) {
            // If bundle already exists, update its quantity
            updateBundleQuantity(bundleSku, quantity);
            toast.success(`"${promotion.name}" bundle quantity updated to ${quantity}!`);
        } else {
            // Add new bundle with selected quantity
            for (let i = 0; i < quantity; i++) {
                addBundle({
                    id: promotion.id,
                    bundleId: promotion.id,
                    title: promotion.name,
                    price: promotion.bundle_price,
                    slug: promotion.slug,
                    imageUrl: bundleImage,
                    originalPrice: promotion.original_total,
                    attributes: {},
                    variantId: promotion.id,
                    bundleItems: prepareBundleItems(),
                });
            }
            const message = quantity > 1
                ? `${quantity} x "${promotion.name}" bundles added to cart!`
                : `"${promotion.name}" bundle added to cart!`;
            toast.success(message);
        }

        setIsAdding(false);
        onClose();
    };

    const handleBuyNow = () => {
        if (existingQuantity > 0) {
            // If bundle already exists, update its quantity
            updateBundleQuantity(bundleSku, quantity);
        } else {
            // Add new bundle
            for (let i = 0; i < quantity; i++) {
                addBundle({
                    id: promotion.id,
                    bundleId: promotion.id,
                    title: promotion.name,
                    price: promotion.bundle_price,
                    slug: promotion.slug,
                    imageUrl: bundleImage,
                    originalPrice: promotion.original_total,
                    attributes: {},
                    variantId: promotion.id,
                    bundleItems: prepareBundleItems(),
                });
            }
        }
        router.push("/checkout");
    };

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const totalPrice = promotion.bundle_price * quantity;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="space-y-6">
                    {/* Image and Description Row */}
                    <div className="relative flex flex-col gap-4">
                        {/* Image */}
                        {mainImage && (
                            <div className="relative w-full h-64 md:h-90 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50">
                                <Image
                                    src={mainImage.url}
                                    alt={mainImage.alt_text || promotion.name}
                                    fill
                                    className="object-cover "
                                />
                            </div>
                        )}

                        {/* Description and Details */}
                        <div className="space-y-4">
                            {promotion.description && (
                                <p className="text-gray-600 text-sm">
                                    {promotion.description}
                                </p>
                            )}

                            {/* Date Range */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1 text-destructive">
                                    <Clock size={12} />
                                    <span>Ends: {formatDate(promotion.ends_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price Section with Quantity Selector */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-baseline justify-between flex-wrap gap-2">
                            <div>
                                <span className="text-2xl font-bold text-gray-900 ">
                                    ${promotion.bundle_price.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-400 line-through ml-2">
                                    ${promotion.original_total.toFixed(2)}
                                </span>
                            </div>
                            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50  px-2 py-1 rounded-full">
                                Save ${promotion.savings_amount.toFixed(2)}
                            </span>
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                            <span>Bundle price for all {itemCount} items</span>
                            {freeItemCount > 0 && (
                                <span className="ml-2 text-emerald-600">
                                    ({freeItemCount} free item{freeItemCount !== 1 ? 's' : ''})
                                </span>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 ">Quantity:</span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={decrementQuantity}
                                        disabled={quantity <= 1}
                                        className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-lg font-semibold text-gray-900 w-8 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={incrementQuantity}
                                        className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100  transition"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                            {existingQuantity > 0 && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Currently in cart: {existingQuantity}
                                </p>
                            )}
                        </div>

                        {/* Total Price */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Total:</span>
                                <span className="text-xl font-bold text-gray-900">
                                    ${totalPrice.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-2">
                        <div className="flex gap-3">
                            <Button
                                onClick={handleAddToCart}
                                disabled={isAdding || !promotion.has_stock}
                                variant="outline"
                                className="flex-1 py-6"
                            >
                                <ShoppingBag size={16} className="mr-2" />
                                {existingQuantity > 0 ? "Update Cart" : "Add to Cart"}
                            </Button>
                            <Button
                                onClick={handleBuyNow}
                                disabled={isAdding || !promotion.has_stock}
                                className="flex-1 py-6"
                            >
                                Buy Now
                            </Button>
                        </div>
                        <Button variant="ghost" onClick={onClose} className="py-4 text-gray-500">
                            Continue Shopping
                        </Button>
                    </div>

                    {/* Bundle Items - Using Product component in minimal mode */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Package size={16} />
                            Bundle Includes ({itemCount} items)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {promotion.items.map((item, idx) => (
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
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Gift size={16} className="text-emerald-500" />
                                Free Items ({freeItemCount})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {promotion.free_items.map((item, idx) => (
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

                    {!promotion.has_stock && (
                        <p className="text-center text-sm text-rose-600">
                            Sorry, this bundle is currently out of stock.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}