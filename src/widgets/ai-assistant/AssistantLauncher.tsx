
"use client";

import { useAuth } from "@/lib/use-auth";
import { ChatAssistant } from "./ChatAssistant";
import type { AssistantTheme } from "./theme";

// Use the same import path you already use for useAuth.

export function AssistantLauncher({ theme }: { theme: AssistantTheme }) {
  const { user, status } = useAuth();
  if (status === "loading" || status === "error") return null;
  return <ChatAssistant key={user?.id || "guest"} authenticated={Boolean(user)} theme={theme} />;
}
