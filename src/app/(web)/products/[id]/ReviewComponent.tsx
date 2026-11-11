"use client"
import { storefrontTheme } from '@/templates/storefront-theme'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CreateReviewForm from '../(components)/ProductReviewForm'
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import Link from "next/link";

const ReviewComponent = ({ slug, title }: { slug: string, title?: string }) => {
    const { user } = useAuth()
    return (
        <>

            {!user?.id ?
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className={storefrontTheme === "beauty-surface" ? "rounded-none bg-[#20201e] text-white hover:bg-[#4e4034]" : storefrontTheme === "furniture-surface" ? "rounded-full bg-[#654035] text-white hover:bg-[#503027]" : undefined}>
                            <PenLine className="h-4 w-4 mr-2" />
                            Write a Review
                        </Button>
                    </DialogTrigger>
                    <DialogContent data-storefront-theme={storefrontTheme} className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                        <DialogHeader>
                            <DialogTitle>Login Required</DialogTitle>
                            <DialogDescription>
                                {title
                                    ? `You need to be logged in to add  review for "${title}"`
                                    : 'You need to be logged in to add reviews to items.'
                                }
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <p className="text-sm text-gray-600">
                                Create an account or login to save items to your wishlist, track your favorites, and get personalized recommendations.
                            </p>
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                            <DialogClose>

                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"

                                >
                                    Continue Browsing
                                </Button>
                            </DialogClose>
                            <Button
                                asChild
                                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                            >
                                <Link href="/signup">
                                    Create Account
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="secondary"
                                className="w-full sm:w-auto"
                            >
                                <Link href="/login">
                                    Login
                                </Link>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                :

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className={storefrontTheme === "beauty-surface" ? "rounded-none bg-[#20201e] text-white hover:bg-[#4e4034]" : storefrontTheme === "furniture-surface" ? "rounded-full bg-[#654035] text-white hover:bg-[#503027]" : undefined}>
                            <PenLine className="h-4 w-4 mr-2" />
                            Write a Review
                        </Button>
                    </DialogTrigger>
                    <DialogContent data-storefront-theme={storefrontTheme} className="sm:max-w-[600px] max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">

                        <CreateReviewForm
                            productSlug={slug}
                            productTitle={title}

                        />
                    </DialogContent>
                </Dialog>
            }

        </>
    )
}

export default ReviewComponent