import pandas as pd
import ast
import os

# Paths
MOVIES_FILE = "../movie-data/movies_metadata.csv"
CREDITS_FILE = "../movie-data/credits.csv"
KEYWORDS_FILE = "data/raw/keywords.csv"
OUTPUT_FILE = "data/processed/movies_processed.csv"


def parse_json(value):
    """Safely parse JSON-like strings stored in CSV files."""
    try:
        if pd.isna(value):
            return []
        return ast.literal_eval(value)
    except (ValueError, SyntaxError):
        return []


def extract_names(value, limit=5):
    """Extract names from cast/keyword/genre JSON data."""
    items = parse_json(value)

    if not isinstance(items, list):
        return []

    names = []

    for item in items[:limit]:
        if isinstance(item, dict) and "name" in item:
            names.append(str(item["name"]))

    return names


def extract_director(value):
    """Extract director from crew JSON."""
    crew = parse_json(value)

    if not isinstance(crew, list):
        return ""

    for person in crew:
        if (
            isinstance(person, dict)
            and person.get("job") == "Director"
        ):
            return str(person.get("name", ""))

    return ""


print("Loading movies metadata...")
movies = pd.read_csv(
    MOVIES_FILE,
    low_memory=False,
    on_bad_lines="skip"
)

print(f"Movies loaded: {len(movies):,}")


print("Cleaning movie IDs...")

movies["id"] = pd.to_numeric(
    movies["id"],
    errors="coerce"
)

movies = movies.dropna(subset=["id"])
movies["id"] = movies["id"].astype(int)


print("Loading credits...")
credits = pd.read_csv(
    CREDITS_FILE,
    low_memory=False,
    on_bad_lines="skip"
)

print(f"Credits loaded: {len(credits):,}")


print("Loading keywords...")
keywords = pd.read_csv(
    KEYWORDS_FILE,
    low_memory=False,
    on_bad_lines="skip"
)

print(f"Keywords loaded: {len(keywords):,}")


# Clean IDs
credits["id"] = pd.to_numeric(
    credits["id"],
    errors="coerce"
)

keywords["id"] = pd.to_numeric(
    keywords["id"],
    errors="coerce"
)

credits = credits.dropna(subset=["id"])
keywords = keywords.dropna(subset=["id"])

credits["id"] = credits["id"].astype(int)
keywords["id"] = keywords["id"].astype(int)


print("Processing genres...")

movies["genres"] = movies["genres"].apply(
    lambda x: ", ".join(extract_names(x, 10))
)


print("Processing credits...")

credits["cast"] = credits["cast"].apply(
    lambda x: ", ".join(extract_names(x, 5))
)

credits["director"] = credits["crew"].apply(
    extract_director
)


credits_processed = credits[
    ["id", "cast", "director"]
].drop_duplicates("id")


print("Processing keywords...")

keywords["keywords"] = keywords["keywords"].apply(
    lambda x: ", ".join(extract_names(x, 10))
)

keywords_processed = keywords[
    ["id", "keywords"]
].drop_duplicates("id")


print("Merging datasets...")

movies = movies.merge(
    credits_processed,
    on="id",
    how="left"
)

movies = movies.merge(
    keywords_processed,
    on="id",
    how="left"
)


# Fill missing values
for column in [
    "title",
    "overview",
    "genres",
    "cast",
    "director",
    "keywords",
    "original_language",
    "release_date",
    "poster_path",
    "tagline"
]:
    if column in movies.columns:
        movies[column] = movies[column].fillna("")


# Release year
movies["release_year"] = pd.to_datetime(
    movies["release_date"],
    errors="coerce"
).dt.year


# Create combined recommendation features
movies["feature_text"] = (
    movies["title"].astype(str)
    + " "
    + movies["genres"].astype(str)
    + " "
    + movies["keywords"].astype(str)
    + " "
    + movies["cast"].astype(str)
    + " "
    + movies["director"].astype(str)
    + " "
    + movies["overview"].astype(str)
)


# Keep only useful columns
columns = [
    "id",
    "title",
    "overview",
    "genres",
    "keywords",
    "cast",
    "director",
    "release_date",
    "release_year",
    "original_language",
    "popularity",
    "vote_average",
    "vote_count",
    "runtime",
    "poster_path",
    "tagline",
    "feature_text"
]

columns = [
    column for column in columns
    if column in movies.columns
]

movies_processed = movies[columns]


# Remove duplicate titles
movies_processed = movies_processed.drop_duplicates(
    subset=["id"]
)


# Create output directory
os.makedirs(
    os.path.dirname(OUTPUT_FILE),
    exist_ok=True
)


print("Saving processed dataset...")

movies_processed.to_csv(
    OUTPUT_FILE,
    index=False
)


print()
print("=" * 60)
print("PROCESSING COMPLETE")
print("=" * 60)
print(f"Movies processed: {len(movies_processed):,}")
print(f"Output: {OUTPUT_FILE}")
print("=" * 60)
