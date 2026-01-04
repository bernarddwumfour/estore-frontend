"use client";

import type React from "react";
import { createContext, useEffect, useState } from "react";
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
};

// CHANGED: Added explicit Tokens type for better type safety
type Tokens = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
};

// CHANGED: Created AuthData type to store both user and tokens together
type AuthData = {
  user: User;
  tokens: Tokens;
};

type AuthContextType = {
  user: User | null;
  tokens: Tokens | null;
  login: (email: string, password: string) => Promise<void>;
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

// CHANGED: Changed cookie key from "user" to "auth_data" to store both user and tokens
const AUTH_COOKIE_KEY = "auth_data";

// ==================== COOKIE UTILITIES ====================

/**
 * CHANGED: Now stores complete auth data (user + tokens) instead of just user
 * This ensures tokens are properly persisted for authenticated requests
 */
export function setAuthCookie(authData: AuthData, days: number = 7): void {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    const cookieValue = `${AUTH_COOKIE_KEY}=${encodeURIComponent(
      JSON.stringify(authData)
    )};expires=${expires.toUTCString()};path=/;SameSite=Lax${
      location.protocol === "https:" ? ";Secure" : ""
    }`;

    document.cookie = cookieValue;
  } catch (error) {
    console.error("Failed to set auth cookie:", error);
  }
}

/**
 * CHANGED: Returns AuthData (user + tokens) instead of just User
 * This provides access to tokens for authenticated API calls
 */
export function getAuthCookie(): AuthData | null {
  try {
    const nameEQ = `${AUTH_COOKIE_KEY}=`;
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        const cookieValue = cookie.substring(nameEQ.length);
        const decodedValue = decodeURIComponent(cookieValue);
        return JSON.parse(decodedValue) as AuthData;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to get auth cookie:", error);
    return null;
  }
}

/**
 * CHANGED: Removes the auth_data cookie instead of user cookie
 */
export function removeAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// ==================== AUTH CONTEXT ====================

