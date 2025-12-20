"use client";

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
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/lib/use-auth";
import Logo from "@/widgets/logo/Logo";
import { Card } from "@/components/ui/card";
import Spinner from "@/widgets/loaders/Spinner";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function ResetPasswordPage() {
  // const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // await forgotPassword(values.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Password Reset error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items- flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex justify-center py-6">
        <Logo  />
      </div>
      <Card className="w-full max-w-md space-y-8 shadow-md p-6 rounded-lg">
        <div className="text-center">
          <h2 className="mt-6 text-xl font-bold tracking-tight">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </p>
        </div>
        <Form {...form}>
          <form
            method="POST"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
             Send reset OTP
             {isLoading && <Spinner size="sm" white />}
            </Button>
            <div className="text-center">
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/90"
              >
                Back to login
              </Link>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
