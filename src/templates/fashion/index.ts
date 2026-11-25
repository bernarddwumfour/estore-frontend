import type { Template } from "../contract";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import ProductsPage from "./pages/ProductsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";

/** Editorial fashion storefront for the Velora clothing store. */
export const fashion: Partial<Template> = {
  assistantTheme: {
    launcher: "bg-[#ad8a60] text-white hover:bg-[#92704a]",
    panel: "border-[#e9e1d7] bg-[#fffdf9] text-[#24211f]",
    header: "border-[#e9e1d7]",
    accent: "bg-[#ad8a60] text-white",
    primaryButton: "border-[#ad8a60] bg-[#ad8a60] text-white hover:bg-[#92704a]",
    outlineButton: "border-[#e9e1d7] bg-white text-[#24211f] hover:border-[#ad8a60] hover:bg-[#f8f4ee]",
    userBubble: "bg-[#ad8a60] text-white",
    assistantBubble: "bg-[#f2eee8] text-[#24211f]",
    assistantAvatar: "bg-[#f2eee8] text-[#ad8a60]",
    composer: "border-[#e9e1d7] bg-[#fffdf9]",
    textarea: "border-[#e9e1d7] bg-white text-[#24211f] placeholder:text-[#91877c] focus-visible:border-[#ad8a60] focus-visible:ring-[#ad8a60]/20",
    mutedText: "text-[#77716b]",
    productCard: "border-[#e9e1d7] bg-white text-[#24211f] hover:border-[#ad8a60]",
    productImage: "bg-[#f4f1ed]",
    cardPrimaryButton: "border-[#ad8a60] bg-[#ad8a60] text-white hover:bg-[#92704a]",
    cardOutlineButton: "border-[#e9e1d7] bg-white text-[#24211f] hover:border-[#ad8a60] hover:bg-[#f8f4ee]",
  },
  HomePage,
  Navbar,
  Footer,
  ProductCard,
  ProductsPage,
  AboutPage,
  ContactPage,
  BlogPage,
  BlogPostPage,
};
