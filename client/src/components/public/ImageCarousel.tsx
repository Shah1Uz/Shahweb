import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface CarouselItem {
  url: string;
  caption?: string | null;
  link?: string | null;
}

interface ImageCarouselProps {
  images: CarouselItem[] | string[];
  autoplay?: boolean;
  interval?: number;
  showThumbnails?: boolean;
  className?: string;
  aspectRatio?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  autoplay = false,
  interval = 4000,
  showThumbnails = true,
  className = '',
  aspectRatio = 'aspect-video',
}) => {
  const normalizedImages: CarouselItem[] = images.map((img) =>
    typeof img === 'string' ? { url: img } : img
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const length = normalizedImages.length;

  useEffect(() => {
    if (!autoplay || length <= 1) return;
    timerRef.current = setInterval(() => {
      handleNext();
    }, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, autoplay, interval, length]);

  if (length === 0) return null;

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + length) % length);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const current = normalizedImages[currentIndex];

  return (
    <div className={`relative flex flex-col gap-3 ${className}`}>
      {/* Main Image Frame */}
      <div className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden bg-gray-950 border border-white/10 group`}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={current.url}
            alt={current.caption || `Image ${currentIndex + 1}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Caption Overlay */}
        {current.caption && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-10">
            <p className="text-xs md:text-sm text-gray-200 font-medium">{current.caption}</p>
          </div>
        )}

        {/* Fullscreen zoom button */}
        <button
          onClick={() => setFullscreenImage(current.url)}
          className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white/80 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
          title="Expand image"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Prev / Next Controls */}
        {length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md border border-[#343636]">
              {normalizedImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentIndex ? 1 : -1);
                    setCurrentIndex(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-[#d6f779] w-5' : 'bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails row */}
      {showThumbnails && length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {normalizedImages.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === currentIndex
                  ? 'border-[#d6f779] ring-2 ring-[#d6f779]/30'
                  : 'border-[#343636] opacity-50 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {fullscreenImage && (
        <div
          onClick={() => setFullscreenImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={fullscreenImage}
            alt="Fullscreen"
            className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
