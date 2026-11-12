import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "../tyrepapa.module.css";

export default function AboutPage() {
  return <div className={styles.editorialPage}>
    <header className={styles.editorialHero}><div className={styles.editorialInner}><span className={styles.eyebrow}>TYREPAPA / OUR STORY</span><h1>Made for the <em>road ahead.</em></h1><p>Tyre shopping should feel as straightforward as the drive itself.</p></div></header>
    <section className={styles.storyPageGrid}><div className={styles.storyPageImage}><Image src="/tyrepapa/tyre-open-road.png" alt="Car with road tyres on a scenic open road" fill sizes="(max-width: 700px) 100vw, 50vw" /></div><div className={styles.storyPageText}><span className={styles.eyebrow}>WHY TYREPAPA</span><h2>The right tyres.<br /><em>A simpler choice.</em></h2><p>Tyres shape every journey, but choosing them can feel complicated. TyrePapa brings the options together so you can explore what suits your car, your routes, and your plans.</p><p>From the familiar daily drive to the open road, we&apos;re here to help you find a set that feels right for the miles ahead.</p><Link href="/products">Shop the tyre range <ArrowUpRight size={17} /></Link></div></section>
    <section className={styles.storyStatement}><div><span className={styles.eyebrow}>THE TYREPAPA APPROACH</span><h2>Find your fit.<br />Enjoy the <em>journey.</em></h2><p>Start with the car you drive and the roads you take. We&apos;ll help you explore the choices from there.</p><Link href="/contact">Ask us a question <ArrowUpRight size={17} /></Link></div></section>
  </div>;
}
