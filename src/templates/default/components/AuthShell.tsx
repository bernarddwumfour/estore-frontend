import type { ReactNode } from "react";
import Logo from "@/widgets/logo/Logo";
import { Card } from "@/components/ui/card";

/**
 * Default auth shell — centered logo + card, matching the iPlug auth pages.
 * The form content (title, fields, actions) is passed as children so the form
 * logic stays shared across stores; only this wrapper swaps per template.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex justify-center py-6">
        <Logo />
      </div>
      <Card className="w-full max-w-md space-y-8 rounded-lg p-6 shadow-md">
        {children}
      </Card>
    </div>
  );
}
