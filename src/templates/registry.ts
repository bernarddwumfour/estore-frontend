import type { Template } from "./contract";
import { defaultTemplate } from "./default";
import { furniture } from "./furniture";

/**
 * Active store templates. A store inherits the `default` baseline and spreads
 * its own overrides on top, so it only needs to ship the slots that differ.
 *
 * The active store is chosen at build time via NEXT_PUBLIC_STORE — set it per
 * deployment (one Vercel project per store). Unknown/unset falls back to default.
 */
const registries: Record<string, Template> = {
  default: defaultTemplate,
  furniture: { ...defaultTemplate, ...furniture },
};

const activeStore = process.env.NEXT_PUBLIC_STORE ?? "default";

export const T: Template = registries[activeStore] ?? registries.default;
