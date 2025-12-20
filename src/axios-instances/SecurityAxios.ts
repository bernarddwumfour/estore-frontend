// axiosInstances/securityaxios.ts
import { endpoints } from "@/constants/endpoints/endpoints";
import { getUserCookie, setUserCookie } from "@/lib/providers/auth-provider";
import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosError } from "axios";

const securityAxios: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Type for queued subscribers during token refresh
type RefreshSubscriber = (token: string) => void;

let isRefreshing = false;
let refreshSubscribers: RefreshSubscriber[] = [];

// Helper function with proper typing
const normalizeEndpoint = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  if (
    config.url &&
    !config.url.endsWith("/") &&
    !(
      config.url.includes(endpoints.auth.verifyEmail) ||
      config.url.includes(endpoints.auth.verifyOtp) ||
      config.url.endsWith(endpoints.logs.djangoAdminLogs) ||
      config.url.includes(endpoints.logs.userLogs) ||
      config.url.endsWith(endpoints.users.listUsersCardAnalytics) ||
      config.url.endsWith(endpoints.scholarships.listScholarshipsCardAnalytics) 
    )
  ) {
    config.url += "/";
  }
  return config;
};

// Request interceptor with proper type casting
securityAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const normalizedConfig = normalizeEndpoint(config);

    const publicEndpoints = [
      endpoints.auth.login,
      endpoints.auth.signup,
      endpoints.auth.verifyEmail,
      endpoints.auth.resendEmailVerificationLink,
      endpoints.auth.resendOTPVerificationCode,
      endpoints.auth.resetPassword,
      endpoints.auth.forgotPassword,
      endpoints.auth.verifyOtp,
      endpoints.scholarships.suggestScholarship
    ];

    if (publicEndpoints.some((ep) => normalizedConfig.url?.endsWith(ep))) {
      return normalizedConfig;
    }

    const token = getUserCookie()?.access_token;
    if (token) {
      normalizedConfig.headers = normalizedConfig.headers || {};
      normalizedConfig.headers.Authorization = `Bearer ${token}`;
    }

    return normalizedConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with proper error typing
securityAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError | any) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const errorMessage = error.response?.data;

    console.log(errorMessage)

    if (
      status === 401 &&
      errorMessage?.error == "Access token has expired. Please login."
       &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(endpoints.auth.refreshToken)
    ) {
      console.log( errorMessage?.error)
      console.log("Before Refreshing")

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(securityAxios(originalRequest));
          });
        });
      }

      console.log("Refreshing")

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const userCookie = getUserCookie();
        const refreshToken = userCookie?.refresh_token;

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoints.auth.refreshToken.slice(1)}`,
          { refresh_token: refreshToken }
        );

        if (refreshResponse.status === 200) {
          const { access_token, refresh_token } = refreshResponse.data as {
            access_token: string;
            refresh_token: string;
          };

          if (!access_token || !refresh_token) {
            throw new Error("Invalid tokens received from refresh");
          }

          setUserCookie({
            ...userCookie,
            access_token,
            refresh_token,
          });

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          refreshSubscribers.forEach((cb) => cb(access_token));
          refreshSubscribers = [];

          return securityAxios(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // setUserCookie({});
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }

      return Promise.reject(error);
    }

    // if (status === 401 || status === 403) {
    //   setUserCookie({});
    //   if (typeof window !== "undefined") {
    //     window.location.href = "/";
    //   }

    //   return Promise.reject(error);
    // }

    return Promise.reject(error);
  }
);

export default securityAxios;