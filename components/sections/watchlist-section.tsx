"use client";

import { useState, useEffect } from "react";
import { PortfolioGallery } from "@/components/ui/portfolio-gallery";
import { Bookmark, Clock, Star, Film, Search, X, Trash2, AlertTriangle, Shuffle, Sparkles, Play, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getPosterUrl, MOCK_GENRES } from "@/types/movie";
import type { Movie } from "@/types/movie";
import { MarathonGenerator } from "./marathon-generator";
import { useAuth } from "@/components/providers/auth-provider";

// =============================================================================
// Web Audio API Synthesizers for Cinematic Roulette Wheel Sound Effects
// =============================================================================

function playTickSound() {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // Ignore context blocked or unsupported warnings
  }
}

function playCelebrationChime() {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playNode = (freq: number, delay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };

    // Uplifting major arpeggio chime (C5 -> E5 -> G5 -> C6)
    playNode(523.25, 0.0, 0.25);
    playNode(659.25, 0.08, 0.25);
    playNode(783.99, 0.16, 0.25);
    playNode(1046.50, 0.24, 0.45);
  } catch (e) {
    // Ignore context blocked
  }
}

// =============================================================================
// Watchlist Section — Persistent Library Dashboard with Stats & Live Filters
// =============================================================================

interface WatchlistSectionProps {
  images?: Array<{ src: string; alt: string; title?: string; id?: number }>;
}

