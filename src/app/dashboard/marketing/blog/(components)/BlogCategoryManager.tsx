"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Edit, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { InfoDialog } from "@/widgets/custom-dialog/InfoDialog";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Max 120 characters"),
  description: z.string().max(500).optional(),
  is_active: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const fetchCategories = async (): Promise<BlogCategory[]> => {
  const response = await securityAxios.get(endpoints.blog.adminCategories);
  return response.data.data?.categories || [];
};

export default function BlogCategoryManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogCategory | null>(null);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<BlogCategory[]>({
    queryKey: ["blog-categories"],
    queryFn: fetchCategories,
  });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  const resetForm = () => {
    form.reset({ name: "", description: "", is_active: true });
    setEditingCategory(null);
    setIsAdding(false);
  };

  const handleEdit = (cat: BlogCategory) => {
    setEditingCategory(cat);
    setIsAdding(false);
    form.reset({
      name: cat.name,
      description: cat.description || "",
      is_active: cat.is_active,
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) =>
      securityAxios.post(endpoints.blog.adminCategoryCreate, data),
    onSuccess: () => {
      toast.success("Category created");
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      resetForm();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      securityAxios.post(
        endpoints.blog.adminCategoryUpdate.replace(":id", id),
        data
      ),
    onSuccess: () => {
      toast.success("Category updated");
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      resetForm();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      securityAxios.delete(
        endpoints.blog.adminCategoryDelete.replace(":id", id)
      ),
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      setDeleteTarget(null);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to delete category");
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const watchIsActive = useWatch({ control: form.control, name: "is_active" });
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const showForm = isAdding || !!editingCategory;

  return (
    <div className="border rounded-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between px-4 py-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Blog Categories
              {categories.length > 0 && (
                <span className="text-xs text-gray-500 ml-1">({categories.length})</span>
              )}
            </Button>
          </CollapsibleTrigger>
          {isOpen && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              disabled={showForm}
            >
              <Plus size={14} />
              Add
            </Button>
          )}
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {/* Add / Edit form */}
            {showForm && (
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 p-3 border rounded-md bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    {editingCategory ? "Edit Category" : "New Category"}
                  </h4>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Name</Label>
                  <Input
                    placeholder="Category name"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    placeholder="Optional description"
                    rows={2}
                    {...form.register("description")}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={watchIsActive}
                    onCheckedChange={(v) => form.setValue("is_active", v)}
                  />
                  <Label className="text-xs">Active</Label>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 size={12} className="animate-spin mr-1" />}
                    {editingCategory ? "Save" : "Create"}
                  </Button>
                </div>
              </form>
            )}

            {/* Category list */}
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No categories yet. Click &quot;Add&quot; to create one.
              </p>
            ) : (
              <div className="space-y-1">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">{cat.name}</span>
                      {!cat.is_active && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 shrink-0">
                          inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleEdit(cat)}
                        disabled={showForm}
                        title="Edit"
                      >
                        <Edit size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700"
                        onClick={() => setDeleteTarget(cat)}
                        disabled={showForm || deleteMutation.isPending}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Delete confirmation */}
      <InfoDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category"
        infoMessage={`Delete "${deleteTarget?.name}"? Posts in this category will become uncategorized.`}
        variant="error"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        primaryAction={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        secondaryAction={() => setDeleteTarget(null)}
      />
    </div>
  );
}
