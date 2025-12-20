import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/providers/cart-provider";
import { Providers } from "@/lib/providers/Providers";

// Load Lato font (optimized by Next.js)
const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"], // Light, Regular, Bold, Black – common for e-commerce
  display: "swap",
  // No 'variable' needed — we're using the simple .className method
});

export const metadata: Metadata = {
  title: "TechStore",
  description: "Premium tech gadgets and accessories for modern living.",
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
        <Providers>
          <CartProvider>
            {children}
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
