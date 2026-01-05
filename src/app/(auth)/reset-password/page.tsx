'use client';

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/use-auth";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/widgets/logo/Logo";
import Spinner from "@/widgets/loaders/Spinner";

// Only validate password fields
const formSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  return (<Suspense fallback="Getting Token">
    <ResetPassword />
  </Suspense>)
}

function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");


  const { resetPassword, resendVerification } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
      console.error("No token found in URL");
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(token, values.password);
      // Success handled in useAuth hook (toast, redirect, etc.)
    } catch (error) {
      console.error("Password reset failed:", error);
      // Error toast handled in useAuth if implemented
    } finally {
      setIsLoading(false);
    }
  }

  // Optional: Handle resend (if this is also used for OTP flow)
  const handleResendCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await resendVerification(email!);
    } catch (error) {
      console.error("Failed to resend code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // If no token, show error state
  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Invalid or Missing Token
          </h2>
          <p className="text-gray-600 mb-6">
            The password reset link is invalid or has expired.
          </p>
          <Link href="/forgot-password">
            <Button>Request New Reset Link</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="flex justify-center py-6">
        <Logo />
      </div>

      <Card className="w-full max-w-md space-y-2 shadow-md p-6 rounded-lg">
        <div className="text-center">
          <h2 className="mt-6 text-xl font-bold tracking-tight">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a new password below.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Resend Link (optional — remove if not needed here) */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                onClick={handleResendCode}
                className="text-sm text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                Resend verification code
              </Button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" white />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-primary hover:text-primary/90"
          >
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
}