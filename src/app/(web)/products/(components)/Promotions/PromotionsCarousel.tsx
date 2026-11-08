import { PromotionType } from "@/types/promotionTypes";
import { endpoints } from "@/constants/endpoints/endpoints";
import PromotionsHorizontalSwiper from "./PromotionsHorizontalSwiper";
import { JSX } from "react";

interface PromotionsCarouselProps {
    limit?: number;
}

async function getActivePromotions(limit: number = 10): Promise<PromotionType[]> {
    try {
        const params = new URLSearchParams({
            limit: limit.toString(),
            page: "1",
        });

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || "http://localhost:3000";
        const apiPath = endpoints.promotions.listPromotions;

        const fullUrl = `${baseUrl.replace(/\/$/, "")}/${apiPath.replace(/^\//, "")}`;
        const url = new URL(fullUrl);
        url.search = params.toString();

        const response = await fetch(url.toString(), {
            next: {
                revalidate: 300,
                tags: ["promotions-carousel"],
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch promotions: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || "Failed to load promotions");
        }

        console.log("PROMOTIONS", data.data)

        return data.data.promotions || [];
    } catch (error) {
        console.error("Error fetching promotions:", error);
        return [];
    }
}

export default async function PromotionsCarousel({
    limit = 10,
}: PromotionsCarouselProps): Promise<JSX.Element> {
    const promotions: PromotionType[] = await getActivePromotions(limit);

    if (promotions.length === 0) {
        return <></>
    }

    return (
        <div className="container mx-auto w-full overflow-hidden px-4 py-8 md:px-6">
            <PromotionsHorizontalSwiper promotions={promotions} />
        </div>
    );
}
