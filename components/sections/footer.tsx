"use client";

import Link from "next/link";
import Image from "next/image";
import { DIcons } from "dicons";
import { Film } from "lucide-react";

import ThemeToggle from "@/components/ui/footer";

// =============================================================================
// CineWatch Footer Navigation
// =============================================================================

const navigation = {
  categories: [
    {
      id: "cinematch",
      name: "CineMatch AI",
      sections: [
        {
          id: "discover",
          name: "Discover",
          items: [
            { name: "Trending", href: "#trending" },
            { name: "Top Rated", href: "#discover" },
            { name: "New Releases", href: "#discover" },
          ],
        },
        {
          id: "genres",
          name: "Genres",
          items: [
            { name: "Action", href: "#discover" },
            { name: "Sci-Fi", href: "#discover" },
            { name: "Drama", href: "#discover" },
          ],
        },
        {
          id: "features",
          name: "Features",
          items: [
            { name: "AI Picks", href: "#recommendations" },
            { name: "Mood Match", href: "#recommendations" },
            { name: "Watchlist", href: "#watchlist" },
          ],
        },
        {
          id: "browse",
          name: "Browse",
          items: [
            { name: "Collections", href: "#discover" },
            { name: "Directors", href: "#discover" },
            { name: "Studios", href: "#discover" },
          ],
        },
        {
          id: "community",
          name: "Community",
          items: [
            { name: "Reviews", href: "#" },
            { name: "Ratings", href: "#" },
            { name: "Discussions", href: "#" },
          ],
        },
        {
          id: "company",
          name: "Company",
          items: [
            { name: "About", href: "#" },
            { name: "Terms", href: "#" },
            { name: "Privacy", href: "#" },
          ],
        },
      ],
    },
  ],
};

const Underline =
  "hover:-translate-y-1 border border-dotted rounded-xl p-2.5 transition-transform";

// =============================================================================
// Footer Component
// =============================================================================

export function Footer() {
  return (
    <footer className="border-white/10 mx-auto w-full border-t px-2 mt-20">
      {/* Top Section — Logo + Description */}
      <div className="relative mx-auto grid max-w-7xl items-center justify-center gap-6 p-10 pb-0 md:flex">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center transition-all duration-300">
            <Image
              src="/logo-icon.png"
              alt="CineMatch AI Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.55)] group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.85)] group-hover:scale-105 transition-all duration-300"
            />
          </div>
          <div className="flex items-center">
            <span className="text-lg font-black tracking-[0.12em] bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 bg-clip-text text-transparent uppercase">
              Cine
            </span>
            <span className="text-lg font-light tracking-[0.08em] text-white/90 ml-1 uppercase">
              Match
            </span>
            <span className="ml-1.5 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 text-white tracking-wider">
              AI
            </span>
          </div>
        </Link>
        <p className="bg-transparent text-center text-xs leading-5 text-primary/60 md:text-left max-w-4xl">
          Welcome to <span className="text-white font-semibold">CineMatch AI</span>, where AI meets cinema to help you discover your
          next favorite film. We&apos;re passionate about connecting moviegoers
          with the perfect movies for every mood. Our AI-powered recommendation
          engine analyzes your preferences, mood, and viewing history to suggest
          films that resonate with you. From timeless classics to the latest
          blockbusters, <span className="text-white font-semibold">CineMatch AI</span> curates a personalized cinematic journey — no
          more endless scrolling, just great movies tailored to you.
        </p>
      </div>

      {/* Navigation Links Grid */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="border-b border-dotted border-white/10" />
        <div className="py-10">
          {navigation.categories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-3 flex-row justify-between gap-6 leading-6 md:flex"
            >
              {category.sections.map((section) => (
                <div key={section.name}>
                  <ul
                    role="list"
                    aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                    className="flex flex-col space-y-2"
                  >
                    {section.items.map((item) => (
                      <li key={item.name} className="flow-root">
                        <Link
                          href={item.href}
                          className="text-sm text-slate-600 hover:text-black dark:text-slate-400 hover:dark:text-white md:text-xs"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-b border-dotted border-white/10" />
      </div>

      {/* Social Links + Theme Toggle */}
      <div className="flex flex-wrap justify-center gap-y-6">
        <div className="flex flex-wrap items-center justify-center gap-6 gap-y-4 px-6">
          <Link
            aria-label="Email"
            href="mailto:contact@cinewatch.ai"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Mail strokeWidth={1.5} className="h-5 w-5" />
          </Link>
          <Link
            aria-label="X (Twitter)"
            href="https://x.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.X className="h-5 w-5" />
          </Link>
          <Link
            aria-label="Instagram"
            href="https://instagram.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Instagram className="h-5 w-5" />
          </Link>
          <Link
            aria-label="Facebook"
            href="https://facebook.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Facebook className="h-5 w-5" />
          </Link>
          <Link
            aria-label="LinkedIn"
            href="https://linkedin.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.LinkedIn className="h-5 w-5" />
          </Link>
          <Link
            aria-label="YouTube"
            href="https://youtube.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.YouTube className="h-5 w-5" />
          </Link>
        </div>
        <ThemeToggle />
      </div>

      {/* Copyright */}
      <div className="mx-auto mb-10 mt-10 flex flex-col justify-between text-center text-xs md:max-w-7xl">
        <div className="flex flex-row items-center justify-center gap-1 text-slate-600 dark:text-slate-400">
          <span>©</span>
          <span>{new Date().getFullYear()}</span>
          <span>Made with</span>
          <DIcons.Heart className="text-red-600 mx-1 h-4 w-4 animate-pulse" />
          <span>by</span>
          <span className="cursor-pointer text-black dark:text-white hover:text-cine-blue dark:hover:text-cine-blue">
            <Link aria-label="CineMatch AI" className="font-bold" href="/">
              CineMatch AI
            </Link>
          </span>
          <span>—</span>
          <span className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-cine-amber dark:hover:text-cine-amber">
            <Link aria-label="AI Movies" href="#recommendations">
              AI-Powered Movies
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
