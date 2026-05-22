"use client";

import { motion } from "motion/react";
import { CircularGallery } from "@/components/ui/circular-gallery";
import type { GalleryMovie } from "@/components/ui/circular-gallery";

// =============================================================================
// Trending Section — with scroll-triggered entrance animation
// =============================================================================

interface TrendingSectionProps {
  movies?: GalleryMovie[];
}

export function TrendingSection({ movies }: TrendingSectionProps) {
  return (
    <section
      id="trending"
      className="px-4 py-20 sm:px-6 lg:px-8 overflow-hidden"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[1920px] mx-auto text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-cine-amber/20 bg-cine-amber/[0.05] px-4 py-1.5 text-xs font-medium text-cine-amber backdrop-blur-sm mb-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cine-amber opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cine-amber" />
          </span>
          Updated weekly
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Trending <span className="text-cine-amber">Now</span>
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The most popular movies everyone is watching this week
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        whileInView={{ y: 0, opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <CircularGallery items={movies} />
      </motion.div>
    </section>
  );
}
