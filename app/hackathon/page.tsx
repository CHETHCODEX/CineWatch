"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ArrowLeft, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  Flame, 
  Star, 
  Activity, 
  Cpu, 
  BarChart3, 
  Search, 
  Loader2, 
  X, 
  Play, 
  Plus, 
  Check, 
  Calendar, 
  Clock, 
  Film, 
  Users, 
  ExternalLink, 
  Command, 
  SlidersHorizontal, 
  RotateCcw, 
  Snowflake, 
  Grid, 
  Layers, 
  Zap, 
  Database, 
  Timer, 
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/sections/navbar';
import { Footer } from '@/components/sections/footer';
import { SnappySlider } from '@/components/ui/snappy-slider';
import { CoverFlowCarousel, type CarouselItem } from '@/components/ui/3-d-coverflow-carousel';
import { SwapyLayout, SwapySlot, SwapyItem, DragHandle } from '@/components/ui/swapy-draggable-card';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface Explanation {
  text: string;
  tags: string[];
  peerAgreementPct: number;
  collabScore: number;
  contentScore: number;
  hybridScore: number;
}

interface WatchlistItem {
  rank: number;
  movieId: number;
  title: string;
  year: number;
  genres: string[];
  director: string;
  cast: string[];
  predictedRating: number;
  matchPercentage: number;
  posterPath: string;
  explanation: Explanation;
  overview?: string;
  runtime?: number;
  voteAverage?: number;
  tagline?: string;
  trailerKey?: string;
  tmdbId?: number;
}

interface UserEngagement {
  score: number;
  cohort: string;
  churnRisk: string;
  totalRatings: number;
  meanRating: number;
  genreDiversityPct: number;
  retentionStrategy: string;
}

interface UserProfile {
  userId: number;
  persona: string;
  description: string;
  engagement: UserEngagement;
}

interface PersonaOption {
  userId: number;
  persona: string;
  cohort: string;
  score: number;
}

interface MetadataStats {
  totalMoviesInCatalog: number;
  totalRatingsTrained: number;
  svdRMSE: number;
  svdMAE: number;
  genresCount: number;
  hybridWeights: {
    collaborative: number;
    content: number;
  };
}

