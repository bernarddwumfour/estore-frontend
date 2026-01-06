'use client';

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from 'next/navigation';

interface StatusFilterProps {
  currentStatus: string;
}

export default function StatusFilter({ currentStatus }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statuses = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    
    // Reset to page 1 when changing filter
    params.set('page', '1');
    
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-10 flex flex-wrap gap-3">
      {statuses.map(({ value, label }) => (
        <Button
          key={value}
          variant={currentStatus === value ? "default" : "outline"}
          onClick={() => handleStatusChange(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}