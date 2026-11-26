/** Keep policy content aligned with the active storefront's main content. */
const store = process.env.NEXT_PUBLIC_STORE ?? "default";

export const policyContentClass = store === "tyrepapa"
  ? "mx-auto w-[90%] max-w-[1440px]"
  : store === "amammre"
    ? "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12"
    : store === "oliveandaura"
      ? "mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10"
      : store === "furniture"
        ? "container mx-auto px-4 lg:px-8"
        : "container mx-auto px-4";
