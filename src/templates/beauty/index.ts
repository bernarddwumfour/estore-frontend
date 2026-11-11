import type { Template } from "../contract";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import ProductsPage from "./pages/ProductsPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";

// Landing-page-first template. Other routes inherit the shared baseline.
export const beauty: Partial<Template> = {
  assistantTheme: {
    launcher: "bg-[#20201e] text-[#f8dfc8] hover:bg-[#4e4034]",
    panel: "border-[#e7e1d9] bg-[#faf9f6] text-[#252520]",
    header: "border-[#e7e1d9]",
    accent: "bg-[#f8dfc8] text-[#252520]",
    primaryButton: "border-[#20201e] bg-[#20201e] text-white hover:bg-[#4e4034]",
    outlineButton: "border-[#b7a997] bg-white text-[#252520] hover:border-[#806447] hover:bg-[#f8dfc8]",
    userBubble: "bg-[#20201e] text-white",
    assistantBubble: "bg-[#f1ede7] text-[#252520]",
    assistantAvatar: "bg-[#f8dfc8] text-[#806447]",
    composer: "border-[#e7e1d9] bg-[#faf9f6]",
    textarea: "border-[#d2c5b7] bg-white text-[#252520] placeholder:text-[#988a7c] focus-visible:border-[#b68d63] focus-visible:ring-[#b68d63]/20",
    mutedText: "text-[#82786e]",
    productCard: "border-[#e7e1d9] bg-white text-[#252520] hover:border-[#b68d63]",
    productImage: "bg-[#f1ede7]",
    cardPrimaryButton: "border-[#20201e] bg-[#20201e] text-white hover:bg-[#4e4034]",
    cardOutlineButton: "border-[#b7a997] bg-white text-[#252520] hover:border-[#b68d63] hover:bg-[#f8dfc8]",
  },
  HomePage, Navbar, Footer, ProductCard, ProductsPage, ContactPage, AboutPage, BlogPage, BlogPostPage,
};
