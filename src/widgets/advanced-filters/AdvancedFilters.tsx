// components/advanced-filters/AdvancedFilters.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from '@tanstack/react-query'
import {
    SlidersHorizontal, X, ChevronDown, ChevronUp, RotateCcw,
    Filter
} from "lucide-react"
import { storefrontTheme } from "@/templates/storefront-theme"
import { filterThemeClasses as cn } from "@/templates/filter-theme"
import { CustomSelect, selectField } from "../custom-select/CustomSelect"
import { endpoints } from "@/constants/endpoints/endpoints"
import unAuthenticatedAxios from "@/axios-instances/UnAuthenticatedAxios"

export interface FilterState {
    category?: string
    brand?: string
    min_price?: number
    max_price?: number
    in_stock?: boolean
    featured?: boolean
    bestseller?: boolean
    new?: boolean
    sort_by?: string
    sort_order?: string
    q?: string
}

interface AdvancedFiltersProps {
    className?: string
    showSort?: boolean
}

// API functions using unAuthenticatedAxios
const fetchCategories = async () => {
    const response = await unAuthenticatedAxios.get(endpoints.products.listCategories)
    return response.data.data.categories || []
}

const fetchBrands = async () => {
    try {
        const response = await unAuthenticatedAxios.get(endpoints.products.listBrands)
        return response.data.data.brands || []
    } catch {
        return []
    }
}

// Hoisted to module scope (not defined inside AdvancedFilters) so their
// component identity stays stable across renders — otherwise every keystroke
// in a controlled input (e.g. price) triggers a parent re-render that hands
// React a brand-new function reference, which it treats as a different
// component type and remounts, dropping focus.
function FilterSection({
    id, title, children, isOpen, onToggle
}: {
    id: string
    title: string
    children: React.ReactNode
    isOpen: boolean
    onToggle: (id: string) => void
}) {
    return (
        <div className={cn("border-b border-slate-100 py-4 last:border-0")} >
            <button
                type="button"
                onClick={() => onToggle(id)}
                className={cn("flex w-full items-center justify-between text-sm font-medium text-slate-900 hover:text-slate-700 transition-colors cursor-pointer")}
            >
                <span>{title}</span>
                {isOpen ? (
                    <ChevronUp className={cn("h-4 w-4 text-slate-400 flex-shrink-0")}  />
                ) : (
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 flex-shrink-0")}  />
                )}
            </button>
            {isOpen && <div className={cn("mt-3 space-y-3")} >{children}</div>}
        </div>
    )
}

function FilterButton({
    onClick, hasActiveFilters, activeFilterCount, className
}: {
    onClick: () => void
    hasActiveFilters: boolean
    activeFilterCount: number
    className?: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer text-sm",
                hasActiveFilters
                    ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                className
            )}
            aria-label="Open filters"
        >
            <SlidersHorizontal className={cn("h-4 w-4")}  />
            <span>Filter</span>
            {hasActiveFilters && (
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white font-medium")} >
                    {activeFilterCount}
                </span>
            )}
        </button>
    )
}

function StandaloneFilters({
    className, hasActiveFilters, activeFilterCount, activeFilterSummary,
    onOpenModal, onClearAll, filterContent, actionButtons
}: {
    className?: string
    hasActiveFilters: boolean
    activeFilterCount: number
    activeFilterSummary: string[]
    onOpenModal: () => void
    onClearAll: () => void
    filterContent: React.ReactNode
    actionButtons: React.ReactNode
}) {
    return (
        <div className={cn("space-y-2", className)}>
            {/* Header with filter button and clear */}
            <div className={cn("flex items-center justify-between pb-4 border-b border-slate-100")} >
                <div className={cn("flex items-center gap-3")} >
                    <FilterButton onClick={onOpenModal} hasActiveFilters={hasActiveFilters} activeFilterCount={activeFilterCount} />
                </div>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClearAll}
                        className={cn("flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer")}
                    >
                        <RotateCcw className={cn("h-3 w-3")}  />
                        Clear all
                    </button>
                )}
            </div>

            {/* Active filters summary */}
            {hasActiveFilters && (
                <div className={cn("flex flex-wrap gap-1.5 pb-2")} >
                    {activeFilterSummary.map((filter, index) => (
                        <span
                            key={index}
                            className={cn("inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700")}
                        >
                            {filter}
                        </span>
                    ))}
                </div>
            )}

            {/* Filter content */}
            {filterContent}
            {actionButtons}
        </div>
    )
}

