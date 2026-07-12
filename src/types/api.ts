/** Shared types for API responses used across axios instances and API utilities. */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
  };
}
