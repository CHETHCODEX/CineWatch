// =============================================================================
// CineWatch AI — TMDB API Client
// Server-side only. Never import this in client components.
// =============================================================================

import type { Movie, MovieDetail, Genre } from "@/types/movie";

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY ?? "";

// ---------------------------------------------------------------------------
// Generic fetcher
// ---------------------------------------------------------------------------

// Simple in-memory cache to guarantee fast (0ms) loads on repeated fetches
const fetchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache TTL

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const cacheKey = url.toString();
  const cached = fetchCache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.data as T;
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  fetchCache.set(cacheKey, { data, timestamp: now });
  return data as T;
}

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------

interface TMDBListResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/** Trending movies this week */
export async function getTrending(page = 1): Promise<TMDBListResponse<Movie>> {
  return tmdbFetch<TMDBListResponse<Movie>>("/trending/movie/week", {
    page: String(page),
  });
}

/** Popular movies */
export async function getPopular(page = 1): Promise<TMDBListResponse<Movie>> {
  return tmdbFetch<TMDBListResponse<Movie>>("/movie/popular", {
    page: String(page),
  });
}

/** Top rated movies */
export async function getTopRated(page = 1): Promise<TMDBListResponse<Movie>> {
  return tmdbFetch<TMDBListResponse<Movie>>("/movie/top_rated", {
    page: String(page),
  });
}

/** Now playing in theaters */
export async function getNowPlaying(page = 1): Promise<TMDBListResponse<Movie>> {
  return tmdbFetch<TMDBListResponse<Movie>>("/movie/now_playing", {
    page: String(page),
  });
}

/** Discover movies by genre IDs */
export async function discoverByGenres(
  genreIds: number[],
  page = 1,
  sortBy = "popularity.desc"
): Promise<TMDBListResponse<Movie>> {
  return tmdbFetch<TMDBListResponse<Movie>>("/discover/movie", {
    with_genres: genreIds.join(","),
    sort_by: sortBy,
    page: String(page),
    "vote_count.gte": "50",
  });
}

/** Search movies by query */
export async function searchMovies(
  query: string,
  page = 1
): Promise<TMDBListResponse<Movie>> {
  return tmdbFetch<TMDBListResponse<Movie>>("/search/movie", {
    query,
    page: String(page),
  });
}

/** Get full movie details (with credits + videos) */
export async function getMovieDetails(id: number): Promise<MovieDetail> {
  return tmdbFetch<MovieDetail>(`/movie/${id}`, {
    append_to_response: "credits,videos",
  });
}

/** Get the official genre list */
export async function getGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list");
  return data.genres;
}

/** Get similar movies */
export async function getSimilarMovies(
  id: number,
  page = 1
): Promise<TMDBListResponse<Movie>> {
  return tmdbFetch<TMDBListResponse<Movie>>(`/movie/${id}/similar`, {
    page: String(page),
  });
}

/** Get movies by a "mood" — maps moods to genre combinations */
export async function getMoviesByMood(mood: string, page = 1): Promise<TMDBListResponse<Movie>> {
  const moodGenreMap: Record<string, number[]> = {
    funny: [35],           // Comedy
    emotional: [18],       // Drama
    thrilled: [53, 28],    // Thriller + Action
    "mind-blown": [878, 9648], // Sci-Fi + Mystery
    romantic: [10749],     // Romance
    adventurous: [12, 14], // Adventure + Fantasy
  };

  const genreIds = moodGenreMap[mood.toLowerCase()] ?? [28]; // default to Action
  return discoverByGenres(genreIds, page);
}
