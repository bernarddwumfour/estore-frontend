"use client"
import { endpoints } from "@/constants/endpoints/endpoints";
import ProductsGrid from "../products/ProductsGrid";
import securityAxios from "@/axios-instances/SecurityAxios";
import { useQuery } from "@tanstack/react-query";
import Spinner from "@/widgets/loaders/Spinner";
import { AlertMessage } from "@/widgets/alert-message/AlertMessage";
import Product from "../products/Product";
import { ProductType } from "@/types/productTypes";


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
            <div className="py-32 container mx-auto px-4">
                {/* Header */}
                <div className="max-w-xl space-y-4">
                    <h2 className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
                        My WishList
                    </h2>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        Saved Items To    {" "}
                        <span className="text-slate-950 relative inline-block">
                            Buy Later
                            <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-slate-950/0 via-slate-950/40 to-slate-950/0 blur-xs"></span>
                        </span>
                    </h3>
                </div>

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
                                    <Product product={product} key={product.id} />
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