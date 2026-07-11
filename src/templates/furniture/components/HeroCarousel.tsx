// Furniture hero showcase carousel — the horizontal product cards beside the
// hero copy in the mockup. Renders REAL products fetched on the server (passed
// in as props); client-only for the scroll + prev/next arrow controls.
"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { ProductType } from "@/types/productTypes";

function price(product: ProductType) {
  const v = product.default_variant;
  const value = v?.discounted_price || v?.price || product.min_price;
  return typeof value === "number" ? formatCurrency(value) : null;
}

export default function HeroCarousel({ products }: { products: ProductType[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 16 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => {
          const image = product.default_variant?.images?.[0]?.url || null;
          const tag = price(product);
          return (
            <article
              key={product.id}
              data-card
              className="w-[300px] shrink-0 snap-start rounded-3xl bg-white p-4 sm:w-[340px]"
            >
              <Link
                href={`/products/${product.slug}`}
                className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-[#f4f1ea]"
              >
                {image ? (
                  <Image
                    src={image}
                    alt={product.title}
                    fill
                    className="object-contain p-4 mix-blend-multiply"
                    sizes="340px"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-[#a6a08f]">
                    No image
                  </span>
                )}
                {tag && (
                  <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#2b2b22]">
                    {tag}
                  </span>
                )}
              </Link>
              <div className="mt-4 flex items-center justify-between gap-3 px-1">
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-[#2b2b22]">
                    {product.title}
                  </p>
                  <p className="text-sm text-[#6b6b5a]">
                    {product.category?.name ?? "Furniture"}
                  </p>
                </div>
                <Link
                  href={`/products/${product.slug}`}
                  aria-label={`Shop ${product.title}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3f4d2c] text-white transition-colors hover:bg-[#33401f]"
                >
                  <Send className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => scrollByCard(-1)}
          aria-label="Previous"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3f4d2c] text-white transition-colors hover:bg-[#33401f]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scrollByCard(1)}
          aria-label="Next"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5b21a] text-[#2b2b22] transition-colors hover:bg-[#e6a40f]"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
