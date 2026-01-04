// axios-instances/SecurityAxios.ts
import { endpoints } from "@/constants/endpoints/endpoints";
import { getAuthCookie, setAuthCookie } from "@/lib/providers/auth-provider";
import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosError, 
  AxiosResponse 
} from "axios";



const unAuthenticatedAxios: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
 
// CHANGED: Added type for API response structure
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
  }
  

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

  if (
    !config.url.endsWith("/") &&
    !noTrailingSlashEndpoints.some(ep => config.url?.startsWith(ep)) &&
    !hasTokenParam
  ) {
    config.url += "/";
  }

  return config;
};

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



unAuthenticatedAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // CHANGED: Normalize endpoint first
    const normalizedConfig = normalizeEndpoint(config);


    return normalizedConfig;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);


// ==================== RESPONSE INTERCEPTOR ====================

unAuthenticatedAxios.interceptors.response.use(
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

   
    // CHANGED: Handle other authentication errors
    if (status === 401 || status === 403) {
      console.error("Authentication error:", errorMessage);
      
      // Redirect to login if not already there
      if (typeof window !== "undefined" && !window.location.pathname.includes("/")) {
        window.location.href = "/";
      }
    }

    // CHANGED: Handle validation errors
    if (status === 400 && errorData?.errors) {
      console.error("Validation errors:", errorData.errors);
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



export default unAuthenticatedAxios;