import Footer from "@/widgets/footer/Footer"
import Navbar from "@/widgets/navbar/Navbar"
import { ReactNode } from "react"

const layout = ({ children }: { children: ReactNode }) => {
    return (
        <div>
            <Navbar />
            <main className="min-h-screen">
            {children}
            </main>
            <Footer />

        </div>
    )
}

export default layout