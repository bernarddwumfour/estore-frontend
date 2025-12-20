import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';

// Example single post data - in real app, fetch by slug/id
const blogPost = {
  id: 1,
  title: "Top 10 Wireless Headphones for 2025",
  author: "Alex Rivera",
  date: "December 15, 2025",
  readTime: "6 min read",
  imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1160",
  content: `
    <p className="text-lg leading-relaxed text-gray-700 mb-6">
      Wireless headphones have come a long way in recent years. With advancements in battery life, sound quality, and noise cancellation, 2025 is shaping up to be an incredible year for audio enthusiasts.
    </p>
    
    <p className="text-lg leading-relaxed text-gray-700 mb-6">
      Whether you're a casual listener, a frequent traveler, or an audiophile chasing the perfect soundstage, there's something for everyone. We've tested dozens of models to bring you our top picks.
    </p>
    
    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">What to Look For</h2>
    <p className="text-lg leading-relaxed text-gray-700 mb-6">
      When choosing wireless headphones, consider these key factors:
    </p>
    <ul className="list-disc pl-8 space-y-3 text-lg text-gray-700 mb-8">
      <li>Battery life – ideally 30+ hours</li>
      <li>Active noise cancellation quality</li>
      <li>Comfort for long wearing sessions</li>
      <li>Sound profile and codec support (e.g., LDAC, aptX)</li>
      <li>Build quality and water resistance</li>
    </ul>
    
    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Our Top Recommendation</h2>
    <p className="text-lg leading-relaxed text-gray-700 mb-6">
      After extensive testing, our favorite remains the premium over-ear model that balances sound, comfort, and features perfectly. Its adaptive noise cancellation adjusts in real-time to your environment, and the 40-hour battery life means you can go days without charging.
    </p>
    
    <p className="text-lg leading-relaxed text-gray-700 mb-6">
      The sound is rich and detailed, with deep bass that doesn't overpower mids and highs. Whether you're listening to classical, hip-hop, or podcasts, these headphones deliver an engaging experience.
    </p>
    
    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Final Thoughts</h2>
    <p className="text-lg leading-relaxed text-gray-700">
      2025 offers more choices than ever in wireless audio. No matter your budget or preferences, there's a great pair waiting for you. Focus on what matters most to you — sound, comfort, or portability — and you'll find the perfect match.
    </p>
  `,
};

export default function BlogPostPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Featured Image */}
        <div className="relative aspect-video overflow-hidden rounded-lg bg-white border border-gray-100 mb-12">
          <Image
            src={blogPost.imageUrl}
            alt={blogPost.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Post Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{blogPost.title}</h1>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span className="font-medium">{blogPost.author}</span>
            <span>•</span>
            <span>{blogPost.date}</span>
            <span>•</span>
            <span>{blogPost.readTime}</span>
          </div>
        </div>

        {/* Article Content */}
        <article
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blogPost.content }}
        />

        {/* Back to Blog Link */}
        <div className="mt-16 text-center">
          <Button variant="outline" asChild>
            <a href="/blog">← Back to all posts</a>
          </Button>
        </div>

      
      </div>
    </div>
  );
}