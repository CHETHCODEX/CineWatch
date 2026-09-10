import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface MovieItem {
  rank: number;
  movieId: number;
  title: string;
  year: number;
  genres: string[];
  director: string;
  cast: string[];
  predictedRating: number;
  matchPercentage: number;
  posterPath: string;
  explanation: {
    text: string;
    tags: string[];
    peerAgreementPct: number;
    collabScore: number;
    contentScore: number;
    hybridScore: number;
  };
  overview?: string;
  runtime?: number;
  voteAverage?: number;
  tagline?: string;
  trailerKey?: string;
  tmdbId?: number;
}

const ARCHETYPES = [
  {
    persona: 'Sci-Fi & Cyberpunk Visionary',
    dominant: ['Sci-Fi', 'Thriller', 'Mystery'],
    description: 'Tech-forward subscriber with strong preference for high-concept sci-fi, mind-bending thrillers, and futuristic worldbuilding.',
    strategy: 'High Engagement. Target with upcoming hard sci-fi premieres, creator interviews, and personalized premiere push notifications.',
  },
  {
    persona: 'Neo-Noir & Crime Cinema Critic',
    dominant: ['Crime', 'Drama', 'Mystery'],
    description: 'Analytical cinephile focusing on gritty underworld narratives, investigative procedurals, and complex character studies.',
    strategy: 'Active Retention. Surface prestige European crime series, festival award winners, and director filmography deep-dives.',
  },
  {
    persona: 'High-Octane Action & Espionage Fan',
    dominant: ['Action', 'Adventure', 'Thriller'],
    description: 'Enthusiastic blockbuster viewer hooked on global espionage franchises, tactical action, and adrenaline-pumping stunts.',
    strategy: 'Sustain Momentum. Queue seasonal action franchises, franchise marathons, and high-bitrate HDR remastered classics.',
  },
  {
    persona: 'Indie Drama & Romance Connoisseur',
    dominant: ['Drama', 'Romance', 'Comedy'],
    description: 'Nuanced viewer prioritizing emotional resonance, character-driven storytelling, and festival-circuit romances.',
    strategy: 'Loyalty Nurturing. Highlight curated indie festival collections, staff picks, and atmospheric weekend spotlight showcases.',
  },
  {
    persona: 'Adventure & Fantasy Explorer',
    dominant: ['Adventure', 'Fantasy', 'Action'],
    description: 'Immersive worldbuilding lover drawn to epic journeys, mythical quests, and visually stunning spectacles.',
    strategy: 'Cross-Catalog Discovery. Introduce fantasy anime crossovers, behind-the-scenes visual effects reels, and high-fantasy sagas.',
  },
  {
    persona: 'Dark Comedy & Cult Classic Specialist',
    dominant: ['Comedy', 'Crime', 'Drama'],
    description: 'Eclectic streamer drawn to biting satire, dry humor, unconventional cult favorites, and midnight cinema.',
    strategy: 'Re-engagement Loop. Highlight hidden comedy gems, unrated director cuts, and interactive trivia watchlist campaigns.',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUserId = searchParams.get('userId') || '42';
    const requestedUserId = rawUserId.trim();

    const cachePath = path.join(process.cwd(), 'hackathon', 'cache', 'demo_data.json');

    if (!fs.existsSync(cachePath)) {
      return NextResponse.json(
        { error: 'Demo cache file not found. Please run python hackathon/train.py first.' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(cachePath, 'utf-8');
    const demoData = JSON.parse(fileContent);

    const availablePersonas = Object.keys(demoData.personas).map((id) => ({
      userId: Number(id),
      persona: demoData.personas[id].user.persona,
      cohort: demoData.personas[id].user.engagement.cohort,
      score: demoData.personas[id].user.engagement.score,
    }));

    // 1. Check if user is already in demoData cache (e.g. 1, 15, 23, 34, 42, 84, 99)
    if (demoData.personas[requestedUserId]) {
      const selectedPersonaData = demoData.personas[requestedUserId];
      return NextResponse.json({
        success: true,
        requestedUserId: Number(requestedUserId),
        isFallback: false,
        isCustom: false,
        metadata: demoData.metadata,
        availablePersonas,
        user: selectedPersonaData.user,
        watchlist: selectedPersonaData.watchlist,
      });
    }

    // 2. Dynamic generation for ANY Custom User ID (pure TypeScript, zero-dependency, works on Vercel serverless)
    const numId = parseInt(requestedUserId, 10);
    if (!isNaN(numId) && numId > 0) {
      // Gather all catalog movies from all precomputed personas (63 unique curated titles)
      const catalogMoviesMap = new Map<number, MovieItem>();
      for (const p of Object.values(demoData.personas) as any[]) {
        for (const item of p.watchlist) {
          if (!catalogMoviesMap.has(item.movieId)) {
            catalogMoviesMap.set(item.movieId, item);
          }
        }
      }
      const allCatalogMovies = Array.from(catalogMoviesMap.values());

      // Select archetype based on user ID
      const archIdx = numId % ARCHETYPES.length;
      const archetype = ARCHETYPES[archIdx];

      // Deterministic engagement calculations
      const engScore = 40 + ((numId * 17) % 52); // 40 - 91
      const cohort =
        engScore >= 80
          ? 'Power Viewer'
          : engScore >= 65
          ? 'Core Active'
          : engScore >= 50
          ? 'Casual Viewer'
          : 'At-Risk Subscriber';

      const churnRisk =
        cohort === 'Power Viewer'
          ? 'Low (8%)'
          : cohort === 'Core Active'
          ? 'Low (19%)'
          : cohort === 'Casual Viewer'
          ? 'Moderate (38%)'
          : 'Elevated (64%)';

      const totalRatings = 15 + ((numId * 7) % 140);
      const meanRating = Number((3.2 + ((numId * 11) % 16) / 10).toFixed(2));
      const genreDiversityPct = 35 + ((numId * 9) % 45);

      const customUser = {
        userId: numId,
        persona: `User #${numId} (${archetype.persona})`,
        description: archetype.description,
        engagement: {
          score: engScore,
          cohort,
          churnRisk,
          totalRatings,
          meanRating,
          ratingStdDev: 1.15,
          genresExplored: Math.max(4, Math.floor(genreDiversityPct / 8)),
          genreDiversityPct,
          retentionStrategy: archetype.strategy,
        },
      };

      // Score and rank catalog movies based on archetype genre affinity
      const scoredMovies = allCatalogMovies.map((movie) => {
        let genreOverlap = 0;
        for (const g of movie.genres || []) {
          if (archetype.dominant.includes(g)) {
            genreOverlap += 1;
          }
        }
        // Deterministic pseudorandom factor per user+movie
        const pseudoRand = ((movie.movieId * 31 + numId * 17) % 100) / 100;
        const totalScore = genreOverlap * 2.5 + pseudoRand;
        return { movie, totalScore };
      });

      // Sort descending by score
      scoredMovies.sort((a, b) => b.totalScore - a.totalScore);

      // Take top 12 distinct movies
      const customWatchlist: MovieItem[] = scoredMovies.slice(0, 12).map((item, idx) => {
        const m = item.movie;
        const rank = idx + 1;
        const matchPct = Math.max(72, 97 - idx * 2);
        const predRating = Number((4.92 - idx * 0.07).toFixed(2));
        const peerPct = Math.max(70, 96 - idx * 2);
        const topGenre = m.genres?.[0] || 'Drama';

        return {
          ...m,
          rank,
          predictedRating: predRating,
          matchPercentage: matchPct,
          explanation: {
            text: `Curated for User #${numId}: Strong affinity with ${topGenre} aligned with ${peerPct}% latent peer consensus.`,
            tags: [
              `${topGenre} Affinity`,
              `Latent Match #${rank}`,
              `${peerPct}% Peer Match`,
            ],
            peerAgreementPct: peerPct,
            collabScore: Number((0.72 + (idx % 4) * 0.06).toFixed(3)),
            contentScore: Number((0.85 - idx * 0.02).toFixed(3)),
            hybridScore: Number((0.80 - idx * 0.02).toFixed(3)),
          },
        };
      });

      // Append to available personas so the UI pill renders it immediately
      availablePersonas.push({
        userId: numId,
        persona: customUser.persona,
        cohort: customUser.engagement.cohort,
        score: customUser.engagement.score,
      });

      return NextResponse.json({
        success: true,
        requestedUserId: numId,
        isFallback: false,
        isCustom: true,
        metadata: demoData.metadata,
        availablePersonas,
        user: customUser,
        watchlist: customWatchlist,
      });
    }

    // 3. Fallback to default persona (42)
    const fallbackData = demoData.personas['42'];
    return NextResponse.json({
      success: true,
      requestedUserId: Number(requestedUserId),
      isFallback: true,
      isCustom: false,
      metadata: demoData.metadata,
      availablePersonas,
      user: fallbackData.user,
      watchlist: fallbackData.watchlist,
    });
  } catch (error: any) {
    console.error('Error serving hackathon recommendation data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
