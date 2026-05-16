import { ProductType } from "@/types/productTypes";
import { endpoints } from "@/constants/endpoints/endpoints";
import ProductVerticalSwiper from "./ProductVerticalSwiper";

interface ProductVerticalCarouselProps {
    category?: string;
    endpoint?: string;
}

async function getProducts(category?: string, endpoint?: string) {
    try {
        const params = new URLSearchParams({
            limit: "10", // Kept low for optimal carousel looping performance
            category: category || "",
        });

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
        const apiPath = endpoint || endpoints.products.listProductsWeb;

        const fullUrl = `${baseUrl.replace(/\/$/, "")}/${apiPath.replace(/^\//, "")}`;
        const url = new URL(fullUrl);
        url.search = params.toString();

        console.log("Fetching carousel items from:", url.toString());

        const response = await fetch(url.toString(), {
            next: {
                revalidate: 300,
                tags: ["products-carousel", category ? `products-${category}` : "all-products"],
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || "Failed to load carousel products");
        }

        return data.data || [];
    } catch (error) {
        console.error("Error fetching carousel items:", error);
        return []; // Gracefully fail with an empty array to prevent breaking layouts
    }
}

export default async function ProductVerticalCarousel({ category, endpoint }: ProductVerticalCarouselProps) {
    const products: ProductType[] = await getProducts(category, endpoint);

    // Fallback empty state if no active inventory parameters exist
    if (products.length === 0) {
        return (
            <div className="lg:col-span-3 h-[360px] flex items-center justify-center bg-[#f8f9fa] rounded-[2rem] border border-slate-100 p-4">
                <p className="text-xs font-medium text-slate-400">No featured items available</p>
            </div>
        );
    }

    return (
        <div className="lg:col-span-3 w-full md:h-[650px] relative overflow-hidden">
            {/* Pass fetched data down into the Swiper client-wrapper */}
            <p className="font-bold p-1 rounded-md">Best Value Products.</p>
            <ProductVerticalSwiper products={products} />
        </div>
    );
}