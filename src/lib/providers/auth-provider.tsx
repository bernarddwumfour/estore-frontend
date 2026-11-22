"use client";

import type React from "react";
import { createContext, useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";

// ==================== TYPE DEFINITIONS ====================

// CHANGED: Updated User type to match Django API response structure
// Django returns: email_verified (not is_email_verified), phone (not phone_number)
// Removed unused fields like gender, has_reset_password, first_login, otp_token
type User = {
  id?: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  phone?: string | null;
  address?: string;
  gender?:string;
  city?: string;
  country?: string;
  postal_code?: string;
  is_active?: boolean;
  email_verified?: boolean; // CHANGED: Matches Django field name
  email_verified_at?: string;
  date_joined?: string;
  last_login?: string;
  is_affiliate?: boolean;
  affiliate_profile?: {
    id: string;
    referral_code: string;
    level: string;
    total_earnings: number;
  };
};

function getLoginFailureMessage(error: unknown): string {
  const response = (error as {
    response?: {
      status?: number;
      data?: { error?: unknown; message?: unknown; detail?: unknown };
      headers?: Record<string, unknown>;
    };
  })?.response;
  const data = response?.data;

  // Permission/CSRF failures remain distinct from rate limiting.
  if (response?.status === 429) {
    const retryAfterHeader = response.headers?.["retry-after"];
    const retryAfterSeconds = Number(retryAfterHeader);
    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
      const wait = retryAfterSeconds < 60
        ? `${Math.ceil(retryAfterSeconds)} seconds`
        : `${Math.ceil(retryAfterSeconds / 60)} minutes`;
      return `Too many sign-in attempts. Please try again in ${wait}.`;
    }

    return "Too many sign-in attempts. Please wait a while before trying again.";
  }

  const message = data?.error || data?.message || data?.detail;
  return typeof message === "string" && message.trim() ? message : "Login failed";
}

