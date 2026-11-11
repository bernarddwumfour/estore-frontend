import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import BrandLogo from "./BrandLogo";
import styles from "../beauty.module.css";

export default function Footer() {
  return <footer className={styles.footer}>
    <div className={styles.footerTop}>
      <div><BrandLogo /><p>Find the right tyres for your car<br />and the miles ahead.</p></div>
      <div><h2>Explore</h2><Link href="/products">Shop tyres</Link><Link href="/about">Our story</Link><Link href="/promotions">Tyre offers</Link><Link href="/blog">Road notes</Link></div>
      <div><h2>Here for you</h2><Link href="/contact">Contact us</Link><Link href="/orders">Your orders</Link><Link href="/wishlist">Your wishlist</Link></div>
      <Link href="/contact" className={styles.footerContact}>Need a hand choosing?<ArrowUpRight size={30} strokeWidth={1} /></Link>
    </div>
    <div className={styles.footerBottom}><span>© {new Date().getFullYear()} TyrePapa. All rights reserved.</span><span>READY FOR THE ROAD AHEAD.</span><Link href="/#top">Back to top ↑</Link></div>
  </footer>;
}
