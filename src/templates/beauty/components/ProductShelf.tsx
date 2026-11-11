"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { ProductType } from "@/types/productTypes";
import styles from "../beauty.module.css";

export default function ProductShelf({ products }: { products: ProductType[] }) {
  const shelf = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({ start: true, end: false });
  useEffect(() => {
    const el = shelf.current;
    if (!el) return;
    const update = () => setPosition({ start: el.scrollLeft < 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [products.length]);
  function scroll(direction: number) {
    const el = shelf.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <>
    <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>THE BEAUTY EDIT</span><h2>Your shelf, elevated.</h2></div><div className={styles.shelfControls}><button aria-label="Previous products" disabled={position.start} onClick={() => scroll(-1)}><ArrowLeft size={18} /></button><button aria-label="Next products" disabled={position.end} onClick={() => scroll(1)}><ArrowRight size={18} /></button></div></div>
    <ul className={styles.productShelf} ref={shelf} onScroll={e => { const el = e.currentTarget; setPosition({ start: el.scrollLeft < 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 }); }}>{products.map(product => <ProductCard key={product.variant_slug ?? product.id} product={product} />)}</ul>
  </>;
}
