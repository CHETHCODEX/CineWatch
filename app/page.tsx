import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/ui/hero";
import { MoodSelector } from "@/components/sections/mood-selector";
import { DiscoverSection } from "@/components/sections/discover-section";
import { TrendingSection } from "@/components/sections/trending-section";
import { CoWatchSection } from "@/components/sections/co-watch-matcher";
import { WatchlistSection } from "@/components/sections/watchlist-section";
import { Footer } from "@/components/sections/footer";
import { getTrending, getTopRated, getNowPlaying } from "@/lib/tmdb";
import { getPosterUrl, MOCK_MOVIES, MOCK_GENRES } from "@/types/movie";
import type { Movie } from "@/types/movie";
import type { GalleryMovie } from "@/components/ui/circular-gallery";
import type { ExpandCardMovie } from "@/components/ui/expand-cards";

// =============================================================================
// Transform TMDB Movie → component-specific shapes
// =============================================================================

function toGalleryMovie(movie: Movie): GalleryMovie {
  const genreMap: Record<number, string> = {};
  MOCK_GENRES.forEach((g) => (genreMap[g.id] = g.name));
  const genre = movie.genre_ids.map((id) => genreMap[id]).filter(Boolean)[0] ?? "Movie";

  return {
    title: movie.title,
    year: movie.release_date?.slice(0, 4) ?? "",
    rating: Math.round(movie.vote_average * 10) / 10,
    genre,
    image: getPosterUrl(movie.poster_path, "w500"),
    overview: movie.overview?.slice(0, 120) + (movie.overview?.length > 120 ? "…" : ""),
  };
}

function toExpandCardMovie(movie: Movie): ExpandCardMovie {
  const genreMap: Record<number, string> = {};
  MOCK_GENRES.forEach((g) => (genreMap[g.id] = g.name));
  const genre = movie.genre_ids.map((id) => genreMap[id]).filter(Boolean)[0] ?? "Movie";

  return {
    id: movie.id,
    title: movie.title,
    year: movie.release_date?.slice(0, 4) ?? "",
    rating: Math.round(movie.vote_average * 10) / 10,
    genre,
    overview: movie.overview?.slice(0, 150) + (movie.overview?.length > 150 ? "…" : ""),
    image: getPosterUrl(movie.poster_path, "w780"),
  };
}

// =============================================================================
// Server-side data fetching with graceful fallback
// =============================================================================

async function fetchPageData() {
  try {
    const [trendingRes, topRatedRes, nowPlayingRes] = await Promise.allSettled([
      getTrending(),
      getTopRated(),
      getNowPlaying(),
    ]);

    const trending =
      trendingRes.status === "fulfilled" ? trendingRes.value.results.slice(0, 10) : [];
    const topRated =
      topRatedRes.status === "fulfilled" ? topRatedRes.value.results.slice(0, 9) : [];
    const nowPlaying =
      nowPlayingRes.status === "fulfilled" ? nowPlayingRes.value.results.slice(0, 8) : [];

    return { trending, topRated, nowPlaying, isLive: trending.length > 0 };
  } catch {
    // Graceful fallback to mock data if TMDB key is missing or API is down
    return { trending: [], topRated: [], nowPlaying: [], isLive: false };
  }
}

// =============================================================================
// Home Page (Server Component)
// =============================================================================

export default async function Home() {
  const { trending, topRated, isLive } = await fetchPageData();

  // Transform to component shapes — fall back to undefined (uses built-in defaults)
  const trendingGallery = isLive ? trending.map(toGalleryMovie) : undefined;
  const discoverCards = isLive ? topRated.map(toExpandCardMovie) : undefined;

  return (
    <>
      <Navbar />

      {/* Hero Section — dramatic cinematic hero with floating movie cards */}
      <Hero />

      {/* Mood-Based Recommendation Section */}
      <div id="recommendations">
        <MoodSelector />
      </div>

      {/* Discover / Browse Section with Expand Cards */}
      <DiscoverSection movies={discoverCards} />

      {/* Trending Now — 3D Circular Gallery */}
      <TrendingSection movies={trendingGallery} />

      {/* Co-Watch Matcher Game Section */}
      <CoWatchSection movies={topRated} />

      {/* User's saved movies */}
      <WatchlistSection />

      {/* Footer */}
      <Footer />
    </>
  );
}
