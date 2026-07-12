import { Button } from "@/components/ui/button";
import { CustomDialog } from "../custom-dialog/CustomDialog";
import { ChevronLeft, ChevronRightIcon, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Image Preview Modal Component with Zoom
// Multi-Image Preview Modal Component
export default function MultiImagePreviewModal({ images, alt, initialIndex = 0, open, onClose }: {
    images: string[];
    alt: string;
    initialIndex?: number;
    open: boolean;
    onClose: () => void;
}) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const currentImage = images[currentIndex];
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < images.length - 1;

    const handlePrevious = () => {
        if (hasPrevious) {
            setCurrentIndex(currentIndex - 1);
            handleReset();
        }
    };

    const handleNext = () => {
        if (hasNext) {
            setCurrentIndex(currentIndex + 1);
            handleReset();
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const handleReset = () => {
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, currentIndex]);

    return (
        <CustomDialog
            title={`Image Preview (${currentIndex + 1} of ${images.length})`}
            description={alt}
            open={open}
            onOpenChange={onClose}
            contentWidth="max-w-5xl"
        >
            <div className="space-y-4">
                {/* Controls */}
                <div className="flex justify-center gap-2 pb-2 border-b flex-wrap">
                    <Button variant="outline" size="sm" onClick={handleZoomIn} className="gap-1">
                        Zoom In
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleZoomOut} className="gap-1">
                        Zoom Out
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRotate} className="gap-1">
                        Rotate
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
                        Reset
                    </Button>
                </div>

                {/* Main Image Container with Navigation */}
                <div className="relative">
                    {/* Left Navigation Arrow */}
                    {hasPrevious && (
                        <button
                            onClick={handlePrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {/* Right Navigation Arrow */}
                    {hasNext && (
                        <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                        >
                            <ChevronRightIcon size={24} />
                        </button>
                    )}

                    {/* Image Container */}
                    <div
                        className="relative flex justify-center items-center min-h-[400px] max-h-[60vh] overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-lg cursor-move"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <div
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                transition: isDragging ? 'none' : 'transform 0.2s ease',
                                cursor: isDragging ? 'grabbing' : 'grab',
                            }}
                        >
                            <img
                                src={currentImage}
                                alt={`${alt} - ${currentIndex + 1}`}
                                className="max-w-full max-h-[55vh] object-contain rounded-lg"
                                draggable={false}
                            />
                        </div>
                    </div>
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4 overflow-x-auto py-2">
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    handleReset();
                                }}
                                className={cn(
                                    "relative w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 transition-all",
                                    idx === currentIndex
                                        ? "border-orange-500 ring-2 ring-orange-500/50"
                                        : "border-zinc-200 dark:border-zinc-700 hover:border-orange-400"
                                )}
                            >
                                <img
                                    src={img}
                                    alt={`Thumbnail ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Info */}
                <div className="text-center text-sm text-muted-foreground">
                    <p>Image {currentIndex + 1} of {images.length} | Zoom: {Math.round(zoom * 100)}% | Click and drag to pan | Arrow keys to navigate</p>
                </div>
            </div>
        </CustomDialog>
    );
}
