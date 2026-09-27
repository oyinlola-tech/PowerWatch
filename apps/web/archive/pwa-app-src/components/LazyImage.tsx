// components/LazyImage.tsx
import { useState, useEffect, useRef } from "react";

const LazyImage = ({ 
  src, 
  alt, 
  className = ""
}: { 
  src: string; 
  alt: string; 
  className?: string;
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {(!isLoaded || !isInView) && (
        <div className={`absolute inset-0 animate-pulse bg-gray-200 ${className}`}>
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 sm:h-10 sm:w-10 animate-spin rounded-full border-3 border-[#0663EA] border-t-transparent" />
          </div>
        </div>
      )}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        className={`h-full w-full object-cover transition-opacity duration-700 ${
          isLoaded && isInView ? "opacity-100" : "opacity-0"
        } ${className}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
      />
    </>
  );
};

export default LazyImage;