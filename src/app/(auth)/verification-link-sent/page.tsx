'use client';

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Logo from "@/widgets/logo/Logo";
import Spinner from "@/widgets/loaders/Spinner";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/use-auth";
import { Separator } from "@/components/ui/separator";

export default function EmailVerificationSentPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const { resendVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!email) return;

    try {
      setIsResending(true);
      await resendVerification(email);
      toast.success("Verification email sent again!");
    } catch (error) {
      console.error("Resend failed:", error);
      toast.error("Failed to resend email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // If no email in URL — fallback
  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <Card className="w-full max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-8">We couldn't find your email address.</p>
          <Link href="/login">
            <Button>Back to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center py-6">
          <Logo />
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Check Your Inbox!
            </CardTitle>
            <CardDescription className="text-lg mt-4 text-gray-600">
              We've sent a verification link to:
            </CardDescription>
            <p className="text-xl font-semibold text-gray-900 mt-3">{email}</p>
          </CardHeader>

          <CardContent className="space-y-8 text-center">
            <div className="space-y-4 text-gray-600">
              <p className="text-base">
                Click the link in the email to verify your account and complete your registration.
              </p>
              <p className="text-sm">
                <strong>Tip:</strong> Check your spam/junk folder if you don't see it in your inbox.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Didn't receive the email?
              </p>
              <Button
                onClick={handleResend}
                disabled={isResending}
                variant="outline"
                size="lg"
                className="w-full max-w-xs mx-auto"
              >
                {isResending ? (
                  <>
                    <Spinner size="sm" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>

            <div className="pt-6">
              <Link href="/login">
                <Button variant="link" className="text-base">
                  ← Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Need help? Contact us at support@yourstore.com</p>
        </div>
      </div>
    </div>
  );
}