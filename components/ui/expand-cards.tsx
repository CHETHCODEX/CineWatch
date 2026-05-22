"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Play, Star, Clock, Plus, Info, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import type { Movie } from "@/types/movie";

// =============================================================================
// Types
// =============================================================================

export interface ExpandCardMovie {
  id: number;
  title: string;
  year: string;
  rating: number;
  genre: string;
  overview: string;
  image: string;
}

interface ExpandCardsProps {
  movies?: ExpandCardMovie[];
  className?: string;
}

// =============================================================================
// Default movie data with reliable Unsplash images
// =============================================================================

const DEFAULT_MOVIES: ExpandCardMovie[] = [
  {
    id: 27205,
    title: "Inception",
    year: "2010",
    rating: 8.4,
    genre: "Sci-Fi",
    overview: "A thief who steals corporate secrets through dream-sharing technology.",
    image: "https://image.tmdb.org/t/p/w780/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  },
  {
    id: 155,
    title: "The Dark Knight",
    year: "2008",
    rating: 8.5,
    genre: "Action",
    overview: "Batman must accept one of the greatest psychological tests of his ability to fight injustice.",
    image: "https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  },
  {
    id: 157336,
    title: "Interstellar",
    year: "2014",
    rating: 8.4,
    genre: "Sci-Fi",
    overview: "Explorers travel through a wormhole in space to ensure humanity's survival.",
    image: "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
  {
    id: 680,
    title: "Pulp Fiction",
    year: "1994",
    rating: 8.5,
    genre: "Crime",
    overview: "The lives of two mob hitmen, a boxer, and a gangster's wife intertwine.",
    image: "https://image.tmdb.org/t/p/w780/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
  },
  {
    id: 238,
    title: "The Godfather",
    year: "1972",
    rating: 8.7,
    genre: "Crime",
    overview: "The aging patriarch of an organized crime dynasty transfers control to his youngest son.",
    image: "https://image.tmdb.org/t/p/w780/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
  },
  {
    id: 569094,
    title: "Spider-Verse",
    year: "2023",
    rating: 8.4,
    genre: "Animation",
    overview: "Miles Morales catapults across the Multiverse, encountering the Spider Society.",
    image: "https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
  },
  {
    id: 278,
    title: "Shawshank",
    year: "1994",
    rating: 8.7,
    genre: "Drama",
    overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption.",
    image: "https://image.tmdb.org/t/p/w780/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
  },
  {
    id: 13,
    title: "Forrest Gump",
    year: "1994",
    rating: 8.5,
    genre: "Drama",
    overview: "The presidencies of Kennedy and Johnson through the eyes of an Alabama man.",
    image: "https://image.tmdb.org/t/p/w780/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
  },
  {
    id: 76341,
    title: "Mad Max",
    year: "2015",
    rating: 7.6,
    genre: "Action",
    overview: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler.",
    image: "https://image.tmdb.org/t/p/w780/hA2ple9q4qnwxp3hKVNhroipsir.jpg",
  },
];

// =============================================================================
// ExpandCards Component
// =============================================================================

export default function ExpandCards({ movies = DEFAULT_MOVIES, className }: ExpandCardsProps) {
  const [expandedIndex, setExpandedIndex] = useState(3);
  const { isInWatchlist, toggleWatchlist } = useAuth();

  const convertToMovie = (m: ExpandCardMovie): Movie => {
    let path = m.image;
    const match = m.image.match(/\/t\/p\/w\d+(.*)/);
    if (match && match[1]) {
      path = match[1];
    }
    return {
      id: m.id,
      title: m.title,
      overview: m.overview,
      poster_path: path,
      backdrop_path: path,
      release_date: `${m.year}-01-01`,
      vote_average: m.rating,
      genre_ids: [],
    };
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop: Expand-on-hover cards */}
      <div className="hidden lg:block">
        <div className="flex w-full items-center justify-center gap-1.5">
          {movies.map((movie, idx) => {
            const isExpanded = idx === expandedIndex;

            return (
              <div
                key={movie.id}
                className="relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 ease-in-out"
                style={{
                  width: isExpanded ? "28rem" : "4.5rem",
                  height: "26rem",
                  flexShrink: 0,
                }}
                onMouseEnter={() => setExpandedIndex(idx)}
              >
                {/* Poster image */}
                <Image
                  className="w-full h-full object-cover"
                  src={movie.image}
                  alt={movie.title}
                  fill
                  sizes="(min-width: 1024px) 28rem, 4.5rem"
                  unoptimized
                />

                {/* Dark gradient overlay — always visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                {/* Collapsed state — vertical title */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-end justify-center pb-6 transition-all duration-500",
                    isExpanded ? "opacity-0" : "opacity-100"
                  )}
                >
                  <span
                    className="text-white/80 text-xs font-bold tracking-widest uppercase whitespace-nowrap"
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                    }}
                  >
                    {movie.title}
                  </span>
                </div>

                {/* Expanded state — full movie info */}
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col justify-end transition-all duration-500",
                    isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}
                >
                  {/* Rating badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                    <Star className="w-3.5 h-3.5 text-cine-amber fill-cine-amber" />
                    <span className="text-xs font-bold text-white">
                      {movie.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Genre badge */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-cine-blue/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg">
                      {movie.genre}
                    </span>
                  </div>

                  {/* Movie info */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-1 leading-tight">
                      {movie.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-white/60 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {movie.year}
                      </span>
                    </div>

                    <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-4">
                      {movie.overview}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <Link href={`/movie/${movie.id}`} className="flex items-center gap-1.5 bg-cine-blue hover:bg-cine-blue/90 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors duration-200 shadow-lg shadow-cine-blue/25">
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Watch
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWatchlist(convertToMovie(movie));
                        }}
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 backdrop-blur-sm border",
                          isInWatchlist(movie.id)
                            ? "bg-cine-blue text-white border-cine-blue/20 hover:bg-cine-blue/80 shadow-lg shadow-cine-blue/20"
                            : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                        )}
                        title={isInWatchlist(movie.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                      >
                        {isInWatchlist(movie.id) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                      <Link href={`/movie/${movie.id}`} className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 backdrop-blur-sm border border-white/10">
                        <Info className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tablet: Show 4 cards with same expand behavior */}
      <div className="hidden md:block lg:hidden">
        <div className="flex w-full items-center justify-center gap-1.5">
          {movies.slice(0, 5).map((movie, idx) => {
            const isExpanded = idx === Math.min(expandedIndex, 4);

            return (
              <div
                key={movie.id}
                className="relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 ease-in-out"
                style={{
                  width: isExpanded ? "20rem" : "4rem",
                  height: "22rem",
                  flexShrink: 0,
                }}
                onMouseEnter={() => setExpandedIndex(idx)}
              >
                <Image
                  className="w-full h-full object-cover"
                  src={movie.image}
                  alt={movie.title}
                  fill
                  sizes="20rem"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                {/* Collapsed title */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-end justify-center pb-6 transition-all duration-500",
                    isExpanded ? "opacity-0" : "opacity-100"
                  )}
                >
                  <span
                    className="text-white/80 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap"
                    style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                  >
                    {movie.title}
                  </span>
                </div>

                {/* Expanded info */}
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col justify-end transition-all duration-500 p-4",
                    isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}
                >
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                    <Star className="w-3 h-3 text-cine-amber fill-cine-amber" />
                    <span className="text-[10px] font-bold text-white">{movie.rating.toFixed(1)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{movie.title}</h3>
                  <p className="text-[11px] text-white/50 line-clamp-2 mb-3">{movie.overview}</p>
                  <div className="flex items-center gap-2">
                    <Link href={`/movie/${movie.id}`} className="flex items-center gap-1.5 bg-cine-blue text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg shadow-cine-blue/25">
                      <Play className="w-3 h-3 fill-white" />
                      Watch
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWatchlist(convertToMovie(movie));
                      }}
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-xl transition-all duration-200 backdrop-blur-sm border",
                        isInWatchlist(movie.id)
                          ? "bg-cine-blue text-white border-cine-blue/20 hover:bg-cine-blue/80 shadow-lg shadow-cine-blue/20"
                          : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                      )}
                      title={isInWatchlist(movie.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                    >
                      {isInWatchlist(movie.id) ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: Horizontal scroll with cards */}
      <div className="md:hidden">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="relative flex-shrink-0 w-[200px] snap-start cursor-pointer group block"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/[0.08]">
                <Image
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={movie.image}
                  alt={movie.title}
                  fill
                  sizes="200px"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Watchlist button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWatchlist(convertToMovie(movie));
                  }}
                  className={cn(
                    "absolute top-2 left-2 flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 backdrop-blur-sm border z-20",
                    isInWatchlist(movie.id)
                      ? "bg-cine-blue text-white border-cine-blue/20 shadow-lg shadow-cine-blue/20"
                      : "bg-black/60 text-white border-white/10 hover:bg-black/80"
                  )}
                  title={isInWatchlist(movie.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                >
                  {isInWatchlist(movie.id) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>

                {/* Rating */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                  <Star className="w-3 h-3 text-cine-amber fill-cine-amber" />
                  <span className="text-[10px] font-bold text-white">{movie.rating.toFixed(1)}</span>
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="text-sm font-bold text-white leading-tight mb-1">{movie.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-white/60">
                    <Clock className="w-3 h-3" />
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span>{movie.genre}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
