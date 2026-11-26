import type { NextConfig } from "next";

// Only allow configured media origins through the image optimizer. Set this
// on the frontend to the S3 endpoint or CDN origin used by the API.
const mediaImageOrigins = (process.env.MEDIA_IMAGE_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => {
    const url = new URL(value);
    if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
      throw new Error("MEDIA_IMAGE_ORIGINS must contain HTTP(S) origins only, e.g. https://cdn.example.com");
    }
    return { protocol: url.protocol.slice(0, -1) as "http" | "https", hostname: url.hostname, port: url.port, pathname: "/**" };
  });

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
        protocol: "https",
        hostname: "alisad.net",
        pathname: "/wp-content/uploads/**",
      },
      ...mediaImageOrigins,
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      ...['8001', '8002', '8003', '8004'].map((port) => ({
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
