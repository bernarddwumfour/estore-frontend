export type ServiceStatus = 'draft' | 'published' | 'archived';
export type PricingType = 'fixed' | 'from' | 'quote';

export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  image: string | null;
  is_active: boolean;
  is_hidden: boolean;
  sort_order: number;
  meta_title: string;
  meta_description: string;
};

export type ServiceOption = {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricing_type: PricingType;
  price: string | null;
  duration_minutes: number | null;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
};

export type ServiceImage = {
  id: string;
  url: string;
  image_type: 'main' | 'gallery' | 'thumbnail';
  alt_text: string;
  order: number;
};

export type AdminService = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: ServiceCategory | null;
  features: string[];
  status: ServiceStatus;
  is_featured: boolean;
  sort_order: number;
  meta_title: string;
  meta_description: string;
  options: ServiceOption[];
  images: ServiceImage[];
  created_at: string;
};
