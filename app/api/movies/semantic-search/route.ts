import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

const PYTHON_BACKEND_URL = "http://127.0.0.1:8000/search";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") ?? "";

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    try {
      // 1. Attempt to query local Python vector search microservice
      const pythonRes = await fetch(
        `${PYTHON_BACKEND_URL}?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          signal: AbortSignal.timeout(3000), // 3-second timeout
        }
      );

      if (pythonRes.ok) {
        const data = await pythonRes.json();
        if (data && data.results) {
          console.log(`[AI Search] Semantic search succeeded for query: "${query}" (${data.results.length} matches)`);
          return NextResponse.json({ results: data.results, source: "ai" });
        }
      }
      
      // Throw error if response not ok to trigger standard fallback
      throw new Error(`Python API responded with status ${pythonRes.status}`);
      
    } catch (pythonErr) {
      // 2. Graceful fallback to TMDB keyword search if Python microservice is offline or loading
      console.warn(
        `[AI Search Fallback] Python semantic microservice is offline or failed (${(pythonErr as Error).message}). Falling back to TMDB keyword search.`
      );
      
      const tmdbRes = await searchMovies(query);
      return NextResponse.json({ 
        results: tmdbRes.results, 
        source: "tmdb_fallback",
        notice: "AI semantic microservice is offline. Using keyword search." 
      });
    }

  } catch (error) {
    console.error("Semantic search route error:", error);
    return NextResponse.json(
      { error: "Failed to process search query" },
      { status: 500 }
    );
  }
}
