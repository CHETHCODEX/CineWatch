// =============================================================================
// GET /api/movies/mood?mood=funny&page=1 — Movies matching a mood (AI-powered)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getMoviesByMood } from "@/lib/tmdb";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:8000/search";

// Maps standard mood keys to rich natural-language prompts for vector search
const MOOD_PROMPTS: Record<string, string> = {
  funny: "light-hearted comedy movie with hilarious jokes and feel-good happy laughs",
  emotional: "emotional drama movie that hits in the feels, very touching, and makes you cry",
  thrilled: "action thriller suspense movie with high stakes, edge of your seat suspense, and intense mystery",
  "mind-blown": "mind-bending sci-fi mystery movie that is highly complex, deep, and makes you think for days",
  romantic: "heartwarming romantic love story movie with sweet moments, dating, and relationship butterflies",
  adventurous: "epic fantasy adventure journey movie with non-stop action, quests, and gorgeous landscapes",
};

// Maps moods to specific TMDB genre list intersections to enforce strict matching boundaries
const MOOD_GENRES: Record<string, number[]> = {
  funny: [35],                  // Comedy
  emotional: [18],              // Drama
  thrilled: [53, 28, 27],       // Thriller, Action, Horror
  "mind-blown": [878, 9648, 14], // Sci-Fi, Mystery, Fantasy
  romantic: [10749, 18],        // Romance, Drama
  adventurous: [12, 14, 28],    // Adventure, Fantasy, Action
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mood = searchParams.get("mood") || "thrilled";
  const normalizedMood = mood.toLowerCase().trim();

  try {
    // 1. Attempt to query our Python FastAPI microservice for AI Semantic Mood Matching
    if (MOOD_PROMPTS[normalizedMood]) {
      const prompt = MOOD_PROMPTS[normalizedMood];
      const genres = MOOD_GENRES[normalizedMood] || [];
      const genresParam = genres.length > 0 ? `&genres=${genres.join(",")}` : "";

      try {
        const pythonRes = await fetch(
          `${PYTHON_BACKEND_URL}?query=${encodeURIComponent(prompt)}${genresParam}`,
          {
            method: "GET",
            signal: AbortSignal.timeout(3000), // 3-second timeout limit
          }
        );

        if (pythonRes.ok) {
          const data = await pythonRes.json();
          if (data && data.results) {
            console.log(`[AI Mood Engine] Dynamic semantic matches found for mood: "${normalizedMood}"`);
            return NextResponse.json({
              results: data.results,
              source: "ai_mood",
            });
          }
        }
      } catch (pythonErr) {
        console.warn(
          `[AI Mood Engine Fallback] Python microservice is offline or failed (${(pythonErr as Error).message}). Falling back to TMDB genres.`
        );
      }
    }

    // 2. Standard TMDB Genre Fallback
    const page = parseInt(searchParams.get("page") || "1", 10);
    const data = await getMoviesByMood(normalizedMood, page);
    return NextResponse.json({
      results: data.results,
      source: "tmdb_fallback",
    });

  } catch (error) {
    console.error("[/api/movies/mood] Route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies by mood" },
      { status: 500 }
    );
  }
}

