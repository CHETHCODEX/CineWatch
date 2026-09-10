import numpy as np
import pandas as pd

class EngagementScorer:
    """
    User Behavioral Analytics & OTT Retention Engine.
    Quantifies user activity into an Engagement Score (0 - 100),
    identifies subscriber cohorts, and prescribes automated churn-prevention tactics.
    """
    def __init__(self, data_loader):
        self.data_loader = data_loader
        self.total_catalog_genres = 20  # Standard MovieLens genre taxonomy
        
    def calculate_user_engagement(self, user_id):
        """
        Computes the multi-factor Engagement Score (0-100) for user_id:
            - Activity Volume (35% weight)
            - Rating Sentiment (20% weight)
            - Taste Selectivity / Discerning variance (15% weight)
            - Genre Diversity (30% weight)
        """
        user_ratings = self.data_loader.get_user_ratings(user_id)
        
        # 1. New or zero-rating user handling
        if user_ratings.empty:
            return {
                'score': 15,
                'cohort': 'Dormant / At-Risk',
                'churnRisk': 'High (80%)',
                'totalRatings': 0,
                'meanRating': 0.0,
                'ratingStdDev': 0.0,
                'genreDiversityPct': 5,
                'retentionStrategy': (
                    "New or inactive account. High churn hazard. "
                    "Serve high-consensus blockbuster hooks and trending viral titles immediately to establish viewing habits."
                )
            }
            
        ratings_list = user_ratings['rating'].values
        total_ratings = len(ratings_list)
        mean_rating = float(np.mean(ratings_list))
        std_dev = float(np.std(ratings_list)) if total_ratings > 1 else 0.5
        
        # Extract unique genres explored by this user
        watched_movie_ids = user_ratings['movieId'].tolist()
        user_genres = set()
        for m_id in watched_movie_ids:
            meta = self.data_loader.movie_meta.get(m_id, {})
            for g in meta.get('genres', []):
                user_genres.add(g.lower())
                
        genres_explored_count = len(user_genres)
        genre_diversity_pct = int(min(1.0, genres_explored_count / max(1, self.total_catalog_genres)) * 100)
        
        # 2. Normalize 4 Core Factors
        # Volume factor: benchmarked at 150 ratings for 100% capacity
        vol_norm = min(total_ratings / 150.0, 1.0)
        
        # Sentiment factor: normalized 1.0 - 5.0 scale to 0.0 - 1.0
        sentiment_norm = max(0.0, min(1.0, (mean_rating - 1.0) / 4.0))
        
        # Selectivity factor: measures critical discernment (std dev / 1.5)
        selectivity_norm = min(std_dev / 1.5, 1.0)
        
        # Diversity factor: proportion of catalog genres explored
        diversity_norm = min(genres_explored_count / 15.0, 1.0)
        
        # 3. Weighted Ensemble Calculation (Scale 0 to 100)
        engagement_raw = (
            (0.35 * vol_norm) +
            (0.20 * sentiment_norm) +
            (0.15 * selectivity_norm) +
            (0.30 * diversity_norm)
        ) * 100.0
        
        engagement_score = int(np.clip(engagement_raw, 10, 98))
        
        # 4. Cohort Segmentation & Retention Strategy
        if engagement_score < 35:
            cohort = "Dormant / At-Risk"
            churn_risk = "High (70%+)"
            strategy = (
                "High Churn Risk. Serve high-consensus global blockbusters, trending releases, "
                "and prominent homepage hooks to re-engage dormant viewing habits."
            )
        elif engagement_score < 65:
            cohort = "Casual Viewer"
            churn_risk = "Moderate (35%)"
            strategy = (
                "Moderate Retention. User sticks to 1-2 favorite genres. "
                "Recommend genre-adjacent popular titles and actor crossovers to broaden catalog discovery."
            )
        elif engagement_score < 85:
            cohort = "Core Active"
            churn_risk = "Low (15%)"
            strategy = (
                "Healthy Active Subscriber. High platform affinity. "
                "Serve balanced hybrid recommendations and personalized watchlist rows matching primary themes."
            )
        else:
            cohort = "Power Viewer"
            churn_risk = "Minimal (<5%)"
            strategy = (
                "VIP / Platform Advocate. Highly discerning taste and broad genre appetite. "
                "Prioritize long-tail, niche, auteur-driven deep cuts and critically acclaimed cinema over generic blockbusters."
            )
            
        return {
            'score': engagement_score,
            'cohort': cohort,
            'churnRisk': churn_risk,
            'totalRatings': total_ratings,
            'meanRating': round(mean_rating, 2),
            'ratingStdDev': round(std_dev, 2),
            'genresExplored': genres_explored_count,
            'genreDiversityPct': genre_diversity_pct,
            'retentionStrategy': strategy
        }
