import Image from "next/image";
import Link from "next/link";
import type { BlogPageProps } from "../../contract";
import styles from "../beauty.module.css";

export default function BlogPage({ posts, pagination }: BlogPageProps) {
  return <div className={styles.editorialPage}>
    <header className={styles.editorialHero}><div className={styles.editorialInner}><span className={styles.eyebrow}>TYREPAPA / ROAD NOTES</span><h1>Know the road. <em>Enjoy the drive.</em></h1><p>Practical reads on choosing tyres, understanding your options, and getting more from every journey.</p></div></header>
    <section className={styles.editorialInner} aria-label="Journal posts">
      <div className={styles.editorialSectionHead}><span className={styles.eyebrow}>THE LATEST STORIES</span><span>{pagination?.total ?? posts.length} ARTICLES</span></div>
      {posts.length ? <div className={styles.editorialGrid}>{posts.map(post => <Link href={`/blog/${post.slug}`} key={post.id} className={styles.editorialCard}><article><div className={styles.editorialImage}>{post.cover_image_url ? <Image src={post.cover_image_url} alt={post.title} fill sizes="(max-width: 700px) 90vw, 33vw" /> : <span>TyrePapa road notes</span>}</div><div className={styles.editorialCardBody}><span className={styles.eyebrow}>{post.category?.name ?? "ROAD NOTES"}{post.published_at && ` / ${new Date(post.published_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}</span><h2>{post.title}</h2><p>{post.excerpt}</p><span className={styles.editorialLink}>Read article ↗</span></div></article></Link>)}</div> : <div className={styles.editorialEmpty}><h2>Road notes are on the way.</h2><p>Tyre guides and driving stories will appear here soon.</p></div>}
      {pagination && pagination.total_pages > 1 && <nav aria-label="Blog pages" className={styles.editorialPagination}><Link aria-disabled={!pagination.has_previous} href={pagination.has_previous ? `/blog?page=${pagination.previous_page}` : "#"}>← Previous</Link><span>{pagination.current_page} / {pagination.total_pages}</span><Link aria-disabled={!pagination.has_next} href={pagination.has_next ? `/blog?page=${pagination.next_page}` : "#"}>Next →</Link></nav>}
    </section>
  </div>;
}
