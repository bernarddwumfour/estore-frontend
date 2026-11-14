import { ReactNode } from "react";
import { WishlistInitializer } from "./WishlistInitializer";
import NextTopLoader from "nextjs-toploader";
import { T } from "@/templates/registry";
import { storefrontTheme } from "@/templates/storefront-theme";
import { AssistantLauncher } from "@/widgets/ai-assistant/AssistantLauncher";


const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div data-storefront-theme={storefrontTheme}>
      <T.Navbar />

      <NextTopLoader
        color={process.env.NEXT_PUBLIC_STORE === "furniture" ? "#654035" : process.env.NEXT_PUBLIC_STORE === "tyrepapa" ? "#b68d63" : process.env.NEXT_PUBLIC_STORE === "beauty" ? "#92583e" : "#080808"}
        initialPosition={0.08}
        crawlSpeed={200}
        height={4}
        showSpinner={false}
        easing="ease"
        speed={200}
      />

      <WishlistInitializer />

      <main className="min-h-screen">
        {children}
      </main>

      <T.Footer />

      <AssistantLauncher theme={T.assistantTheme} />
    </div>
  );
};

export default layout;
