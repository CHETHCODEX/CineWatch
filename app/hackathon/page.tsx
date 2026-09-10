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
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-amber-400 selection:text-black">
      {/* CineMatch Top Navbar */}
      <Navbar />

      {/* Background subtle warm ambient glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.04),rgba(255,255,255,0))] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Header Title Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase bg-white/[0.04] text-zinc-300 border border-white/10">
                Cognizant Hackathon • Track #6
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-zinc-300 border border-white/10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Recommendation Engine
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-2">
              CineMatch <span className="text-zinc-400 font-light">Intelligence</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
              Personalized OTT catalog recommendations, subscriber clustering & predictive retention telemetry.
            </p>
          </div>

          {/* Model Metrics Benchmarks */}
          <div className="flex items-center gap-3 self-start sm:self-auto text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-white/[0.08] flex items-center gap-2 shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-muted-foreground">SVD RMSE:</span>
              <span className="font-mono font-bold text-white">0.8982</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-white/[0.08] flex items-center gap-2 shadow-sm">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-muted-foreground">Ensemble:</span>
              <span className="font-mono font-bold text-zinc-200">0.60 C + 0.40 T</span>
            </div>
          </div>
        </header>

        {/* Persona Selector & Custom User ID Input */}
        <section className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                Subscriber Persona Curation
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Switch between subscriber profile benchmarks or test custom User ID parameters:
              </p>
            </div>

            {/* Custom User ID Form */}
            <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="138493"
                  placeholder="User ID (e.g. 32)"
                  value={customInputId}
                  onChange={(e) => setCustomInputId(e.target.value)}
                  className="w-52 px-3.5 py-2 text-xs rounded-xl bg-zinc-950/80 border border-white/[0.1] text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
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
                    "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 cursor-pointer",
                    isSelected
                      ? "bg-white text-zinc-950 border-white shadow-md shadow-white/10 scale-[1.01]"
                      : "bg-zinc-950/60 text-zinc-300 border-white/[0.08] hover:border-white/20 hover:bg-zinc-900/80 hover:text-white"
                  )}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-zinc-950" : "bg-zinc-500"
                  )} />
                  <span>#{p.userId} — {p.persona}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-mono font-medium",
                    isSelected ? "bg-zinc-200 text-zinc-950 font-bold" : "bg-white/[0.06] text-zinc-400"
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
                <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-400/90 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Subscriber Telemetry & Insights
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                  Subscriber Diagnostic Matrix
                </h2>
              </div>
              <Badge variant="outline" className="border-white/10 text-zinc-300 bg-white/5 text-xs font-medium self-start sm:self-auto">
                Cohort: {currentUser.engagement.cohort}
              </Badge>
            </div>

            <BentoGridShowcase
              integration={
                <Card className="flex h-full flex-col justify-between p-6 bg-zinc-900/50 border-white/[0.08] backdrop-blur-xl shadow-lg hover:border-white/20 transition-all">
                  <CardHeader className="p-0">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-amber-400">
                      <Sparkles className="w-5 h-5 text-amber-400" />
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
                    <CardDescription className="mt-3 text-xs text-zinc-300 leading-relaxed font-medium bg-zinc-950/70 p-3.5 rounded-xl border border-white/[0.06]">
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
                    <Button variant="outline" size="sm" className="border-white/10 text-xs font-semibold hover:bg-white/5 hover:border-white/20 text-zinc-300 cursor-pointer">
                      <ShieldAlert className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                      Live Protocol
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground font-medium">Auto-Intervene</span>
                      <Switch defaultChecked className="data-[state=checked]:bg-white" aria-label="Toggle autonomous retention" />
                    </div>
                  </CardFooter>
                </Card>
              }
              trackers={
                <Card className="h-full bg-zinc-900/50 border-white/[0.08] backdrop-blur-xl shadow-lg hover:border-white/20 transition-all">
                  <CardContent className="flex h-full flex-col justify-between p-6">
                    <div>
                      <CardTitle className="text-base font-semibold text-white">Subscriber Cohort Signal</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">Active peer streamers in cluster</CardDescription>
                    </div>
                    <div className="flex items-center justify-between pt-2">
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
                      <span className="text-xs font-mono font-semibold text-zinc-300">
                        +{currentUser.engagement.totalRatings} Ratings
                      </span>
                    </div>
                  </CardContent>
                </Card>
              }
              statistic={
                <Card className="relative h-full w-full overflow-hidden bg-zinc-900/50 border-white/[0.08] backdrop-blur-xl shadow-lg hover:border-white/20 transition-all">
                  <CardContent className="relative z-10 flex flex-col h-full items-center justify-center p-6 text-center">
                    <span className="text-5xl lg:text-6xl font-black text-white tracking-tight font-mono">
                      {metadata?.svdRMSE ?? "0.898"}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-2">
                      SVD RMSE Benchmark
                    </span>
                  </CardContent>
                </Card>
              }
              focus={
                <Card className="h-full bg-zinc-900/50 border-white/[0.08] backdrop-blur-xl shadow-lg hover:border-white/20 transition-all">
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
                <Card className="h-full bg-zinc-900/50 border-white/[0.08] backdrop-blur-xl shadow-lg hover:border-white/20 transition-all">
                  <CardContent className="flex h-full flex-col justify-between p-6">
                    <div>
                      <CardTitle className="text-base font-semibold text-white">Hybrid Ensemble</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-1">
                        Surprise SVD (60%) + TF-IDF Cosine (40%) across 4,760 catalog movies.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-200">
                        60% SVD
                      </span>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-200">
                        40% Content
                      </span>
                    </div>
                  </CardContent>
                </Card>
              }
              shortcuts={
                <Card className="h-full bg-zinc-900/50 border-white/[0.08] backdrop-blur-xl shadow-lg hover:border-white/20 transition-all">
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-950/80 hover:bg-zinc-800 text-xs font-mono font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Command className="h-3 w-3" />
                        <span>42 (Sci-Fi)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(1)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-950/80 hover:bg-zinc-800 text-xs font-mono font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Command className="h-3 w-3" />
                        <span>1 (Action)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(15)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-950/80 hover:bg-zinc-800 text-xs font-mono font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Command className="h-3 w-3" />
                        <span>15 (Drama)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(84)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-950/80 hover:bg-zinc-800 text-xs font-mono font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
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

        {/* Personalized Watchlist Section */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Curated Watchlist
                </h2>
                {currentUser && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/10 font-medium">
                    Generated for User #{currentUser.userId}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Curated by blending collaborative peer signals (60%) with metadata semantic affinity (40%). Click any title to explore full trailer, cast & XAI attribution.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-white">{watchlist.length}</span> verified recommendations
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-muted-foreground font-medium">Analyzing taste vectors & generating 3D recommendation deck...</p>
            </div>
          )}

          {/* 3D CoverFlow Carousel */}
          {!loading && (
            <div className="rounded-3xl bg-zinc-900/40 border border-white/[0.08] backdrop-blur-xl p-2 sm:p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <CoverFlowCarousel 
                items={coverFlowItems} 
                sectionLabel={currentUser ? `AI MATCH FOR ${currentUser.persona.toUpperCase()}` : "TOP CURATED RECOMMENDATIONS"}
                accentColor="#e2b36f"
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
