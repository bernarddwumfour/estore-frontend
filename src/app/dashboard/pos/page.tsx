'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Minus, Trash2, Search, CreditCard,
    Users, Printer, ShoppingCart, Package, Loader2, Tag,
    UserPlus, MapPin, Edit, Trash, User
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePosCartStore } from '@/app/lib/store/pos-cart-store';
import { formatCurrency } from '@/lib/currency';

// Types
interface Variant {
    id: string;
    sku: string;
    price: number;
    discounted_price: number;
    stock: number;
    attributes: Record<string, string>;
    product: { id: string; title: string; slug: string };
    images: Array<{ url: string; alt_text: string }>;
}

interface Promotion {
    id: string;
    name: string;
    slug: string;
    bundle_price: number;
    original_total: number;
    savings_amount: number;
    savings_percentage: number;
    items: Array<{ variant_id: string; sku: string; product_title: string; quantity: number; original_price: number; is_free: boolean }>;
    free_items: Array<{ variant_id: string; sku: string; product_title: string; quantity: number; is_free: boolean; original_price: number }>;
    images: Array<{ url: string; type: string }>;
    has_stock: boolean;
}

interface Customer {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
}

interface Address {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    instructions?: string;
}

interface CartItem {
    id: string;
    sku: string;
    title: string;
    price: number;
    quantity: number;
    imageUrl: string;
    variantId: string;
    isBundle?: boolean;
    bundleId?: string;
    bundleName?: string;
    bundleItems?: Array<{ variant_id: string; sku: string; product_title: string; quantity: number; original_price: number; is_free: boolean }>;
}

// GET API calls (using React Query)
const searchVariants = async (search: string): Promise<Variant[]> => {
    if (!search || search.length < 2) return [];
    const response = await securityAxios.get(`${endpoints.products.adminListVariants}?search=${search}&limit=20`);
    return response.data.data?.variants || [];
};

const fetchPromotions = async (): Promise<Promotion[]> => {
    const response = await securityAxios.get(endpoints.promotions.listPromotions);
    return response.data.data?.promotions || [];
};

const searchCustomers = async (search: string): Promise<Customer[]> => {
    if (!search || search.length < 2) return [];
    const response = await securityAxios.get(`/orders/admin/pos/customers/search?search=${search}`);
    return response.data.data?.customers || [];
};

const getCustomerAddresses = async (customerId: string): Promise<Address[]> => {
    const response = await securityAxios.get(`/orders/admin/pos/customers/${customerId}/addresses`);
    return response.data.data?.addresses || [];
};

const calculateShipping = async (address: any, items: any[]): Promise<{ shipping_cost: number; shipping_method: string }> => {
    const response = await securityAxios.post('/orders/admin/pos/shipping/calculate', { address, items });
    return response.data.data;
};

// POST functions (using regular async/await with error handling)
const createCustomer = async (customerData: any): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
        const response = await securityAxios.post('/users/admin/users/create', customerData);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || 'Failed to create customer'
        };
    }
};

const createAddress = async (customerId: string, addressData: any): Promise<{ success: boolean; data?: Address; message?: string }> => {
    try {
        const response = await securityAxios.post(`/orders/admin/pos/customers/${customerId}/addresses/create`, addressData);
        return { success: true, data: response.data.data?.address };
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || 'Failed to create address'
        };
    }
};

const updateAddress = async (customerId: string, addressId: string, addressData: any): Promise<{ success: boolean; data?: Address; message?: string }> => {
    try {
        const response = await securityAxios.put(`/orders/admin/pos/customers/${customerId}/addresses/${addressId}/update`, addressData);
        return { success: true, data: response.data.data?.address };
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || 'Failed to update address'
        };
    }
};

const deleteAddress = async (customerId: string, addressId: string): Promise<{ success: boolean; message?: string }> => {
    try {
        await securityAxios.delete(`/orders/admin/pos/customers/${customerId}/addresses/${addressId}/delete`);
        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || 'Failed to delete address'
        };
    }
};

const createPosOrder = async (orderData: any): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
        const response = await securityAxios.post('/orders/admin/pos/orders/create', orderData);
        // Unwrap the response envelope ({ data: { order }, message }) so callers
        // get { order } directly — matches createAddress() in this file.
        return { success: true, data: response.data?.data };
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || 'Failed to create order'
        };
    }
};

// Customer Mode Selector Component
interface CustomerModeSelectorProps {
    mode: 'anonymous' | 'customer';
    selectedCustomer?: Customer | null;
    onModeChange: (mode: 'anonymous' | 'customer') => void;
}

function CustomerModeSelector({
    mode,
    selectedCustomer,
    onModeChange,
}: CustomerModeSelectorProps) {
    return (
        <div className="flex items-center gap-3">
            {mode === 'customer' && selectedCustomer && (
                <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 px-3 py-1.5">
                    <Users className="h-3 w-3 mr-1.5" />
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                </Badge>
            )}

            <ToggleGroup type="single" value={mode} onValueChange={(value) => value && onModeChange(value as 'anonymous' | 'customer')} className="border dark:border-gray-800 rounded-md">
                <ToggleGroupItem value="anonymous" className="px-4 py-2 gap-2 data-[state=on]:bg-gray-900 data-[state=on]:text-gray-300 dark:data-[state=on]:bg-black dark:hover:bg-gray-900 dark:text-gray-300">
                    <User className="h-4 w-4" />
                    Guest
                </ToggleGroupItem>
                <ToggleGroupItem value="customer" className="px-4 py-2 gap-2 data-[state=on]:bg-gray-900 data-[state=on]:text-gray-300 dark:data-[state=on]:bg-black dark:hover:bg-gray-900 dark:text-gray-300">
                    <Users className="h-4 w-4" />
                    Customer
                </ToggleGroupItem>
            </ToggleGroup>

        </div>
    );
}

