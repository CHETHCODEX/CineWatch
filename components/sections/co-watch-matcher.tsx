"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  X, 
  Users, 
  Sparkles, 
  User, 
  ChevronRight, 
  RotateCcw, 
  Film, 
  ThumbsUp, 
  ThumbsDown, 
  Info,
  Gift
} from "lucide-react";
import { HoverButton } from "@/components/ui/hover-glow-button";
import { RippleButton } from "@/components/ui/ripple-button";
import { Movie, MOCK_MOVIES, MOCK_GENRES, getPosterUrl } from "@/types/movie";

// =============================================================================
// AI Companions & Personas with Genre Rules
// =============================================================================

interface AIPersona {
  id: string;
  name: string;
  avatar: string;
  desc: string;
  quote: string;
  genres: number[]; // Favorite genre IDs
  reactions: {
    like: string[];
    dislike: string[];
  };
}

const AI_PERSONAS: AIPersona[] = [
  {
    id: "yoda",
    name: "Master Yoda 🪐",
    avatar: "🟢",
    desc: "Seeks profound stories, cosmic wisdom, and stellar voyages.",
    quote: "Patience you must have. Sci-Fi and deep philosophies, I seek.",
    genres: [878, 9648, 12], // Sci-Fi, Mystery, Adventure
    reactions: {
      like: [
        "Strong in this one, the force is! 👍",
        "A masterpiece, yes, hmmm. 🌟",
        "Deeply think, this movie makes us."
      ],
      dislike: [
        "Mundane, this is. 🥱",
        "Clouded, the plot of this film is.",
        "To the dark side of cinema, this leads."
      ]
    }
  },
  {
    id: "wednesday",
    name: "Wednesday Addams 🖤",
    avatar: "💀",
    desc: "Enjoys macabre mysteries, dark crimes, and high-tension thrills.",
    quote: "I find comfort in the macabre. Thrillers and pure horror are my sanctuary.",
    genres: [27, 53, 80], // Horror, Thriller, Crime
    reactions: {
      like: [
        "Delightfully dreadful. 🖤",
        "A perfect execution. ⚰️",
        "This film feeds my dark side."
      ],
      dislike: [
        "Terribly cheerful. I despise it. 🤮",
        "Boring. Needs more poison.",
        "I've suffered more watching this than in a torture chamber."
      ]
    }
  },
  {
    id: "sparrow",
    name: "Captain Jack Sparrow 🏴‍☠️",
    avatar: "🏴‍☠️",
    desc: "Craves high-seas action, chaotic comedy, and daring adventures.",
    quote: "Bring me that horizon! Daring escapes or there is no deal, mate!",
    genres: [28, 12, 35], // Action, Adventure, Comedy
    reactions: {
      like: [
        "Aye! That's what I call adventure! ⚔️",
        "Take what you can, give nothing back! Superb! 🏴‍☠️",
        "Drink up me hearties, yo ho! Brilliant film!"
      ],
      dislike: [
        "Not enough rum in the world for this rubbish. 🥃",
        "A boring tale. Walk the plank! 🦈",
        "Me compass wouldn't even point to this!"
      ]
    }
  }
];

// =============================================================================
// Snacking Combinations Mapping based on Genre IDs
// =============================================================================

interface SnackPairing {
  food: string;
  drink: string;
  emoji: string;
  theme: string;
}

function getSnackPairing(genreIds: number[]): SnackPairing {
  if (genreIds.includes(27) || genreIds.includes(53)) {
    return {
      food: "Spicy Sriracha Pretzels & Fear-salted Nuts",
      drink: "Vampiric Bloody Mary or Cherry Soda",
      emoji: "🩸🥨",
      theme: "Horror / Thriller"
    };
  }
  if (genreIds.includes(878) || genreIds.includes(12)) {
    return {
      food: "Dehydrated Space Popcorn & Sour Gummy Aliens",
      drink: "Electric Nebula Blue Curacao or Lime Fizz",
      emoji: "🚀☄️",
      theme: "Sci-Fi / Adventure"
    };
  }
  if (genreIds.includes(18) || genreIds.includes(36)) {
    return {
      food: "Gourmet Truffle Popcorn & Prosciutto Crackers",
      drink: "Vintage Cabernet Red Wine or Hot Cocoa",
      emoji: "🍷🍿",
      theme: "Drama / History"
    };
  }
  if (genreIds.includes(35) || genreIds.includes(16)) {
    return {
      food: "Sweet Rainbow Candies & Caramel Crunch Popcorn",
      drink: "Sparkling Apple Cider or Milkshake",
      emoji: "🌈🍬",
      theme: "Comedy / Animation"
    };
  }
  return {
    food: "Classic Butter Popcorn & Warm Nachos with Melted Cheese",
    drink: "Ice-cold Craft Beer or Golden Ginger Beer",
    emoji: "🍺🧀",
    theme: "Cinematic Classic"
  };
}

// =============================================================================
// Inline CSS-based Particle Confetti Effect
// =============================================================================

const ConfettiEffect = () => {
  const particles = Array.from({ length: 80 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = Math.random() * 3 + 2;
        const size = Math.random() * 10 + 5;
        const colors = ["#E8D754", "#6C3FF5", "#FF9B6B", "#3b82f6", "#10b981", "#ec4899"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <div
            key={i}
            className="absolute top-[-20px] rounded-sm animate-fall"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity: Math.random() * 0.7 + 0.3,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        );
      })}
      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            top: -20px;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            top: 100%;
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

// =============================================================================
// Main Exported Component
// =============================================================================

interface CoWatchSectionProps {
  movies?: Movie[];
}

