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
  GripVertical,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/sections/navbar';
import { SnappySlider } from '@/components/ui/snappy-slider';
import { CoverFlowCarousel, type CarouselItem } from '@/components/ui/3-d-coverflow-carousel';
import { BentoGridShowcase } from '@/components/ui/bento-product-features';
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
  const [diagnosticLayout, setDiagnosticLayout] = useState<'swapy' | 'bento'>('swapy');
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
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* CineMatch Top Navbar */}
      <Navbar />

      {/* Dynamic cinema-grade ambient glows matching main dashboard */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[35%] -left-[15%] w-[650px] h-[650px] bg-purple-500/5 rounded-full blur-[170px]" />
        <div className="absolute top-[65%] -right-[15%] w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-[170px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
        {/* Header Title Section with Production Telemetry Micro-HUD */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Cognizant Hackathon • Track #6
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live RecSys Core v2.4
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/25 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Dual-Hybrid SVD+TF-IDF
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              CineMatch <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent font-light">Intelligence</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Personalized OTT catalog recommendations, subscriber taste clustering, and predictive retention telemetry.
            </p>

            {/* Live Micro-HUD telemetry row */}
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-zinc-300">
                <Database className="w-3 h-3 text-cyan-400" />
                <span>k=100 Latents</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-zinc-300">
                <Layers className="w-3 h-3 text-purple-400" />
                <span>V=15,000 TF-IDF</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-zinc-300">
                <Timer className="w-3 h-3 text-emerald-400" />
                <span>&lt; 14ms Latency</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-zinc-300">
                <Activity className="w-3 h-3 text-sky-400" />
                <span>98.4% Sparsity Filtered</span>
              </div>
            </div>
          </div>

          {/* Model Metrics Benchmarks */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 self-start lg:self-auto text-xs">
            <div className={cn(
              "px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 shadow-xl backdrop-blur-xl transition-all",
              isColdStart
                ? "bg-cyan-950/60 border-cyan-400/40 text-cyan-200 shadow-cyan-500/10"
                : "bg-zinc-950/60 border-white/[0.08] hover:border-white/20"
            )}>
              {isColdStart ? (
                <Snowflake className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : (
                <Cpu className="w-4 h-4 text-cyan-400" />
              )}
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-medium">SVD Latent Engine</span>
                <span className="font-mono font-bold text-white text-xs">
                  {isColdStart ? "❄️ PAUSED (0 Latent)" : "RMSE 0.8982"}
                </span>
              </div>
            </div>

            <div className={cn(
              "px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 shadow-xl backdrop-blur-xl transition-all",
              isColdStart
                ? "bg-cyan-950/60 border-cyan-400/40 text-cyan-200"
                : "bg-zinc-950/60 border-white/[0.08] hover:border-white/20"
            )}>
              <Activity className={cn("w-4 h-4", isColdStart ? "text-cyan-400" : "text-purple-400")} />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-medium">Active Ensemble Blend</span>
                <span className="font-mono font-bold text-white text-xs">
                  {isColdStart
                    ? "1.00 Popularity Prior"
                    : `${(collabWeight / 100).toFixed(2)} SVD + ${((100 - collabWeight) / 100).toFixed(2)} TF-IDF`}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Persona Selector & Custom User ID Input */}
        <section className="p-6 rounded-3xl bg-zinc-950/50 border border-white/[0.08] backdrop-blur-2xl shadow-2xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Subscriber Persona Curation Dock
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
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
                  className="w-52 px-3.5 py-2 text-xs rounded-xl bg-black/60 border border-white/[0.1] text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Inference...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
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
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer",
                isColdStart
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]"
                  : "bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400"
              )}
            >
              <Snowflake className={cn("w-3.5 h-3.5", isColdStart && "animate-spin text-cyan-300")} />
              <span>❄️ Simulate Cold-Start User (0 Ratings)</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold",
                isColdStart ? "bg-cyan-400 text-zinc-950" : "bg-cyan-500/20 text-cyan-300"
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
                    "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 cursor-pointer",
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500/20 via-sky-500/20 to-indigo-500/20 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] scale-[1.01]"
                      : "bg-black/40 text-zinc-300 border-white/[0.08] hover:border-white/20 hover:bg-zinc-900/80 hover:text-white"
                  )}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "bg-zinc-500"
                  )} />
                  <span>#{p.userId} — {p.persona}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-mono font-medium",
                    isSelected ? "bg-cyan-400/20 text-cyan-200 font-bold border border-cyan-400/30" : "bg-white/[0.06] text-zinc-400"
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
            className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-zinc-900/90 to-cyan-950/60 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Snowflake className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-cyan-100 flex items-center gap-2">
                    Cold-Start Fallback Protocol Active • User #0 (New Subscriber)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-semibold">
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
                className="rounded-xl border-cyan-500/30 bg-cyan-950/40 text-xs text-cyan-200 hover:bg-cyan-900/60 hover:border-cyan-400 cursor-pointer shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1 text-cyan-400" />
                Exit Simulation (Load User #42)
              </Button>
            </div>
          </motion.section>
        )}

        {/* Subscriber Engagement & Retention Diagnostic Matrix (Swapy Draggable + Bento) */}
        {currentUser && (() => {
          const retentionNode = (
            <Card className="flex h-full flex-col justify-between p-6 bg-zinc-950/50 border-white/[0.08] backdrop-blur-2xl shadow-xl hover:border-cyan-500/30 transition-all duration-300">
              <CardHeader className="p-0">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg font-bold text-white">Autonomous Retention</CardTitle>
                  <Badge variant="outline" className={cn(
                    "font-semibold text-[10px]",
                    currentUser.engagement.churnRisk.includes('Low')
                      ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/10"
                      : currentUser.engagement.churnRisk.includes('Moderate')
                      ? "border-amber-500/20 text-amber-400 bg-amber-500/10"
                      : "border-rose-500/20 text-rose-400 bg-rose-500/10"
                  )}>
                    {currentUser.engagement.churnRisk}
                  </Badge>
                </div>
                <CardDescription className="mt-3 text-xs text-zinc-300 leading-relaxed font-medium bg-black/60 p-3.5 rounded-xl border border-white/[0.06]">
                  "{currentUser.engagement.retentionStrategy}"
                </CardDescription>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-muted-foreground">Subscriber Cohort</span>
                    <span className="font-semibold text-white">{currentUser.engagement.cohort}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-muted-foreground">Catalog Diversity</span>
                    <span className="font-mono font-bold text-white">{currentUser.engagement.genreDiversityPct}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-muted-foreground">Mean Rating</span>
                    <span className="font-mono font-bold text-amber-400">{currentUser.engagement.meanRating} ★</span>
                  </div>
                </div>
              </CardHeader>

              <CardFooter className="mt-6 flex items-center justify-between p-0 pt-4 border-t border-white/[0.08]">
                <Button variant="outline" size="sm" className="border-white/10 text-xs font-semibold hover:bg-white/5 hover:border-cyan-500/30 text-zinc-300 cursor-pointer">
                  <ShieldAlert className="mr-1.5 h-3.5 w-3.5 text-cyan-400" />
                  Live Protocol
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground font-medium">Auto-Intervene</span>
                  <Switch defaultChecked className="data-[state=checked]:bg-cyan-500" aria-label="Toggle autonomous retention" />
                </div>
              </CardFooter>
            </Card>
          );

          const cohortNode = (
            <Card className="h-full bg-zinc-950/50 border-white/[0.08] backdrop-blur-2xl shadow-xl hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between">
              <CardContent className="flex h-full flex-col justify-between p-6">
                <div>
                  <CardTitle className="text-base font-semibold text-white">Subscriber Cohort Signal</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">Active peer streamers in cluster</CardDescription>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-950 object-cover"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80"
                      alt="Streamer 1"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-950 object-cover"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80"
                      alt="Streamer 2"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-950 object-cover"
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80"
                      alt="Streamer 3"
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold text-cyan-300">
                    +{currentUser.engagement.totalRatings} Ratings
                  </span>
                </div>
              </CardContent>
            </Card>
          );

          const statisticNode = (
            <Card className={cn(
              "relative h-full w-full overflow-hidden border backdrop-blur-2xl shadow-xl transition-all duration-300",
              isColdStart ? "bg-cyan-950/50 border-cyan-400/40 shadow-cyan-500/10" : "bg-zinc-950/50 border-white/[0.08] hover:border-cyan-500/30"
            )}>
              <CardContent className="relative z-10 flex flex-col h-full items-center justify-center p-6 text-center">
                {isColdStart ? (
                  <>
                    <span className="text-4xl lg:text-5xl font-black text-cyan-400 tracking-tight font-mono">
                      0.00
                    </span>
                    <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider mt-2 flex items-center gap-1">
                      <Snowflake className="w-3.5 h-3.5 animate-spin" /> SVD Paused (Cold-Start)
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1">
                      Zero latent factors available
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-5xl lg:text-6xl font-black text-white tracking-tight font-mono">
                      {metadata?.svdRMSE ?? "0.898"}
                    </span>
                    <span className="text-xs font-semibold text-cyan-300/80 uppercase tracking-wider mt-2">
                      SVD RMSE Benchmark
                    </span>
                  </>
                )}
              </CardContent>
            </Card>
          );

          const focusNode = (
            <Card className="h-full bg-zinc-950/50 border-white/[0.08] backdrop-blur-2xl shadow-xl hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between">
              <CardContent className="flex h-full flex-col justify-between p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-white">Engagement Index</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Activity & Health Score</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-white/10 text-zinc-300 bg-white/5 text-xs font-semibold">
                    {currentUser.engagement.cohort}
                  </Badge>
                </div>
                <div className="py-2">
                  <span className="text-5xl font-black text-white">{currentUser.engagement.score}%</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-white/[0.06]">
                  <span>Diversity: {currentUser.engagement.genreDiversityPct}%</span>
                  <span>Ratings: {currentUser.engagement.totalRatings}</span>
                </div>
              </CardContent>
            </Card>
          );

          const productivityNode = (
            <Card className={cn(
              "h-full border backdrop-blur-2xl shadow-xl transition-all duration-300 flex flex-col justify-between",
              isColdStart ? "bg-cyan-950/50 border-cyan-400/40" : "bg-zinc-950/50 border-white/[0.08] hover:border-cyan-500/30"
            )}>
              <CardContent className="flex h-full flex-col justify-between p-6">
                <div>
                  <CardTitle className="text-base font-semibold text-white">
                    {isColdStart ? "Cold-Start Fallback Engine" : "Hybrid Ensemble"}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    {isColdStart
                      ? "SVD paused. Serving universal Bayesian popularity prior + diverse genre buffet."
                      : `Surprise SVD (${collabWeight}%) + TF-IDF Cosine (${100 - collabWeight}%) dynamically tuned.`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  {isColdStart ? (
                    <>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-200">
                        0% SVD (Paused)
                      </span>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-200">
                        100% Popularity Prior
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/35 text-purple-200">
                        {collabWeight}% SVD
                      </span>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/35 text-cyan-200">
                        {100 - collabWeight}% Content
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );

          const shortcutsNode = (
            <Card className="h-full bg-zinc-950/50 border-white/[0.08] backdrop-blur-2xl shadow-xl hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between">
              <CardContent className="flex h-full flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <CardTitle className="text-base font-semibold text-white">Fast Persona Switch</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Simulate subscriber vectors instantly with one-click triggers
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(42)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-black/40 hover:border-cyan-400/40 hover:bg-cyan-950/30 hover:text-cyan-200 text-xs font-mono font-medium text-zinc-300 transition-all cursor-pointer"
                  >
                    <Command className="h-3 w-3" />
                    <span>42 (Sci-Fi)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-black/40 hover:border-cyan-400/40 hover:bg-cyan-950/30 hover:text-cyan-200 text-xs font-mono font-medium text-zinc-300 transition-all cursor-pointer"
                  >
                    <Command className="h-3 w-3" />
                    <span>1 (Action)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(15)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-black/40 hover:border-cyan-400/40 hover:bg-cyan-950/30 hover:text-cyan-200 text-xs font-mono font-medium text-zinc-300 transition-all cursor-pointer"
                  >
                    <Command className="h-3 w-3" />
                    <span>15 (Drama)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(84)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-black/40 hover:border-cyan-400/40 hover:bg-cyan-950/30 hover:text-cyan-200 text-xs font-mono font-medium text-zinc-300 transition-all cursor-pointer"
                  >
                    <Command className="h-3 w-3" />
                    <span>84 (Mystery)</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          );

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Subscriber Telemetry & Insights
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 flex items-center gap-1 font-mono">
                      <GripVertical className="w-3 h-3 text-cyan-400" />
                      Swapy Draggable
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                    Subscriber Diagnostic Matrix
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <Badge variant="outline" className="border-cyan-500/25 text-cyan-300 bg-cyan-500/10 text-xs font-medium">
                    Cohort: {currentUser.engagement.cohort}
                  </Badge>

                  {/* Diagnostic Layout Switcher */}
                  <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/60 border border-white/[0.1] backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={() => setDiagnosticLayout('swapy')}
                      className={cn(
                        "px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                        diagnosticLayout === 'swapy'
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/20"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                      <span>Swapy Drag & Swap</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiagnosticLayout('bento')}
                      className={cn(
                        "px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                        diagnosticLayout === 'bento'
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/20"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Classic Bento</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Swapy Draggable Layout */}
              {diagnosticLayout === 'swapy' ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 px-1 font-medium">
                    <GripVertical className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Interactive Workspace: Grab any card by the handle in the top right to rearrange and swap your cockpit metrics live.</span>
                  </p>

                  <SwapyLayout
                    id="diagnostic-swapy-matrix"
                    className="w-full"
                    config={{ swapMode: "hover" }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <SwapySlot id="slot-retention" className="h-full">
                        <SwapyItem id="item-retention" className="h-full relative group">
                          <DragHandle className="opacity-70 group-hover:opacity-100 transition-opacity" />
                          {retentionNode}
                        </SwapyItem>
                      </SwapySlot>

                      <SwapySlot id="slot-statistic" className="h-full">
                        <SwapyItem id="item-statistic" className="h-full relative group">
                          <DragHandle className="opacity-70 group-hover:opacity-100 transition-opacity" />
                          {statisticNode}
                        </SwapyItem>
                      </SwapySlot>

                      <SwapySlot id="slot-productivity" className="h-full">
                        <SwapyItem id="item-productivity" className="h-full relative group">
                          <DragHandle className="opacity-70 group-hover:opacity-100 transition-opacity" />
                          {productivityNode}
                        </SwapyItem>
                      </SwapySlot>

                      <SwapySlot id="slot-focus" className="h-full">
                        <SwapyItem id="item-focus" className="h-full relative group">
                          <DragHandle className="opacity-70 group-hover:opacity-100 transition-opacity" />
                          {focusNode}
                        </SwapyItem>
                      </SwapySlot>

                      <SwapySlot id="slot-cohort" className="h-full">
                        <SwapyItem id="item-cohort" className="h-full relative group">
                          <DragHandle className="opacity-70 group-hover:opacity-100 transition-opacity" />
                          {cohortNode}
                        </SwapyItem>
                      </SwapySlot>

                      <SwapySlot id="slot-shortcuts" className="h-full">
                        <SwapyItem id="item-shortcuts" className="h-full relative group">
                          <DragHandle className="opacity-70 group-hover:opacity-100 transition-opacity" />
                          {shortcutsNode}
                        </SwapyItem>
                      </SwapySlot>
                    </div>
                  </SwapyLayout>
                </div>
              ) : (
                <BentoGridShowcase
                  integration={retentionNode}
                  trackers={cohortNode}
                  statistic={statisticNode}
                  focus={focusNode}
                  productivity={productivityNode}
                  shortcuts={shortcutsNode}
                />
              )}
            </div>
          );
        })()}

        {/* Dynamic Hybrid Ensemble Weight Tuner (Interactive SnappySlider) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-950/50 border border-white/[0.08] backdrop-blur-2xl shadow-2xl space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Live Model Sandbox
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-mono">
                  Dynamic Re-Ranking
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1.5">
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
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                  collabWeight === 100
                    ? "bg-purple-500/20 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "bg-black/40 border-white/[0.08] text-zinc-400 hover:text-white hover:bg-zinc-900"
                )}
              >
                100% SVD (Discovery)
              </button>
              <button
                type="button"
                onClick={() => setCollabWeight(60)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                  collabWeight === 60
                    ? "bg-sky-500/20 border-sky-400 text-sky-200 shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                    : "bg-black/40 border-white/[0.08] text-zinc-400 hover:text-white hover:bg-zinc-900"
                )}
              >
                60/40 (Default)
              </button>
              <button
                type="button"
                onClick={() => setCollabWeight(0)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                  collabWeight === 0
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : "bg-black/40 border-white/[0.08] text-zinc-400 hover:text-white hover:bg-zinc-900"
                )}
              >
                100% TF-IDF (Strict Genre)
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCollabWeight(60)}
                className="h-8 px-2.5 rounded-xl border-white/10 bg-black/40 text-xs text-zinc-300 hover:bg-zinc-800 cursor-pointer"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/35">
                {collabWeight}% Collaborative (SVD)
              </span>
              <span className="text-zinc-500 font-bold">+</span>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-500/35">
                {100 - collabWeight}% Content (TF-IDF)
              </span>
            </div>

            <p className="text-xs text-zinc-300 font-medium">
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
                <Film className="w-5 h-5 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Curated Recommendation Matrix
                </h2>
                {currentUser && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 font-medium">
                    User #{currentUser.userId}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Dynamically blended from collaborative peer signals ({collabWeight}%) and metadata semantic affinity ({100 - collabWeight}%). Click any title for full video player, streaming providers & XAI attribution.
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/60 border border-white/[0.1] self-start sm:self-auto backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setViewMode('coverflow')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === 'coverflow'
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25"
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
                  "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === 'grid'
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25"
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
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-muted-foreground font-medium">Analyzing taste vectors & generating recommendation deck...</p>
            </div>
          )}

          {/* 3D CoverFlow Carousel View */}
          {!loading && viewMode === 'coverflow' && (
            <div className="rounded-3xl bg-zinc-950/40 border border-white/[0.08] backdrop-blur-2xl p-2 sm:p-6 shadow-2xl relative overflow-hidden">
              {/* Dynamic Color-Adaptive Ambient Glow */}
              <div
                className="absolute -top-24 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full blur-[130px] pointer-events-none transition-all duration-700"
                style={{
                  background: `radial-gradient(circle, rgba(168,85,247,${(collabWeight / 100) * 0.18}) 0%, rgba(56,189,248,${((100 - collabWeight) / 100) * 0.18}) 70%, transparent 100%)`
                }}
              />
              
              <CoverFlowCarousel 
                items={coverFlowItems} 
                sectionLabel={currentUser ? `AI MATCH FOR ${currentUser.persona.toUpperCase()}` : "TOP CURATED RECOMMENDATIONS"}
                accentColor="#38bdf8"
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
                    className="group relative flex flex-col rounded-2xl bg-zinc-950/60 border border-white/[0.08] hover:border-cyan-400/40 overflow-hidden shadow-xl hover:shadow-cyan-500/10 cursor-pointer transition-all duration-300"
                  >
                    {/* Poster */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                      <img
                        src={posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      
                      {/* Top Match Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-cyan-500/90 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)] backdrop-blur-sm">
                          {movie.matchPercentage}%
                        </span>
                      </div>

                      {/* Tag pill at bottom of poster */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider truncate">
                          {movie.genres?.[0] || 'Film'}
                        </span>
                        {rating && (
                          <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-0.5">
                            ★ {rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Movie Info */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {movie.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                          {movie.explanation?.text || movie.overview}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>{movie.year || ''}</span>
                        <span className="text-cyan-400 font-medium group-hover:underline">
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

        {/* Minimal Footer */}
        <footer className="pt-8 pb-12 border-t border-white/[0.06] text-center text-xs text-muted-foreground space-y-2">
          <p className="text-zinc-400 font-medium">CineMatch AI Intelligence Platform • Cognizant Hackathon Track #6</p>
          <p className="text-zinc-500 text-[11px]">
            Dual-Ensemble Engine: Scikit-Surprise SVD (Matrix Factorization) + Scikit-Learn TF-IDF (Cosine Content Graph)
          </p>
        </footer>
      </div>
    </div>
  );
}
