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
    launcher: "bg-[#3f4d2c] text-[#f6f3ec] hover:bg-[#33401f]",
    panel: "border-[#d6d2c6] bg-[#f6f3ec] text-[#2b2b22]",
    header: "border-[#d6d2c6]",
    accent: "bg-[#3f4d2c] text-[#f6f3ec]",
    primaryButton: "border-[#3f4d2c] bg-[#3f4d2c] text-[#f6f3ec] hover:bg-[#33401f]",
    outlineButton: "border-[#d6d2c6] bg-white text-[#2b2b22] hover:border-[#3f4d2c] hover:bg-[#f1eee7]",
    userBubble: "bg-[#3f4d2c] text-[#f6f3ec]",
    assistantBubble: "bg-[#ebe7dd] text-[#2b2b22]",
    assistantAvatar: "bg-[#ebe7dd] text-[#3f4d2c]",
    composer: "border-[#d6d2c6] bg-[#f6f3ec]",
    textarea: "border-[#d6d2c6] bg-white text-[#2b2b22] placeholder:text-[#8a8678] focus-visible:border-[#3f4d2c] focus-visible:ring-[#3f4d2c]/20",
    mutedText: "text-[#6b6b5a]",
    productCard: "border-[#d6d2c6] bg-white text-[#2b2b22] hover:border-[#3f4d2c]",
    productImage: "bg-[#f1eee7]",
    cardPrimaryButton: "border-[#3f4d2c] bg-[#3f4d2c] text-[#f6f3ec] hover:bg-[#33401f]",
    cardOutlineButton: "border-[#d6d2c6] bg-white text-[#2b2b22] hover:border-[#3f4d2c] hover:bg-[#f1eee7]",
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
