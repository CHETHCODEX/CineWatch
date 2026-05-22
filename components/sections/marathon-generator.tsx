"use client";

import { useState, useEffect, useRef } from "react";
import { Movie, MOCK_MOVIES, getPosterUrl, getBackdropUrl } from "@/types/movie";
import {
  Flame,
  Clock,
  Coffee,
  X,
  Play,
  Pause,
  SkipForward,
  Utensils,
  AlertTriangle,
  Volume2,
  Smile,
  Compass,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCard } from "@/components/ui/alert-card";

// =============================================================================
// Web Audio API Synthesizers for CineMarathon Dashboard
// =============================================================================

function playMarathonChime() {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playNote = (freq: number, delay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };

    // Ascending warm cinematic minor 7th chord (C4 -> Eb4 -> G4 -> Bb4 -> C5)
    playNote(261.63, 0.0, 1.2);
    playNote(311.13, 0.1, 1.2);
    playNote(392.00, 0.2, 1.2);
    playNote(466.16, 0.3, 1.2);
    playNote(523.25, 0.4, 2.0);
  } catch (e) {
    // Ignore blockages
  }
}

function playMarathonAlert() {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playClick = (time: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime + time); // D5
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + time + 0.08);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + 0.1);
    };

    // Triple alert beep
    playClick(0.0);
    playClick(0.12);
    playClick(0.24);
  } catch (e) {
    // Ignore context blocked
  }
}

// =============================================================================
// Interfaces & Constants
// =============================================================================

interface MarathonGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: Movie[];
}

interface ScheduleItem {
  id: string;
  type: "movie" | "break";
  movie?: Movie;
  duration: number; // in minutes
  title: string;
  startTime: string; // e.g. "18:00"
  endTime: string; // e.g. "20:05"
  breakActivity?: string;
  breakIcon?: string;
}

const SNACK_PROFILES = [
  { id: "water", name: "Hydration Only", calories: 0, icon: "💧" },
  { id: "popcorn-light", name: "Light Popcorn", calories: 350, icon: "🍿" },
  { id: "butter-bucket", name: "Double Butter Bucket", calories: 950, icon: "🍿🥤" },
  { id: "sugar-rush", name: "Movie Night Sugar Rush", calories: 1550, icon: "🍿🥤🍫" },
];

const PACING_PRESETS = [
  { id: "chill", name: "Chill & Cozy", breakMin: 15, desc: "15m stretching & refill breaks" },
  { id: "rush", name: "Cinematic Rush", breakMin: 5, desc: "5m restroom sprints" },
  { id: "hardcore", name: "Hardcore Fan", breakMin: 0, desc: "Zero breaks, back-to-back" },
];

const CURATED_LISTS = {
  blockbuster: {
    name: "Action & Sci-Fi Blockbusters",
    icon: <Zap className="w-4 h-4 text-orange-400" />,
    genres: [28, 878, 12],
  },
  acclaimed: {
    name: "Acclaimed Masterpieces",
    icon: <Award className="w-4 h-4 text-amber-400" />,
    genres: [18, 80],
  },
  cozy: {
    name: "Feel-Good & Cozy Vibes",
    icon: <Smile className="w-4 h-4 text-emerald-400" />,
    genres: [35, 16, 10749],
  },
};

