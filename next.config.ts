import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolate each storefront preview so they can run side by side.
  distDir: process.env.NEXT_DEV_DIST_DIR || ".next",
  images: {
    // Olive & Aura images are already served by Cloudinary. In local preview,
    // fetching them again through Next's optimizer returns a 500.
    unoptimized: process.env.NEXT_PUBLIC_STORE === "oliveandaura",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      ...['8001', '8002', '8003'].map((port) => ({
        protocol: 'http' as const,
        hostname: 'localhost',
        port,
        pathname: '/media/**',
      })),
      {
        protocol: "https",
        hostname: "www.tailwind-kit.com",
      },
    ],
  },
};

export default nextConfig;
