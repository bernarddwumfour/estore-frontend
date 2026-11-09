import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/providers/cart-provider";
import { Providers } from "@/lib/providers/Providers";
import { ThemeProvider } from "@/components/ui/theme-provider";

// Load Lato font (optimized by Next.js)
const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"], // Light, Regular, Bold, Black – common for e-commerce
  display: "swap",
  // No 'variable' needed — we're using the simple .className method
});

const brandIcon = process.env.NEXT_PUBLIC_STORE === "furniture"
  ? "/brand/oak-and-loom-logo.png?v=2"
  : "/brand/iplug-logo.png?v=2";

export const metadata: Metadata = {
  icons: { icon: brandIcon, shortcut: brandIcon, apple: brandIcon },
  title: process.env.NEXT_PUBLIC_STORE === "furniture" ? "oak&loom" : "iPlug",
  description: process.env.NEXT_PUBLIC_STORE === "furniture"
    ? "Thoughtfully crafted furniture and home essentials from oak&loom."
    : "Premium tech gadgets and accessories for modern living.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body className={lato.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <Providers>
            <CartProvider>
              {children}
            </CartProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
