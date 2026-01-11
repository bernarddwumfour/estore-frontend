// components/reviews/CreateReviewForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

// Zod Schema for Review
const reviewFormSchema = z.object({
  rating: z.number()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating cannot exceed 5" }),
  title: z.string()
    .min(2, { message: "Title must be at least 2 characters" })
    .max(100, { message: "Title cannot exceed 100 characters" })
    .optional(),
  comment: z.string()
    .min(10, { message: "Comment must be at least 10 characters" })
    .max(1000, { message: "Comment cannot exceed 1000 characters" }),
  is_verified_purchase: z.boolean().default(false),
});

type ReviewFormData = z.input<typeof reviewFormSchema>;

interface CreateReviewFormProps {
  productSlug: string;
  productTitle?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateReviewForm({ 
  productSlug, 
  productTitle,
  onSuccess,
  onCancel 
}: CreateReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Initialize form
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      title: "",
      comment: "",
      is_verified_purchase: false,
    },
  });

  // Watch rating value
  const ratingValue = form.watch("rating");

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setIsSubmitting(true);

      // Prepare payload
      const payload = {
        rating: data.rating,
        comment: data.comment.trim(),
        ...(data.title?.trim() && { title: data.title.trim() }),
        is_verified_purchase: data.is_verified_purchase,
      };

      console.log("Submitting review payload:", payload);

      // Make POST request to create review
      const endpoint = endpoints.products.createReview.replace(":slug", productSlug);
      const response = await securityAxios.post(endpoint, payload);

      console.log("API Response:", response.data);

      if (response.status === 201) {
        const apiResponse = response.data;

        if (apiResponse.success) {
          toast.success(apiResponse.message || "Review submitted successfully");

          // Reset form
          form.reset({
            rating: 5,
            title: "",
            comment: "",
            is_verified_purchase: false,
          });

          // Refresh data
          queryClient.invalidateQueries({
            queryKey: ["product", productSlug],
            exact: false,
          });

          queryClient.invalidateQueries({
            queryKey: ["product-reviews", productSlug],
            exact: false,
          });

          // Trigger success callback
          if (onSuccess) {
            onSuccess();
          }

          // Refresh the page to show new review
          router.refresh();
        } else {
          toast.error(apiResponse.error || "Failed to submit review");
        }
      } else {
        toast.error(`Unexpected status: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);

      // Handle specific error cases
      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;

        // Display first validation error in toast
        const firstErrorKey = Object.keys(validationErrors)[0];
        const firstError = validationErrors[firstErrorKey];

        if (Array.isArray(firstError)) {
          toast.error(firstError[0]);
        } else {
          toast.error(firstError);
        }

        // Set form errors for specific fields
        Object.keys(validationErrors).forEach((field) => {
          const fieldName = field as keyof ReviewFormData;
          const errorMessage = Array.isArray(validationErrors[field])
            ? validationErrors[field][0]
            : validationErrors[field];

          form.setError(fieldName, {
            type: "manual",
            message: errorMessage,
          });
        });
      } else if (error?.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error?.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes("already reviewed")) {
          toast.error("You have already reviewed this product");
        } else {
          toast.error(errorMessage);
        }
      } else if (error?.response?.status === 401) {
        toast.error("Please login to submit a review");
      } else if (error?.response?.status === 404) {
        toast.error("Product not found");
      } else if (error?.response?.status === 409) {
        toast.error("You have already reviewed this product");
      } else if (error?.response?.status === 400) {
        toast.error("Invalid rating value. Please select between 1 and 5 stars.");
      } else {
        toast.error("Failed to submit review. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-gray-900">
            Write a Review
          </h3>
          {productTitle && (
            <p className="text-gray-600">
              Share your thoughts about <span className="font-medium">{productTitle}</span>
            </p>
          )}
        </div>

        {/* Rating Selection */}
        <div className="space-y-6 p-6 border rounded-lg bg-card">
          <div>
            <h4 className="text-lg font-semibold">Overall Rating</h4>
            <p className="text-sm text-muted-foreground">
              How would you rate this product?
            </p>
          </div>

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => field.onChange(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(null)}
                        className="p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${star <= (hoveredRating || field.value)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-300 text-gray-300'
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </FormControl>
                <div className="flex items-center justify-between mt-2">
                  <FormDescription>
                    {(() => {
                      const rating = hoveredRating || field.value;
                      const labels = {
                        1: "Poor - I hate it",
                        2: "Fair - Could be better",
                        3: "Good - Met expectations",
                        4: "Very Good - Above expectations",
                        5: "Excellent - Love it!"
                      };
                      return labels[rating as keyof typeof labels] || "Select your rating";
                    })()}
                  </FormDescription>
                  <span className="text-lg font-semibold text-gray-900">
                    {field.value} star{field.value !== 1 ? 's' : ''}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Review Details */}
        <div className="space-y-6 p-6 border rounded-lg bg-card">
          <div>
            <h4 className="text-lg font-semibold">Review Details</h4>
            <p className="text-sm text-muted-foreground">
              Tell us more about your experience
            </p>
          </div>

          {/* Review Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review Title (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Summarize your experience in a few words..."
                    className="min-h-[60px]"
                    maxLength={100}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <div className="flex justify-between">
                  <FormDescription>
                    A catchy title that summarizes your review
                  </FormDescription>
                  <span className="text-xs text-muted-foreground">
                    {field.value?.length || 0}/100
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Review Comment */}
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detailed Review *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share your experience with this product. What did you like or dislike? How does it compare to similar products? Be specific and detailed..."
                    className="min-h-[150px]"
                    maxLength={1000}
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between">
                  <FormDescription>
                    Be specific about product features, quality, performance, etc.
                  </FormDescription>
                  <span className="text-xs text-muted-foreground">
                    {field.value.length}/1000
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Verification Section
        <div className="space-y-6 p-6 border rounded-lg bg-card">
          <div>
            <h4 className="text-lg font-semibold">Verification</h4>
            <p className="text-sm text-muted-foreground">
              Help others trust your review
            </p>
          </div>

          <FormField
            control={form.control}
            name="is_verified_purchase"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Verified Purchase</FormLabel>
                  <FormDescription>
                    Did you purchase this product from our store?
                  </FormDescription>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium text-green-600">✓ Verified Purchase</span> badge adds credibility to your review
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-6 w-11"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div> */}

        {/* Tips Section */}
        <div className="p-6 border border-blue-100 rounded-lg bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Writing a helpful review
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Be honest and objective about your experience</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Include specific details about product features and quality</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Mention how long you've used the product</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Compare with similar products if possible</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Avoid personal information and promotional content</span>
            </li>
          </ul>
        </div>

        {/* Submit/Cancel Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-8"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="lg"
            className="min-w-[200px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </div>
            ) : (
              "Submit Review"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}