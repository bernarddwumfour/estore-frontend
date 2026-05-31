'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';

interface Variant {
    id: string;
    sku: string;
    price: number;
    stock: number;
    attributes: Record<string, string>;
    product: {
        id: string;
        title: string;
    };
}

interface VariantSelectorProps {
    onSelect: (variant: Variant) => void;
    onClose: () => void;
}

const fetchVariants = async (search?: string): Promise<Variant[]> => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    queryParams.append('limit', '50');
    const response = await securityAxios.get(`${endpoints.products.listVariants}?${queryParams.toString()}`);
    return response.data.data?.variants || [];
};

export default function VariantSelector({ onSelect, onClose }: VariantSelectorProps) {
    const [search, setSearch] = useState('');
    const { data: variants, isLoading } = useQuery({
        queryKey: ['variants-selector', search],
        queryFn: () => fetchVariants(search),
    });

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                    placeholder="Search by SKU or product title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
                {isLoading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : variants?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No variants found</div>
                ) : (
                    variants?.map((variant) => (
                        <div
                            key={variant.id}
                            className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={() => onSelect(variant)}
                        >
                            <div>
                                <p className="font-medium">{variant.product.title}</p>
                                <p className="text-sm text-gray-500">SKU: {variant.sku}</p>
                                <div className="flex gap-2 mt-1">
                                    {Object.entries(variant.attributes).map(([key, val]) => (
                                        <span key={key} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                            {key}: {val}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">${variant.price.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">Stock: {variant.stock}</p>
                                <Button size="sm" variant="ghost" className="mt-1">
                                    <Plus size={14} className="mr-1" />
                                    Add
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );
}