export function MarathonGenerator({ isOpen, onClose, watchlist }: MarathonGeneratorProps) {
  // Config state
  const [targetDuration, setTargetDuration] = useState(240); // target marathon length in mins
  const [selectedPacing, setSelectedPacing] = useState("chill");
  const [selectedSnack, setSelectedSnack] = useState("butter-bucket");
  const [startTimeInput, setStartTimeInput] = useState("18:00");
  const [movieSource, setMovieSource] = useState<"watchlist" | "blockbuster" | "acclaimed" | "cozy">("watchlist");

  // Output State
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [totalScheduleDuration, setTotalScheduleDuration] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);

  // Active Marathon Mode States
  const [isMarathonActive, setIsMarathonActive] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [timeSpeed, setTimeSpeed] = useState<"real" | "hyper">("hyper"); // Hyper is 60x speed (1 min = 1 sec) for demo verification!
  const [showCompletionCard, setShowCompletionCard] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Reset scroll container position when marathon starts
  useEffect(() => {
    if (isMarathonActive && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [isMarathonActive]);

  // ---------------------------------------------------------------------------
  // Generating & Packing Algorithm
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Determine pool of movies
    let pool: Movie[] = [];
    if (movieSource === "watchlist" && watchlist.length > 0) {
      pool = [...watchlist];
    } else {
      // Filter MOCK_MOVIES by categories or fallback
      const genresToFilter =
        movieSource !== "watchlist" ? CURATED_LISTS[movieSource]?.genres : [];
      if (genresToFilter && genresToFilter.length > 0) {
        pool = MOCK_MOVIES.filter((m) =>
          m.genre_ids.some((id) => genresToFilter.includes(id))
        );
      }
      if (pool.length === 0) {
        pool = [...MOCK_MOVIES];
      }
    }

    // Shuffle pool to make it randomized and fresh
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

    // Get break duration
    const breakMin = PACING_PRESETS.find((p) => p.id === selectedPacing)?.breakMin ?? 10;

    // Pack movies
    let currentMins = 0;
    const packedItems: ScheduleItem[] = [];
    let movieCounter = 1;
    let breakCounter = 1;

    for (const movie of shuffledPool) {
      const runtime = movie.runtime || 120; // default 120m
      const potentialNewMins = currentMins + runtime + (packedItems.length > 0 ? breakMin : 0);

      // If adding this movie fits, or if we have zero movies packed, pack it.
      // We allow exceeding target duration by up to 45 mins to complete the final movie.
      if (packedItems.length === 0 || potentialNewMins <= targetDuration + 45) {
        // Add a break if not the first item and break is non-zero
        if (packedItems.length > 0 && breakMin > 0) {
          const activities = [
            "Popcorn Refill & Cola Top-up 🍿",
            "Double-Leg Hamstring Stretch 🧘",
            "Critical Restroom Sprint 🚽",
            "Cozy Blanket Adjustment 🛋️",
            "Debate Movie Theories 💬",
          ];
          const activity = activities[(breakCounter - 1) % activities.length];
          
          packedItems.push({
            id: `break-${breakCounter++}`,
            type: "break",
            duration: breakMin,
            title: `Break #${breakCounter - 1}`,
            startTime: "",
            endTime: "",
            breakActivity: activity,
          });
          currentMins += breakMin;
        }

        packedItems.push({
          id: `movie-${movieCounter++}`,
          type: "movie",
          movie,
          duration: runtime,
          title: movie.title,
          startTime: "",
          endTime: "",
        });
        currentMins += runtime;
      } else {
        // Stop packing once target is met
        break;
      }
    }

    // Compute wall-clock start/end times
    let runningMinutes = 0;
    const [startH, startM] = startTimeInput.split(":").map(Number);
    const baseMinutes = startH * 60 + startM;

    const formattedSchedule = packedItems.map((item) => {
      const itemStartTotal = baseMinutes + runningMinutes;
      const itemEndTotal = itemStartTotal + item.duration;

      const formatTime = (totalMins: number) => {
        const h = Math.floor((totalMins % 1440) / 60);
        const m = Math.floor(totalMins % 60);
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      };

      const newItem = {
        ...item,
        startTime: formatTime(itemStartTotal),
        endTime: formatTime(itemEndTotal),
      };

      runningMinutes += item.duration;
      return newItem;
    });

    setSchedule(formattedSchedule);
    setTotalScheduleDuration(currentMins);

    // Calculate energy burned
    // General metabolic rate + genre heart-rate bumps
    let totalBurn = 0;
    formattedSchedule.forEach((item) => {
      if (item.type === "movie" && item.movie) {
        // Base sitting burn: 1.2 kcal / min
        let rateMultiplier = 1.0;
        const genres = item.movie.genre_ids;
        if (genres.includes(27)) rateMultiplier = 1.8; // Horror is high adrenaline!
        else if (genres.includes(28) || genres.includes(53)) rateMultiplier = 1.4; // Action/thriller
        else if (genres.includes(35)) rateMultiplier = 1.2; // Comedy/Laughter
        
        totalBurn += Math.round(item.duration * 1.2 * rateMultiplier);
      } else {
        // Stretch breaks burn slightly more: 2.0 kcal / min
        totalBurn += Math.round(item.duration * 2.0);
      }
    });

    setCaloriesBurned(totalBurn);

    // Consumed calories based on snacking profile
    const snackKcal = SNACK_PROFILES.find((s) => s.id === selectedSnack)?.calories ?? 0;
    setCaloriesConsumed(snackKcal);

  }, [targetDuration, selectedPacing, selectedSnack, startTimeInput, movieSource, watchlist]);

  // ---------------------------------------------------------------------------
  // Fullscreen Marathon Session Loop
  // ---------------------------------------------------------------------------
  const startMarathonSession = () => {
    if (schedule.length === 0) return;
    setIsMarathonActive(true);
    setCurrentIdx(0);
    setTimeRemainingSeconds(schedule[0].duration * 60);
    setIsTimerRunning(true);
    setShowCompletionCard(false);
    playMarathonChime();
  };

  useEffect(() => {
    if (isMarathonActive && isTimerRunning) {
      const intervalDelay = timeSpeed === "hyper" ? 16.67 : 1000; // Hyper-lapse goes 60x faster (approx 16.6ms tick representing 1s clock tick)
      const decrementAmount = timeSpeed === "hyper" ? 60 : 1; // 60s per tick in hyper, 1s in real-time

      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= decrementAmount) {
            // Move to next item in schedule
            const nextIdx = currentIdx + 1;
            if (nextIdx < schedule.length) {
              setCurrentIdx(nextIdx);
              const nextItem = schedule[nextIdx];
              
              // Synthesis Alerts!
              if (nextItem.type === "movie") {
                playMarathonChime();
              } else {
                playMarathonAlert();
              }
              
              return nextItem.duration * 60;
            } else {
              // Marathon Completed!
              setIsTimerRunning(false);
              clearInterval(timerRef.current!);
              playMarathonChime();
              setShowCompletionCard(true);
              return 0;
            }
          }

          // Trigger warning click if in break and exactly 1 minute left (60 seconds)
          if (schedule[currentIdx].type === "break" && prev === 60) {
            playMarathonAlert();
          }

          return prev - decrementAmount;
        });
      }, intervalDelay);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isMarathonActive, isTimerRunning, currentIdx, schedule, timeSpeed]);

  const toggleTimer = () => setIsTimerRunning((prev) => !prev);

  const skipCurrentItem = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < schedule.length) {
      setCurrentIdx(nextIdx);
      const nextItem = schedule[nextIdx];
      if (nextItem.type === "movie") playMarathonChime();
      else playMarathonAlert();
      setTimeRemainingSeconds(nextItem.duration * 60);
    } else {
      setIsMarathonActive(false);
      setIsTimerRunning(false);
      setShowCompletionCard(false);
    }
  };

  const endMarathonSession = () => {
    setIsMarathonActive(false);
    setIsTimerRunning(false);
    setShowCompletionCard(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        ref={containerRef}
        className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex justify-center items-start p-4 py-8 ${
          isMarathonActive ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        
        {/* Main Interface Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-5xl bg-[#0c0c0e]/95 border border-white/[0.08] shadow-2xl shadow-black/80 rounded-2xl p-6 md:p-8 overflow-hidden text-foreground glow-amber-subtle"
        >
          {/* Ambient Corner Glows */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />

          {/* Close Header */}
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-yellow-100 to-orange-200 bg-clip-text text-transparent">
                  CineMarathon Generator
                </h2>
                <p className="text-xs text-muted-foreground">
                  Formulate and schedule the ultimate personalized viewing itinerary.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all border border-white/[0.06] hover:border-white/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dashboard Grid (Configurations Left, Dynamic Results Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            
            {/* LEFT: CONFIGURATOR PANEL (5 cols) */}
            <div className="lg:col-span-5 space-y-6 bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl backdrop-blur-md">
              
              {/* 1. MOVIE SOURCE SELECTION */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> Movie Source Vibe
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMovieSource("watchlist")}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all duration-300 ${
                      movieSource === "watchlist"
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-md shadow-amber-950/20"
                        : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <span className="block font-bold text-sm mb-0.5">My Watchlist</span>
                    <span>Use items from library ({watchlist.length})</span>
                  </button>
                  <button
                    onClick={() => setMovieSource("blockbuster")}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all duration-300 ${
                      movieSource === "blockbuster"
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-md shadow-amber-950/20"
                        : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <span className="block font-bold text-sm mb-0.5 flex items-center gap-1">
                      Action & Sci-Fi
                    </span>
                    <span>Blockbuster adrenaline</span>
                  </button>
                  <button
                    onClick={() => setMovieSource("acclaimed")}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all duration-300 ${
                      movieSource === "acclaimed"
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-md shadow-amber-950/20"
                        : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <span className="block font-bold text-sm mb-0.5">Critically Acclaimed</span>
                    <span>Dramas & high-scores</span>
                  </button>
                  <button
                    onClick={() => setMovieSource("cozy")}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all duration-300 ${
                      movieSource === "cozy"
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-md shadow-amber-950/20"
                        : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <span className="block font-bold text-sm mb-0.5">Feel-Good Cozy</span>
                    <span>Comedy & comfort mix</span>
                  </button>
                </div>
                {movieSource === "watchlist" && watchlist.length === 0 && (
                  <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-2.5 mt-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-yellow-300">
                      Your watchlist is empty! The algorithm will gracefully fall back to CineMatch Curated Classics.
                    </p>
                  </div>
                )}
              </div>

              {/* 2. DURATION SLIDER */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Target Time Limit
                  </label>
                  <span className="text-sm font-bold text-amber-400">
                    {Math.floor(targetDuration / 60)}h {targetDuration % 60}m
                  </span>
                </div>
                
                <input
                  type="range"
                  min="60"
                  max="720"
                  step="30"
                  value={targetDuration}
                  onChange={(e) => setTargetDuration(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500 outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1 focus:ring-offset-[#0c0c0e]"
                />

                <div className="grid grid-cols-4 gap-1">
                  {[120, 240, 360, 480].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setTargetDuration(mins)}
                      className={`py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer border ${
                        targetDuration === mins
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                          : "bg-white/5 border-white/[0.04] text-muted-foreground hover:bg-white/10 hover:text-foreground"
                      }`}
                    >
                      {mins / 60} hrs
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. PACING & BREAKS */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5" /> Pacing Intensity
                </label>
                <div className="space-y-2">
                  {PACING_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPacing(preset.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all duration-300 cursor-pointer ${
                        selectedPacing === preset.id
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="font-bold text-sm">{preset.name}</span>
                      </div>
                      <span className="text-muted-foreground">{preset.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. SNACK PROFILE (CALORIE INPUT) */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5" /> Snacking Calorie Profile
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SNACK_PROFILES.map((snack) => (
                    <button
                      key={snack.id}
                      onClick={() => setSelectedSnack(snack.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all duration-300 flex flex-col justify-between h-20 cursor-pointer ${
                        selectedSnack === snack.id
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-md shadow-amber-950/20"
                          : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-lg">{snack.icon}</span>
                        <span className="text-[10px] font-bold text-muted-foreground">{snack.calories} kcal</span>
                      </div>
                      <span className="font-semibold text-[11px] truncate w-full">{snack.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. STARTING CLOCK HOUR */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Start Clock Hour
                </label>
                <input
                  type="time"
                  value={startTimeInput}
                  onChange={(e) => setStartTimeInput(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.08] text-foreground text-sm rounded-xl px-4 py-2.5 outline-none focus:border-amber-500/40 transition-all duration-300 focus:bg-white/[0.04]"
                />
              </div>

            </div>

            {/* RIGHT: DYNAMIC RESULTS PANEL (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* ITINERARY STATS ROW */}
              <div className="grid grid-cols-3 gap-3 bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl backdrop-blur-sm">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Planned Duration
                  </span>
                  <span className="text-lg font-bold text-amber-400">
                    {Math.floor(totalScheduleDuration / 60)}h {totalScheduleDuration % 60}m
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Included Movies
                  </span>
                  <span className="text-lg font-bold text-amber-400">
                    {schedule.filter((x) => x.type === "movie").length} Films
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Popcorn Breaks
                  </span>
                  <span className="text-lg font-bold text-amber-400">
                    {schedule.filter((x) => x.type === "break").length} Pauses
                  </span>
                </div>
              </div>

              {/* DYNAMIC SCROLLABLE TIMELINE */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Dynamic Visual Timeline Filmstrip
                </label>
                
                <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto scrollbar-thin pr-2">
                  {schedule.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`relative flex items-center justify-between border rounded-2xl p-4 overflow-hidden backdrop-blur-md transition-all duration-300 ${
                        item.type === "movie"
                          ? "bg-white/[0.02] border-white/[0.08] hover:border-amber-500/20"
                          : "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/20 border-dashed"
                      }`}
                    >
                      {/* Movie Backdrop overlay for subtle background textures */}
                      {item.type === "movie" && item.movie?.backdrop_path && (
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-[0.02] pointer-events-none"
                          style={{ backgroundImage: `url(${getBackdropUrl(item.movie.backdrop_path, "w300")})` }}
                        />
                      )}

                      <div className="flex items-center gap-4 relative z-10">
                        {/* Start and end times left */}
                        <div className="text-left w-16 flex-shrink-0">
                          <span className="text-xs font-bold block text-amber-400">{item.startTime}</span>
                          <span className="text-[10px] text-muted-foreground block">{item.endTime}</span>
                        </div>

                        {/* Visual Connector / Poster */}
                        {item.type === "movie" ? (
                          <div className="w-10 h-14 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getPosterUrl(item.movie?.poster_path ?? null, "w92")}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 text-lg flex-shrink-0">
                            ☕
                          </div>
                        )}

                        {/* Title and Descriptions */}
                        <div>
                          <span className="text-sm font-bold block text-foreground tracking-tight">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground block flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {item.duration} minutes
                            {item.type === "movie" && item.movie && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                ⭐️ {Math.round(item.movie.vote_average * 10) / 10}
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Right-aligned content */}
                      <div className="relative z-10 text-right">
                        {item.type === "movie" ? (
                          <span className="text-[10px] px-2 py-1.5 rounded-lg bg-zinc-800/80 border border-white/5 text-muted-foreground text-xs">
                            Feature Film
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-400 italic">
                            {item.breakActivity}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CALORIE METABOLIC BURN VS INTAKE INFOGRAPHIC */}
              <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Calories Consumed vs Metabolic Burn
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Burn includes sitting metabolism + horror/action adrenaline heart-rate boosts
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Calorie Progress Bar */}
                  <div className="w-full bg-zinc-900 rounded-full h-4 overflow-hidden p-0.5 border border-white/[0.05]">
                    <div className="w-full h-full rounded-full flex overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-400 h-full rounded-full transition-all duration-500 shadow-md shadow-orange-500/20"
                        style={{ width: `${Math.min(100, (caloriesConsumed / 2000) * 100)}%` }}
                        title="Calories Consumed"
                      />
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-500 ml-0.5 shadow-md shadow-emerald-500/20"
                        style={{ width: `${Math.min(100, (caloriesBurned / 2000) * 100)}%` }}
                        title="Calories Burned"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-red-400">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span>Consumed: {caloriesConsumed} kcal</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Metabolic Burn: {caloriesBurned} kcal</span>
                    </div>
                  </div>

                  {/* Fun Text Result */}
                  <div className="text-[11px] bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl text-center text-muted-foreground italic">
                    {caloriesBurned >= caloriesConsumed ? (
                      <span className="text-emerald-300 font-semibold">
                        🎉 Caloric Deficit Secured! Your movie session burns more energy than you'll snack on. Keep healthy!
                      </span>
                    ) : (
                      <span className="text-orange-300">
                        🥤 Popcorn overload! You're consuming {caloriesConsumed - caloriesBurned} excess calories. Consider switching to light popcorn or watching a horror film to raise your adrenaline!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION: LAUNCH MARATHON */}
              <div className="flex gap-3">
                <button
                  onClick={startMarathonSession}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black text-sm font-bold rounded-xl py-3 px-4 shadow-lg shadow-amber-500/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  <Play className="w-4 h-4 text-black fill-black" />
                  <span>LAUNCH MARATHON MODE</span>
                </button>
              </div>

            </div>

          </div>

        </motion.div>

        {/* =====================================================================
            IMMERSIVE "MARATHON MODE" ACTIVE COUNTDOWN PLAYER
            ===================================================================== */}
        <AnimatePresence>
          {isMarathonActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-[#070709] flex flex-col justify-between p-6 md:p-12 overflow-hidden"
            >
              {/* Cinema Light Leak/Ambient Glow backing canvas */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, -30, 0],
                    y: [0, -40, 30, 0],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.15] transition-colors duration-1000 ${
                    schedule[currentIdx].type === "break"
                      ? "bg-amber-600"
                      : schedule[currentIdx].movie?.genre_ids.includes(27)
                      ? "bg-red-800"
                      : "bg-indigo-700"
                  }`}
                />
                <motion.div
                  animate={{
                    scale: [1.2, 1, 1.2],
                    x: [0, -30, 40, 0],
                    y: [0, 30, -40, 0],
                  }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.12] transition-colors duration-1000 ${
                    schedule[currentIdx].type === "break"
                      ? "bg-orange-500"
                      : "bg-purple-800"
                  }`}
                />
              </div>

              {/* Top controls header */}
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">
                    CineMarathon Live Session
                  </span>
                </div>

                {/* Simulated/Real speed selector */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/[0.08] p-1 rounded-xl">
                  <button
                    onClick={() => setTimeSpeed("real")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      timeSpeed === "real"
                        ? "bg-white/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Real-time
                  </button>
                  <button
                    onClick={() => setTimeSpeed("hyper")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      timeSpeed === "hyper"
                        ? "bg-amber-500/20 text-amber-300"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Hyper-lapse (60x) enables fast-forward verification of timers & chimes"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lapse Mode (60x)</span>
                  </button>
                </div>

                <button
                  onClick={endMarathonSession}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  title="Terminate Marathon Session"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Immersive Floating Stage */}
              <div className="relative z-10 flex flex-col items-center justify-center py-8">
                
                {/* 3D Rotating Glowing Radial Dial */}
                <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full border border-white/5 flex items-center justify-center shadow-3xl shadow-black/80 bg-zinc-950/60 backdrop-blur-md mb-8">
                  {/* Outer spinning glowing bezel */}
                  <motion.div
                    animate={{ rotate: isTimerRunning ? 360 : 0 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-amber-500/10 animate-pulse pointer-events-none"
                  />
                  
                  {/* Inner text countdown timers */}
                  <div className="text-center space-y-1">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                      {schedule[currentIdx].type === "movie" ? "MOVIE NOW SHOWING" : "BREAK TIME"}
                    </span>
                    <span className="text-4xl md:text-5xl font-black font-mono block tracking-tighter text-white">
                      {Math.floor(timeRemainingSeconds / 60)}:
                      {String(timeRemainingSeconds % 60).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                      Timer Countdown
                    </span>
                  </div>
                </div>

                {/* Movie Poster & Meta Display */}
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-md w-full bg-white/[0.02] border border-white/[0.06] p-6 rounded-2xl backdrop-blur-lg flex gap-4 items-center shadow-lg"
                >
                  {schedule[currentIdx].type === "movie" ? (
                    <>
                      <div className="w-16 h-24 rounded-lg border border-white/10 overflow-hidden shadow-md flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getPosterUrl(schedule[currentIdx].movie?.poster_path ?? null, "w185")}
                          alt={schedule[currentIdx].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-xs uppercase font-bold text-amber-400 mb-0.5 block">
                          Movie {currentIdx + 1} of {schedule.length}
                        </span>
                        <h4 className="text-lg font-bold tracking-tight text-white line-clamp-1">
                          {schedule[currentIdx].title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                          {schedule[currentIdx].movie?.overview}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                        🍿
                      </div>
                      <div>
                        <span className="text-xs uppercase font-bold text-amber-400 mb-0.5 block">
                          Stretch & Refresh Break
                        </span>
                        <h4 className="text-lg font-bold tracking-tight text-white">
                          Popcorn Break Time!
                        </h4>
                        <p className="text-[11px] text-muted-foreground italic mt-0.5 text-amber-300">
                          {schedule[currentIdx].breakActivity}
                        </p>
                      </div>
                    </>
                  )}
                </motion.div>

              </div>

              {/* Lower Timeline Navigation and Progress Deck */}
              <div className="relative z-10 space-y-6">
                
                {/* Visual timeline bar tracking overall progress */}
                <div className="w-full bg-white/[0.04] p-3 rounded-2xl border border-white/[0.06] backdrop-blur-md">
                  <div className="flex justify-between text-xs text-muted-foreground font-semibold mb-2 px-1">
                    <span>Marathon Progress</span>
                    <span>
                      {currentIdx + 1} / {schedule.length} segments
                    </span>
                  </div>

                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex gap-0.5">
                    {schedule.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`h-full rounded-full transition-all duration-300 ${
                          idx < currentIdx
                            ? "bg-amber-500/30"
                            : idx === currentIdx
                            ? "bg-amber-500 animate-pulse"
                            : "bg-white/5"
                        }`}
                        style={{ flexGrow: item.duration }}
                      />
                    ))}
                  </div>

                  {/* Horizontal Segment Labels */}
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-2 px-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" /> Start: {schedule[0]?.startTime}
                    </span>
                    <span>
                      Up Next:{" "}
                      {currentIdx + 1 < schedule.length
                        ? schedule[currentIdx + 1].title
                        : "Marathon Complete"}
                    </span>
                    <span>End: {schedule[schedule.length - 1]?.endTime}</span>
                  </div>
                </div>

                {/* Control Panel Deck */}
                <div className="flex justify-center gap-4 items-center">
                  <button
                    onClick={toggleTimer}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg scale-100 hover:scale-105 active:scale-95 cursor-pointer ${
                      isTimerRunning
                        ? "bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700"
                        : "bg-amber-500 text-black shadow-amber-500/10 hover:bg-amber-600"
                    }`}
                    title={isTimerRunning ? "Pause Marathon Timer" : "Resume Marathon Timer"}
                  >
                    {isTimerRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-black" />}
                  </button>

                  <button
                    onClick={skipCurrentItem}
                    className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:scale-105 active:scale-95"
                    title="Skip current movie/break segment"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

              </div>

              {/* Immersive Completion Card Overlay */}
              <AnimatePresence>
                {showCompletionCard && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-duration-300"
                  >
                    <AlertCard
                      isVisible={showCompletionCard}
                      title="Marathon Complete! 🍿"
                      description="Congratulations! You completed your CineMarathon! Refilled, stretched, and thoroughly entertained."
                      buttonText="Okay, I Understand"
                      onButtonClick={() => {
                        setShowCompletionCard(false);
                        setIsMarathonActive(false);
                        setIsTimerRunning(false);
                      }}
                      onDismiss={() => {
                        setShowCompletionCard(false);
                        setIsMarathonActive(false);
                        setIsTimerRunning(false);
                      }}
                      icon={<Flame className="h-6 w-6 text-destructive-foreground animate-pulse" />}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AnimatePresence>
  );
}
