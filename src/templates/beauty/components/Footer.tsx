import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "../beauty.module.css";

export default function Footer() {
  return <footer className={styles.footer}>
    <div className={styles.footerTop}>
      <div><Link href="/" className={styles.logo} aria-label="Velux home">velux<span>®</span></Link><p>A little care. A moment of calm.<br />Beauty in your everyday.</p></div>
      <div><h2>Explore</h2><Link href="/products">The collection</Link><Link href="/about">Our story</Link><Link href="/#the-ritual">Your daily ritual</Link><Link href="/promotions">Special offers</Link><Link href="/blog">The journal</Link></div>
      <div><h2>Here for you</h2><Link href="/contact">Contact us</Link><Link href="/orders">Your orders</Link><Link href="/wishlist">Your wishlist</Link></div>
      <Link href="/contact" className={styles.footerContact}>Let’s talk skincare.<ArrowUpRight size={30} strokeWidth={1} /></Link>
    </div>
    <div className={styles.footerBottom}><span>© {new Date().getFullYear()} velux. All rights reserved.</span><span>MAKE TIME FOR YOURSELF.</span><Link href="/#top">Back to top ↑</Link></div>
  </footer>;
}
