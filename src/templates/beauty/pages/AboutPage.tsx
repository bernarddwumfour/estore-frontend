import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "../beauty.module.css";

export default function AboutPage() {
  return <div className={styles.editorialPage}>
    <header className={styles.editorialHero}><div className={styles.editorialInner}><span className={styles.eyebrow}>VELUX / OUR STORY</span><h1>Beauty in the <em>everyday.</em></h1><p>A thoughtful approach to the moments we make for ourselves.</p></div></header>
    <section className={styles.storyPageGrid}><div className={styles.storyPageImage}><Image src="/beauty/editorial.webp" alt="Velux skincare and a close-up portrait" fill sizes="(max-width: 700px) 100vw, 50vw" /></div><div className={styles.storyPageText}><span className={styles.eyebrow}>A LITTLE TIME FOR YOU</span><h2>Care that feels<br /><em>personal.</em></h2><p>We believe a beauty routine can be more than a list of steps. It can be a quiet start to the day, a pause in the evening, and a way to feel at home in your own skin.</p><p>Our collection is imagined around those everyday moments: the fresh feeling of a cleanse, the comfort of moisture, and the pleasure of taking your time.</p><Link href="/products">Explore the collection <ArrowUpRight size={17} /></Link></div></section>
    <section className={styles.storyStatement}><div><span className={styles.eyebrow}>THE VELUX POINT OF VIEW</span><h2>Less rush.<br />More <em>ritual.</em></h2><p>Beauty is personal. Find the products that work for your routine, and make the moment your own.</p><Link href="/contact">Get in touch <ArrowUpRight size={17} /></Link></div></section>
  </div>;
}
