// app/(web)/packages/[slug]/(components)/AddToCartButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/app/lib/store/cart-store";
import { toast } from "sonner";
import { PromotionType } from "@/types/promotionTypes";

interface AddToCartButtonProps {
    promotion: PromotionType;
    bundleSku: string;
    bundleImage: string;
}

export default function AddToCartButton({
    promotion,
    bundleSku,
    bundleImage
}: AddToCartButtonProps) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const addBundle = useCartStore((state) => state.addBundle);
    const updateBundleQuantity = useCartStore((state) => state.updateQuantity);
    const items = useCartStore((state) => state.items);

    // Get existing bundle from cart
    const existingBundle = items.find(item => item.sku === bundleSku);
    const existingQuantity = existingBundle?.quantity || 0;

    // Reset quantity when bundle already in cart
    useEffect(() => {
        if (existingQuantity > 0) {
            setQuantity(existingQuantity);
        } else {
            setQuantity(1);
        }
    }, [existingQuantity]);

    // Prepare bundle items for storage
    const prepareBundleItems = () => {
        const allItems = [...promotion.items, ...promotion.free_items];
        return allItems.map((item: any) => ({
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
    };

    const handleBuyNow = () => {
        if (existingQuantity > 0) {
            updateBundleQuantity(bundleSku, quantity);
        } else {
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
        <div className="space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Quantity:</span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="h-8 w-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="text-lg font-semibold text-slate-900 w-8 text-center">
                        {quantity}
                    </span>
                    <button
                        onClick={incrementQuantity}
                        className="h-8 w-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {/* Total Price */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="text-sm font-medium text-slate-700">Total:</span>
                <span className="text-xl font-bold text-slate-900">
                    ${totalPrice.toFixed(2)}
                </span>
            </div>

            {existingQuantity > 0 && (
                <p className="text-xs text-slate-500">
                    Currently in cart: {existingQuantity}
                </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
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
        </div>
    );
}