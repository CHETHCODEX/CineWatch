// =============================================================================
// GET /api/movies/trending — Returns trending movies this week
// =============================================================================

import { NextResponse } from "next/server";
import { getTrending } from "@/lib/tmdb";

export async function GET() {
  try {
    const data = await getTrending();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/movies/trending]", error);
    return NextResponse.json(
      { error: "Failed to fetch trending movies" },
      { status: 500 }
    );
  }
}
