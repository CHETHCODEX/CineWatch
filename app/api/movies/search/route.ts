// =============================================================================
// GET /api/movies/search?q=inception&page=1 — Search movies
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);

    if (!query.trim()) {
      return NextResponse.json({ results: [], total_results: 0 });
    }

    const data = await searchMovies(query, page);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/movies/search]", error);
    return NextResponse.json(
      { error: "Failed to search movies" },
      { status: 500 }
    );
  }
}
