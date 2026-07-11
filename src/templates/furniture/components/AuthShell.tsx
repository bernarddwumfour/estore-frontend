import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Furniture auth shell — a split layout with a green brand panel (image +
 * "Furniture." logo + tagline) beside the form. The form content is passed as
 * children so the form logic stays shared; only this wrapper swaps per template.
 */
function FurnitureLogo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full text-base font-black ${
          light ? "bg-[#f5b21a] text-[#22401f]" : "bg-[#3f4d2c] text-white"
        }`}
      >
        F
      </span>
      <span
        className={`text-2xl font-black tracking-tight ${
          light ? "text-white" : "text-[#2b2b22]"
        }`}
      >
        Furniture<span className="text-[#f5b21a]">.</span>
      </span>
    </Link>
  );
}

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
        <div className="absolute inset-0 bg-[#22401f]/75" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-[#f6f3ec]">
          <FurnitureLogo light />
          <div>
            <h2 className="text-4xl font-black leading-tight">
              Furnish a home you&apos;ll love.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#cdd6c4]">
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
            <FurnitureLogo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
