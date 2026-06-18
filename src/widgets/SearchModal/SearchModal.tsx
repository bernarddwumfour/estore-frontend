// components/products/SearchModal.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from '@tanstack/react-query'
import {
    Search, X, Loader2, ArrowRight, Clock, Package,
    SlidersHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AdvancedFilters } from "../AdvancedFilters/AdvancedFilters"
import { useDebounce } from "@/app/lib/hooks/use-debounce"
import { endpoints } from "@/constants/endpoints/endpoints"
import unAuthenticatedAxios from "@/axios-instances/UnAuthenticatedAxios"

interface SearchResult {
    id: string
    title: string
    slug: string
    description: string
    min_price: number
    max_price: number
    has_stock: boolean
    average_rating: number
    total_reviews: number
    category?: {
        id: string
        name: string
        slug: string
    }
    default_variant?: {
        id: string
        images?: Array<{ url: string }>
    }
}

interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
    initialQuery?: string
}

// Types for stored recent searches
interface RecentSearchItem {
    product: SearchResult
    query: string
    timestamp: number
}

// API functions using unAuthenticatedAxios
const searchProducts = async (query: string) => {
    const params = new URLSearchParams({
        q: query,
        limit: '20'
    })

    const response = await unAuthenticatedAxios.get(`${endpoints.products.searchProducts}?${params.toString()}`)
    return {
        products: response.data.data.products || [],
        total: response.data.data.total || 0
    }
}

const fetchCategories = async () => {
    const response = await unAuthenticatedAxios.get(endpoints.products.listCategories)
    return response.data.data.categories || []
}