export function CoWatchSection({ movies }: CoWatchSectionProps) {
  // Mode parameters: 'menu' | 'waiting' | 'swiping' | 'pass_transition' | 'match_screen'
  const [mode, setMode] = useState<'menu' | 'waiting' | 'swiping' | 'pass_transition' | 'match_screen'>('menu');
  const [matchType, setMatchType] = useState<'pass_play' | 'ai'>('pass_play');
  const [selectedAI, setSelectedAI] = useState<AIPersona>(AI_PERSONAS[0]);

  // Swiping State variables
  const [deck, setDeck] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [player1Likes, setPlayer1Likes] = useState<Set<number>>(new Set());
  const [player2Likes, setPlayer2Likes] = useState<Set<number>>(new Set());
  
  // Game orchestration: 1 for Player 1, 2 for Player 2
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [aiReaction, setAiReaction] = useState<string>("");
  const [matchedMovie, setMatchedMovie] = useState<Movie | null>(null);

  // States for Real-Time invite link syncing
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'p1' | 'p2' | null>(null);
  const [partnerJoined, setPartnerJoined] = useState<boolean>(false);
  const [inviteUrl, setInviteUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  // Initialize swipe deck from incoming props or static mocks
  useEffect(() => {
    const list = movies && movies.length > 5 ? movies : MOCK_MOVIES;
    // Limit to 8 balanced items for faster loop closure
    setDeck(list.slice(0, 8));
  }, [movies]);

  // Check URL query parameters for dynamic join invites
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sessionParam = params.get("session");
      const roleParam = params.get("role");

      if (sessionParam && roleParam === "p2") {
        setSessionId(sessionParam);
        setUserRole("p2");
        setMatchType("pass_play"); // Treat as multiplayer
        setIsSimulated(false);

        // Load room configuration from localStorage
        let sessionDataStr = localStorage.getItem(`cinematch_session_${sessionParam}`);
        if (!sessionDataStr) {
          // Robust Fallback: Initialize local session if it doesn't exist (e.g., across separate browser profiles or sandboxed Incognito tabs)
          const fallbackDeck = movies && movies.length > 5 ? movies : MOCK_MOVIES.slice(0, 8);
          const initialSession = {
            deck: fallbackDeck,
            p1Likes: [],
            p2Likes: [],
            p1Active: true,
            p2Active: true,
            matchedMovieId: null
          };
          localStorage.setItem(`cinematch_session_${sessionParam}`, JSON.stringify(initialSession));
          sessionDataStr = JSON.stringify(initialSession);
        }

        if (sessionDataStr) {
          try {
            const parsed = JSON.parse(sessionDataStr);
            // Mark partner active and update
            parsed.p2Active = true;
            localStorage.setItem(`cinematch_session_${sessionParam}`, JSON.stringify(parsed));
            
            if (parsed.deck && parsed.deck.length > 0) {
              setDeck(parsed.deck);
            }
            setPlayer1Likes(new Set(parsed.p1Likes || []));
            setPlayer2Likes(new Set(parsed.p2Likes || []));
            
            // Instantly transition to swipe Arena
            setMode("swiping");
            setActivePlayer(2);
            setCurrentIndex(0);
          } catch (e) {
            console.error("Failed to parse invite session details:", e);
          }
        }
      }
    }
  }, [movies]);

  // Auto-scroll focus to the Co-Watch Arena
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sessionParam = params.get("session");
      
      // Scroll if session query param is present on load, or when mode transitions into a gaming arena
      if (sessionParam || mode === "swiping" || mode === "waiting" || mode === "match_screen" || mode === "pass_transition") {
        setTimeout(() => {
          const el = document.getElementById("co-watch-section");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 500);
      }
    }
  }, [mode]);

  // Storage listener for cross-tab multi-window syncing
  useEffect(() => {
    if (typeof window === "undefined" || !sessionId) return;

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === `cinematch_session_${sessionId}`) {
        try {
          const val = e.newValue;
          if (!val) return;
          const parsed = JSON.parse(val);

          // 1. Partner Join trigger (for Player 1)
          if (userRole === "p1" && parsed.p2Active && mode === "waiting") {
            setPartnerJoined(true);
            setTimeout(() => {
              setMode("swiping");
              setCurrentIndex(0);
            }, 1200);
          }

          // 2. Continuous likes synchronization
          if (parsed.p1Likes) setPlayer1Likes(new Set(parsed.p1Likes));
          if (parsed.p2Likes) setPlayer2Likes(new Set(parsed.p2Likes));

          // 3. Dynamic match intersection check
          const intersection = parsed.p1Likes.find((id: number) => parsed.p2Likes.includes(id));
          if (intersection) {
            const matched = deck.find(m => m.id === intersection);
            if (matched) {
              setMatchedMovie(matched);
              setMode("match_screen");
            }
          }
        } catch (err) {
          console.error("Error synchronizing rooms state:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageSync);
    return () => {
      window.removeEventListener("storage", handleStorageSync);
    };
  }, [sessionId, userRole, mode, deck]);

  // Arrow Key keyboard hotkeys support for desktop swiping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== "swiping" || currentIndex >= deck.length) return;
      if (e.key === "ArrowLeft") {
        handleSwipeAction(false);
      } else if (e.key === "ArrowRight") {
        handleSwipeAction(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode, currentIndex, deck, sessionId, isSimulated, matchType, activePlayer]);

  // Heuristics for AI Swipe determinations
  const runAISwipe = (movie: Movie, p1Likes: Set<number>) => {
    // Check if movie genre matches AI's preferences
    const hasMatchingGenre = movie.genre_ids.some(id => selectedAI.genres.includes(id));
    
    // Weighted probability check
    const isLike = hasMatchingGenre 
      ? Math.random() < 0.85  // 85% like rate if genre matches
      : Math.random() < 0.25; // 25% like rate otherwise

    const updatedP2Likes = new Set(player2Likes);
    let reactionText = "";

    if (isLike) {
      updatedP2Likes.add(movie.id);
      reactionText = selectedAI.reactions.like[Math.floor(Math.random() * selectedAI.reactions.like.length)];
      setPlayer2Likes(updatedP2Likes);

      // Instantly trigger Match if Player 1 also liked it!
      if (p1Likes.has(movie.id)) {
        setTimeout(() => {
          setMatchedMovie(movie);
          setMode('match_screen');
        }, 600);
      }
    } else {
      reactionText = selectedAI.reactions.dislike[Math.floor(Math.random() * selectedAI.reactions.dislike.length)];
    }

    setAiReaction(reactionText);
  };

  const handleSwipeAction = (isLike: boolean) => {
    if (currentIndex >= deck.length) return;

    const currentMovie = deck[currentIndex];

    // Case A: Real-Time Synced Link Mode (cross-tab)
    if (sessionId && !isSimulated) {
      const sessionDataStr = localStorage.getItem(`cinematch_session_${sessionId}`);
      if (sessionDataStr) {
        try {
          const sessionData = JSON.parse(sessionDataStr);
          
          if (userRole === "p1") {
            const updatedP1 = new Set(player1Likes);
            if (isLike) updatedP1.add(currentMovie.id);
            setPlayer1Likes(updatedP1);
            sessionData.p1Likes = Array.from(updatedP1);
          } else {
            const updatedP2 = new Set(player2Likes);
            if (isLike) updatedP2.add(currentMovie.id);
            setPlayer2Likes(updatedP2);
            sessionData.p2Likes = Array.from(updatedP2);
          }

          // Write back to sync across windows
          localStorage.setItem(`cinematch_session_${sessionId}`, JSON.stringify(sessionData));

          // Check for immediate intersection
          const commonId = sessionData.p1Likes.find((id: number) => sessionData.p2Likes.includes(id));
          if (commonId) {
            const matchMovie = deck.find(m => m.id === commonId);
            if (matchMovie) {
              setMatchedMovie(matchMovie);
              setMode("match_screen");
              return;
            }
          }
        } catch (e) {
          console.error("Failed writing swipes to localStorage:", e);
        }
      }

      if (currentIndex === deck.length - 1) {
        setTimeout(() => {
          if (mode !== 'match_screen') {
            alert("Swipe deck completed! Waiting for your partner to finish swiping...");
          }
        }, 500);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
      return;
    }

    // Case B: Simulated Partner Mode (single tab demo)
    if (isSimulated) {
      const updatedP1 = new Set(player1Likes);
      if (isLike) updatedP1.add(currentMovie.id);
      setPlayer1Likes(updatedP1);

      // Simulate partner voting after 600ms
      const partnerVotesLike = Math.random() < 0.65; // 65% agreement check
      if (partnerVotesLike) {
        const updatedP2 = new Set(player2Likes);
        updatedP2.add(currentMovie.id);
        setPlayer2Likes(updatedP2);

        if (isLike) {
          setTimeout(() => {
            setMatchedMovie(currentMovie);
            setMode("match_screen");
          }, 600);
          return;
        }
      }

      if (currentIndex === deck.length - 1) {
        setTimeout(() => {
          if (mode !== 'match_screen') {
            alert("Swiping completed! No matches found with your simulated partner. Try reshuffling!");
            resetGame();
          }
        }, 1200);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
      return;
    }

    // Case C: Couch Pass & Play Mode (single device)
    if (matchType === 'pass_play') {
      if (activePlayer === 1) {
        const updated = new Set(player1Likes);
        if (isLike) updated.add(currentMovie.id);
        setPlayer1Likes(updated);

        if (currentIndex === deck.length - 1) {
          // Handover to Player 2
          setTimeout(() => {
            setMode('pass_transition');
          }, 400);
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      } else {
        const updated = new Set(player2Likes);
        if (isLike) updated.add(currentMovie.id);
        setPlayer2Likes(updated);

        // Check if both liked it!
        if (isLike && player1Likes.has(currentMovie.id)) {
          setMatchedMovie(currentMovie);
          setMode('match_screen');
          return;
        }

        if (currentIndex === deck.length - 1) {
          // Finished swiping both
          setTimeout(() => {
            // Find any matches or end
            const intersection = deck.find(m => player1Likes.has(m.id) && updated.has(m.id));
            if (intersection) {
              setMatchedMovie(intersection);
              setMode('match_screen');
            } else {
              alert("Swipe deck completed! No matches found. Try swiping on a new session!");
              resetGame();
            }
          }, 400);
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      }
      return;
    }

    // Case D: AI Companion Logic
    const updatedP1 = new Set(player1Likes);
    if (isLike) updatedP1.add(currentMovie.id);
    setPlayer1Likes(updatedP1);

    // Trigger AI reaction and decision
    runAISwipe(currentMovie, updatedP1);

    if (currentIndex === deck.length - 1) {
      setTimeout(() => {
        if (mode !== 'match_screen') {
          alert("Swiping completed! Try selecting another companion or reshuffling!");
          resetGame();
        }
      }, 1200);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Launch synchronizer invite room
  const startInviteMode = () => {
    const uniqId = "cine_" + Math.random().toString(36).substring(2, 9);
    setSessionId(uniqId);
    setUserRole("p1");
    setMatchType("pass_play");
    setIsSimulated(false);
    setPartnerJoined(false);
    setCopied(false);

    const currentDeck = deck.length > 0 ? deck : MOCK_MOVIES.slice(0, 8);
    const initialSession = {
      deck: currentDeck,
      p1Likes: [],
      p2Likes: [],
      p1Active: true,
      p2Active: false,
      matchedMovieId: null
    };

    localStorage.setItem(`cinematch_session_${uniqId}`, JSON.stringify(initialSession));

    const url = window.location.origin + window.location.pathname + `?session=${uniqId}&role=p2`;
    setInviteUrl(url);
    setMode("waiting");
  };

  const startSwiping = (selectedType: 'pass_play' | 'ai') => {
    setMatchType(selectedType);
    setMode('swiping');
    setCurrentIndex(0);
    setPlayer1Likes(new Set());
    setPlayer2Likes(new Set());
    setActivePlayer(1);
    setAiReaction("");
    setMatchedMovie(null);
    setSessionId(null);
    setUserRole(null);
    setIsSimulated(false);
  };

  const startPlayer2Turn = () => {
    setMode('swiping');
    setActivePlayer(2);
    setCurrentIndex(0);
  };

  const resetGame = () => {
    setMode('menu');
    setCurrentIndex(0);
    setPlayer1Likes(new Set());
    setPlayer2Likes(new Set());
    setActivePlayer(1);
    setAiReaction("");
    setMatchedMovie(null);
    setSessionId(null);
    setUserRole(null);
    setPartnerJoined(false);
    setIsSimulated(false);

    // Remove query params to avoid re-triggering join flow on refresh
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("session");
      url.searchParams.delete("role");
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }
  };

  const activeMovie = deck[currentIndex];

  return (
    <section id="co-watch-section" className="relative py-20 bg-black/60 border-t border-b border-white/[0.04] overflow-hidden">
      
      {/* Visual background lights */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-cine-blue/5 blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-[120px] pointer-events-none -translate-y-1/2" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* ===================================================================
            MENU INTERFACE: Explainer Panel & Mode Selection
            =================================================================== */}
        {mode === 'menu' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Top decorative badge */}
            <div className="inline-flex gap-2 items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-cine-blue/10 via-purple-500/10 to-teal-500/10 border border-cine-blue/20 text-xs font-black text-cine-blue uppercase tracking-widest mb-6 hover:border-cine-blue/40 hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
              <Users className="w-3.5 h-3.5 animate-pulse text-cine-blue" />
              <span className="text-[10px] font-black tracking-widest text-zinc-300 font-premium">Co-Watch Feature Arena</span>
            </div>

            {/* Glowing Main Title */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-8 tracking-tight font-premium uppercase flex flex-wrap items-center justify-center gap-2">
              <span>Co-Watch</span>
              <span className="text-gradient-cine relative">
                Movie Matcher
              </span>
              <div className="flex items-center gap-3 ml-3">
                <span className="inline-block animate-bounce drop-shadow-[0_0_12px_rgba(168,85,247,0.75)] hover:scale-120 transition-all duration-300 cursor-default text-4xl sm:text-5xl select-none" style={{ animationDuration: '3s' }}>
                  🍿
                </span>
                <span className="inline-block animate-pulse drop-shadow-[0_0_12px_rgba(244,63,94,0.75)] hover:scale-120 transition-all duration-300 cursor-default text-4xl sm:text-5xl select-none">
                  💖
                </span>
              </div>
            </h2>
            
            {/* High-end Editorial Glassmorphism Explainer */}
            <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-950/85 via-zinc-900/40 to-zinc-950/85 border border-white/[0.08] backdrop-blur-xl mb-12 text-left relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              {/* Animated top neon glow border line */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cine-blue to-transparent opacity-70 group-hover:via-purple-500 transition-all duration-500" />
              
              <div className="flex items-center gap-3 mb-5">
                <div className="px-3 py-1 rounded-md bg-cine-blue/15 border border-cine-blue/30 text-[10px] font-black uppercase tracking-widest text-cine-blue font-premium">
                  Overview
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-premium">How It Works</h3>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6 font-medium font-premium">
                Solve the eternal couple/friends argument: <strong className="text-white font-semibold">"What should we watch tonight?"</strong>. Swipe Tinder-style (Right to Like, Left to Skip) through a curated movie deck in absolute secret.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start group/item">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-black shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover/item:bg-purple-500/30 group-hover/item:scale-110 transition-all duration-300">
                    ✨
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium font-premium">
                    Generate a synchronized <span className="text-white font-extrabold bg-gradient-to-r from-purple-400 to-cine-blue bg-clip-text text-transparent group-hover/item:from-purple-300 group-hover/item:to-cine-blue transition-all">Invite Link</span> to vote in real-time from separate screens.
                  </p>
                </div>
                
                <div className="flex gap-4 items-start group/item">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-cine-blue/15 border border-cine-blue/30 text-cine-blue text-xs font-black shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover/item:bg-cine-blue/30 group-hover/item:scale-110 transition-all duration-300">
                    🛋️
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium font-premium">
                    Or select <span className="text-white font-extrabold bg-gradient-to-r from-cine-blue to-teal-400 bg-clip-text text-transparent group-hover/item:from-cine-blue group-hover/item:to-teal-300 transition-all">Pass & Play Mode</span> to share a single device on the couch.
                  </p>
                </div>
                
                <div className="flex gap-4 items-start group/item">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-black shadow-[0_0_15px_rgba(234,179,8,0.15)] group-hover/item:bg-yellow-500/30 group-hover/item:scale-110 transition-all duration-300">
                    🍿
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium font-premium">
                    The magic: The instant both of you vote <span className="text-white font-extrabold bg-gradient-to-r from-yellow-400 to-rose-400 bg-clip-text text-transparent group-hover/item:from-yellow-300 group-hover/item:to-rose-300 transition-all">"Right"</span> on the same film, the screen explodes in celebration and recommends a tailored snack/drink pairing for your movie!
                  </p>
                </div>
              </div>
            </div>

            {/* Instruction description cards with premium card grids */}
            <div className="grid sm:grid-cols-3 gap-6 text-left max-w-4xl mx-auto mb-12 font-premium">
              
              {/* Card 1 */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 border border-white/[0.06] backdrop-blur-md relative overflow-hidden group hover:border-cine-blue/30 hover:shadow-[0_15px_30px_rgba(99,102,241,0.08)] hover:-translate-y-1 transition-all duration-300">
                {/* Floating giant card number */}
                <div className="text-7xl font-black text-white/[0.02] absolute right-4 bottom-2 select-none pointer-events-none group-hover:text-cine-blue/[0.04] transition-all duration-500 font-display">
                  01
                </div>
                <div className="size-10 rounded-xl bg-cine-blue/15 border border-cine-blue/30 text-cine-blue flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-100 mb-2.5 flex items-center gap-2 font-premium uppercase tracking-wide">
                  <span>Invite Partner</span> 
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  Generate a synchronized rooms invite link, or select **Pass & Play** to share one screen, or play with virtual companions (Yoda, Wednesday, Jack Sparrow) with specialized genre tastes.
                </p>
                <div className="absolute inset-0 bg-gradient-to-tr from-cine-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 border border-white/[0.06] backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 hover:shadow-[0_15px_30px_rgba(168,85,247,0.08)] hover:-translate-y-1 transition-all duration-300">
                {/* Floating giant card number */}
                <div className="text-7xl font-black text-white/[0.02] absolute right-4 bottom-2 select-none pointer-events-none group-hover:text-purple-500/[0.04] transition-all duration-500 font-display">
                  02
                </div>
                <div className="size-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Film className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-100 mb-2.5 flex items-center gap-2 font-premium uppercase tracking-wide">
                  <span>Swipe Tinder-Style</span> 
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  Swipe **Right (Like)** to save a film, or **Left (Skip)** to pass. Both users vote secretly on separate screens or sequentially. Desktop supports Left / Right arrow keys!
                </p>
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 border border-white/[0.06] backdrop-blur-md relative overflow-hidden group hover:border-yellow-500/30 hover:shadow-[0_15px_30px_rgba(234,179,8,0.08)] hover:-translate-y-1 transition-all duration-300">
                {/* Floating giant card number */}
                <div className="text-7xl font-black text-white/[0.02] absolute right-4 bottom-2 select-none pointer-events-none group-hover:text-yellow-500/[0.04] transition-all duration-500 font-display">
                  03
                </div>
                <div className="size-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Gift className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-100 mb-2.5 flex items-center gap-2 font-premium uppercase tracking-wide">
                  <span>Snacking Pairings</span> 
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  The moment a mutual like triggers: **It's a CineMatch!** Unlocks a detailed recommendations screen paired with a custom snack menu (e.g. Alien popcorn + space cider).
                </p>
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Launch Actions with Premium styling and subtle scaling effects */}
            <div className="max-w-md mx-auto space-y-4">
              <HoverButton
                onClick={startInviteMode}
                glowColor="#a855f7"
                className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cine-blue hover:from-violet-600/90 hover:to-cine-blue/90 text-white font-extrabold h-13.5 rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center text-xs sm:text-sm font-premium uppercase tracking-wider px-4 py-0"
              >
                <div className="flex items-center justify-center gap-3 w-full h-full">
                  <div className="flex items-center justify-center size-7.5 rounded-xl bg-white/15 border border-white/25 shadow-inner">
                    <Users className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <span className="tracking-wider">Invite Partner (Live Synced Room)</span>
                  <span className="inline-flex gap-1 items-center shrink-0 ml-1">
                    <span className="animate-pulse">🍿</span>
                    <span className="animate-bounce" style={{ animationDuration: '1.5s' }}>💖</span>
                  </span>
                </div>
              </HoverButton>

              <div className="flex items-center gap-4 justify-center">
                <RippleButton
                  variant="hover"
                  hoverBaseColor="#6366f1"
                  onClick={() => startSwiping('pass_play')}
                  className="w-full bg-zinc-950/45 border border-white/[0.05] hover:border-cine-blue/40 text-zinc-300 font-bold h-12.5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center text-xs hover:text-white font-premium shadow-lg py-0"
                >
                  <span className="flex items-center justify-center gap-2.5 w-full h-full">
                    <span className="inline-flex items-center justify-center size-7 rounded-lg bg-cine-blue/15 text-cine-blue border border-cine-blue/30 text-xs shadow-md">📱</span>
                    <span className="tracking-wide">Pass & Play (Couch Mode)</span>
                  </span>
                </RippleButton>

                <RippleButton
                  variant="hover"
                  hoverBaseColor="#a855f7"
                  onClick={() => startSwiping('ai')}
                  className="w-full bg-zinc-950/45 border border-white/[0.05] hover:border-purple-500/40 text-zinc-300 font-bold h-12.5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center text-xs hover:text-white font-premium shadow-lg py-0"
                >
                  <span className="flex items-center justify-center gap-2.5 w-full h-full">
                    <span className="inline-flex items-center justify-center size-7 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs shadow-md">🤖</span>
                    <span className="tracking-wide">Play with AI Persona</span>
                  </span>
                </RippleButton>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            WAITING INTERFACE: Cross-tab room invite page
            =================================================================== */}
        {mode === 'waiting' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center p-8 rounded-3xl bg-zinc-900 border border-white/[0.08] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-[-50px] left-[-50px] w-48 h-48 rounded-full bg-cine-blue/10 blur-[60px]" />

            <div className="w-16 h-16 rounded-2xl bg-cine-blue/15 border border-cine-blue/30 text-cine-blue flex items-center justify-center mx-auto mb-6 shadow-xl relative">
              <Users className="w-8 h-8 animate-pulse" />
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cine-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cine-blue"></span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-3 font-premium uppercase flex items-center justify-center gap-2">
              <span>Invite Your Partner</span>
              <span className="inline-flex gap-1 items-center ml-1">
                <span className="animate-pulse">🍿</span>
                <span className="animate-bounce" style={{ animationDuration: '1.5s' }}>💖</span>
              </span>
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-premium">
              Share the room invite link with your partner or friend. When they open it on their screen, both of you will enter a real-time synchronized swipe deck!
            </p>

            {/* Invite link input + Copy button */}
            <div className="flex items-center gap-2 bg-black/60 rounded-2xl p-2 border border-white/[0.06] mb-6">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="bg-transparent text-xs text-zinc-400 select-all outline-none flex-1 px-3 font-mono truncate"
              />
              <RippleButton
                variant="hover"
                hoverBaseColor={copied ? "#10b981" : "#3b82f6"}
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`text-xs font-extrabold h-10 px-4 rounded-xl transition-all duration-300 cursor-pointer shadow-md active:scale-95 py-0 border-none select-none text-white ${
                  copied 
                    ? "bg-gradient-to-r from-emerald-600 to-teal-500" 
                    : "bg-gradient-to-r from-cine-blue to-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                }`}
              >
                {copied ? "Copied! 📋✨" : "Copy Link"}
              </RippleButton>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8 bg-zinc-950/40 py-2.5 px-4 rounded-xl border border-white/[0.04]">
              <div className="size-2 rounded-full bg-yellow-500 animate-ping" />
              <span className="text-xs font-semibold text-zinc-400">
                {partnerJoined ? "Partner connected! Launching..." : "Waiting for partner to join..."}
              </span>
            </div>

            {/* Tip Box */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/[0.04] text-left mb-6">
              <div className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider mb-1.5">
                💡 Quick Multi-Tab Test:
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Copy the link above, open it in a <strong>new browser tab or another regular window</strong>, and watch both tabs connect and transition instantly!
              </p>
              <p className="text-[10px] text-zinc-500/80 leading-normal mt-1.5 border-t border-white/[0.04] pt-1.5">
                Note: Do not use Incognito mode or different browsers, as local storage sync requires tabs to share the same browser profile storage.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <RippleButton
                variant="hover"
                hoverBaseColor="#3b82f6"
                onClick={() => {
                  setIsSimulated(true);
                  setPartnerJoined(true);
                  setTimeout(() => {
                    setMode("swiping");
                    setCurrentIndex(0);
                  }, 1200);
                }}
                className="w-full bg-zinc-950/60 border border-white/[0.06] hover:border-blue-500/40 text-zinc-300 font-bold h-12 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center text-xs py-0"
              >
                <span className="flex items-center justify-center gap-2.5 w-full h-full">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
                  <span className="tracking-wide">Simulate Partner (Single-Tab Demo)</span>
                </span>
              </RippleButton>

              <RippleButton
                variant="ghost"
                onClick={resetGame}
                className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer w-full flex justify-center py-2 transition-all duration-300 hover:scale-[1.02]"
              >
                Cancel and Go Back
              </RippleButton>
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            SWIPE ARENA INTERFACE: Tinder Deck and Interactive Controls
            =================================================================== */}
        {mode === 'swiping' && activeMovie && (
          <div className="max-w-md mx-auto relative">
            
            {/* Header Stage Indicators */}
            <div className="flex items-center justify-between mb-4 px-2 text-xs">
              <RippleButton
                variant="ghost"
                onClick={resetGame}
                className="h-8 rounded-lg text-zinc-500 hover:text-zinc-300 cursor-pointer flex items-center justify-center gap-1.5 text-xs px-3"
              >
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </span>
              </RippleButton>

              <span className="font-bold text-zinc-400 uppercase tracking-wider bg-zinc-900/60 px-3 py-1 rounded-full border border-white/[0.04]">
                {sessionId ? (
                  isSimulated ? (
                    "Simulated Session (You: P1)"
                  ) : (
                    `Room Session (You: ${userRole?.toUpperCase()})`
                  )
                ) : matchType === 'pass_play' ? (
                  `Player ${activePlayer} Swiping`
                ) : (
                  "Swiping with Companion"
                )}
              </span>

              <span className="text-zinc-500 font-bold">
                {currentIndex + 1} / {deck.length}
              </span>
            </div>

            {/* AI Companion selection sidebar inside arena */}
            {matchType === 'ai' && (
              <div className="flex gap-2 justify-center mb-5 bg-zinc-950/40 p-2 rounded-xl border border-white/[0.04]">
                {AI_PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedAI(p); setAiReaction(""); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedAI.id === p.id 
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" 
                        : "bg-transparent text-zinc-500 hover:text-zinc-400 border border-transparent"
                    }`}
                  >
                    <span>{p.avatar}</span>
                    <span>{p.name.split(" ")[1]}</span>
                  </button>
                ))}
              </div>
            )}

            {sessionId && (
              <div className="flex items-center justify-center gap-1.5 mb-3 text-[10px] text-zinc-500 uppercase tracking-widest font-bold bg-zinc-950/40 py-1.5 px-3 rounded-full border border-white/[0.04] w-fit mx-auto animate-pulse">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>
                  {isSimulated ? "Simulated Partner Connected 🟢" : "Real-Time Room Synced 🟢"}
                </span>
              </div>
            )}

            {/* Interactive Swipe Tinder Card Container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMovie.id}
                initial={{ opacity: 0, scale: 0.96, rotateY: -10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-3xl bg-zinc-900 border border-white/[0.08] shadow-2xl overflow-hidden aspect-[2/3] sm:aspect-auto sm:min-h-[500px]"
              >
                {/* Backdrop ambient blur filter */}
                <div 
                  className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-25 scale-110 pointer-events-none transition-all duration-500"
                  style={{ backgroundImage: `url(${getPosterUrl(activeMovie.poster_path, "w500")})` }}
                />

                {/* Poster Display */}
                <div className="relative aspect-[2/3] w-full bg-zinc-950 overflow-hidden group">
                  <img
                    src={getPosterUrl(activeMovie.poster_path, "w780")}
                    alt={activeMovie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-95" />

                  {/* Top-rated rating badge */}
                  <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md border border-white/[0.08] rounded-xl px-2.5 py-1 text-xs font-bold text-yellow-400 flex items-center gap-1">
                    ★ {Math.round(activeMovie.vote_average * 10) / 10}
                  </div>

                  {/* AI Dialogue bubble overlays */}
                  {matchType === 'ai' && aiReaction && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-4 right-4 bg-purple-950/85 backdrop-blur-md border border-purple-500/30 rounded-2xl p-3 max-w-[200px] shadow-2xl"
                    >
                      <div className="flex gap-2 items-start">
                        <span className="text-lg">{selectedAI.avatar}</span>
                        <div className="text-[10px] leading-normal text-purple-200">
                          <div className="font-bold text-purple-300 uppercase tracking-wide mb-0.5">{selectedAI.name.split(" ")[1]} says:</div>
                          "{aiReaction}"
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Content Overlay */}
                <div className="p-5 relative z-20 font-premium">
                  <span className="text-[10px] font-bold text-cine-blue uppercase tracking-widest mb-1.5 block font-premium">
                    {activeMovie.release_date?.slice(0, 4) || "N/A"}
                  </span>
                  
                  <h3 className="text-xl font-bold text-white tracking-tight mb-2 truncate font-display uppercase">
                    {activeMovie.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-3 mb-4 leading-relaxed font-premium">
                    {activeMovie.overview || "No overview details available."}
                  </p>

                  {/* Genre Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {activeMovie.genre_ids.map(id => {
                      const genreObj = MOCK_GENRES.find(g => g.id === id);
                      if (!genreObj) return null;
                      return (
                        <span 
                          key={id}
                          className="text-[9px] font-semibold text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-0.5"
                        >
                          {genreObj.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Core Swiping Trigger Controls */}
            <div className="flex items-center justify-center gap-6 mt-6">
              
              {/* Skip / Dislike Action */}
              <button
                onClick={() => handleSwipeAction(false)}
                className="w-14 h-14 rounded-full bg-zinc-900 border border-white/[0.06] hover:border-red-500/30 text-zinc-500 hover:text-red-400 flex items-center justify-center hover:bg-red-500/10 shadow-lg active:scale-90 transition-all cursor-pointer group"
                aria-label="Skip movie"
              >
                <X className="w-6 h-6 group-hover:-rotate-12 transition-transform duration-200" />
              </button>

              {/* Action hints for Desktop */}
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold hidden sm:inline">
                Left / Right arrow key support
              </span>

              {/* Love / Like Action */}
              <button
                onClick={() => handleSwipeAction(true)}
                className="w-14 h-14 rounded-full bg-zinc-900 border border-white/[0.06] hover:border-emerald-500/30 text-zinc-500 hover:text-emerald-400 flex items-center justify-center hover:bg-emerald-500/10 shadow-lg active:scale-90 transition-all cursor-pointer group"
                aria-label="Like movie"
              >
                <Heart className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 fill-transparent hover:fill-emerald-400/20" />
              </button>

            </div>

          </div>
        )}

        {/* ===================================================================
            INTERMISSION STAGE: Couch Pass-and-Play Turn handover
            =================================================================== */}
        {mode === 'pass_transition' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center p-8 rounded-3xl bg-zinc-900 border border-white/[0.08] shadow-2xl relative overflow-hidden"
          >
            {/* Spotlight decoration */}
            <div className="absolute top-[-50px] left-[-50px] w-48 h-48 rounded-full bg-purple-600/10 blur-[60px]" />

            <div className="w-16 h-16 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
              <Users className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-3 font-premium uppercase flex items-center justify-center gap-2">
              <span>Pass to Partner!</span>
              <span className="inline-block animate-bounce drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] select-none text-2xl" style={{ animationDuration: '2s' }}>
                🍿
              </span>
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed mb-8 font-premium">
              It is Player 2's turn to vote. Player 1's likes are locked in secret. Pass the device over, click the button below to load the same deck of films, and find out your CineMatches! No peeking!
            </p>

            <HoverButton
              glowColor="#6366f1"
              onClick={startPlayer2Turn}
              className="w-full bg-gradient-to-r from-violet-600 to-cine-blue hover:from-violet-600/90 hover:to-cine-blue/90 text-white font-extrabold h-12.5 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center text-xs sm:text-sm font-premium uppercase tracking-wider px-4 py-0"
            >
              <div className="flex items-center justify-center gap-1.5 w-full h-full">
                <span>I'm Ready, Start Player 2 Turn</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </HoverButton>
          </motion.div>
        )}

        {/* ===================================================================
            MATCH SCREEN INTERFACE: Fullscreen Confetti Explosion & Curated Pairing
            =================================================================== */}
        {mode === 'match_screen' && matchedMovie && (
          <div className="relative">
            <ConfettiEffect />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              className="max-w-2xl mx-auto rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-white/[0.08] shadow-2xl p-6 sm:p-8 relative overflow-hidden"
            >
              {/* Decorative side lights */}
              <div className="absolute top-1/4 right-0 w-48 h-48 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
              <div className="absolute bottom-1/4 left-0 w-48 h-48 rounded-full bg-cine-blue/10 blur-[80px] pointer-events-none" />

              <div className="text-center mb-6">
                <div className="inline-flex gap-2 items-center px-4.5 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="font-premium">It's a CineMatch!</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-premium uppercase flex flex-wrap items-center justify-center gap-3">
                  <span>You Agreed on a Movie!</span>
                  <div className="flex items-center gap-2">
                    <span className="inline-block animate-bounce drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] text-2xl select-none">🍿</span>
                    <span className="inline-block animate-pulse drop-shadow-[0_0_10px_rgba(244,63,94,0.5)] text-2xl select-none">🎉</span>
                  </div>
                </h3>
              </div>

              {/* Splitted match details card */}
              <div className="grid sm:grid-cols-12 gap-6 items-center bg-black/40 p-5 rounded-2xl border border-white/[0.04] mb-8 relative">
                
                {/* Poster container */}
                <div className="sm:col-span-4 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-950 border border-white/[0.06] shadow-md relative">
                  <img
                    src={getPosterUrl(matchedMovie.poster_path, "w500")}
                    alt={matchedMovie.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info details */}
                <div className="sm:col-span-8 flex flex-col">
                  <div className="flex gap-2 items-center mb-2">
                    <span className="text-xs font-bold text-cine-blue uppercase tracking-wider">
                      {matchedMovie.release_date?.slice(0, 4)}
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-xs text-yellow-400 font-bold flex items-center gap-0.5">
                      ★ {Math.round(matchedMovie.vote_average * 10) / 10}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white tracking-tight mb-2">
                    {matchedMovie.title}
                  </h4>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {matchedMovie.overview || "No overview available."}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {matchedMovie.genre_ids.map(id => {
                      const genreObj = MOCK_GENRES.find(g => g.id === id);
                      if (!genreObj) return null;
                      return (
                        <span 
                          key={id}
                          className="text-[9px] font-semibold text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-0.5"
                        >
                          {genreObj.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* ===============================================================
                  EXCLUSIVE: Curated Snacking Combos (Wow factor)
                  =============================================================== */}
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.06] shadow-inner mb-8">
                <div className="flex gap-3 items-center mb-3">
                  <div className="size-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                      Movie Night Taste Matcher
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase">
                      Curated pairing for {getSnackPairing(matchedMovie.genre_ids).theme}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/[0.04] flex items-center gap-3">
                    <span className="text-2xl">{getSnackPairing(matchedMovie.genre_ids).emoji.slice(0, 2)}</span>
                    <div>
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Popcorn & Snacks</div>
                      <div className="text-xs text-zinc-300 font-semibold">{getSnackPairing(matchedMovie.genre_ids).food}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/[0.04] flex items-center gap-3">
                    <span className="text-2xl">{getSnackPairing(matchedMovie.genre_ids).emoji.slice(2)}</span>
                    <div>
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Signature Drink</div>
                      <div className="text-xs text-zinc-300 font-semibold">{getSnackPairing(matchedMovie.genre_ids).drink}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post-match control buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <HoverButton
                  glowColor="#10b981"
                  onClick={resetGame}
                  className="w-full bg-gradient-to-r from-teal-500 via-emerald-600 to-cine-blue hover:from-teal-500/90 hover:via-emerald-600/90 hover:to-cine-blue/90 text-white font-extrabold h-12.5 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center text-xs sm:text-sm font-premium uppercase tracking-wider px-4 py-0"
                >
                  <div className="flex items-center justify-center gap-2 w-full h-full">
                    <RotateCcw className="w-4 h-4 animate-spin-once shrink-0" />
                    <span>Start New Session</span>
                  </div>
                </HoverButton>

                <RippleButton
                  variant="hover"
                  hoverBaseColor="#06b6d4"
                  onClick={() => alert(`Enjoy watching "${matchedMovie.title}" tonight! 🍿🎬`)}
                  className="w-full border border-white/[0.08] hover:border-cine-blue/40 bg-zinc-950/75 text-zinc-300 hover:text-white font-extrabold h-12.5 rounded-2xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center text-xs sm:text-sm font-premium uppercase tracking-wider shadow-xl py-0"
                >
                  <span className="flex items-center justify-center gap-2.5 w-full h-full">
                    <span className="flex items-center justify-center size-7 rounded-lg bg-cine-blue/15 text-cine-blue border border-cine-blue/30 text-xs shadow-md shrink-0">
                      <Film className="w-3.5 h-3.5" />
                    </span>
                    <span>Start Playback</span>
                  </span>
                </RippleButton>
              </div>

            </motion.div>
          </div>
        )}

      </div>
    </section>
  );
}
