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

const isTyrePapa = process.env.NEXT_PUBLIC_STORE === "tyrepapa";
const isBeauty = process.env.NEXT_PUBLIC_STORE === "oliveandaura";
const isAmammre = process.env.NEXT_PUBLIC_STORE === "amammre";

const brandIcon = isAmammre ? "/amammre/favicon.svg" : isTyrePapa ? "/tyrepapa/favicon.svg" : isBeauty ? "/beauty/favicon.svg" : process.env.NEXT_PUBLIC_STORE === "furniture"
  ? "/brand/oakandloom-mark.png"
  : "/brand/iplug-mark.png";

export const metadata: Metadata = {
  icons: { icon: brandIcon, shortcut: brandIcon, apple: brandIcon },
  title: isAmammre ? "Amammre Wears — Heritage, styled for today" : isTyrePapa ? "TyrePapa — Find the right set" : isBeauty ? "Olive & Aura — Beauty & wellness" : process.env.NEXT_PUBLIC_STORE === "furniture" ? "oak&loom" : "iPlug",
  description: isAmammre ? "Discover traditional and contemporary fashion at Amammre Wears." : isTyrePapa ? "Explore tyres for your car and the journeys ahead with TyrePapa." : isBeauty ? "Thoughtful spa treatments, beauty rituals and skincare from Olive & Aura." : process.env.NEXT_PUBLIC_STORE === "furniture"
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
