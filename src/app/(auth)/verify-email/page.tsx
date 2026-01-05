'use client';

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/widgets/logo/Logo";
import Spinner from "@/widgets/loaders/Spinner";
import { Check, MessageCircleWarning, Mail } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

export default function VerifyEmailPage() {
    return (<Suspense fallback="Getting Token">
        <VerifyEmail />
      </Suspense>)
}

function VerifyEmail(){
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const hasVerified = useRef(false);
  const { verifyEmail, resendVerification } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid" | "resent">("loading");
  const [isResending, setIsResending] = useState(false);

  // Auto-verify on mount if token exists
  useEffect(() => {
    if (!token || !email) {
      setStatus("invalid");
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        setStatus("loading");
        await verifyEmail(token);
        setStatus("success");
      } catch (error) {
        console.error("Email verification failed:", error);
        setStatus("error");
      }
    };

    verify();
  }, [token, email, verifyEmail]);

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsResending(true);
      await resendVerification(email);
      setStatus("resent"); // Show success message
    } catch (error) {
      console.error("Resend failed:", error);
      // You could add an error toast here if needed
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="flex justify-center py-6">
        <Logo />
      </div>

      <Card className="w-full max-w-md space-y-2 shadow-md p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold tracking-tight">Verify Your Email</h2>

        {/* Loading */}
        {status === "loading" && (
          <div className="space-y-6 py-8">
            <Spinner size="lg" />
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="space-y-6 py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Email Verified!</h3>
              <p className="mt-2 text-gray-600">
                Your email <strong>{email}</strong> has been successfully verified.
              </p>
            </div>
            <Link href="/login">
              <Button className="w-full">Continue to Login</Button>
            </Link>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="space-y-6 py-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Verification Failed</h3>
              <p className="mt-2 text-gray-600">
                The verification link may have expired or is invalid.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={handleResend}
                disabled={isResending || !email}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Spinner size="sm"/>
                    Sending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
              <Link href="/login">
                <Button variant="link">Back to Login</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Resent Success */}
        {status === "resent" && (
          <div className="space-y-6 py-3">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Email Sent!</h3>
              <p className="mt-2 text-gray-600">
                A new verification email has been sent to <strong>{email}</strong>.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Please check your inbox (and spam folder) and click the link to verify your account.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={handleResend}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? "Sending..." : "Resend Again"}
              </Button>
              <Link href="/login">
                <Button variant="link">Back to Login</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Invalid Link */}
        {status === "invalid" && (
          <div className="space-y-6 py-8">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <MessageCircleWarning className="w-10 h-10 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Invalid Link</h3>
              <p className="mt-2 text-gray-600 text-sm">
                Missing verification token or email. Please click the link sent to your inbox.
              </p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}