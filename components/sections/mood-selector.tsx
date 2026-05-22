"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPosterUrl } from "@/types/movie";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Play, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Movie } from "@/types/movie";

// =============================================================================
// Mood data — metadata for matching HSL styling and visual effects
// =============================================================================

interface MoodOption {
  emoji: string;
  label: string;
  description: string;
  gradient: string;
  glowColor: string;
  borderColor: string;
}

const MOODS: MoodOption[] = [
  {
    emoji: "😂",
    label: "Funny",
    description: "Light-hearted laughs and feel-good vibes",
    gradient: "from-yellow-500/10 to-amber-500/10",
    glowColor: "shadow-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
  {
    emoji: "😢",
    label: "Emotional",
    description: "Deep stories that hit right in the feels",
    gradient: "from-blue-500/10 to-indigo-500/10",
    glowColor: "shadow-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    emoji: "😱",
    label: "Thrilled",
    description: "Edge-of-your-seat suspense and chills",
    gradient: "from-red-500/10 to-rose-500/10",
    glowColor: "shadow-red-500/10",
    borderColor: "border-red-500/20",
  },
  {
    emoji: "🤔",
    label: "Mind-Blown",
    description: "Complex plots that keep you thinking for days",
    gradient: "from-violet-500/10 to-purple-500/10",
    glowColor: "shadow-violet-500/10",
    borderColor: "border-violet-500/20",
  },
  {
    emoji: "💕",
    label: "Romantic",
    description: "Heartwarming love stories and butterflies",
    gradient: "from-pink-500/10 to-rose-500/10",
    glowColor: "shadow-pink-500/10",
    borderColor: "border-pink-500/20",
  },
  {
    emoji: "😎",
    label: "Adventurous",
    description: "Epic journeys and non-stop action sequences",
    gradient: "from-emerald-500/10 to-teal-500/10",
    glowColor: "shadow-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
];

// =============================================================================
// MoodSelector Section Component
// =============================================================================

export function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [hoveredMood, setHoveredMood] = useState<number | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [moodCache, setMoodCache] = useState<Record<string, Movie[]>>({});

  const activeMoodIndex = hoveredMood ?? selectedMood;
  const activeMood = activeMoodIndex !== null ? MOODS[activeMoodIndex] : null;

  useEffect(() => {
    if (selectedMood === null) {
      setMovies([]);
      return;
    }

    const moodLabel = MOODS[selectedMood].label.toLowerCase();

    // Check client-side cache
    if (moodCache[moodLabel]) {
      setMovies(moodCache[moodLabel]);
      return;
    }

    // Dynamic Fetching from AI Mood Engine
    setIsLoading(true);
    fetch(`/api/movies/mood?mood=${encodeURIComponent(moodLabel)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.results) {
          // Limit to 8 items for two rows of beautiful grid
          const list = data.results.slice(0, 8);
          setMovies(list);
          setMoodCache((prev) => ({ ...prev, [moodLabel]: list }));
        }
      })
      .catch((err) => console.error("[MoodSelector] Fetch failed", err))
      .finally(() => setIsLoading(false));
      
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMood]);

  return (
    <section className="relative px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glow effect based on selected mood */}
      <AnimatePresence>
        {activeMood && (
          <motion.div
            key={activeMoodIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "absolute inset-0 pointer-events-none",
              `bg-gradient-to-b ${activeMood.gradient}`
            )}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-[1920px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-cine-amber animate-pulse" />
            AI Mood Engine
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            How are you <span className="text-gradient-cine">feeling</span> today?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Pick your mood and we&apos;ll find the perfect movies to match your vibe
          </p>
        </motion.div>

        {/* Emoji Mood Selector Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6"
        >
          {MOODS.map((mood, i) => {
            const isSelected = selectedMood === i;
            const isHovered = hoveredMood === i;
            const isActive = isSelected || isHovered;

            return (
              <motion.button
                key={mood.label}
                onClick={() => setSelectedMood(isSelected ? null : i)}
                onMouseEnter={() => setHoveredMood(i)}
                onMouseLeave={() => setHoveredMood(null)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "group relative flex flex-col items-center gap-2 rounded-2xl px-4 py-4 sm:px-6 sm:py-5 transition-all duration-300 ease-out border",
                  isActive
                    ? `bg-gradient-to-b ${mood.gradient} ${mood.borderColor} ${mood.glowColor} shadow-lg`
                    : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]"
                )}
                aria-label={`Select mood: ${mood.label}`}
              >
                <span
                  className={cn(
                    "text-3xl sm:text-4xl transition-all duration-300 select-none",
                    isActive
                      ? "scale-110 grayscale-0 drop-shadow-lg"
                      : "grayscale-[0.5] opacity-60 group-hover:grayscale-0 group-hover:opacity-100"
                  )}
                >
                  {mood.emoji}
                </span>
                <span
                  className={cn(
                    "text-[11px] sm:text-xs font-semibold tracking-wide transition-colors duration-300",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {mood.label}
                </span>

                {/* Active indicator dot */}
                {isSelected && (
                  <motion.div
                    layoutId="mood-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cine-blue"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Mood description with blur transition */}
        <div className="relative h-6 mb-10">
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-300",
              activeMood ? "opacity-0 blur-md scale-95" : "opacity-100 blur-0 scale-100"
            )}
          >
            <span className="text-sm text-muted-foreground/60">
              Select a mood to get personalized picks
            </span>
          </div>
          <AnimatePresence mode="wait">
            {activeMood && (
              <motion.div
                key={activeMoodIndex}
                initial={{ opacity: 0, y: 5, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -5, filter: "blur(8px)" }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="text-sm text-muted-foreground italic">
                  {activeMood.description}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Movie Recommendations Grid — appears when a mood is selected */}
        <AnimatePresence mode="wait">
          {selectedMood !== null && (
            <motion.div
              key={selectedMood}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Results header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 select-none">
                  {MOODS[selectedMood].emoji} AI Match Suggestions
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Grid loading / render logic */}
              {isLoading ? (
                /* Skeleton Loader Cards */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/[0.06] bg-zinc-900/30 animate-pulse"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 space-y-2">
                        <div className="h-4 bg-white/15 rounded w-3/4" />
                        <div className="h-3 bg-white/5 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : movies.length > 0 ? (
                /* Dynamic Movie Cards Grid */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {movies.map((movie, i) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: i * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="group relative"
                    >
                      <Link href={`/movie/${movie.id}`}>
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03] cursor-pointer shadow-md transition-shadow group-hover:shadow-[0_0_20px_rgba(1,180,228,0.15)]">
                          {/* Poster image */}
                          <Image
                            src={getPosterUrl(movie.poster_path, "w342")}
                            alt={movie.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, 25vw"
                            unoptimized
                          />

                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                          {/* Hover overlay light glow */}
                          <div className="absolute inset-0 bg-cine-blue/0 group-hover:bg-cine-blue/5 transition-colors duration-300" />

                          {/* Play button on hover */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                            </div>
                          </div>

                          {/* Rating badge */}
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/[0.05]">
                            <Star className="w-3 h-3 text-cine-amber fill-cine-amber" />
                            <span className="text-[10px] font-bold text-white">
                              {(movie.vote_average ?? 0).toFixed(1)}
                            </span>
                          </div>

                          {/* Movie info at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 select-none">
                            <h4 className="text-sm font-bold text-white leading-tight mb-1 line-clamp-2 transition-colors group-hover:text-cine-blue">
                              {movie.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-white/50">
                              <Clock className="w-3 h-3" />
                              <span>{movie.release_date ? movie.release_date.split("-")[0] : "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* No Results Empty State */
                <div className="text-center py-10">
                  <p className="text-sm text-muted-foreground">
                    No recommendations found for this mood. Try again in a few seconds.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
