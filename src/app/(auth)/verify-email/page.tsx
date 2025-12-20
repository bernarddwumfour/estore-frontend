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
// import { useAuth } from "@/lib/use-auth";
import Logo from "@/widgets/logo/Logo";
import { Card } from "@/components/ui/card";
import Spinner from "@/widgets/loaders/Spinner";
// import Spinner from "@/components/widgets/loaders/Spinner";

const formSchema = z.object({
  verification_code: z.string(),
});

export default function ResetPasswordPage() {
//   const { verifyEmail, resendEmailVerificationLink } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verification_code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
    //   await verifyEmail(values.verification_code);
      // No additional toast needed here since it's handled in verifyEmail
    } catch (error) {
      console.error("Email verification error:", error);
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
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your token for email verification.
          </p>
        </div>

        <Form {...form}>
          <form
            method="POST"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="verification_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter Email Verification Code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    // setIsLoading(true);
                    // await resendEmailVerificationLink();
                    // No additional toast needed here since it's handled in verifyEmail
                  } catch (error) {
                    console.error("Email verification error:", error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                variant={"link"}
                className="text-gray-500"
              >
                Resend verification Code
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
             Verify Email
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
