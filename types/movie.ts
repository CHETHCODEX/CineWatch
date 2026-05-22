// =============================================================================
// CineMatch — Shared TypeScript Interfaces
// Shaped to match TMDB API response schemas for future integration.
// =============================================================================

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  runtime?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string; // YouTube video key
  name: string;
  site: string; // e.g., "YouTube"
  type: string; // e.g., "Trailer", "Teaser", "Featurette"
}

export interface MovieDetail extends Movie {
  genres: Genre[];
  runtime: number; // in minutes
  tagline: string | null;
  credits: {
    cast: CastMember[];
  };
  videos: {
    results: Video[];
  };
}

// =============================================================================
// TMDB Image URL helpers
// =============================================================================

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export type TMDBPosterSize = "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original";
export type TMDBBackdropSize = "w300" | "w780" | "w1280" | "original";
export type TMDBProfileSize = "w45" | "w185" | "h632" | "original";

export function getPosterUrl(path: string | null, size: TMDBPosterSize = "w500"): string {
  if (!path) return "/placeholder-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: TMDBBackdropSize = "w1280"): string {
  if (!path) return "/placeholder-backdrop.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getProfileUrl(path: string | null, size: TMDBProfileSize = "w185"): string {
  if (!path) return "/placeholder-profile.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// =============================================================================
// Mock Data — Genres (matches TMDB genre IDs)
// =============================================================================

export const MOCK_GENRES: Genre[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
];

// =============================================================================
// Mock Data — Movies (realistic data shaped to TMDB responses)
// =============================================================================

export const MOCK_MOVIES: Movie[] = [
  {
    id: 27205,
    title: "Inception",
    overview:
      "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
    poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    release_date: "2010-07-15",
    vote_average: 8.4,
    genre_ids: [28, 878, 12],
  },
  {
    id: 155,
    title: "The Dark Knight",
    overview:
      "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg",
    release_date: "2008-07-16",
    vote_average: 8.5,
    genre_ids: [18, 28, 80, 53],
  },
  {
    id: 550,
    title: "Fight Club",
    overview:
      'A ticking-Loss time bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town.',
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop_path: "/hZkgoQYus5dXo3H8T7CYV25rJp.jpg",
    release_date: "1999-10-15",
    vote_average: 8.4,
    genre_ids: [18, 53],
  },
  {
    id: 680,
    title: "Pulp Fiction",
    overview:
      "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    release_date: "1994-09-10",
    vote_average: 8.5,
    genre_ids: [53, 80],
  },
  {
    id: 238,
    title: "The Godfather",
    overview:
      "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael, joins the family business.",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
    release_date: "1972-03-14",
    vote_average: 8.7,
    genre_ids: [18, 80],
  },
  {
    id: 157336,
    title: "Interstellar",
    overview:
      "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "/xJHokMbljXjADYdit5fK1B4Q2Nk.jpg",
    release_date: "2014-11-05",
    vote_average: 8.4,
    genre_ids: [12, 18, 878],
  },
  {
    id: 278,
    title: "The Shawshank Redemption",
    overview:
      "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.",
    poster_path: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
    backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    release_date: "1994-09-23",
    vote_average: 8.7,
    genre_ids: [18, 80],
  },
  {
    id: 424,
    title: "Schindler's List",
    overview:
      "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory during World War II.",
    poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
    backdrop_path: "/loRmRzQXZR0Z1DF0VGOsVkBaNdm.jpg",
    release_date: "1993-12-15",
    vote_average: 8.6,
    genre_ids: [18, 36, 10752],
  },
  {
    id: 13,
    title: "Forrest Gump",
    overview:
      "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do.",
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdrop_path: "/7c9UVPPiTPltouxRVY6N9uugaVA.jpg",
    release_date: "1994-06-23",
    vote_average: 8.5,
    genre_ids: [35, 18, 10749],
  },
  {
    id: 569094,
    title: "Spider-Man: Across the Spider-Verse",
    overview:
      "After reuniting with Gwen Stacy, Brooklyn's full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society.",
    poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop_path: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    release_date: "2023-05-31",
    vote_average: 8.4,
    genre_ids: [16, 28, 12],
  },
  {
    id: 299536,
    title: "Avengers: Infinity War",
    overview:
      "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.",
    poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    backdrop_path: "/lmZFxXgJE3vgrciwuDib0N8CfQo.jpg",
    release_date: "2018-04-25",
    vote_average: 8.3,
    genre_ids: [12, 28, 878],
  },
  {
    id: 76341,
    title: "Mad Max: Fury Road",
    overview:
      "An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken, and almost everyone is crazed fighting for the necessities of life.",
    poster_path: "/hA2ple9q4qnwxp3hKVNhroipsir.jpg",
    backdrop_path: "/phszHPFVhPHhMZgo0fWTKBDQsJA.jpg",
    release_date: "2015-05-13",
    vote_average: 7.6,
    genre_ids: [28, 12, 878],
  },
];