// POS Cart Component
function PosCart({ cart, onUpdateQuantity, onRemoveItem, onClearCart, onCheckout, shippingCost, selectedAddress, isLoadingShipping }: any) {
    const subtotal = cart.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
    const total = subtotal + (shippingCost || 0);

    return (
        <Card className="max-h-[550px] h-full flex flex-col border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                        <ShoppingCart className="h-5 w-5" />
                        Current Order
                    </CardTitle>
                    {cart.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={onClearCart} className="text-rose-600 dark:text-rose-400">
                            Clear All
                        </Button>
                    )}
                </div>
                <CardDescription className="text-gray-500 dark:text-gray-400">{cart.length} items in cart</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">Cart is empty</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Search and add products to start</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cart.map((item: CartItem) => (
                            <div key={item.sku} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md bg-white dark:bg-gray-900">
                                    {item.imageUrl ? (
                                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{item.title}</p>
                                            {item.isBundle && <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 mt-1">Bundle</Badge>}
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(item.price)} each</p>
                                        </div>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => onUpdateQuantity(item.sku, item.quantity - 1)} className="h-7 w-7 border border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-sm w-8 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.sku, item.quantity + 1)} className="h-7 w-7 border border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <button onClick={() => onRemoveItem(item.sku)} className="text-rose-500 hover:text-rose-600 dark:text-rose-400">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {item.isBundle && item.bundleItems && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer">
                                                {item.bundleItems.length} items in bundle
                                            </summary>
                                            <div className="mt-1 space-y-1">
                                                {item.bundleItems.map((bItem, idx) => (
                                                    <p key={idx} className="text-xs text-gray-500 dark:text-gray-400">
                                                        • {bItem.product_title} x{bItem.quantity}
                                                        {bItem.is_free && <span className="text-emerald-600 dark:text-emerald-400 ml-1">(FREE)</span>}
                                                    </p>
                                                ))}
                                            </div>
                                        </details>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            {cart.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                        </div>
                        {isLoadingShipping ? (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                <span className="text-gray-400 flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Calculating...
                                </span>
                            </div>
                        ) : shippingCost !== null && shippingCost > 0 && selectedAddress && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">+{formatCurrency(shippingCost)}</span>
                            </div>
                        )}
                        {!isLoadingShipping && selectedAddress && shippingCost === 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">Free Shipping</span>
                            </div>
                        )}
                        {!selectedAddress && cart.length > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                <span className="text-gray-400">Select address to calculate</span>
                            </div>
                        )}
                        <Separator className="bg-gray-200 dark:bg-gray-800" />
                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-gray-900 dark:text-white">Total</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(total)}</span>
                        </div>
                    </div>
                    <Button onClick={onCheckout} className="w-full" size="lg">
                        Complete Order
                    </Button>
                </div>
            )}
        </Card>
    );
}

