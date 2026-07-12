"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-red-500">500</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 dark:text-white sm:text-7xl">
          Something went wrong
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 dark:text-gray-400 sm:text-xl/8">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="ghost">
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