export function WatchlistSection({ images: propImages }: WatchlistSectionProps) {
  const { watchlist, clearWatchlist, loading } = useAuth();
  const isLoaded = !loading;

  // Filter and sorting states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All Vibes");
  const [sortBy, setSortBy] = useState("recent");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Cinematic Roulette Decision Spinner States
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelY, setReelY] = useState(0);
  const [winner, setWinner] = useState<Movie | null>(null);
  const [spinItems, setSpinItems] = useState<Movie[]>([]);

  // CineMarathon Generator State
  const [isMarathonOpen, setIsMarathonOpen] = useState(false);

  const handleScrollToDiscover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const discoverSection = document.getElementById("discover");
    if (discoverSection) {
      discoverSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleClearWatchlist = async () => {
    await clearWatchlist();
    setIsConfirmOpen(false);
  };

  const startRouletteSpin = () => {
    if (watchlist.length === 0 || isSpinning) return;
    
    setIsSpinning(true);
    setWinner(null);
    setReelY(0);

    // Build a repeating items array to ensure a long scroll reel
    // We want at least 40 items. So we loop the watchlist until we reach at least 40.
    const itemsCount = 45;
    const items: Movie[] = [];
    while (items.length < itemsCount) {
      items.push(...watchlist);
    }
    
    // Choose a random winner index in the watchlist
    const winnerIdx = Math.floor(Math.random() * watchlist.length);
    
    // We will place the winner exactly at a target index in our reel items
    const targetIndex = 35 + (items.slice(35).findIndex(m => m.id === watchlist[winnerIdx].id));
    setSpinItems(items);

    const itemHeight = 80;
    const startY = 0;
    // Offset calculation: we want the center focusing box to show targetIndex movie.
    // The viewport of our slot is 240px, so centering is achieved at offset 80px.
    const targetY = -1 * (targetIndex * itemHeight - 80);
    
    const duration = 4200; // 4.2 seconds
    const startTime = Date.now();
    let lastItemIndex = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        setReelY(targetY);
        setIsSpinning(false);
        setWinner(watchlist[winnerIdx]);
        playCelebrationChime();
        return;
      }

      // Ease out cubic deceleration formula
      const progress = elapsed / duration;
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentY = startY + (targetY - startY) * easeOutCubic;

      setReelY(currentY);

      // Web Audio Ticking sync
      const currentItemIndex = Math.floor(Math.abs(currentY) / itemHeight);
      if (currentItemIndex !== lastItemIndex) {
        playTickSound();
        lastItemIndex = currentItemIndex;
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  // ---------------------------------------------------------------------------
  // Calculations (Real-time Watchlist Stats)
  // ---------------------------------------------------------------------------
  
  // Total watch time
  const totalMinutes = watchlist.reduce((acc, m) => acc + (m.runtime || 120), 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const watchTimeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // Average Rating
  const avgRating =
    watchlist.length > 0
      ? watchlist.reduce((acc, m) => acc + m.vote_average, 0) / watchlist.length
      : 0;

  // Signature Vibe (most frequent genre in watchlist)
  const getSignatureVibe = () => {
    if (watchlist.length === 0) return "No movies saved";
    const frequencies: Record<string, number> = {};
    watchlist.forEach((m) => {
      m.genre_ids.forEach((id) => {
        const name = MOCK_GENRES.find((g) => g.id === id)?.name || "Movie";
        frequencies[name] = (frequencies[name] || 0) + 1;
      });
    });

    let topGenre = "Mixed Vibe";
    let maxCount = 0;
    Object.entries(frequencies).forEach(([genre, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topGenre = genre;
      }
    });

    // Make signature title more descriptive
    const titles: Record<string, string> = {
      Action: "Action Fanatic",
      Adventure: "Explorer",
      Animation: "Toon Lover",
      Comedy: "Humor Enthusiast",
      Crime: "Noir Buff",
      Documentary: "Truth Seeker",
      Drama: "Drama Buff",
      Fantasy: "Dreamer",
      Horror: "Thrill Hunter",
      Music: "Melody Fan",
      Mystery: "Sleuth",
      Romance: "Romantic",
      "Science Fiction": "Sci-Fi Geek",
      Thriller: "Adrenaline Junkie",
      War: "History Buff",
    };

    return titles[topGenre] || `${topGenre} Lover`;
  };

  const signatureVibe = getSignatureVibe();

  // ---------------------------------------------------------------------------
  // Dynamically extract saved genres for filters (only show genres that exist)
  // ---------------------------------------------------------------------------
  const savedGenres = Array.from(
    new Set(
      watchlist.flatMap((m) =>
        m.genre_ids.map((id) => MOCK_GENRES.find((g) => g.id === id)?.name).filter(Boolean)
      )
    )
  ) as string[];

  // ---------------------------------------------------------------------------
  // Filter & Sort Logic
  // ---------------------------------------------------------------------------
  let filteredList = [...watchlist];

  // 1. Apply Search query
  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase();
    filteredList = filteredList.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.overview.toLowerCase().includes(query)
    );
  }

  // 2. Apply Genre Filter
  if (selectedGenre !== "All Vibes") {
    filteredList = filteredList.filter((m) =>
      m.genre_ids.some((id) => MOCK_GENRES.find((g) => g.id === id)?.name === selectedGenre)
    );
  }

  // 3. Apply Sorting
  if (sortBy === "rating") {
    filteredList.sort((a, b) => b.vote_average - a.vote_average);
  } else if (sortBy === "date-new") {
    filteredList.sort(
      (a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    );
  } else if (sortBy === "alpha") {
    filteredList.sort((a, b) => a.title.localeCompare(b.title));
  }
  // "recent" corresponds to natural order (default localStorage push sequence)

  // Map to PortfolioGallery shape
  const activeImages = filteredList.map((m) => ({
    id: m.id,
    src: getPosterUrl(m.poster_path, "w500"),
    alt: m.title,
    title: m.title,
  }));

  // Framer Motion staggered variants
  const statsContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const statItemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
  };

  return (
    <section id="watchlist" className="pt-20">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm mb-4">
          <Bookmark className="h-3.5 w-3.5 text-cine-amber" />
          Your Library
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoaded && watchlist.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto px-4 mt-4 mb-20"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-12 md:p-20 text-center shadow-2xl">
              {/* Amber gradient soft ambient glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cine-amber/5 rounded-full blur-[120px] pointer-events-none" />

              <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
                {/* Floating bookmark badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex items-center justify-center w-16 h-16 rounded-2xl bg-cine-amber/15 border border-cine-amber/30 text-cine-amber mb-6 shadow-lg shadow-cine-amber/10"
                >
                  <Bookmark className="w-8 h-8 fill-cine-amber/20" />
                </motion.div>

                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                  Your Watchlist is Empty
                </h3>

                <p className="text-muted-foreground text-sm md:text-base mb-8 leading-relaxed">
                  Explore our curations, discover fresh titles, and save them here to curate your personal cinematic collection.
                </p>

                <a
                  href="#discover"
                  onClick={handleScrollToDiscover}
                  className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-6 py-3 rounded-full hover:bg-foreground/90 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95"
                >
                  Browse Movies
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="watchlist-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto px-4 mt-4"
          >
            {/* ================================================================= */}
            {/* 📊 Dashboard Statistics Grid */}
            {/* ================================================================= */}
            {isLoaded && watchlist.length > 0 && (
              <motion.div
                variants={statsContainerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
              >
                {/* Screentime Card */}
                <motion.div
                  variants={statItemVariants}
                  className="relative overflow-hidden bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.08] p-5 shadow-lg group hover:border-white/10 transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cine-blue/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cine-blue/15 border border-cine-blue/30 text-cine-blue group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                        Total Screentime
                      </p>
                      <h4 className="text-2xl font-bold text-foreground tabular-nums">
                        {watchTimeStr}
                      </h4>
                    </div>
                  </div>
                </motion.div>

                {/* Rating Card */}
                <motion.div
                  variants={statItemVariants}
                  className="relative overflow-hidden bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.08] p-5 shadow-lg group hover:border-white/10 transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cine-amber/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cine-amber/15 border border-cine-amber/30 text-cine-amber group-hover:scale-110 transition-transform duration-300">
                      <Star className="w-6 h-6 fill-cine-amber/10" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                        Library Average
                      </p>
                      <h4 className="text-2xl font-bold text-foreground tabular-nums">
                        {avgRating > 0 ? `${avgRating.toFixed(1)}/10` : "—"}
                      </h4>
                    </div>
                  </div>
                </motion.div>

                {/* Primary Vibe Card */}
                <motion.div
                  variants={statItemVariants}
                  className="relative overflow-hidden bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.08] p-5 shadow-lg group hover:border-white/10 transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                      <Film className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                        Signature Vibe
                      </p>
                      <h4 className="text-xl font-bold text-foreground truncate max-w-[180px] lg:max-w-xs">
                        {signatureVibe}
                      </h4>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* 🔍 Controls Panel (Search, Genre Filtering, Sorting) */}
            {/* ================================================================= */}
            {isLoaded && watchlist.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-t border-white/[0.08] pt-8 mb-6">
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search saved movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.08] text-foreground placeholder:text-muted-foreground text-sm rounded-xl pl-10 pr-10 py-2.5 outline-none focus:border-white/20 transition-all duration-300 focus:bg-white/[0.04]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown & Quick Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
                      Sort By
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] text-foreground text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/20 transition-all duration-300 cursor-pointer shadow-sm select-chevron"
                    >
                      <option value="recent">Recently Saved</option>
                      <option value="rating">Rating (Highest)</option>
                      <option value="date-new">Release Date (Newest)</option>
                      <option value="alpha">Alphabetical (A-Z)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setIsRouletteOpen(true);
                      setWinner(null);
                      setReelY(0);
                    }}
                    className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 text-sm font-semibold rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm shadow-purple-500/5 glow-purple"
                    title="Solve the 'what to watch' dilemma!"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>Watch Roulette</span>
                  </button>

                  <button
                    onClick={() => setIsMarathonOpen(true)}
                    className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 text-sm font-semibold rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm shadow-amber-500/5 glow-amber"
                    title="Schedule a movie marathon!"
                  >
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>CineMarathon</span>
                  </button>

                  <button
                    onClick={() => setIsConfirmOpen(true)}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-sm font-semibold rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm"
                    title="Empty your library"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Watchlist</span>
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Genre Pills */}
            {isLoaded && watchlist.length > 0 && savedGenres.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
                <button
                  onClick={() => setSelectedGenre("All Vibes")}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border cursor-pointer ${
                    selectedGenre === "All Vibes"
                      ? "bg-cine-amber/15 border-cine-amber/30 text-cine-amber shadow-lg shadow-cine-amber/10"
                      : "bg-white/[0.02] border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  All Vibes
                </button>
                {savedGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border cursor-pointer ${
                      selectedGenre === genre
                        ? "bg-cine-amber/15 border-cine-amber/30 text-cine-amber shadow-lg shadow-cine-amber/10"
                        : "bg-white/[0.02] border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/5 hover:border-white/10"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}

            {/* ================================================================= */}
            {/* 🎪 Gallery Carousel Display */}
            {/* ================================================================= */}
            <AnimatePresence mode="wait">
              {filteredList.length === 0 ? (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white/[0.01] border border-white/[0.06] rounded-2xl p-12 text-center my-10"
                >
                  <p className="text-muted-foreground text-sm">
                    No saved movies match your active search or filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedGenre("All Vibes");
                    }}
                    className="mt-4 text-xs font-bold text-cine-blue hover:text-cine-blue/80 transition-colors"
                  >
                    Reset Active Filters
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="carousel-deck"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PortfolioGallery
                    title="Your Watchlist"
                    archiveButton={{ text: "Explore library", href: "#discover" }}
                    images={activeImages}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Glassmorphic Deletion Confirmation Modal */}
      <AnimatePresence>
        {isConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsConfirmOpen(false)}
          >
            {/* Ambient Red Warning Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { type: "spring", stiffness: 300, damping: 25 }
              }}
              exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }}
              className="relative overflow-hidden w-full max-w-md bg-zinc-950/90 border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center"
              onClick={(e) => e.stopPropagation()} // Prevent modal card click from closing modal
            >
              {/* Custom Animated Warning Icon Container */}
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
                className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 mb-5 shadow-lg shadow-red-500/5"
              >
                <AlertTriangle className="w-7 h-7" />
              </motion.div>

              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 tracking-tight">
                Clear Your Watchlist?
              </h3>

              <p className="text-muted-foreground text-sm md:text-base mb-8 leading-relaxed">
                Are you sure you want to empty your library? This will permanently remove all saved movies and reset your statistics. This action cannot be undone.
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="flex-1 py-3 px-5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:text-foreground text-sm font-semibold text-muted-foreground transition-all duration-200 cursor-pointer text-center hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearWatchlist}
                  className="flex-1 py-3 px-5 rounded-full bg-red-600 hover:bg-red-500 text-sm font-semibold text-white transition-all duration-200 cursor-pointer shadow-lg shadow-red-950/40 hover:shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] text-center"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Cinematic Roulette Decision Spinner Modal */}
      <AnimatePresence>
        {isRouletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4"
            onClick={() => !isSpinning && setIsRouletteOpen(false)} // Prevent closing while spinning
          >
            {/* Ambient Purple Theme Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { type: "spring", stiffness: 300, damping: 25 }
              }}
              exit={{ opacity: 0, scale: 0.95, y: 15, transition: { duration: 0.2 } }}
              className="relative overflow-hidden w-full max-w-lg bg-zinc-950/95 border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              {!isSpinning && (
                <button
                  onClick={() => setIsRouletteOpen(false)}
                  className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Title Section */}
              <div className="flex items-center gap-2 mb-6">
                <Shuffle className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="text-xl md:text-2xl font-bold text-gradient-cine">
                  Cinematic Roulette
                </h3>
              </div>

              {!winner ? (
                // =============================================================
                // SPINNING / READY STATE VIEW
                // =============================================================
                <div className="w-full flex flex-col items-center">
                  <p className="text-muted-foreground text-sm text-center mb-8 max-w-sm">
                    Can't decide what to watch? Let the cinema gods spin your library and pick the perfect title for you!
                  </p>

                  {/* The Filmstrip slot viewport */}
                  <div className="relative w-full max-w-xs h-[240px] bg-zinc-900/50 border border-white/[0.08] rounded-2xl overflow-hidden shadow-inner flex flex-col justify-center items-center">
                    
                    {/* Dark gradient shadow overlays for depth */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-zinc-950 to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent z-10 pointer-events-none" />

                    {/* Glowing Golden Centering focus lines */}
                    <div className="absolute left-0 right-0 top-[80px] h-[80px] border-y border-cine-amber/40 bg-cine-amber/[0.04] z-10 pointer-events-none shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                      {/* Side indicators */}
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-cine-amber rounded-r-sm" />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-cine-amber rounded-l-sm" />
                    </div>

                    {/* The Scrolling Filmstrip list */}
                    {spinItems.length > 0 ? (
                      <div 
                        className="w-full absolute transition-transform duration-75 will-change-transform"
                        style={{
                          transform: `translateY(${reelY}px)`,
                          top: '0px'
                        }}
                      >
                        {spinItems.map((movie, index) => {
                          const year = movie.release_date?.slice(0, 4) ?? "";
                          const genreMap: Record<number, string> = {};
                          MOCK_GENRES.forEach((g) => (genreMap[g.id] = g.name));
                          const genre = movie.genre_ids.map((id) => genreMap[id]).filter(Boolean)[0] ?? "Movie";
                          
                          return (
                            <div 
                              key={`${movie.id}-${index}`} 
                              className="h-[80px] flex items-center gap-4 px-6 border-b border-white/[0.03]"
                            >
                              <div className="relative w-[36px] h-[52px] flex-shrink-0 overflow-hidden rounded bg-zinc-800 border border-white/10">
                                <img 
                                  src={getPosterUrl(movie.poster_path, "w92")} 
                                  alt={movie.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <h4 className="font-bold text-foreground text-sm truncate">{movie.title}</h4>
                                <p className="text-xs text-muted-foreground truncate">{genre} • {year}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Display dynamic list of static saved items before spin triggers
                      <div className="flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                        <Sparkles className="w-8 h-8 text-purple-500/40 animate-bounce" />
                        <span>Ready to Roll</span>
                      </div>
                    )}
                  </div>

                  {/* Trigger Button */}
                  <button
                    onClick={startRouletteSpin}
                    disabled={isSpinning}
                    className={`mt-8 w-full max-w-xs py-3.5 px-6 rounded-full font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                      isSpinning
                        ? "bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed scale-95"
                        : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/40 hover:shadow-purple-500/20 hover:scale-[1.03] active:scale-[0.97]"
                    }`}
                  >
                    <Shuffle className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
                    <span>{isSpinning ? "Selecting Winner..." : "SPIN THE REEL"}</span>
                  </button>
                </div>
              ) : (
                // =============================================================
                // SELECTED WINNER REVEAL STAGE
                // =============================================================
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-cine-amber/20 bg-cine-amber/10 px-3 py-1 text-xs font-semibold text-cine-amber backdrop-blur-sm mb-6 animate-bounce">
                    <Sparkles className="h-3 w-3 fill-cine-amber/20" />
                    Cinema Gods Picked!
                  </div>

                  {/* Movie Winner Detail Card */}
                  <div className="relative overflow-hidden w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 mb-8 flex flex-col sm:flex-row gap-5 group shadow-lg">
                    {/* Ambient subtle green/amber glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cine-amber/5 rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Winning Poster */}
                    <div className="relative w-full max-w-[120px] sm:max-w-[140px] aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-md group-hover:scale-105 transition-transform duration-300 self-center">
                      <img 
                        src={getPosterUrl(winner.poster_path, "w342")} 
                        alt={winner.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 text-left flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">
                          {winner.release_date?.slice(0, 4)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-cine-amber bg-cine-amber/10 border border-cine-amber/20 px-2 py-0.5 rounded">
                          <Star className="w-3.5 h-3.5 fill-cine-amber" />
                          {winner.vote_average.toFixed(1)}
                        </span>
                      </div>

                      <h4 className="text-lg md:text-xl font-bold text-foreground mb-2 truncate group-hover:text-purple-300 transition-colors">
                        {winner.title}
                      </h4>

                      <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-3 mb-1">
                        {winner.overview}
                      </p>
                    </div>
                  </div>

                  {/* Winner Action Buttons */}
                  <div className="flex w-full gap-3">
                    <button
                      onClick={startRouletteSpin}
                      className="flex-1 py-3 px-5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:text-foreground text-sm font-semibold text-muted-foreground transition-all duration-200 cursor-pointer text-center hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Spin Again</span>
                    </button>
                    <a
                      href={`/movie/${winner.id}`}
                      className="flex-1 py-3 px-5 rounded-full bg-purple-600 hover:bg-purple-500 text-sm font-semibold text-white transition-all duration-200 cursor-pointer shadow-lg shadow-purple-950/40 hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] text-center flex items-center justify-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Details & Info</span>
                    </a>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MarathonGenerator
        isOpen={isMarathonOpen}
        onClose={() => setIsMarathonOpen(false)}
        watchlist={watchlist}
      />
    </section>
  );
}
