"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Movie } from "@/types/movie";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  watchlist: Movie[];
  toggleWatchlist: (movie: Movie) => Promise<void>;
  isInWatchlist: (movieId: number) => boolean;
  signOut: () => Promise<void>;
  clearWatchlist: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  // 1. Listen for Auth State Changes
  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCloudWatchlist(session.user.id);
      } else {
        fetchLocalWatchlist();
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      
      if (activeUser) {
        // If user logged in, perform an automatic sync from local storage
        await syncLocalStorageToCloud(activeUser.id);
        await fetchCloudWatchlist(activeUser.id);
      } else {
        fetchLocalWatchlist();
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Local Storage Watchlist Fallback
  const fetchLocalWatchlist = () => {
    try {
      let saved = localStorage.getItem("cinewatch-watchlist");
      if (!saved) {
        const legacySaved = localStorage.getItem("cinematch-watchlist");
        if (legacySaved) {
          saved = legacySaved;
          localStorage.setItem("cinewatch-watchlist", legacySaved);
          localStorage.removeItem("cinematch-watchlist");
        }
      }

      if (saved) {
        setWatchlist(JSON.parse(saved));
      } else {
        setWatchlist([]);
      }
    } catch (err) {
      console.error("Failed to read offline watchlist", err);
      setWatchlist([]);
    }
  };

  // 3. Supabase Cloud Watchlist Fetcher
  const fetchCloudWatchlist = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("watchlists")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const dbMovies: Movie[] = data.map((row: any) => ({
          id: row.movie_id,
          title: row.title,
          overview: row.overview || "",
          poster_path: row.poster_path,
          backdrop_path: row.backdrop_path,
          release_date: row.release_date || "",
          vote_average: row.vote_average || 0,
          genre_ids: row.genre_ids || [],
        }));
        setWatchlist(dbMovies);
      }
    } catch (err) {
      console.error("Failed to fetch cloud watchlist:", err);
    }
  };

  const syncLocalStorageToCloud = async (userId: string) => {
    try {
      const saved = localStorage.getItem("cinewatch-watchlist");
      if (!saved) return;

      const localMovies = JSON.parse(saved) as Movie[];
      if (localMovies.length === 0) return;

      console.log(`Syncing ${localMovies.length} offline movies to your cloud profile...`);

      // Upload local movies to Supabase watchlists table
      const upsertData = localMovies.map((movie) => ({
        user_id: userId,
        movie_id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genre_ids: movie.genre_ids,
      }));

      const { error } = await supabase
        .from("watchlists")
        .upsert(upsertData, { onConflict: "user_id,movie_id" });

      if (error) {
        console.error("Watchlist sync failed:", error);
      } else {
        // Clear local storage on successful sync to prevent double-loading
        localStorage.removeItem("cinewatch-watchlist");
        console.log("Watchlist synced successfully!");
      }
    } catch (err) {
      console.error("Error synchronizing watchlist:", err);
    }
  };

  // 5. Smart Watchlist Mutator (Offline / Online adaptive)
  const toggleWatchlist = async (movie: Movie) => {
    const isSaved = watchlist.some((m) => m.id === movie.id);

    if (user) {
      // Cloud database mode
      try {
        if (isSaved) {
          const { error } = await supabase
            .from("watchlists")
            .delete()
            .eq("user_id", user.id)
            .eq("movie_id", movie.id);

          if (error) throw error;
          setWatchlist((prev) => prev.filter((m) => m.id !== movie.id));
        } else {
          const { error } = await supabase
            .from("watchlists")
            .insert({
              user_id: user.id,
              movie_id: movie.id,
              title: movie.title,
              overview: movie.overview,
              poster_path: movie.poster_path,
              backdrop_path: movie.backdrop_path,
              release_date: movie.release_date,
              vote_average: movie.vote_average,
              genre_ids: movie.genre_ids,
            });

          if (error) throw error;
          setWatchlist((prev) => [movie, ...prev]);
        }
      } catch (err: any) {
        console.error("Failed to toggle cloud database watchlist:", err);
        const errMsg = err.message || JSON.stringify(err);
        if (errMsg.includes("row-level security") || errMsg.includes("RLS") || errMsg.includes("policy")) {
          alert(
            "CineWatch AI Watchlist Security Alert\n\n" +
            "It looks like your action was blocked by the database security policy.\n\n" +
            "If you recently created a new account, please check your inbox (and spam/promotions folder) " +
            "for the email titled 'Confirm your email address' and click the confirmation link to activate your account's cloud database write access!\n\n" +
            "Once confirmed, you will be able to add movies to your watchlist successfully."
          );
        } else {
          alert(`CineWatch AI Watchlist Error: ${errMsg}`);
        }
      }
    } else {
      // Local storage mode
      try {
        const saved = localStorage.getItem("cinewatch-watchlist");
        let list: Movie[] = saved ? JSON.parse(saved) : [];

        if (isSaved) {
          list = list.filter((m) => m.id !== movie.id);
        } else {
          list = [movie, ...list];
        }

        localStorage.setItem("cinewatch-watchlist", JSON.stringify(list));
        setWatchlist(list);
      } catch (err) {
        console.error("Failed to toggle offline local storage watchlist:", err);
      }
    }

    // Proactively dispatch window event to sync other widgets on homepage
    window.dispatchEvent(new Event("cinewatch-watchlist-change"));
  };

  const isInWatchlist = (movieId: number) => {
    return watchlist.some((m) => m.id === movieId);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setWatchlist([]);
  };

  const clearWatchlist = async () => {
    if (user) {
      try {
        const { error } = await supabase
          .from("watchlists")
          .delete()
          .eq("user_id", user.id);

        if (error) throw error;
        setWatchlist([]);
      } catch (err) {
        console.error("Failed to clear cloud database watchlist:", err);
      }
    } else {
      try {
        localStorage.removeItem("cinewatch-watchlist");
        setWatchlist([]);
      } catch (err) {
        console.error("Failed to clear offline watchlist:", err);
      }
    }
    // Proactively dispatch window event to sync other widgets on homepage
    window.dispatchEvent(new Event("cinewatch-watchlist-change"));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        signOut,
        clearWatchlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
