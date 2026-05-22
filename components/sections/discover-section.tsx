"use client";

import { motion } from "motion/react";
import { Compass } from "lucide-react";
import ExpandCards from "@/components/ui/expand-cards";
import type { ExpandCardMovie } from "@/components/ui/expand-cards";

// =============================================================================
// Discover Section — with scroll-triggered entrance animation
// =============================================================================

interface DiscoverSectionProps {
  movies?: ExpandCardMovie[];
}

export function DiscoverSection({ movies }: DiscoverSectionProps) {
  return (
    <section id="discover" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-[1920px] mx-auto mb-12">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between mb-2"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm mb-4">
              <Compass className="h-3.5 w-3.5 text-cine-blue" />
              Browse Collection
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Discover <span className="text-cine-blue">Movies</span>
            </h2>
            <p className="text-muted-foreground max-w-md">
              Hover to explore — click to dive deeper into each film.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Expand-on-hover movie cards with staggered reveal */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto"
      >
        <ExpandCards movies={movies} />
      </motion.div>
    </section>
  );
}
