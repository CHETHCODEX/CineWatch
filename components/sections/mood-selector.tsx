"use client";

import { useState } from "react";
import Image from "next/image";
import { getPosterUrl } from "@/types/movie";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Play, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Movie } from "@/types/movie";

// =============================================================================
// Mood data — each mood maps to genres and a curated movie list
// =============================================================================

interface MoodOption {
  emoji: string;
  label: string;
  description: string;
  gradient: string;
  glowColor: string;
  borderColor: string;
  movies: Movie[];
}

const MOODS: MoodOption[] = [
  {
    emoji: "😂",
    label: "Funny",
    description: "Light-hearted laughs and feel-good vibes",
    gradient: "from-yellow-500/20 to-amber-500/20",
    glowColor: "shadow-yellow-500/20",
    borderColor: "border-yellow-500/30",
    movies: [
      { id: 13, title: "Forrest Gump", overview: "A man with a low IQ has accomplished great things in his life.", poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", backdrop_path: null, release_date: "1994-06-23", vote_average: 8.5, genre_ids: [35, 18] },
      { id: 120467, title: "The Grand Budapest Hotel", overview: "The adventures of a legendary concierge at a famous European hotel.", poster_path: "/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg", backdrop_path: null, release_date: "2014-02-26", vote_average: 8.1, genre_ids: [35, 18] },
      { id: 8363, title: "Superbad", overview: "Two co-dependent high school seniors set out to attend a party.", poster_path: "/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg", backdrop_path: null, release_date: "2007-08-17", vote_average: 7.6, genre_ids: [35] },
      { id: 18785, title: "The Hangover", overview: "Three friends wake up from a bachelor party in Las Vegas with no memory.", poster_path: "/A0uS9rHR56FeBtpjVki16M5xxSW.jpg", backdrop_path: null, release_date: "2009-06-05", vote_average: 7.4, genre_ids: [35] },
    ],
  },
  {
    emoji: "😢",
    label: "Emotional",
    description: "Deep stories that hit right in the feels",
    gradient: "from-blue-500/20 to-indigo-500/20",
    glowColor: "shadow-blue-500/20",
    borderColor: "border-blue-500/30",
    movies: [
      { id: 424, title: "Schindler's List", overview: "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives.", poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg", backdrop_path: null, release_date: "1993-12-15", vote_average: 8.6, genre_ids: [18, 10752] },
      { id: 278, title: "The Shawshank Redemption", overview: "Framed in the 1940s for the double murder of his wife and her lover.", poster_path: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg", backdrop_path: null, release_date: "1994-09-23", vote_average: 8.7, genre_ids: [18, 80] },
      { id: 123, title: "A Beautiful Mind", overview: "A brilliant mathematician begins to question his reality.", poster_path: "/zwzWCmH72OSC9NA0ipoqw5Zjya8.jpg", backdrop_path: null, release_date: "2001-12-13", vote_average: 8.2, genre_ids: [18] },
      { id: 1402, title: "The Pursuit of Happyness", overview: "A struggling salesman takes custody of his son.", poster_path: "/lBYOKAMcxIvuk9s9hMuecB9dPBV.jpg", backdrop_path: null, release_date: "2006-12-15", vote_average: 8.0, genre_ids: [18] },
    ],
  },
  {
    emoji: "😱",
    label: "Thrilled",
    description: "Edge-of-your-seat suspense and chills",
    gradient: "from-red-500/20 to-rose-500/20",
    glowColor: "shadow-red-500/20",
    borderColor: "border-red-500/30",
    movies: [
      { id: 155, title: "The Dark Knight", overview: "Batman raises the stakes in his war on crime.", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdrop_path: null, release_date: "2008-07-16", vote_average: 8.5, genre_ids: [18, 28, 80, 53] },
      { id: 680, title: "Pulp Fiction", overview: "The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine.", poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", backdrop_path: null, release_date: "1994-09-10", vote_average: 8.5, genre_ids: [53, 80] },
      { id: 550, title: "Fight Club", overview: "An insomniac and a slippery soap salesman channel primal male aggression.", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdrop_path: null, release_date: "1999-10-15", vote_average: 8.4, genre_ids: [18, 53] },
      { id: 125, title: "Se7en", overview: "Two detectives hunt for a serial killer who uses the seven deadly sins.", poster_path: "/6yoghtyTpznpBik8EngEmJskVUO.jpg", backdrop_path: null, release_date: "1995-09-22", vote_average: 8.3, genre_ids: [80, 9648, 53] },
    ],
  },
  {
    emoji: "🤔",
    label: "Mind-Blown",
    description: "Complex plots that keep you thinking for days",
    gradient: "from-violet-500/20 to-purple-500/20",
    glowColor: "shadow-violet-500/20",
    borderColor: "border-violet-500/30",
    movies: [
      { id: 27205, title: "Inception", overview: "A skilled thief commits corporate espionage by infiltrating the subconscious.", poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", backdrop_path: null, release_date: "2010-07-15", vote_average: 8.4, genre_ids: [28, 878, 12] },
      { id: 157336, title: "Interstellar", overview: "Explorers travel through a wormhole to save the human race.", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: null, release_date: "2014-11-05", vote_average: 8.4, genre_ids: [12, 18, 878] },
      { id: 603, title: "The Matrix", overview: "A computer hacker learns about the true nature of his reality.", poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", backdrop_path: null, release_date: "1999-03-30", vote_average: 8.2, genre_ids: [28, 878] },
      { id: 11324, title: "Shutter Island", overview: "A U.S. Marshal investigates a psychiatric facility on a remote island.", poster_path: "/kve20tXMHZp4y9ers3mIl22jKhA.jpg", backdrop_path: null, release_date: "2010-02-14", vote_average: 8.2, genre_ids: [18, 9648, 53] },
    ],
  },
  {
    emoji: "💕",
    label: "Romantic",
    description: "Heartwarming love stories and butterflies",
    gradient: "from-pink-500/20 to-rose-500/20",
    glowColor: "shadow-pink-500/20",
    borderColor: "border-pink-500/30",
    movies: [
      { id: 11036, title: "The Notebook", overview: "A young couple's love story told through the lens of an elderly man.", poster_path: "/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg", backdrop_path: null, release_date: "2004-06-25", vote_average: 7.9, genre_ids: [18, 10749] },
      { id: 313369, title: "La La Land", overview: "An aspiring actress and a jazz musician fall in love in Los Angeles.", poster_path: "/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg", backdrop_path: null, release_date: "2016-11-29", vote_average: 7.9, genre_ids: [35, 18, 10749, 10402] },
      { id: 597, title: "Titanic", overview: "A seventeen-year-old aristocrat falls in love with a kind but poor artist.", poster_path: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", backdrop_path: null, release_date: "1997-11-18", vote_average: 7.9, genre_ids: [18, 10749] },
      { id: 4348, title: "Pride & Prejudice", overview: "Sparks fly when spirited Elizabeth Bennet meets the single, rich Mr. Darcy.", poster_path: "/o8UhmEbWPHmTUxP0lMuCoqNkbB3.jpg", backdrop_path: null, release_date: "2005-09-16", vote_average: 7.8, genre_ids: [18, 10749] },
    ],
  },
  {
    emoji: "😎",
    label: "Adventurous",
    description: "Epic journeys and non-stop action sequences",
    gradient: "from-emerald-500/20 to-teal-500/20",
    glowColor: "shadow-emerald-500/20",
    borderColor: "border-emerald-500/30",
    movies: [
      { id: 76341, title: "Mad Max: Fury Road", overview: "An apocalyptic story in a stark desert landscape.", poster_path: "/hA2ple9q4qnwxp3hKVNhroipsir.jpg", backdrop_path: null, release_date: "2015-05-13", vote_average: 7.6, genre_ids: [28, 12, 878] },
      { id: 299536, title: "Avengers: Infinity War", overview: "The Avengers must stop Thanos from collecting all the Infinity Stones.", poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", backdrop_path: null, release_date: "2018-04-25", vote_average: 8.3, genre_ids: [12, 28, 878] },
      { id: 85, title: "Indiana Jones: Raiders of the Lost Ark", overview: "An archaeologist races against time to find the Ark of the Covenant.", poster_path: "/ceG9VzoRAVGwivFU403Wc3AHRys.jpg", backdrop_path: null, release_date: "1981-06-12", vote_average: 8.3, genre_ids: [12, 28] },
      { id: 569094, title: "Spider-Man: Across the Spider-Verse", overview: "Miles Morales catapults across the Multiverse.", poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", backdrop_path: null, release_date: "2023-05-31", vote_average: 8.4, genre_ids: [16, 28, 12] },
    ],
  },
];

// =============================================================================
// Use TMDB poster_path directly via getPosterUrl helper
// =============================================================================

// =============================================================================
// MoodSelector Section Component
// =============================================================================

export function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [hoveredMood, setHoveredMood] = useState<number | null>(null);

  const activeMoodIndex = hoveredMood ?? selectedMood;
  const activeMood = activeMoodIndex !== null ? MOODS[activeMoodIndex] : null;

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
            <Sparkles className="h-3.5 w-3.5 text-cine-amber" />
            AI Mood Engine
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            How are you <span className="text-gradient-cine">feeling</span> today?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Pick your mood and we&apos;ll find the perfect movies to match your vibe
          </p>
        </motion.div>

        {/* Emoji Mood Selector */}
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
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  {MOODS[selectedMood].emoji} Perfect for your mood
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Movie cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {MOODS[selectedMood].movies.map((movie, i) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group relative"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03] cursor-pointer">
                      {/* Poster image */}
                      <Image
                        src={getPosterUrl(movie.poster_path, "w342")}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, 25vw"
                        unoptimized
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-cine-blue/0 group-hover:bg-cine-blue/10 transition-colors duration-300" />

                      {/* Play button on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Rating badge */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                        <Star className="w-3 h-3 text-cine-amber fill-cine-amber" />
                        <span className="text-[10px] font-bold text-white">
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>

                      {/* Movie info at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="text-sm font-bold text-white leading-tight mb-1 line-clamp-2">
                          {movie.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-white/60">
                          <Clock className="w-3 h-3" />
                          <span>{movie.release_date.split("-")[0]}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
