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
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/sections/navbar';
import { CoverFlowCarousel, type CarouselItem } from '@/components/ui/3-d-coverflow-carousel';
import { BentoGridShowcase } from '@/components/ui/bento-product-features';
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
  const router = useRouter();

  // Convert watchlist into items for the 3D CoverFlow Carousel
  const coverFlowItems: CarouselItem[] = useMemo(() => {
    return watchlist.map((movie) => {
      const posterUrl = movie.posterPath.startsWith('http')
        ? movie.posterPath
        : `https://image.tmdb.org/t/p/w500${movie.posterPath}`;
      return {
        tag: `#${movie.rank} • ${movie.matchPercentage}% MATCH`,
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
  }, [watchlist]);

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
      : watchlist.find((m) => m.movieId === item.movieId);

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

      {/* Background radial gradient glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.12),rgba(255,255,255,0))] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Header Title Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Cognizant Hackathon Track #6
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live ML Recommendation Agent
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
              CineMatch <span className="text-cyan-400">AI Engine</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Autonomous OTT content recommendation and subscriber engagement optimization agent.
            </p>
          </div>

          {/* Model Metrics Benchmarks */}
          <div className="flex items-center gap-3 self-start sm:self-auto text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-cine-surface border border-white/[0.08] flex items-center gap-2 shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-muted-foreground">SVD RMSE:</span>
              <span className="font-mono font-bold text-white">0.8982</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-cine-surface border border-white/[0.08] flex items-center gap-2 shadow-sm">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-muted-foreground">Hybrid Ensemble:</span>
              <span className="font-mono font-bold text-cyan-300">0.60 C + 0.40 T</span>
            </div>
          </div>
        </header>

        {/* Persona Selector & Custom User ID Input */}
        <section className="p-6 rounded-2xl bg-cine-surface border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="w-4 h-4 text-cyan-400" />
                Select Subscriber Persona
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Switch between pre-calculated benchmark subscriber profiles or test any custom User ID:
              </p>
            </div>

            {/* Custom User ID Form */}
            <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="138493"
                  placeholder="Custom User ID (e.g. 2177)"
                  value={customInputId}
                  onChange={(e) => setCustomInputId(e.target.value)}
                  className="w-56 px-3.5 py-2 text-xs rounded-xl bg-black/60 border border-white/[0.12] text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
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
                    "px-4 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 cursor-pointer",
                    isSelected
                      ? "bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/25 scale-[1.02]"
                      : "bg-black/40 text-foreground/80 border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.04]"
                  )}
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    isSelected ? "bg-black" : "bg-cyan-400"
                  )} />
                  <span>#{p.userId} — {p.persona}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-mono font-medium",
                    isSelected ? "bg-black/20 text-black font-bold" : "bg-white/[0.08] text-muted-foreground"
                  )}>
                    {p.score} pts
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Subscriber Engagement & Retention Diagnostic Bento Grid */}
        {currentUser && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Product Features & AI Intelligence
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                  Subscriber Diagnostic Showcase
                </h2>
              </div>
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-xs font-semibold self-start sm:self-auto">
                Cohort: {currentUser.engagement.cohort}
              </Badge>
            </div>

            <BentoGridShowcase
              integration={
                <Card className="flex h-full flex-col justify-between p-6 bg-cine-surface border-white/[0.08] backdrop-blur-xl shadow-xl hover:border-cyan-500/30 transition-all">
                  <CardHeader className="p-0">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-inner">
                      <Sparkles className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-xl font-bold text-white">Autonomous Retention</CardTitle>
                      <Badge variant="outline" className={cn(
                        "font-bold text-[11px]",
                        currentUser.engagement.churnRisk.includes('Low')
                          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                          : currentUser.engagement.churnRisk.includes('Moderate')
                          ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                          : "border-rose-500/30 text-rose-400 bg-rose-500/10"
                      )}>
                        {currentUser.engagement.churnRisk}
                      </Badge>
                    </div>
                    <CardDescription className="mt-3 text-xs text-zinc-300 leading-relaxed font-medium bg-black/40 p-3.5 rounded-xl border border-white/[0.08]">
                      "{currentUser.engagement.retentionStrategy}"
                    </CardDescription>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-white/[0.06]">
                        <span className="text-muted-foreground">Subscriber Cohort</span>
                        <span className="font-semibold text-white">{currentUser.engagement.cohort}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/[0.06]">
                        <span className="text-muted-foreground">Catalog Diversity</span>
                        <span className="font-mono font-bold text-cyan-400">{currentUser.engagement.genreDiversityPct}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/[0.06]">
                        <span className="text-muted-foreground">Mean Rating</span>
                        <span className="font-mono font-bold text-amber-400">{currentUser.engagement.meanRating} ★</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardFooter className="mt-6 flex items-center justify-between p-0 pt-4 border-t border-white/[0.08]">
                    <Button variant="outline" size="sm" className="border-white/10 text-xs font-semibold hover:border-cyan-500/30 hover:bg-cyan-500/10 text-white cursor-pointer">
                      <ShieldAlert className="mr-1.5 h-3.5 w-3.5 text-cyan-400" />
                      Live Protocol
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground font-medium">Auto-Intervene</span>
                      <Switch defaultChecked className="data-[state=checked]:bg-cyan-500" aria-label="Toggle autonomous retention" />
                    </div>
                  </CardFooter>
                </Card>
              }
              trackers={
                <Card className="h-full bg-cine-surface border-white/[0.08] backdrop-blur-xl shadow-xl hover:border-cyan-500/30 transition-all">
                  <CardContent className="flex h-full flex-col justify-between p-6">
                    <div>
                      <CardTitle className="text-base font-semibold text-white">Subscriber Cohort Signal</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">Active peer streamers in cluster</CardDescription>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        <img
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80"
                          alt="Streamer 1"
                        />
                        <img
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80"
                          alt="Streamer 2"
                        />
                        <img
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80"
                          alt="Streamer 3"
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        +{currentUser.engagement.totalRatings} Ratings
                      </span>
                    </div>
                  </CardContent>
                </Card>
              }
              statistic={
                <Card className="relative h-full w-full overflow-hidden bg-cine-surface border-white/[0.08] backdrop-blur-xl shadow-xl hover:border-cyan-500/30 transition-all">
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: "radial-gradient(rgba(6, 182, 212, 0.6) 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                  <CardContent className="relative z-10 flex flex-col h-full items-center justify-center p-6 text-center">
                    <span className="text-5xl lg:text-6xl font-black text-cyan-400 tracking-tight">
                      {metadata?.svdRMSE ?? "0.898"}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                      SVD RMSE Benchmark
                    </span>
                  </CardContent>
                </Card>
              }
              focus={
                <Card className="h-full bg-cine-surface border-white/[0.08] backdrop-blur-xl shadow-xl hover:border-cyan-500/30 transition-all">
                  <CardContent className="flex h-full flex-col justify-between p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold text-white">Engagement Index</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Activity & Health Score</CardDescription>
                      </div>
                      <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-xs font-bold">
                        {currentUser.engagement.cohort}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-5xl font-black text-white">{currentUser.engagement.score}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-white/[0.06]">
                      <span>Diversity: {currentUser.engagement.genreDiversityPct}%</span>
                      <span>Ratings: {currentUser.engagement.totalRatings}</span>
                    </div>
                  </CardContent>
                </Card>
              }
              productivity={
                <Card className="h-full bg-cine-surface border-white/[0.08] backdrop-blur-xl shadow-xl hover:border-cyan-500/30 transition-all">
                  <CardContent className="flex h-full flex-col justify-between p-6">
                    <div>
                      <CardTitle className="text-base font-semibold text-white">Hybrid Ensemble</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-1">
                        Surprise SVD (60%) + TF-IDF Cosine (40%) across 4,760 catalog movies.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                        60% SVD
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
                        40% Content
                      </span>
                    </div>
                  </CardContent>
                </Card>
              }
              shortcuts={
                <Card className="h-full bg-cine-surface border-white/[0.08] backdrop-blur-xl shadow-xl hover:border-cyan-500/30 transition-all">
                  <CardContent className="flex h-full flex-wrap items-center justify-between gap-4 p-6">
                    <div>
                      <CardTitle className="text-base font-semibold text-white">Fast Persona Switch</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Simulate subscriber vectors instantly with one-click keyboard triggers
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(42)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-black/50 hover:bg-cyan-500/10 text-xs font-mono font-bold text-cyan-300 transition-colors cursor-pointer"
                      >
                        <Command className="h-3 w-3" />
                        <span>42 (Sci-Fi)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(1)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/30 bg-black/50 hover:bg-purple-500/10 text-xs font-mono font-bold text-purple-300 transition-colors cursor-pointer"
                      >
                        <Command className="h-3 w-3" />
                        <span>1 (Action)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(15)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-black/50 hover:bg-amber-500/10 text-xs font-mono font-bold text-amber-300 transition-colors cursor-pointer"
                      >
                        <Command className="h-3 w-3" />
                        <span>15 (Drama)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(84)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-black/50 hover:bg-emerald-500/10 text-xs font-mono font-bold text-emerald-300 transition-colors cursor-pointer"
                      >
                        <Command className="h-3 w-3" />
                        <span>84 (Mystery)</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              }
            />
          </div>
        )}

        {/* Personalized Watchlist Section (Interactive 3D Stacked Deck ONLY) */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Personalized Watchlist
                </h2>
                {currentUser && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.08] text-muted-foreground font-medium">
                    Generated for User #{currentUser.userId}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Curated by blending collaborative peer signals (60%) with metadata semantic affinity (40%). Click any movie card to open its full cinematic details window with trailer, cast, and XAI attribution.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-white">{watchlist.length}</span> verified recommendations
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-muted-foreground font-medium">Analyzing taste vectors & generating 3D recommendation deck...</p>
            </div>
          )}

          {/* 3D CoverFlow Carousel */}
          {!loading && (
            <div className="rounded-3xl bg-cine-surface/80 border border-white/[0.08] backdrop-blur-xl p-2 sm:p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <CoverFlowCarousel 
                items={coverFlowItems} 
                sectionLabel={currentUser ? `AI MATCH FOR ${currentUser.persona.toUpperCase()}` : "TOP AI RECOMMENDATIONS"}
                accentColor="#06b6d4"
                onCtaClick={handleSelectMovie}
                onCardClick={handleSelectMovie}
              />
            </div>
          )}
        </div>

        {/* Footer info */}
        <footer className="pt-8 pb-12 border-t border-white/[0.06] text-center text-xs text-muted-foreground space-y-2">
          <p>CineMatch / CineWatch AI — Engineered for Cognizant Hackathon Track #6.</p>
          <p className="text-muted-foreground/60">
            Powered by Next.js 16, React 19, TailwindCSS v4, Scikit-Learn (TF-IDF), and Scikit-Surprise (SVD Matrix Factorization).
          </p>
        </footer>
      </div>
    </div>
  );
}
