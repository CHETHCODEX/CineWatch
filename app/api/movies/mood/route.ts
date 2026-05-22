// =============================================================================
// GET /api/movies/mood?mood=funny&page=1 — Movies matching a mood
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getMoviesByMood } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const mood = searchParams.get("mood") || "thrilled";
    const page = parseInt(searchParams.get("page") || "1", 10);

    const data = await getMoviesByMood(mood, page);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/movies/mood]", error);
    return NextResponse.json(
      { error: "Failed to fetch movies by mood" },
      { status: 500 }
    );
  }
}
