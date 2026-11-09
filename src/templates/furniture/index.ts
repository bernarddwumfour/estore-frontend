import type { Template } from "../contract";
import HomePage from "./pages/HomePage";
import ProductCard from "./components/ProductCard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import ProductsPage from "./pages/ProductsPage";

/**
 * Furniture store. Overrides the homepage composition, product card, navbar,
 * footer, and the blog/contact/about/products pages; inherits everything else
 * from the default baseline via the registry.
 */
export const furniture: Partial<Template> = {
  assistantTheme: {
    launcher: "bg-[#654035] text-[#f6f3ec] hover:bg-[#503027]",
    panel: "border-[#d6d2c6] bg-[#f6f3ec] text-[#2b2b22]",
    header: "border-[#d6d2c6]",
    accent: "bg-[#654035] text-[#f6f3ec]",
    primaryButton: "border-[#654035] bg-[#654035] text-[#f6f3ec] hover:bg-[#503027]",
    outlineButton: "border-[#d6d2c6] bg-white text-[#2b2b22] hover:border-[#654035] hover:bg-[#f1eee7]",
    userBubble: "bg-[#654035] text-[#f6f3ec]",
    assistantBubble: "bg-[#ebe7dd] text-[#2b2b22]",
    assistantAvatar: "bg-[#ebe7dd] text-[#654035]",
    composer: "border-[#d6d2c6] bg-[#f6f3ec]",
    textarea: "border-[#d6d2c6] bg-white text-[#2b2b22] placeholder:text-[#8a8678] focus-visible:border-[#654035] focus-visible:ring-[#654035]/20",
    mutedText: "text-[#6b6b5a]",
    productCard: "border-[#d6d2c6] bg-white text-[#2b2b22] hover:border-[#654035]",
    productImage: "bg-[#f1eee7]",
    cardPrimaryButton: "border-[#654035] bg-[#654035] text-[#f6f3ec] hover:bg-[#503027]",
    cardOutlineButton: "border-[#d6d2c6] bg-white text-[#2b2b22] hover:border-[#654035] hover:bg-[#f1eee7]",
  },
  HomePage,
  ProductCard,
  Navbar,
  Footer,
  BlogPage,
  BlogPostPage,
  ContactPage,
  AboutPage,
  ProductsPage,
};
