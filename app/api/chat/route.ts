import { NextResponse } from "next/server";
import { searchMovies, getTrending, discoverByGenres } from "@/lib/tmdb";
import type { Movie } from "@/types/movie";

// Map common words to TMDB Genre IDs for smart local parsing
const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  fantasy: 14,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  scifi: 878,
  science: 878,
  thriller: 53,
  war: 10752,
};

// Cohere dynamic rerank intelligence endpoint helper
async function cohereRerank(
  query: string,
  movies: Movie[],
  apiKey: string
): Promise<Movie[]> {
  try {
    const docs = movies.map((m, idx) => ({
      id: idx,
      text: `${m.title}: ${m.overview}`,
    }));

    const response = await fetch("https://api.cohere.ai/v1/rerank", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "rerank-english-v3.0",
        query,
        documents: docs,
        top_n: 3,
      }),
    });

    if (!response.ok) {
      console.warn("Cohere API Rerank failed, using local scoring fallback");
      return movies.slice(0, 3);
    }

    const result = await response.json();
    const rankedIndexes: number[] = result.results.map((r: any) => r.index);
    return rankedIndexes.map((idx) => movies[idx]).filter(Boolean);
  } catch (err) {
    console.error("Error during Cohere reranking:", err);
    return movies.slice(0, 3);
  }
}

// Gemini dynamic chatbot completion endpoint helper
async function geminiChat(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<string> {
  try {
    // Standard chat formatting for Gemini v1beta REST API
    const formattedHistory = history.map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    }));

    const contents = [
      ...formattedHistory,
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }],
      },
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      console.warn("Gemini API call failed, using mock chatbot fallback");
      return "";
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } catch (err) {
    console.error("Error during Gemini generation:", err);
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const { prompt, history = [] } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Query prompt is required" },
        { status: 400 }
      );
    }

    const cleanPrompt = prompt.toLowerCase();
    let candidates: Movie[] = [];

    // 1. Fetch Dynamic Movie Candidates from TMDB based on prompt context
    try {
      // Find matches for genres in the query string
      const matchedGenreIds: number[] = [];
      for (const [name, id] of Object.entries(GENRE_MAP)) {
        if (cleanPrompt.includes(name)) {
          matchedGenreIds.push(id);
        }
      }

      if (matchedGenreIds.length > 0) {
        // Query TMDB discover by genres
        const res = await discoverByGenres(matchedGenreIds);
        candidates = res.results || [];
      } else {
        // Otherwise search for query keywords
        const searchWord = prompt.split(" ").slice(0, 3).join(" ");
        const res = await searchMovies(searchWord);
        candidates = res.results || [];
      }

      // Fallback to trending movies if search was empty
      if (candidates.length === 0) {
        const res = await getTrending();
        candidates = res.results || [];
      }
    } catch (tmdbErr) {
      console.error("TMDB fetch failed, falling back to mock movie bank:", tmdbErr);
      // Clean fallback using static mock data
      candidates = [
        {
          id: 27205,
          title: "Inception",
          overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life.",
          poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
          backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
          release_date: "2010-07-15",
          vote_average: 8.4,
          genre_ids: [28, 878, 12]
        },
        {
          id: 155,
          title: "The Dark Knight",
          overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
          poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
          backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg",
          release_date: "2008-07-16",
          vote_average: 8.5,
          genre_ids: [18, 28, 80, 53]
        },
        {
          id: 157336,
          title: "Interstellar",
          overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",
          poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
          backdrop_path: "/xJHokMbljXjADYdit5fK1B4Q2Nk.jpg",
          release_date: "2014-11-05",
          vote_average: 8.4,
          genre_ids: [12, 18, 878]
        }
      ];
    }

    // Keep top candidates
    candidates = candidates.slice(0, 10);

    // 2. Cohere Reranking Pipeline
    let finalRecommendations: Movie[] = [];
    const cohereKey = process.env.COHERE_API_KEY;

    if (cohereKey && candidates.length > 0) {
      finalRecommendations = await cohereRerank(prompt, candidates, cohereKey);
    } else {
      // Local Score Matching fallback
      const scoredDocs = candidates.map((movie) => {
        let score = 0;
        const text = `${movie.title} ${movie.overview}`.toLowerCase();
        
        // Count keyword matches
        const queryTerms = cleanPrompt.split(" ");
        queryTerms.forEach((term) => {
          if (term.length > 2 && text.includes(term)) {
            score += 1;
          }
        });

        return { movie, score };
      });

      scoredDocs.sort((a, b) => b.score - a.score);
      finalRecommendations = scoredDocs.slice(0, 3).map((d) => d.movie);
    }

    // 3. Gemini Conversation Response Pipeline
    const geminiKey = process.env.GEMINI_API_KEY;
    let chatbotReply = "";

    const systemPrompt = `You are the CineMatch AI Assistant, a premium, exceptionally smart movie concierge. 
The user is asking for movie suggestions. Recommend these specific movies:
${finalRecommendations.map((m) => `- "${m.title}": ${m.overview}`).join("\n")}

Guidelines:
- Act extremely knowledgeable about movies, directors, and aesthetics.
- Speak in a warm, welcoming, and cinematic tone.
- Elaborate on why the recommended movies match their request perfectly.
- Make your response concise, engaging, and ready for a chat drawer interface.
- Never explain API structures, variables, or mention key availability. Keep it fully inside the cinematic magic!`;

    if (geminiKey) {
      chatbotReply = await geminiChat(systemPrompt, prompt, history, geminiKey);
    }

    // Fallback: Local Semantic Conversation Engine if Gemini key is missing
    if (!chatbotReply) {
      const titles = finalRecommendations.map((m) => `"${m.title}"`).join(", ");
      
      const responses = [
        `Outstanding request! Based on your mood, I highly recommend exploring ${titles}. These films have stellar reviews and represent top-tier filmmaking. Check them out directly in the cards below to save them straight to your CineMatch watchlist!`,
        `Excellent taste. I've curated a beautiful list matching your request: ${titles}. They offer deep thematic depth, brilliant visuals, and unmatched performances. What aspects of these films sound most appealing to you?`,
        `A superb exploration. You should dive into ${titles} tonight. They perfectly match your request and deliver a truly memorable cinematic experience. I have attached their movie files below so you can add them to your watchlist with a single click!`,
      ];

      chatbotReply = responses[Math.floor(Math.random() * responses.length)];
    }

    return NextResponse.json({
      reply: chatbotReply,
      movies: finalRecommendations,
    });
  } catch (error) {
    console.error("API Chat route encountered a fatal error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
