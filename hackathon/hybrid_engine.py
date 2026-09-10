'''
Candidate Retrieval: Safely pulled candidates while filtering out any titles the user has already rated.
Anchor Identification: Identified the user's top-rated anchor films (≥4.0⋆) to anchor the recommendation query.
Score Fusion: Blended Collaborative SVD (60%) with Content Cosine Similarity (40%).
Watchlist Slicing: Produced the personalized Top-12 Watchlist enriched with release years, genres, director, cast, predicted ratings, and display match percentages.'''

import numpy as np
from config import ALPHA_COLLAB, BETA_CONTENT, TOP_N_DEFAULT

class HybridEngine:
    def __init__(self, data_loader, content_engine, collab_engine):
        self.data_loader = data_loader
        self.content_engine = content_engine
        self.collab_engine = collab_engine
        self.alpha = ALPHA_COLLAB  # 0.6 default
        self.beta = BETA_CONTENT   # 0.4 default
        
    def get_user_watched_ids(self, user_id):
        """Returns set of movie IDs the user has already rated."""
        user_ratings = self.data_loader.get_user_ratings(user_id)
        if user_ratings.empty:
            return set()
        return set(user_ratings['movieId'].tolist())

    def get_candidate_movie_ids(self, user_id, watched_ids, max_candidates=250):
        """
        Retrieves candidate movies for recommendation:
        1. Candidates similar to user's favorite anchor movies (content pull).
        2. Top popular/vote-rated movies not yet watched.
        """
        anchor_ids = self.data_loader.get_user_top_movies(user_id, min_rating=4.0, top_k=3)
        candidate_pool = set()
        
        # 1. Content-based candidates from anchor movies
        for anchor_id in anchor_ids:
            sim_movies = self.content_engine.get_content_recommendations(anchor_id, top_n=35)
            for m_id, _ in sim_movies:
                if m_id not in watched_ids and m_id in self.data_loader.movie_id_to_idx:
                    candidate_pool.add(m_id)
                    
        # 2. Add high-vote popular movies to ensure candidate diversity
        if self.data_loader.movies_df is not None:
            top_popular = self.data_loader.movies_df.sort_values(
                by='Movie_Popularity', 
                ascending=False
            )['Movie_ID'].head(150).tolist()
            
            for m_id in top_popular:
                m_id = int(m_id)
                if m_id not in watched_ids and m_id in self.data_loader.movie_id_to_idx:
                    candidate_pool.add(m_id)
                    if len(candidate_pool) >= max_candidates:
                        break
                        
        return list(candidate_pool), anchor_ids

    def recommend(self, user_id, top_n=TOP_N_DEFAULT):
        """
        Generates personalized Top-N watchlist recommendations for user_id.
        Returns:
            list of dicts, sorted descending by hybridScore
        """
        if not self.content_engine.is_fitted:
            raise RuntimeError("ContentEngine must be fitted before running HybridEngine.")
        if not self.collab_engine.is_fitted:
            raise RuntimeError("CollaborativeEngine must be fitted before running HybridEngine.")
            
        watched_ids = self.get_user_watched_ids(user_id)
        candidates, anchor_ids = self.get_candidate_movie_ids(user_id, watched_ids)
        
        if not candidates:
            candidates = [
                int(m) for m in self.data_loader.movies_df.sort_values(
                    by='Movie_Popularity', 
                    ascending=False
                )['Movie_ID'].head(top_n).tolist()
            ]
            anchor_ids = []

        scored_candidates = []
        for m_id in candidates:
            collab_score = self.collab_engine.get_normalized_score(user_id, m_id)
            pred_rating = self.collab_engine.predict_rating(user_id, m_id)
            
            if anchor_ids:
                content_score = self.content_engine.get_content_affinity(anchor_ids, m_id)
            else:
                content_score = 0.5
                
            hybrid_score = (self.alpha * collab_score) + (self.beta * content_score)
            
            # Calibrate match percentage into appealing 65% - 98% range for display
            display_match = int(np.clip(55 + (hybrid_score * 50), 65, 98))
            
            meta = self.data_loader.movie_meta.get(m_id, {})
            
            scored_candidates.append({
                'movieId': m_id,
                'title': meta.get('title', f"Movie {m_id}"),
                'year': meta.get('year', 2000),
                'genres': meta.get('genres', []),
                'director': meta.get('director', 'Unknown'),
                'cast': meta.get('cast', []),
                'predictedRating': round(float(pred_rating), 2),
                'matchPercentage': display_match,
                'collabScore': round(float(collab_score), 3),
                'contentScore': round(float(content_score), 3),
                'hybridScore': round(float(hybrid_score), 4),
                'anchorIds': anchor_ids
            })
            
        scored_candidates.sort(key=lambda x: x['hybridScore'], reverse=True)
        return scored_candidates[:top_n]