type AuthContextType = {
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated" | "error";
  login: (email: string, password: string) => Promise<void>;
  staffLogin: (email: string, password: string) => Promise<void>;
  signup: (userData: Partial<User & { password: string }>) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  // requestVerification: () => Promise<void>;
  // checkVerificationStatus: () => Promise<void>;
  // updateProfile: (userData: Partial<User>) => Promise<void>;
  // changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  status: "loading",
  login: async () => {},
  staffLogin: async () => {},
  signup: async () => {},
  logout: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  verifyEmail: async () => {},
  resendVerification: async () => {},
  // requestVerification: async () => {},
  // checkVerificationStatus: async () => {},
  // updateProfile: async () => {},
  // changePassword: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated" | "error">("loading");
  const queryClient = useQueryClient();
  const authGeneration = useRef(0);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      const current = ++authGeneration.current;
      try {
        const response = await securityAxios.get(endpoints.auth.getProfile);
        if (active && current === authGeneration.current) {
          setUser(response.data.data);
          setStatus("authenticated");
        }
      } catch (error: unknown) {
        if (active && current === authGeneration.current) {
          const code = (error as { response?: { status?: number } }).response?.status;
          setUser(null);
          setStatus(code === 401 ? "unauthenticated" : "error");
        }
      }
    };
    const expire = () => {
      authGeneration.current++;
      setUser(null);
      setStatus("unauthenticated");
      void queryClient.cancelQueries().then(() => queryClient.clear());
      if (window.location.pathname.startsWith("/dashboard")) router.replace("/admin/login");
    };
    const sync = (event: StorageEvent) => {
      if (event.key === "estore:auth-change") {
        void queryClient.cancelQueries().then(() => { queryClient.clear(); void restore(); router.refresh(); });
      }
    };
    // Remove the legacy credential cookie; never migrate its untrusted contents.
    document.cookie = "auth_data=;Max-Age=0;path=/";
    void restore();
    window.addEventListener("estore:session-expired", expire);
    window.addEventListener("storage", sync);
    return () => {
      active = false;
      window.removeEventListener("estore:session-expired", expire);
      window.removeEventListener("storage", sync);
    };
  }, [queryClient, router]);

  const notifyTabs = () => {
    try { localStorage.setItem("estore:auth-change", String(Date.now())); } catch { /* Storage may be disabled. */ }
  };

  // ==================== AUTH METHODS ====================

 
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await securityAxios.post(endpoints.auth.login, {
        email,
        password,
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Login failed");
      }

      const apiResponse = response.data;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || "Login failed");
      }

      authGeneration.current++;
      await queryClient.cancelQueries();
      queryClient.clear();
      setUser(apiResponse.data.user);
      setStatus("authenticated");
      notifyTabs();
      const userData = apiResponse.data.user;

      toast.success(apiResponse.message || "Login successful");

      // CHANGED: Check email_verified (not is_email_verified)
      if (!userData.email_verified) {
        router.push(`/verification-link-sent/?email=${userData.email}`);
      } else {
        router.push("/");
      }

    } catch (error: any) {

      toast.error(getLoginFailureMessage(error));
    }
  };

  /**
   * Staff/admin login. Hits the dedicated staff-login endpoint, which rejects
   * customer credentials, and lands on the dashboard instead of the storefront.
   */
  const staffLogin = async (email: string, password: string): Promise<void> => {
    try {
      const response = await securityAxios.post(endpoints.auth.staffLogin, {
        email,
        password,
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Login failed");
      }

      const apiResponse = response.data;

      if (!apiResponse.success) {
        throw new Error(apiResponse.error || "Login failed");
      }

      authGeneration.current++;
      await queryClient.cancelQueries();
      queryClient.clear();
      setUser(apiResponse.data.user);
      setStatus("authenticated");
      notifyTabs();
      const userData = apiResponse.data.user;

      toast.success(apiResponse.message || "Login successful");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {

      toast.error(getLoginFailureMessage(error));
    }
  };


  const signup = async (
    userData: Partial<User & { password: string }>
  ): Promise<void> => {
    try {
      const response = await securityAxios.post(endpoints.auth.signup, {
        email: userData.email,
        password: userData.password,
        // username: userData.username || userData.email?.split("@")[0],
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
      });

      if (response.status !== 201) {
        throw new Error("Signup failed");
      }

      const apiResponse = response.data;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || "Signup failed");
      }


      toast.success(apiResponse.message || "Registration successful");

      router.push(`/verification-link-sent/?email=${userData.email}`);
      
    } catch (error: any) {
      
      // CHANGED: Handle validation errors from Django
      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const firstError = Object.values(validationErrors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        const errorMessage = error?.response?.data?.error || 
                            error?.response?.data?.message || 
                            "Signup failed";
        toast.error(errorMessage);
      }
    }
  };


  const logout = async (): Promise<void> => {
    const isStaff = user?.role === "staff" || user?.role === "admin";

    try {
      await securityAxios.post(endpoints.auth.logout, {});
      authGeneration.current++;
      await queryClient.cancelQueries();
      queryClient.clear();
      setUser(null);
      setStatus("unauthenticated");
      notifyTabs();
      router.push(isStaff ? "/admin/login" : "/login");
      router.refresh();

      toast.success("Logged out successfully");
    } catch {
      toast.error("Could not complete logout. Please try again.");
    }
  };


  const forgotPassword = async (email: string): Promise<void> => {
    try {
      const response = await securityAxios.post(
        endpoints.auth.forgotPassword,
        { email }
      );

      const apiResponse = response.data;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || "Password reset request failed");
      }

      toast.success(apiResponse.message || "Password reset email sent");
      
    } catch (error: any) {
      
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          "Password reset request failed";
      toast.error(errorMessage);
    }
  };

  /**
   * CHANGED: Updated to match Django password reset confirm endpoint
   * Endpoint: POST /api/users/password-reset/confirm/
   */
  const resetPassword = async (
    token: string,
    password: string
  ): Promise<void> => {
    try {
      const response = await securityAxios.post(
        endpoints.auth.resetPassword,
        {
          token,
          new_password: password,
        }
      );

      const apiResponse = response.data;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || "Password reset failed");
      }

      toast.success(apiResponse.message || "Password reset successfully");
      router.push("/login");
      
    } catch (error: any) {
      
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          "Password reset failed";
      toast.error(errorMessage);
    }
  };

  /**
   * CHANGED: Updated to match Django email verification endpoint
   * Endpoint: GET /api/users/verify-email/{token}/
   */
  const verifyEmail = async (token: string): Promise<void> => {
    try {
      // CHANGED: This is a GET request, not POST
      const response = await securityAxios.get(
        `${endpoints.auth.verifyEmail}/${token}/`
      );

      const apiResponse = response.data;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || "Email verification failed");
      }

      toast.success(apiResponse.message || "Email verified successfully");
      
      // Update local user state if logged in
      if (user) {
        const updatedUser = { ...user, email_verified: true };
        setUser(updatedUser);
      }
      
      router.push("/login");
      
    } catch (error: any) {
      
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          "Email verification failed";
      toast.error(errorMessage);
    }
  };

  // /**
  //  * NEW: Added to match Django resend verification endpoint
  //  * Endpoint: POST /api/users/resend-verification/
  //  */
  const resendVerification = async (email: string): Promise<void> => {
    try {
      const response = await securityAxios.post(
        endpoints.auth.resendEmailVerificationLink,
        { email }
      );

      const apiResponse = response.data;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || "Failed to resend verification");
      }

      toast.success(apiResponse.message || "Verification email resent");
      
    } catch (error: any) {
      
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          "Failed to resend verification";
      toast.error(errorMessage);
    }
  };

  const contextValue: AuthContextType = {
    user,
    status,
    login,
    staffLogin,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    // requestVerification,
    // checkVerificationStatus,
    // updateProfile,
    // changePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
