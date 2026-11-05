import Logo from "@/widgets/logo/Logo";

export default function WebLoading() {
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
