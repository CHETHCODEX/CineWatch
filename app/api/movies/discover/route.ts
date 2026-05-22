// =============================================================================
// GET /api/movies/discover?genres=28,12&page=1 — Discover movies by genre
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { discoverByGenres } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const genreStr = searchParams.get("genres") || "28";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const genreIds = genreStr.split(",").map(Number).filter(Boolean);

    const data = await discoverByGenres(genreIds, page);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/movies/discover]", error);
    return NextResponse.json(
      { error: "Failed to discover movies" },
      { status: 500 }
    );
  }
}
