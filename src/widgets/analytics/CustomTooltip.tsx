'use client';

/** Shared recharts tooltip — was duplicated byte-for-byte across the three dashboard analytics pages. */
export const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-3">
                <p className="text-gray-900 dark:text-white font-medium text-sm mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {formatter ? formatter(entry.value) : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};
