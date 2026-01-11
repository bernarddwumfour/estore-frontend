import Footer from "@/widgets/footer/Footer"
import Navbar from "@/widgets/navbar/Navbar"
import { ReactNode } from "react"
import { WishlistInitializer } from "./WishlistInitializer"

const layout = ({ children }: { children: ReactNode }) => {
    return (
        <div>
            <Navbar />
            <WishlistInitializer />
            <main className="min-h-screen">
            {children}
            </main>
            <Footer />

        </div>
    )
}

export default layout