// app/dashboard/marketing/email-campaigns/page.tsx
'use client';

import { UnderConstruction } from "@/widgets/UnderConstruction/UnderConstruction";


export default function EmailCampaignsPage() {
    return (
        <UnderConstruction
            title="Email Campaigns"
            message="Design and send beautiful email campaigns to engage your customers and drive sales."
            estimatedCompletion="Coming Soon"
            variant="detailed"
            features={[
                "Drag-and-drop email builder",
                "Pre-designed email templates",
                "Automated welcome sequences",
                "Abandoned cart recovery emails",
                "Post-purchase follow-ups",
                "Customer segmentation and targeting",
                "A/B testing for subject lines and content",
                "Campaign analytics (open rates, click-through rates)",
                "Newsletter management",
                "Integration with Mailchimp/Sendinblue"
            ]}
        />
    );
}