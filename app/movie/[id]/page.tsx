// =============================================================================
// CineWatch AI — Movie Detail Page (Server Component)
// Route: /movie/[id]
// =============================================================================

import { cache } from "react";
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMovieDetails, getSimilarMovies } from "@/lib/tmdb";
import { MOCK_MOVIE_DETAILS, MOCK_WATCH_PROVIDERS } from "@/types/movie-details";
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
    // 1. Fallback to mock data
    const mock = MOCK_MOVIE_DETAILS[id];
    if (mock) {
      const similar = MOCK_MOVIES.filter((m) => m.id !== id).slice(0, 6);
      return {
        movie: {
          ...mock,
          watch_providers: mock.watch_providers || MOCK_WATCH_PROVIDERS,
        },
        similar,
      };
    }

    // 2. Resilient fallback for hackathon cache (for offline / ISP timeouts)
    try {
      const cachePath = path.join(process.cwd(), "hackathon", "cache", "demo_data.json");
      if (fs.existsSync(cachePath)) {
        const demoData = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
        for (const pid of Object.keys(demoData.personas)) {
          const item = demoData.personas[pid].watchlist?.find(
            (m: any) => m.tmdbId === id || m.movieId === id
          );
          if (item) {
            const fallbackDetail: MovieDetail = {
              id: item.tmdbId || item.movieId,
              title: item.title,
              overview: item.overview || "Curated recommendation synthesized through neural collaborative filtering and semantic metadata affinity.",
              poster_path: item.posterPath,
              backdrop_path: item.posterPath,
              release_date: `${item.year || 2020}-01-01`,
              vote_average: item.voteAverage ?? (item.predictedRating ? Number((item.predictedRating * 2).toFixed(1)) : 8.2),
              genre_ids: [28, 12],
              genres: (item.genres || ["Drama"]).map((g: string, i: number) => ({ id: i + 1, name: g })),
              runtime: item.runtime || 120,
              tagline: item.tagline || null,
              credits: {
                cast: (item.cast?.[0] ? item.cast[0].split(/[,•|]/) : ["Lead Actor", "Supporting Actor"]).slice(0, 8).map((name: string, i: number) => ({
                  id: i + 1,
                  name: name.trim(),
                  character: i === 0 ? "Lead Character" : "Supporting Role",
                  profile_path: null,
                })),
              },
              videos: {
                results: [
                  {
                    id: `trailer-${item.movieId}`,
                    key: item.trailerKey || "KR_9A-cUEJc",
                    name: `${item.title} Official Trailer`,
                    site: "YouTube",
                    type: "Trailer",
                  },
                ],
              },
              watch_providers: MOCK_WATCH_PROVIDERS,
            };
            const similar = MOCK_MOVIES.filter((m) => m.id !== id).slice(0, 6);
            return { movie: fallbackDetail, similar };
          }
        }
      }
    } catch {
      // ignore
    }

    return null;
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const movieId = Number(id);

  if (isNaN(movieId)) notFound();

  const data = await getMovie(movieId);
  if (!data) notFound();

  const sp = searchParams ? await searchParams : {};
  const whyPicked = typeof sp.whyPicked === "string" ? sp.whyPicked : undefined;
  const tags = typeof sp.tags === "string" ? sp.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined;
  const peerAgreementPct = typeof sp.peerAgreement === "string" ? Number(sp.peerAgreement) : undefined;
  const collabScore = typeof sp.collabScore === "string" ? Number(sp.collabScore) : undefined;
  const contentScore = typeof sp.contentScore === "string" ? Number(sp.contentScore) : undefined;
  const hybridScore = typeof sp.hybridScore === "string" ? Number(sp.hybridScore) : undefined;

  const explanation = whyPicked
    ? {
        text: whyPicked,
        tags: tags || [],
        peerAgreementPct: !isNaN(peerAgreementPct ?? NaN) ? peerAgreementPct! : 88,
        collabScore: !isNaN(collabScore ?? NaN) ? collabScore! : 0.78,
        contentScore: !isNaN(contentScore ?? NaN) ? contentScore! : 0.65,
        hybridScore: !isNaN(hybridScore ?? NaN) ? hybridScore! : 0.74,
      }
    : undefined;

  return (
    <MovieDetailClient
      movie={data.movie}
      similar={data.similar}
      explanation={explanation}
      backLabel={explanation ? "Back to AI Match" : "Back"}
      backUrl={explanation ? "/hackathon" : "/"}
    />
  );
}
