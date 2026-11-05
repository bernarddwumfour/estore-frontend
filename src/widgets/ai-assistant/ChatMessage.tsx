
import { Bot, UserRound } from "lucide-react";
import type { AssistantTheme } from "./theme";

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
  theme: AssistantTheme;
}

export function ChatMessage({
  message,
  theme,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`
        flex w-full min-w-0 items-start gap-2
        ${isUser ? "flex-row-reverse" : ""}
      `}
    >
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${theme.assistantAvatar}`}>
        {isUser ? (
          <UserRound className="size-4" />
        ) : (
          <Bot className="size-4" />
        )}
      </div>

      <div
        className={`
          min-w-0 max-w-[calc(100%-2.5rem)]
          overflow-hidden rounded-2xl
          px-3 py-2 text-sm leading-relaxed
          whitespace-pre-wrap
          [overflow-wrap:anywhere]
          ${isUser
            ? theme.userBubble
            : theme.assistantBubble
          }
        `}
      >
        {message.content}
      </div>
    </div>
  );
}
