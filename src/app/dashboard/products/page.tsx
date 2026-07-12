// app/dashboard/products/page.tsx
'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Plus, Edit, Trash2, Eye, Copy,
  CheckCircle, XCircle, Star, TrendingUp, Sparkles,
  Package, EyeOff, Archive, FileText, Upload, RefreshCw, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { ActionsDropdown, type ActionItem } from '@/widgets/actions-dropdown/ActionsDropdown';
import ProductForm from './(components)/ProductForm';
import ProductVariantForm from './(components)/ProductVariantForm';
import ProductDetailCard from './(components)/ProductDetails';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import { CustomSheet } from '@/widgets/custom-sheet/CustomSheet';
import { DataTable } from '@/widgets/custom-table/DataTable';
import ProductVariantsList from './(components)/ProductVariantsList';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import { CustomPagination, PaginationMeta } from '@/widgets/custom-pagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomSortFromUrl, SortConfig } from '@/widgets/custom-sort/CustomSortFromUrl';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';

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

// Track loading states for individual products
interface LoadingState {
  [productId: string]: {
    delete: boolean;
    publish: boolean;
    draft: boolean;
    archive: boolean;
    feature: boolean;
    unfeature: boolean;
    bestseller: boolean;
    unbestseller: boolean;
    new: boolean;
    unnew: boolean;
  };
}

