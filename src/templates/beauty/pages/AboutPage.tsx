import Image from "next/image";
import Link from "next/link";
import { Flower2, HeartHandshake, Leaf } from "lucide-react";

const values = [
  { Icon: Leaf, title: "Gentle by nature", text: "We favour soothing rituals and thoughtful ingredients that let your skin feel like itself." },
  { Icon: HeartHandshake, title: "Care that listens", text: "Every visit begins with a conversation, so your treatment can meet you where you are." },
  { Icon: Flower2, title: "Room to exhale", text: "From the first welcome to the last quiet moment, your time here belongs to you." },
];

export default function AboutPage() {
  return <div className="bg-[#fffdf9] text-[#30231d]">
    <section className="bg-[#f8f3ed] px-6 py-16 text-center sm:py-20"><p className="text-[9px] uppercase tracking-[0.23em] text-[#9b5c40]">Our story</p><h1 className="mx-auto mt-3 max-w-3xl font-serif text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">A softer space for feeling well.</h1><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#75665b]">Reel Spa is a beauty and wellness studio made for slowing down, being looked after and finding your own rhythm again.</p></section>
    <section className="mx-auto grid max-w-[1120px] items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16"><div className="relative min-h-[360px] overflow-hidden sm:min-h-[460px]"><Image src="/beauty/interior.webp" alt="A warm, peaceful spa treatment room" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div><div><p className="text-[9px] uppercase tracking-[0.23em] text-[#9b5c40]">Wellness, with intention</p><h2 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.03em] sm:text-4xl">Beauty is a feeling, too.</h2><p className="mt-4 text-sm leading-7 text-[#75665b]">We created Reel Spa as a welcoming place to reconnect with yourself. Our treatments bring together experienced hands, calming surroundings and care that never feels rushed.</p><p className="mt-4 text-sm leading-7 text-[#75665b]">Whether you’re here for a facial, a restorative massage or a moment of quiet, we want you to feel comfortable from the moment you arrive.</p><Link href="/#services" className="mt-7 inline-flex items-center border border-[#c8b4a6] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#60483a] hover:border-[#92583e]">Explore our treatments</Link></div></section>
    <section className="bg-[#f8f3ed] px-6 py-16 sm:py-20"><div className="mx-auto max-w-[1120px]"><div className="text-center"><p className="text-[9px] uppercase tracking-[0.23em] text-[#9b5c40]">What guides us</p><h2 className="mt-3 font-serif text-3xl tracking-[-0.035em] sm:text-4xl">Care in every detail.</h2></div><div className="mt-10 grid gap-4 md:grid-cols-3">{values.map(({ Icon, title, text }) => <article key={title} className="bg-white p-7"><Icon className="h-6 w-6 text-[#9b5c40]" /><h3 className="mt-5 font-serif text-xl">{title}</h3><p className="mt-2 text-sm leading-6 text-[#75665b]">{text}</p></article>)}</div></div></section>
    <section className="px-6 py-16 text-center sm:py-20"><p className="text-[9px] uppercase tracking-[0.23em] text-[#9b5c40]">We’d love to welcome you</p><h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl leading-tight tracking-[-0.03em] sm:text-4xl">Make a little space for yourself.</h2><Link href="/contact" className="mt-6 inline-flex bg-[#92583e] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-white hover:bg-[#75432f]">Get in touch</Link></section>
  </div>;
}
