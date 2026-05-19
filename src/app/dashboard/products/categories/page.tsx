// app/dashboard/products/categories/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Plus, Edit, Trash2, Power, PowerOff, Eye, FolderTree,
  EyeOff, Eye as EyeIcon, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import CategoryForm from './CatergoryForm';
import { DataDisplay } from '@/widgets/DataDisplay/DataDisplay';
import { DataTable } from '@/widgets/Customtable/DataTable';

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

interface BulkActionResponse {
  success: Array<{ id: string; name: string }>;
  failed: Array<{ id: string; name: string; reason: string }>;
  total: number;
}

// Fetch categories
const fetchCategories = async (): Promise<{ data: { categories: Category[] } }> => {
  const response = await securityAxios.get(endpoints.products.adminlistCategories);
  return response.data;
};

// Bulk action mutation
const bulkAction = async (action: string, categoryIds: string[]): Promise<BulkActionResponse> => {
  const response = await securityAxios.post(endpoints.products.bulkCategoryAction, {
    action,
    category_ids: categoryIds,
  });
  return response.data.data;
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Query for categories
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchCategories,
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, ids }: { action: string; ids: string[] }) => {
      const response = await securityAxios.post(endpoints.products.bulkCategoryAction, {
        action,
        category_ids: ids,
      });
      return response.data;
    },
    onSuccess: (response) => {
      const { data, message } = response;
      const { success_count, failed_count } = data;

      if (success_count > 0) {
        toast.success(message || `Processed ${success_count} categories successfully`);
      }

      if (failed_count > 0) {
        const failedNames = data.failed.map((f: any) => f.name).join(', ');
        toast.error(`${failed_count} failed: ${failedNames}`);
      }

      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Bulk action failed');
    },
  });
  ;

  const handleBulkDelete = (selectedItems: Category[]) => {
    const ids = selectedItems.map(item => item.id);
    const hasSubcategories = selectedItems.some(item => item.full_path !== item.name);

    if (hasSubcategories) {
      toast.error('Cannot delete categories that have subcategories');
      return;
    }

    if (confirm(`Delete ${selectedItems.length} categories? This action cannot be undone.`)) {
      bulkActionMutation.mutate({ action: 'delete', ids });
    }
  };

  const handleBulkActivate = (selectedItems: Category[]) => {
    const ids = selectedItems.map(item => item.id);
    if (confirm(`Activate ${selectedItems.length} categories?`)) {
      bulkActionMutation.mutate({ action: 'activate', ids });
    }
  };

  const handleBulkDeactivate = (selectedItems: Category[]) => {
    const ids = selectedItems.map(item => item.id);
    if (confirm(`Deactivate ${selectedItems.length} categories?`)) {
      bulkActionMutation.mutate({ action: 'deactivate', ids });
    }
  };

  const handleBulkHide = (selectedItems: Category[]) => {
    const ids = selectedItems.map(item => item.id);
    if (confirm(`Hide ${selectedItems.length} categories from customers?`)) {
      bulkActionMutation.mutate({ action: 'hide', ids });
    }
  };

  const handleBulkUnhide = (selectedItems: Category[]) => {
    const ids = selectedItems.map(item => item.id);
    if (confirm(`Make ${selectedItems.length} categories visible to customers?`)) {
      bulkActionMutation.mutate({ action: 'unhide', ids });
    }
  };

  const handleBulkExport = (selectedItems: Category[]) => {
    const exportData = selectedItems.map(item => ({
      name: item.name,
      full_path: item.full_path,
      is_active: item.is_active,
      is_hidden: item.is_hidden,
      description: item.description,
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

  // Define display configs for the detail view
  const displayConfigs = [
    {
      id: 'view-details',
      label: 'View Details',
      icon: <Eye size={14} />,
      getData: (item: Category) => item,
      excludeKeys: ['id', 'created_at', 'updated_at'],
    },
    {
      id: 'view-path',
      label: 'View Full Path',
      icon: <FolderTree size={14} />,
      getData: (item: Category) => ({ full_path: item.full_path }),
      excludeKeys: [],
    },
  ];

  // Define actions for the dropdown menu
  const actions = [
    {
      label: 'Edit Category',
      icon: <Edit size={14} />,
      onClick: (category: Category) => setEditingCategory(category),
    },
    {
      label: (category: Category) => category.is_active ? 'Deactivate' : 'Activate',
      icon: (category: Category) => category.is_active ? <PowerOff size={14} /> : <Power size={14} />,
      onClick: async (category: Category) => {
        await bulkActionMutation.mutateAsync({
          action: category.is_active ? 'deactivate' : 'activate',
          ids: [category.id]
        });
      },
    },
    {
      label: (category: Category) => category.is_hidden ? 'Make Visible' : 'Hide',
      icon: (category: Category) => category.is_hidden ? <EyeIcon size={14} /> : <EyeOff size={14} />,
      onClick: async (category: Category) => {
        await bulkActionMutation.mutateAsync({
          action: category.is_hidden ? 'unhide' : 'hide',
          ids: [category.id]
        });
      },
    },
    {
      label: 'Delete Category',
      icon: <Trash2 size={14} />,
      variant: 'destructive' as const,
      onClick: (category: Category) => {
        if (category.full_path !== category.name) {
          toast.error('Cannot delete category that has subcategories');
          return;
        }
        if (confirm(`Delete "${category.name}"?`)) {
          bulkActionMutation.mutate({ action: 'delete', ids: [category.id] });
        }
      },
    },
  ];

  // Define bulk actions
  const bulkActions = [
    {
      label: 'Activate Selected',
      icon: <CheckCircle size={14} />,
      onClick: handleBulkActivate,
    },
    {
      label: 'Deactivate Selected',
      icon: <XCircle size={14} />,
      variant: 'destructive' as const,
      onClick: handleBulkDeactivate,
    },
    {
      label: 'Hide Selected',
      icon: <EyeOff size={14} />,
      onClick: handleBulkHide,
    },
    {
      label: 'Make Visible',
      icon: <EyeIcon size={14} />,
      onClick: handleBulkUnhide,
    },
    {
      label: 'Delete Selected',
      icon: <Trash2 size={14} />,
      variant: 'destructive' as const,
      onClick: handleBulkDelete,
    },
    {
      label: 'Export Selected',
      icon: <FolderTree size={14} />,
      onClick: handleBulkExport,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading categories: {error?.message}</p>
      </div>
    );
  }

  const categories = data?.data?.categories || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product categories and subcategories
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus size={16} />
          New Category
        </Button>
      </div>

      {/* Create Category Dialog */}
      <CustomDialog
        title="Create New Category"
        description="Fill in the details to create a new category."
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      >
        <CategoryForm
          onSuccess={() => {
            setIsCreateDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
          }}
        />
      </CustomDialog>

      {/* Edit Category Dialog */}
      <CustomDialog
        title="Edit Category"
        description="Update the category details."
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        {editingCategory && (
          <CategoryForm
            categoryId={editingCategory.id}
            onSuccess={() => {
              setEditingCategory(null);
              queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            }}
            onCancel={() => setEditingCategory(null)}
          />
        )}
      </CustomDialog>

      {/* View Details Dialog */}
      <CustomDialog
        title="Category Details"
        description="Full category information."
        open={!!viewingCategory}
        onOpenChange={(open) => !open && setViewingCategory(null)}
      >
        {viewingCategory && <DataDisplay data={viewingCategory} excludeKeys={['id']} />}
      </CustomDialog>

      {/* Data Table */}
      <DataTable
        data={categories}
        displayConfigs={displayConfigs}
        actions={actions}
        bulkActions={bulkActions}
        excludeColumns={['id', 'parent_id', 'meta_title', 'meta_description', 'created_at', 'updated_at', 'slug']}
        images={{
          image: (category: Category | any) => category.image,
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
        links={{
          name: (category: Category) => `/dashboard/products/categories/${category.slug}`,
          parent_name: (category: Category) => category.parent_id ? `/dashboard/products/categories/${category.parent_id}` : '',
        }}
        emptyTitle="No Categories Found"
        emptyDescription="Create your first category to start organizing products."
        onSelectionChange={(selected) => {
          console.log('Selected categories:', selected.length);
        }}
      />
    </div>
  );
}