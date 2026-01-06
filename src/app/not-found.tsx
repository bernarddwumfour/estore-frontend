import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const NotFound = () => {
    return (
        <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8 min-h-screen my-auto">
            <div className="text-center">
                <p className="text-base font-semibold text-indigo-400">404</p>
                <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-7xl">Not Found</h1>
                <p className="mt-6 text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">Sorry, we couldn’t find the page you’re looking for.</p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Button asChild>
                        <Link href="/">
                            Go Back Home
                        </Link>

                    </Button >
                    <Button asChild variant={"ghost"}>
                        <Link href="/contact">
                            Contact support
                        </Link>

                    </Button>

                </div>
            </div>
        </main>
    )
}

export default NotFound