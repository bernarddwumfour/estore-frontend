import { ReactNode } from "react"
import { WishlistInitializer } from "./WishlistInitializer"
import NextTopLoader from 'nextjs-toploader';
import { T } from "@/templates/registry"


const layout = ({ children }: { children: ReactNode }) => {
    return (
        <div>
            <T.Navbar />
            <NextTopLoader
                color="#080808"
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

        </div>
    )
}

export default layout