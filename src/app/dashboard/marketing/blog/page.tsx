"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Archive,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import { ActionsDropdown, type ActionItem } from "@/widgets/actions-dropdown/ActionsDropdown";
import { CustomDialog } from "@/widgets/custom-dialog/CustomDialog";
import { CustomSheet } from "@/widgets/custom-sheet/CustomSheet";
import { DataTable } from "@/widgets/custom-table/DataTable";
import { InfoDialog } from "@/widgets/custom-dialog/InfoDialog";
import { CustomPagination, PaginationMeta } from "@/widgets/custom-pagination/CustomPagination";
import { CustomFilter, FilterConfig } from "@/widgets/custom-filter/CustomFilterFromUrl";
import { CustomSortFromUrl, SortConfig } from "@/widgets/custom-sort/CustomSortFromUrl";
import { TableSkeleton } from "@/widgets/custom-table/TableSkeleton";
import BlogPostForm from "./(components)/BlogPostForm";
import BlogCategoryManager from "./(components)/BlogCategoryManager";

function getErrorMessage(err: unknown, fallback: string): string {
  const error = err as { response?: { data?: { message?: string } } };
  return error?.response?.data?.message || fallback;
}
// Types for the list API
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  category: { id: string; name: string; slug: string } | null;
  author: string;
  is_featured: boolean;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_user_id: string | null;
  author_name: string;
}

interface FetchParams {
  page: number;
  limit: number;
  search: string;
  status: string;
  sort_by: string;
  sort_order: string;
}

