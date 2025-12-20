"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
// import { endpoints } from "@/endpoints/endpoints";
// import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import Spinner from "@/widgets/loaders/Spinner";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string(),
});

export default function LoginPage() {
  // const { toast } = useToast();
  const router = useRouter();
  // const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      // await login(values.email, values.password);
    } catch (error) {
      console.error("Login error form submit:", error);
      // if (error instanceof Error) {
      //   toast.error(error.message);
      // } else {
      //   toast("An unexpected error occurred during login");
      // }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items- flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex justify-center py-6">
        <Logo  />
      </div>
      <Card className="w-full max-w-md space-y-8 shadow-md p-4  rounded-lg">
        <div className="text-center">
          <h2 className="mt-2 text-xl font-bold tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/90"
            >
              create a new account
            </Link>
          </p>
        </div>
        <Form {...form}>
          <form
            method="POST"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(form.getValues());
            }}
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>Password</FormLabel>{" "}
                  <FormControl>
                   <div className="relative">
                   <Input
                      type={showPassword ? "text" : "password"}
                      {...field}
                      className="pr-10"
                    />

                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-black"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                   </div>
                  </FormControl>
                </FormItem>
              )}
            />

            
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              Sign In
              {isLoading && <Spinner size="sm" white />}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