// Fetch products with pagination - directly from URL params
const fetchProducts = async (params: {
  page: number;
  limit: number;
  search: string;
  status: string;
  is_featured: string;
  is_bestseller: string;
  is_new: string;
  has_stock: string;
  sort_by: string;
  sort_order: string;
}): Promise<{
  data: {
    products: Product[];
    total: number;
    pagination: PaginationMeta;
  }
}> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.is_featured) queryParams.append('is_featured', params.is_featured);
  if (params.is_bestseller) queryParams.append('is_bestseller', params.is_bestseller);
  if (params.is_new) queryParams.append('is_new', params.is_new);
  if (params.has_stock) queryParams.append('has_stock', params.has_stock);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_order) queryParams.append('sort_order', params.sort_order);

  const url = `${endpoints.products.adminListProducts}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await securityAxios.get(url);
  return response.data;
};

// Bulk action mutation
const bulkProductAction = async (action: string, productIds: string[]) => {
  const response = await securityAxios.post(endpoints.products.adminBulkProductActions, {
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
  urlParamPrefix: 'product',
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
  urlParamPrefix: 'product',
};

// Main content component that uses useSearchParams
function ProductsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for dialogs/sheets
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [addingVariantTo, setAddingVariantTo] = useState<Product | null>(null);
  const [viewingVariantsFor, setViewingVariantsFor] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Track loading states for individual products
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  // Track which bulk action is currently loading
  const [activeBulkAction, setActiveBulkAction] = useState<string | null>(null);

  // Track refresh loading
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Build fetch params directly from URL
  const fetchParams = useMemo(() => {
    const sortBy = searchParams.get('product_sort_by') || 'created_at';
    const sortOrder = searchParams.get('product_sort_order') || 'desc';

    return {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      search: searchParams.get('search') || '',
      status: searchParams.get('product_status') || '',
      is_featured: searchParams.get('product_is_featured') || '',
      is_bestseller: searchParams.get('product_is_bestseller') || '',
      is_new: searchParams.get('product_is_new') || '',
      has_stock: searchParams.get('product_has_stock') || '',
      sort_by: sortBy,
      sort_order: sortOrder,
    };
  }, [searchParams]);

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

  const queryClient = useQueryClient();

  // Helper function to invalidate all related queries
  const invalidateProductQueries = () => {
    queryClient.invalidateQueries({ queryKey: [endpoints.products.adminListProducts] });
  };

  // Set loading state for a specific product action
  const setProductLoading = (productId: string, action: keyof LoadingState[string], isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [action]: isLoading,
      }
    }));
  };

  // Check if any action is loading for a specific product
  const isProductLoading = (productId: string) => {
    const state = loadingStates[productId];
    if (!state) return false;
    return Object.values(state).some(isLoading => isLoading === true);
  };

  // Check if ANY action is loading globally (including bulk)
  const isAnyActionLoading = () => {
    if (activeBulkAction) return true;
    return Object.values(loadingStates).some(rowState =>
      rowState && Object.values(rowState).some(isLoading => isLoading === true)
    );
  };

  // Query for products - uses fetchParams directly
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [endpoints.products.adminListProducts, fetchParams],
    queryFn: () => fetchProducts(fetchParams),
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

      invalidateProductQueries();
      refetch();
    },
    onSettled: () => {
      setActiveBulkAction(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Bulk action failed');
    },
  });

  // Pagination handlers - update URL
  const handlePageChange = (page: number) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleLimitChange = (limit: number) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set('limit', limit.toString());
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Refresh handler
  const handleRefresh = async () => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Products refreshed');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Single action helpers with loading states
  const handleStatusChange = (product: Product, newStatus: string) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    const statusMap: Record<string, { title: string; message: string; variant: 'info' | 'error'; actionKey: keyof LoadingState[string] }> = {
      publish: {
        title: 'Publish Product',
        message: `Are you sure you want to publish "${product.title}"? It will be visible to customers.`,
        variant: 'info',
        actionKey: 'publish'
      },
      draft: {
        title: 'Move to Draft',
        message: `Are you sure you want to move "${product.title}" to draft? It will be hidden from customers.`,
        variant: 'info',
        actionKey: 'draft'
      },
      archive: {
        title: 'Archive Product',
        message: `Are you sure you want to archive "${product.title}"?`,
        variant: 'info',
        actionKey: 'archive'
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
          setProductLoading(product.id, config.actionKey, true);
          bulkActionMutation.mutate({ action: newStatus, ids: [product.id] }, {
            onSettled: () => {
              setProductLoading(product.id, config.actionKey, false);
            }
          });
          setConfirmDialog({ ...confirmDialog, open: false });
        },
        itemName: product.title,
      });
    }
  };

  const handleToggleFeatured = (product: Product) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    const action = product.is_featured ? 'unfeature' : 'feature';
    const actionText = product.is_featured ? 'Remove Featured' : 'Mark as Featured';
    const actionKey = product.is_featured ? 'unfeature' : 'feature';

    setConfirmDialog({
      open: true,
      title: actionText,
      message: `Are you sure you want to ${actionText.toLowerCase()} "${product.title}"?`,
      variant: 'info',
      onConfirm: () => {
        setProductLoading(product.id, actionKey, true);
        bulkActionMutation.mutate({ action, ids: [product.id] }, {
          onSettled: () => {
            setProductLoading(product.id, actionKey, false);
          }
        });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: product.title,
    });
  };

  const handleToggleBestseller = (product: Product) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    const action = product.is_bestseller ? 'unbestseller' : 'bestseller';
    const actionText = product.is_bestseller ? 'Remove Bestseller' : 'Mark as Bestseller';
    const actionKey = product.is_bestseller ? 'unbestseller' : 'bestseller';

    setConfirmDialog({
      open: true,
      title: actionText,
      message: `Are you sure you want to ${actionText.toLowerCase()} "${product.title}"?`,
      variant: 'info',
      onConfirm: () => {
        setProductLoading(product.id, actionKey, true);
        bulkActionMutation.mutate({ action, ids: [product.id] }, {
          onSettled: () => {
            setProductLoading(product.id, actionKey, false);
          }
        });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: product.title,
    });
  };

  const handleToggleNew = (product: Product) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    const action = product.is_new ? 'unnew' : 'new';
    const actionText = product.is_new ? 'Remove New' : 'Mark as New';
    const actionKey = product.is_new ? 'unnew' : 'new';

    setConfirmDialog({
      open: true,
      title: actionText,
      message: `Are you sure you want to ${actionText.toLowerCase()} "${product.title}"?`,
      variant: 'info',
      onConfirm: () => {
        setProductLoading(product.id, actionKey, true);
        bulkActionMutation.mutate({ action, ids: [product.id] }, {
          onSettled: () => {
            setProductLoading(product.id, actionKey, false);
          }
        });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: product.title,
    });
  };

  const handleDelete = (product: Product) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.title}"? This action cannot be undone. All variants and images will also be deleted.`,
      variant: 'error',
      onConfirm: () => {
        setProductLoading(product.id, 'delete', true);
        bulkActionMutation.mutate({ action: 'delete', ids: [product.id] }, {
          onSettled: () => {
            setProductLoading(product.id, 'delete', false);
          }
        });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: product.title,
    });
  };

  // Bulk actions with loading state
  const handleBulkPublish = (selectedItems: Product[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Publish Products',
      message: `Are you sure you want to publish ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''}? They will be visible to customers.`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('publish');
        bulkActionMutation.mutate({ action: 'publish', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkDraft = (selectedItems: Product[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Move to Draft',
      message: `Are you sure you want to move ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''} to draft? They will be hidden from customers.`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('draft');
        bulkActionMutation.mutate({ action: 'draft', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkArchive = (selectedItems: Product[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Archive Products',
      message: `Are you sure you want to archive ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''}?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('archive');
        bulkActionMutation.mutate({ action: 'archive', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkFeature = (selectedItems: Product[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Mark as Featured',
      message: `Are you sure you want to mark ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''} as featured?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('feature');
        bulkActionMutation.mutate({ action: 'feature', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkUnfeature = (selectedItems: Product[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Remove Featured',
      message: `Are you sure you want to remove featured status from ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''}?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('unfeature');
        bulkActionMutation.mutate({ action: 'unfeature', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkBestseller = (selectedItems: Product[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Mark as Bestseller',
      message: `Are you sure you want to mark ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''} as bestsellers?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('bestseller');
        bulkActionMutation.mutate({ action: 'bestseller', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkUnbestseller = (selectedItems: Product[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Remove Bestseller',
      message: `Are you sure you want to remove bestseller status from ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''}?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('unbestseller');
        bulkActionMutation.mutate({ action: 'unbestseller', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkNew = (selectedItems: Product[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Mark as New',
      message: `Are you sure you want to mark ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''} as new?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('new');
        bulkActionMutation.mutate({ action: 'new', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkUnnew = (selectedItems: Product[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Remove New',
      message: `Are you sure you want to remove new status from ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''}?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('unnew');
        bulkActionMutation.mutate({ action: 'unnew', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkDelete = (selectedItems: Product[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Delete Products',
      message: `Are you sure you want to delete ${selectedItems.length} selected product${selectedItems.length !== 1 ? 's' : ''}? This action cannot be undone.`,
      variant: 'error',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('delete');
        bulkActionMutation.mutate({ action: 'delete', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkExport = (selectedItems: Product[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

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

  // Define actions for each product with loading states
  const getProductActions = (product: Product): ActionItem[] => {
    const isAnyLoading = isAnyActionLoading();
    const isRowLoading = isProductLoading(product.id);
    const isModifyDisabled = isAnyLoading;

    return [
      {
        label: 'View Details',
        icon: <Eye size={14} />,
        onClick: () => setViewingProduct(product),
        color: 'emerald',
        disabled: false,
      },
      {
        label: 'Edit Product',
        icon: <Edit size={14} />,
        onClick: () => setEditingProduct(product),
        color: 'blue',
        disabled: isModifyDisabled,
      },
      {
        label: 'Add Variant',
        icon: <Plus size={14} />,
        onClick: () => setAddingVariantTo(product),
        color: 'violet',
        disabled: isModifyDisabled,
      },
      {
        label: 'View Variants',
        icon: <Package size={14} />,
        onClick: () => setViewingVariantsFor(product),
        color: 'amber',
        disabled: false,
      },
      {
        label: product.is_featured ? 'Remove Featured' : 'Mark Featured',
        icon: <Star size={14} />,
        onClick: () => handleToggleFeatured(product),
        color: 'amber',
        disabled: isModifyDisabled,
        loading: isRowLoading && (loadingStates[product.id]?.feature || loadingStates[product.id]?.unfeature),
      },
      {
        label: product.is_bestseller ? 'Remove Bestseller' : 'Mark Bestseller',
        icon: <TrendingUp size={14} />,
        onClick: () => handleToggleBestseller(product),
        color: 'orange',
        disabled: isModifyDisabled,
        loading: isRowLoading && (loadingStates[product.id]?.bestseller || loadingStates[product.id]?.unbestseller),
      },
      {
        label: product.is_new ? 'Remove New' : 'Mark New',
        icon: <Sparkles size={14} />,
        onClick: () => handleToggleNew(product),
        color: 'emerald',
        disabled: isModifyDisabled,
        loading: isRowLoading && (loadingStates[product.id]?.new || loadingStates[product.id]?.unnew),
      },
      {
        label: product.status === 'published' ? 'Move to Draft' : product.status === 'draft' ? 'Publish' : 'Restore from Archive',
        icon: product.status === 'published' ? <FileText size={14} /> : product.status === 'draft' ? <CheckCircle size={14} /> : <Archive size={14} />,
        onClick: () => {
          if (product.status === 'published') handleStatusChange(product, 'draft');
          else if (product.status === 'draft') handleStatusChange(product, 'publish');
          else handleStatusChange(product, 'draft');
        },
        color: product.status === 'published' ? 'blue' : product.status === 'draft' ? 'emerald' : 'amber',
        disabled: isModifyDisabled,
        loading: isRowLoading && (loadingStates[product.id]?.publish || loadingStates[product.id]?.draft || loadingStates[product.id]?.archive),
      },
      {
        label: 'Delete Product',
        icon: <Trash2 size={14} />,
        variant: 'destructive',
        onClick: () => handleDelete(product),
        disabled: isModifyDisabled,
        loading: isRowLoading && loadingStates[product.id]?.delete,
      },
    ];
  };

  // Bulk actions array
  const bulkActions = [
    {
      label: 'Publish Selected',
      icon: activeBulkAction === 'publish' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />,
      onClick: handleBulkPublish,
      color: 'emerald' as const,
      disabled: isAnyActionLoading(),
    },
    {
      label: 'Move to Draft',
      icon: activeBulkAction === 'draft' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />,
      onClick: handleBulkDraft,
      color: 'amber' as const,
      disabled: isAnyActionLoading(),
    },
    {
      label: 'Archive Selected',
      icon: activeBulkAction === 'archive' ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />,
      onClick: handleBulkArchive,
      color: 'blue' as const,
      variant: 'destructive' as const,
      disabled: isAnyActionLoading(),
    },
    {
      label: 'Mark Featured',
      icon: activeBulkAction === 'feature' ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />,
      onClick: handleBulkFeature,
      color: 'violet' as const,
      disabled: isAnyActionLoading(),
    },
    {
      label: 'Remove Featured',
      icon: activeBulkAction === 'unfeature' ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />,
      onClick: handleBulkUnfeature,
      color: 'blue' as const,
      disabled: isAnyActionLoading(),
    },
    {
      label: 'Mark Bestseller',
      icon: activeBulkAction === 'bestseller' ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />,
      onClick: handleBulkBestseller,
      color: 'orange' as const,
      disabled: isAnyActionLoading(),
    },
    {
      label: 'Remove Bestseller',
      icon: activeBulkAction === 'unbestseller' ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />,
      onClick: handleBulkUnbestseller,
      color: 'amber' as const,
      disabled: isAnyActionLoading(),
    },
    {
      label: 'Mark New',
      icon: activeBulkAction === 'new' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />,
      onClick: handleBulkNew,
      color: 'emerald' as const,
      disabled: isAnyActionLoading(),
    },
    {
      label: 'Remove New',
      icon: activeBulkAction === 'unnew' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />,
      onClick: handleBulkUnnew,
      color: 'blue' as const,
      disabled: isAnyActionLoading(),
    },
    {
      label: 'Delete Selected',
      icon: activeBulkAction === 'delete' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />,
      onClick: handleBulkDelete,
      color: 'rose' as const,
      variant: 'destructive' as const,
      disabled: isAnyActionLoading(),
    },
    {
      label: 'Export Selected',
      icon: <Upload size={14} />,
      onClick: handleBulkExport,
      color: 'violet' as const,
      disabled: isAnyActionLoading(),
    },
  ];

  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination;

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your product catalog</p>
        </div>

        <div className="flex justify-between items-center">
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2" disabled={isAnyActionLoading()}>
            <Plus size={16} />
            New Product
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={isAnyActionLoading()}>
            {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </Button>
        </div>

        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">Error loading products: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Products</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your product catalog</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2" disabled={isAnyActionLoading()}>
          <Plus size={16} />
          New Product
        </Button>
        <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={isAnyActionLoading()}>
          {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </Button>
      </div>

      {/* Filters and Sort - CustomFilter and CustomSortFromUrl have their own Suspense internally */}
      <div className="flex flex-wrap gap-32 items-start justify-between">
        <div className="flex-1">
          <CustomFilter config={filterConfig} />
        </div>
        <CustomSortFromUrl config={sortConfig} />
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
            invalidateProductQueries();
            refetch();
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
              invalidateProductQueries();
              refetch();
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
              invalidateProductQueries();
              refetch();
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
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <>
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
            excludeColumns={['id', 'description', 'slug', 'created_at', 'published_at', 'total_reviews', 'average_rating', 'variants']}
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
        </>
      )}
    </div>
  );
}

// Main exported component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}