"""
CineMatch Intelligence — ML & RecSys Pipeline Automated Test Suite
Continuous Integration (CI) verification script for GitHub Actions & Local Dev.
"""

import os
import sys
import json
import unittest
import numpy as np

# Ensure hackathon directory is in python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from config import (
    MOVIES_CSV,
    RATINGS_CSV,
    DEMO_CACHE_FILE,
    ALPHA_COLLAB,
    BETA_CONTENT,
    SVD_N_FACTORS,
    TFIDF_MAX_FEATURES
)
from data_loader import DataLoader
from engagement_scorer import EngagementScorer


class TestRecSysPipeline(unittest.TestCase):

    def test_01_configuration_integrity(self):
        """Verify centralized hyperparameters and blending weights."""
        print("\n[TEST 1] Verifying System Configuration...")
        self.assertAlmostEqual(
            ALPHA_COLLAB + BETA_CONTENT, 
            1.0, 
            places=2, 
            msg="Ensemble weights (ALPHA + BETA) must sum to 1.0"
        )
        self.assertGreater(SVD_N_FACTORS, 0, "SVD latent factors must be positive")
        self.assertGreater(TFIDF_MAX_FEATURES, 0, "TF-IDF feature cutoff must be positive")
        print("  [OK] Configuration parameters and weights verified.")

    def test_02_demo_cache_integrity(self):
        """Verify pre-computed demo cache exists and matches schema."""
        print("\n[TEST 2] Verifying Zero-Latency Demo Cache...")
        self.assertTrue(
            os.path.exists(DEMO_CACHE_FILE), 
            f"Demo cache missing at: {DEMO_CACHE_FILE}"
        )
        
        with open(DEMO_CACHE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        self.assertIn("personas", data, "Cache must contain 'personas' root key")
        personas = data["personas"]
        self.assertGreater(len(personas), 0, "Personas dictionary cannot be empty")
        
        # Verify required persona keys
        for user_id, profile in personas.items():
            self.assertIn("user", profile, f"User profile missing for {user_id}")
            self.assertIn("watchlist", profile, f"Watchlist missing for {user_id}")
            watchlist = profile["watchlist"]
            self.assertGreater(len(watchlist), 0, f"Watchlist for {user_id} should not be empty")
            
            # Check watchlist item schema
            sample = watchlist[0]
            for key in ["movieId", "title", "predictedRating", "matchPercentage"]:
                self.assertIn(key, sample, f"Movie schema missing key: {key}")
                
        print(f"  [OK] Cache verified with {len(personas)} preset personas.")

    def test_03_data_loader_etl(self):
        """Verify data loader cleans nulls and generates Feature_Bag."""
        print("\n[TEST 3] Verifying ETL Pipeline & Feature Bags...")
        if not os.path.exists(MOVIES_CSV):
            self.skipTest(f"movies.csv not found at {MOVIES_CSV}")
            
        loader = DataLoader(movies_path=MOVIES_CSV, ratings_path=RATINGS_CSV)
        df = loader.load_movies()
        
        self.assertIn("Feature_Bag", df.columns, "Feature_Bag column must be generated")
        self.assertFalse(df["Feature_Bag"].isna().any(), "Feature bags must not contain NaNs")
        
        # Check bi-directional dictionary lookups
        sample_id = int(df.iloc[0]["Movie_ID"])
        sample_title = str(df.iloc[0]["Movie_Title"]).strip()
        self.assertIn(sample_id, loader.movie_id_to_title)
        self.assertEqual(loader.movie_id_to_title[sample_id], sample_title)
        print(f"  [OK] Cleaned {len(df):,} movies; Feature Bags and O(1) maps built.")

    def test_04_engagement_scorer(self):
        """Verify behavioral analytics multi-factor scoring formula."""
        print("\n[TEST 4] Verifying Behavioral Analytics & Churn Scorer...")
        if not os.path.exists(MOVIES_CSV) or not os.path.exists(RATINGS_CSV):
            self.skipTest("Datasets not available for live engagement test")
            
        loader = DataLoader(movies_path=MOVIES_CSV, ratings_path=RATINGS_CSV)
        loader.load_movies()
        loader.load_ratings(sample_size=1000)
        
        scorer = EngagementScorer(loader)
        
        # Test new/unknown user (cold-start)
        cold_result = scorer.calculate_user_engagement(user_id=99999999)
        self.assertEqual(cold_result["cohort"], "Dormant / At-Risk")
        self.assertIn("High", cold_result["churnRisk"])
        self.assertGreaterEqual(cold_result["score"], 10)
        self.assertLessEqual(cold_result["score"], 100)
        print("  [OK] Engagement scoring and cohort rules validated.")


if __name__ == "__main__":
    print("=" * 60)
    print("  CineMatch Intelligence — ML Pipeline CI Test Runner")
    print("=" * 60)
    suite = unittest.TestLoader().loadTestsFromTestCase(TestRecSysPipeline)
    runner = unittest.TextTestRunner(verbosity=1)
    result = runner.run(suite)
    
    if result.wasSuccessful():
        print("\n" + "=" * 60)
        print("  ALL ML PIPELINE CHECKS PASSED (EXIT 0)")
        print("=" * 60)
        sys.exit(0)
    else:
        print("\n" + "=" * 60)
        print("  TESTS FAILED (EXIT 1)")
        print("=" * 60)
        sys.exit(1)
