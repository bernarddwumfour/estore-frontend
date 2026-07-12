"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <p className="text-base font-semibold text-red-500">Error</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-gray-900 dark:text-white sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 dark:text-gray-400 sm:text-xl/8">
          An unexpected error occurred in the dashboard. Please try again.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
