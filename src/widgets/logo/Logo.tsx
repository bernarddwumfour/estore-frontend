import Link from "next/link"

const Logo = () => {
    return (
        <Link href="/" className="flex items-center gap-2.5 py-3 group">
            {/* Minimalist Tech Icon Box */}
            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm transition-transform duration-300 group-hover:scale-105">
                iP
            </div>
            {/* Clean Typography Frame */}
            {/* <span className="text-xl font-black text-slate-950 tracking-tight transition-colors duration-300 group-hover:text-slate-800">
                iPlug
            </span> */}
        </Link>
    )
}

export default Logo