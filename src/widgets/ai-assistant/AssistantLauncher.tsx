
"use client";

import { useAuth } from "@/lib/use-auth";
import { ChatAssistant } from "./ChatAssistant";
import type { AssistantTheme } from "./theme";

// Use the same import path you already use for useAuth.

export function AssistantLauncher({ theme }: { theme: AssistantTheme }) {
  const { user, tokens } = useAuth();

  const accessToken = user
    ? (tokens?.access_token ?? null)
    : null;

  return <ChatAssistant token={accessToken} theme={theme} />;
}
