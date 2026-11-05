
"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  Bot,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  X,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  ChatMessage,
  type ChatMessageData,
} from "./ChatMessage";

import { ProductResults } from "./ProductResults";

import {
  sendAssistantMessage,
  type AssistantProduct,
} from "@/lib/ai-assistant/api";
import type { AssistantTheme } from "./theme";

interface ChatAssistantProps {
  token: string | null;
  theme: AssistantTheme;
  getProductHref?: (
    product: AssistantProduct
  ) => string;
}

type AssistantChatMessage = ChatMessageData & {
  products?: AssistantProduct[];
};

export function ChatAssistant({
  token,
  theme,
  getProductHref,
}: ChatAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<
    AssistantChatMessage[]
  >([]);

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, loading, open]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const startNewChat = () => {
    if (sendingRef.current) return;

    setMessages([]);
    setConversationId(null);
    setInput("");
    setError(null);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const message = input.trim();

    if (!message || sendingRef.current) return;

    if (!token) {
      setError("Please sign in to use the assistant.");
      return;
    }

    if (message.length > 4000) {
      setError(
        "Message cannot exceed 4000 characters."
      );
      return;
    }

    sendingRef.current = true;
    setLoading(true);
    setError(null);
    setInput("");

    const userMessage: AssistantChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await sendAssistantMessage(
        {
          message,
          ...(conversationId
            ? { conversation_id: conversationId }
            : {}),
        },
        controller.signal
      );

      if (controller.signal.aborted) return;

      setConversationId(result.conversation_id);

      setMessages((prev) => [
        ...prev,
        {
          id: result.message_id,
          role: "assistant",
          content: result.response,
          products: result.products ?? [],
        },
      ]);
    } catch (err) {
      if (controller.signal.aborted) return;

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );

      // Restore input for editing.
      // Do not automatically retry.
      setInput(message);

      setMessages((prev) =>
        prev.filter(
          (item) => item.id !== userMessage.id
        )
      );
    } finally {
      sendingRef.current = false;
      abortRef.current = null;
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open shopping assistant"
        className={`fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-xl ${theme.launcher}`}
      >
        <MessageCircle className="size-6" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className={`
            flex h-dvh w-full min-w-0 max-w-full
            flex-col gap-0 overflow-hidden p-0
            sm:w-[440px] sm:max-w-[440px]
            ${theme.panel}
          `}
        >
          <SheetHeader className={`min-w-0 shrink-0 border-b px-4 py-4 text-left ${theme.header}`}>
            <div className="flex min-w-0 items-center justify-between gap-3 pr-8">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${theme.accent}`}>
                  <Bot className="size-5" />
                </div>

                <div className="min-w-0">
                  <SheetTitle>
                    Shopping Assistant
                  </SheetTitle>

                  <SheetDescription>
                    Find products that fit your needs
                  </SheetDescription>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={startNewChat}
                disabled={loading}
                aria-label="Start new conversation"
                title="New chat"
                className={`shrink-0 ${theme.outlineButton}`}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="min-h-0 min-w-0 w-full flex-1">
            <div
              role="log"
              aria-label="Shopping assistant conversation"
              className="
                flex w-full min-w-0 max-w-full
                flex-col gap-4 overflow-x-hidden p-4
              "
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex w-full min-w-0 max-w-full flex-col gap-3 overflow-hidden"
                >
                  <div className="min-w-0 max-w-full overflow-hidden">
                    <ChatMessage message={message} theme={theme} />
                  </div>

                  {message.role === "assistant" &&
                    Boolean(message.products?.length) && (
                      <ProductResults
                        products={message.products ?? []}
                        getProductHref={(product) => `/products/${product.slug}`}
                        theme={theme}
                      />
                    )}
                </div>
              ))}

              {loading && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`flex items-center gap-2 text-sm ${theme.mutedText}`}
                >
                  <Loader2 className="size-4 animate-spin" />
                  Searching and preparing a response...
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className={`min-w-0 shrink-0 border-t p-4 ${theme.composer}`}>
            {error && (
              <div
                role="alert"
                className="mb-3 flex min-w-0 items-start justify-between gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                <span className="min-w-0 break-words">
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() => setError(null)}
                  aria-label="Dismiss error"
                  className="shrink-0"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex min-w-0 items-end gap-2"
            >
              <Textarea
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();

                    if (!loading && input.trim()) {
                      event.currentTarget.form?.requestSubmit();
                    }
                  }
                }}
                placeholder="Ask about a product..."
                rows={2}
                maxLength={4000}
                disabled={loading}
                aria-label="Chat message"
                className={`min-h-11 min-w-0 max-h-32 flex-1 resize-none ${theme.textarea}`}
              />

              <Button
                type="submit"
                size="icon"
                disabled={
                  loading ||
                  !input.trim() ||
                  !token
                }
                aria-label="Send message"
                className={`shrink-0 ${theme.primaryButton}`}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </form>

            {!token && (
              <p className={`mt-2 text-xs ${theme.mutedText}`}>
                Sign in to use the shopping assistant.
              </p>
            )}

            <p className={`mt-3 text-center text-xs ${theme.mutedText}`}>
              Verify product details before purchasing.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
