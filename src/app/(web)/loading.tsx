import BrandLogo from "@/templates/furniture/components/BrandLogo";
import Logo from "@/widgets/logo/Logo";
import TyrePapaLogo from "@/templates/beauty/components/BrandLogo";

export default function WebLoading() {
  if (process.env.NEXT_PUBLIC_STORE === "beauty") {
    return <div className="flex min-h-[70vh] items-center justify-center bg-[#faf9f6] px-6 text-[#252520]" role="status" aria-live="polite" aria-label="Loading TyrePapa">
      <div className="text-center"><div className="flex justify-center"><TyrePapaLogo tone="ink" compact /></div><p className="mt-4 text-[10px] uppercase tracking-[.2em] text-[#8a6946]">Ready for the road ahead.</p></div>
    </div>;
  }
  if (process.env.NEXT_PUBLIC_STORE === "furniture") {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#f6f3ec] px-6 text-[#2b2b22]"
        role="status"
        aria-live="polite"
        aria-label="Loading oak&loom"
      >
        <div className="flex flex-col items-center text-center">
          <BrandLogo />
          <p className="mt-5 text-sm text-[#6b6b5a]">Make yourself at home.</p>
          <div className="mt-8 flex items-center gap-2" aria-hidden="true">
            {[0, 1, 2].map(index => (
              <span
                key={index}
                className="h-2 w-2 rounded-full bg-[#654035] motion-safe:animate-pulse"
                style={{ animationDelay: `${index * 200}ms` }}
              />
            ))}
          </div>
          <span className="sr-only">Loading oak&loom</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[70vh] items-center justify-center bg-white px-6"
      role="status"
      aria-live="polite"
      aria-label="Loading store"
    >
      <div className="flex flex-col items-center">
        <Logo />
        <p className="mt-3 text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
          <span className="web-loading-motto">Premium Apple Devices.</span>
        </p>
      </div>
    </div>
  );
}
