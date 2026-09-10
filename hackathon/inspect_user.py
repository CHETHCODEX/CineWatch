import os
import sys
import argparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data_loader import DataLoader
from content_engine import ContentEngine
from collaborative_engine import CollaborativeEngine
from hybrid_engine import HybridEngine
from explainer import Explainer
from engagement_scorer import EngagementScorer

def inspect_user(user_id, top_n=5):
    print("=" * 75)
    print(f"  [CINEMATCH] INTELLIGENCE REPORT FOR USER #{user_id}")
    print("=" * 75)
    
    # 1. Load Data
    print("\n[1/4] Loading models and datasets...")
    loader = DataLoader()
    loader.load_movies()
    loader.load_ratings(sample_size=150000)
    
    # Check user history
    user_ratings = loader.get_user_ratings(user_id)
    total_ratings = len(user_ratings)
    print(f"\n[2/4] User Activity History:")
    print(f"  Total Ratings Logged: {total_ratings}")
    
    if total_ratings > 0:
        mean_r = user_ratings['rating'].mean()
        print(f"  Average Rating Given: {mean_r:.2f} / 5.0 stars")
        top_rated = user_ratings.sort_values(by='rating', ascending=False).head(3)
        print("  Top Rated Movies in Profile:")
        for _, row in top_rated.iterrows():
            m_title = loader.movie_id_to_title.get(int(row['movieId']), f"Movie {row['movieId']}")
            print(f"    - {m_title}: {row['rating']} stars")
    else:
        print("  (New or inactive user with 0 logged ratings)")
        
    # 2. Behavioral Engagement Scoring
    print(f"\n[3/4] Behavioral Engagement Analysis:")
    scorer = EngagementScorer(loader)
    eng = scorer.calculate_user_engagement(user_id)
    print(f"  Engagement Score: {eng['score']} / 100")
    print(f"  Cohort Level:     {eng['cohort']}")
    print(f"  Churn Risk:       {eng['churnRisk']}")
    print(f"  Genre Diversity:  {eng['genreDiversityPct']}% of catalog")
    print(f"  Retention Tactic: \"{eng['retentionStrategy']}\"")
    
    # 3. Hybrid Recommendations & XAI
    print(f"\n[4/4] Generating Top {top_n} Personalized Recommendations with XAI...")
    content_engine = ContentEngine(loader).fit()
    collab_engine = CollaborativeEngine(loader).fit()
    hybrid_engine = HybridEngine(loader, content_engine, collab_engine)
    explainer = Explainer(loader, content_engine, collab_engine)
    
    watchlist = hybrid_engine.recommend(user_id, top_n=top_n)
    
    print("\n" + "-" * 75)
    print(f"  PERSONALIZED WATCHLIST FOR USER #{user_id} (TOP {top_n})")
    print("-" * 75)
    
    for rank, item in enumerate(watchlist, 1):
        m_id = item['movieId']
        xai = explainer.explain_recommendation(user_id, m_id, candidate_info=item)
        
        print(f"\n  #{rank}. {item['title']} ({item['year']})")
        print(f"      Match Score:      {item['matchPercentage']}% | Predicted: {item['predictedRating']} stars")
        print(f"      Genres:           {', '.join(item['genres'][:3])}")
        print(f"      Feature Tags:     {xai['tags']}")
        print(f"      Why Recommended:  \"{xai['text']}\"")
        print(f"      Score Breakdown:  Collab: {item['collabScore']} | Content: {item['contentScore']} | Hybrid: {item['hybridScore']}")
        
    print("\n" + "=" * 75)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Inspect recommendation profile for a specific user.")
    parser.add_argument('--user', type=int, default=42, help="User ID to inspect (e.g. 42, 1, 15, 84, 548)")
    parser.add_argument('--top', type=int, default=5, help="Number of recommendations to display (default: 5)")
    args = parser.parse_args()
    
    inspect_user(args.user, args.top)