export function SearchModal({ isOpen, onClose, initialQuery = "" }: SearchModalProps) {
    const router = useRouter()
    const [query, setQuery] = useState(initialQuery)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([])
    const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)

    const debouncedQuery = useDebounce(query, 300)
    const inputRef = useRef<HTMLInputElement>(null)
    const resultsRef = useRef<HTMLDivElement>(null)

    // Load recent searches from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('recentProductSearches')
            if (saved) {
                setRecentSearches(JSON.parse(saved).slice(0, 5))
            }
        } catch (error) {
            console.error('Error loading recent searches:', error)
        }
    }, [])

    // Save recent searches to localStorage
    const saveRecentSearch = (product: SearchResult, query: string) => {
        try {
            const newSearch: RecentSearchItem = {
                product,
                query,
                timestamp: Date.now()
            }

            const filtered = recentSearches.filter(s => s.product.id !== product.id)
            const updated = [newSearch, ...filtered].slice(0, 5)
            setRecentSearches(updated)
            localStorage.setItem('recentProductSearches', JSON.stringify(updated))
        } catch (error) {
            console.error('Error saving recent search:', error)
        }
    }

    // Clear recent searches
    const clearRecentSearches = () => {
        setRecentSearches([])
        localStorage.removeItem('recentProductSearches')
    }

    // React Query for search
    const { data: searchData, isLoading, isFetching } = useQuery({
        queryKey: ['search', debouncedQuery],
        queryFn: () => searchProducts(debouncedQuery),
        enabled: debouncedQuery.length >= 2 && isOpen,
        staleTime: 0,
    })

    const results = searchData?.products || []
    const totalResults = searchData?.total || 0

    // React Query for categories (for the browse section)
    const { data: categories = [] } = useQuery({
        queryKey: ['search-modal-categories'],
        queryFn: fetchCategories,
        enabled: isOpen,
    })

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
            setFilterSidebarOpen(false)
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const totalItems = results.length + recentSearches.length

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex((prev) => Math.min(prev + 1, totalItems - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex((prev) => Math.max(prev - 1, -1))
        } else if (e.key === "Enter") {
            e.preventDefault()
            if (selectedIndex >= 0) {
                if (selectedIndex < results.length) {
                    const result = results[selectedIndex]
                    handleResultClick(result, query)
                } else {
                    const recentIndex = selectedIndex - results.length
                    const recent = recentSearches[recentIndex]
                    if (recent) {
                        handleRecentClick(recent)
                    }
                }
            } else if (query.trim().length >= 2) {
                handleViewAllResults(query)
            }
        } else if (e.key === "Escape") {
            if (filterSidebarOpen) {
                setFilterSidebarOpen(false)
            } else {
                onClose()
            }
        }
    }

    const handleResultClick = (result: SearchResult, searchQuery: string) => {
        saveRecentSearch(result, searchQuery)
        router.push(`/products/${result.slug}`)
        onClose()
    }

    const handleRecentClick = (recent: RecentSearchItem) => {
        router.push(`/products/${recent.product.slug}`)
        onClose()
    }

    const handleViewAllResults = (searchQuery: string) => {
        if (searchQuery.trim().length >= 2) {
            router.push(`/products?q=${encodeURIComponent(searchQuery)}`)
            onClose()
        }
    }

    const clearSearch = () => {
        setQuery("")
        setSelectedIndex(-1)
        inputRef.current?.focus()
    }

    const isLoadingData = isLoading || isFetching

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 z-[100] bg-white/98 backdrop-blur-md"
                role="dialog"
                aria-modal="true"
                aria-label="Search products"
            >
                <div className="mx-auto max-w-4xl px-4 pt-12 md:pt-28">
                    {/* Large Title */}
                    <div className="max-w-xl space-y-4 pb-6">
                        <h2 className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
                            Search through hundreds of products
                        </h2>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                            What are you <span className="text-slate-400">looking for?</span>
                        </h3>
                    </div>

                    {/* Search Input with Filter and Close buttons */}
                    <div className="flex items-center gap-2">
                        {/* Search Input */}
                        <div className="flex-1 flex items-center rounded-xl border border-slate-200 bg-white transition-all focus-within:border-slate-900 focus-within:shadow-md">
                            <Search className="ml-3 h-4 w-4 text-slate-400 flex-shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value)
                                    setSelectedIndex(-1)
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Search for products..."
                                className="w-full border-0 bg-transparent py-2.5 pl-2 pr-3 text-sm outline-none placeholder:text-slate-400"
                                aria-label="Search products"
                                autoComplete="off"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="mr-1.5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                                    aria-label="Clear search"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                            {isLoadingData && (
                                <Loader2 className="mr-3 h-4 w-4 animate-spin text-slate-400" />
                            )}
                        </div>

                        {/* Filter Button - Just opens the sidebar */}
                        {/* <button
                            type="button"
                            onClick={() => setFilterSidebarOpen(true)}
                            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-medium transition-all cursor-pointer flex-shrink-0 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
                            aria-label="Open filters"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            <span className="hidden sm:inline">Filters</span>
                        </button> */}

                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0"
                            aria-label="Close search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Search stats */}
                    {debouncedQuery.length >= 2 && !isLoadingData && (
                        <div className="mt-1.5 text-xs text-slate-500">
                            {results.length > 0
                                ? `${totalResults} product${totalResults > 1 ? 's' : ''} found`
                                : 'No products found'
                            }
                        </div>
                    )}

                    {/* Results / Suggestions */}
                    <div className="mt-4 max-h-[calc(100vh-280px)] overflow-y-auto" ref={resultsRef}>
                        {debouncedQuery.length >= 2 ? (
                            // Search Results
                            results.length > 0 ? (
                                <div className="space-y-1.5">
                                    {results.map((result: SearchResult, index: number) => (
                                        <button
                                            type="button"
                                            key={result.id}
                                            onClick={() => handleResultClick(result, query)}
                                            className={cn(
                                                "w-full flex items-center gap-3 rounded-lg p-2.5 text-left transition-all border cursor-pointer",
                                                index === selectedIndex
                                                    ? "border-slate-900 bg-slate-50 shadow-sm"
                                                    : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                                            )}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                        >
                                            {/* Product Image */}
                                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                                {result.default_variant?.images?.[0]?.url ? (
                                                    <img
                                                        src={result.default_variant.images[0].url}
                                                        alt={result.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-slate-200">
                                                        <Package className="h-6 w-6 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="font-medium text-sm text-slate-900 truncate">
                                                            {result.title}
                                                        </div>
                                                        {result.category && (
                                                            <div className="text-xs text-slate-500">
                                                                {result.category.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="font-semibold text-sm text-slate-900">
                                                            ${result.min_price.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-1 flex items-center gap-3">
                                                    {result.has_stock ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            In Stock
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-red-500">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                    {result.average_rating > 0 && (
                                                        <span className="text-xs text-slate-500">
                                                            ★ {result.average_rating.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}

                                    {/* View all results link */}
                                    {totalResults > results.length && (
                                        <button
                                            type="button"
                                            onClick={() => handleViewAllResults(query)}
                                            className="w-full text-center py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors border-t border-slate-100 mt-2"
                                        >
                                            View all {totalResults} results →
                                        </button>
                                    )}
                                </div>
                            ) : (
                                !isLoadingData && (
                                    <div className="text-center py-8">
                                        <Package className="mx-auto h-10 w-10 text-slate-300" />
                                        <p className="mt-2 text-sm text-slate-500">No products found</p>
                                        <p className="text-xs text-slate-400">
                                            Try adjusting your search terms
                                        </p>
                                    </div>
                                )
                            )
                        ) : (
                            // Recent Searches with Product Details
                            <div className="space-y-6">
                                {recentSearches.length > 0 ? (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                Recent Products
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={clearRecentSearches}
                                                className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                            >
                                                Clear all
                                            </button>
                                        </div>
                                        <div className="space-y-1.5">
                                            {recentSearches.map((recent, index) => {
                                                const itemIndex = results.length + index
                                                return (
                                                    <button
                                                        type="button"
                                                        key={recent.product.id}
                                                        onClick={() => handleRecentClick(recent)}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 rounded-lg p-2.5 text-left transition-all border cursor-pointer",
                                                            itemIndex === selectedIndex
                                                                ? "border-slate-900 bg-slate-50 shadow-sm"
                                                                : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                                                        )}
                                                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                                                    >
                                                        {/* Product Image */}
                                                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                                            {recent.product.default_variant?.images?.[0]?.url ? (
                                                                <img
                                                                    src={recent.product.default_variant.images[0].url}
                                                                    alt={recent.product.title}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center bg-slate-200">
                                                                    <Package className="h-6 w-6 text-slate-400" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Product Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <div className="font-medium text-sm text-slate-900 truncate">
                                                                        {recent.product.title}
                                                                    </div>
                                                                    {recent.product.category && (
                                                                        <div className="text-xs text-slate-500">
                                                                            {recent.product.category.name}
                                                                        </div>
                                                                    )}
                                                                    {recent.query && (
                                                                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                                            <Search className="h-2.5 w-2.5" />
                                                                            Searched for "{recent.query}"
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    <div className="font-semibold text-sm text-slate-900">
                                                                        ${recent.product.min_price.toFixed(2)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-1 flex items-center gap-3">
                                                                {recent.product.has_stock ? (
                                                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                        In Stock
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 text-xs text-red-500">
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                                        Out of Stock
                                                                    </span>
                                                                )}
                                                                {recent.product.average_rating > 0 && (
                                                                    <span className="text-xs text-slate-500">
                                                                        ★ {recent.product.average_rating.toFixed(1)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    // No recent searches - show categories as pill/chip buttons
                                    <div>
                                        <h3 className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-3">
                                            <Package className="h-3.5 w-3.5" />
                                            Browse Categories
                                        </h3>

                                        <div className="flex flex-wrap items-center justify-start gap-2.5">
                                            <Link href="/products" scroll={false} onClick={onClose}>
                                                <span className="inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer border bg-slate-950 border-slate-950 text-white shadow-sm">
                                                    All
                                                </span>
                                            </Link>

                                            {categories.slice(0, 12).map((category: any) => (
                                                <Link
                                                    key={category.id}
                                                    href={`/products?category=${category.slug}`}
                                                    scroll={false}
                                                    onClick={onClose}
                                                >
                                                    <span className="inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer border bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900">
                                                        {category.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-100">
                                            <Link
                                                href="/products"
                                                onClick={onClose}
                                                className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors group"
                                            >
                                                Browse all products
                                                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Keyboard shortcuts hint */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-3 text-[14px] text-slate-400">
                        <span>↑↓ to navigate</span>
                        <span>•</span>
                        <span>Enter to select</span>
                        <span>•</span>
                        <span>Esc to close</span>
                        <span>•</span>
                        <span>⌘K to open</span>
                    </div>
                </div>
            </div>

            {/* Filter Sidebar - AdvancedFilters is COMPLETELY INDEPENDENT */}
            {/* <div className={cn(
                "fixed inset-0 z-[101] transition-all duration-300",
                filterSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <div
                    className="absolute inset-0 bg-black/20"
                    onClick={() => setFilterSidebarOpen(false)}
                />

                <div className={cn(
                    "absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 overflow-y-auto",
                    filterSidebarOpen ? "translate-x-0" : "translate-x-full"
                )}>
                    <div className="p-4">
                        <AdvancedFilters
                            onClose={() => setFilterSidebarOpen(false)}
                            isModal={true}
                            showSort={true}
                            className="h-full"
                        />
                    </div>
                </div>
            </div> */}
        </>
    )
}