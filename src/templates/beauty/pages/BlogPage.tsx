import Image from "next/image";
import Link from "next/link";
import type { BlogPageProps } from "../../contract";
import styles from "../beauty.module.css";

export default function BlogPage({ posts, pagination }: BlogPageProps) {
  return <div className={styles.editorialPage}>
    <header className={styles.editorialHero}><div className={styles.editorialInner}><span className={styles.eyebrow}>VELUX / THE JOURNAL</span><h1>Notes on <em>beauty.</em></h1><p>Ideas for slowing down, caring for your skin, and finding beauty in the everyday.</p></div></header>
    <section className={styles.editorialInner} aria-label="Journal posts">
      <div className={styles.editorialSectionHead}><span className={styles.eyebrow}>THE LATEST STORIES</span><span>{pagination?.total ?? posts.length} ARTICLES</span></div>
      {posts.length ? <div className={styles.editorialGrid}>{posts.map(post => <Link href={`/blog/${post.slug}`} key={post.id} className={styles.editorialCard}><article><div className={styles.editorialImage}>{post.cover_image_url ? <Image src={post.cover_image_url} alt={post.title} fill sizes="(max-width: 700px) 90vw, 33vw" /> : <span>velux journal</span>}</div><div className={styles.editorialCardBody}><span className={styles.eyebrow}>{post.category?.name ?? "THE JOURNAL"}{post.published_at && ` / ${new Date(post.published_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}</span><h2>{post.title}</h2><p>{post.excerpt}</p><span className={styles.editorialLink}>Read story ↗</span></div></article></Link>)}</div> : <div className={styles.editorialEmpty}><h2>Stories are coming soon.</h2><p>Our journal will be here when the first stories are ready.</p></div>}
      {pagination && pagination.total_pages > 1 && <nav aria-label="Blog pages" className={styles.editorialPagination}><Link aria-disabled={!pagination.has_previous} href={pagination.has_previous ? `/blog?page=${pagination.previous_page}` : "#"}>← Previous</Link><span>{pagination.current_page} / {pagination.total_pages}</span><Link aria-disabled={!pagination.has_next} href={pagination.has_next ? `/blog?page=${pagination.next_page}` : "#"}>Next →</Link></nav>}
    </section>
  </div>;
}
