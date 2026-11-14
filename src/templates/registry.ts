import type { Template } from "./contract";
import { defaultTemplate } from "./default";
import { furniture } from "./furniture";
import { tyrepapa } from "./tyrepapa";
import { beauty } from "./beauty";

/**
 * Active store templates. A store inherits the `default` baseline and spreads
 * its own overrides on top, so it only needs to ship the slots that differ.
 *
 * The active store is chosen at build time via NEXT_PUBLIC_STORE — set it per
 * deployment (one Vercel project per store). Unset uses default; unknown values fail loudly.
 */
const registries: Record<string, Template> = {
  default: defaultTemplate,
  furniture: { ...defaultTemplate, ...furniture },
  tyrepapa: { ...defaultTemplate, ...tyrepapa },
  beauty: { ...defaultTemplate, ...beauty },
};

const activeStore = process.env.NEXT_PUBLIC_STORE ?? "default";

if (!registries[activeStore]) {
  throw new Error(`Unknown NEXT_PUBLIC_STORE "${activeStore}". Expected one of: ${Object.keys(registries).join(", ")}.`);
}

export const T: Template = registries[activeStore];
