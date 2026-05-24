// app/dashboard/products/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Plus, Edit, Trash2, Eye, Copy,
  CheckCircle, XCircle, Star, TrendingUp, Sparkles,
  Package, EyeOff, Archive, FileText, Upload, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { ActionsDropdown, type ActionItem } from '@/widgets/ActionsDropdown/ActionsDropdown';
import ProductForm from './ProductForm';
import ProductVariantForm from './ProductVariantForm';
import ProductDetailCard from './ProductDetails';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { CustomSheet } from '@/widgets/CustomSheet/CustomSheet';
import { DataTable } from '@/widgets/Customtable/DataTable';
import ProductVariantsList from './ProductVariantsList';
import { InfoDialog } from '@/widgets/CustomDialog/InfoDialog';
import { CustomPagination, PaginationMeta } from '@/widgets/CustomPagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/CustomFilter/CustomFilter';
import { CustomSort, SortConfig } from '@/widgets/CustomSort/CustomSort';

// Types
interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  features: string[];
  options: Record<string, string[]>;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  has_stock: boolean;
  total_stock: number;
  min_price: number;
  max_price: number;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  published_at: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

// Fetch products with pagination and filters
const fetchProducts = async (params?: any): Promise<{
  data: {
    products: Product[];
    total: number;
    pagination: PaginationMeta;
  }
}> => {
  const queryParams = new URLSearchParams();

  // Always include page and limit
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  // Only add filters if they have values (not empty strings)
  if (params?.search && params.search !== '') queryParams.append('search', params.search);
  if (params?.status && params.status !== '') queryParams.append('status', params.status);
  if (params?.is_featured && params.is_featured !== '') queryParams.append('is_featured', params.is_featured);
  if (params?.is_bestseller && params.is_bestseller !== '') queryParams.append('is_bestseller', params.is_bestseller);
  if (params?.is_new && params.is_new !== '') queryParams.append('is_new', params.is_new);
  if (params?.has_stock && params.has_stock !== '') queryParams.append('has_stock', params.has_stock);
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

  const url = `${endpoints.products.adminlistProducts}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await securityAxios.get(url);
  return response.data;
};

// Bulk action mutation
const bulkProductAction = async (action: string, productIds: string[]) => {
  const response = await securityAxios.post(endpoints.products.bulkProductAction, {
    action,
    product_ids: productIds,
  });
  return response.data;
};

// Filter configuration
const filterConfig: FilterConfig = {
  fields: [
    {
      name: 'status',
      type: 'select',
      placeholder: 'Status',
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
        { value: 'archived', label: 'Archived' },
      ],
      defaultValue: '',
      width: '110px',
    },
    {
      name: 'is_featured',
      type: 'select',
      placeholder: 'Featured',
      options: [
        { value: 'true', label: 'Featured' },
        { value: 'false', label: 'Not Featured' },
      ],
      defaultValue: '',
      width: '110px',
    },
    {
      name: 'is_bestseller',
      type: 'select',
      placeholder: 'Bestseller',
      options: [
        { value: 'true', label: 'Bestseller' },
        { value: 'false', label: 'Not Bestseller' },
      ],
      defaultValue: '',
      width: '110px',
    },
    {
      name: 'is_new',
      type: 'select',
      placeholder: 'New Arrival',
      options: [
        { value: 'true', label: 'New' },
        { value: 'false', label: 'Not New' },
      ],
      defaultValue: '',
      width: '120px',
    },
    {
      name: 'has_stock',
      type: 'select',
      placeholder: 'Stock Status',
      options: [
        { value: 'true', label: 'In Stock' },
        { value: 'false', label: 'Out of Stock' },
      ],
      defaultValue: '',
      width: '120px',
    },
  ],
  searchPlaceholder: 'Search by title, description, or SKU...',
  showSearch: true,
};

// Sort configuration
const sortConfig: SortConfig = {
  options: [
    { value: 'created_at', label: 'Created Date' },
    { value: 'title', label: 'Title' },
    { value: 'min_price', label: 'Price' },
    { value: 'total_stock', label: 'Stock' },
    { value: 'average_rating', label: 'Rating' },
  ],
  defaultSortBy: 'created_at',
  defaultSortOrder: 'desc',
};

export default function ProductsPage() {
  const queryClient = useQueryClient();

  // State for dialogs/sheets
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [addingVariantTo, setAddingVariantTo] = useState<Product | null>(null);
  const [viewingVariantsFor, setViewingVariantsFor] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Filter and pagination state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    is_featured: '',
    is_bestseller: '',
    is_new: '',
    has_stock: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    limit: 20,
  });

  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'info' | 'success' | 'error';
    onConfirm: () => void;
    itemName?: string;
  }>({
    open: false,
    title: '',
    message: '',
    variant: 'error',
    onConfirm: () => { },
  });

  // Query for products
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-products', filters],
    queryFn: () => fetchProducts(filters),
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: ({ action, ids }: { action: string; ids: string[] }) =>
      bulkProductAction(action, ids),
    onSuccess: (response) => {
      const { data, message } = response;
      const { success_count, failed_count } = data;

      if (success_count > 0) {
        toast.success(message || `Processed ${success_count} products successfully`);
      }

      if (failed_count > 0) {
        const failedNames = data.failed?.map((f: any) => f.name).join(', ') || '';
        toast.error(`${failed_count} failed: ${failedNames}`);
      }

      refetch();
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Bulk action failed');
    },
  });

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleLimitChange = (limit: number) => {
    setFilters({ ...filters, limit, page: 1 });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1,
    });
  };

  // Handle sort changes
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters({
      ...filters,
      sort_by: sortBy,
      sort_order: sortOrder,
      page: 1,
    });
  };

  // Refresh handler
  const handleRefresh = () => {
    refetch();
    toast.success('Products refreshed');
  };

  // Reset all filters and sort
  const handleReset = () => {
    setFilters({
      search: '',
      status: '',
      is_featured: '',
      is_bestseller: '',
      is_new: '',
      has_stock: '',
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
      limit: 20,
    });
  };

  // Single action helpers with InfoDialog
  const handleStatusChange = (product: Product, newStatus: string) => {
    const statusMap: Record<string, { title: string; message: string; variant: 'info' | 'error' }> = {
      publish: {
        title: 'Publish Product',
        message: `Are you sure you want to publish "${product.title}"? It will be visible to customers.`,
        variant: 'info'
      },
      draft: {
        title: 'Move to Draft',
        message: `Are you sure you want to move "${product.title}" to draft? It will be hidden from customers.`,
        variant: 'info'
      },
      archive: {
        title: 'Archive Product',
        message: `Are you sure you want to archive "${product.title}"?`,
        variant: 'info'
      },
    };

    const config = statusMap[newStatus];
    if (config) {
      setConfirmDialog({
        open: true,
        title: config.title,
        message: config.message,
        variant: config.variant,
        onConfirm: () => {
          bulkActionMutation.mutate({ action: newStatus, ids: [product.id] });
          setConfirmDialog({ ...confirmDialog, open: false });
        },
        itemName: product.title,
      });
    }
  };

  const handleToggleFeatured = (product: Product) => {
    const action = product.is_featured ? 'unfeature' : 'feature';
    const actionText = product.is_featured ? 'Remove Featured' : 'Mark as Featured';

    setConfirmDialog({
      open: true,
      title: actionText,
      message: `Are you sure you want to ${actionText.toLowerCase()} "${product.title}"?`,
      variant: 'info',
      onConfirm: () => {
        bulkActionMutation.mutate({ action, ids: [product.id] });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: product.title,
    });
  };

  const handleToggleBestseller = (product: Product) => {
    const action = product.is_bestseller ? 'unbestseller' : 'bestseller';
    const actionText = product.is_bestseller ? 'Remove Bestseller' : 'Mark as Bestseller';

    setConfirmDialog({
      open: true,
      title: actionText,
      message: `Are you sure you want to ${actionText.toLowerCase()} "${product.title}"?`,
      variant: 'info',
      onConfirm: () => {
        bulkActionMutation.mutate({ action, ids: [product.id] });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: product.title,
    });
  };

  const handleToggleNew = (product: Product) => {
    const action = product.is_new ? 'unnew' : 'new';
    const actionText = product.is_new ? 'Remove New' : 'Mark as New';

    setConfirmDialog({
      open: true,
      title: actionText,
      message: `Are you sure you want to ${actionText.toLowerCase()} "${product.title}"?`,
      variant: 'info',
      onConfirm: () => {
        bulkActionMutation.mutate({ action, ids: [product.id] });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: product.title,
    });
  };

  const handleDelete = (product: Product) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.title}"? This action cannot be undone. All variants and images will also be deleted.`,
      variant: 'error',
      onConfirm: () => {
        bulkActionMutation.mutate({ action: 'delete', ids: [product.id] });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: product.title,
    });
  };

  // Bulk actions with InfoDialog
  const handleBulkPublish = (selectedItems: Product[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Publish Products',
      message: `Are you sure you want to publish ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''}? They will be visible to customers.`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'publish', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkDraft = (selectedItems: Product[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Move to Draft',
      message: `Are you sure you want to move ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''} to draft? They will be hidden from customers.`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'draft', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkArchive = (selectedItems: Product[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Archive Products',
      message: `Are you sure you want to archive ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''}?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'archive', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkFeature = (selectedItems: Product[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Mark as Featured',
      message: `Are you sure you want to mark ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''} as featured?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'feature', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkUnfeature = (selectedItems: Product[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Remove Featured',
      message: `Are you sure you want to remove featured status from ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''}?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'unfeature', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkBestseller = (selectedItems: Product[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Mark as Bestseller',
      message: `Are you sure you want to mark ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''} as bestsellers?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'bestseller', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkUnbestseller = (selectedItems: Product[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Remove Bestseller',
      message: `Are you sure you want to remove bestseller status from ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''}?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'unbestseller', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkNew = (selectedItems: Product[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Mark as New',
      message: `Are you sure you want to mark ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''} as new?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'new', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkUnnew = (selectedItems: Product[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Remove New',
      message: `Are you sure you want to remove new status from ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''}?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'unnew', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkDelete = (selectedItems: Product[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Delete Products',
      message: `Are you sure you want to delete ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''}? This action cannot be undone.`,
      variant: 'error',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'delete', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkExport = (selectedItems: Product[]) => {
    const exportData = selectedItems.map(item => ({
      title: item.title,
      status: item.status,
      is_featured: item.is_featured,
      is_bestseller: item.is_bestseller,
      is_new: item.is_new,
      min_price: item.min_price,
      max_price: item.max_price,
      total_stock: item.total_stock,
      average_rating: item.average_rating,
      features: item.features,
      options: item.options,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedItems.length} products`);
  };

  // Define actions for each product
  const getProductActions = (product: Product): ActionItem[] => {
    const actions: ActionItem[] = [];

    actions.push({
      label: 'Edit Product',
      icon: <Edit size={14} />,
      onClick: () => setEditingProduct(product),
      color: 'blue',
    });

    actions.push({
      label: 'Add Variant',
      icon: <Plus size={14} />,
      onClick: () => setAddingVariantTo(product),
      color: 'violet',
    });

    actions.push({
      label: 'View Details',
      icon: <Eye size={14} />,
      onClick: () => setViewingProduct(product),
      color: 'emerald',
    });

    actions.push({
      label: 'View Variants',
      icon: <Package size={14} />,
      onClick: () => setViewingVariantsFor(product),
      color: 'amber',
    });

    actions.push({
      label: product.is_featured ? 'Remove Featured' : 'Mark Featured',
      icon: <Star size={14} />,
      onClick: () => handleToggleFeatured(product),
      color: 'amber',
    });

    actions.push({
      label: product.is_bestseller ? 'Remove Bestseller' : 'Mark Bestseller',
      icon: <TrendingUp size={14} />,
      onClick: () => handleToggleBestseller(product),
      color: 'orange',
    });

    actions.push({
      label: product.is_new ? 'Remove New' : 'Mark New',
      icon: <Sparkles size={14} />,
      onClick: () => handleToggleNew(product),
      color: 'emerald',
    });

    actions.push({
      label: product.status === 'published' ? 'Move to Draft' : product.status === 'draft' ? 'Publish' : 'Restore from Archive',
      icon: product.status === 'published' ? <FileText size={14} /> : product.status === 'draft' ? <CheckCircle size={14} /> : <Archive size={14} />,
      onClick: () => {
        if (product.status === 'published') handleStatusChange(product, 'draft');
        else if (product.status === 'draft') handleStatusChange(product, 'publish');
        else handleStatusChange(product, 'draft');
      },
      color: product.status === 'published' ? 'blue' : product.status === 'draft' ? 'emerald' : 'amber',
    });

    actions.push({
      label: 'Delete Product',
      icon: <Trash2 size={14} />,
      variant: 'destructive',
      onClick: () => handleDelete(product),
    });

    return actions;
  };

  // Bulk actions
  const bulkActions = [
    { label: 'Publish Selected', icon: <CheckCircle size={14} />, onClick: handleBulkPublish, color: 'emerald' as const },
    { label: 'Move to Draft', icon: <FileText size={14} />, onClick: handleBulkDraft, color: 'amber' as const },
    { label: 'Archive Selected', icon: <Archive size={14} />, onClick: handleBulkArchive, color: 'blue' as const, variant: 'destructive' as const },
    { label: 'Mark Featured', icon: <Star size={14} />, onClick: handleBulkFeature, color: 'violet' as const },
    { label: 'Remove Featured', icon: <Star size={14} />, onClick: handleBulkUnfeature, color: 'blue' as const },
    { label: 'Mark Bestseller', icon: <TrendingUp size={14} />, onClick: handleBulkBestseller, color: 'orange' as const },
    { label: 'Remove Bestseller', icon: <TrendingUp size={14} />, onClick: handleBulkUnbestseller, color: 'amber' as const },
    { label: 'Mark New', icon: <Sparkles size={14} />, onClick: handleBulkNew, color: 'emerald' as const },
    { label: 'Remove New', icon: <Sparkles size={14} />, onClick: handleBulkUnnew, color: 'blue' as const },
    { label: 'Delete Selected', icon: <Trash2 size={14} />, onClick: handleBulkDelete, color: 'rose' as const, variant: 'destructive' as const },
    { label: 'Export Selected', icon: <Upload size={14} />, onClick: handleBulkExport, color: 'violet' as const },
  ];

  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination;

  if (isLoading && !products.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Error loading products: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Description */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Products</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your product catalog</p>
      </div>

      {/* New Product Button and Refresh */}
      <div className="flex justify-between items-center">
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus size={16} />
          New Product
        </Button>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      {/* Filters and Sort Row */}
      <div className="flex flex-wrap gap-32 items-start justify-between">
        <div className="flex-1">
          <CustomFilter
            config={filterConfig}
            filters={{
              search: filters.search,
              status: filters.status,
              is_featured: filters.is_featured,
              is_bestseller: filters.is_bestseller,
              is_new: filters.is_new,
              has_stock: filters.has_stock,
            }}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        </div>
        <CustomSort
          config={sortConfig}
          onSortChange={handleSortChange}
        />
      </div>

      {/* Confirmation Dialog */}
      <InfoDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        infoMessage={confirmDialog.message}
        variant={confirmDialog.variant}
        primaryButtonText="Confirm"
        secondaryButtonText="Cancel"
        primaryAction={confirmDialog.onConfirm}
        secondaryAction={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />

      {/* ==================== DIALOGS & SHEETS ==================== */}

      {/* Create Product Dialog */}
      <CustomDialog
        title="Create New Product"
        description="Fill in the details to create a new product."
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        contentWidth="max-w-[800px]"
      >
        <ProductForm
          onSuccess={() => {
            setIsCreateDialogOpen(false);
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          }}
        />
      </CustomDialog>

      {/* Edit Product Dialog */}
      <CustomDialog
        title="Edit Product"
        description="Update the product details."
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        contentWidth="max-w-[800px]"
      >
        {editingProduct && (
          <ProductForm
            productId={editingProduct.id}
            onSuccess={() => {
              setEditingProduct(null);
              refetch();
              queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            }}
            onCancel={() => setEditingProduct(null)}
          />
        )}
      </CustomDialog>

      {/* Add Variant Dialog */}
      <CustomDialog
        title="Add Product Variant"
        description="Add a new variant to this product."
        open={!!addingVariantTo}
        onOpenChange={(open) => !open && setAddingVariantTo(null)}
        contentWidth="max-w-[1200px]"
      >
        {addingVariantTo && (
          <ProductVariantForm
            productId={addingVariantTo.id}
            onSuccess={() => {
              setAddingVariantTo(null);
              refetch();
              queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            }}
          />
        )}
      </CustomDialog>

      {/* View Details Sheet */}
      <CustomSheet
        title="Product Details"
        description="Full product information"
        side="bottom"
        size="lg"
        open={!!viewingProduct}
        onOpenChange={(open) => !open && setViewingProduct(null)}
      >
        {viewingProduct && (
          <ProductDetailCard
            productId={viewingProduct.id}
            onClose={() => setViewingProduct(null)}
          />
        )}
      </CustomSheet>

      {/* View Variants Sheet */}
      <CustomSheet
        title="Product Variants"
        description={`Manage variants for ${viewingVariantsFor?.title || 'product'}`}
        side="bottom"
        size="lg"
        open={!!viewingVariantsFor}
        onOpenChange={(open) => !open && setViewingVariantsFor(null)}
      >
        {viewingVariantsFor && (
          <ProductVariantsList
            productId={viewingVariantsFor.id}
            productTitle={viewingVariantsFor.title}
            onClose={() => setViewingVariantsFor(null)}
          />
        )}
      </CustomSheet>

      {/* Data Table */}
      <DataTable
        data={products}
        renderActions={(product: Product) => (
          <ActionsDropdown
            actions={getProductActions(product)}
            maxVisible={3}
            showLabels={false}
            buttonSize="sm"
          />
        )}
        bulkActions={bulkActions}
        bulkActionsMessage="Select products to publish, draft, archive, or modify status"
        excludeColumns={['id', 'description', 'slug', 'created_at', 'published_at', 'total_reviews', 'average_rating']}
        arrays={{
          features: { maxItems: 3 },
          options: { maxItems: 3 },
        }}
        dots={{
          status: {
            published: 'emerald',
            draft: 'amber',
            archived: 'rose',
          },
          has_stock: {
            true: 'emerald',
            false: 'rose',
          },
        }}
        badges={{
          is_featured: {
            true: 'amber',
            false: 'zinc',
          },
          is_bestseller: {
            true: 'orange',
            false: 'zinc',
          },
          is_new: {
            true: 'emerald',
            false: 'zinc',
          },
        }}
        links={{
          title: (product: Product) => `/dashboard/products/${product.id}`,
        }}
        emptyTitle="No Products Found"
        emptyDescription="Create your first product to start selling."
        onSelectionChange={(selected) => {
          console.log('Selected products:', selected.length);
        }}
      />

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <CustomPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          showLimitSelector={true}
          limitOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  );
}