export const AuthContext = createContext<AuthContextType>({
  user: null,
  tokens: null,
  login: async () => {},
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
  const [tokens, setTokens] = useState<Tokens | null>(null);

  // Initialize auth state from cookies on mount
  useEffect(() => {
    const authData = getAuthCookie();
    if (authData) {
      setUser(authData.user);
      setTokens(authData.tokens);
      
      // Set default axios headers if tokens exist
      if (authData.tokens.access_token) {
        securityAxios.defaults.headers.common["Authorization"] = 
          `Bearer ${authData.tokens.access_token}`;
      }
    }
  }, []);

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

      const { user: userData, tokens: tokenData } = apiResponse.data;

      const authData: AuthData = {
        user: userData,
        tokens: tokenData,
      };

      setAuthCookie(authData);
      setUser(userData);
      setTokens(tokenData);

      // Set authorization header for future requests
      securityAxios.defaults.headers.common["Authorization"] = 
        `Bearer ${tokenData.access_token}`;

      toast.success(apiResponse.message || "Login successful");

      // CHANGED: Check email_verified (not is_email_verified)
      if (!userData.email_verified) {
        router.push(`/verification-link-sent/?email=${userData.email}`);
      } else {
        router.push("/");
      }

    } catch (error: any) {
      console.error("Login error:", error);
      
      // CHANGED: Extract error from Django API response structure
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          "Login failed";
      toast.error(errorMessage);
    }
  };

 
  const signup = async (
    userData: Partial<User & { password: string }>
  ): Promise<void> => {
    try {
      const response = await securityAxios.post(endpoints.auth.signup, {
        email: userData.email,
        password: userData.password,
        username: userData.username || userData.email?.split("@")[0],
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
      console.error("Signup error:", error);
      
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
    try {
      const authData = getAuthCookie();
      const refreshToken = authData?.tokens.refresh_token;

      if (refreshToken) {
        // Call logout API to blacklist tokens
        await securityAxios.post(endpoints.auth.logout, {
          refresh_token: refreshToken,
        });
      }

      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
    } finally {
      removeAuthCookie();
      setUser(null);
      setTokens(null);
      
      delete securityAxios.defaults.headers.common["Authorization"];
      
      router.push("/login");
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
      console.error("Forgot password error:", error);
      
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
      console.error("Reset password error:", error);
      
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
        const authData = getAuthCookie();
        if (authData) {
          setAuthCookie({ ...authData, user: updatedUser });
        }
        setUser(updatedUser);
      }
      
      router.push("/login");
      
    } catch (error: any) {
      console.error("Email verification error:", error);
      
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
      console.error("Resend verification error:", error);
      
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          "Failed to resend verification";
      toast.error(errorMessage);
    }
  };

  // /**
  //  * NEW: Added to match Django request verification endpoint (authenticated)
  //  * Endpoint: POST /api/users/request-verification/
  //  */
  // const requestVerification = async (): Promise<void> => {
  //   try {
  //     const response = await securityAxios.post(
  //       endpoints.auth.requestVerification
  //       // No body needed - uses JWT token
  //     );

  //     const apiResponse = response.data;
      
  //     if (!apiResponse.success) {
  //       throw new Error(apiResponse.error || "Failed to request verification");
  //     }

  //     toast.success(apiResponse.message || "Verification email sent");
      
  //   } catch (error: any) {
  //     console.error("Request verification error:", error);
      
  //     const errorMessage = error?.response?.data?.error || 
  //                         error?.response?.data?.message || 
  //                         "Failed to request verification";
  //     toast.error(errorMessage);
  //   }
  // };

  // /**
  //  * NEW: Added to check verification status
  //  * Endpoint: GET /api/users/check-verification/
  //  */
  // const checkVerificationStatus = async (): Promise<void> => {
  //   try {
  //     const response = await securityAxios.get(
  //       endpoints.auth.checkVerificationStatus
  //     );

  //     const apiResponse = response.data;
      
  //     if (!apiResponse.success) {
  //       throw new Error(apiResponse.error || "Failed to check verification status");
  //     }

  //     return apiResponse.data; // Returns { email_verified: boolean, email_verified_at: string }
      
  //   } catch (error: any) {
  //     console.error("Check verification status error:", error);
  //     throw error;
  //   }
  // };

  // /**
  //  * NEW: Added to update user profile
  //  * Endpoint: PUT /api/users/profile/update/
  //  */
  // const updateProfile = async (userData: Partial<User>): Promise<void> => {
  //   try {
  //     const response = await securityAxios.put(
  //       endpoints.auth.updateProfile,
  //       userData
  //     );

  //     const apiResponse = response.data;
      
  //     if (!apiResponse.success) {
  //       throw new Error(apiResponse.error || "Failed to update profile");
  //     }

  //     // Update local user state
  //     if (user) {
  //       const updatedUser = { ...user, ...userData };
  //       const authData = getAuthCookie();
  //       if (authData) {
  //         setAuthCookie({ ...authData, user: updatedUser });
  //       }
  //       setUser(updatedUser);
  //     }

  //     toast.success(apiResponse.message || "Profile updated successfully");
      
  //   } catch (error: any) {
  //     console.error("Update profile error:", error);
      
  //     const errorMessage = error?.response?.data?.error || 
  //                         error?.response?.data?.message || 
  //                         "Failed to update profile";
  //     toast.error(errorMessage);
  //   }
  // };

  // /**
  //  * NEW: Added to change password
  //  * Endpoint: POST /api/users/profile/change-password/
  //  */
  // const changePassword = async (
  //   currentPassword: string,
  //   newPassword: string
  // ): Promise<void> => {
  //   try {
  //     const response = await securityAxios.post(
  //       endpoints.auth.changePassword,
  //       {
  //         current_password: currentPassword,
  //         new_password: newPassword,
  //       }
  //     );

  //     const apiResponse = response.data;
      
  //     if (!apiResponse.success) {
  //       throw new Error(apiResponse.error || "Failed to change password");
  //     }

  //     toast.success(apiResponse.message || "Password changed successfully");
      
  //     // CHANGED: Logout user after password change (Django invalidates tokens)
  //     await logout();
      
  //   } catch (error: any) {
  //     console.error("Change password error:", error);
      
  //     const errorMessage = error?.response?.data?.error || 
  //                         error?.response?.data?.message || 
  //                         "Failed to change password";
  //     toast.error(errorMessage);
  //   }
  // };

  // ==================== CONTEXT VALUE ====================

  const contextValue: AuthContextType = {
    user,
    tokens,
    login,
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