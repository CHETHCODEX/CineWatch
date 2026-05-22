"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";

// =============================================================================
// Custom SVG Components — Hand-Drawn Accent Arrows
// =============================================================================

const ArrowAccentLeft = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full text-cine-blue stroke-current overflow-visible"
    fill="none"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10,90 C 10,40 40,20 60,50 C 70,65 80,75 95,70" />
    <path d="M80,55 L95,70 L85,85" />
  </svg>
);

const ArrowAccentRight = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full text-cine-amber stroke-current overflow-visible"
    fill="none"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M90,10 C 80,60 60,80 40,60 C 20,40 40,20 60,30 C 80,40 70,70 50,80" />
    <path d="M65,75 L50,80 L55,65" />
  </svg>
);

const ArrowDark1 = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full text-white/40 stroke-current overflow-visible"
    fill="none"
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20,80 Q 40,20 80,40" />
    <path d="M60,20 L80,40 L50,60" />
  </svg>
);

const ArrowDark2 = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full text-white/40 stroke-current overflow-visible"
    fill="none"
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20,80 Q 40,20 80,40" />
    <path d="M60,20 L80,40 L50,60" />
  </svg>
);

// =============================================================================
// Circular Spinning Badge
// =============================================================================

const CircularBadge = () => (
  <div className="relative w-28 h-28 md:w-36 md:h-36 bg-cine-amber rounded-full flex items-center justify-center shadow-xl shadow-cine-amber/20 rotate-12 hover:scale-105 transition-transform cursor-pointer border-[3px] border-white/10">
    <div className="absolute inset-1 animate-[spin_10s_linear_infinite]">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          id="circlePath"
          d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
          fill="none"
        />
        <text
          className="text-[11px] font-black tracking-[0.18em] uppercase"
          fill="black"
        >
          <textPath href="#circlePath" startOffset="0%">
            EXPLORE NOW • FIND YOUR FILM • EXPLORE NOW •{" "}
          </textPath>
        </text>
      </svg>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="w-10 h-10 text-black stroke-current overflow-visible"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20,80 Q 40,50 30,30 T 80,20" />
        <path d="M60,10 L80,20 L70,40" />
      </svg>
    </div>
  </div>
);

// =============================================================================
// Hero Component — CineMatch Cinematic Edition
// =============================================================================

