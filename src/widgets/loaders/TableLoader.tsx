"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";


export default function TableLoader({ message }: { message?: string }) {
    return (

        <div>
            <div className="flex mt-6 justify-end items-center">
                <Skeleton className="h-10 w-32 rounded-md bg-gray-200 dark:bg-sidebar/70" />
            </div>

            <Card className="mt-6">
                <CardContent>
                    <div className="space-y-4">
                        {/* Table Header */}
                        <div className="grid grid-cols-4 gap-4 pb-2 border-b py-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-4 w-20" />
                            ))}
                        </div>
                        {/* Table Rows */}
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="grid grid-cols-4 gap-4 py-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-sidebar/70" />
                        <div className="flex space-x-2">
                            <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-sidebar/70" />
                            <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-sidebar/70" />
                            <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-sidebar/70" />
                            <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-sidebar/70" />
                            <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-sidebar/70" />
                            <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-sidebar/70" />
                            <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-sidebar/70" />

                        </div>
                    </div>
        </div>
    );
}