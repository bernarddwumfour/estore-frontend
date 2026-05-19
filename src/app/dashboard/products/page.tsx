// app/dashboard/products/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Plus, Edit, Trash2, Eye, Copy,
  CheckCircle, XCircle, Star, TrendingUp, Sparkles,
  Package, EyeOff, Archive, FileText, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import ProductForm from './ProductForm';
import ProductVariantForm from './ProductVariantForm';
import ProductDetailCard from './ProductDetails';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { CustomSheet } from '@/widgets/CustomSheet/CustomSheet';
import { DataTable } from '@/widgets/Customtable/DataTable';
import ProductVariantsList from './ProductVariantsList';

// Types
interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
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
}

// Fetch products
const fetchProducts = async (): Promise<{ data: { products: Product[]; total: number } }> => {
  const response = await securityAxios.get(endpoints.products.listProducts);
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

export default function ProductsPage() {
  const queryClient = useQueryClient();

  // State for dialogs/sheets
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [addingVariantTo, setAddingVariantTo] = useState<Product | null>(null);
  const [viewingVariantsFor, setViewingVariantsFor] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Query for products
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchProducts,
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: ({ action, ids }: { action: string; ids: string[] }) =>
      bulkProductAction(action, ids),
    onSuccess: (response, variables) => {
      const { data, message } = response;
      const { success_count, failed_count } = data;

      if (success_count > 0) {
        toast.success(message || `Processed ${success_count} products successfully`);
      }

      if (failed_count > 0) {
        const failedNames = data.failed.map((f: any) => f.name).join(', ');
        toast.error(`${failed_count} failed: ${failedNames}`);
      }

      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Bulk action failed');
    },
  });

  // Single action helpers
  const handleStatusChange = (product: Product, newStatus: string) => {
    bulkActionMutation.mutate({ action: newStatus, ids: [product.id] });
  };

  const handleToggleFeatured = (product: Product) => {
    bulkActionMutation.mutate({
      action: product.is_featured ? 'unfeature' : 'feature',
      ids: [product.id]
    });
  };

  const handleToggleBestseller = (product: Product) => {
    bulkActionMutation.mutate({
      action: product.is_bestseller ? 'unbestseller' : 'bestseller',
      ids: [product.id]
    });
  };

  const handleToggleNew = (product: Product) => {
    bulkActionMutation.mutate({
      action: product.is_new ? 'unnew' : 'new',
      ids: [product.id]
    });
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Delete "${product.title}"? This action cannot be undone.`)) {
      bulkActionMutation.mutate({ action: 'delete', ids: [product.id] });
    }
  };

  // Bulk actions
  const handleBulkPublish = (selectedItems: Product[]) => {
    const ids = selectedItems.map(item => item.id);
    if (confirm(`Publish ${selectedItems.length} products?`)) {
      bulkActionMutation.mutate({ action: 'publish', ids });
    }
  };

  const handleBulkDraft = (selectedItems: Product[]) => {
    const ids = selectedItems.map(item => item.id);
    if (confirm(`Move ${selectedItems.length} products to draft?`)) {
      bulkActionMutation.mutate({ action: 'draft', ids });
    }
  };

  const handleBulkArchive = (selectedItems: Product[]) => {
    const ids = selectedItems.map(item => item.id);
    if (confirm(`Archive ${selectedItems.length} products?`)) {
      bulkActionMutation.mutate({ action: 'archive', ids });
    }
  };

  const handleBulkFeature = (selectedItems: Product[]) => {
    const ids = selectedItems.map(item => item.id);
    bulkActionMutation.mutate({ action: 'feature', ids });
  };

  const handleBulkUnfeature = (selectedItems: Product[]) => {
    const ids = selectedItems.map(item => item.id);
    bulkActionMutation.mutate({ action: 'unfeature', ids });
  };

  const handleBulkBestseller = (selectedItems: Product[]) => {
    const ids = selectedItems.map(item => item.id);
    bulkActionMutation.mutate({ action: 'bestseller', ids });
  };

  const handleBulkDelete = (selectedItems: Product[]) => {
    const ids = selectedItems.map(item => item.id);
    if (confirm(`Delete ${selectedItems.length} products? This cannot be undone.`)) {
      bulkActionMutation.mutate({ action: 'delete', ids });
    }
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

  // Row actions - using state-controlled dialogs/sheets
  const actions = [
    {
      label: 'Edit Product',
      icon: <Edit size={14} />,
      onClick: (product: Product) => setEditingProduct(product),
    },
    {
      label: 'Add Variant',
      icon: <Plus size={14} />,
      onClick: (product: Product) => setAddingVariantTo(product),
    },
    {
      label: 'View Details',
      icon: <Eye size={14} />,
      onClick: (product: Product) => setViewingProduct(product),
    },
    {
      label: 'View Variants',
      icon: <Package size={14} />,
      onClick: (product: Product) => setViewingVariantsFor(product),
    },
    {
      label: (product: Product) => product.is_featured ? 'Remove Featured' : 'Mark Featured',
      icon: (product: Product) => <Star size={14} />,
      onClick: handleToggleFeatured,
    },
    {
      label: (product: Product) => product.is_bestseller ? 'Remove Bestseller' : 'Mark Bestseller',
      icon: (product: Product) => <TrendingUp size={14} />,
      onClick: handleToggleBestseller,
    },
    {
      label: (product: Product) => product.is_new ? 'Remove New' : 'Mark New',
      icon: (product: Product) => <Sparkles size={14} />,
      onClick: handleToggleNew,
    },
    {
      label: (product: Product) => {
        if (product.status === 'published') return 'Move to Draft';
        if (product.status === 'draft') return 'Publish';
        return 'Restore from Archive';
      },
      icon: (product: Product) => {
        if (product.status === 'published') return <FileText size={14} />;
        if (product.status === 'draft') return <CheckCircle size={14} />;
        return <Archive size={14} />;
      },
      onClick: (product: Product) => {
        if (product.status === 'published') handleStatusChange(product, 'draft');
        else if (product.status === 'draft') handleStatusChange(product, 'publish');
        else handleStatusChange(product, 'draft');
      },
    },
    {
      label: 'Delete Product',
      icon: <Trash2 size={14} />,
      variant: 'destructive' as const,
      onClick: handleDelete,
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: 'Publish Selected',
      icon: <CheckCircle size={14} />,
      onClick: handleBulkPublish,
      color: 'emerald' as const,
    },
    {
      label: 'Move to Draft',
      icon: <FileText size={14} />,
      onClick: handleBulkDraft,
      color: 'amber' as const,
    },
    {
      label: 'Archive Selected',
      icon: <Archive size={14} />,
      variant: 'destructive' as const,
      onClick: handleBulkArchive,
      color: 'blue' as const,
    },
    {
      label: 'Mark Featured',
      icon: <Star size={14} />,
      onClick: handleBulkFeature,
      color: 'violet' as const,
    },
    {
      label: 'Mark Bestseller',
      icon: <TrendingUp size={14} />,
      onClick: handleBulkBestseller,
      color: 'orange' as const,
    },
    {
      label: 'Delete Selected',
      icon: <Trash2 size={14} />,
      variant: 'destructive' as const,
      onClick: handleBulkDelete,
      color: 'rose' as const,
    },
    {
      label: 'Export Selected',
      icon: <Upload size={14} />,
      onClick: handleBulkExport,
      color: 'blue' as const,
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
        <p className="text-red-500">Error loading products: {error?.message}</p>
      </div>
    );
  }

  const products = data?.data?.products || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus size={16} />
          New Product
        </Button>
      </div>

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
              queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            }}
          />
        )}
      </CustomDialog>

      {/* View Details Sheet (using Sheet for better space) */}
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

      {/* View Variants Sheet (using Sheet for better space) */}
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

      {/* Data Table - No displayConfigs needed anymore */}
      <DataTable
        data={products}
        actions={actions}
        bulkActions={bulkActions}
        excludeColumns={['id', 'description', 'features', 'options', 'slug', 'created_at', 'published_at', 'total_reviews', 'average_rating']}
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
        links={{
          title: (product: Product) => `/dashboard/products/${product.id}`,
        }}
        emptyTitle="No Products Found"
        emptyDescription="Create your first product to start selling."
        onSelectionChange={(selected) => {
          console.log('Selected products:', selected.length);
        }}
      />
    </div>
  );
}