export type { ApiError } from "@/types/api";
import type { ApiError } from "@/types/api";

/** Extract the backend envelope's message from an axios error, with a fallback. */
export const apiMessage = (error: unknown, fallback: string) =>
    (error as ApiError)?.response?.data?.message || fallback;
