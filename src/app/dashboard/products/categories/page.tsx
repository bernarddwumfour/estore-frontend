// app/dashboard/products/categories/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Plus, Edit, Trash2, Eye, FolderTree,
  EyeOff, Eye as EyeIcon, CheckCircle, XCircle, Upload, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import CategoryForm from './CatergoryForm';
import { DataDisplay } from '@/widgets/DataDisplay/DataDisplay';
import { DataTable } from '@/widgets/Customtable/DataTable';
import { ActionItem, ActionsDropdown } from '@/widgets/ActionsDropdown/ActionsDropdown';
import { InfoDialog } from '@/widgets/CustomDialog/InfoDialog';
import { CustomPagination, PaginationMeta } from '@/widgets/CustomPagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/CustomFilter/CustomFilter';
import { CustomSort, SortConfig } from '@/widgets/CustomSort/CustomSort';
import { TableSkeleton } from '@/widgets/Customtable/TableSkeleton';

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

// Fetch categories with pagination
const fetchCategories = async (params?: any): Promise<{
  data: {
    categories: Category[];
    total: number;
    pagination: PaginationMeta;
  }
}> => {
  const queryParams = new URLSearchParams();
  if (params?.search && params.search !== '') queryParams.append('search', params.search);
  if (params?.status && params.status !== '') queryParams.append('is_active', params.status);
  if (params?.visibility && params.visibility !== '') queryParams.append('is_hidden', params.visibility);
  if (params?.has_parent === 'true') queryParams.append('parent_id', 'not_null');
  if (params?.has_parent === 'false') queryParams.append('parent_id', 'null');
  if (params?.created_after && params.created_after !== '') queryParams.append('created_after', params.created_after);
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = `${endpoints.products.adminlistCategories}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await securityAxios.get(url);
  return response.data;
};

// Bulk action mutation
const bulkCategoryAction = async (action: string, categoryIds: string[]) => {
  const response = await securityAxios.post(endpoints.products.bulkCategoryAction, {
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
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [viewingPathCategory, setViewingPathCategory] = useState<Category | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Filter and pagination state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
  });

  // Track applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: '',
    visibility: '',
    has_parent: '',
    created_after: '',
    sort_by: 'name',
    sort_order: 'asc',
  });

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

  // Query for categories
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-categories', filters.page, filters.limit, appliedFilters],
    queryFn: () => fetchCategories({
      page: filters.page,
      limit: filters.limit,
      ...appliedFilters,
    }),
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
      refetch();
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Bulk action failed'),
  });

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleLimitChange = (limit: number) => {
    setFilters({ page: 1, limit });
  };

  // Handle filter changes from CustomFilter
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setAppliedFilters({
      ...appliedFilters,
      search: newFilters.search || '',
      status: newFilters.status || '',
      visibility: newFilters.visibility || '',
      has_parent: newFilters.has_parent || '',
      created_after: newFilters.created_after || '',
    });
    setFilters({ ...filters, page: 1 });
  };

  // Handle sort changes from CustomSort
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setAppliedFilters({
      ...appliedFilters,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    setFilters({ ...filters, page: 1 });
  };

  // Refresh handler
  const handleRefresh = () => {
    refetch();
    toast.success('Categories refreshed');
  };

  // Reset all filters and sort
  const handleReset = () => {
    setAppliedFilters({
      search: '',
      status: '',
      visibility: '',
      has_parent: '',
      created_after: '',
      sort_by: 'name',
      sort_order: 'asc',
    });
    setFilters({ page: 1, limit: filters.limit });
  };

  // Single action helpers with InfoDialog
  const handleDelete = (category: Category) => {
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
        bulkActionMutation.mutate({ action: 'delete', ids: [category.id] });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: category.name,
    });
  };

  const handleToggleActive = (category: Category) => {
    const actionText = category.is_active ? 'Deactivate' : 'Activate';

    setConfirmDialog({
      open: true,
      title: `${actionText} Category`,
      message: `Are you sure you want to ${actionText.toLowerCase()} "${category.name}"?`,
      variant: category.is_active ? 'error' : 'info',
      onConfirm: () => {
        bulkActionMutation.mutate({
          action: category.is_active ? 'deactivate' : 'activate',
          ids: [category.id]
        });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: category.name,
    });
  };

  const handleToggleHidden = (category: Category) => {
    const actionText = category.is_hidden ? 'Make Visible' : 'Hide';

    setConfirmDialog({
      open: true,
      title: `${actionText} Category`,
      message: `Are you sure you want to ${actionText.toLowerCase()} "${category.name}"?`,
      variant: 'info',
      onConfirm: () => {
        bulkActionMutation.mutate({
          action: category.is_hidden ? 'unhide' : 'hide',
          ids: [category.id]
        });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: category.name,
    });
  };

  // Bulk actions with InfoDialog
  const handleBulkActivate = (selectedItems: Category[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Activate Categories',
      message: `Are you sure you want to activate ${selectedItems.length} selected categor${selectedItems.length === 1 ? 'y' : 'ies'}?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'activate', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkDeactivate = (selectedItems: Category[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Deactivate Categories',
      message: `Are you sure you want to deactivate ${selectedItems.length} selected categor${selectedItems.length === 1 ? 'y' : 'ies'}?`,
      variant: 'error',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'deactivate', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkHide = (selectedItems: Category[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Hide Categories',
      message: `Are you sure you want to hide ${selectedItems.length} selected categor${selectedItems.length === 1 ? 'y' : 'ies'} from customers?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'hide', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkUnhide = (selectedItems: Category[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Make Visible',
      message: `Are you sure you want to make ${selectedItems.length} selected categor${selectedItems.length === 1 ? 'y' : 'ies'} visible to customers?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'unhide', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkDelete = (selectedItems: Category[]) => {
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
        bulkActionMutation.mutate({ action: 'delete', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkExport = (selectedItems: Category[]) => {
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

  // Get category actions
  const getCategoryActions = (category: Category): ActionItem[] => {
    const actions: ActionItem[] = [];

    actions.push({
      label: 'View Details',
      icon: <Eye size={14} />,
      onClick: () => setViewingCategory(category),
      color: 'blue',
    });

    actions.push({
      label: 'View Full Path',
      icon: <FolderTree size={14} />,
      onClick: () => setViewingPathCategory(category),
      color: 'violet',
    });

    actions.push({
      label: 'Edit Category',
      icon: <Edit size={14} />,
      onClick: () => setEditingCategory(category),
      color: 'emerald',
    });

    actions.push({
      label: category.is_active ? 'Deactivate' : 'Activate',
      icon: category.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />,
      onClick: () => handleToggleActive(category),
      color: category.is_active ? 'rose' : 'emerald',
    });

    actions.push({
      label: category.is_hidden ? 'Make Visible' : 'Hide',
      icon: category.is_hidden ? <EyeIcon size={14} /> : <EyeOff size={14} />,
      onClick: () => handleToggleHidden(category),
      color: category.is_hidden ? 'emerald' : 'amber',
    });

    actions.push({
      label: 'Delete Category',
      icon: <Trash2 size={14} />,
      variant: 'destructive',
      onClick: () => handleDelete(category),
    });

    return actions;
  };

  // Bulk actions array
  const bulkActions = [
    { label: 'Activate Selected', icon: <CheckCircle size={14} />, onClick: handleBulkActivate, color: 'emerald' as const },
    { label: 'Deactivate Selected', icon: <XCircle size={14} />, onClick: handleBulkDeactivate, color: 'rose' as const, variant: 'destructive' as const },
    { label: 'Hide Selected', icon: <EyeOff size={14} />, onClick: handleBulkHide, color: 'amber' as const },
    { label: 'Make Visible', icon: <EyeIcon size={14} />, onClick: handleBulkUnhide, color: 'blue' as const },
    { label: 'Delete Selected', icon: <Trash2 size={14} />, onClick: handleBulkDelete, color: 'rose' as const, variant: 'destructive' as const },
    { label: 'Export Selected', icon: <Upload size={14} />, onClick: handleBulkExport, color: 'violet' as const },
  ];

  const categories = data?.data?.categories || [];
  const pagination = data?.data?.pagination;

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        {/* Header - Always visible */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your product categories and subcategories</p>
        </div>

        {/* Buttons - Always visible */}
        <div className="flex justify-between items-center">
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus size={16} />
            New Category
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="gap-2">
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>

        {/* Filters and Sort - Always visible */}
        <div className="flex flex-wrap gap-4 items-start justify-between">
          <div className="flex-1">
            <CustomFilter
              config={filterConfig}
              filters={{
                search: appliedFilters.search,
                status: appliedFilters.status,
                visibility: appliedFilters.visibility,
                has_parent: appliedFilters.has_parent,
                created_after: appliedFilters.created_after,
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

        {/* Error Message */}
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">Error loading categories: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Always visible */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Categories</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your product categories and subcategories</p>
      </div>

      {/* Buttons - Always visible */}
      <div className="flex justify-between items-center">
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus size={16} />
          New Category
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

      {/* Filters and Sort Row - Always visible and interactive */}
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div className="flex-1">
          <CustomFilter
            config={filterConfig}
            filters={{
              search: appliedFilters.search,
              status: appliedFilters.status,
              visibility: appliedFilters.visibility,
              has_parent: appliedFilters.has_parent,
              created_after: appliedFilters.created_after,
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
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
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
              refetch();
              queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
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
            images={{
              image: (url: string) => url || ''
            }}
            links={{
              parent_name: (name: string) => name ? `/dashboard/products/categories?search=${encodeURIComponent(name)}` : '',
              name: (name: string) => `/dashboard/products/categories/${viewingCategory.slug}`,
            }}
            badges={{
              is_active: {
                true: 'emerald',
                false: 'rose'
              },
              is_hidden: {
                true: 'amber',
                false: 'zinc'
              }
            }}
            dots={{
              is_active: {
                true: 'emerald',
                false: 'rose'
              },
              is_hidden: {
                true: 'amber',
                false: 'zinc'
              }
            }}
            customRenderers={{
              full_path: (path: string) => (
                <div className="max-w-md">
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-words bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                    {path}
                  </p>
                </div>
              ),
              description: (desc: string) => (
                <div className="max-w-md">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {desc || '—'}
                  </p>
                </div>
              ),
              meta_title: (title: string) => (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {title || '—'}
                </span>
              ),
              meta_description: (desc: string) => (
                <div className="max-w-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {desc || '—'}
                  </p>
                </div>
              ),
              slug: (slug: string) => (
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  {slug}
                </span>
              ),
              parent_name: (name: string | null) => (
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {name || '— (Root Category)'}
                </span>
              ),
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
              <p className="text-base font-mono text-gray-900 dark:text-white break-words">
                {viewingPathCategory.full_path}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Category Name:</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {viewingPathCategory.name}
              </p>
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

      {/* Data Table or Skeleton - Only this shows loading state */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <>
          <DataTable
            data={categories}
            renderActions={(category: Category) => (
              <ActionsDropdown
                actions={getCategoryActions(category)}
                maxVisible={3}
                showLabels={false}
                buttonSize="sm"
              />
            )}
            bulkActions={bulkActions}
            bulkActionsMessage="Select categories to activate, deactivate, hide, delete or export"
            excludeColumns={['id', 'parent_id', 'meta_title', 'meta_description', 'created_at', 'updated_at', 'slug', 'full_path']}
            images={{
              image: (category: Category) => category.image || '',
            }}
            dots={{
              is_active: {
                true: 'emerald',
                false: 'rose',
              },
              is_hidden: {
                true: 'amber',
                false: 'zinc',
              },
            }}
            badges={{
              is_active: {
                true: 'emerald',
                false: 'rose',
              },
              is_hidden: {
                true: 'amber',
                false: 'zinc',
              },
            }}
            links={{
              name: (category: Category) => `/dashboard/products/categories/${category.slug}`,
              parent_name: (category: Category) => category.parent_id ? `/dashboard/products/categories/${category.parent_id}` : '',
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