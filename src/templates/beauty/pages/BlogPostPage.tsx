import Image from "next/image";
import Link from "next/link";
import type { BlogPostPageProps } from "../../contract";
import styles from "../beauty.module.css";

export default function BlogPostPage({ post }: BlogPostPageProps) {
  return <div className={styles.editorialPage}>
    <header className={styles.editorialHero}><div className={styles.editorialInner}><Link href="/blog" className={styles.eyebrow}>← THE JOURNAL</Link><h1>{post.title}</h1><p>{post.excerpt}</p></div></header>
    <article className={styles.articleBody}>{post.cover_image_url && <div className={styles.articleImage}><Image src={post.cover_image_url} alt={post.title} fill sizes="(max-width: 900px) 90vw, 900px" /></div>}<div className={styles.articleMeta}>{post.category?.name ?? "Journal"} {post.published_at && ` / ${new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}</div><div className={styles.articleCopy} dangerouslySetInnerHTML={{ __html: post.content }} /><Link href="/blog" className={styles.editorialLink}>← Back to the journal</Link></article>
  </div>;
}
