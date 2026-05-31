// types/promotionTypes.ts

export interface PromotionImage {
    id: string;
    url: string;
    type: 'banner' | 'thumbnail' | 'gallery';
    alt_text: string;
}

export interface PromotionItem {
    variant_id: string;
    sku: string;
    product_title: string;
    product_slug?: string;
    quantity: number;
    original_price: number;
    is_free: boolean;
    attributes?: Record<string, string>;
    image?: string;
}

export interface PromotionType {
    id: string;
    name: string;
    slug: string;
    description: string;
    bundle_price: number;
    original_total: number;
    savings_amount: number;
    savings_percentage: number;
    starts_at: string;
    ends_at: string | null;
    items: PromotionItem[];
    free_items: PromotionItem[];
    images: PromotionImage[];
    has_stock: boolean;
}

// Admin-only types (for dashboard)
export interface AdminPromotionItem extends PromotionItem {
    is_available: boolean;
    current_stock: number;
    current_price: number;
    cost_price_snapshot: number;
    item_gross_profit: number;
    item_margin_percentage: number;
    has_sufficient_stock: boolean;
}

export interface AdminPromotionType extends PromotionType {
    status: 'draft' | 'active' | 'paused' | 'ended';
    created_at: string;
    updated_at: string;
    created_by: {
        id: string;
        email: string;
    } | null;
    unavailable_items: Array<{
        sku: string;
        product_title: string;
        required: number;
        available: number;
    }>;
    bundle_cost: number;
    bundle_gross_profit: number;
    bundle_margin_percentage: number;
    items: AdminPromotionItem[];
    free_items: AdminPromotionItem[];
}