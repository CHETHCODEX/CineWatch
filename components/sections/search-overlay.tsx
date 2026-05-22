"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  Star,
  Clock,
  Sparkles,
  TrendingUp,
  CornerDownLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { getPosterUrl } from "@/types/movie";
import type { Movie } from "@/types/movie";
import { cn } from "@/lib/utils";

// =============================================================================
// Props
// =============================================================================
interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"standard" | "ai">("standard");
  const [results, setResults] = useState<Movie[]>([]);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // Auto-focus input when overlay opens
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setSelectedIndex(0);
      // Fetch trending suggestions if not loaded
      if (suggestions.length === 0) {
        fetch("/api/movies/trending")
          .then((res) => res.json())
          .then((data) => {
            if (data && data.results) {
              setSuggestions(data.results.slice(0, 5));
            }
          })
          .catch((err) => console.error("Error loading suggestions", err));
      }
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen, suggestions.length]);

  // ---------------------------------------------------------------------------
  // Debounced API Search
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const endpoint = searchMode === "ai"
          ? `/api/movies/semantic-search?q=${encodeURIComponent(query)}`
          : `/api/movies/search?q=${encodeURIComponent(query)}`;
        const res = await fetch(endpoint);
        const data = await res.json();
        if (data && data.results) {
          // Limit to 6 results for command palette format
          setResults(data.results.slice(0, 6));
        }
      } catch (err) {
        console.error("Search fetch failed", err);
      } finally {
        setIsLoading(false);
        setSelectedIndex(0); // reset index when results change
      }
    }, 250); // 250ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchMode]);

  // ---------------------------------------------------------------------------
  // Keyboard Event Handlers
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const activeList = query.trim() ? results : suggestions;
      if (activeList.length === 0) {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
        return;
      }

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;

        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % activeList.length);
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + activeList.length) % activeList.length);
          break;

        case "Enter":
          e.preventDefault();
          const selectedMovie = activeList[selectedIndex];
          if (selectedMovie) {
            router.push(`/movie/${selectedMovie.id}`);
            onClose();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, query, results, suggestions, selectedIndex, onClose, router]);

  // ---------------------------------------------------------------------------
  // Scroll selected item into view
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (resultsContainerRef.current) {
      const selectedElement = resultsContainerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  // Handle manual option click
  const handleItemClick = (movieId: number) => {
    router.push(`/movie/${movieId}`);
    onClose();
  };

  const activeList = query.trim() ? results : suggestions;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/85 backdrop-blur-xl px-4 pt-[10vh] sm:pt-[15vh]"
          onClick={onClose}
        >
          {/* Main search panel box */}
          <motion.div
            initial={{ y: -30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
              "w-full max-w-2xl overflow-hidden rounded-2xl border bg-zinc-950/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-300",
              searchMode === "ai"
                ? "border-cine-blue/20 shadow-cine-blue/10 glow-ai"
                : "border-white/[0.08] shadow-cine-blue/5 glow-blue"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mode Tabs */}
            <div className="flex items-center gap-1.5 border-b border-white/[0.04] bg-white/[0.01] px-4 py-2">
              <button
                onClick={() => {
                  setSearchMode("standard");
                  setQuery("");
                  setResults([]);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold tracking-wide transition-all cursor-pointer border",
                  searchMode === "standard"
                    ? "bg-white/10 text-white border-white/10"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                )}
              >
                <Search className="h-3.5 w-3.5" />
                Standard Search
              </button>
              <button
                onClick={() => {
                  setSearchMode("ai");
                  setQuery("");
                  setResults([]);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold tracking-wide transition-all cursor-pointer relative overflow-hidden group border",
                  searchMode === "ai"
                    ? "bg-gradient-to-r from-cine-blue/20 to-purple-500/20 text-cine-blue border-cine-blue/30 shadow-[0_0_15px_rgba(1,180,228,0.15)] font-bold"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                )}
              >
                <Sparkles className={cn("h-3.5 w-3.5 text-purple-400 group-hover:animate-pulse", searchMode === "ai" && "animate-pulse text-cine-blue")} />
                AI Semantic Search
                {searchMode === "ai" && (
                  <span className="absolute inset-0 bg-gradient-to-r from-cine-blue/5 to-purple-500/5 blur-md animate-pulse" />
                )}
              </button>
            </div>

            {/* Input Wrapper */}
            <div className="relative flex items-center border-b border-white/[0.06] px-4 py-3">
              {searchMode === "ai" ? (
                <Sparkles className="mr-3 h-5 w-5 text-cine-blue animate-pulse" />
              ) : (
                <Search className="mr-3 h-5 w-5 text-muted-foreground" />
              )}
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  searchMode === "ai"
                    ? "Describe a plot, mood, or characters (e.g., lost in space)..."
                    : "Search movies, collections..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              {isLoading ? (
                <Loader2 className="ml-3 h-4 w-4 animate-spin text-cine-blue" />
              ) : query ? (
                <button
                  onClick={() => setQuery("")}
                  className="ml-3 rounded-md p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {/* Results / Suggestions Container */}
            <div className="max-h-[360px] overflow-y-auto p-2 scrollbar-hide">
              {/* If loading and query, show skeletons */}
              {isLoading && results.length === 0 ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="flex items-center gap-3 rounded-xl p-2.5 animate-pulse bg-white/[0.01]"
                    >
                      <div className="h-14 w-10 rounded-lg bg-white/5" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-1/3 rounded bg-white/5" />
                        <div className="h-3 w-1/6 rounded bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeList.length > 0 ? (
                <div ref={resultsContainerRef} className="space-y-1">
                  {/* Category Title Header */}
                  <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase flex items-center gap-1.5">
                    {query.trim() ? (
                      searchMode === "ai" ? (
                        <>
                          <Sparkles className="h-3 w-3 text-cine-blue animate-pulse" />
                          AI Semantic Matches
                        </>
                      ) : (
                        <>
                          <Search className="h-3 w-3" />
                          Search Results
                        </>
                      )
                    ) : (
                      <>
                        <TrendingUp className="h-3 w-3 text-cine-blue" />
                        Trending Recommendations
                      </>
                    )}
                  </div>

                  {activeList.map((movie, idx) => {
                    const isSelected = idx === selectedIndex;
                    const movieYear = movie.release_date?.slice(0, 4) ?? "N/A";
                    const rating = Math.round(movie.vote_average * 10) / 10;

                    return (
                      <div
                        key={movie.id}
                        onClick={() => handleItemClick(movie.id)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "group flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200 border",
                          isSelected
                            ? "bg-gradient-to-r from-cine-blue/15 to-cine-blue/5 border-cine-blue/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                            : "bg-transparent border-transparent hover:bg-white/[0.02]"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Miniature Poster */}
                          <div className="relative h-12 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-zinc-900">
                            <Image
                              src={getPosterUrl(movie.poster_path, "w92")}
                              alt={movie.title}
                              fill
                              sizes="32px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          {/* Text info */}
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "text-sm font-bold truncate leading-snug transition-colors duration-200",
                                isSelected ? "text-cine-blue" : "text-foreground"
                              )}
                            >
                              {movie.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground/80">
                              <span className="font-medium">{movieYear}</span>
                              <span>·</span>
                              <div className="flex items-center gap-0.5 text-cine-amber">
                                <Star className="h-3 w-3 fill-cine-amber" />
                                <span className="font-bold">{rating.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Selected Indicator Arrow */}
                        <div className="flex items-center gap-2.5">
                          {isSelected && (
                            <motion.span
                              initial={{ x: -4, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className="flex items-center gap-1 text-[10px] font-bold text-cine-blue/80 uppercase tracking-wider"
                            >
                              Open
                              <CornerDownLeft className="h-3 w-3" />
                            </motion.span>
                          )}
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-all duration-200",
                              isSelected
                                ? "text-cine-blue translate-x-0.5"
                                : "text-muted-foreground/30 group-hover:text-muted-foreground"
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : query.trim() ? (
                /* Beautiful empty state */
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-muted-foreground shadow-inner">
                    {searchMode === "ai" ? (
                      <Sparkles className="h-6 w-6 text-cine-blue animate-pulse" />
                    ) : (
                      <Search className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    {searchMode === "ai" ? "No semantic matches found" : "No matches found"}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-[280px]">
                    {searchMode === "ai"
                      ? "Try describing the movie plot in another way, or switch to Standard Search."
                      : `We couldn't find any movies for "${query}". Try another term.`}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Keyboard Shortcuts Footer */}
            <div className="flex items-center justify-between border-t border-white/[0.06] bg-zinc-950/40 px-4 py-2.5 text-[10px] font-medium text-muted-foreground/60">
              <div className="flex items-center gap-1.5 select-none">
                <kbd className="inline-flex h-4 items-center justify-center rounded bg-white/[0.08] px-1 font-mono text-[9px] font-bold text-muted-foreground border border-white/[0.04]">
                  Esc
                </kbd>
                <span>to close</span>
              </div>
              <div className="flex items-center gap-3 select-none">
                <div className="flex items-center gap-1">
                  <kbd className="inline-flex h-4 items-center justify-center rounded bg-white/[0.08] px-1 font-mono text-[9px] font-bold text-muted-foreground border border-white/[0.04]">
                    ↑
                  </kbd>
                  <kbd className="inline-flex h-4 items-center justify-center rounded bg-white/[0.08] px-1 font-mono text-[9px] font-bold text-muted-foreground border border-white/[0.04]">
                    ↓
                  </kbd>
                  <span>to navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="inline-flex h-4 items-center justify-center rounded bg-white/[0.08] px-1 font-mono text-[9px] font-bold text-muted-foreground border border-white/[0.04]">
                    Enter
                  </kbd>
                  <span>to select</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
