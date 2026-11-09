import BrandLogo from "./BrandLogo";
import type { ReactNode } from "react";
import Image from "next/image";

/**
 * Furniture auth shell — a split layout with a green brand panel (image +
 * oak&loom logo + tagline) beside the form. The form content is passed as
 * children so the form logic stays shared; only this wrapper swaps per template.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white text-[#2b2b22]">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1600&auto=format&fit=crop"
          alt="Modern furniture interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#402820]/75" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-[#f6f3ec]">
          <BrandLogo light />
          <div>
            <h2 className="text-4xl font-black leading-tight">
              Furnish a home you&apos;ll love.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#e5d3cb]">
              Join thousands of customers furnishing their spaces with modern,
              thoughtfully made pieces — built to last a lifetime.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center lg:hidden">
            <BrandLogo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
