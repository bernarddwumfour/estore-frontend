import Link from "next/link"

const Logo = () => {
    return (
        <Link href="/" className="flex items-center gap-2 py-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                S
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                ShopHub
            </span>
        </Link>
    )
}

export default Logo