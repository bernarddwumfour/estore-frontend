// app/dashboard/products/categories/page.tsx
'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Plus, Edit, Trash2, Eye, FolderTree,
  EyeOff, Eye as EyeIcon, CheckCircle, XCircle, Upload, RefreshCw, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import CategoryForm from './CatergoryForm';
import { DataDisplay } from '@/widgets/data-display/DataDisplay';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { ActionItem, ActionsDropdown } from '@/widgets/actions-dropdown/ActionsDropdown';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import { CustomPagination, PaginationMeta } from '@/widgets/custom-pagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomSortFromUrl, SortConfig } from '@/widgets/custom-sort/CustomSortFromUrl';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  parent_name: string | null;
  image: string | null;
  full_path: string;
  is_active: boolean;
  is_hidden: boolean;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

// Track loading states for individual categories
interface LoadingState {
  [categoryId: string]: {
    delete: boolean;
    activate: boolean;
    deactivate: boolean;
    hide: boolean;
    unhide: boolean;
  };
}

// Fetch categories with pagination - directly from URL params
const fetchCategories = async (params: {
  page: number;
  limit: number;
  search: string;
  status: string;
  visibility: string;
  has_parent: string;
  created_after: string;
  sort_by: string;
  sort_order: string;
}): Promise<{
  data: {
    categories: Category[];
    total: number;
    pagination: PaginationMeta;
  }
}> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('is_active', params.status);
  if (params.visibility) queryParams.append('is_hidden', params.visibility);
  if (params.has_parent === 'true') queryParams.append('parent_id', 'not_null');
  if (params.has_parent === 'false') queryParams.append('parent_id', 'null');
  if (params.created_after) queryParams.append('created_after', params.created_after);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_order) queryParams.append('sort_order', params.sort_order);

  const url = `${endpoints.products.adminlistCategories}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await securityAxios.get(url);
  return response.data;
};

// Bulk action mutation
const bulkCategoryAction = async (action: string, categoryIds: string[]) => {
  const response = await securityAxios.post(endpoints.products.adminBulkCategoryAction, {
    action,
    category_ids: categoryIds,
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
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
      defaultValue: '',
      width: '110px',
    },
    {
      name: 'visibility',
      type: 'select',
      placeholder: 'Visibility',
      options: [
        { value: 'true', label: 'Hidden' },
        { value: 'false', label: 'Visible' },
      ],
      defaultValue: '',
      width: '110px',
    },
    {
      name: 'has_parent',
      type: 'select',
      placeholder: 'Has Parent',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      defaultValue: '',
      width: '110px',
    },
    {
      name: 'created_after',
      type: 'date',
      placeholder: 'Created After',
      defaultValue: '',
      width: '140px',
    },
  ],
  searchPlaceholder: 'Search categories by name, slug, or description...',
  showSearch: true,
  urlParamPrefix: 'category',
};

// Sort configuration
const sortConfig: SortConfig = {
  options: [
    { value: 'name', label: 'Name' },
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Updated Date' },
  ],
  defaultSortBy: 'name',
  defaultSortOrder: 'asc',
  urlParamPrefix: 'category',
};

// Main content component that uses useSearchParams
function CategoriesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [viewingPathCategory, setViewingPathCategory] = useState<Category | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Track loading states for individual categories
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  // Track which bulk action is currently loading
  const [activeBulkAction, setActiveBulkAction] = useState<string | null>(null);

  // Track refresh loading
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Build fetch params directly from URL
  const fetchParams = useMemo(() => {
    const sortBy = searchParams.get('category_sort_by') || 'name';
    const sortOrder = searchParams.get('category_sort_order') || 'asc';

    return {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      search: searchParams.get('search') || '',
      status: searchParams.get('category_status') || '',
      visibility: searchParams.get('category_visibility') || '',
      has_parent: searchParams.get('category_has_parent') || '',
      created_after: searchParams.get('category_created_after') || '',
      sort_by: sortBy,
      sort_order: sortOrder,
    };
  }, [searchParams]);

  // State for confirmation dialogs
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
  const invalidateCategoryQueries = () => {
    queryClient.invalidateQueries({ queryKey: [endpoints.products.adminlistCategories] });
  };

  // Set loading state for a specific category action
  const setCategoryLoading = (categoryId: string, action: keyof LoadingState[string], isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [action]: isLoading,
      }
    }));
  };

  // Check if any action is loading for a specific category
  const isCategoryLoading = (categoryId: string) => {
    const state = loadingStates[categoryId];
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

  // Query for categories - uses fetchParams directly
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [endpoints.products.adminlistCategories, fetchParams],
    queryFn: () => fetchCategories(fetchParams),
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: ({ action, ids }: { action: string; ids: string[] }) =>
      bulkCategoryAction(action, ids),
    onSuccess: (response) => {
      const { data, message } = response;
      const { success_count, failed_count } = data;
      if (success_count > 0) toast.success(message || `Processed ${success_count} categories`);
      if (failed_count > 0) toast.error(`${failed_count} failed`);
      invalidateCategoryQueries();
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
      toast.success('Categories refreshed');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Single action helpers with loading states
  const handleDelete = (category: Category) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    if (category.full_path !== category.name) {
      toast.error('Cannot delete category that has subcategories');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      variant: 'error',
      onConfirm: () => {
        setCategoryLoading(category.id, 'delete', true);
        bulkActionMutation.mutate({
          action: 'delete',
          ids: [category.id]
        }, {
          onSettled: () => {
            setCategoryLoading(category.id, 'delete', false);
          }
        });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: category.name,
    });
  };

  const handleToggleActive = (category: Category) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    const actionText = category.is_active ? 'Deactivate' : 'Activate';
    const action = category.is_active ? 'deactivate' : 'activate';

    setConfirmDialog({
      open: true,
      title: `${actionText} Category`,
      message: `Are you sure you want to ${actionText.toLowerCase()} "${category.name}"?`,
      variant: category.is_active ? 'error' : 'info',
      onConfirm: () => {
        setCategoryLoading(category.id, category.is_active ? 'deactivate' : 'activate', true);
        bulkActionMutation.mutate({
          action,
          ids: [category.id]
        }, {
          onSettled: () => {
            setCategoryLoading(category.id, category.is_active ? 'deactivate' : 'activate', false);
          }
        });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: category.name,
    });
  };

  const handleToggleHidden = (category: Category) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    const actionText = category.is_hidden ? 'Make Visible' : 'Hide';
    const action = category.is_hidden ? 'unhide' : 'hide';

    setConfirmDialog({
      open: true,
      title: `${actionText} Category`,
      message: `Are you sure you want to ${actionText.toLowerCase()} "${category.name}"?`,
      variant: 'info',
      onConfirm: () => {
        setCategoryLoading(category.id, category.is_hidden ? 'unhide' : 'hide', true);
        bulkActionMutation.mutate({
          action,
          ids: [category.id]
        }, {
          onSettled: () => {
            setCategoryLoading(category.id, category.is_hidden ? 'unhide' : 'hide', false);
          }
        });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: category.name,
    });
  };

  // Bulk actions with loading state - only the clicked bulk action shows spinner
  const handleBulkActivate = (selectedItems: Category[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Activate Categories',
      message: `Are you sure you want to activate ${selectedItems.length} selected categor${selectedItems.length === 1 ? 'y' : 'ies'}?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('activate');
        bulkActionMutation.mutate({ action: 'activate', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkDeactivate = (selectedItems: Category[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Deactivate Categories',
      message: `Are you sure you want to deactivate ${selectedItems.length} selected categor${selectedItems.length === 1 ? 'y' : 'ies'}?`,
      variant: 'error',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('deactivate');
        bulkActionMutation.mutate({ action: 'deactivate', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkHide = (selectedItems: Category[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Hide Categories',
      message: `Are you sure you want to hide ${selectedItems.length} selected categor${selectedItems.length === 1 ? 'y' : 'ies'} from customers?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('hide');
        bulkActionMutation.mutate({ action: 'hide', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkUnhide = (selectedItems: Category[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Make Visible',
      message: `Are you sure you want to make ${selectedItems.length} selected categor${selectedItems.length === 1 ? 'y' : 'ies'} visible to customers?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        setActiveBulkAction('unhide');
        bulkActionMutation.mutate({ action: 'unhide', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkDelete = (selectedItems: Category[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    const ids = selectedItems.map(i => i.id);
    const hasSubcategories = selectedItems.some(item => item.full_path !== item.name);

    if (hasSubcategories) {
      toast.error('Cannot delete categories that have subcategories');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Bulk Delete Categories',
      message: `Are you sure you want to delete ${selectedItems.length} selected categor${selectedItems.length === 1 ? 'y' : 'ies'}? This action cannot be undone.`,
      variant: 'error',
      onConfirm: () => {
        setActiveBulkAction('delete');
        bulkActionMutation.mutate({ action: 'delete', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkExport = (selectedItems: Category[]) => {
    if (isAnyActionLoading()) {
      toast.error('Please wait for current action to complete');
      return;
    }

    const exportData = selectedItems.map(item => ({
      name: item.name,
      full_path: item.full_path,
      is_active: item.is_active,
      is_hidden: item.is_hidden,
      description: item.description,
      parent_name: item.parent_name,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedItems.length} categories`);
  };

  // Get category actions - view actions are never disabled
  const getCategoryActions = (category: Category): ActionItem[] => {
    const isAnyLoading = isAnyActionLoading();
    const isRowLoading = isCategoryLoading(category.id);
    const isModifyDisabled = isAnyLoading;

    return [
      {
        label: 'View Details',
        icon: <Eye size={14} />,
        onClick: () => setViewingCategory(category),
        color: 'blue',
        disabled: false,
      },
      {
        label: 'View Full Path',
        icon: <FolderTree size={14} />,
        onClick: () => setViewingPathCategory(category),
        color: 'violet',
        disabled: false,
      },
      {
        label: 'Edit Category',
        icon: <Edit size={14} />,
        onClick: () => setEditingCategory(category),
        color: 'emerald',
        disabled: isModifyDisabled,
      },
      {
        label: category.is_active ? 'Deactivate' : 'Activate',
        icon: category.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />,
        onClick: () => handleToggleActive(category),
        color: category.is_active ? 'rose' : 'emerald',
        disabled: isModifyDisabled,
        loading: isRowLoading && (loadingStates[category.id]?.activate || loadingStates[category.id]?.deactivate),
      },
      {
        label: category.is_hidden ? 'Make Visible' : 'Hide',
        icon: category.is_hidden ? <EyeIcon size={14} /> : <EyeOff size={14} />,
        onClick: () => handleToggleHidden(category),
        color: category.is_hidden ? 'emerald' : 'amber',
        disabled: isModifyDisabled,
        loading: isRowLoading && (loadingStates[category.id]?.hide || loadingStates[category.id]?.unhide),
      },
      {
        label: 'Delete Category',
        icon: <Trash2 size={14} />,
        variant: 'destructive',
        onClick: () => handleDelete(category),
        disabled: isModifyDisabled,
        loading: isRowLoading && loadingStates[category.id]?.delete,
      },
    ];
  };

  // Bulk actions array
  const bulkActions = [
    {
      label: 'Activate Selected',
      icon: activeBulkAction === 'activate' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />,
      onClick: handleBulkActivate,
      color: 'emerald' as const,
      disabled: isAnyActionLoading(),
    },
    {
      label: 'Deactivate Selected',
      icon: activeBulkAction === 'deactivate' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />,
      onClick: handleBulkDeactivate,
      color: 'rose' as const,
      variant: 'destructive' as const,
      disabled: isAnyActionLoading(),
    },
    {
      label: 'Hide Selected',
      icon: activeBulkAction === 'hide' ? <Loader2 size={14} className="animate-spin" /> : <EyeOff size={14} />,
      onClick: handleBulkHide,
      color: 'amber' as const,
      disabled: isAnyActionLoading(),
    },
    {
      label: 'Make Visible',
      icon: activeBulkAction === 'unhide' ? <Loader2 size={14} className="animate-spin" /> : <EyeIcon size={14} />,
      onClick: handleBulkUnhide,
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

  const categories = data?.data?.categories || [];
  const pagination = data?.data?.pagination;

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your product categories and subcategories</p>
        </div>

        <div className="flex justify-between items-center">
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2" disabled={isAnyActionLoading()}>
            <Plus size={16} />
            New Category
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={isAnyActionLoading()}>
            {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </Button>
        </div>

        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">Error loading categories: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Categories</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your product categories and subcategories</p>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center">
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2" disabled={isAnyActionLoading()}>
          <Plus size={16} />
          New Category
        </Button>
        <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={isAnyActionLoading()}>
          {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </Button>
      </div>

      {/* Filters and Sort Row - CustomFilter and CustomSortFromUrl have their own Suspense internally */}
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div className="flex-1">
          <CustomFilter config={filterConfig} />
        </div>
        <CustomSortFromUrl config={sortConfig} />
      </div>

      {/* Create Category Dialog */}
      <CustomDialog
        title="Create New Category"
        description="Add a new category"
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        contentWidth="max-w-2xl"
      >
        <CategoryForm
          onSuccess={() => {
            setIsCreateDialogOpen(false);
            invalidateCategoryQueries();
            refetch();
          }}
        />
      </CustomDialog>

      {/* Edit Category Dialog */}
      <CustomDialog
        title="Edit Category"
        description="Update category details"
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        contentWidth="max-w-2xl"
      >
        {editingCategory && (
          <CategoryForm
            categoryId={editingCategory.id}
            onSuccess={() => {
              setEditingCategory(null);
              invalidateCategoryQueries();
              refetch();
            }}
            onCancel={() => setEditingCategory(null)}
          />
        )}
      </CustomDialog>

      {/* View Details Dialog */}
      <CustomDialog
        title="Category Details"
        description="Full category information"
        open={!!viewingCategory}
        onOpenChange={(open) => !open && setViewingCategory(null)}
        contentWidth="max-w-2xl"
      >
        {viewingCategory && (
          <DataDisplay
            data={viewingCategory}
            excludeKeys={['id', 'created_at', 'updated_at']}
            images={{ image: (url: string) => url || '' }}
            links={{
              parent_name: (name: string) => name ? `/dashboard/products/categories?category_search=${encodeURIComponent(name)}` : '',
              name: (name: string) => `/dashboard/products/categories/${viewingCategory.slug}`,
            }}
            badges={{
              is_active: { true: 'emerald', false: 'rose' },
              is_hidden: { true: 'amber', false: 'zinc' }
            }}
            dots={{
              is_active: { true: 'emerald', false: 'rose' },
              is_hidden: { true: 'amber', false: 'zinc' }
            }}
            customRenderers={{
              full_path: (path: string) => (
                <div className="max-w-md">
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-words bg-gray-50 dark:bg-gray-900/50 p-2 rounded">{path}</p>
                </div>
              ),
              description: (desc: string) => (
                <div className="max-w-md">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{desc || '—'}</p>
                </div>
              ),
              meta_title: (title: string) => <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title || '—'}</span>,
              meta_description: (desc: string) => (
                <div className="max-w-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">{desc || '—'}</p>
                </div>
              ),
              slug: (slug: string) => <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{slug}</span>,
              parent_name: (name: string | null) => <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name || '— (Root Category)'}</span>,
            }}
          />
        )}
      </CustomDialog>

      {/* View Full Path Dialog */}
      <CustomDialog
        title="Category Full Path"
        description="Complete category hierarchy path"
        open={!!viewingPathCategory}
        onOpenChange={(open) => !open && setViewingPathCategory(null)}
        contentWidth="max-w-md"
      >
        {viewingPathCategory && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Full Path:</p>
              <p className="text-base font-mono text-gray-900 dark:text-white break-words">{viewingPathCategory.full_path}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Category Name:</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">{viewingPathCategory.name}</p>
            </div>
          </div>
        )}
      </CustomDialog>

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

      {/* Data Table or Skeleton */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <>
          <DataTable
            data={categories}
            renderActions={(category: Category) => (
              <ActionsDropdown actions={getCategoryActions(category)} maxVisible={3} showLabels={false} buttonSize="sm" />
            )}
            bulkActions={bulkActions}
            bulkActionsMessage="Select categories to activate, deactivate, hide, delete or export"
            excludeColumns={['id', 'parent_id', 'meta_title', 'meta_description', 'created_at', 'updated_at', 'slug', 'full_path']}
            images={{ image: (category: Category) => category.image || '' }}
            dots={{
              is_active: { true: 'emerald', false: 'rose' },
              is_hidden: { true: 'amber', false: 'zinc' },
            }}
            badges={{
              is_active: { true: 'emerald', false: 'rose' },
              is_hidden: { true: 'amber', false: 'zinc' },
            }}
            links={{
              name: (category: Category) => `/dashboard/products/categories/${category.slug}`,
              parent_name: (category: Category) => category.parent_id ? `/dashboard/products/categories?category_search=${encodeURIComponent(category.parent_name || '')}` : '',
            }}
            emptyTitle="No Categories Found"
            emptyDescription="Create your first category to get started."
            onSelectionChange={(selected) => console.log('Selected categories:', selected.length)}
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
export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    }>
      <CategoriesPageContent />
    </Suspense>
  );
}