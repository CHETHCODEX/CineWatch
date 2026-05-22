"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export interface GalleryMovie {
  title: string;
  year: string;
  rating: number;
  genre: string;
  image: string;
  overview: string;
}

interface CircularGalleryProps {
  items?: GalleryMovie[];
  /** Distance from center in pixels */
  radius?: number;
  /** Auto-rotation speed (degrees per frame) */
  autoRotateSpeed?: number;
  className?: string;
}

// =============================================================================
// Default trending movie data
// =============================================================================

const DEFAULT_TRENDING: GalleryMovie[] = [
  {
    title: "Dune: Part Two",
    year: "2024",
    rating: 8.3,
    genre: "Sci-Fi",
    image: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    overview: "Paul Atreides unites with the Fremen to seek revenge against those who destroyed his family.",
  },
  {
    title: "Oppenheimer",
    year: "2023",
    rating: 8.5,
    genre: "Drama",
    image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    overview: "The story of J. Robert Oppenheimer and the creation of the atomic bomb.",
  },
  {
    title: "Everything Everywhere",
    year: "2022",
    rating: 7.8,
    genre: "Sci-Fi",
    image: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb6.jpg",
    overview: "A middle-aged Chinese immigrant is swept up into an insane adventure across the multiverse.",
  },
  {
    title: "The Batman",
    year: "2022",
    rating: 7.7,
    genre: "Action",
    image: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    overview: "Batman ventures into Gotham's underworld to unmask the sadistic serial killer.",
  },
  {
    title: "Top Gun: Maverick",
    year: "2022",
    rating: 8.2,
    genre: "Action",
    image: "https://image.tmdb.org/t/p/w500/62HCnUTziyWQpYd3aScuCP0Wbkn.jpg",
    overview: "After more than thirty years of service, Pete Mitchell is where he belongs.",
  },
  {
    title: "Parasite",
    year: "2019",
    rating: 8.5,
    genre: "Thriller",
    image: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between two families.",
  },
  {
    title: "Spider-Man: No Way Home",
    year: "2021",
    rating: 8.2,
    genre: "Action",
    image: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    overview: "Peter Parker's identity is revealed, wreaking havoc on his life.",
  },
  {
    title: "Joker",
    year: "2019",
    rating: 8.4,
    genre: "Crime",
    image: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    overview: "A failed comedian descends into insanity in Gotham City.",
  },
  {
    title: "1917",
    year: "2019",
    rating: 8.3,
    genre: "War",
    image: "https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg",
    overview: "Two young British soldiers must cross enemy territory to deliver a life-saving message.",
  },
  {
    title: "Interstellar",
    year: "2014",
    rating: 8.6,
    genre: "Sci-Fi",
    image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    overview: "Explorers travel through a wormhole in space to ensure humanity's survival.",
  },
];

// =============================================================================
// CircularGallery Component
// =============================================================================

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  (
    {
      items = DEFAULT_TRENDING,
      className,
      radius = 550,
      autoRotateSpeed = 0.08,
      ...props
    },
    ref
  ) => {
    const [rotation, setRotation] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [windowWidth, setWindowWidth] = useState<number>(1200);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    const anglePerItem = 360 / items.length;

    // --- Dynamic Sizing for Responsiveness ---
    useEffect(() => {
      if (typeof window === "undefined") return;
      setWindowWidth(window.innerWidth);
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;

    const activeRadius = isMobile ? 240 : isTablet ? 380 : radius;
    const cardWidth = isMobile ? 170 : isTablet ? 220 : 280;
    const cardHeight = isMobile ? 250 : isTablet ? 320 : 400;
    const leftOffset = -cardWidth / 2;
    const topOffset = -cardHeight / 2;
    const containerHeight = isMobile ? "320px" : isTablet ? "420px" : "520px";

    // --- Auto-rotation ---
    useEffect(() => {
      const autoRotate = (time: number) => {
        if (!isPaused) {
          const delta = lastTimeRef.current ? (time - lastTimeRef.current) * 0.001 : 0;
          setRotation((prev) => prev + autoRotateSpeed * delta * 60);
        }
        lastTimeRef.current = time;
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isPaused, autoRotateSpeed]);

    // --- Mouse wheel handler on the gallery container ---
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        setRotation((prev) => prev + e.deltaY * 0.15);
        setIsPaused(true);
        // Resume auto-rotation after a pause
        setTimeout(() => setIsPaused(false), 2000);
      };

      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }, []);

    // --- Arrow navigation ---
    const navigate = useCallback(
      (direction: "prev" | "next") => {
        setRotation((prev) => prev + (direction === "next" ? -anglePerItem : anglePerItem));
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 3000);
      },
      [anglePerItem]
    );

    return (
      <div ref={ref} className={cn("relative w-full", className)} {...props}>
        {/* 3D Gallery Container */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden"
          style={{ height: containerHeight, perspective: "1800px" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Rotating 3D ring */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="relative w-0 h-0"
              style={{
                transform: `rotateY(${rotation}deg)`,
                transformStyle: "preserve-3d",
                transition: isPaused ? "none" : undefined,
              }}
            >
              {items.map((movie, i) => {
                const itemAngle = i * anglePerItem;
                const totalRotation = ((rotation % 360) + 360) % 360;
                const relativeAngle =
                  ((itemAngle + totalRotation + 360) % 360);
                const normalizedAngle =
                  relativeAngle > 180 ? 360 - relativeAngle : relativeAngle;
                const opacity = Math.max(0.15, 1 - normalizedAngle / 140);
                const isFront = normalizedAngle < 30;

                return (
                  <div
                    key={`${movie.title}-${i}`}
                    className="absolute"
                    style={{
                      width: `${cardWidth}px`,
                      height: `${cardHeight}px`,
                      left: `${leftOffset}px`,
                      top: `${topOffset}px`,
                      transform: `rotateY(${itemAngle}deg) translateZ(${activeRadius}px)`,
                      opacity,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <div
                      className={cn(
                        "relative w-full h-full rounded-2xl overflow-hidden border transition-all duration-300",
                        isFront
                          ? "border-cine-blue/40 shadow-2xl shadow-cine-blue/10"
                          : "border-white/[0.08] shadow-xl"
                      )}
                    >
                      {/* Poster image */}
                      <Image
                        src={movie.image}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes={`${cardWidth}px`}
                        unoptimized
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                      {/* Rating badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                        <Star className="w-3 h-3 text-cine-amber fill-cine-amber" />
                        <span className="text-[11px] font-bold text-white">
                          {movie.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* Genre badge */}
                      <div className="absolute top-3 left-3">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm text-white/80 px-2 py-1 rounded-lg border border-white/10">
                          {movie.genre}
                        </span>
                      </div>

                      {/* Movie info */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-bold text-white leading-tight mb-1">
                          {movie.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-white/60 mb-2">
                          <Clock className="w-3 h-3" />
                          <span>{movie.year}</span>
                        </div>
                        <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">
                          {movie.overview}
                        </p>
                      </div>

                      {/* Front card glow ring */}
                      {isFront && (
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-cine-blue/20" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => navigate("prev")}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-white/70 hover:text-white transition-all duration-200 backdrop-blur-sm"
            aria-label="Previous movie"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">
            Scroll or drag to explore
          </span>
          <button
            onClick={() => navigate("next")}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-white/70 hover:text-white transition-all duration-200 backdrop-blur-sm"
            aria-label="Next movie"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = "CircularGallery";

export { CircularGallery };
export default CircularGallery;
