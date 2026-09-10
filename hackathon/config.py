'''
Member 3
Think of this as the control panel of our project.
Instead of typing file paths and model settings in multiple places, we put them all in one file:

Where the datasets live (DATASET/movies.csv, ratings.csv)
Where the cache will be saved
The blending ratio: 60% Collaborative + 40% Content
The number of recommendations to give: Top 12
'''


import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))

DATASET_DIR = os.path.join(PROJECT_ROOT, "DATASET")
MOVIES_CSV = os.path.join(DATASET_DIR, "movies.csv")
RATINGS_CSV = os.path.join(DATASET_DIR, "ratings.csv")

CACHE_DIR = os.path.join(BASE_DIR, "cache")
DEMO_CACHE_FILE = os.path.join(CACHE_DIR, "demo_data.json")

# Ensure cache directory exists
os.makedirs(CACHE_DIR, exist_ok=True)

# Blending weights for Hybrid Recommender
ALPHA_COLLAB = 0.6      # 60% weight to Collaborative Filtering (SVD)
BETA_CONTENT = 0.4      # 40% weight to Content-Based Similarity (TF-IDF)
TOP_N_DEFAULT = 12      # Number of recommendations in personalized watchlist

# SVD Hyperparameters
SVD_N_FACTORS = 50
SVD_N_EPOCHS = 20
SVD_LR_ALL = 0.005
SVD_REG_ALL = 0.02

# Content Engine Parameters
TFIDF_MAX_FEATURES = 10000
TFIDF_STOP_WORDS = 'english'