// Product Search Component
function ProductSearch({ onAddItem }: { onAddItem: (item: any) => void }) {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeTab, setActiveTab] = useState('products');

    // Subscribe to the POS cart so cards reflect what's already in the order.
    const cartItems = usePosCartStore((s) => s.items);
    const getCartQty = (sku: string) => cartItems.find((i) => i.sku === sku)?.quantity ?? 0;

    const { data: variants, isLoading: variantsLoading } = useQuery({
        queryKey: ['pos-variants', debouncedSearch],
        queryFn: () => searchVariants(debouncedSearch),
        enabled: debouncedSearch.length >= 2 && activeTab === 'products',
    });

    const { data: promotions, isLoading: promotionsLoading } = useQuery({
        queryKey: ['pos-promotions'],
        queryFn: fetchPromotions,
    });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleAddVariant = (variant: Variant) => {
        // Don't let the cashier add more than is in stock.
        if (getCartQty(variant.sku) >= variant.stock) {
            toast.error(`Only ${variant.stock} in stock for ${variant.product.title}`);
            return;
        }
        onAddItem({
            id: variant.product.id,
            sku: variant.sku,
            title: variant.product.title,
            price: variant.discounted_price,
            imageUrl: variant.images[0]?.url || '',
            variantId: variant.id,
            isBundle: false,
        });
        toast.success(`Added ${variant.product.title} to cart`);
    };

    const handleAddPromotion = (promotion: Promotion) => {
        const bundleItems = [...promotion.items, ...promotion.free_items].map(item => ({
            variant_id: item.variant_id,
            sku: item.sku,
            product_title: item.product_title,
            quantity: item.quantity,
            original_price: item.original_price,
            is_free: item.is_free,
        }));

        onAddItem({
            id: promotion.id,
            sku: `bundle_${promotion.id}`,
            title: promotion.name,
            price: promotion.bundle_price,
            imageUrl: promotion.images[0]?.url || '',
            variantId: promotion.id,
            isBundle: true,
            bundleId: promotion.id,
            bundleName: promotion.name,
            bundleItems,
        });
        toast.success(`Added ${promotion.name} bundle to cart`);
    };

    return (
        <Card className="max-h-[550px] h-full flex flex-col border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Add Items</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">Search products or select from promotions</CardDescription>
                <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        placeholder="Search by product name or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white"
                    />
                </div>
            </CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="mx-4 bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger value="products" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200 dark:hover:text-gray-300">Products</TabsTrigger>
                    <TabsTrigger value="promotions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200 dark:hover:text-gray-300">Bundles</TabsTrigger>
                </TabsList>
                <TabsContent value="products" className="flex-1 overflow-scroll  max-h-[320px] px-4 pb-4">
                    {variantsLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" /></div>
                    ) : !debouncedSearch ? (
                        <div className="text-center py-12">
                            <Search className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Start typing to search products</p>
                        </div>
                    ) : variants?.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No products found</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="space-y-2 py-2">
                            {variants?.map((variant) => {
                                const inCartQty = getCartQty(variant.sku);
                                const inCart = inCartQty > 0;
                                const atMax = inCartQty >= variant.stock;
                                return (
                                <div
                                    key={variant.id}
                                    className={`relative flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                                        atMax
                                            ? 'border-amber-500 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 cursor-not-allowed opacity-70'
                                            : inCart
                                                ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer'
                                                : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
                                    }`}
                                    onClick={() => handleAddVariant(variant)}
                                >
                                    {inCart && (
                                        <span className={`absolute -top-2 -right-2 z-10 min-w-[20px] h-5 px-1.5 rounded-full text-white text-[11px] font-semibold flex items-center justify-center shadow ${atMax ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                                            {inCartQty}
                                        </span>
                                    )}
                                    <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                                        {variant.images[0] ? (
                                            <Image src={variant.images[0].url} alt={variant.product.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{variant.product.title}</p>
                                        <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span>SKU: {variant.sku}</span>
                                            {Object.entries(variant.attributes).slice(0, 2).map(([key, val]) => (
                                                <span key={key}>{key}: {val}</span>
                                            ))}
                                        </div>
                                        {atMax ? (
                                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-0.5">Max stock reached ({variant.stock})</p>
                                        ) : inCart && (
                                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">{inCartQty} in cart</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{formatCurrency(variant.discounted_price)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Stock: {variant.stock}</p>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="promotions" className="flex-1 overflow-auto px-4 pb-4">
                    {promotionsLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" /></div>
                    ) : promotions?.length === 0 ? (
                        <div className="text-center py-12">
                            <Tag className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">No active promotions</p>
                        </div>
                    ) : (
                        <div className="space-y-2 py-2">
                            {promotions?.filter(p => p.has_stock).map((promotion) => {
                                const inCartQty = getCartQty(`bundle_${promotion.id}`);
                                const inCart = inCartQty > 0;
                                return (
                                <div
                                    key={promotion.id}
                                    className={`relative flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                        inCart
                                            ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    }`}
                                    onClick={() => handleAddPromotion(promotion)}
                                >
                                    {inCart && (
                                        <span className="absolute -top-2 -right-2 z-10 min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-semibold flex items-center justify-center shadow">
                                            {inCartQty}
                                        </span>
                                    )}
                                    <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
                                        {promotion.images[0] ? (
                                            <Image src={promotion.images[0].url} alt={promotion.name} fill className="object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Tag className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{promotion.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{promotion.items.length + promotion.free_items.length} items in bundle</p>
                                        {inCart && (
                                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">{inCartQty} in cart</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{formatCurrency(promotion.bundle_price)}</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Save {formatCurrency(promotion.savings_amount)}</p>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </Card>
    );
}

// Address Manager Component
function AddressManager({ customerId, onAddressSelect, onClose, cartItems }: { customerId: string; onAddressSelect: (address: Address | null, shippingCost?: number) => void; onClose: () => void; cartItems: any[] }) {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [newAddress, setNewAddress] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'GH', is_default: false
    });
    const [selectedAddressData, setSelectedAddressData] = useState<Address | null>(null);

    // Use TanStack Query for shipping calculation
    const shippingItems = cartItems.map(item => ({
        variant_id: item.isBundle ? item.bundleItems?.[0]?.variant_id || item.variantId : item.variantId,
        quantity: item.quantity,
    }));

    const { data: shippingData, isLoading: isLoadingShipping } = useQuery({
        queryKey: ['pos-shipping-address', selectedAddressData?.id, JSON.stringify(shippingItems)],
        queryFn: () => calculateShipping(selectedAddressData!, shippingItems),
        enabled: !!selectedAddressData && cartItems.length > 0,
        staleTime: 0,
    });

    useEffect(() => {
        if (selectedAddressData && shippingData) {
            onAddressSelect(selectedAddressData, shippingData.shipping_cost);
        }
    }, [shippingData, selectedAddressData, onAddressSelect]);

    useEffect(() => {
        loadAddresses();
    }, [customerId]);

    const loadAddresses = async () => {
        setIsLoading(true);
        try {
            const data = await getCustomerAddresses(customerId);
            setAddresses(data);
        } catch (error) {
            toast.error('Failed to load addresses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAddress = async (address: Address) => {
        setSelectedAddressId(address.id);
        setSelectedAddressData(address);
        toast.success(`Address selected, calculating shipping...`);
    };

    const handleUseAddress = () => {
        if (selectedAddressData && shippingData) {
            onAddressSelect(selectedAddressData, shippingData.shipping_cost);
            onClose();
        } else if (selectedAddressData && !shippingData && !isLoadingShipping) {
            onAddressSelect(selectedAddressData, 0);
            onClose();
            toast.warning('Shipping calculation failed, using $0');
        } else {
            toast.error('Please wait for shipping calculation to complete');
        }
    };

    const handleCreateAddress = async () => {
        if (!newAddress.first_name || !newAddress.last_name || !newAddress.email || !newAddress.phone ||
            !newAddress.address_line1 || !newAddress.city || !newAddress.postal_code) {
            toast.error('Please fill all required fields');
            return;
        }
        setIsCreating(true);
        const result = await createAddress(customerId, newAddress);
        if (result.success && result.data) {
            setAddresses([...addresses, result.data]);
            setIsCreating(false);
            setNewAddress({
                first_name: '', last_name: '', email: '', phone: '',
                address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'GH', is_default: false
            });
            toast.success('Address created successfully');
            await handleSelectAddress(result.data);
        } else {
            toast.error(result.message || 'Failed to create address');
            setIsCreating(false);
        }
    };

    const handleUpdateAddress = async (addressId: string) => {
        const addressToUpdate = addresses.find(a => a.id === addressId);
        if (!addressToUpdate) return;
        setIsUpdating(addressId);
        const result = await updateAddress(customerId, addressId, addressToUpdate);
        if (result.success && result.data) {
            setAddresses(addresses.map(a => a.id === addressId ? result.data! : a));
            setIsEditing(null);
            toast.success('Address updated successfully');
            if (selectedAddressId === addressId) {
                setSelectedAddressData(result.data);
            }
        } else {
            toast.error(result.message || 'Failed to update address');
        }
        setIsUpdating(null);
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (confirm('Are you sure you want to delete this address?')) {
            setIsDeleting(addressId);
            const result = await deleteAddress(customerId, addressId);
            if (result.success) {
                setAddresses(addresses.filter(a => a.id !== addressId));
                if (selectedAddressId === addressId) {
                    setSelectedAddressId(null);
                    setSelectedAddressData(null);
                }
                toast.success('Address deleted successfully');
            } else {
                toast.error(result.message || 'Failed to delete address');
            }
            setIsDeleting(null);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">Select Shipping Address</DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-gray-400">Choose a saved address or add a new one</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" /></div>
                ) : (
                    <div className="space-y-4">
                        {addresses.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Saved Addresses</h3>
                                {addresses.map((address) => (
                                    <div key={address.id} className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === address.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                        {isEditing === address.id ? (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Input value={address.first_name} onChange={(e) => setAddresses(addresses.map(a => a.id === address.id ? { ...a, first_name: e.target.value } : a))} placeholder="First Name" className="border-gray-200 dark:border-gray-800" />
                                                    <Input value={address.last_name} onChange={(e) => setAddresses(addresses.map(a => a.id === address.id ? { ...a, last_name: e.target.value } : a))} placeholder="Last Name" className="border-gray-200 dark:border-gray-800" />
                                                </div>
                                                <Input value={address.email} onChange={(e) => setAddresses(addresses.map(a => a.id === address.id ? { ...a, email: e.target.value } : a))} placeholder="Email" className="border-gray-200 dark:border-gray-800" />
                                                <Input value={address.phone} onChange={(e) => setAddresses(addresses.map(a => a.id === address.id ? { ...a, phone: e.target.value } : a))} placeholder="Phone" className="border-gray-200 dark:border-gray-800" />
                                                <Input value={address.address_line1} onChange={(e) => setAddresses(addresses.map(a => a.id === address.id ? { ...a, address_line1: e.target.value } : a))} placeholder="Street Address" className="border-gray-200 dark:border-gray-800" />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Input value={address.city} onChange={(e) => setAddresses(addresses.map(a => a.id === address.id ? { ...a, city: e.target.value } : a))} placeholder="City" className="border-gray-200 dark:border-gray-800" />
                                                    <Input value={address.postal_code} onChange={(e) => setAddresses(addresses.map(a => a.id === address.id ? { ...a, postal_code: e.target.value } : a))} placeholder="Postal Code" className="border-gray-200 dark:border-gray-800" />
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <Button size="sm" variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
                                                    <Button size="sm" onClick={() => handleUpdateAddress(address.id)} disabled={isUpdating === address.id}>
                                                        {isUpdating === address.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div onClick={() => handleSelectAddress(address)}>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">{address.first_name} {address.last_name}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{address.address_line1}</p>
                                                        {address.address_line2 && <p className="text-sm text-gray-500 dark:text-gray-400">{address.address_line2}</p>}
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{address.city}, {address.state} {address.postal_code}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{address.country}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{address.phone} | {address.email}</p>
                                                        {address.is_default && <Badge className="mt-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Default</Badge>}
                                                        {isLoadingShipping && selectedAddressId === address.id && (
                                                            <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                Calculating shipping...
                                                            </p>
                                                        )}
                                                        {!isLoadingShipping && shippingData && selectedAddressId === address.id && (
                                                            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Shipping: {formatCurrency(shippingData.shipping_cost)}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={(e) => { e.stopPropagation(); setIsEditing(address.id); }} className="p-1 text-gray-500 hover:text-gray-700"><Edit className="h-4 w-4" /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id); }} className="p-1 text-rose-500 hover:text-rose-700" disabled={isDeleting === address.id}>
                                                            {isDeleting === address.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {isCreating ? (
                            <div className="space-y-3 p-4 border border-dashed rounded-lg">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">New Address</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input placeholder="First Name *" value={newAddress.first_name} onChange={(e) => setNewAddress({ ...newAddress, first_name: e.target.value })} className="border-gray-200 dark:border-gray-800" />
                                    <Input placeholder="Last Name *" value={newAddress.last_name} onChange={(e) => setNewAddress({ ...newAddress, last_name: e.target.value })} className="border-gray-200 dark:border-gray-800" />
                                </div>
                                <Input placeholder="Email *" value={newAddress.email} onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })} className="border-gray-200 dark:border-gray-800" />
                                <Input placeholder="Phone *" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="border-gray-200 dark:border-gray-800" />
                                <Input placeholder="Street Address *" value={newAddress.address_line1} onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })} className="border-gray-200 dark:border-gray-800" />
                                <Input placeholder="Apartment, suite, etc." value={newAddress.address_line2} onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })} className="border-gray-200 dark:border-gray-800" />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input placeholder="City *" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="border-gray-200 dark:border-gray-800" />
                                    <Input placeholder="State/Region" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="border-gray-200 dark:border-gray-800" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input placeholder="Postal Code *" value={newAddress.postal_code} onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })} className="border-gray-200 dark:border-gray-800" />
                                    <select value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-white">
                                        <option value="GH">Ghana</option>
                                        <option value="NG">Nigeria</option>
                                        <option value="KE">Kenya</option>
                                        <option value="ZA">South Africa</option>
                                    </select>
                                </div>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={newAddress.is_default} onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })} className="h-4 w-4" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Set as default address</span>
                                </label>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                    <Button onClick={handleCreateAddress} disabled={isCreating}>
                                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Address'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button variant="outline" className="w-full" onClick={() => setIsCreating(true)}><Plus className="h-4 w-4 mr-2" /> Add New Address</Button>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button className="flex-1" onClick={handleUseAddress} disabled={!selectedAddressData}>
                                {isLoadingShipping ? 'Calculating Shipping...' : 'Use Selected Address'}
                            </Button>
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// Customer Management Component
function CustomerManager({ onSelectCustomer, selectedCustomer, cartItems }: { onSelectCustomer: (customer: Customer | null, selectedAddress?: Address | null, shippingCost?: number) => void; selectedCustomer: Customer | null; cartItems: any[] }) {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [showAddressManager, setShowAddressManager] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [shippingCost, setShippingCost] = useState<number | null>(null);
    const [newCustomer, setNewCustomer] = useState({ first_name: '', last_name: '', email: '', phone: '' });

    const { data: customers, isLoading, refetch } = useQuery({
        queryKey: ['pos-customers', debouncedSearch],
        queryFn: () => searchCustomers(debouncedSearch),
        enabled: debouncedSearch.length >= 2,
    });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSelectCustomer = (customer: Customer) => {
        onSelectCustomer(customer, null, undefined);
        setSearch('');
        setShowResults(false);
        setSelectedAddress(null);
        setShippingCost(null);
        toast.success(`Customer selected: ${customer.first_name} ${customer.last_name}`);
    };

    const handleClearCustomer = () => {
        onSelectCustomer(null, null, undefined);
        setSelectedAddress(null);
        setShippingCost(null);
        toast.success('Customer cleared');
    };

    const handleCreateCustomer = async () => {
        if (!newCustomer.first_name || !newCustomer.last_name || !newCustomer.email) {
            toast.error('Please fill all required fields');
            return;
        }
        setIsCreatingCustomer(true);
        const result = await createCustomer({ ...newCustomer, role: 'customer', is_active: true });
        if (result.success && result.data) {
            toast.success('Customer created successfully');
            onSelectCustomer(result.data, null, undefined);
            setIsCreating(false);
            setNewCustomer({ first_name: '', last_name: '', email: '', phone: '' });
            refetch();
        } else {
            toast.error(result.message || 'Failed to create customer');
        }
        setIsCreatingCustomer(false);
    };

    const handleAddressSelected = (address: Address | null, cost?: number) => {
        setSelectedAddress(address);
        setShippingCost(cost || null);
        setShowAddressManager(false);
        if (address && cost !== undefined) {
            onSelectCustomer(selectedCustomer, address, cost);
            toast.success(`Address selected - Shipping: ${formatCurrency(cost)}`);
        }
    };

    return (
        <>
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Users className="h-5 w-5" />
                        Customer Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedCustomer ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer.email}</p>
                                    {selectedCustomer.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer.phone}</p>}
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleClearCustomer} className="text-rose-600 dark:text-rose-400">
                                    Change
                                </Button>
                            </div>
                            <Button variant="outline" className="w-full gap-2" onClick={() => setShowAddressManager(true)}>
                                <MapPin className="h-4 w-4" /> {selectedAddress ? 'Change Shipping Address' : 'Add Shipping Address'}
                            </Button>
                            {selectedAddress && shippingCost !== null && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Address:</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAddress.first_name} {selectedAddress.last_name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAddress.address_line1}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAddress.city}, {selectedAddress.postal_code}</p>
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Shipping: {formatCurrency(shippingCost)}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    placeholder="Search customer by name or email..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
                                    onFocus={() => setShowResults(true)}
                                    className="pl-9 border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white"
                                />
                                {showResults && search.length >= 2 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-10 max-h-64 overflow-auto">
                                        {isLoading ? (
                                            <div className="p-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-500 dark:text-gray-400" /></div>
                                        ) : customers?.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No customers found. <button onClick={() => setIsCreating(true)} className="text-blue-600 dark:text-blue-400 underline">Create new?</button>
                                            </div>
                                        ) : (
                                            customers?.map((customer) => (
                                                <div
                                                    key={customer.id}
                                                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b last:border-0 border-gray-100 dark:border-gray-800"
                                                    onClick={() => handleSelectCustomer(customer)}
                                                >
                                                    <p className="font-medium text-gray-900 dark:text-white">{customer.first_name} {customer.last_name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            <Button variant="outline" className="w-full gap-2" onClick={() => setIsCreating(true)}><UserPlus className="h-4 w-4" /> Create New Customer</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">Create New Customer</DialogTitle>
                        <DialogDescription className="text-gray-500 dark:text-gray-400">Enter customer details to create a new account</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Input placeholder="First Name *" value={newCustomer.first_name} onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })} className="border-gray-200 dark:border-gray-800" />
                            <Input placeholder="Last Name *" value={newCustomer.last_name} onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })} className="border-gray-200 dark:border-gray-800" />
                        </div>
                        <Input placeholder="Email *" type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} className="border-gray-200 dark:border-gray-800" />
                        <Input placeholder="Phone" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} className="border-gray-200 dark:border-gray-800" />
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" className="flex-1" onClick={() => setIsCreating(false)}>Cancel</Button>
                            <Button className="flex-1" onClick={handleCreateCustomer} disabled={isCreatingCustomer}>
                                {isCreatingCustomer ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Customer'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {showAddressManager && selectedCustomer && (
                <AddressManager
                    customerId={selectedCustomer.id}
                    onAddressSelect={handleAddressSelected}
                    onClose={() => setShowAddressManager(false)}
                    cartItems={cartItems}
                />
            )}
        </>
    );
}

// POS Payment Method Component
function PosPaymentMethod({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    return (
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <input type="radio" name="payment" value="pos" checked={value === 'pos'} onChange={(e) => onChange(e.target.value)} className="mr-3" />
                        <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">Cash / POS</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pay in-store with cash or card</p>
                        </div>
                        <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400">Paid In-Store</Badge>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <input type="radio" name="payment" value="cash_on_delivery" checked={value === 'cash_on_delivery'} onChange={(e) => onChange(e.target.value)} className="mr-3" />
                        <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">Cash on Delivery</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pay when order arrives</p>
                        </div>
                        <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400">Pay on Delivery</Badge>
                    </label>
                </div>
            </CardContent>
        </Card>
    );
}

// Guest Checkout Component
function GuestCheckout() {
    return (
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    <User className="h-5 w-5" />
                    Guest Checkout
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Order will be processed as guest. No customer account will be created.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        For shipping, you'll need to provide address details at checkout.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

// Main POS Page
export default function POSPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // POS cart lives in a persisted zustand store so it survives refreshes.
    // Treat it as empty until rehydration completes to avoid a hydration mismatch.
    const cartItems = usePosCartStore((s) => s.items);
    const cartHydrated = usePosCartStore((s) => s.hasHydrated);
    const addCartItem = usePosCartStore((s) => s.addItem);
    const updateCartQuantity = usePosCartStore((s) => s.updateQuantity);
    const removeCartItem = usePosCartStore((s) => s.removeItem);
    const clearPosCart = usePosCartStore((s) => s.clearCart);
    const cart = cartHydrated ? cartItems : [];

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [shippingCost, setShippingCost] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('pos');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastOrder, setLastOrder] = useState<any>(null);
    const [customerMode, setCustomerMode] = useState<'anonymous' | 'customer'>('anonymous');

    // Use TanStack Query for shipping calculation
    const shippingItems = cart.map(item => ({
        variant_id: item.isBundle ? item.bundleItems?.[0]?.variant_id || item.variantId : item.variantId,
        quantity: item.quantity,
    }));

    const {
        data: shippingData,
        isLoading: isShippingLoading,
        refetch: refetchShipping
    } = useQuery({
        queryKey: ['pos-shipping-main', selectedAddress?.id, cart.length, JSON.stringify(shippingItems)],
        queryFn: () => calculateShipping(selectedAddress!, shippingItems),
        enabled: !!selectedAddress && cart.length > 0 && customerMode === 'customer',
        staleTime: 0,
    });

    // Update shipping cost when data changes
    useEffect(() => {
        if (shippingData) {
            setShippingCost(shippingData.shipping_cost);
        } else if (!isShippingLoading && selectedAddress && cart.length > 0) {
            setShippingCost(null);
        }
    }, [shippingData, isShippingLoading, selectedAddress, cart.length]);

    // Recalculate shipping when cart changes
    useEffect(() => {
        if (selectedAddress && cart.length > 0 && customerMode === 'customer') {
            refetchShipping();
        } else {
            setShippingCost(null);
        }
    }, [cart, selectedAddress, refetchShipping, customerMode]);

    const handleModeChange = (mode: 'anonymous' | 'customer') => {
        setCustomerMode(mode);
        if (mode === 'anonymous') {
            setSelectedCustomer(null);
            setSelectedAddress(null);
            setShippingCost(null);
            toast.info('Switched to anonymous guest mode');
        }
    };

    const handleCustomerSelect = (customer: Customer | null, address: Address | null = null, cost: number | null = null) => {
        setSelectedCustomer(customer);
        if (address) setSelectedAddress(address);
        if (cost !== null) setShippingCost(cost);
        if (customer && customerMode === 'customer') {
            toast.success(`Customer selected: ${customer.first_name} ${customer.last_name}`);
        }
    };

    const handleCreateOrder = async () => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        // if (customerMode === 'customer' && selectedCustomer && !selectedAddress) {
        //     toast.error('Please add a shipping address for this customer');
        //     return;
        // }

        setIsCheckingOut(true);

        const orderData: any = {
            items: cart.map(item => ({
                ...(item.isBundle ? {
                    is_bundle: true,
                    bundle_id: item.bundleId,
                    quantity: item.quantity,
                } : {
                    variant_id: item.variantId,
                    quantity: item.quantity,
                })
            })),
            payment_method: paymentMethod,
            is_guest: customerMode === 'anonymous',
            is_pickup: customerMode === 'anonymous' || !selectedAddress,
        };

        if (customerMode === 'customer' && selectedCustomer) {
            orderData.customer_id = selectedCustomer.id;
        }

        if (selectedAddress) {
            orderData.saved_address_id = selectedAddress.id;
        }

        const result = await createPosOrder(orderData);

        if (result.success && result.data) {
            toast.success('Order created successfully!');
            setLastOrder(result.data?.order);
            setShowReceipt(true);
            clearPosCart();
            if (customerMode === 'customer') {
                setSelectedCustomer(null);
                setSelectedAddress(null);
            }
            setShippingCost(null);
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        } else {
            toast.error(result.message || 'Failed to create order');
        }
        setIsCheckingOut(false);
    };

    const handleAddToCart = (item: CartItem) => {
        addCartItem(item);
    };

    const handleUpdateQuantity = (sku: string, quantity: number) => {
        updateCartQuantity(sku, quantity);
    };

    const handleRemoveItem = (sku: string) => {
        removeCartItem(sku);
        toast.success('Item removed from cart');
    };

    const handleClearCart = () => {
        if (cart.length > 0) { clearPosCart(); toast.success('Cart cleared'); }
    };

    const formatMoney = (amount: number) => formatCurrency(amount);

    // Print just the receipt (window.print() would print the entire dashboard).
    const handlePrintReceipt = () => {
        if (!lastOrder) return;
        const o = lastOrder;
        const rows: string[] = [];
        (o.items || []).forEach((it: any) => {
            rows.push(`<tr><td>${it.quantity} &times; ${it.product_title}</td><td class="r">${formatMoney(it.total_price)}</td></tr>`);
        });
        (o.bundles || []).forEach((b: any) => {
            rows.push(`<tr><td><strong>${b.bundle_name || 'Bundle'}</strong></td><td class="r">${formatMoney(b.total)}</td></tr>`);
            (b.items || []).forEach((it: any) => {
                rows.push(`<tr><td class="sub">${it.quantity} &times; ${it.product_title}</td><td></td></tr>`);
            });
        });

        const html = `<!doctype html><html><head><title>Receipt ${o.order_number}</title>
            <style>
                * { font-family: ui-monospace, 'Courier New', monospace; }
                body { width: 300px; margin: 0 auto; padding: 16px; color: #000; }
                h1 { font-size: 16px; text-align: center; margin: 0 0 4px; }
                .muted { color: #555; font-size: 11px; text-align: center; margin: 0; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                td { padding: 2px 0; vertical-align: top; }
                .r { text-align: right; white-space: nowrap; }
                .sub { padding-left: 12px; color: #666; font-size: 11px; }
                hr { border: none; border-top: 1px dashed #999; margin: 8px 0; }
                .row { display: flex; justify-content: space-between; font-size: 12px; }
                .total { font-weight: bold; font-size: 14px; }
                .meta { font-size: 11px; color: #333; margin: 2px 0; }
            </style></head><body>
            <h1>Store Receipt</h1>
            <p class="muted">Order #${o.order_number}</p>
            <p class="muted">${o.created_at ? new Date(o.created_at).toLocaleString() : ''}</p>
            <hr/>
            <p class="meta">Customer: ${o.customer_name || 'Guest'}</p>
            ${o.customer_email ? `<p class="meta">${o.customer_email}</p>` : ''}
            <p class="meta">Fulfilment: ${o.shipping_method || '—'}</p>
            <hr/>
            <table>${rows.join('')}</table>
            <hr/>
            <div class="row"><span>Subtotal</span><span>${formatMoney(o.subtotal)}</span></div>
            <div class="row"><span>Shipping</span><span>${formatMoney(o.shipping_cost)}</span></div>
            ${Number(o.tax_amount) ? `<div class="row"><span>Tax</span><span>${formatMoney(o.tax_amount)}</span></div>` : ''}
            ${Number(o.discount_amount) ? `<div class="row"><span>Discount</span><span>-${formatMoney(o.discount_amount)}</span></div>` : ''}
            <div class="row total"><span>Total</span><span>${formatMoney(o.total)}</span></div>
            <hr/>
            <p class="meta">Payment: ${(o.payment_method || '').replace('_', ' ')} (${o.payment_status})</p>
            <p class="muted">Thank you!</p>
            </body></html>`;

        const w = window.open('', 'PRINT', 'height=640,width=400');
        if (!w) { toast.error('Allow pop-ups to print the receipt'); return; }
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
        w.close();
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900/80 py-6 rounded-md pb-40">
            <div className="container mx-auto px-4">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Point of Sale</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create customer orders quickly and easily</p>
                    </div>

                    <CustomerModeSelector
                        mode={customerMode}
                        selectedCustomer={selectedCustomer}
                        onModeChange={handleModeChange}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 space-y-6">
                        <ProductSearch onAddItem={handleAddToCart} />
                        <PosPaymentMethod value={paymentMethod} onChange={setPaymentMethod} />
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        {customerMode === 'customer' ? (
                            <CustomerManager
                                onSelectCustomer={handleCustomerSelect}
                                selectedCustomer={selectedCustomer}
                                cartItems={cart}
                            />
                        ) : (
                            <GuestCheckout />
                        )}

                        <PosCart
                            cart={cart}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemoveItem={handleRemoveItem}
                            onClearCart={handleClearCart}
                            onCheckout={handleCreateOrder}
                            shippingCost={shippingCost}
                            selectedAddress={selectedAddress}
                            isLoadingShipping={isShippingLoading}
                        />
                    </div>
                </div>


                {/* Receipt Dialog */}
                <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
                    <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                        <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-white">Order Completed!</DialogTitle>
                            <DialogDescription className="text-gray-500 dark:text-gray-400">
                                Order #{lastOrder?.order_number} has been created successfully.
                            </DialogDescription>
                        </DialogHeader>

                        {lastOrder ? (
                            <div className="space-y-4">
                                {/* Meta */}
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Order Number</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{lastOrder.order_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Date</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {lastOrder.created_at ? new Date(lastOrder.created_at).toLocaleString() : '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Customer</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{lastOrder.customer_name || 'Guest'}</span>
                                    </div>
                                    {lastOrder.customer_email && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Email</span>
                                            <span className="font-medium text-gray-900 dark:text-white truncate max-w-[60%]">{lastOrder.customer_email}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Fulfilment</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{lastOrder.shipping_method || '—'}</span>
                                    </div>
                                </div>

                                {/* Line items */}
                                <div className="border border-gray-200 dark:border-gray-800 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                                    {(lastOrder.items || []).map((it: any) => (
                                        <div key={it.id} className="flex justify-between gap-3 p-3 text-sm">
                                            <span className="text-gray-700 dark:text-gray-300">
                                                <span className="text-gray-500 dark:text-gray-500">{it.quantity} × </span>{it.product_title}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                {formatMoney(it.total_price)}
                                            </span>
                                        </div>
                                    ))}
                                    {(lastOrder.bundles || []).map((b: any) => (
                                        <div key={b.bundle_id} className="p-3 text-sm">
                                            <div className="flex justify-between gap-3">
                                                <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                                    <Tag className="h-3 w-3" />{b.bundle_name || 'Bundle'}
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                    {formatMoney(b.total)}
                                                </span>
                                            </div>
                                            {(b.items || []).map((it: any, idx: number) => (
                                                <div key={idx} className="pl-4 text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    {it.quantity} × {it.product_title}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                    {(!lastOrder.items?.length && !lastOrder.bundles?.length) && (
                                        <div className="p-3 text-sm text-gray-500">No items</div>
                                    )}
                                </div>

                                {/* Totals */}
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                        <span className="text-gray-900 dark:text-white">{formatMoney(lastOrder.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                        <span className="text-gray-900 dark:text-white">{formatMoney(lastOrder.shipping_cost)}</span>
                                    </div>
                                    {Number(lastOrder.tax_amount) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Tax</span>
                                            <span className="text-gray-900 dark:text-white">{formatMoney(lastOrder.tax_amount)}</span>
                                        </div>
                                    )}
                                    {Number(lastOrder.discount_amount) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Discount</span>
                                            <span className="text-emerald-600 dark:text-emerald-400">-{formatMoney(lastOrder.discount_amount)}</span>
                                        </div>
                                    )}
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-base font-semibold">
                                        <span className="text-gray-900 dark:text-white">Total</span>
                                        <span className="text-gray-900 dark:text-white">{formatMoney(lastOrder.total)}</span>
                                    </div>
                                </div>

                                {/* Payment */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                                        {(lastOrder.payment_method || '').replace('_', ' ')}
                                    </span>
                                    <Badge variant="outline" className={
                                        lastOrder.payment_status === 'paid'
                                            ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400'
                                            : 'text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400'
                                    }>
                                        {lastOrder.payment_status}
                                    </Badge>
                                </div>

                                <div className="flex gap-3">
                                    <Button onClick={() => router.push(`/dashboard/orders/${lastOrder.id}`)} className="flex-1">View Order</Button>
                                    <Button variant="outline" onClick={handlePrintReceipt} className="gap-2 border-gray-200 dark:border-gray-800">
                                        <Printer className="h-4 w-4" />
                                        Print
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-sm text-gray-500">Order details unavailable.</div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Loading Overlay */}
                {isCheckingOut && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 flex items-center gap-3 shadow-xl">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-900 dark:text-white" />
                            <span className="text-gray-900 dark:text-white">Processing order...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
