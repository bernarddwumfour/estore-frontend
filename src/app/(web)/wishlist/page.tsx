"use client"
import { endpoints } from "@/constants/endpoints/endpoints";
import securityAxios from "@/axios-instances/SecurityAxios";
import { useQuery } from "@tanstack/react-query";
import Spinner from "@/widgets/loaders/Spinner";
import { AlertMessage } from "@/widgets/alert-message/AlertMessage";
import { ProductType } from "@/types/productTypes";
import { PageHeader } from "@/templates/page-header";
import { ProductCard } from "@/templates/product-card";
import { useAuth } from "@/lib/use-auth";
import Link from "next/link";

type WishlistResponse = { data: { items: ProductType[] } };

export const fetchWishlist = async (): Promise<WishlistResponse> => {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
        throw new Error("The store API is not configured for this deployment.");
    }
    const response = await securityAxios.get(endpoints.products.listWishList);
    const payload = response.data as WishlistResponse | null;
    if (!Array.isArray(payload?.data?.items)) {
        throw new Error("The wishlist service returned an invalid response.");
    }
    return payload;
};

const WishlistPage = () => {
    const { user, tokens } = useAuth();
    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: [endpoints.products.listWishList],
        queryFn: fetchWishlist,
        enabled: Boolean(user?.id && tokens?.access_token),
    });
    const items = data?.data?.items ?? [];


    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header (swaps per active template) */}
            <PageHeader subtitle="My WishList" title="Saved Items To Buy Later" />
            <div className="container mx-auto px-4 py-16">
                {!user?.id && <div className="text-center py-12"><p className="text-muted-foreground text-lg">Sign in to see your saved tyres.</p><Link href="/login" className="mt-5 inline-block underline underline-offset-4">Log in</Link></div>}
                {user?.id && isLoading && <Spinner size="md" />}
                {user?.id && isError && <AlertMessage variant="error" message={error?.message || "Failed to load wishlist"} />}

                {user?.id && !isError && !isLoading && (<>
                    {items.length === 0 ?
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg">
                                No products in wishlist at the moment

                            </p>
                        </div> :
                        <>
                            <ul className="grid gap-2 md:gap-4 gap-y-12 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 md:px-4 py-12">
                                {items.map((product) => (
                                    <ProductCard product={product} key={product.id} />
                                ))}
                            </ul>

                        </>
                    }

                </>)}

            </div>
        </div>
    );
}

export default WishlistPage
