"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Star,
  Clock,
  Calendar,
  Play,
  Plus,
  Check,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";
import type { MovieDetail, Movie } from "@/types/movie";
import {
  getBackdropUrl,
  getPosterUrl,
  getProfileUrl,
  MOCK_GENRES,
} from "@/types/movie";
import { useAuth } from "@/components/providers/auth-provider";

// =============================================================================
// Props
// =============================================================================

interface MovieDetailClientProps {
  movie: MovieDetail;
  similar: Movie[];
}

// =============================================================================
// MovieDetailClient — Rich cinematic detail view
// =============================================================================

export default function MovieDetailClient({
  movie,
  similar,
}: MovieDetailClientProps) {
  const { isInWatchlist, toggleWatchlist } = useAuth();
  const [showTrailer, setShowTrailer] = useState(false);
  const castScrollRef = useRef<HTMLDivElement>(null);

  const inWatchlist = isInWatchlist(movie.id);

  const handleToggleWatchlist = async () => {
    const simplifiedMovie: Movie = {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genres.map((g) => g.id),
      runtime: movie.runtime,
    };
    await toggleWatchlist(simplifiedMovie);
  };

  // Find the primary trailer
  const trailer = movie.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  ) ?? movie.videos?.results?.[0];

  // Format runtime
  const hours = Math.floor(movie.runtime / 60);
  const mins = movie.runtime % 60;
  const runtimeStr = `${hours}h ${mins}m`;

  // Release year
  const year = movie.release_date?.slice(0, 4) ?? "";

  // Cast scroll helpers
  const scrollCast = (dir: "left" | "right") => {
    if (!castScrollRef.current) return;
    const amount = dir === "left" ? -300 : 300;
    castScrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Genre map for similar movies
  const genreMap: Record<number, string> = {};
  MOCK_GENRES.forEach((g) => (genreMap[g.id] = g.name));

  return (
    <>
      {/* ================================================================= */}
      {/* Trailer Modal */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showTrailer && trailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                aria-label="Close trailer"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background">
        {/* ================================================================= */}
        {/* Backdrop Hero */}
        {/* ================================================================= */}
        <div className="relative w-full h-[65vh] md:h-[70vh]">
          <Image
            src={getBackdropUrl(movie.backdrop_path, "original")}
            alt={movie.title}
            fill
            className="object-cover object-top"
            priority
            unoptimized
          />

          {/* Multi-layer gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

          {/* Back button */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-6 left-6 z-20"
          >
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white/90 hover:text-white text-sm font-medium transition-all duration-200 border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </motion.div>
        </div>

        {/* ================================================================= */}
        {/* Main Content */}
        {/* ================================================================= */}
        <div className="relative -mt-52 md:-mt-64 z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            {/* ---- Poster ---- */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="flex-shrink-0 mx-auto md:mx-0"
            >
              <div className="relative w-[220px] sm:w-[260px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group">
                <Image
                  src={getPosterUrl(movie.poster_path, "w500")}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-cine-blue/20 to-transparent" />
              </div>
            </motion.div>

            {/* ---- Movie Info ---- */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex-1 pt-2 md:pt-8"
            >
              {/* Tagline */}
              {movie.tagline && (
                <p className="text-sm font-medium text-cine-amber tracking-wide uppercase mb-2">
                  {movie.tagline}
                </p>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
                {movie.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5">
                {/* Rating */}
                <div className="flex items-center gap-1.5 bg-cine-amber/15 px-3 py-1.5 rounded-lg">
                  <Star className="w-4 h-4 text-cine-amber fill-cine-amber" />
                  <span className="text-sm font-bold text-cine-amber">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>

                {/* Year */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{year}</span>
                </div>

                {/* Runtime */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{runtimeStr}</span>
                </div>
              </div>

              {/* Genre tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg bg-cine-surface border border-white/[0.08] text-foreground/80 hover:bg-cine-surface-hover hover:text-foreground transition-colors duration-200"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Overview */}
              <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                {movie.overview}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Watch Trailer */}
                {trailer && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2.5 bg-cine-blue hover:bg-cine-blue/90 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-cine-blue/25 hover:shadow-cine-blue/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    Watch Trailer
                  </button>
                )}

                {/* Add to Watchlist */}
                <button
                  onClick={handleToggleWatchlist}
                  className={`flex items-center gap-2.5 font-semibold px-6 py-3 rounded-xl transition-all duration-300 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    inWatchlist
                      ? "bg-cine-amber/15 border-cine-amber/30 text-cine-amber shadow-lg shadow-cine-amber/10"
                      : "bg-white/5 border-white/10 text-foreground/80 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  {inWatchlist ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </button>
              </div>
            </motion.div>
          </div>

          {/* ================================================================= */}
          {/* Cast Carousel */}
          {/* ================================================================= */}
          {movie.credits?.cast && movie.credits.cast.length > 0 && (
            <motion.section
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-16"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Cast</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollCast("left")}
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-cine-surface hover:bg-cine-surface-hover border border-white/[0.08] text-foreground/70 hover:text-foreground transition-all duration-200 cursor-pointer"
                    aria-label="Scroll cast left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollCast("right")}
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-cine-surface hover:bg-cine-surface-hover border border-white/[0.08] text-foreground/70 hover:text-foreground transition-all duration-200 cursor-pointer"
                    aria-label="Scroll cast right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={castScrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1 snap-x"
              >
                {movie.credits.cast.slice(0, 12).map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex-shrink-0 w-[130px] snap-start group"
                  >
                    <div className="relative w-[130px] h-[180px] rounded-xl overflow-hidden bg-muted/20 border border-white/[0.06] mb-2.5 group-hover:border-cine-blue/30 transition-colors duration-300">
                      <Image
                        src={getProfileUrl(member.profile_path, "w185")}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.character}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ================================================================= */}
          {/* Trailer Section (embedded) */}
          {/* ================================================================= */}
          {trailer && (
            <motion.section
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Trailer
              </h2>
              <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/30 group">
                {/* Thumbnail with play overlay — clicking opens modal */}
                <button
                  onClick={() => setShowTrailer(true)}
                  className="relative w-full h-full cursor-pointer"
                  aria-label="Play trailer"
                >
                  <Image
                    src={`https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`}
                    alt={trailer.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-cine-blue/90 shadow-2xl shadow-cine-blue/40 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                  {/* Trailer name badge */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                    <span className="text-xs font-medium text-white/90">
                      {trailer.name}
                    </span>
                  </div>
                </button>
              </div>
            </motion.section>
          )}

          {/* ================================================================= */}
          {/* Similar Movies */}
          {/* ================================================================= */}
          {similar.length > 0 && (
            <motion.section
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Similar Movies
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {similar.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                  >
                    <Link
                      href={`/movie/${m.id}`}
                      className="group block"
                    >
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/[0.06] mb-2.5 group-hover:border-cine-blue/30 transition-all duration-300 shadow-lg shadow-black/20 group-hover:shadow-cine-blue/10">
                        <Image
                          src={getPosterUrl(m.poster_path, "w342")}
                          alt={m.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Rating badge on hover */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Star className="w-3 h-3 text-cine-amber fill-cine-amber" />
                          <span className="text-[10px] font-bold text-white">
                            {m.vote_average.toFixed(1)}
                          </span>
                        </div>

                        {/* Title overlay on hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-xs font-medium text-white/70">
                            {m.release_date?.slice(0, 4)}
                            {m.genre_ids?.[0] && genreMap[m.genre_ids[0]]
                              ? ` · ${genreMap[m.genre_ids[0]]}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-cine-blue transition-colors duration-200">
                        {m.title}
                      </h3>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </>
  );
}
