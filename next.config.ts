import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolate the beauty preview from a concurrently running existing store.
  distDir: process.env.NEXT_DEV_DIST_DIR || ".next",
  images: {
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
      {
        protocol: "https",
        hostname: "www.tailwind-kit.com",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
