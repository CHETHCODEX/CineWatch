"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Film,
  Bookmark,
  User,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  Compass,
  LogOut,
  ChevronDown,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { SearchOverlay } from "@/components/sections/search-overlay";
import { useAuth } from "@/components/providers/auth-provider";
import { AuthModal } from "@/components/ui/auth-modal";

// =============================================================================
// Navigation Links
// =============================================================================

const NAV_LINKS = [
  { label: "Discover", href: "#discover", icon: Compass },
  { label: "Trending", href: "#trending", icon: TrendingUp },
  { label: "For You", href: "#recommendations", icon: Sparkles },
  { label: "Watchlist", href: "#watchlist", icon: Bookmark },
] as const;

// =============================================================================
// Navbar Component
// =============================================================================

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Authentication Context States
  const { user, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close profile dropdown on any outside click
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClose = () => setIsDropdownOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [isDropdownOpen]);

  // Listen for global keyboard shortcuts (CMD+K or Ctrl+K) to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track scroll position to toggle the blur background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll(); // check on mount
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_30px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ---- Logo ---- */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-500 overflow-hidden">
            {/* Pulsing gradient background layers */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-purple-500/5 to-transparent opacity-100 group-hover:opacity-80 transition-opacity duration-500" />
            
            {/* Spinning accent border */}
            <div className="absolute inset-0 rounded-xl border border-transparent bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600 opacity-20 group-hover:opacity-60 transition-opacity duration-500 [mask-image:linear-gradient(white,transparent)] group-hover:animate-[spin_4s_linear_infinite]" />
            
            {/* Glowing neon shutter effect lines */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="relative h-6 w-6">
                {/* Custom glowing shutter paths using absolute layout */}
                <span className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-cyan-400 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform duration-300" />
                <span className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-cyan-400 group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-transform duration-300" />
                <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-purple-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-purple-500 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                
                {/* Central lens aperture ring */}
                <div className="absolute inset-1.5 rounded-full border border-white/40 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)]" />
                </div>
              </div>
            </div>
            
            {/* Blurred glow backing */}
            <div className="absolute inset-0 rounded-xl bg-cyan-500/10 blur-md group-hover:bg-purple-500/20 transition-colors duration-500" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="text-lg font-black tracking-[0.12em] bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 bg-clip-text text-transparent group-hover:brightness-110 transition-all duration-300 uppercase">
              Cine
            </span>
            <span className="text-lg font-light tracking-[0.08em] text-white/90 sm:ml-1 group-hover:text-white transition-colors duration-300 uppercase">
              Watch
            </span>
            <span className="mt-0.5 sm:mt-0 sm:ml-2 self-start sm:self-center text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)] tracking-wider scale-90 sm:scale-100 origin-left">
              AI
            </span>
          </div>
        </Link>


        {/* ---- Desktop Navigation ---- */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link, i) => (
            <motion.div
              key={link.label}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.1 + i * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={link.href}
                className="group relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-cine-blue transition-colors duration-200" />
                {link.label}
                {/* hover underline indicator */}
                <span className="absolute bottom-0.5 left-3.5 right-3.5 h-px scale-x-0 rounded-full bg-cine-blue transition-transform duration-300 origin-left group-hover:scale-x-100" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ---- Right-side Actions ---- */}
        <div className="flex items-center gap-1.5">
          {/* Search trigger */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-cine-surface transition-all duration-200"
              aria-label="Search movies"
            >
              <Search className="h-[18px] w-[18px]" />
            </Button>
          </motion.div>

          {/* User avatar / profile dropdown (Desktop) */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="hidden sm:block"
          >
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="flex items-center gap-2 h-9 px-3 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all cursor-pointer select-none"
                >
                  <img
                    src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`}
                    alt="User Avatar"
                    className="w-5 h-5 rounded bg-zinc-800 border border-white/[0.08]"
                  />
                  <span className="text-xs font-semibold text-zinc-300 max-w-[80px] truncate hidden md:block">
                    {user.user_metadata?.username || "Account"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl bg-zinc-950/95 border border-white/[0.08] backdrop-blur-3xl p-1.5 shadow-2xl z-50 text-sm"
                    >
                      <div className="px-3 py-2 border-b border-white/[0.06] text-xs">
                        <p className="font-bold text-zinc-400">Signed in as</p>
                        <p className="text-zinc-200 truncate mt-0.5">{user.email}</p>
                      </div>
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAuthOpen(true)}
                className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-cine-surface transition-all duration-200 cursor-pointer"
                aria-label="User login"
              >
                <User className="h-[18px] w-[18px]" />
              </Button>
            )}
          </motion.div>

          {/* ---- Mobile hamburger ---- */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-cine-surface transition-all duration-200 cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[300px] border-l border-white/[0.06] bg-black/95 backdrop-blur-2xl p-0"
              >
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-2">
                      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/15 via-transparent to-transparent" />
                        <div className="relative h-4.5 w-4.5">
                          <span className="absolute top-0 left-0 h-1.5 w-1.5 border-t border-l border-cyan-400" />
                          <span className="absolute top-0 right-0 h-1.5 w-1.5 border-t border-r border-cyan-400" />
                          <span className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-purple-500" />
                          <span className="absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r border-purple-500" />
                          <div className="absolute inset-1 rounded-full border border-white/30 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center">
                            <div className="h-1 w-1 rounded-full bg-white shadow-[0_0_4px_white]" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-black tracking-wider bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent uppercase">
                          Cine
                        </span>
                        <span className="text-sm font-light tracking-wide text-white/90 ml-0.5 uppercase">
                          Watch
                        </span>
                        <span className="ml-1.5 text-[8px] uppercase font-bold px-1 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white tracking-wider">
                          AI
                        </span>
                      </div>
                    </SheetTitle>
                  </div>
                </SheetHeader>

                <div className="flex flex-col px-4 py-6 gap-1">
                  {NAV_LINKS.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.05 + i * 0.06,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <SheetClose
                        render={
                          <Link
                            href={link.href}
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-cine-surface"
                          />
                        }
                      >
                        <link.icon className="h-5 w-5 text-cine-blue/77" />
                        {link.label}
                      </SheetClose>
                    </motion.div>
                  ))}

                  {/* Divider */}
                  <div className="my-4 h-px bg-white/[0.06]" />

                  {/* Search Mobile */}
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <SheetClose
                      render={
                        <button
                          onClick={() => setIsSearchOpen(true)}
                          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-cine-surface text-left cursor-pointer"
                        />
                      }
                    >
                      <Search className="h-5 w-5 text-cine-blue/70" />
                      Search
                    </SheetClose>
                  </motion.div>

                  {/* Auth Mobile Triggers */}
                  {user ? (
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-2 space-y-2 p-2 rounded-2xl border border-white/[0.05] bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-2 px-3 py-1">
                        <img 
                          src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`}
                          alt="Mobile Avatar"
                          className="w-5 h-5 rounded bg-zinc-800"
                        />
                        <span className="text-xs font-bold text-zinc-300">{user.user_metadata?.username || "Account"}</span>
                      </div>
                      <SheetClose
                        render={
                          <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 text-left cursor-pointer"
                          />
                        }
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </SheetClose>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <SheetClose
                        render={
                          <button
                            onClick={() => setIsAuthOpen(true)}
                            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-cine-blue hover:text-cine-blue/80 hover:bg-cine-surface text-left cursor-pointer"
                          />
                        }
                      >
                        <LogIn className="h-5 w-5 text-cine-blue" />
                        Sign In / Register
                      </SheetClose>
                    </motion.div>
                  )}
                </div>

                {/* Bottom branding */}
                <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-white/[0.06]">
                  <p className="text-xs text-muted-foreground/50 text-center">
                    Powered by AI · Made with ♥
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Search Overlay & Command Palette */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Glassmorphic Account Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </motion.header>
  );
}
