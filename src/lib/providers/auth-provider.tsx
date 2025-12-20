"use client";

import type React from "react";

import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";

type User = {
  id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone_number?: string | null;
  gender?: string;
  role?: string;
  is_active?: boolean;
  is_email_verified?: boolean;
  has_reset_password?: boolean;
  first_login?: boolean;
  access_token?: string;
  refresh_token?: string;
  otp_token?: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (user: Partial<User & { password: string }>) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (otp: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendOTPVerificationCode: () => Promise<void>;
  resendEmailVerificationLink: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
};

const USER_COOKIE_KEY = "user";

export function setUserCookie(user: User, days: number = 7): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  const cookieValue = `${USER_COOKIE_KEY}=${encodeURIComponent(
    JSON.stringify(user)
  )};expires=${expires.toUTCString()};path=/;SameSite=Lax${
    location.protocol === "https:" ? ";Secure" : ""
  }`;

  document.cookie = cookieValue;
}

export function getUserCookie(): User | null {
  const nameEQ = `${USER_COOKIE_KEY}=`;
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      const cookieValue = cookie.substring(nameEQ.length);
      try {
        return JSON.parse(decodeURIComponent(cookieValue)) as User;
      } catch (e) {
        console.error("Failed to parse user cookie", e);
        return null;
      }
    }
  }
  return null;
}

export function removeUserCookie(): void {
  document.cookie = `${USER_COOKIE_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  resetPassword: async () => {},
  forgotPassword: async () => {},
  verifyOtp: async () => {},
  verifyEmail: async () => {},
  resendOTPVerificationCode: async () => {},
  resendEmailVerificationLink: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUserCookie());
  }, []);

  // Mock login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      let response = await securityAxios.post(endpoints.auth.login, {
        username: email,
        password,
      });
      console.log(response, " response");
      if (response.status !== 200) {
        throw new Error("Login failed: Errorrrrr");
      }
      const user = {};
      setUserCookie({ ...user, access_token: response.data.token });
      toast.success(response.data.message || "Login successful");
      if (response.data.email_verification_required) {
        router.push("/verify-email");
        return;
      } else if (response.data.otp_verification_required) {
        router.push("/verify-otp");
        return;
      } else {
        setUserCookie(response.data.data);
        setUser(response.data.data);
        router.push("/");
        return;
      }
    } catch (error: any) {
      console.log(error, " error");
      toast.error(error?.response?.data?.error || "Login failed");
    }
  };

  // Mock signup function
  const signup = async (
    user: Partial<User & { password: string }>
  ): Promise<void> => {
    try {
      const response = await securityAxios.post(endpoints.auth.signup, {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        password: user.password,
        gender: user.gender,
      });

      if (response.status !== 201) {
        throw new Error("Signup failed");
      }
      const userData = response.data.data;
      setUserCookie(userData);
      // Delay navigation to allow toast to appear
      toast.success(response.data.message || "Signup successful");
      if (response.data.data.is_email_verified == false) {
        router.push("/verify-email");
        return;
      } else {
        router.push("/login");
        return;
      }

      // setTimeout(() => router.push("/signup"), 1000);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Signup failed");
    }
  };

  // Mock login function
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      let response = await securityAxios.post(endpoints.auth.forgotPassword, {
        username: email,
      });
      if (response.status !== 200) {
        throw new Error("Login failed: Errorrrrr");
      }
      toast.success(response.data.message || "Login successful");
      const user = {};
      setUserCookie({ ...user, access_token: response.data.token });
      router.push("/reset-password");
    } catch (error: any) {
      console.log(error, " error");
      toast.error(error?.response?.data?.error || "Login failed");
    }
  };

  // Define the verifyOtp function
  const resetPassword = async (
    otp: string,
    password: string
  ): Promise<void> => {
    try {
      const response = await securityAxios.post(endpoints.auth.resetPassword, {
        token: getUserCookie()?.access_token,
        otp_code: otp,
        new_password: password,
      });

      if (response.status !== 200) {
        throw new Error("Password reset failed");
      }
      const user = response.data.data;
      setUserCookie(user);
      toast.success(response.data.message || "Password reset successfully");
      // Delay navigation to allow toast to appear
      setTimeout(() => router.push("/login"), 1000);
    } catch (error: any) {
      console.error("Password reset failed:", error);
      toast.error(error?.response?.data?.error || "Password reset failed");
      throw error; // Propagate error to the calling try/catch
    }
  };

  // Define the verifyOtp function
  const verifyEmail = async (verification_code: string): Promise<void> => {
    try {
      const response = await securityAxios.post(
        `${endpoints.auth.verifyEmail}?token=${
          getUserCookie()?.access_token
        }&verification_code=${verification_code}`
      );

      if (response.status !== 200) {
        throw new Error("Email verification failed");
      }
      const user = response.data.data;
      setUserCookie(user);
      toast.success(response.data.message || "Email verified successfully");
      // Delay navigation to allow toast to appear
      setTimeout(() => router.push("/"), 1000);
    } catch (error: any) {
      console.error("Email verification failed:", error);
      toast.error(error?.response?.data?.error || "Email verification failed");
      throw error; // Propagate error to the calling try/catch
    }
  };
  // Define the verifyOtp function
  const verifyOtp = async (otp: string): Promise<void> => {
    try {
      const response = await securityAxios.post(endpoints.auth.verifyOtp, {
        token: getUserCookie()?.access_token,
        otp_code: otp,
      });

      if (response.status !== 200) {
        throw new Error("OTP verification failed");
      }
      const user = response.data.data;
      setUserCookie(user);
      toast.success(response.data.message || "OTP verified successfully");
      // Delay navigation to allow toast to appear
      setTimeout(() => router.push("/"), 1000);
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      toast.error(error?.response?.data?.error || "OTP verification failed");
      throw error; // Propagate error to the calling try/catch
    }
  };

  // Define the verifyOtp function
  const resendEmailVerificationLink = async (): Promise<void> => {
    try {
      const response = await securityAxios.post(
        endpoints.auth.resendEmailVerificationLink,
        {
          token: getUserCookie()?.access_token,
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed To resend Verification Link");
      }

      toast.success(
        response.data.message || "Verification link resent successfully"
      );
      // Delay navigation to allow toast to appear
    } catch (error) {
      console.error("Failed To resend Verification Link:", error);
      toast.error("Failed To resend Verification Link");
      throw error; // Propagate error to the calling try/catch
    }
  };

  // Define the verifyOtp function
  const resendOTPVerificationCode = async (): Promise<void> => {
    try {
      const response = await securityAxios.post(
        endpoints.auth.resendOTPVerificationCode,
        {
          token: getUserCookie()?.access_token,
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed To resend Verification Link");
      }

      toast.success(
        response.data.message || "Verification link resent successfully"
      );
      // Delay navigation to allow toast to appear
    } catch (error) {
      console.error("Failed To resend Verification Link:", error);
      toast.error("Failed To resend Verification Link");
      throw error; // Propagate error to the calling try/catch
    }
  };

  // Mock logout function
  const logout = async () => {
    try {
      let response = await securityAxios.post(endpoints.auth.logout, {});
      if (response.status !== 200) {
        throw new Error("Login failed: Errorrrrr");
      }

      toast.success(response.data.message || "You have been logged out");
    } catch (error: any) {
      console.log(error, " error");
      toast.error(error?.response?.data?.error || "Logout failed");
    }
    removeUserCookie();
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        resetPassword,
        forgotPassword,
        verifyOtp,
        verifyEmail,
        resendOTPVerificationCode,
        resendEmailVerificationLink,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
