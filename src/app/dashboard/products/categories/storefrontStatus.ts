import { toast } from "sonner";

export type StorefrontRevalidation = "accepted" | "failed" | "pending" | "unconfigured";

export function showCategoryStorefrontStatus(
  action: string,
  status?: StorefrontRevalidation,
) {
  if (status === "accepted") {
    toast.success(`${action}. Live on store.`);
  } else if (status === "failed") {
    toast.warning(`${action}, but the store refresh failed. Please try again shortly.`);
  } else {
    toast.info(`${action}. Store refresh has not been confirmed.`);
  }
}
