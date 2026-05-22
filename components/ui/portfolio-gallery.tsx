"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PortfolioGalleryProps {
  title?: string;
  archiveButton?: {
    text: string;
    href: string;
  };
  images?: Array<{
    src: string;
    alt: string;
    title?: string;
    id?: number;
  }>;
  className?: string;
  maxHeight?: number;
  spacing?: string;
  onImageClick?: (index: number) => void;
  pauseOnHover?: boolean;
  marqueeRepeat?: number;
}

export function PortfolioGallery({
  title = "Browse my library",
  archiveButton = {
    text: "View gallery",
    href: "#",
  },
  images: customImages,
  className = "",
  maxHeight = 150,
  spacing = "-space-x-24 md:-space-x-36 lg:-space-x-44",
  onImageClick,
  pauseOnHover = true,
  marqueeRepeat = 4,
}: PortfolioGalleryProps) {
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const defaultImages: Array<{
    src: string;
    alt: string;
    title?: string;
    id?: number;
  }> = [
    {
      src: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
      alt: "Inception",
    },
    {
      src: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      alt: "The Dark Knight",
    },
    {
      src: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      alt: "Interstellar",
    },
    {
      src: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      alt: "Pulp Fiction",
    },
    {
      src: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      alt: "The Godfather",
    },
    {
      src: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      alt: "Spider-Verse",
    },
    {
      src: "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
      alt: "Shawshank Redemption",
    },
    {
      src: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      alt: "Forrest Gump",
    },
  ];

  const images = customImages || defaultImages;

  return (
    <div
      aria-label={title}
      className={cn("relative py-20 px-4", className)}
      id="archives"
    >
      <div className="max-w-7xl mx-auto bg-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/[0.08] overflow-hidden shadow-2xl">
        {/* Header Section */}
        <div className="relative z-10 text-center pt-16 pb-8 px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            {title}
          </h2>

          <Link
            href={archiveButton.href}
            className="inline-flex items-center gap-3 bg-cine-blue text-white px-6 py-3 rounded-full font-medium hover:bg-cine-blue/90 transition-colors group mb-20 shadow-lg shadow-cine-blue/20"
          >
            <span>{archiveButton.text}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Desktop 3D overlapping layout - hidden on mobile */}
        <div className="hidden md:block relative overflow-hidden h-[500px] -mb-[200px]">
          <div
            className={`flex ${spacing} pb-8 pt-40 items-end justify-center`}
          >
            {images.map((image, index) => {
              // Calculate stagger height - peak in middle, descending to edges
              const totalImages = images.length;
              const middle = Math.floor(totalImages / 2);
              const distanceFromMiddle = Math.abs(index - middle);
              const staggerOffset = maxHeight - distanceFromMiddle * 40;

              const zIndex = totalImages - index;

              const isHovered = hoveredIndex === index;
              const isOtherHovered =
                hoveredIndex !== null && hoveredIndex !== index;

              // When hovering: hovered card moves to consistent top position, others move to baseline
              const yOffset = isHovered
                ? -160
                : isOtherHovered
                ? 0
                : -staggerOffset;

              return (
                <motion.div
                  key={index}
                  className="group cursor-pointer flex-shrink-0"
                  style={{
                    zIndex: zIndex,
                  }}
                  initial={{
                    transform: `perspective(5000px) rotateY(-30deg) translateY(200px)`,
                    opacity: 0,
                  }}
                  whileInView={{
                    transform: `perspective(5000px) rotateY(-30deg) translateY(${yOffset}px)`,
                    opacity: 1,
                  }}
                  viewport={{ once: true, margin: "-100px" }}
                  animate={{
                    transform: `perspective(5000px) rotateY(-30deg) translateY(${yOffset}px)`,
                  }}
                  transition={{
                    duration: 0.3, // Much faster hover animation
                    delay: index * 0.05, // Faster entrance stagger
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  onClick={() => {
                    if (image.id) {
                      router.push(`/movie/${image.id}`);
                    } else {
                      onImageClick?.(index);
                    }
                  }}
                >
                  <div
                    className="relative aspect-[2/3] w-48 md:w-64 lg:w-72 rounded-2xl overflow-hidden transition-transform duration-300 group-hover:scale-105 border border-white/[0.08]"
                    style={{
                      boxShadow: `
                        rgba(0, 0, 0, 0.01) 0.796192px 0px 0.796192px 0px,
                        rgba(0, 0, 0, 0.03) 2.41451px 0px 2.41451px 0px,
                        rgba(0, 0, 0, 0.08) 6.38265px 0px 6.38265px 0px,
                        rgba(0, 0, 0, 0.25) 20px 0px 20px 0px
                      `,
                    }}
                  >
                    <Image
                      src={image.src || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 1024px) 250px, 300px"
                      className="object-cover object-center"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile marquee layout */}
        <div className="block md:hidden relative pb-8 overflow-hidden w-full">
          <div
            className={cn(
              "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
              "flex-row"
            )}
          >
            {Array(marqueeRepeat)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex shrink-0 justify-around [gap:var(--gap)]",
                    "animate-marquee flex-row",
                    {
                      "group-hover:[animation-play-state:paused]": pauseOnHover,
                    }
                  )}
                >
                  {images.map((image, index) => (
                    <div
                      key={`${i}-${index}`}
                      className="group cursor-pointer flex-shrink-0"
                      onClick={() => {
                        if (image.id) {
                          router.push(`/movie/${image.id}`);
                        } else {
                          onImageClick?.(index);
                        }
                      }}
                    >
                      <div
                        className="relative aspect-[2/3] w-48 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105 border border-white/10"
                        style={{
                          boxShadow: `
                            rgba(0, 0, 0, 0.01) 0.796192px 0px 0.796192px 0px,
                            rgba(0, 0, 0, 0.03) 2.41451px 0px 2.41451px 0px,
                            rgba(0, 0, 0, 0.08) 6.38265px 0px 6.38265px 0px,
                            rgba(0, 0, 0, 0.25) 20px 0px 20px 0px
                          `,
                        }}
                      >
                        <Image
                          src={image.src || "/placeholder.svg"}
                          alt={image.alt}
                          fill
                          sizes="200px"
                          className="object-cover object-center"
                          unoptimized
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
