// axios-instances/SecurityAxios.ts
import { endpoints } from "@/constants/endpoints/endpoints";
import { getAuthCookie, setAuthCookie } from "@/lib/providers/auth-provider";
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse
} from "axios";

// ==================== TYPE DEFINITIONS ====================

// CHANGED: Added proper type for refresh subscribers
type RefreshSubscriber = (token: string) => void;

// CHANGED: Added type for API response structure
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// CHANGED: Added type for refresh token response
type RefreshTokenResponse = {
  data: {
    access_token: string;
    refresh_token: string;


  }
}

// ==================== AXIOS INSTANCE CONFIGURATION ====================

const securityAxios: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== GLOBAL VARIABLES ====================

// CHANGED: Added proper typing for refresh state management
let isRefreshing = false;
let refreshSubscribers: RefreshSubscriber[] = [];

// ==================== HELPER FUNCTIONS ====================

/**
 * CHANGED: Updated to normalize endpoints for Django REST Framework
 * Django REST Framework requires trailing slashes for consistency
 */
const normalizeEndpoint = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  if (!config.url) return config;

  // List of endpoints that should NOT have trailing slashes
  const noTrailingSlashEndpoints = [
    endpoints.auth.verifyEmail, // This will have token appended: /verify-email/{token}/
    endpoints.auth.verifyOtp,
    endpoints.logs.djangoAdminLogs,
    endpoints.logs.userLogs,
    endpoints.users.listUsersCardAnalytics,
  ];

  // Check if URL already has a token parameter (e.g., /verify-email/{token}/)
  const hasTokenParam = config.url.match(/\/[a-zA-Z0-9_-]+\/?$/);

  // Add trailing slash if:
  // 1. Doesn't already end with slash
  // 2. Not in noTrailingSlashEndpoints list
  // 3. Doesn't have a token parameter already
  if (
    !config.url.endsWith("/") &&
    !noTrailingSlashEndpoints.some(ep => config.url?.startsWith(ep)) &&
    !hasTokenParam
  ) {
    config.url += "/";
  }

  return config;
};

/**
 * CHANGED: Added helper to check if endpoint is public
 * Public endpoints don't require authentication
 */
const isPublicEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;

  const publicEndpoints = [
    endpoints.auth.login,
    endpoints.auth.signup,
    endpoints.auth.verifyEmail,
    endpoints.auth.resendEmailVerificationLink, // CHANGED: Updated endpoint name
    endpoints.auth.resetPassword,
    endpoints.auth.forgotPassword,
    endpoints.auth.refreshToken,
  ];

  // Check if URL starts with any public endpoint
  // Using startsWith to handle endpoints with parameters
  return publicEndpoints.some(ep =>
    url.startsWith(ep) ||
    url.includes(ep) // Also check includes for flexibility
  );
};

// ==================== REQUEST INTERCEPTOR ====================

securityAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // CHANGED: Normalize endpoint first
    const normalizedConfig = normalizeEndpoint(config);

    // CHANGED: Check if endpoint is public
    if (isPublicEndpoint(normalizedConfig.url)) {
      return normalizedConfig;
    }

    // Get auth data from cookie
    const authData = getAuthCookie();
    const accessToken = authData?.tokens?.access_token;

    if (accessToken) {
      // CHANGED: Ensure headers object exists
      normalizedConfig.headers = normalizedConfig.headers || {};
      normalizedConfig.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      // CHANGED: Redirect to login if no token found for protected endpoint
      console.warn("No access token found for protected endpoint:", normalizedConfig.url);

      // Only redirect on client side
      if (typeof window !== "undefined" && !normalizedConfig.url?.includes("auth")) {
        // Don't redirect if already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    return normalizedConfig;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================

securityAxios.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // CHANGED: Optionally handle successful responses here
    // You could normalize the response data structure

    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const errorData = error.response?.data;
    const errorMessage = errorData?.error || errorData?.message;

    // CHANGED: Handle token expiration
    if (
      status === 401 &&
      (errorMessage?.includes("expired") ||
        errorMessage?.includes("invalid token") ||
        errorData?.error === "Token has expired") && // CHANGED: Match Django error message
      !originalRequest._retry &&
      !originalRequest.url?.includes(endpoints.auth.refreshToken) &&
      !isPublicEndpoint(originalRequest.url)
    ) {
      console.log("Access token expired, attempting refresh...");

      if (isRefreshing) {
        // CHANGED: Queue the request until token is refreshed
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;

            // Retry the original request
            securityAxios(originalRequest)
              .then(response => resolve(response))
              .catch(err => reject(err));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const authData = getAuthCookie();
        const refreshToken = authData?.tokens?.refresh_token;

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // CHANGED: Use securityAxios to call refresh token endpoint
        const refreshResponse = await securityAxios.post<RefreshTokenResponse>(
          endpoints.auth.refreshToken,
          { refresh_token: refreshToken }
        );

        const { access_token, refresh_token } = refreshResponse.data.data;

        if (!access_token || !refresh_token) {
          throw new Error("Invalid tokens received from refresh");
        }

        // CHANGED: Update auth data with new tokens
        const updatedAuthData = {
          ...authData,
          tokens: {
            ...authData?.tokens,
            access_token,
            refresh_token,
          },
        };

        // Update cookie with new tokens
        setAuthCookie(updatedAuthData);

        // Update default Authorization header
        securityAxios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

        // Update the original request header
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Process all queued requests
        refreshSubscribers.forEach(callback => callback(access_token));
        refreshSubscribers = [];

        // Retry the original request
        return securityAxios(originalRequest);

      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Clear auth data on refresh failure
        const authData = getAuthCookie();
        if (authData) {
          // CHANGED: Clear the cookie properly
          document.cookie = "auth_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }

        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // CHANGED: Handle other authentication errors
    if (status === 401 || status === 403) {
      console.error("Authentication error:", errorMessage);

      // Clear auth data
      const authData = getAuthCookie();
      if (authData) {
        document.cookie = "auth_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }

      // Redirect to login if not already there
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // CHANGED: Handle validation errors
    if (status === 400 && errorData?.errors) {
      console.error("Validation errors:", errorData.errors);
      // You could transform validation errors here if needed
    }

    // CHANGED: Extract error message properly
    const displayMessage = errorData?.error ||
      errorData?.message ||
      error.message ||
      "An error occurred";

    // CHANGED: Create a new error with proper message
    const enhancedError = new Error(displayMessage);
    (enhancedError as any).response = error.response;
    (enhancedError as any).status = status;

    return Promise.reject(enhancedError);
  }
);

// ==================== ADDITIONAL UTILITIES ====================

/**
 * CHANGED: Added helper to check authentication status
 */
export const isAuthenticated = (): boolean => {
  const authData = getAuthCookie();
  return !!authData?.tokens?.access_token;
};

/**
 * CHANGED: Added helper to get current access token
 */
export const getCurrentAccessToken = (): string | undefined => {
  const authData = getAuthCookie();
  return authData?.tokens?.access_token;
};

/**
 * CHANGED: Added helper to clear authentication
 */
export const clearAuthentication = (): void => {
  document.cookie = "auth_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  delete securityAxios.defaults.headers.common["Authorization"];
};

/**
 * CHANGED: Added helper to set authentication headers
 */
export const setAuthentication = (accessToken: string): void => {
  securityAxios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
};

export default securityAxios;