// =============================================================================
// CineWatch AI — Mock MovieDetail Data
// Rich detail data shaped to TMDB API responses for future integration.
// =============================================================================

import type { MovieDetail } from "./movie";

export const MOCK_MOVIE_DETAILS: Record<number, MovieDetail> = {
  27205: {
    id: 27205,
    title: "Inception",
    overview:
      'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    release_date: "2010-07-15",
    vote_average: 8.4,
    genre_ids: [28, 878, 12],
    runtime: 148,
    tagline: "Your mind is the scene of the crime.",
    genres: [
      { id: 28, name: "Action" },
      { id: 878, name: "Science Fiction" },
      { id: 12, name: "Adventure" },
    ],
    credits: {
      cast: [
        { id: 6193, name: "Leonardo DiCaprio", character: "Dom Cobb", profile_path: "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg" },
        { id: 24045, name: "Joseph Gordon-Levitt", character: "Arthur", profile_path: "/zSuJ5nHqhBSbE5r3WDDqNBJIZLU.jpg" },
        { id: 27578, name: "Elliot Page", character: "Ariadne", profile_path: "/sBGEOAjeJcLb23oeBUxzjdjRMiT.jpg" },
        { id: 2524, name: "Tom Hardy", character: "Eames", profile_path: "/d81K0RH8UX7tZj49tZaQhZ9ewH.jpg" },
        { id: 3899, name: "Ken Watanabe", character: "Saito", profile_path: "/psAXOYp9SBOXvg0iNRKl1EIzKY0.jpg" },
        { id: 11357, name: "Cillian Murphy", character: "Robert Fischer", profile_path: "/dm6V24NjjvjMiCtbMkc8Y2WPm2e.jpg" },
        { id: 3489, name: "Marion Cotillard", character: "Mal", profile_path: "/sXGMKT0bMz5AcrNbZPFKxfnmuxj.jpg" },
        { id: 17419, name: "Michael Caine", character: "Miles", profile_path: "/bVZRMlpjTAO2pJK6v90JHlBcPKF.jpg" },
      ],
    },
    videos: {
      results: [
        { id: "v1", key: "YoHD9XEInc0", name: "Official Trailer", site: "YouTube", type: "Trailer" },
        { id: "v2", key: "8hP9D6kZseM", name: "Teaser Trailer", site: "YouTube", type: "Teaser" },
      ],
    },
  },

  155: {
    id: 155,
    title: "The Dark Knight",
    overview:
      "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg",
    release_date: "2008-07-16",
    vote_average: 8.5,
    genre_ids: [18, 28, 80, 53],
    runtime: 152,
    tagline: "Why So Serious?",
    genres: [
      { id: 18, name: "Drama" },
      { id: 28, name: "Action" },
      { id: 80, name: "Crime" },
      { id: 53, name: "Thriller" },
    ],
    credits: {
      cast: [
        { id: 3894, name: "Christian Bale", character: "Bruce Wayne / Batman", profile_path: "/qCpZn2e3dimwbryLnqxZuI88PTi.jpg" },
        { id: 1810, name: "Heath Ledger", character: "The Joker", profile_path: "/5Y9HnYYa2JMUUuA0cOwIhFRaOGi.jpg" },
        { id: 64, name: "Gary Oldman", character: "Gordon", profile_path: "/sJo1qFYRFmiJmOYoiFFKsAhw4F4.jpg" },
        { id: 1979, name: "Aaron Eckhart", character: "Harvey Dent", profile_path: "/rTPnMy3EAOZ7aLQhUiRq9GIUTHY.jpg" },
        { id: 2888, name: "Maggie Gyllenhaal", character: "Rachel", profile_path: "/xLk2fJMuXOg7h1sFkY30X9LHFdq.jpg" },
        { id: 17419, name: "Michael Caine", character: "Alfred", profile_path: "/bVZRMlpjTAO2pJK6v90JHlBcPKF.jpg" },
        { id: 2192, name: "Morgan Freeman", character: "Lucius Fox", profile_path: "/jPsLqiYGSofU4s6BjrxnefMfabb.jpg" },
      ],
    },
    videos: {
      results: [
        { id: "v1", key: "EXeTwQWrcwY", name: "Official Trailer", site: "YouTube", type: "Trailer" },
      ],
    },
  },

  550: {
    id: 550,
    title: "Fight Club",
    overview:
      'A ticking-time bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town.',
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop_path: "/hZkgoQYus5dXo3H8T7CYV25rJp.jpg",
    release_date: "1999-10-15",
    vote_average: 8.4,
    genre_ids: [18, 53],
    runtime: 139,
    tagline: "Mischief. Mayhem. Soap.",
    genres: [
      { id: 18, name: "Drama" },
      { id: 53, name: "Thriller" },
    ],
    credits: {
      cast: [
        { id: 819, name: "Edward Norton", character: "The Narrator", profile_path: "/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg" },
        { id: 287, name: "Brad Pitt", character: "Tyler Durden", profile_path: "/cckcYc2v0yh1tc9QjRelptcOBko.jpg" },
        { id: 1283, name: "Helena Bonham Carter", character: "Marla Singer", profile_path: "/DDeITcCpnBd0CkAIRPhgqoaW43.jpg" },
        { id: 7473, name: "Meat Loaf", character: "Robert 'Bob' Paulson", profile_path: null },
        { id: 7499, name: "Jared Leto", character: "Angel Face", profile_path: "/ca3x0OfIKRJppyMkGsWOqm0BILq.jpg" },
      ],
    },
    videos: {
      results: [
        { id: "v1", key: "qtRKdVHc-cE", name: "Official Trailer", site: "YouTube", type: "Trailer" },
      ],
    },
  },

  680: {
    id: 680,
    title: "Pulp Fiction",
    overview:
      "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    release_date: "1994-09-10",
    vote_average: 8.5,
    genre_ids: [53, 80],
    runtime: 154,
    tagline: "Just because you are a character doesn't mean you have character.",
    genres: [
      { id: 53, name: "Thriller" },
      { id: 80, name: "Crime" },
    ],
    credits: {
      cast: [
        { id: 8891, name: "John Travolta", character: "Vincent Vega", profile_path: "/ns8uZHEH4fMlHwpBEchO3dxizii.jpg" },
        { id: 2231, name: "Samuel L. Jackson", character: "Jules Winnfield", profile_path: "/nCJJ3NVksYNxIzEHcyC1XziwPsL.jpg" },
        { id: 139, name: "Uma Thurman", character: "Mia Wallace", profile_path: "/u0bXzKGBMUwo0lr5BPApg5bYfYg.jpg" },
        { id: 62, name: "Bruce Willis", character: "Butch Coolidge", profile_path: "/A1YFIBcUo8MEzgRaRkjbNPMuKOZ.jpg" },
        { id: 8293, name: "Ving Rhames", character: "Marsellus Wallace", profile_path: null },
        { id: 10182, name: "Tim Roth", character: "Pumpkin", profile_path: null },
      ],
    },
    videos: {
      results: [
        { id: "v1", key: "s7EdQ4FqbhY", name: "Official Trailer", site: "YouTube", type: "Trailer" },
      ],
    },
  },

  238: {
    id: 238,
    title: "The Godfather",
    overview:
      "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
    release_date: "1972-03-14",
    vote_average: 8.7,
    genre_ids: [18, 80],
    runtime: 175,
    tagline: "An offer you can't refuse.",
    genres: [
      { id: 18, name: "Drama" },
      { id: 80, name: "Crime" },
    ],
    credits: {
      cast: [
        { id: 3084, name: "Marlon Brando", character: "Don Vito Corleone", profile_path: "/fuTEPMsBtV1zE98ujPONbKiYDc2.jpg" },
        { id: 1158, name: "Al Pacino", character: "Michael Corleone", profile_path: "/2dGBb1fOAL68l5JQ2hEibwFHSSJ.jpg" },
        { id: 3085, name: "James Caan", character: "Sonny Corleone", profile_path: "/v4UKKANxPbwEfZGnMO5dfvXjgyp.jpg" },
        { id: 3087, name: "Robert Duvall", character: "Tom Hagen", profile_path: null },
        { id: 3092, name: "Diane Keaton", character: "Kay Adams", profile_path: null },
      ],
    },
    videos: {
      results: [
        { id: "v1", key: "sY1S34973zA", name: "Official Trailer", site: "YouTube", type: "Trailer" },
      ],
    },
  },

  157336: {
    id: 157336,
    title: "Interstellar",
    overview:
      "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "/xJHokMbljXjADYdit5fK1B4Q2Nk.jpg",
    release_date: "2014-11-05",
    vote_average: 8.4,
    genre_ids: [12, 18, 878],
    runtime: 169,
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    genres: [
      { id: 12, name: "Adventure" },
      { id: 18, name: "Drama" },
      { id: 878, name: "Science Fiction" },
    ],
    credits: {
      cast: [
        { id: 10297, name: "Matthew McConaughey", character: "Cooper", profile_path: "/wJiGedOCZhwMx9DezY8uwbVGMLq.jpg" },
        { id: 1813, name: "Anne Hathaway", character: "Brand", profile_path: "/tLelKoPNiyJCSEtQTz1FGv4enYl.jpg" },
        { id: 3895, name: "Michael Caine", character: "Professor Brand", profile_path: "/bVZRMlpjTAO2pJK6v90JHlBcPKF.jpg" },
        { id: 83002, name: "Jessica Chastain", character: "Murph", profile_path: "/lodMzLKSdrPcBry2sALHqNE3VMQ.jpg" },
        { id: 10, name: "Matt Damon", character: "Dr. Mann", profile_path: "/ehBFsLEhCia25ODSTkfPNwDYtnv.jpg" },
        { id: 131, name: "Casey Affleck", character: "Tom", profile_path: null },
      ],
    },
    videos: {
      results: [
        { id: "v1", key: "zSWdZVtXT7E", name: "Official Trailer", site: "YouTube", type: "Trailer" },
        { id: "v2", key: "0vxOhd4qlnA", name: "Teaser", site: "YouTube", type: "Teaser" },
      ],
    },
  },

  278: {
    id: 278,
    title: "The Shawshank Redemption",
    overview:
      "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.",
    poster_path: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
    backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    release_date: "1994-09-23",
    vote_average: 8.7,
    genre_ids: [18, 80],
    runtime: 142,
    tagline: "Fear can hold you prisoner. Hope can set you free.",
    genres: [
      { id: 18, name: "Drama" },
      { id: 80, name: "Crime" },
    ],
    credits: {
      cast: [
        { id: 504, name: "Tim Robbins", character: "Andy Dufresne", profile_path: "/djLVFETFTvPyVUdrd7aLVykobof.jpg" },
        { id: 192, name: "Morgan Freeman", character: "Ellis Boyd 'Red' Redding", profile_path: "/jPsLqiYGSofU4s6BjrxnefMfabb.jpg" },
        { id: 4029, name: "Bob Gunton", character: "Warden Norton", profile_path: null },
        { id: 6574, name: "William Sadler", character: "Heywood", profile_path: null },
        { id: 7036, name: "Clancy Brown", character: "Captain Hadley", profile_path: null },
      ],
    },
    videos: {
      results: [
        { id: "v1", key: "6hB3S9bIaco", name: "Official Trailer", site: "YouTube", type: "Trailer" },
      ],
    },
  },

  424: {
    id: 424,
    title: "Schindler's List",
    overview:
      "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory during World War II.",
    poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
    backdrop_path: "/loRmRzQXZR0Z1DF0VGOsVkBaNdm.jpg",
    release_date: "1993-12-15",
    vote_average: 8.6,
    genre_ids: [18, 36, 10752],
    runtime: 195,
    tagline: "Whoever saves one life, saves the world entire.",
    genres: [
      { id: 18, name: "Drama" },
      { id: 10752, name: "War" },
    ],
    credits: {
      cast: [
        { id: 3, name: "Liam Neeson", character: "Oskar Schindler", profile_path: "/bboldwqSC6tdw2iTnmJcGMihLCp.jpg" },
        { id: 1455, name: "Ben Kingsley", character: "Itzhak Stern", profile_path: null },
        { id: 2, name: "Ralph Fiennes", character: "Amon Goeth", profile_path: "/tJr9GcmGNHhLVVEWl25LLBVEQQ0.jpg" },
      ],
    },
    videos: {
      results: [
        { id: "v1", key: "gG22XNhtnoY", name: "Official Trailer", site: "YouTube", type: "Trailer" },
      ],
    },
  },

  13: {
    id: 13,
    title: "Forrest Gump",
    overview:
      "A man with a low IQ has accomplished great things in his life and been present during significant historic events.",
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdrop_path: "/7c9UVPPiTPltouxRVY6N9uugaVA.jpg",
    release_date: "1994-06-23",
    vote_average: 8.5,
    genre_ids: [35, 18, 10749],
    runtime: 142,
    tagline: "Life is like a box of chocolates.",
    genres: [
      { id: 35, name: "Comedy" },
      { id: 18, name: "Drama" },
      { id: 10749, name: "Romance" },
    ],
    credits: {
      cast: [
        { id: 31, name: "Tom Hanks", character: "Forrest Gump", profile_path: "/xndWFsBlClOJFRdhSt4NBwiPq2o.jpg" },
        { id: 32, name: "Robin Wright", character: "Jenny Curran", profile_path: null },
        { id: 33, name: "Gary Sinise", character: "Lt. Dan Taylor", profile_path: null },
        { id: 34, name: "Sally Field", character: "Mrs. Gump", profile_path: null },
      ],
    },
    videos: {
      results: [
        { id: "v1", key: "bLvqoHBptjg", name: "Official Trailer", site: "YouTube", type: "Trailer" },
      ],
    },
  },

  569094: {
    id: 569094,
    title: "Spider-Man: Across the Spider-Verse",
    overview:
      "After reuniting with Gwen Stacy, Brooklyn's full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse.",
    poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop_path: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    release_date: "2023-05-31",
    vote_average: 8.4,
    genre_ids: [16, 28, 12],
    runtime: 140,
    tagline: "It's how you wear the mask that matters.",
    genres: [
      { id: 16, name: "Animation" },
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
    ],
    credits: {
      cast: [
        { id: 587, name: "Shameik Moore", character: "Miles Morales (voice)", profile_path: null },
        { id: 588, name: "Hailee Steinfeld", character: "Gwen Stacy (voice)", profile_path: null },
        { id: 589, name: "Oscar Isaac", character: "Miguel O'Hara (voice)", profile_path: "/dW5U5yrIIPmMjRThR9KT2xH6nTz.jpg" },
        { id: 590, name: "Jake Johnson", character: "Peter B. Parker (voice)", profile_path: null },
      ],
    },
    videos: {
      results: [
        { id: "v1", key: "shW9i6k8cB0", name: "Official Trailer", site: "YouTube", type: "Trailer" },
      ],
    },
  },

  299536: {
    id: 299536,
    title: "Avengers: Infinity War",
    overview:
      "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.",
    poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    backdrop_path: "/lmZFxXgJE3vgrciwuDib0N8CfQo.jpg",
    release_date: "2018-04-25",
    vote_average: 8.3,
    genre_ids: [12, 28, 878],
    runtime: 149,
    tagline: "An entire universe. Once and for all.",
    genres: [
      { id: 12, name: "Adventure" },
      { id: 28, name: "Action" },
      { id: 878, name: "Science Fiction" },
    ],
    credits: {
      cast: [
        { id: 3223, name: "Robert Downey Jr.", character: "Tony Stark / Iron Man", profile_path: "/im9SAqJPZKEbVZGmjXuLI4O7RvM.jpg" },
        { id: 74568, name: "Chris Hemsworth", character: "Thor", profile_path: "/jpurJ9jAcLCYjgHHfYF32m3zJYm.jpg" },
        { id: 172069, name: "Josh Brolin", character: "Thanos", profile_path: null },
        { id: 16828, name: "Chris Evans", character: "Steve Rogers / Captain America", profile_path: null },
        { id: 1136406, name: "Tom Holland", character: "Peter Parker / Spider-Man", profile_path: null },
      ],
    },
    videos: {
      results: [
        { id: "v1", key: "6ZfuNTqbHE8", name: "Official Trailer", site: "YouTube", type: "Trailer" },
      ],
    },
  },

  76341: {
    id: 76341,
    title: "Mad Max: Fury Road",
    overview:
      "An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken.",
    poster_path: "/hA2ple9q4qnwxp3hKVNhroipsir.jpg",
    backdrop_path: "/phszHPFVhPHhMZgo0fWTKBDQsJA.jpg",
    release_date: "2015-05-13",
    vote_average: 7.6,
    genre_ids: [28, 12, 878],
    runtime: 120,
    tagline: "What a lovely day.",
    genres: [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 878, name: "Science Fiction" },
    ],
    credits: {
      cast: [
        { id: 2524, name: "Tom Hardy", character: "Max Rockatansky", profile_path: "/d81K0RH8UX7tZj49tZaQhZ9ewH.jpg" },
        { id: 6885, name: "Charlize Theron", character: "Imperator Furiosa", profile_path: "/1HRMxFsg2r8gXMrPMlOHA7dYz7Z.jpg" },
        { id: 72466, name: "Nicholas Hoult", character: "Nux", profile_path: null },
        { id: 1204, name: "Hugh Keays-Byrne", character: "Immortan Joe", profile_path: null },
      ],
    },
    videos: {
      results: [
        { id: "v1", key: "hEJnMQG9ev8", name: "Official Trailer", site: "YouTube", type: "Trailer" },
      ],
    },
  },
};
