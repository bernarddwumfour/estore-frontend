export type ProductOptionValue = string;

export type ProductOptions = Record<string, ProductOptionValue[]>;

export type VariantAttributes = Record<string, ProductOptionValue>;

export interface ProductVariant {
  sku: string;
  attributes: VariantAttributes;
  price: number;
  discountAmount: number;
  stock: number;
  images: string[];
}

export interface ProductType  {
  id: string
  title: string
  slug: string
  description: string
  category: {
    id: string
    name: string
    slug: string
  }
  features: string[]
  options: Record<string, string[]>
  min_price: number
  max_price: number
  average_rating: number
  total_reviews: number
  total_stock: number
  has_stock: boolean
  is_featured: boolean
  is_bestseller: boolean
  is_new: boolean
  default_variant: {
    sku: string
    price: number
    discounted_price: number
    stock: number
    attributes: Record<string, string>
    images: string[]
  } | null
  created_at: string
}