export function AdvancedFilters({
    className,
    showSort = true
}: AdvancedFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Fetch categories and brands independently
    const { data: categories = [], isLoading: isLoadingCategories, isError: categoriesError } = useQuery({
        queryKey: ['advanced-filters-categories'],
        queryFn: fetchCategories,
        staleTime: 5 * 60 * 1000,
    })

    const { data: brands = [] } = useQuery({
        queryKey: ['advanced-filters-brands'],
        queryFn: fetchBrands,
        staleTime: 5 * 60 * 1000,
    })

    // Get filters from URL
    const getFiltersFromURL = useCallback((): FilterState => {
        return {
            category: searchParams.get("category") || undefined,
            brand: searchParams.get("brand") || undefined,
            min_price: searchParams.get("min_price") ? parseFloat(searchParams.get("min_price")!) : undefined,
            max_price: searchParams.get("max_price") ? parseFloat(searchParams.get("max_price")!) : undefined,
            in_stock: searchParams.get("in_stock") === "true" ? true : undefined,
            featured: searchParams.get("featured") === "true" ? true : undefined,
            bestseller: searchParams.get("bestseller") === "true" ? true : undefined,
            new: searchParams.get("new") === "true" ? true : undefined,
            sort_by: searchParams.get("sort_by") || "created_at",
            sort_order: searchParams.get("sort_order") || "desc",
            q: searchParams.get("q") || undefined,
        }
    }, [searchParams])

    // Applied filters (from URL) - these are the ones actually active
    const [appliedFilters, setAppliedFilters] = useState<FilterState>(getFiltersFromURL())

    // Temporary filters (user is changing these)
    const [tempFilters, setTempFilters] = useState<FilterState>(getFiltersFromURL())

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        sort: showSort,
        category: true,
        brand: true,
        price: true,
        availability: true,
        tags: true,
    })

    // Local state for number inputs to prevent focus loss
    const [minPriceInput, setMinPriceInput] = useState<string>(tempFilters.min_price?.toString() || "")
    const [maxPriceInput, setMaxPriceInput] = useState<string>(tempFilters.max_price?.toString() || "")

    // Update local input state when tempFilters change
    useEffect(() => {
        setMinPriceInput(tempFilters.min_price?.toString() || "")
        setMaxPriceInput(tempFilters.max_price?.toString() || "")
    }, [tempFilters.min_price, tempFilters.max_price])

    // Update when URL changes
    useEffect(() => {
        const urlFilters = getFiltersFromURL()
        setAppliedFilters(urlFilters)
        setTempFilters(urlFilters)
    }, [searchParams, getFiltersFromURL])

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    // Apply filters - this is called only when the Apply button is clicked
    const handleApplyFilters = () => {
        setAppliedFilters(tempFilters)
        const params = new URLSearchParams()
        Object.entries(tempFilters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "" && v !== "created_at" && v !== "desc") {
                params.set(k, String(v))
            }
        })
        if (searchParams.get("display") === "variants") {
            params.set("display", "variants")
        }
        const url = `/products${params.toString() ? `?${params.toString()}` : ''}`
        router.push(url)
        setIsModalOpen(false)
    }

    // Update temporary filter (does NOT apply)
    const updateTempFilter = (key: keyof FilterState, value: any) => {
        setTempFilters(prev => ({ ...prev, [key]: value }))
    }

    // Handle number input change without losing focus
    const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setMinPriceInput(value)
        const numValue = value === '' ? undefined : parseFloat(value)
        updateTempFilter('min_price', numValue)
    }

    const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setMaxPriceInput(value)
        const numValue = value === '' ? undefined : parseFloat(value)
        updateTempFilter('max_price', numValue)
    }

    // Clear all temporary filters
    const clearAllTempFilters = () => {
        const cleared: FilterState = {
            sort_by: tempFilters.sort_by || "created_at",
            sort_order: tempFilters.sort_order || "desc"
        }
        setTempFilters(cleared)
        setMinPriceInput("")
        setMaxPriceInput("")
    }

    // Clear all applied filters
    const clearAllAppliedFilters = () => {
        const cleared: FilterState = {
            sort_by: "created_at",
            sort_order: "desc"
        }
        setAppliedFilters(cleared)
        setTempFilters(cleared)
        setMinPriceInput("")
        setMaxPriceInput("")
        router.push("/products")
        setIsModalOpen(false)
    }

    // Check if there are any applied filters
    const hasActiveFilters = Object.entries(appliedFilters).some(
        ([key, value]) =>
            value !== undefined &&
            value !== null &&
            value !== "" &&
            key !== "sort_by" &&
            key !== "sort_order" &&
            key !== "q"
    )

    // Check if temp filters have changed from applied
    const hasChanges = JSON.stringify(tempFilters) !== JSON.stringify(appliedFilters)

    const getActiveFilterCount = () => {
        return Object.entries(appliedFilters).filter(
            ([key, value]) =>
                value !== undefined &&
                value !== null &&
                value !== "" &&
                key !== "sort_by" &&
                key !== "sort_order" &&
                key !== "q"
        ).length
    }

    const getActiveFilterSummary = () => {
        const activeFilters: string[] = []
        Object.entries(appliedFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "" &&
                key !== "sort_by" && key !== "sort_order" && key !== "q") {
                const label = key.replace('_', ' ')
                activeFilters.push(`${label}: ${typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}`)
            }
        })
        return activeFilters
    }

    // Prepare select items
    const sortItems: selectField[] = [
        { id: "created_at", label: "Newest", value: "created_at" },
        { id: "price_asc", label: "Price: Low to High", value: "price_asc" },
        { id: "price_desc", label: "Price: High to Low", value: "price_desc" },
        { id: "name_asc", label: "Name: A to Z", value: "name_asc" },
        { id: "name_desc", label: "Name: Z to A", value: "name_desc" },
        { id: "rating", label: "Highest Rated", value: "rating" },
    ]

    const categoryItems: selectField[] = [
        { id: "all", label: "All Categories", value: "" },
        ...categories.map((cat: any) => ({
            id: cat.id,
            label: cat.name,
            value: cat.slug
        }))
    ]

    const brandItems: selectField[] = [
        { id: "all", label: "All Brands", value: "" },
        ...brands.map((brand: string, index: number) => ({
            id: `brand-${index}`,
            label: brand,
            value: brand
        }))
    ]

    const getCurrentSort = (): selectField | undefined => {
        return sortItems.find(item => item.value === tempFilters.sort_by) || sortItems[0]
    }

    const getCurrentCategory = (): selectField | undefined => {
        if (!tempFilters.category) return categoryItems[0]
        return categoryItems.find(item => item.value === tempFilters.category) || categoryItems[0]
    }

    const getCurrentBrand = (): selectField | undefined => {
        if (!tempFilters.brand) return brandItems[0]
        return brandItems.find(item => item.value === tempFilters.brand) || brandItems[0]
    }

    // Filter content
    const filterContent = (
        <>
            {/* Sort */}
            {showSort && (
                <FilterSection id="sort" title="Sort By" isOpen={expandedSections.sort ?? true} onToggle={toggleSection}>
                    <CustomSelect theme={storefrontTheme}
                        items={sortItems}
                        selectField={getCurrentSort()}
                        onValueChange={(item) => updateTempFilter("sort_by", item.value)}
                        placeholder="Select sort option"
                    />
                </FilterSection>
            )}

            {/* Category */}
            <FilterSection id="category" title="Category" isOpen={expandedSections.category ?? true} onToggle={toggleSection}>
                {categories.length > 0 ? (
                    <CustomSelect theme={storefrontTheme}
                        items={categoryItems}
                        selectField={getCurrentCategory()}
                        onValueChange={(item) => updateTempFilter("category", item.value || undefined)}
                        placeholder="Select category"
                    />
                ) : <p className={cn("text-xs text-slate-500")} >{isLoadingCategories ? "Loading categories..." : categoriesError ? "Categories are unavailable right now." : "No categories available yet."}</p>}
            </FilterSection>

            {/* Brand */}
            {brands.length > 0 && (
                <FilterSection id="brand" title="Brand" isOpen={expandedSections.brand ?? true} onToggle={toggleSection}>
                    <CustomSelect theme={storefrontTheme}
                        items={brandItems}
                        selectField={getCurrentBrand()}
                        onValueChange={(item) => updateTempFilter("brand", item.value || undefined)}
                        placeholder="Select brand"
                    />
                </FilterSection>
            )}

            {/* Price Range */}
            <FilterSection id="price" title="Price Range" isOpen={expandedSections.price ?? true} onToggle={toggleSection}>
                <div className={cn("space-y-4")} >
                    <div className={cn("flex items-center gap-3")} >
                        <div className={cn("flex-1")} >
                            <label className={cn("text-xs text-slate-500 block mb-1")} >Min</label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={minPriceInput}
                                onChange={handleMinPriceChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        const maxInput = document.querySelector('input[placeholder="$1000"]') as HTMLInputElement
                                        maxInput?.focus()
                                    }
                                }}
                                placeholder="$0"
                                className={cn("w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all")}
                            />
                        </div>
                        <span className={cn("text-slate-400 mt-4")} >-</span>
                        <div className={cn("flex-1")} >
                            <label className={cn("text-xs text-slate-500 block mb-1")} >Max</label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={maxPriceInput}
                                onChange={handleMaxPriceChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleApplyFilters()
                                    }
                                }}
                                placeholder="$1000"
                                className={cn("w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all")}
                            />
                        </div>
                    </div>
                </div>
            </FilterSection>

            {/* Availability */}
            <FilterSection id="availability" title="Availability" isOpen={expandedSections.availability ?? true} onToggle={toggleSection}>
                <div className={cn("flex items-center justify-between")} >
                    <label className={cn("text-sm cursor-pointer select-none")} >In Stock Only</label>
                    <button
                        type="button"
                        onClick={() => updateTempFilter("in_stock", !tempFilters.in_stock || undefined)}
                        className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
                            tempFilters.in_stock ? "bg-slate-900" : "bg-slate-200"
                        )}
                        role="switch"
                        aria-checked={tempFilters.in_stock || false}
                    >
                        <span className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            tempFilters.in_stock ? "translate-x-6" : "translate-x-1"
                        )} />
                    </button>
                </div>
            </FilterSection>

            {/* Product Tags */}
            <FilterSection id="tags" title="Product Tags" isOpen={expandedSections.tags ?? true} onToggle={toggleSection}>
                <div className={cn("space-y-4")} >
                    {[
                        { key: "featured" as const, label: "Featured" },
                        { key: "bestseller" as const, label: "Bestseller" },
                        { key: "new" as const, label: "New Arrivals" },
                    ].map(({ key, label }) => (
                        <div key={key} className={cn("flex items-center justify-between")} >
                            <label className={cn("text-sm cursor-pointer select-none")} >{label}</label>
                            <button
                                type="button"
                                onClick={() => updateTempFilter(key, !tempFilters[key] || undefined)}
                                className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
                                    tempFilters[key] ? "bg-slate-900" : "bg-slate-200"
                                )}
                                role="switch"
                                aria-checked={tempFilters[key] || false}
                            >
                                <span className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                    tempFilters[key] ? "translate-x-6" : "translate-x-1"
                                )} />
                            </button>
                        </div>
                    ))}
                </div>
            </FilterSection>
        </>
    )

    // Action buttons
    const actionButtons = (
        <div className={cn("flex gap-3 pt-4 border-t border-slate-100")} >
            <button
                type="button"
                onClick={clearAllTempFilters}
                className={cn("flex-1 py-2.5 border border-slate-200 hover:border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer")}
            >
                Clear
            </button>
            <button
                type="button"
                onClick={handleApplyFilters}
                disabled={!hasChanges}
                className={cn(
                    "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    hasChanges
                        ? "bg-slate-900 hover:bg-slate-800 text-white"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
            >
                Apply Filters
            </button>
        </div>
    )

    return (
        <div data-filter-theme={storefrontTheme} className={cn("contents")} >
            {/* Desktop: Show standalone with all filters */}
            <div className={cn("hidden lg:block")} >
                <StandaloneFilters
                    className={className}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={getActiveFilterCount()}
                    activeFilterSummary={getActiveFilterSummary()}
                    onOpenModal={() => setIsModalOpen(true)}
                    onClearAll={clearAllAppliedFilters}
                    filterContent={filterContent}
                    actionButtons={actionButtons}
                />
            </div>

            {/* Mobile: Show only the filter button */}
            <div className={cn("lg:hidden flex gap-3 justify-between mx-6")} >
                <FilterButton onClick={() => setIsModalOpen(true)} hasActiveFilters={hasActiveFilters} activeFilterCount={getActiveFilterCount()} />
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={clearAllAppliedFilters}
                        className={cn("flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex-none px-3")}
                    >
                        <RotateCcw className={cn("h-3 w-3")}  />
                        Clear all
                    </button>
                )}
            </div>

            {/* Mobile Modal */}
            {isModalOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className={cn("fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm lg:hidden")}
                        onClick={() => setIsModalOpen(false)}
                    />

                    {/* Modal */}
                    <div className={cn("fixed inset-0 z-[101] flex items-center justify-center p-4 lg:hidden")} >
                        <div className={cn("relative w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto")} >
                            {/* Header */}
                            <div className={cn("sticky top-0 z-10 flex items-center justify-between p-4 border-b border-slate-100 bg-white rounded-t-2xl")} >
                                <div className={cn("flex items-center gap-2")} >
                                    <Filter className={cn("h-4 w-4 text-slate-500")}  />
                                    <h3 className={cn("font-semibold text-slate-900")} >Filters</h3>
                                    {hasActiveFilters && (
                                        <span className={cn("ml-1 rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white")} >
                                            {getActiveFilterCount()}
                                        </span>
                                    )}
                                </div>
                                <div className={cn("flex items-center gap-12")} >
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={clearAllAppliedFilters}
                                            className={cn("flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer")}
                                        >
                                            <RotateCcw className={cn("h-3 w-3")}  />
                                            Clear all
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className={cn("rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors")}
                                        aria-label="Close filters"
                                    >
                                        <X className={cn("h-4 w-4")}  />
                                    </button>
                                </div>
                            </div>

                            {/* Active filters summary */}
                            {hasActiveFilters && (
                                <div className={cn("flex flex-wrap gap-1.5 p-4 pb-2")} >
                                    {getActiveFilterSummary().map((filter, index) => (
                                        <span
                                            key={index}
                                            className={cn("inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700")}
                                        >
                                            {filter}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Filter content */}
                            <div className={cn("p-4 pt-2")} >
                                {filterContent}
                                {actionButtons}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