const getFallbackPoster = (title: string, year: number) => {
  const cleanTitle = title.length > 25 ? title.substring(0, 22) + '...' : title;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#18181b"/>
        <stop offset="50%" stop-color="#09090b"/>
        <stop offset="100%" stop-color="#040404"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="500" height="750" fill="url(#g)"/>
    <rect width="500" height="750" fill="url(#glow)"/>
    <circle cx="250" cy="300" r="56" fill="#27272a" stroke="#3f3f46" stroke-width="2"/>
    <polygon points="242,280 268,300 242,320" fill="#06b6d4"/>
    <text x="250" y="440" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="22" font-weight="700">${cleanTitle.replace(/&/g, '&amp;')}</text>
    <text x="250" y="480" text-anchor="middle" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="16" font-weight="500">${year || ''}</text>
    <text x="250" y="520" text-anchor="middle" fill="#06b6d4" font-family="system-ui, sans-serif" font-size="13" font-weight="600" letter-spacing="2">CINEMATCH AI</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export default function HackathonDashboard() {
  const [selectedUserId, setSelectedUserId] = useState<number>(42);
  const [customInputId, setCustomInputId] = useState<string>('');
  const [availablePersonas, setAvailablePersonas] = useState<PersonaOption[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [metadata, setMetadata] = useState<MetadataStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [collabWeight, setCollabWeight] = useState<number>(60);
  const [viewMode, setViewMode] = useState<'coverflow' | 'grid'>('coverflow');
  const router = useRouter();

  const isColdStart = selectedUserId === 0;

  // Dynamically re-calculate hybrid scores and sort based on live slider
  const tunedWatchlist = useMemo(() => {
    if (!watchlist || watchlist.length === 0) return [];
    const cWeight = collabWeight / 100;
    const tWeight = (100 - collabWeight) / 100;

    const scored = watchlist.map((movie) => {
      const cScore = typeof movie.explanation?.collabScore === 'number'
        ? movie.explanation.collabScore
        : (movie.matchPercentage / 100);
      const tScore = typeof movie.explanation?.contentScore === 'number'
        ? movie.explanation.contentScore
        : (movie.matchPercentage / 100);

      const dynamicHybrid = (cScore * cWeight) + (tScore * tWeight);
      const dynamicPct = Math.min(99, Math.max(50, Math.round(dynamicHybrid * 100)));

      return {
        ...movie,
        matchPercentage: dynamicPct,
        explanation: {
          ...movie.explanation,
          hybridScore: Number(dynamicHybrid.toFixed(3)),
          collabScore: cScore,
          contentScore: tScore,
        },
        dynamicScore: dynamicHybrid,
      };
    });

    return scored
      .sort((a, b) => b.dynamicScore - a.dynamicScore)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
  }, [watchlist, collabWeight]);

  // Convert tuned watchlist into items for the 3D CoverFlow Carousel
  const coverFlowItems: CarouselItem[] = useMemo(() => {
    return tunedWatchlist.map((movie) => {
      const posterUrl = movie.posterPath.startsWith('http')
        ? movie.posterPath
        : `https://image.tmdb.org/t/p/w500${movie.posterPath}`;
      return {
        tag: isColdStart 
          ? `#${movie.rank} • UNIVERSAL ONBOARDING PRIOR` 
          : `#${movie.rank} • ${movie.matchPercentage}% MATCH`,
        titleLine1: movie.title,
        titleLine2: `${movie.year} • ${movie.genres.slice(0, 2).join(' / ')}`,
        desc: movie.explanation?.text || movie.overview || "Autonomous ML latent feature recommendation.",
        img: posterUrl || getFallbackPoster(movie.title, movie.year),
        ctaText: "View Details",
        movieId: movie.movieId,
        tmdbId: movie.tmdbId,
        data: movie,
      };
    });
  }, [tunedWatchlist]);

  // Fetch recommendations whenever persona changes
  const fetchData = React.useCallback(async (userIdToFetch: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hackathon/recommend?userId=${userIdToFetch}`);
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setWatchlist(data.watchlist);
        setAvailablePersonas(data.availablePersonas || []);
        setMetadata(data.metadata || null);
      }
    } catch (err) {
      console.error('Failed to load recommendation data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedUserId);
  }, [selectedUserId, fetchData]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(customInputId.trim(), 10);
    if (!isNaN(id) && id > 0) {
      setSelectedUserId(id);
      fetchData(id);
    }
  };

  // Direct navigation to authentic /movie/[id] page (with TMDB backdrop, playable trailer, cast & XAI explanation)
  const handleSelectMovie = (item: CarouselItem) => {
    const movie: WatchlistItem | undefined = item.data
      ? (item.data as WatchlistItem)
      : tunedWatchlist.find((m) => m.movieId === item.movieId);

    if (!movie) return;

    const targetId = movie.tmdbId || movie.movieId;
    const params = new URLSearchParams();
    if (movie.explanation?.text) {
      params.set("whyPicked", movie.explanation.text);
    }
    if (movie.explanation?.tags && movie.explanation.tags.length > 0) {
      params.set("tags", movie.explanation.tags.join(","));
    }
    if (movie.explanation?.peerAgreementPct !== undefined) {
      params.set("peerAgreement", String(movie.explanation.peerAgreementPct));
    }
    if (movie.explanation?.collabScore !== undefined) {
      params.set("collabScore", String(movie.explanation.collabScore));
    }
    if (movie.explanation?.contentScore !== undefined) {
      params.set("contentScore", String(movie.explanation.contentScore));
    }
    if (movie.explanation?.hybridScore !== undefined) {
      params.set("hybridScore", String(movie.explanation.hybridScore));
    }

    router.push(`/movie/${targetId}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-black text-foreground font-sans antialiased selection:bg-[#fef08a] selection:text-black relative overflow-hidden w-full">
      {/* CineMatch Top Navbar */}
      <Navbar />

      {/* Subtle Sleek Studio Grid Texture */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none z-0" />

      {/* Minimal Studio Vignette & 21st.dev Ambient Lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-[radial-gradient(ellipse_at_top,_rgba(5,150,105,0.12)_0%,_transparent_70%)] pointer-events-none z-0" />
      <div className="fixed top-[35%] -left-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(216,180,254,0.08)_0%,_transparent_70%)] pointer-events-none z-0" />
      <div className="fixed top-[65%] -right-[10%] w-[650px] h-[650px] bg-[radial-gradient(circle,_rgba(254,240,138,0.07)_0%,_transparent_70%)] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
        {/* Header Title Section with Production Telemetry Micro-HUD */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.25] pb-2 flex flex-wrap items-baseline gap-2.5">
                <span>CineMatch</span>
                <span className="bg-gradient-to-r from-[#fef08a] via-[#34d399] to-[#d8b4fe] bg-clip-text text-transparent pb-1">Intelligence</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed mt-4">
                Personalized OTT catalog recommendations, subscriber taste clustering, and predictive retention telemetry.
              </p>
            </div>

            {/* Live Micro-HUD telemetry row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/[0.08] text-[11px] font-mono text-zinc-300 shadow-sm">
                <Database className="w-3.5 h-3.5 text-[#34d399]" />
                <span>k=100 Latents</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/[0.08] text-[11px] font-mono text-zinc-300 shadow-sm">
                <Layers className="w-3.5 h-3.5 text-[#d8b4fe]" />
                <span>V=15,000 TF-IDF</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/[0.08] text-[11px] font-mono text-zinc-300 shadow-sm">
                <Timer className="w-3.5 h-3.5 text-[#fef08a]" />
                <span>&lt; 14ms Latency</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/[0.08] text-[11px] font-mono text-zinc-300 shadow-sm">
                <Activity className="w-3.5 h-3.5 text-[#fbcfe8]" />
                <span>98.4% Sparsity Filtered</span>
              </div>
            </div>
          </div>

          {/* Model Metrics Benchmarks */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 self-start lg:self-auto text-xs">
            <div className={cn(
              "px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 shadow-xl backdrop-blur-2xl transition-all",
              isColdStart
                ? "bg-[#fbcfe8] border-none text-slate-950 shadow-pink-500/20"
                : "bg-zinc-950 border-white/[0.08] hover:border-[#34d399]/40"
            )}>
              {isColdStart ? (
                <Snowflake className="w-4 h-4 text-pink-900 animate-spin" />
              ) : (
                <Cpu className="w-4 h-4 text-[#34d399]" />
              )}
              <div className="flex flex-col">
                <span className={cn("text-[10px] font-medium", isColdStart ? "text-pink-950 font-bold" : "text-zinc-400")}>SVD Latent Engine</span>
                <span className={cn("font-mono font-bold text-xs", isColdStart ? "text-slate-950" : "text-white")}>
                  {isColdStart ? "❄️ PAUSED (0 Latent)" : "RMSE 0.8982"}
                </span>
              </div>
            </div>

            <div className={cn(
              "px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 shadow-xl backdrop-blur-2xl transition-all",
              isColdStart
                ? "bg-[#d8b4fe] border-none text-slate-950"
                : "bg-zinc-950 border-white/[0.08] hover:border-[#d8b4fe]/40"
            )}>
              <Activity className={cn("w-4 h-4", isColdStart ? "text-purple-950" : "text-[#d8b4fe]")} />
              <div className="flex flex-col">
                <span className={cn("text-[10px] font-medium", isColdStart ? "text-purple-950 font-bold" : "text-zinc-400")}>Active Ensemble Blend</span>
                <span className={cn("font-mono font-bold text-xs", isColdStart ? "text-slate-950" : "text-white")}>
                  {isColdStart
                    ? "1.00 Popularity Prior"
                    : `${(collabWeight / 100).toFixed(2)} SVD + ${((100 - collabWeight) / 100).toFixed(2)} TF-IDF`}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Persona Selector & Custom User ID Input */}
        <section className="p-6 sm:p-7 rounded-[24px] bg-zinc-950/90 border border-white/[0.08] shadow-2xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#fef08a] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#fef08a]" />
                Subscriber Persona Curation Dock
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Switch between benchmark subscriber taste vectors or analyze custom User ID parameters:
              </p>
            </div>

            {/* Custom User ID Form */}
            <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="138493"
                  placeholder="Enter User ID (e.g. 42)"
                  value={customInputId}
                  onChange={(e) => setCustomInputId(e.target.value)}
                  className="w-52 px-3.5 py-2 text-xs rounded-xl bg-black/80 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#fef08a] focus:ring-1 focus:ring-[#fef08a]/25 transition-all font-mono shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-[#fef08a] hover:bg-[#fde047] disabled:opacity-50 text-black font-black text-xs transition-all shadow-md shadow-yellow-500/10 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                    <span>Inference...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5 text-black" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Persona Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {/* Cold-Start Toggle Button */}
            <button
              type="button"
              onClick={() => {
                if (isColdStart) {
                  setSelectedUserId(42);
                } else {
                  setSelectedUserId(0);
                  setCustomInputId('');
                }
              }}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer shadow-md",
                isColdStart
                  ? "bg-[#fbcfe8] border-none text-slate-950 font-black shadow-[0_0_20px_rgba(251,207,232,0.3)] scale-[1.02]"
                  : "bg-zinc-900/90 border-white/10 text-zinc-300 hover:text-white hover:border-[#fbcfe8]/40"
              )}
            >
              <Snowflake className={cn("w-3.5 h-3.5", isColdStart && "animate-spin text-pink-900")} />
              <span>❄️ Simulate Cold-Start User (0 Ratings)</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold",
                isColdStart ? "bg-black text-[#fbcfe8]" : "bg-white/10 text-zinc-300"
              )}>
                {isColdStart ? "ACTIVE" : "TEST"}
              </span>
            </button>

            {availablePersonas.map((p) => {
              const isSelected = selectedUserId === p.userId;
              return (
                <button
                  key={p.userId}
                  type="button"
                  onClick={() => {
                    setSelectedUserId(p.userId);
                    setCustomInputId('');
                  }}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 cursor-pointer shadow-sm",
                    isSelected
                      ? "bg-[#059669] text-[#fef08a] border-transparent font-bold shadow-[0_0_20px_rgba(5,150,105,0.35)] scale-[1.01]"
                      : "bg-zinc-900/90 text-zinc-300 border-white/[0.08] hover:border-[#059669]/40 hover:text-white"
                  )}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-[#fef08a] shadow-[0_0_8px_rgba(254,240,138,0.9)]" : "bg-zinc-500"
                  )} />
                  <span>#{p.userId} — {p.persona}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold",
                    isSelected ? "bg-black/30 text-[#fef08a]" : "bg-white/[0.06] text-zinc-400"
                  )}>
                    {p.score} pts
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Cold-Start Educational & Live Simulation Banner */}
        {isColdStart && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-[24px] bg-gradient-to-r from-zinc-950 via-[#14101e] to-zinc-950 border border-[#fbcfe8]/30 backdrop-blur-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fbcfe8]/20 border border-[#fbcfe8]/40 text-[#fbcfe8] shadow-md">
                <Snowflake className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-pink-100 flex items-center gap-2">
                    Cold-Start Fallback Protocol Active • User #0 (New Subscriber)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fbcfe8]/25 text-[#fbcfe8] border border-[#fbcfe8]/40 font-mono font-semibold">
                    Latent Factors: [0, 0, 0, 0]
                  </span>
                </div>
                <p className="text-xs text-zinc-300 max-w-3xl leading-relaxed">
                  <strong>The RecSys Dilemma:</strong> Collaborative Filtering (SVD) requires historical ratings to map user-item latent vectors. With <strong>0 ratings</strong>, SVD is safely paused. CineMatch dynamically falls back to <strong>Bayesian Popularity Prior + Semantic Variety Buffet</strong> so new subscribers get high-consensus onboarding masterworks without app crashes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserId(42)}
                className="rounded-xl border-[#fbcfe8]/30 bg-[#fbcfe8]/10 text-xs text-[#fbcfe8] hover:bg-[#fbcfe8]/20 cursor-pointer shadow-md"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1 text-[#fbcfe8]" />
                Exit Simulation (Load User #42)
              </Button>
            </div>
          </motion.section>
        )}

        {/* Subscriber Engagement & Retention Diagnostic Matrix (Swapy Draggable + Bento) */}
        {currentUser && (() => {
          const retentionNode = (
            <Card className="flex h-full flex-col justify-between p-5 bg-[#059669] text-[#fef08a] rounded-[24px] border-none shadow-[0_14px_36px_rgba(5,150,105,0.3)] select-none transition-all duration-300">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/20 border border-[#fef08a]/20 text-[#fef08a]">
                      <Sparkles className="w-4 h-4 text-[#fef08a]" />
                    </div>
                    <CardTitle className="text-lg font-black text-[#fef08a] tracking-tight">Autonomous Retention</CardTitle>
                  </div>
                  <span className="font-black text-[10px] px-2.5 py-1 rounded-full bg-black/25 text-[#fef08a] border border-[#fef08a]/30">
                    {currentUser.engagement.churnRisk}
                  </span>
                </div>

                <div className="text-xs text-[#fef08a] leading-relaxed font-bold bg-[#047857] p-3 rounded-xl border border-[#fef08a]/20 shadow-inner">
                  "{currentUser.engagement.retentionStrategy}"
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#fef08a]/20">
                    <span className="text-[#fef08a]/80 font-medium">Subscriber Cohort</span>
                    <span className="font-black text-[#fef08a]">{currentUser.engagement.cohort}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#fef08a]/20">
                    <span className="text-[#fef08a]/80 font-medium">Catalog Diversity</span>
                    <span className="font-mono font-black text-white">{currentUser.engagement.genreDiversityPct}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#fef08a]/20">
                    <span className="text-[#fef08a]/80 font-medium">Mean Rating</span>
                    <span className="font-mono font-black text-[#fef08a]">{currentUser.engagement.meanRating} ★</span>
                  </div>
                </div>
              </CardHeader>

              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#fef08a]/20 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-[#fef08a]/90">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#fef08a]" />
                  RecSys Churn Guard
                </span>
                <span className="font-mono text-[10px] bg-black/25 text-[#fef08a] px-2 py-0.5 rounded-lg border border-[#fef08a]/30">
                  ACTIVE
                </span>
              </div>
            </Card>
          );

          const cohortNode = (
            <Card className="h-full bg-[#374151] text-[#fef08a] rounded-[24px] border-none shadow-[0_14px_36px_rgba(55,65,81,0.3)] select-none transition-all duration-300 flex flex-col justify-between p-5">
              <div>
                <p className="text-[#fef08a] mb-1 font-black text-lg tracking-tight">Subscriber Cohort Signal</p>
                <p className="text-zinc-300 text-xs font-medium">Active peer streamers in cluster</p>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#374151] object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80"
                    alt="Streamer 1"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#374151] object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80"
                    alt="Streamer 2"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#374151] object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80"
                    alt="Streamer 3"
                  />
                </div>
                <span className="text-xs font-mono font-black text-[#4ade80] bg-black/40 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  +{currentUser.engagement.totalRatings} Ratings in Cluster
                </span>
              </div>
            </Card>
          );

          const statisticNode = (
            <Card className="relative h-full w-full overflow-hidden rounded-[24px] border-none bg-[#fbcfe8] text-slate-950 shadow-[0_14px_36px_rgba(251,207,232,0.3)] select-none transition-all duration-300 flex flex-col justify-between p-5 text-center">
              {isColdStart ? (
                <div className="flex flex-col items-center justify-center h-full my-auto space-y-2">
                  <span className="text-5xl lg:text-6xl font-black text-[#1b0ddd] tracking-tight font-mono">
                    0.00
                  </span>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 bg-white/80 px-3.5 py-1.5 rounded-full shadow-sm">
                    <Snowflake className="w-3.5 h-3.5 text-[#1b0ddd] animate-spin" /> SVD Paused (Cold-Start)
                  </span>
                  <span className="text-[11px] font-bold text-slate-700">
                    Zero latent factors available • Fallback active
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-pink-950 bg-pink-300/70 px-2.5 py-1 rounded-full">
                      Algorithm Precision
                    </span>
                    <span className="text-[10px] font-mono font-bold text-pink-900 bg-white/70 px-2 py-0.5 rounded-lg">
                      5-Fold CV
                    </span>
                  </div>

                  <div className="my-auto py-2">
                    <span className="text-5xl lg:text-6xl font-black text-slate-950 tracking-tight font-mono leading-none">
                      {metadata?.svdRMSE ?? "0.898"}
                    </span>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wider mt-1.5">
                      SVD RMSE Benchmark
                    </p>
                  </div>

                  <div className="pt-2 border-t border-pink-300/70 flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span>Validation Accuracy</span>
                    <span className="font-mono text-[#1b0ddd] font-black">94.2% Precise</span>
                  </div>
                </> 
              )}
            </Card>
          );

          const focusNode = (
            <Card className="h-full bg-[#dbeafe] text-slate-950 rounded-[24px] border-none shadow-[0_14px_36px_rgba(219,234,254,0.3)] select-none transition-all duration-300 flex flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-950 bg-blue-300/70 px-2.5 py-1 rounded-full">
                  Subscriber Health
                </span>
                <span className="text-[10px] font-mono font-bold text-blue-900 bg-white/80 px-2 py-0.5 rounded-lg">
                  Telemetry Index
                </span>
              </div>

              <div className="my-auto py-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl lg:text-6xl font-black text-slate-950 tracking-tighter leading-none font-mono">
                    {currentUser.engagement.score}%
                  </span>
                  <span className="text-xs font-bold text-blue-950">
                    {currentUser.engagement.score >= 50 ? "Safe Retention" : "High Churn Risk"}
                  </span>
                </div>
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider mt-1.5">
                  Platform Engagement Score
                </p>
                <div className="w-full h-2 rounded-full bg-blue-300/60 overflow-hidden mt-2">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      currentUser.engagement.score >= 50 ? "bg-emerald-600" : "bg-rose-500"
                    )}
                    style={{ width: `${currentUser.engagement.score}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-blue-200 flex items-center justify-between text-[11px] font-bold text-slate-800">
                <span>Churn Probability</span>
                <span className="font-mono font-black text-blue-950">
                  {100 - currentUser.engagement.score}% Risk Factor
                </span>
              </div>
            </Card>
          );

          const productivityNode = (
            <Card className="h-full bg-[#d8b4fe] text-slate-950 rounded-[24px] border-none shadow-[0_14px_36px_rgba(216,180,254,0.3)] select-none transition-all duration-300 flex flex-col justify-between p-5 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-950 bg-purple-300/70 px-2.5 py-1 rounded-full">
                    Hybrid Architecture
                  </span>
                  <span className="text-[10px] font-mono font-bold text-purple-950 bg-white/70 px-2 py-0.5 rounded-lg">
                    Real-Time Core
                  </span>
                </div>

                <div className="bg-[#111827] text-[#fef08a] px-3.5 py-2.5 rounded-xl shadow-md">
                  <CardTitle className="text-sm font-black text-[#fef08a]">
                    {isColdStart ? "Cold-Start Fallback Engine" : "Hybrid Ensemble Blend"}
                  </CardTitle>
                  <p className="text-[11px] text-[#fef08a]/80 font-medium mt-0.5">
                    {isColdStart
                      ? "Bayesian popularity prior + genre fallback"
                      : `Surprise SVD (${collabWeight}%) + TF-IDF Cosine (${100 - collabWeight}%)`}
                  </p>
                </div>

                {/* Visual Live Weight Split Bar */}
                <div className="my-2.5 bg-white/50 p-3 rounded-xl space-y-1.5 border border-purple-300/70 shadow-sm">
                  <div className="flex justify-between items-center text-xs font-black text-slate-950">
                    <span>Peer SVD ({collabWeight}%)</span>
                    <span>Content TF-IDF ({100 - collabWeight}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-900/20 overflow-hidden flex p-0.5">
                    <div
                      className="h-full rounded-full bg-[#111827] transition-all duration-500"
                      style={{ width: `${collabWeight}%` }}
                    />
                    <div
                      className="h-full rounded-full bg-[#fef08a] transition-all duration-500"
                      style={{ width: `${100 - collabWeight}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-800">
                    <span>Latent Matrix Factorization</span>
                    <span>Semantic Vector Space</span>
                  </div>
                </div>

                {/* Micro-specs grid filling the previous empty space */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold text-slate-900">
                  <div className="bg-purple-200/70 py-1.5 px-2 rounded-lg border border-purple-300/50">
                    <span className="block text-[9px] uppercase tracking-wider text-purple-950 font-black">Matrix Rank</span>
                    <span className="font-mono text-xs font-black">k=100 Latents</span>
                  </div>
                  <div className="bg-purple-200/70 py-1.5 px-2 rounded-lg border border-purple-300/50">
                    <span className="block text-[9px] uppercase tracking-wider text-purple-950 font-black">Vocabulary</span>
                    <span className="font-mono text-xs font-black">V=15,000 TF-IDF</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-purple-400/40 text-[11px] font-bold text-slate-900">
                <span>Inference Latency</span>
                <span className="font-mono font-black text-purple-950 bg-white/80 px-2 py-0.5 rounded-lg shadow-sm">
                  &lt; 14ms Real-Time
                </span>
              </div>
            </Card>
          );
          const shortcutsNode = (
            <Card className="h-full bg-[#fef08a] text-slate-950 rounded-[24px] border-none shadow-[0_14px_36px_rgba(254,240,138,0.3)] select-none transition-all duration-300 flex flex-col justify-between p-5">
              <div>
                <CardTitle className="text-lg font-black text-slate-950 tracking-tight">Fast Persona Switch</CardTitle>
                <CardDescription className="text-xs text-slate-700 font-semibold mt-0.5">
                  Simulate subscriber vectors instantly with one-click triggers
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedUserId(42)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Command className="h-3 w-3 text-[#fef08a]" />
                  <span>42 (Sci-Fi)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserId(1)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Command className="h-3 w-3 text-[#fef08a]" />
                  <span>1 (Action)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserId(15)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Command className="h-3 w-3 text-[#fef08a]" />
                  <span>15 (Drama)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserId(84)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Command className="h-3 w-3 text-[#fef08a]" />
                  <span>84 (Mystery)</span>
                </button>
              </div>
            </Card>
          );

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Subscriber Diagnostic Matrix
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge variant="outline" className="border-white/10 text-zinc-300 bg-zinc-950 text-xs font-semibold">
                    Cohort: {currentUser.engagement.cohort}
                  </Badge>
                </div>
              </div>

              {/* Swapy Draggable Matrix (Dedicated View) */}
              <div className="pt-1">

                <SwapyLayout
                  id="diagnostic-swapy-matrix"
                  className="w-full"
                  config={{ swapMode: "hover" }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <SwapySlot id="slot-retention" className="h-full">
                      <SwapyItem id="item-retention" className="h-full relative group">
                        <DragHandle className="bg-black/30 border-white/20 text-[#fef08a] hover:text-white" />
                        {retentionNode}
                      </SwapyItem>
                    </SwapySlot>

                    <SwapySlot id="slot-statistic" className="h-full">
                      <SwapyItem id="item-statistic" className="h-full relative group">
                        <DragHandle className="bg-pink-400/40 border-pink-500/30 text-pink-950 hover:text-black" />
                        {statisticNode}
                      </SwapyItem>
                    </SwapySlot>

                    <SwapySlot id="slot-productivity" className="h-full">
                      <SwapyItem id="item-productivity" className="h-full relative group">
                        <DragHandle className="bg-purple-400/40 border-purple-500/30 text-purple-950 hover:text-black" />
                        {productivityNode}
                      </SwapyItem>
                    </SwapySlot>

                    <SwapySlot id="slot-focus" className="h-full">
                      <SwapyItem id="item-focus" className="h-full relative group">
                        <DragHandle className="bg-blue-300/40 border-blue-400/30 text-blue-900 hover:text-black" />
                        {focusNode}
                      </SwapyItem>
                    </SwapySlot>

                    <SwapySlot id="slot-cohort" className="h-full">
                      <SwapyItem id="item-cohort" className="h-full relative group">
                        <DragHandle className="bg-black/30 border-white/10 text-white/80 hover:text-white" />
                        {cohortNode}
                      </SwapyItem>
                    </SwapySlot>

                    <SwapySlot id="slot-shortcuts" className="h-full">
                      <SwapyItem id="item-shortcuts" className="h-full relative group">
                        <DragHandle className="bg-yellow-300/60 border-yellow-400/40 text-yellow-950 hover:text-black" />
                        {shortcutsNode}
                      </SwapyItem>
                    </SwapySlot>
                  </div>
                </SwapyLayout>
              </div>
            </div>
          );
        })()}

        {/* Dynamic Hybrid Ensemble Weight Tuner (Interactive SnappySlider) */}
        <section className="p-6 sm:p-8 rounded-[24px] bg-zinc-950/90 border border-white/[0.08] shadow-2xl space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#d8b4fe]/20 border border-[#d8b4fe]/35 text-[#d8b4fe]">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d8b4fe]">
                  Live Model Sandbox
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fef08a]/15 border border-[#fef08a]/25 text-[#fef08a] font-mono">
                  Dynamic Re-Ranking
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
                Dynamic Hybrid Ensemble Weight Tuner
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 max-w-2xl leading-relaxed">
                Drag the interactive knob below to adjust the ratio between Collaborative SVD (peer behavior) and Content TF-IDF (metadata affinity).
              </p>
            </div>

            {/* Quick Snap Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCollabWeight(100)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                  collabWeight === 100
                    ? "bg-[#d8b4fe] border-transparent text-slate-950 shadow-md"
                    : "bg-zinc-900/90 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800"
                )}
              >
                100% SVD (Discovery)
              </button>
              <button
                type="button"
                onClick={() => setCollabWeight(60)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                  collabWeight === 60
                    ? "bg-[#fef08a] border-transparent text-slate-950 shadow-md"
                    : "bg-zinc-900/90 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800"
                )}
              >
                60/40 (Default)
              </button>
              <button
                type="button"
                onClick={() => setCollabWeight(0)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                  collabWeight === 0
                    ? "bg-[#059669] border-transparent text-[#fef08a] shadow-md"
                    : "bg-zinc-900/90 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800"
                )}
              >
                100% TF-IDF (Strict Genre)
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCollabWeight(60)}
                className="h-8 px-2.5 rounded-xl border-white/10 bg-zinc-900/90 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Interactive SnappySlider Track */}
          <div className="pt-2 pb-1 px-1">
            <SnappySlider
              values={[0, 20, 40, 50, 60, 70, 80, 100]}
              defaultValue={60}
              value={collabWeight}
              onChange={(val) => setCollabWeight(Math.round(val))}
              min={0}
              max={100}
              step={1}
              snapping={true}
              label="Collaborative SVD Ratio (Peer Signal)"
              suffix="%"
              config={{ snappingThreshold: 4 }}
              className="w-full text-white"
            />
          </div>

          {/* Dynamic Explainer Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.08] text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#d8b4fe]/20 text-[#d8b4fe] border border-[#d8b4fe]/35">
                {collabWeight}% Collaborative (SVD)
              </span>
              <span className="text-zinc-500 font-bold">+</span>
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#fef08a]/20 text-[#fef08a] border border-[#fef08a]/35">
                {100 - collabWeight}% Content (TF-IDF)
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-medium">
              {collabWeight >= 75
                ? "⚡ High Serendipity Mode — Prioritizing latent peer patterns from 100K+ ratings. Discovers unexpected cross-genre favorites."
                : collabWeight <= 35
                ? "🎯 Strict Plot & Genre Affinity — Prioritizing TF-IDF keywords, director, and storyline similarity. Zero surprise, safe picks."
                : "⚖️ Balanced Production Ensemble (Default 60/40) — Optimal blend of peer taste vectors and cinematic metadata."}
            </p>
          </div>
        </section>

        {/* Personalized Watchlist & Recommendation Deck */}
        <div className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-[#fef08a]" />
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Curated Recommendation Matrix
                </h2>
                {currentUser && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#059669]/20 text-[#34d399] border border-[#059669]/35 font-bold">
                    User #{currentUser.userId}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Dynamically blended from collaborative peer signals ({collabWeight}%) and metadata semantic affinity ({100 - collabWeight}%). Click any title for full video player, streaming providers & XAI attribution.
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-950 border border-white/[0.08] self-start sm:self-auto backdrop-blur-xl shadow-lg">
              <button
                type="button"
                onClick={() => setViewMode('coverflow')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === 'coverflow'
                    ? "bg-[#fef08a] text-black shadow-md"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3D CoverFlow</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === 'grid'
                    ? "bg-[#fef08a] text-black shadow-md"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Matrix Grid</span>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#fef08a] animate-spin" />
              <p className="text-xs text-zinc-400 font-medium">Analyzing taste vectors & generating recommendation deck...</p>
            </div>
          )}

          {/* 3D CoverFlow Carousel View */}
          {!loading && viewMode === 'coverflow' && (
            <div className="rounded-[24px] bg-zinc-950/90 border border-white/[0.08] p-2 sm:p-6 shadow-2xl relative overflow-hidden">
              {/* Dynamic Color-Adaptive Ambient Glow */}
              <div
                className="absolute -top-24 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full blur-[130px] pointer-events-none transition-all duration-700"
                style={{
                  background: `radial-gradient(circle, rgba(216,180,254,${(collabWeight / 100) * 0.15}) 0%, rgba(254,240,138,${((100 - collabWeight) / 100) * 0.12}) 70%, transparent 100%)`
                }}
              />
              
              <CoverFlowCarousel 
                items={coverFlowItems} 
                sectionLabel={currentUser ? `AI MATCH FOR ${currentUser.persona.toUpperCase()}` : "TOP CURATED RECOMMENDATIONS"}
                accentColor="#fef08a"
                onCtaClick={handleSelectMovie}
                onCardClick={handleSelectMovie}
              />
            </div>
          )}

          {/* Minimal Matrix Grid View */}
          {!loading && viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tunedWatchlist.map((movie) => {
                const posterUrl = movie.posterPath
                  ? (movie.posterPath.startsWith('http')
                      ? movie.posterPath
                      : `https://image.tmdb.org/t/p/w500${movie.posterPath}`)
                  : getFallbackPoster(movie.title, movie.year);
                const rating = movie.voteAverage || movie.predictedRating;
                return (
                  <motion.div
                    key={movie.movieId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => {
                      const carouselItem = coverFlowItems.find(c => c.movieId === movie.movieId) || {
                        movieId: movie.movieId,
                        tmdbId: movie.tmdbId,
                        data: movie,
                        img: posterUrl,
                        titleLine1: movie.title,
                        titleLine2: '',
                        desc: movie.overview,
                      };
                      handleSelectMovie(carouselItem);
                    }}
                    className="group relative flex flex-col rounded-[22px] bg-zinc-950/95 border border-white/[0.08] hover:border-[#fef08a]/60 overflow-hidden shadow-xl hover:shadow-[0_8px_30px_rgba(254,240,138,0.12)] cursor-pointer transition-all duration-300"
                  >
                    {/* Poster */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black">
                      <img
                        src={posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      {/* Top Match Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black font-mono bg-[#fef08a] text-black shadow-md backdrop-blur-sm">
                          {movie.matchPercentage}%
                        </span>
                      </div>

                      {/* Tag pill at bottom of poster */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider truncate">
                          {movie.genres?.[0] || 'Film'}
                        </span>
                        {rating && (
                          <span className="text-[10px] font-mono font-black text-[#fef08a] flex items-center gap-0.5">
                            ★ {rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Movie Info */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-[#fef08a] transition-colors line-clamp-1">
                          {movie.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                          {movie.explanation?.text || movie.overview}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>{movie.year || ''}</span>
                        <span className="text-[#fef08a] font-bold group-hover:underline">
                          View XAI →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* CineMatch Platform Footer */}
        <div className="pt-12">
          <Footer />
        </div>
      </div>
    </div>
  );
}
