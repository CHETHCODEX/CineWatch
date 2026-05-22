// =============================================================================
// CineWatch AI — Movie Detail Page (Server Component)
// Route: /movie/[id]
// =============================================================================

import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMovieDetails, getSimilarMovies } from "@/lib/tmdb";
import { MOCK_MOVIE_DETAILS } from "@/types/movie-details";
import { MOCK_MOVIES } from "@/types/movie";
import type { MovieDetail, Movie } from "@/types/movie";
import MovieDetailClient from "@/components/movie/movie-detail-client";

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

const getMovie = cache(async (id: number): Promise<{ movie: MovieDetail; similar: Movie[] } | null> => {
  try {
    const [detail, similarRes] = await Promise.all([
      getMovieDetails(id),
      getSimilarMovies(id),
    ]);
    return { movie: detail, similar: similarRes.results.slice(0, 8) };
  } catch {
    // Fallback to mock data
    const mock = MOCK_MOVIE_DETAILS[id];
    if (!mock) return null;
    const similar = MOCK_MOVIES.filter((m) => m.id !== id).slice(0, 6);
    return { movie: mock, similar };
  }
});

// ---------------------------------------------------------------------------
// Dynamic metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getMovie(Number(id));

  if (!data) {
    return { title: "Movie Not Found — CineWatch AI" };
  }

  return {
    title: `${data.movie.title} — CineWatch AI`,
    description: data.movie.overview.slice(0, 160),
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = Number(id);

  if (isNaN(movieId)) notFound();

  const data = await getMovie(movieId);
  if (!data) notFound();

  return <MovieDetailClient movie={data.movie} similar={data.similar} />;
}
