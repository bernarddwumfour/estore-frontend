import type { Template } from "../contract";
import HomePage from "./pages/HomePage";
import ProductCard from "./components/ProductCard";
import Navbar from "@/widgets/navbar/Navbar";
import Footer from "@/widgets/footer/Footer";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import ProductsPage from "./pages/ProductsPage";

/** Baseline template — every other store inherits these and overrides deltas. */
export const defaultTemplate: Template = {
  assistantTheme: {
    launcher: "bg-slate-950 text-white hover:bg-slate-800",
    panel: "border-slate-200 bg-white text-slate-950",
    header: "border-slate-200",
    accent: "bg-slate-950 text-white",
    primaryButton: "bg-slate-950 text-white hover:bg-slate-800 border-slate-950",
    outlineButton: "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
    userBubble: "bg-slate-950 text-white",
    assistantBubble: "bg-slate-100 text-slate-800",
    assistantAvatar: "bg-slate-100 text-slate-700",
    composer: "border-slate-200 bg-white",
    textarea: "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:border-slate-950 focus-visible:ring-slate-950/20",
    mutedText: "text-slate-500",
    productCard: "border-slate-200 bg-white text-slate-950 hover:border-slate-400",
    productImage: "bg-slate-100",
    cardPrimaryButton: "bg-slate-950 text-white hover:bg-slate-800 border-slate-950",
    cardOutlineButton: "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
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
