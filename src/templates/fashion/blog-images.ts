const images: Record<string, string> = {
  "a-guide-to-ghanaian-traditional-wear": "/images/amammre/journal-heritage.png",
  "how-to-style-african-print-for-everyday-wear": "/images/amammre/journal-everyday.png",
  "choosing-an-outfit-for-a-ghanaian-celebration": "/images/amammre/journal-celebration.png",
};

export function blogImage(slug: string, fallback?: string | null) {
  return images[slug] || fallback;
}
