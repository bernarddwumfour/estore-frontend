// app/dashboard/marketing/promotions/page.tsx
'use client';

import { UnderConstruction } from "@/widgets/UnderConstruction/UnderConstruction";


export default function PromotionsPage() {
    return (
        <UnderConstruction
            title="Promotions & Discounts"
            message="Create and manage promotional campaigns, discount codes, and special offers to boost your sales."
            estimatedCompletion="Coming Soon"
            variant="detailed"
            features={[
                "Create percentage, fixed amount, or BOGO discounts",
                "Generate unique promo codes",
                "Schedule promotions with start/end dates",
                "Set usage limits and per-user limits",
                "Apply promotions to specific products or categories",
                "Track promotion performance and analytics",
                "Email marketing integration",
                "Abandoned cart recovery campaigns"
            ]}
        />
    );
}