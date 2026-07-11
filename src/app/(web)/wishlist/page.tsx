"use client"
import { endpoints } from "@/constants/endpoints/endpoints";
import securityAxios from "@/axios-instances/SecurityAxios";
import { useQuery } from "@tanstack/react-query";
import Spinner from "@/widgets/loaders/Spinner";
import { AlertMessage } from "@/widgets/alert-message/AlertMessage";
import { ProductType } from "@/types/productTypes";
import { PageHeader } from "@/templates/page-header";
import { ProductCard } from "@/templates/product-card";


export const fetchWishlist = async () => {
    const response = await securityAxios.get(endpoints.products.listWishList);
    return response.data;
};

const page = () => {
    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: [endpoints.products.listWishList],
        queryFn: fetchWishlist,
    });


    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header (swaps per active template) */}
            <PageHeader subtitle="My WishList" title="Saved Items To Buy Later" />
            <div className="container mx-auto px-4 py-16">
                {isLoading && <Spinner size="md" />}
                {isError && <AlertMessage variant="error" message={`${error?.message || "Failed to load orders"}`} />}

                {!isError && !isLoading && (<>
                    {data.data.items.length == 0 ?
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg">
                                No products in wishlist at the moment

                            </p>
                        </div> :
                        <>
                            <ul className="grid gap-2 md:gap-4 gap-y-12 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 md:px-4 py-12">
                                {data.data.items.map((product: ProductType) => (
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

export default page