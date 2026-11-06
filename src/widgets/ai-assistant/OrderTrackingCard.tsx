"use client";

import {
  Clock3,
  ExternalLink,
  MapPin,
  MessageCircle,
  Package,
  Truck,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type {
  AssistantOrderTracking,
  AssistantTrackedOrder,
} from "@/lib/ai-assistant/api";
import type { AssistantTheme } from "./theme";

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-GH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function statusStyle(status: string) {
  if (["delivered", "completed", "paid"].includes(status)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/15";
  }
  if (["cancelled", "refunded", "failed"].includes(status)) {
    return "bg-rose-50 text-rose-700 ring-rose-600/15";
  }
  if (["shipped", "ready_for_shipping"].includes(status)) {
    return "bg-sky-50 text-sky-700 ring-sky-600/15";
  }
  return "bg-amber-50 text-amber-700 ring-amber-600/15";
}

function OrderCard({
  order,
  theme,
  summaryMode,
  showDetailsAction,
  busy,
  onSelectOrder,
}: {
  order: AssistantTrackedOrder;
  theme: AssistantTheme;
  summaryMode: boolean;
  showDetailsAction: boolean;
  busy: boolean;
  onSelectOrder: (orderNumber: string) => void;
}) {
  const placedDate = formatDate(order.created_at);
  const visibleItems = summaryMode ? order.items.slice(0, 2) : order.items;

  return (
    <article className={`overflow-hidden rounded-xl border ${theme.productCard}`}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-current/10 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${theme.accent}`}>
            <Package className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Order #{order.order_number}</p>
            {placedDate && <p className={`mt-0.5 text-xs ${theme.mutedText}`}>Placed {placedDate}</p>}
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusStyle(order.status)}`}>
          {order.status_display}
        </span>
      </header>

      <div className="space-y-3 p-3">
        <div className="space-y-2">
          {visibleItems.map((item, index) => {
            const attributes = Object.entries(item.variant || {})
              .map(([key, value]) => `${key.replaceAll("_", " ")}: ${value}`)
              .join(" · ");

            return (
              <div key={`${item.product}-${index}`} className="flex min-w-0 items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/80">
                  {item.image ? (
                    <img src={item.image} alt={item.product} className="size-full object-contain" />
                  ) : (
                    <Package className="size-5 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{item.product}</p>
                  {!summaryMode && attributes && <p className={`truncate text-[11px] capitalize ${theme.mutedText}`}>{attributes}</p>}
                </div>
                <span className={`shrink-0 text-xs ${theme.mutedText}`}>× {item.quantity}</span>
              </div>
            );
          })}
          {order.items_count > visibleItems.length && (
            <p className={`pl-[3.75rem] text-xs ${theme.mutedText}`}>
              + {order.items_count - visibleItems.length} more item(s)
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-current/10 pt-3 text-xs">
          <span className={theme.mutedText}>Payment: <span className="capitalize">{order.payment_status.replaceAll("_", " ")}</span></span>
          <span className="font-semibold">
            {formatCurrency(order.total, { currency: order.currency || "GHS" })}
          </span>
        </div>

        {!summaryMode && (order.shipment ? (
          <section className="rounded-lg bg-black/[0.025] p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <Truck className="mt-0.5 size-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{order.shipment.status_display}</p>
                  {order.shipment.carrier && <p className={`mt-0.5 text-xs ${theme.mutedText}`}>{order.shipment.carrier}</p>}
                  {order.shipment.tracking_number && (
                    <p className={`mt-1 break-all text-xs ${theme.mutedText}`}>
                      Tracking: {order.shipment.tracking_number}
                    </p>
                  )}
                </div>
              </div>
              {order.shipment.tracking_url && (
                <a
                  href={order.shipment.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-medium underline underline-offset-2"
                >
                  Track <ExternalLink className="size-3" />
                </a>
              )}
            </div>

            {order.shipment.estimated_delivery && (
              <p className={`mt-3 flex items-center gap-1.5 text-xs ${theme.mutedText}`}>
                <Clock3 className="size-3.5" />
                Estimated delivery: {formatDate(order.shipment.estimated_delivery)}
              </p>
            )}

            {order.shipment.tracking_history.length > 0 && (
              <details className="mt-3 border-t border-current/10 pt-2">
                <summary className="cursor-pointer text-xs font-medium">Tracking updates ({order.shipment.tracking_history.length})</summary>
                <ol className="mt-3 space-y-3 border-l border-current/15 pl-3">
                  {order.shipment.tracking_history.map((event, index) => (
                    <li key={`${event.created_at}-${index}`} className="relative text-xs">
                      <span className="absolute -left-[1.05rem] top-1 size-2 rounded-full bg-current/30" />
                      <p className="font-medium">{event.status_display}</p>
                      {event.location && (
                        <p className={`mt-0.5 flex items-center gap-1 ${theme.mutedText}`}>
                          <MapPin className="size-3" /> {event.location}
                        </p>
                      )}
                      {event.description && <p className={`mt-0.5 ${theme.mutedText}`}>{event.description}</p>}
                      <p className={`mt-0.5 ${theme.mutedText}`}>{formatDate(event.created_at)}</p>
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </section>
        ) : (
          <p className={`rounded-lg bg-black/[0.025] px-3 py-2.5 text-xs ${theme.mutedText}`}>
            Shipment tracking will appear here once it’s available.
          </p>
        ))}

        {showDetailsAction && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={() => onSelectOrder(order.order_number)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${theme.cardOutlineButton}`}
            >
              <MessageCircle className="size-3.5" />
              Get order details
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function OrderTrackingCard({
  tracking,
  theme,
  busy,
  onSelectOrder,
}: {
  tracking: AssistantOrderTracking;
  theme: AssistantTheme;
  busy: boolean;
  onSelectOrder: (orderNumber: string) => void;
}) {
  return (
    <section className={`rounded-xl border p-3 ${theme.productCard}`}>
      <h3 className="mb-3 text-sm font-semibold">
        {tracking.view === "list" ? "Your recent orders" : "Order details"}
      </h3>
      {tracking.orders.length ? (
        <div className="space-y-3">
          {tracking.orders.map((order) => (
            <OrderCard
              key={order.order_number}
              order={order}
              theme={theme}
              summaryMode={tracking.view === "list"}
              showDetailsAction={tracking.view === "list"}
              busy={busy}
              onSelectOrder={onSelectOrder}
            />
          ))}
        </div>
      ) : (
        <p className={`rounded-lg bg-black/[0.025] px-3 py-4 text-center text-sm ${theme.mutedText}`}>
          {tracking.message || "No orders were found for your account."}
        </p>
      )}
    </section>
  );
}
