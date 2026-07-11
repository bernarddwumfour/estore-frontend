import type { Template } from "../contract";
import HomePage from "./pages/HomePage";
import ProductCard from "./components/ProductCard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import ProductsPage from "./pages/ProductsPage";

/**
 * Furniture store. Overrides the homepage composition, product card, navbar,
 * footer, and the blog/contact/about/products pages; inherits everything else
 * from the default baseline via the registry.
 */
export const furniture: Partial<Template> = {
  HomePage,
  ProductCard,
  Navbar,
  Footer,
  BlogPage,
  ContactPage,
  AboutPage,
  ProductsPage,
};
