# =============================================================================
# CineWatch AI FastAPI Microservice — Vector Embedding Search
# =============================================================================
import os
import requests
import numpy as np
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# =============================================================================
# FastAPI Initialization
# =============================================================================
app = FastAPI(
    title="CineWatch AI Semantic Search Service",
    description="Vector search microservice using Gemini Embeddings API.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store movie index
movie_database = []
movie_embeddings = None
is_ready = False

# =============================================================================
# Helper: Parse Environment Variables
# =============================================================================
def load_env_key(key_name: str) -> str:
    """Reads an API key from the parent directory's .env.local file or environment."""
    env_path = Path(__file__).resolve().parent.parent / ".env.local"
    if env_path.exists():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip().startswith(f"{key_name}="):
                        val = line.strip().split("=", 1)[1]
                        return val.strip("'\"")
        except Exception as e:
            print(f"[Warning] Failed to read .env.local file: {e}")
    
    return os.getenv(key_name, "")

TMDB_API_KEY = load_env_key("TMDB_API_KEY")
GEMINI_API_KEY = load_env_key("GEMINI_API_KEY")
TMDB_BASE = "https://api.themoviedb.org/3"

# =============================================================================
# Gemini Embeddings Helpers
# =============================================================================
def get_gemini_embeddings(texts: list[str]) -> np.ndarray:
    """Fetches text embeddings for a list of strings using Google Gemini's Embedding API."""
    if not GEMINI_API_KEY:
        print("[Error] GEMINI_API_KEY is missing. Cannot fetch embeddings.")
        return np.zeros((len(texts), 768)) # text-embedding-004 uses 768 dimensions
        
    embeddings_list = []
    chunk_size = 50 # Batch in chunks to prevent large payloads
    
    for i in range(0, len(texts), chunk_size):
        chunk = texts[i:i+chunk_size]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key={GEMINI_API_KEY}"
        
        requests_payload = {
            "requests": [
                {
                    "model": "models/text-embedding-004",
                    "content": {
                        "parts": [{"text": text}]
                    }
                }
                for text in chunk
            ]
        }
        
        try:
            res = requests.post(url, json=requests_payload, timeout=20)
            if res.status_code == 200:
                data = res.json()
                for emb in data.get("embeddings", []):
                    embeddings_list.append(emb.get("values", []))
            else:
                print(f"[Error] Gemini Embedding API failed: {res.text}")
                for _ in chunk:
                    embeddings_list.append([0.0] * 768)
        except Exception as e:
            print(f"[Error] Gemini Embedding API connection error: {e}")
            for _ in chunk:
                embeddings_list.append([0.0] * 768)
                
    return np.array(embeddings_list)

def get_gemini_query_embedding(query: str) -> np.ndarray:
    """Fetches the embedding for a single search query string using Gemini."""
    if not GEMINI_API_KEY:
        return np.zeros(768)
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={GEMINI_API_KEY}"
    payload = {
        "model": "models/text-embedding-004",
        "content": {
            "parts": [{"text": query}]
        }
    }
    
    try:
        res = requests.post(url, json=payload, timeout=10)
        if res.status_code == 200:
            data = res.json()
            return np.array(data.get("embedding", {}).get("values", [0.0] * 768))
        else:
            print(f"[Error] Gemini Single Embedding API failed: {res.text}")
    except Exception as e:
        print(f"[Error] Gemini Single Embedding API connection error: {e}")
        
    return np.zeros(768)

# =============================================================================
# Mock Database Fallback (if TMDB Key is missing or TMDB is offline)
# =============================================================================
MOCK_MOVIES = [
    {
        "id": 27205,
        "title": "Inception",
        "overview": "Cobb, a skilled thief who steals valuable secrets from deep within the subconscious during the dream state, is given a inverse task of planting an idea into the mind of a C.E.O.",
        "poster_path": "/o0OFlw7UPWbbnQ1wCTaGQA17P5c.jpg",
        "backdrop_path": "/s3TBrRGB1K7G5J20tcdup1l4mPq.jpg",
        "release_date": "2010-07-15",
        "vote_average": 8.4,
        "genre_ids": [28, 878, 12]
    },
    {
        "id": 157336,
        "title": "Interstellar",
        "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
        "poster_path": "/gEU2QniE6E7vNIvXTLM3OI2Cj6A.jpg",
        "backdrop_path": "/xJHokn7SWoh4vKyPyv6fk7zU3tT.jpg",
        "release_date": "2014-11-05",
        "vote_average": 8.4,
        "genre_ids": [12, 18, 878]
    },
    {
        "id": 155,
        "title": "The Dark Knight",
        "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
        "poster_path": "/qJ2tWGBbeZu6SndzScJjZ6dH86Y.jpg",
        "backdrop_path": "/nMKdUUepdz8gflSqFRPw6wYS86c.jpg",
        "release_date": "2008-07-16",
        "vote_average": 8.5,
        "genre_ids": [28, 80, 18, 53]
    },
    {
        "id": 120,
        "title": "The Lord of the Rings: The Fellowship of the Ring",
        "overview": "Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home and travel to the fires of Mount Doom to destroy it, joined by a fellowship of elves, dwarves, men, and wizards.",
        "poster_path": "/6oom5Q5w2Hs2mQ8FSBi3P65Cc49.jpg",
        "backdrop_path": "/lX586vnI2aqDV0eXm1763RrjswR.jpg",
        "release_date": "2001-12-18",
        "vote_average": 8.4,
        "genre_ids": [12, 14, 28]
    },
    {
        "id": 603,
        "title": "The Matrix",
        "overview": "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground freedom fighters to battle the powerful computers that rule the Earth.",
        "poster_path": "/f89U3wzqrjVnH5vjo21uQ23N08v.jpg",
        "backdrop_path": "/lh5aSmchF7BzIFw636uz6UIE56t.jpg",
        "release_date": "1999-03-30",
        "vote_average": 8.2,
        "genre_ids": [28, 878]
    },
    {
        "id": 122,
        "title": "The Lord of the Rings: The Return of the King",
        "overview": "Aragorn is revealed as the heir to the ancient kings as he, Gandalf and the other members of the broken fellowship struggle to save Gondor from Sauron's forces. Meanwhile, Frodo and Sam bring the ring closer to the heart of Mordor.",
        "poster_path": "/rC5ccAvnPP8YEvQ6X9K19uTvI8Q.jpg",
        "backdrop_path": "/2u76uV8mrsGLV1c1ftvwsRxy36v.jpg",
        "release_date": "2003-12-01",
        "vote_average": 8.5,
        "genre_ids": [12, 14, 28]
    },
    {
        "id": 49051,
        "title": "The Hobbit: An Unexpected Journey",
        "overview": "Bilbo Baggins, a hobbit enjoying a quiet life, is swept into an epic quest by Gandalf the Grey and thirteen dwarves to reclaim the Lost Dwarf Kingdom of Erebor from the fearsome dragon Smaug.",
        "poster_path": "/wFF152V31v7mJ6R61Z6564756.jpg",
        "backdrop_path": "/hV7wFEX1rP21l5C0d6eD85655.jpg",
        "release_date": "2012-11-26",
        "vote_average": 7.3,
        "genre_ids": [12, 14, 28]
    },
    {
        "id": 13,
        "title": "Forrest Gump",
        "overview": "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. Yet, despite all the remarkable things he's done, his one true love, Jenny, eludes him.",
        "poster_path": "/arw27qpW711eSqGuDoywYi9AE1A.jpg",
        "backdrop_path": "/3h1JZaaA8v2paOHm1f0G7aL8t6Y.jpg",
        "release_date": "1994-06-23",
        "vote_average": 8.5,
        "genre_ids": [35, 18, 10749]
    }
]

# =============================================================================
# Startup Event
# =============================================================================
@app.on_event("startup")
def startup_event():
    """Starts up the server, indexes popular movies from TMDB, and fetches Gemini vector embeddings."""
    global movie_database, movie_embeddings, is_ready
    
    print("[1/3] Checking API Configurations...")
    if not GEMINI_API_KEY:
        print("[Warning] GEMINI_API_KEY is missing! Semantic search will run in mock mode.")
    else:
        print("Gemini API key loaded successfully.")
        
    print("[2/3] Fetching popular movies from TMDB API to populate the database...")
    fetched_movies = {}
    
    if TMDB_API_KEY:
        try:
            # Fetch 5 pages of popular movies and 5 pages of top-rated movies
            for page in range(1, 6):
                # Popular
                pop_url = f"{TMDB_BASE}/movie/popular?api_key={TMDB_API_KEY}&page={page}"
                pop_res = requests.get(pop_url, timeout=10)
                if pop_res.status_code == 200:
                    for m in pop_res.json().get("results", []):
                        if m.get("overview") and m.get("id"):
                            fetched_movies[m["id"]] = m
                
                # Top Rated
                top_url = f"{TMDB_BASE}/movie/top_rated?api_key={TMDB_API_KEY}&page={page}"
                top_res = requests.get(top_url, timeout=10)
                if top_res.status_code == 200:
                    for m in top_res.json().get("results", []):
                        if m.get("overview") and m.get("id"):
                            fetched_movies[m["id"]] = m
            
            movie_database = list(fetched_movies.values())
            print(f"Successfully fetched {len(movie_database)} unique movies from TMDB.")
            
        except Exception as e:
            print(f"[Warning] Failed to fetch live TMDB movies: {e}. Falling back to mock data.")
            movie_database = MOCK_MOVIES
    else:
        print("[Notice] TMDB API Key not found in environment or .env.local. Initializing with fallback mock database.")
        movie_database = MOCK_MOVIES

    print(f"[3/3] Generating Gemini vector embeddings for {len(movie_database)} movies...")
    # Generate text document for each movie: "Title: <title>. Overview: <overview>"
    documents = [
        f"Title: {movie['title']}. Overview: {movie['overview']}"
        for movie in movie_database
    ]
    
    # Compute embeddings using Gemini API instead of local sentence-transformers
    movie_embeddings = get_gemini_embeddings(documents)
    
    # Normalize embeddings for high-speed cosine similarity (dot product of normalized vectors)
    norms = np.linalg.norm(movie_embeddings, axis=1, keepdims=True)
    movie_embeddings = movie_embeddings / np.where(norms == 0, 1, norms)
    
    is_ready = True
    print("AI Semantic Index built and ready for search queries via Gemini Embeddings!")

# =============================================================================
# API Endpoints
# =============================================================================
@app.get("/status")
def get_status():
    """Returns the ready state and count of movies currently indexed."""
    return {
        "ready": is_ready,
        "indexed_movies_count": len(movie_database),
        "model": "Gemini-text-embedding-004"
    }

@app.get("/search")
def search(query: str, genres: str = None):
    """Semantic vector search using cosine similarity with optional genre filtering."""
    global movie_database, movie_embeddings, is_ready
    
    if not is_ready:
        raise HTTPException(
            status_code=503, 
            detail="Semantic search index is still compiling. Please try again in a few seconds."
        )
        
    if not query.strip():
        return {"results": []}
        
    try:
        # Parse allowed genres if provided
        allowed_genres = []
        if genres:
            try:
                allowed_genres = [int(g.strip()) for g in genres.split(",") if g.strip().isdigit()]
            except ValueError:
                pass

        # Embed query using Gemini API
        query_embedding = get_gemini_query_embedding(query)
        
        # Normalize query embedding
        query_norm = np.linalg.norm(query_embedding)
        if query_norm > 0:
            query_embedding = query_embedding / query_norm
            
        # Compute cosine similarity via dot product (since database is normalized)
        similarities = np.dot(movie_embeddings, query_embedding)
        
        # Get sorted indices in descending order
        sorted_indices = np.argsort(similarities)[::-1]
        
        # Compile matching results
        results = []
        for idx in sorted_indices:
            similarity_score = float(similarities[idx])
            
            # Avoid showing low-similarity matches
            if similarity_score < 0.15:
                continue
                
            movie = movie_database[idx]
            
            # Genre filter: if genres are specified, ensure the movie shares at least one genre
            if allowed_genres:
                movie_genres = movie.get("genre_ids", [])
                if not any(g in allowed_genres for g in movie_genres):
                    continue
                    
            results.append({
                "id": movie["id"],
                "title": movie["title"],
                "overview": movie["overview"],
                "poster_path": movie.get("poster_path"),
                "backdrop_path": movie.get("backdrop_path"),
                "release_date": movie.get("release_date"),
                "vote_average": movie.get("vote_average", 0.0),
                "genre_ids": movie.get("genre_ids", []),
                "similarity": similarity_score
            })
            
            # Limit to top 8 matching results
            if len(results) >= 8:
                break
                
        return {"results": results}
        
    except Exception as e:
        print(f"Error during semantic search: {e}")
        raise HTTPException(status_code=500, detail="Internal semantic search computation failure.")
