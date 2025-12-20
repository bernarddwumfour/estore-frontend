"use client"
export default function Spinner({size,white=false}:{size:"xs"|"sm"|"md"|"lg",white?:boolean}) {
  return (
    <div
    className={`inline-block ${size === "xs" ? "w-3 h3" : size==="sm"?"w-4 h-4":size === "md" ? "w-8 h-8" :"w-12 h-12"} animate-spin rounded-full border-2 border-solid ${white ?"border-white":"border-primary"} border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1s_linear_infinite]`}
    role="status">
    <span
      className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
    >Loading...</span>
  </div>
  );
}