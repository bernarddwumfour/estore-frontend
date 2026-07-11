import type { ComponentType, ReactNode } from "react";
import DefaultAuthShell from "./default/components/AuthShell";
import FurnitureAuthShell from "./furniture/components/AuthShell";

/**
 * Client-safe accessor for the active store's auth shell.
 *
 * The auth pages are client components with shared form logic; they wrap their
 * form content in this themed shell. Like the other accessors, this imports
 * only the presentational shell components so it is safe to use from client
 * components without pulling in the server-side template registry.
 */
const shells: Record<string, ComponentType<{ children: ReactNode }>> = {
  default: DefaultAuthShell,
  furniture: FurnitureAuthShell,
};

const activeStore = process.env.NEXT_PUBLIC_STORE ?? "default";

export const AuthShell: ComponentType<{ children: ReactNode }> =
  shells[activeStore] ?? shells.default;
