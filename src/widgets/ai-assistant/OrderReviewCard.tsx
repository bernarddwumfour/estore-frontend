"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { confirmAssistantOrder, type AssistantOrderDraft } from "@/lib/ai-assistant/api";
import type { AssistantTheme } from "./theme";

export function OrderReviewCard({ draft, theme }: { draft: AssistantOrderDraft; theme: AssistantTheme }) {
  const [shippingMethod, setShippingMethod] = useState(draft.selected_shipping_method);
  const [paymentMethod, setPaymentMethod] = useState<"pod" | "paystack">("pod");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  if (draft.error) return <p className="text-sm text-destructive">{draft.error}</p>;

  const confirm = async () => {
    setLoading(true);
    try {
      const result = await confirmAssistantOrder(draft, paymentMethod, shippingMethod);
      if (paymentMethod === "paystack" && result.payment?.authorization_url) {
        window.location.assign(result.payment.authorization_url);
        return;
      }
      setComplete(true);
      toast.success("Order placed successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to place order.");
    } finally { setLoading(false); }
  };

  return <section className={`rounded-xl border p-3 ${theme.productCard}`}>
    <p className="text-sm font-semibold">Review your order</p>
    <div className="mt-2 space-y-1 text-xs">
      {draft.items.map((item, index) => <p key={index}>{item.quantity}× {item.title} · {formatCurrency(item.unit_price)}</p>)}
      <p className="pt-1 text-muted-foreground">Deliver to: {draft.shipping_address.label}</p>
    </div>
    <select value={shippingMethod} onChange={(event) => setShippingMethod(event.target.value)} className="mt-3 h-9 w-full rounded-md border bg-background px-2 text-xs">
      {draft.shipping_options.map((option) => <option key={option.id} value={option.id}>{option.name} — {formatCurrency(option.cost)}</option>)}
    </select>
    <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "pod" | "paystack")} className="mt-2 h-9 w-full rounded-md border bg-background px-2 text-xs">
      <option value="pod">Pay on delivery</option><option value="paystack">Pay securely with Paystack</option>
    </select>
    <div className="mt-3 flex items-center justify-between"><span className="text-sm font-semibold">Total: {formatCurrency(draft.total)}</span>{complete ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="size-4" /> Confirmed</span> : <Button size="sm" disabled={loading || !shippingMethod} onClick={confirm} className={theme.cardPrimaryButton}>{loading ? <Loader2 className="size-4 animate-spin" /> : "Place order"}</Button>}</div>
  </section>;
}
