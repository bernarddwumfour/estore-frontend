"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, Trash2 } from "lucide-react";
import { useCartStore } from "@/app/lib/store/cart-store";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/currency";
import { storefrontProductName } from "@/templates/product-name";
import { storefrontTheme } from "@/templates/storefront-theme";

interface BuyNowCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BuyNowCartDialog({ open, onOpenChange }: BuyNowCartDialogProps) {
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const subtotal = useCartStore(state => state.getTotalPrice());
  const furniture = storefrontTheme === "furniture-surface";
  const tyre = storefrontTheme === "tyrepapa-surface";
  const accent = furniture ? "#654035" : tyre ? "#20201e" : "#374151";

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      data-storefront-theme={storefrontTheme}
      className={`max-h-[85dvh] overflow-y-auto sm:max-w-[600px] ${furniture ? "rounded-3xl border-[#e7e1d3] bg-[#fffdfa]" : tyre ? "rounded-none border-[#e7e1d9] bg-white" : ""}`}
    >
      <DialogTitle className={furniture ? "font-bold text-[#2b2b22]" : tyre ? "font-serif font-normal text-[#252520]" : ""}>
        You are about to check out with these items
      </DialogTitle>
      <DialogDescription>
        Review your cart, adjust quantities if needed, then continue to checkout.
      </DialogDescription>

      <ul className="space-y-5">
        {items.map(item => {
          const key = item.variantId || item.sku;
          const title = storefrontProductName(item.title, item.attributes);
          return <li key={key} className="flex items-start gap-3 border-b border-gray-200 pb-5 last:border-0 last:pb-0">
            <Link href={item.isBundle ? `/promotions/${item.slug}` : `/products/${item.slug}`} onClick={() => onOpenChange(false)} className={`relative flex size-20 shrink-0 items-center justify-center overflow-hidden border border-gray-200 bg-gray-50 ${furniture ? "rounded-2xl" : tyre ? "rounded-none" : "rounded-sm"}`}>
              {item.imageUrl ? <Image src={item.imageUrl} alt={title} fill sizes="80px" className="object-contain" /> : <Package size={24} className="text-gray-400" />}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={item.isBundle ? `/promotions/${item.slug}` : `/products/${item.slug}`} onClick={() => onOpenChange(false)} className="text-sm font-medium text-gray-900 hover:underline">{title}</Link>
              <p className="mt-1 text-xs text-gray-600">{formatCurrency(item.price)} each</p>
              <div className={`mt-3 inline-flex items-center border border-gray-200 ${furniture ? "rounded-full" : tyre ? "rounded-none" : "rounded-sm"}`}>
                <button type="button" aria-label={`Remove one ${title}`} className="grid size-8 place-items-center" onClick={() => updateQuantity(key, item.quantity - 1)}>−</button>
                <span className="min-w-7 text-center text-xs" aria-live="polite">{item.quantity}</span>
                <button type="button" aria-label={`Add one ${title}`} className="grid size-8 place-items-center" onClick={() => updateQuantity(key, item.quantity + 1)}>+</button>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
              <button type="button" aria-label={`Remove ${title} from cart`} className="mt-2 inline-flex text-gray-500 hover:text-red-600" onClick={() => removeItem(key)}><Trash2 size={16} /></button>
            </div>
          </li>;
        })}
      </ul>

      <div className="border-t border-gray-200 pt-4">
        <div className="mb-5 flex justify-between text-base font-medium text-gray-900"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
        <div className="space-y-3">
          {items.length > 0 && <Link href="/checkout" onClick={() => onOpenChange(false)} className={`block px-5 py-3 text-center text-sm text-white transition-opacity hover:opacity-85 ${furniture ? "rounded-full" : tyre ? "rounded-none uppercase tracking-widest" : "rounded-sm"}`} style={{ backgroundColor: accent }}>Checkout</Link>}
          <DialogClose asChild><button type="button" className="block w-full text-center text-sm text-gray-600 underline underline-offset-4">Continue shopping</button></DialogClose>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
