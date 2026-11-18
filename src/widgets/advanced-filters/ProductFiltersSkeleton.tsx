export default function ProductFiltersSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse space-y-5 rounded-lg border border-gray-200 bg-white p-4"
    >
      <div className="h-5 w-28 rounded bg-gray-200" />
      {["Category", "Brand", "Price range", "Availability"].map((label) => (
        <div key={label} className="space-y-2">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-10 w-full rounded-md bg-gray-100" />
        </div>
      ))}
      <div className="h-9 w-full rounded-md bg-gray-200" />
    </div>
  );
}
