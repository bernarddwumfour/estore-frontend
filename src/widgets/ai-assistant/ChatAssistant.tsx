
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
import Link from "next/link";

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
import { PromotionResults } from "./PromotionResults";
import { OrderReviewCard } from "./OrderReviewCard";
import { OrderTrackingCard } from "./OrderTrackingCard";

import {
  sendAssistantMessage,
  sendGuestAssistantMessage,
  type AssistantProduct,
  type AssistantPromotion,
  type AssistantOrderDraft,
  type AssistantOrderTracking,
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
  promotions?: AssistantPromotion[];
  orderDraft?: AssistantOrderDraft | null;
  orderTracking?: AssistantOrderTracking | null;
  requiresShippingAddress?: boolean;
};

export function ChatAssistant({
  token,
  theme,
  getProductHref,
}: ChatAssistantProps) {
  const [open, setOpen] = useState(false);
  const [showLauncherPrompt, setShowLauncherPrompt] = useState(false);
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
    try {
      // Hydrate the launcher hint from browser-only preference storage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowLauncherPrompt(
        window.localStorage.getItem("shopping-assistant-prompt-dismissed") !== "true"
      );
    } catch {
      setShowLauncherPrompt(true);
    }
  }, []);

  const handleSheetOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setShowLauncherPrompt(false);
    } else if (open) {
      setShowLauncherPrompt(false);
      try {
        window.localStorage.setItem("shopping-assistant-prompt-dismissed", "true");
      } catch {
        // Keep the prompt dismissed for this mounted session if storage is unavailable.
      }
    }
    setOpen(nextOpen);
  };

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

  const sendMessage = async (rawMessage: string, fromComposer = true) => {
    const message = rawMessage.trim();

    if (!message || sendingRef.current) return;

    if (message.length > 4000) {
      setError(
        "Message cannot exceed 4000 characters."
      );
      return;
    }

    sendingRef.current = true;
    setLoading(true);
    setError(null);
    if (fromComposer) setInput("");

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
      const result = token
        ? await sendAssistantMessage(
            { message, ...(conversationId ? { conversation_id: conversationId } : {}) },
            controller.signal,
          )
        : await sendGuestAssistantMessage({
            message,
            history: messages.slice(-12).map(({ role, content }) => ({ role, content })),
          }, controller.signal);

      if (controller.signal.aborted) return;

      setConversationId(result.conversation_id);

      setMessages((prev) => [
        ...prev,
        {
          id: result.message_id,
          role: "assistant",
          content: result.response,
          products: result.products ?? [],
          promotions: result.promotions ?? [],
          orderDraft: result.order_draft ?? null,
          orderTracking: result.order_tracking ?? null,
          requiresShippingAddress: result.requires_shipping_address ?? false,
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
      if (fromComposer) setInput(message);

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {showLauncherPrompt && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="max-w-[min(15rem,calc(100vw_-_6.5rem))] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span className="block text-sm font-semibold text-slate-900">
              Need help shopping?
            </span>
            <span className="block text-xs text-slate-500">
              Ask me to find the right product
            </span>
          </button>
        )}
        <span className="relative block size-14 shrink-0">
          {showLauncherPrompt && !open && (
            <span
              aria-hidden="true"
              className="absolute -inset-1 animate-ping rounded-full border-2 border-red-500/80 motion-reduce:animate-none"
            />
          )}
          <Button
            type="button"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Open shopping assistant"
            className={`relative size-14 rounded-full shadow-xl ${theme.launcher}`}
          >
            <MessageCircle className="size-6" />
            {showLauncherPrompt && !open && (
              <span className="absolute right-0 top-0 size-3 rounded-full border-2 border-white bg-red-500" />
            )}
          </Button>
        </span>
      </div>

      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
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
              {messages.length === 0 && !loading && (
                <div className="flex min-h-[52vh] flex-col items-center justify-center px-5 py-10 text-center">
                  <div className="mb-5 flex size-24 items-center justify-center rounded-full bg-slate-100/70 text-slate-300">
                    <MessageCircle className="size-12" strokeWidth={1.25} />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-800">
                    I can help you shop
                  </h2>
                  <p className={`mt-2 max-w-xs text-sm leading-relaxed ${theme.mutedText}`}>
                    Tell me what you’re looking for, and I’ll help you find the right product.
                  </p>
                  <p className="mt-4 text-xs text-slate-400">
                    Send a message to get started
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex w-full min-w-0 max-w-full flex-col gap-3 overflow-hidden"
                >
                  <div className="min-w-0 max-w-full overflow-hidden">
                    <ChatMessage message={message} theme={theme} />
                  </div>

                  {message.role === "assistant" && message.requiresShippingAddress && (
                    <div className={`ml-10 rounded-xl border p-3 ${theme.productCard}`}>
                      <p className="text-sm font-semibold">Add a shipping address to continue</p>
                      <p className={`mt-1 text-xs leading-relaxed ${theme.mutedText}`}>
                        Add a saved address in your profile, then return here and ask me to continue your order.
                      </p>
                      <Link
                        href="/profile"
                        target="_blank"
                        rel="noreferrer"
                        className={`mt-3 inline-flex rounded-md border px-3 py-2 text-xs font-medium ${theme.cardPrimaryButton}`}
                      >
                        Add shipping address
                      </Link>
                    </div>
                  )}

                  {message.role === "assistant" &&
                    Boolean(message.products?.length) && (
                      <ProductResults
                        products={message.products ?? []}
                        getProductHref={getProductHref ?? ((product) => `/products/${product.slug}`)}
                        theme={theme}
                      />
                    )}
                  {message.role === "assistant" && Boolean(message.promotions?.length) && (
                    <PromotionResults promotions={message.promotions ?? []} theme={theme} />
                  )}
                  {message.role === "assistant" && message.orderDraft && (
                    <OrderReviewCard draft={message.orderDraft} theme={theme} />
                  )}
                  {message.role === "assistant" && message.orderTracking && (
                    <OrderTrackingCard
                      tracking={message.orderTracking}
                      theme={theme}
                      busy={loading}
                      onSelectOrder={(orderNumber) =>
                        sendMessage(
                          `Show me the details and latest tracking for order #${orderNumber}.`,
                          false
                        )
                      }
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
                  !input.trim()
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

            {!token && <p className={`mt-2 text-center text-xs ${theme.mutedText}`}>
              Browsing as a guest. <Link href="/login" className="font-semibold underline">Sign in</Link> for wishlist and order features.
            </p>}

            <p className={`mt-3 text-center text-xs ${theme.mutedText}`}>
              Verify product details before purchasing.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
