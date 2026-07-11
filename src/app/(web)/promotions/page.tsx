// app/(web)/packages/page.tsx
import { endpoints } from "@/constants/endpoints/endpoints";
import unAuthenticatedAxios from "@/axios-instances/UnAuthenticatedAxios";
import Link from "next/link";
import Image from "next/image";
import { Package, Clock, Gift } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface PackageCardProps {
    id: string;
    slug: string;
    name: string;
    description: string;
    bundle_price: number;
    original_total: number;
    savings_amount: number;
    images: Array<{ url: string; alt_text: string }>;
    ends_at: string | null;
    items: any[];
    free_items: any[];
}

const formatDate = (dateString: string | null): string => {
    if (!dateString) return "No end date";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

async function getPackages() {
    try {
        const response = await unAuthenticatedAxios.get(endpoints.promotions.listPromotions);
        return response.data.data.promotions || [];
    } catch (error) {
        console.error("Error fetching packages:", error);
        return [];
    }
}

export default async function PackagesPage() {
    const packages = await getPackages();

    return (
        <section className="relative py-28 bg-cover bg-center">
            <div className="mx-auto container px-4 md:px-6">
                {/* Header */}
                <div className="max-w-4xl space-y-4 pb-8">
                    <h2 className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
                        Special Offers
                    </h2>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        Promotions &amp;&nbsp;
                        <span className="text-slate-950 relative inline-block">
                            Bundle Deals
                            <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-slate-950/0 via-slate-950/40 to-slate-950/0 blur-xs"></span>
                        </span>
                    </h3>
                    <p className="text-slate-500 text-sm max-w-2xl">
                        Save big with our curated bundles. Get more for less with exclusive package deals.
                    </p>
                </div>

                {/* Packages Grid */}
                {packages.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-4 text-lg text-slate-500">No packages available at the moment</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg: PackageCardProps) => {
                            const mainImage = pkg.images?.[0]?.url || "";
                            const itemCount = pkg.items?.length || 0;
                            const freeItemCount = pkg.free_items?.length || 0;

                            return (
                                <Link
                                    key={pkg.id}
                                    href={`/promotions/${pkg.slug}`}
                                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-50">
                                        {mainImage ? (
                                            <Image
                                                src={mainImage}
                                                alt={pkg.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Package className="h-12 w-12 text-slate-300" />
                                            </div>
                                        )}
                                        {/* Badge */}
                                        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            Save {formatCurrency(pkg.savings_amount)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 space-y-3">
                                        <h3 className="font-semibold text-slate-900 text-lg line-clamp-1">
                                            {pkg.name}
                                        </h3>

                                        <p className="text-sm text-slate-500 line-clamp-2">
                                            {pkg.description || "Curated bundle of products at a special price."}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Package className="h-3.5 w-3.5" />
                                                {itemCount} items
                                            </span>
                                            {freeItemCount > 0 && (
                                                <span className="flex items-center gap-1 text-emerald-600">
                                                    <Gift className="h-3.5 w-3.5" />
                                                    {freeItemCount} free
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-destructive">
                                                <Clock className="h-3.5 w-3.5" />
                                                {formatDate(pkg.ends_at)}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-2 pt-2 border-t border-slate-100">
                                            <span className="text-xl font-bold text-slate-900">
                                                {formatCurrency(pkg.bundle_price)}
                                            </span>
                                            <span className="text-sm text-slate-400 line-through">
                                                {formatCurrency(pkg.original_total)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
