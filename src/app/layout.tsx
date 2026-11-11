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

const isBeauty = process.env.NEXT_PUBLIC_STORE === "beauty";

const brandIcon = isBeauty ? "/beauty/favicon.svg" : process.env.NEXT_PUBLIC_STORE === "furniture"
  ? "/brand/oakandloom-mark.png"
  : "/brand/iplug-mark.png";

export const metadata: Metadata = {
  icons: { icon: brandIcon, shortcut: brandIcon, apple: brandIcon },
  title: isBeauty ? "TyrePapa — Find the right set" : process.env.NEXT_PUBLIC_STORE === "furniture" ? "oak&loom" : "iPlug",
  description: isBeauty ? "Explore tyres for your car and the journeys ahead with TyrePapa." : process.env.NEXT_PUBLIC_STORE === "furniture"
    ? "Thoughtfully crafted furniture and home essentials from oak&loom."
    : "Premium tech gadgets and accessories for modern living.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
