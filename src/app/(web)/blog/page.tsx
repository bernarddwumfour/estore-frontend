"use client"
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const blogPosts = [
  {
    id: 1,
    title: "Top 10 Wireless Headphones for 2025",
    excerpt: "Discover the best wireless headphones on the market with superior sound quality, long battery life, and cutting-edge noise cancellation features.",
    author: "Alex Rivera",
    date: "December 15, 2025",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1160",
  },
  {
    id: 2,
    title: "How to Choose the Perfect Gaming Setup",
    excerpt: "From keyboards to mice and monitors, we break down everything you need to build an unbeatable gaming station in 2025.",
    author: "Jordan Lee",
    date: "December 10, 2025",
    readTime: "8 min read",
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=1160",
  },
  {
    id: 3,
    title: "The Rise of True Wireless Earbuds",
    excerpt: "Explore why true wireless earbuds have become the go-to choice for music lovers and professionals alike.",
    author: "Sam Taylor",
    date: "December 5, 2025",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1606741965509-717b9fdd6549?auto=format&fit=crop&q=80&w=1160",
  },
  {
    id: 4,
    title: "Smartwatches: More Than Just Timekeepers",
    excerpt: "Learn how modern smartwatches are helping people track fitness, stay connected, and improve daily productivity.",
    author: "Morgan Blake",
    date: "November 28, 2025",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1160",
  },
  {
    id: 5,
    title: "Essential Accessories Every Tech Lover Needs",
    excerpt: "From laptop stands to phone cases, here are the must-have accessories that make your tech life easier and more stylish.",
    author: "Casey Kim",
    date: "November 20, 2025",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?auto=format&fit=crop&q=80&w=1160",
  },
  {
    id: 6,
    title: "Why Mechanical Keyboards Are Making a Comeback",
    excerpt: "Dive into the world of mechanical keyboards and find out why gamers and typists are switching back in droves.",
    author: "Riley Scott",
    date: "November 15, 2025",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1160",
  },
];

export default function BlogPage() {
  const {id} = useParams()
  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="py-6 pb-12">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-4">Our Blog</h1>
          <p className="text-gray-600">Stay updated with the latest tech trends, product reviews, and helpful guides from our team.</p>
        </div>
      
        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
           <Link href={`/blog/${id}`}>
            <article
              key={post.id}
              className="group relative block overflow-hidden rounded-lg bg-white border border-gray-100"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-medium text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-700 line-clamp-3 mb-4">
                  {post.excerpt}
                </p>

                {/* Read More Button */}
                <Button variant="link" className="p-0 h-auto font-medium text-gray-900 hover:text-gray-600">
                  Read more →
                </Button>
              </div>
            </article>
           </Link>
          ))}
        </div>

        {/* Optional: Pagination (static for now) */}
        <div className="mt-12 flex justify-center">
          <nav className="flex gap-2">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="outline" className="bg-gray-900 text-white hover:bg-gray-800">
              1
            </Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </nav>
        </div>
      </div>
    </div>
  );
}