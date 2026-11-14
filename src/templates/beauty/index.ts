import type { Template } from "../contract";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProductsPage from "./pages/ProductsPage";

export const beauty: Partial<Template> = {
  assistantTheme: {
    launcher: "bg-[#8f553d] text-white hover:bg-[#75432f]",
    panel: "border-[#e7ddd3] bg-[#fffaf5] text-[#39271f]",
    header: "border-[#e7ddd3]",
    accent: "bg-[#8f553d] text-white",
    primaryButton: "border-[#8f553d] bg-[#8f553d] text-white hover:bg-[#75432f]",
    outlineButton: "border-[#e7ddd3] bg-white text-[#39271f] hover:border-[#8f553d] hover:bg-[#f7eee7]",
    userBubble: "bg-[#8f553d] text-white",
    assistantBubble: "bg-[#f1e8df] text-[#39271f]",
    assistantAvatar: "bg-[#f1e8df] text-[#8f553d]",
    composer: "border-[#e7ddd3] bg-[#fffaf5]",
    textarea: "border-[#e7ddd3] bg-white text-[#39271f] placeholder:text-[#9b8d82] focus-visible:border-[#8f553d] focus-visible:ring-[#8f553d]/20",
    mutedText: "text-[#78675d]",
    productCard: "border-[#e9e0d8] bg-white text-[#39271f] hover:border-[#b17b61]",
    productImage: "bg-[#f5efe9]",
    cardPrimaryButton: "border-[#8f553d] bg-[#8f553d] text-white hover:bg-[#75432f]",
    cardOutlineButton: "border-[#e7ddd3] bg-white text-[#39271f] hover:border-[#8f553d] hover:bg-[#f7eee7]",
  },
  HomePage,
  Navbar,
  Footer,
  ProductCard,
  AboutPage,
  ContactPage,
  ProductsPage,
};