export function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#040B2E] via-[#060d24] to-background flex flex-col font-sans selection:bg-cine-blue selection:text-white relative overflow-hidden w-full">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* Radial glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_oklch(0.62_0.214_259_/_15%)_0%,_transparent_70%)] pointer-events-none z-0" />

      {/* Hero Section */}
      <main className="flex-1 relative z-10 pt-24 pb-32 md:pt-32 md:pb-48 px-4 flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto">
        {/* Massive Typography & Elements Container */}
        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center z-10 mt-4 mb-16">
          {/* Text Stack */}
          <div className="w-full flex flex-col items-center relative z-10 space-y-2 md:space-y-4">
            {/* #CINE */}
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex justify-start pl-[10%] md:pl-[25%] relative z-30"
            >
              <h1
                className="text-[clamp(4.5rem,12vw,160px)] font-black leading-[0.85] tracking-tighter text-cine-blue m-0 p-0 uppercase"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow:
                    "1px 1px 0 #0a1628, 2px 2px 0 #0a1628, 3px 3px 0 #0a1628, 4px 4px 0 #0a1628, 5px 5px 0 #0a1628, 6px 6px 0 #0a1628, 7px 7px 0 #0a1628, 8px 8px 0 #0a1628, 9px 9px 0 #0a1628, 10px 10px 0 #0a1628, 11px 11px 0 #0a1628, 12px 12px 0 #0a1628, 13px 13px 0 #0a1628, 14px 14px 0 #0a1628",
                }}
              >
                #CINE
              </h1>
            </motion.div>

            {/* MATCH */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex justify-center relative z-20"
            >
              <h1
                className="text-[clamp(5rem,15vw,220px)] font-black leading-[0.85] tracking-tighter text-white m-0 p-0 uppercase"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow:
                    "1px 1px 0 #0a1628, 2px 2px 0 #0a1628, 3px 3px 0 #0a1628, 4px 4px 0 #0a1628, 5px 5px 0 #0a1628, 6px 6px 0 #0a1628, 7px 7px 0 #0a1628, 8px 8px 0 #0a1628, 9px 9px 0 #0a1628, 10px 10px 0 #0a1628, 11px 11px 0 #0a1628, 12px 12px 0 #0a1628, 13px 13px 0 #0a1628, 14px 14px 0 #0a1628",
                }}
              >
                MATCH
              </h1>
            </motion.div>

            {/* MOVIES */}
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex justify-start pl-[15%] md:pl-[30%] relative z-10"
            >
              <h1
                className="text-[clamp(4.5rem,12vw,160px)] font-black leading-[0.85] tracking-tighter text-white m-0 p-0 uppercase"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow:
                    "1px 1px 0 #0a1628, 2px 2px 0 #0a1628, 3px 3px 0 #0a1628, 4px 4px 0 #0a1628, 5px 5px 0 #0a1628, 6px 6px 0 #0a1628, 7px 7px 0 #0a1628, 8px 8px 0 #0a1628, 9px 9px 0 #0a1628, 10px 10px 0 #0a1628, 11px 11px 0 #0a1628, 12px 12px 0 #0a1628, 13px 13px 0 #0a1628, 14px 14px 0 #0a1628",
                }}
              >
                MOVIES
              </h1>
            </motion.div>
          </div>

          {/* Absolute Overlays (Movie Cards, Arrows, Badge) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Floating Glass Card 1 — Movie Poster Card (Bottom Left) */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-[6%] left-[-1.5rem] sm:left-[4%] md:left-[12%] lg:left-[20%] lg:bottom-[10%] z-20 lg:z-30 pointer-events-auto scale-[0.58] sm:scale-75 lg:scale-100 origin-bottom-left"
            >
              <div className="w-40 md:w-52 aspect-[3/3.5] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-5 flex flex-col items-center justify-center rotate-[-12deg] shadow-2xl shadow-cine-blue/10 hover:rotate-0 transition-transform duration-500">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-cine-blue/30 to-cine-blue/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-white/10 overflow-hidden">
                  <Image
                    src="https://image.tmdb.org/t/p/w342/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"
                    alt="Inception poster"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover rounded-xl"
                    unoptimized
                  />
                </div>
                <div className="text-center mt-2">
                  <p className="font-bold text-sm md:text-lg text-white">
                    Inception
                  </p>
                  <p className="text-[10px] md:text-xs text-white/70 mt-1">
                    ★ 8.4 · Sci-Fi
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating Glass Card 2 — Movie Poster Card (Top Right) */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute top-[12%] right-[-1.5rem] sm:right-[4%] md:right-[12%] lg:right-[22%] lg:top-[15%] z-20 lg:z-30 pointer-events-auto scale-[0.58] sm:scale-75 lg:scale-100 origin-top-right"
            >
              <div className="w-40 md:w-52 aspect-[3/3.5] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-5 flex flex-col items-center justify-center rotate-[12deg] shadow-2xl shadow-cine-amber/10 hover:rotate-0 transition-transform duration-500">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-cine-amber/30 to-cine-amber/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-white/10 overflow-hidden">
                  <Image
                    src="https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
                    alt="The Dark Knight poster"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover rounded-xl"
                    unoptimized
                  />
                </div>
                <div className="text-center mt-2">
                  <p className="font-bold text-sm md:text-lg text-white">
                    The Dark Knight
                  </p>
                  <p className="text-[10px] md:text-xs text-white/70 mt-1">
                    ★ 8.5 · Action
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Decorative Arrow Left - Hidden on Mobile/Tablet */}
            <div className="hidden lg:block absolute bottom-[0%] left-[0%] md:left-[10%] w-24 h-24 md:w-32 md:h-32 z-20">
              <ArrowAccentLeft />
            </div>

            {/* Decorative Arrow Right - Hidden on Mobile/Tablet */}
            <div className="hidden lg:block absolute top-[5%] right-[0%] md:right-[10%] w-24 h-24 md:w-32 md:h-32 z-20">
              <ArrowAccentRight />
            </div>

            {/* Circular Badge - Hidden on Mobile */}
            <div className="hidden md:block absolute bottom-[-10%] right-[0%] md:right-[15%] z-40 pointer-events-auto">
              <CircularBadge />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Features Section */}
      <section className="bg-[#0c0c0c] text-white rounded-t-[2.5rem] md:rounded-t-[3.5rem] px-6 py-12 md:px-10 md:py-16 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] mt-auto w-full border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Card 1 — AI Recommendations */}
          <div className="bg-white/[0.04] backdrop-blur-sm rounded-[2rem] p-8 flex flex-col items-center text-center relative h-64 border border-white/[0.08] hover:border-white/[0.15] transition-colors duration-300">
            <h3 className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black">
              AI-POWERED
              <br />
              PICKS FOR YOU
            </h3>
            <p className="text-[10px] md:text-xs text-white/50 font-bold mb-auto">
              personalized recommendations every day
            </p>

            {/* Pill Graphic */}
            <div className="relative w-full flex justify-center mt-6">
              <div className="flex items-center bg-cine-blue rounded-2xl p-2 pr-16 text-white shadow-lg shadow-cine-blue/20 relative z-10">
                <div className="w-8 h-8 bg-white/10 rounded-xl mr-3 border border-white/20 overflow-hidden flex-shrink-0">
                  <Image
                    src="https://image.tmdb.org/t/p/w185/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"
                    alt="Inception"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold leading-none">
                    Inception
                  </p>
                  <p className="text-[8px] text-white/70 leading-none mt-1">
                    Because you liked Interstellar
                  </p>
                </div>
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cine-amber text-black font-black text-[10px] px-3 py-2 rounded-xl z-20 shadow-md">
                98% Match
              </div>
            </div>

            {/* Arrow pointing to next card */}
            <div className="hidden md:block absolute -right-12 bottom-8 w-16 h-16 z-30">
              <ArrowDark1 />
            </div>
          </div>

          {/* Card 2 — Browse Genres */}
          <div className="bg-white/[0.04] backdrop-blur-sm rounded-[2rem] p-8 flex flex-col items-center text-center relative h-64 border border-white/[0.08] hover:border-white/[0.15] transition-colors duration-300">
            <h3 className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black">
              EXPLORE BY
              <br />
              GENRE & MOOD
            </h3>
            <p className="text-[10px] md:text-xs text-white/50 font-bold mb-auto">
              action, thriller, sci-fi, romance & more
            </p>

            {/* Pill Graphic */}
            <div className="relative w-full flex justify-center mt-6">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1.5 text-white shadow-lg border border-white/10">
                <div className="bg-cine-blue/30 text-white font-bold text-sm px-4 py-2 rounded-full mr-2">
                  Sci-Fi
                </div>
                <div className="font-bold text-xs px-4 text-white/80">
                  42 Films
                </div>
              </div>

              {/* Small floating accent pill */}
              <div className="absolute -bottom-6 right-1/3 bg-cine-amber rounded-full p-2.5 shadow-lg shadow-cine-amber/20 transform rotate-12 z-20">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-black stroke-current"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            {/* Arrow pointing to next card */}
            <div className="hidden md:block absolute -right-12 bottom-8 w-16 h-16 z-30">
              <ArrowDark2 />
            </div>
          </div>

          {/* Card 3 — Watchlist */}
          <div className="bg-white/[0.04] backdrop-blur-sm rounded-[2rem] p-8 flex flex-col items-center text-center relative h-64 border border-white/[0.08] hover:border-white/[0.15] transition-colors duration-300">
            <h3 className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black">
              BUILD YOUR
              <br />
              WATCHLIST
            </h3>
            <p className="text-[10px] md:text-xs text-white/50 font-bold mb-auto">
              save films and track what you&apos;ve watched
            </p>

            {/* Pill Graphic */}
            <div className="flex flex-col items-center bg-cine-blue rounded-[2rem] px-6 py-4 text-white shadow-lg shadow-cine-blue/20 mt-6 relative w-full max-w-[200px]">
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1 text-white/70">
                Your Watchlist
              </p>
              <p className="text-xl font-black">12 Films</p>

              {/* Speech bubble tail */}
              <div className="absolute -bottom-2 left-8 w-5 h-5 bg-cine-blue transform rotate-45" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Default export for compatibility
export const Component = Hero;
