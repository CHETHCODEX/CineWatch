'''
Member3
Raw data from the internet is messy (missing values, weird formats). You cleaned it!
Missing Value Treatment: Replaced empty text cells with blank strings so our code doesn't crash on NaN.
Created the "Feature Bag": This is super cool — for every single movie, you combined its title, genre, keywords, cast, director, and overview into one big text description:

For Star Wars: "star wars adventure action science fiction android galaxy hermit death star lightsaber mark hamill harrison ford carrie fisher george lucas princess leia is captured..."

Built Fast ID Dictionaries: Created quick lookup dictionaries so we can instantly convert Movie ID ↔ Index ↔ Movie Title. This is super important for the SVD algorithm and for the Content Engine to find similar movies.
Prepared Surprise Format: Converted the 1M+ user ratings into the exact data structure needed by the SVD algorithm.
'''
import os
import pandas as pd
import numpy as np
from surprise import Reader, Dataset
from config import MOVIES_CSV, RATINGS_CSV

class DataLoader:
    def __init__(self, movies_path=MOVIES_CSV, ratings_path=RATINGS_CSV):
        self.movies_path = movies_path
        self.ratings_path = ratings_path
        
        self.movies_df = None
        self.ratings_df = None
        self.surprise_data = None
        
        self.movie_id_to_idx = {}
        self.idx_to_movie_id = {}
        self.movie_id_to_title = {}
        self.title_to_movie_id = {}
        self.movie_meta = {}
        
    def load_movies(self):
        """Loads, cleans, and builds feature bags for movies.csv."""
        if not os.path.exists(self.movies_path):
            raise FileNotFoundError(f"Movies file not found: {self.movies_path}")
            
        print(f"Loading movies from {self.movies_path}...")
        df = pd.read_csv(self.movies_path)
        
        # Text columns to clean
        text_cols = [
            'Movie_Title', 'Movie_Genre', 'Movie_Keywords', 
            'Movie_Cast', 'Movie_Director', 'Movie_Overview', 'Movie_Tagline'
        ]
        for col in text_cols:
            if col in df.columns:
                df[col] = df[col].fillna('').astype(str)
                
        # Fill numeric values
        if 'Movie_Vote' in df.columns:
            df['Movie_Vote'] = pd.to_numeric(df['Movie_Vote'], errors='coerce').fillna(0.0)
        if 'Movie_Vote_Count' in df.columns:
            df['Movie_Vote_Count'] = pd.to_numeric(df['Movie_Vote_Count'], errors='coerce').fillna(0).astype(int)
            
        # Parse release year from Movie_Release_Date
        if 'Movie_Release_Date' in df.columns:
            df['Release_Year'] = df['Movie_Release_Date'].astype(str).str.extract(r'(\d{4})')[0].fillna('2000').astype(int)
        else:
            df['Release_Year'] = 2000
            
        # Feature Bag construction
        df['Feature_Bag'] = (
            df['Movie_Title'] + ' ' +
            df['Movie_Genre'] + ' ' +
            df['Movie_Keywords'] + ' ' +
            df['Movie_Cast'] + ' ' +
            df['Movie_Director'] + ' ' +
            df['Movie_Overview']
        ).str.strip().str.lower()
        
        self.movies_df = df
        
        # Build mappings
        for idx, row in df.iterrows():
            m_id = int(row['Movie_ID'])
            title = str(row['Movie_Title']).strip()
            
            self.movie_id_to_idx[m_id] = idx
            self.idx_to_movie_id[idx] = m_id
            self.movie_id_to_title[m_id] = title
            self.title_to_movie_id[title.lower()] = m_id
            
            genres_list = [g.strip() for g in str(row['Movie_Genre']).split() if g.strip()]
            self.movie_meta[m_id] = {
                'movieId': m_id,
                'title': title,
                'genres': genres_list,
                'director': str(row['Movie_Director']).strip(),
                'cast': [c.strip() for c in str(row['Movie_Cast']).split(',') if c.strip()][:3],
                'voteAverage': float(row['Movie_Vote']),
                'voteCount': int(row['Movie_Vote_Count']),
                'year': int(row['Release_Year']),
                'overview': str(row['Movie_Overview']).strip()
            }
            
        print(f"Loaded {len(self.movies_df)} movies successfully.")
        return self.movies_df
        
    def load_ratings(self, sample_size=None):
        """Loads ratings.csv and prepares Surprise Reader format."""
        if not os.path.exists(self.ratings_path):
            raise FileNotFoundError(f"Ratings file not found: {self.ratings_path}")
            
        print(f"Loading ratings from {self.ratings_path}...")
        df = pd.read_csv(self.ratings_path)
        
        if not set(['userId', 'movieId', 'rating']).issubset(df.columns):
            raise ValueError("ratings.csv must contain userId, movieId, and rating columns.")
            
        df['userId'] = df['userId'].astype(int)
        df['movieId'] = df['movieId'].astype(int)
        df['rating'] = df['rating'].astype(float)
        
        if sample_size and sample_size < len(df):
            print(f"Sampling {sample_size:,} ratings for faster local processing...")
            df = df.sample(n=sample_size, random_state=42)
            
        self.ratings_df = df
        print(f"Loaded {len(self.ratings_df):,} ratings from {df['userId'].nunique():,} users.")
        
        reader = Reader(rating_scale=(0.5, 5.0))
        self.surprise_data = Dataset.load_from_df(
            self.ratings_df[['userId', 'movieId', 'rating']], 
            reader
        )
        return self.ratings_df

    def get_user_ratings(self, user_id):
        """Returns DataFrame of movies rated by a specific user."""
        if self.ratings_df is None:
            raise ValueError("Ratings not loaded yet. Call load_ratings() first.")
        return self.ratings_df[self.ratings_df['userId'] == user_id]

    def get_user_top_movies(self, user_id, min_rating=4.0, top_k=3):
        """Returns top rated movie IDs for an anchor user taste profile."""
        user_ratings = self.get_user_ratings(user_id)
        if user_ratings.empty:
            return []
        top_rated = user_ratings[user_ratings['rating'] >= min_rating].sort_values(by='rating', ascending=False)
        if top_rated.empty:
            top_rated = user_ratings.sort_values(by='rating', ascending=False)
        return top_rated['movieId'].head(top_k).tolist()
