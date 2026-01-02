import { Button } from "@/components/ui/button"
import TestimonialsSlider from "@/widgets/slider/Slider";
import { ArrowUpRight, Bookmark, BookMarked, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Product from "./products/Product";
import { products } from "@/constants/products";
import ProductsGrid from "./products/ProductsGrid";

export default function Home() {
  return (
    <>
      <div className="py-12"></div>
      <Hero2 />
      <Categories1 />
      <Products1 />
      <About1 />
      <Products1 />
      <Testimonials />
    </>
  );
}

const categories = [
  {
    title: "Portable Electronics",
    subtitle: "Travel Ready",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=1160",
    items: "203",
  },
  {
    title: "Audio & Sound",
    subtitle: "Premium Acoustics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1160",
    items: "156",
  },
  {
    title: "Smart Wearables",
    subtitle: "Connected Lifestyle",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1160",
    href: "/category/wearables",
  },
  {
    title: "Gaming Gear",
    subtitle: "Ultimate Performance",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=1160",
    items: "89",
    href: "/category/gaming",
  },
  {
    title: "Mobile Accessories",
    subtitle: "Essential Companions",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1160",
    items: "247",
  },

];



function Hero1() {
  return (
    <div className="bg-white dark:bg-gray-800 flex relative z-20 items-center overflow-hidden">
      <div className="container mx-auto px-6 flex relative py-16 md:pt-36">
        <div className="sm:w-2/3 lg:w-2/5 flex flex-col relative z-20">
          <span className="w-20 h-2 bg-gray-800 dark:bg-white mb-12">
          </span>
          <h1
            className="font-bebas-neue uppercase text-6xl sm:text-8xl font-black flex flex-col leading-none dark:text-white text-gray-800">
            Be on
            <span className="text-5xl sm:text-7xl">
              Time
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-700 dark:text-white">
            Dimension of reality that makes change possible and understandable. An indefinite and homogeneous
            environment in which natural events and human existence take place.
          </p>

          <div className="flex mt-8 gap-6">
            <Button className="p-7">
              Shop Now
            </Button>
            <Button className="p-7" variant={"outline"}>
              Get started
            </Button>
          </div>
        </div>
        <div className="hidden sm:block sm:w-1/3 lg:w-3/5 relative">
          <Image width={200} height={200} src="https://www.tailwind-kit.com/images/object/10.png" className="max-w-xs md:max-w-sm m-auto" alt="hero image" />
        </div>
      </div>
    </div>
  )
}


function Hero2() {
  return (

    <section className="relative py-64 bg-cover bg-center" >
      <div className="absolute inset-0 bg-gray-400 bg-opacity-60"></div>

      <div className="relative z-[2] max-w-4xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Transform Your Garden</h1>
        <p className="text-lg md:text-xl mb-8">Expert gardening & landscaping services to turn your outdoor dreams into reality.</p>
        <Button asChild className="p-7">
          <Link href="/products">
            Shop Now
          </Link>
        </Button>
      </div>
    </section>

  )
}

function About1() {
  return (
    <section className="bg-primary/5">
      <div className="mx-auto container py-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center justify-between md:gap-8">
          <div>
            <div className="max-w-prose md:max-w-none space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </h2>

              <p className="mt-4 text-pretty text-gray-700 leading-8">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga non eos pariatur suscipit repellendus ex dolores error voluptatum voluptas autem ipsum nemo ea repellat voluptate aut facere natus ut voluptates eaque assumenda obcaecati, ipsa tempora. Totam repellendus beatae quae quo! Obcaecati, et voluptatibus expedita rerum recusandae fugit culpa architecto voluptas molestias soluta. Eveniet eum numquam nemo unde laboriosam totam sed! Ducimus inventore eveniet aut, pariatur eligendi repudiandae itaque illum omnis laboriosam nulla.
              </p>
              <Button className="p-7">
                Learn More
              </Button>
            </div>
          </div>

          <div>
            <Image width={1000} height={1000} src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1160" className="m-auto" alt="hero image" />
          </div>
        </div>
      </div>
    </section>
  )
}



function Categories1() {
  return (

    <section className="relative py-24 bg-cover bg-center bg-primary/5" >

      <div className="mx-auto container">
        <div className="py-6">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-4">Explore Our Products</h1>
          <p className="text-gray-600">This is the main content area. The footer will stay at the bottom.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ">



          {categories.map((category, i) => (
            <div key={category.title + i} className="relative group cursor-pointer h-64 p-4 flex justify-center items-end">
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.title}
                className="absolute w-full h-full object-cover group-hover:scale-95 transition-transform duration-700"
              />

              <div className="relative overflow-hidden mb-6 bg-stone-200 p-6 z-[2] opacity-70 group-hover:opacity-100 ">
                <div className="absolute bottom-4 right-4 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500 mb-2 font-serif">{category.subtitle}</p>
                  <h3 className="text-2xl font-serif mb-2 group-hover:text-stone-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-stone-500">{category.items} Products</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>

  )
}

function Products1() {
  return (

    <section className="relative py-24 bg-cover bg-center" >

      <div className="mx-auto container">
        <div className="py-6">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-4">Explore Our Catalogue</h1>
          <p className="text-gray-600">This is the main content area. The footer will stay at the bottom.</p>
        </div>

        <ProductsGrid />
      </div>
    </section>

  )
}

function Testimonials() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-4">TESTIMONIAL</h1>
          <p className="text-gray-600">What our happy user says!</p>
        </div>
        <TestimonialsSlider />
      </div>
    </section>
  )
}