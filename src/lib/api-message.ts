export interface ApiError {
    response?: { status?: number; data?: { message?: string } };
}

/** Extract the backend envelope's message from an axios error, with a fallback. */
export const apiMessage = (error: unknown, fallback: string) =>
    (error as ApiError)?.response?.data?.message || fallback;
