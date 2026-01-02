'use client';

import { useState } from "react";
import Link from "next/link";
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
import Logo from "@/widgets/logo/Logo";
import Spinner from "@/widgets/loaders/Spinner";
import { Mail, CheckCircle } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await forgotPassword(values.email);
      setSubmittedEmail(values.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Password reset request failed:", error);
      // Optional: show error toast here
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="flex justify-center py-6">
        <Logo />
      </div>

      <Card className="w-full max-w-md space-y-8 shadow-md p-8 rounded-lg">
        {/* SUCCESS STATE */}
        {isSubmitted ? (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-green-600" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                Password Reset Link Sent!
              </h2>
              <p className="text-gray-600">
                We've sent a password reset link to:
              </p>
              <p className="font-semibold text-gray-900 text-lg">
                {submittedEmail}
              </p>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Check your inbox (and spam folder) and click the link to reset your password.
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/login" className="block">
                <Button className="w-full">Back to Login</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* FORM STATE */}
            <div className="text-center">
              <h2 className="mt-6 text-2xl font-bold tracking-tight">
                Reset Your Password
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner size="sm" white  />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-primary hover:text-primary/90"
              >
                ← Back to login
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}