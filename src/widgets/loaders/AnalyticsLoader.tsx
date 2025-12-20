import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AnalyticsLoader() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 p-6 space-y-6">

                {/* Date Range Picker
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-64 rounded-md" />
                </div> */}

                {/* Key Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card className="shadow-sm" key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4 rounded" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-20 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <Skeleton className="h-9 w-24 rounded-md" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Chart Legend */}
                            <div className="flex space-x-6">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <Skeleton className="h-3 w-3 rounded-full" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                            {/* Chart Area */}
                            <div className="h-80 w-full relative">
                                <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div key={i} className="flex flex-col items-center space-y-2">
                                            <Skeleton
                                                className="w-8 bg-muted animate-pulse"
                                                style={{ height: `${Math.random() * 200 + 50}px` }}
                                            />
                                            <Skeleton className="h-3 w-6" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </main>
        </div>
    )
}
