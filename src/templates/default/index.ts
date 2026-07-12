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
