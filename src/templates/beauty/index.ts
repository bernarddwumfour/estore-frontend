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
export const beauty: Partial<Template> = { HomePage, Navbar, Footer, ProductCard, ProductsPage, ContactPage, AboutPage, BlogPage, BlogPostPage };
