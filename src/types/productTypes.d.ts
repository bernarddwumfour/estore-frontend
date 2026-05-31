// types/productTypes.ts

export type ProductOptionValue = string;
export type ProductOptions = Record<string, ProductOptionValue[]>;
export type VariantAttributes = Record<string, ProductOptionValue>;

// Stock status for public users (no raw numbers)
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ProductVariantImage {
  id: string;
  url: string;
  alt_text: string;
  image_type: string;
  order: number;
}

export interface ProductVariant {
  id: string;
  sku: string;  // Masked for non-admin users
  attributes: VariantAttributes;
  price: number;
  discounted_price: number;
  discount_percentage: number;
  discount_amount: number;
  is_in_stock: boolean;
  stock_status: StockStatus;  // Public stock info (no raw numbers)
  is_default: boolean;
  images: ProductVariantImage[];
}

// Admin-only variant fields (not in public type)
export interface AdminProductVariant extends ProductVariant {
  is_active: boolean;
  is_low_stock: boolean;
  low_stock_threshold: number;
  stock: number;  // Raw stock - admin only
  cost_price: number;
  gross_profit: number;
  margin_percentage: number;
  markup_percentage: number;
  inventory_cost_value: number;
  potential_revenue: number;
  potential_profit: number;
  dimensions: {
    weight: number | null;
    height: number | null;
    width: number | null;
    depth: number | null;
  };
  created_at: string;
  updated_at: string;
}

export interface ProductType {
  id: string;
  title: string;
  slug: string;
  description: string;
  features: string[];
  options: Record<string, string[]>;
  min_price: number;
  max_price: number;
  average_rating: number;
  total_reviews: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  default_variant: ProductVariant | null;
  variants: ProductVariant[];
  // Admin-only fields (not in public type)
  status?: string;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
}

// For admin product list (includes status)
export interface AdminProductType extends ProductType {
  status: string;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  variants: AdminProductVariant[];
  default_variant: AdminProductVariant | null;
}