const fetchPosts = async (
  params: FetchParams
): Promise<{
  data: { posts: BlogPost[]; total: number; pagination: PaginationMeta };
}> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.status) queryParams.append("status", params.status);
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);

  const url = `${endpoints.blog.adminList}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await securityAxios.get(url);
  return response.data;
};

const bulkAction = async (action: string, postIds: string[]) => {
  const response = await securityAxios.post(endpoints.blog.bulkAction, {
    action,
    post_ids: postIds,
  });
  return response.data;
};

const publishPost = async (postId: string) => {
  const response = await securityAxios.post(
    endpoints.blog.publish.replace(":id", postId)
  );
  return response.data;
};

const archivePost = async (postId: string) => {
  const response = await securityAxios.post(
    endpoints.blog.archive.replace(":id", postId)
  );
  return response.data;
};

const deletePost = async (postId: string) => {
  const response = await securityAxios.delete(
    endpoints.blog.delete.replace(":id", postId)
  );
  return response.data;
};

const filterConfig: FilterConfig = {
  fields: [
    {
      name: "status",
      type: "select",
      placeholder: "Status",
      options: [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
      ],
      defaultValue: "",
      width: "120px",
    },
  ],
  searchPlaceholder: "Search by title or excerpt...",
  showSearch: true,
  urlParamPrefix: "blog",
};

const sortConfig: SortConfig = {
  options: [
    { value: "created_at", label: "Created Date" },
    { value: "title", label: "Title" },
    { value: "published_at", label: "Published Date" },
    { value: "status", label: "Status" },
  ],
  defaultSortBy: "created_at",
  defaultSortOrder: "desc",
  urlParamPrefix: "blog",
};

function BlogPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "info" | "success" | "error";
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    variant: "info",
    onConfirm: () => {},
  });

  const fetchParams = useMemo(
    (): FetchParams => ({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
      search: searchParams.get("search") || "",
      status: searchParams.get("blog_status") || "",
      sort_by: searchParams.get("blog_sort_by") || "created_at",
      sort_order: searchParams.get("blog_sort_order") || "desc",
    }),
    [searchParams]
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-blog-posts", fetchParams],
    queryFn: () => fetchPosts(fetchParams),
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ action, ids }: { action: string; ids: string[] }) =>
      bulkAction(action, ids),
    onSuccess: (response) => {
      const { data, message } = response;
      if (data?.success_count > 0) toast.success(message || `Processed ${data.success_count} posts`);
      if (data?.failed_count > 0) toast.error(`${data.failed_count} failed`);
      refetch();
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Bulk action failed"));
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishPost,
    onSuccess: () => {
      toast.success("Post published");
      refetch();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to publish")),
  });

  const archiveMutation = useMutation({
    mutationFn: archivePost,
    onSuccess: () => {
      toast.success("Post archived");
      refetch();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to archive")),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      toast.success("Post deleted");
      refetch();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to delete")),
  });

  const isAnyLoading = () =>
    Object.values(actionLoading).some(Boolean);

  const setLoading = (id: string, loading: boolean) =>
    setActionLoading((prev) => ({ ...prev, [id]: loading }));

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleLimitChange = (limit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", limit.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Posts refreshed");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePublish = (post: BlogPost) => {
    setConfirmDialog({
      open: true,
      title: "Publish Post",
      message: `Publish "${post.title}"?`,
      variant: "info",
      onConfirm: () => {
        setLoading(post.id, true);
        publishMutation.mutate(post.id, {
          onSettled: () => setLoading(post.id, false),
        });
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleArchive = (post: BlogPost) => {
    setConfirmDialog({
      open: true,
      title: "Archive Post",
      message: `Archive "${post.title}"? It will no longer appear on the public blog.`,
      variant: "info",
      onConfirm: () => {
        setLoading(post.id, true);
        archiveMutation.mutate(post.id, {
          onSettled: () => setLoading(post.id, false),
        });
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleDelete = (post: BlogPost) => {
    setConfirmDialog({
      open: true,
      title: "Delete Post",
      message: `Delete "${post.title}"? This cannot be undone.`,
      variant: "error",
      onConfirm: () => {
        setLoading(post.id, true);
        deleteMutation.mutate(post.id, {
          onSettled: () => setLoading(post.id, false),
        });
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const getPostActions = (post: BlogPost): ActionItem[] => {
    const disabled = isAnyLoading();
    const actions: ActionItem[] = [];

    actions.push({
      label: "View Details",
      icon: <Eye size={14} />,
      onClick: () => setViewingPost(post),
      color: "blue",
      disabled: false,
    });

    actions.push({
      label: "Edit",
      icon: <Edit size={14} />,
      onClick: () => setEditingPost(post),
      color: "emerald",
      disabled,
    });

    if (post.status === "draft") {
      actions.push({
        label: "Publish",
        icon: <CheckCircle size={14} />,
        onClick: () => handlePublish(post),
        color: "emerald",
        disabled,
        loading: actionLoading[post.id],
      });
    }

    if (post.status === "published") {
      actions.push({
        label: "Archive",
        icon: <Archive size={14} />,
        onClick: () => handleArchive(post),
        color: "amber",
        disabled,
        loading: actionLoading[post.id],
      });
    }

    if (post.status !== "published") {
      actions.push({
        label: "Delete",
        icon: <Trash2 size={14} />,
        variant: "destructive",
        onClick: () => handleDelete(post),
        disabled,
        loading: actionLoading[post.id],
      });
    }

    return actions;
  };

  const bulkActions = [
    {
      label: "Publish Selected",
      icon: <CheckCircle size={14} />,
      onClick: (items: BlogPost[]) => {
        const ids = items.map((i) => i.id);
        bulkActionMutation.mutate({ action: "publish", ids });
      },
      color: "emerald" as const,
    },
    {
      label: "Archive Selected",
      icon: <Archive size={14} />,
      onClick: (items: BlogPost[]) => {
        const ids = items.map((i) => i.id);
        bulkActionMutation.mutate({ action: "archive", ids });
      },
      color: "amber" as const,
    },
    {
      label: "Delete Selected",
      icon: <Trash2 size={14} />,
      onClick: (items: BlogPost[]) => {
        const ids = items.map((i) => i.id);
        bulkActionMutation.mutate({ action: "delete", ids });
      },
      color: "rose" as const,
      variant: "destructive" as const,
    },
  ];

  const posts = data?.data?.posts || [];
  const pagination = data?.data?.pagination;

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Blog Posts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage blog content</p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading posts: {(error as Error)?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Blog Posts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage blog content</p>
      </div>

      <div className="flex justify-between items-center">
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus size={16} />
          New Post
        </Button>
        <Button variant="outline" onClick={handleRefresh} className="gap-2">
          {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </Button>
      </div>

      <BlogCategoryManager />

      <div className="flex flex-wrap gap-64 items-start justify-between">
        <div className="flex-1">
          <CustomFilter config={filterConfig} />
        </div>
        <CustomSortFromUrl config={sortConfig} />
      </div>

      <InfoDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        infoMessage={confirmDialog.message}
        variant={confirmDialog.variant}
        primaryButtonText="Confirm"
        secondaryButtonText="Cancel"
        primaryAction={confirmDialog.onConfirm}
        secondaryAction={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />

      <CustomDialog
        title="Create New Post"
        description="Write a new blog post"
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        contentWidth="max-w-[800px]"
      >
        <BlogPostForm
          onSuccess={() => {
            setIsCreateDialogOpen(false);
            refetch();
          }}
        />
      </CustomDialog>

      <CustomDialog
        title="Edit Post"
        description="Update blog post details"
        open={!!editingPost}
        onOpenChange={(open) => !open && setEditingPost(null)}
        contentWidth="max-w-[800px]"
      >
        {editingPost && (
          <BlogPostForm
            postId={editingPost.id}
            onSuccess={() => {
              setEditingPost(null);
              refetch();
            }}
            onCancel={() => setEditingPost(null)}
          />
        )}
      </CustomDialog>

      <CustomSheet
        title="Post Details"
        description="Full post information"
        side="bottom"
        size="lg"
        open={!!viewingPost}
        onOpenChange={(open) => !open && setViewingPost(null)}
      >
        {viewingPost && (
          <div className="space-y-6 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Title</label>
                <p className="text-gray-900 dark:text-white font-medium">{viewingPost.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    viewingPost.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : viewingPost.status === "archived"
                      ? "bg-zinc-100 text-zinc-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {viewingPost.status.charAt(0).toUpperCase() + viewingPost.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Author</label>
                <p className="text-gray-900 dark:text-white">{viewingPost.author}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="text-gray-900 dark:text-white">
                  {viewingPost.category?.name || "Uncategorized"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Featured</label>
                <p className="text-gray-900 dark:text-white">{viewingPost.is_featured ? "Yes" : "No"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Published</label>
                <p className="text-gray-900 dark:text-white">
                  {viewingPost.published_at
                    ? new Date(viewingPost.published_at).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
            {viewingPost.excerpt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Excerpt</label>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{viewingPost.excerpt}</p>
              </div>
            )}
          </div>
        )}
      </CustomSheet>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <>
          <DataTable
            data={posts}
            renderActions={(post: BlogPost) => (
              <ActionsDropdown
                actions={getPostActions(post)}
                maxVisible={3}
                showLabels={false}
                buttonSize="sm"
              />
            )}
            bulkActions={bulkActions}
            bulkActionsMessage="Select posts for bulk actions"
            excludeColumns={[
              "id",
              "slug",
              "excerpt",
              "cover_image_url",
              "author_user_id",
              "author_name",
              "content",
              "meta_title",
              "meta_description",
            ]}
            badges={{
              status: {
                draft: "zinc",
                published: "emerald",
                archived: "zinc",
              },
            }}
            dots={{
              is_featured: {
                true: "emerald",
                false: "zinc",
              },
            }}
            emptyTitle="No Blog Posts Found"
            emptyDescription="Create your first blog post to start publishing content."
          />

          {pagination && pagination.total_pages > 1 && (
            <CustomPagination
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              showLimitSelector
              limitOptions={[10, 20, 50, 100]}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function BlogAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      }
    >
      <BlogPageContent />
    </Suspense>
  );
}
