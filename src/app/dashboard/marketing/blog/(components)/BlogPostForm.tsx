"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import { MediaPicker, type PickedMedia } from "@/widgets/social/MediaPicker";

interface BlogPostFormProps {
  postId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Max 200 characters"),
  slug: z.string().max(220, "Max 220 characters").optional(),
  excerpt: z.string().max(300, "Max 300 characters").optional(),
  content: z.string().min(1, "Content is required"),
  cover_image_url: z.string().max(500).optional(),
  category_id: z.string().optional().nullable(),
  author_type: z.enum(["user", "guest"]),
  author_user_id: z.string().optional().nullable(),
  author_name: z.string().max(120).optional(),
  status: z.enum(["draft", "published", "archived"]),
  is_featured: z.boolean().optional(),
  meta_title: z.string().max(200).optional(),
  meta_description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

const fetchPost = async (id: string) => {
  const response = await securityAxios.get(
    endpoints.blog.adminDetails.replace(":id", id)
  );
  return response.data.data;
};

const fetchCategories = async () => {
  const response = await securityAxios.get(endpoints.blog.adminCategories);
  return response.data.data?.categories || [];
};

export default function BlogPostForm({
  postId,
  onSuccess,
  onCancel,
}: BlogPostFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const isUpdateMode = !!postId;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image_url: "",
      category_id: null,
      author_type: "guest",
      author_user_id: null,
      author_name: "",
      status: "draft",
      is_featured: false,
      meta_title: "",
      meta_description: "",
    },
  });

  const { data: existingPost, isLoading: isPostLoading } = useQuery({
    queryKey: ["blog-post", postId],
    queryFn: () => fetchPost(postId!),
    enabled: isUpdateMode,
  });

  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ["blog-categories"],
    queryFn: fetchCategories,
  });

  // Hydrate form when editing
  useEffect(() => {
    if (existingPost) {
      const authorType = existingPost.author_user_id ? "user" : "guest";
      form.reset({
        title: existingPost.title || "",
        slug: existingPost.slug || "",
        excerpt: existingPost.excerpt || "",
        content: existingPost.content || "",
        cover_image_url: existingPost.cover_image_url || "",
        category_id: existingPost.category?.id || null,
        author_type: authorType,
        author_user_id: existingPost.author_user_id || null,
        author_name: existingPost.author_name || "",
        status: existingPost.status || "draft",
        is_featured: existingPost.is_featured || false,
        meta_title: existingPost.meta_title || "",
        meta_description: existingPost.meta_description || "",
      });
    }
  }, [existingPost, form]);

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      securityAxios.post(endpoints.blog.create, data),
    onSuccess: () => {
      toast.success("Post created successfully");
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to create post");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      securityAxios.post(
        endpoints.blog.update.replace(":id", postId!),
        data
      ),
    onSuccess: () => {
      toast.success("Post updated successfully");
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to update post");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: FormData) => {
    const payload: Record<string, unknown> = {
      title: data.title,
      slug: data.slug || undefined,
      excerpt: data.excerpt || "",
      content: data.content,
      cover_image_url: data.cover_image_url || "",
      category_id: data.category_id || null,
      author_name: data.author_type === "guest" ? data.author_name || "" : "",
      author_user_id: data.author_type === "user" ? data.author_user_id || null : null,
      status: data.status,
      is_featured: data.is_featured || false,
      meta_title: data.meta_title || "",
      meta_description: data.meta_description || "",
    };

    if (isUpdateMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const watchAuthorType = useWatch({ control: form.control, name: "author_type" });
  const coverImageUrl = useWatch({ control: form.control, name: "cover_image_url" });

  const handleMediaSelect = (media: PickedMedia[]) => {
    if (media.length > 0) {
      form.setValue("cover_image_url", media[0].url);
    }
  };

  if (isUpdateMode && isPostLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Post title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (optional — auto-generated from title)</FormLabel>
              <FormControl>
                <Input placeholder="post-slug" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Excerpt */}
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea placeholder="Short summary..." rows={2} {...field} />
              </FormControl>
              <FormDescription>Max 300 characters</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (HTML)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your post content here..."
                  rows={12}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cover Image */}
        <div className="space-y-3">
          <FormLabel>Cover Image</FormLabel>

          {/* Preview of currently selected image */}
          {coverImageUrl ? (
            <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={coverImageUrl}
                alt="Cover preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => form.setValue("cover_image_url", "")}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center aspect-video w-full max-w-md rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
              <ImageIcon size={32} className="text-gray-400" />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setMediaPickerOpen(true)}
            >
              <ImageIcon size={14} />
              Pick from Media Library
            </Button>
          </div>

          <FormField
            control={form.control}
            name="cover_image_url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Or paste an image URL..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <MediaPicker
            open={mediaPickerOpen}
            onOpenChange={setMediaPickerOpen}
            selectedUrls={coverImageUrl ? [coverImageUrl] : []}
            onSelect={handleMediaSelect}
          />
        </div>

        {/* Author */}
        <div className="space-y-4">
          <Label>Author</Label>
          <FormField
            control={form.control}
            name="author_type"
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="guest"
                      checked={field.value === "guest"}
                      onChange={() => field.onChange("guest")}
                    />
                    <span className="text-sm">Guest author</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="user"
                      checked={field.value === "user"}
                      onChange={() => field.onChange("user")}
                    />
                    <span className="text-sm">Registered user</span>
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchAuthorType === "guest" ? (
            <FormField
              control={form.control}
              name="author_name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Author display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="author_user_id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="User ID (UUID)" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    Enter the user ID of a registered admin/staff member
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Featured */}
        <FormField
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">Featured post</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Advanced: SEO */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" type="button" className="gap-2">
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              SEO Settings
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="meta_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input placeholder="SEO title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meta_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="SEO description" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 size={14} className="animate-spin mr-2" />}
            {isUpdateMode ? "Update Post" : "Create Post"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
