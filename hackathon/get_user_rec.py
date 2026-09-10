import os
import sys
import json
import argparse
import io
import urllib.request
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data_loader import DataLoader
from content_engine import ContentEngine
from collaborative_engine import CollaborativeEngine
from hybrid_engine import HybridEngine
from explainer import Explainer
from engagement_scorer import EngagementScorer

# Cache movie titles to poster URLs so we only look them up once
POSTER_CACHE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache", "poster_url_cache.json")

def load_poster_cache():
    if os.path.exists(POSTER_CACHE_FILE):
        try:
            with open(POSTER_CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_poster_cache(cache):
    try:
        os.makedirs(os.path.dirname(POSTER_CACHE_FILE), exist_ok=True)
        with open(POSTER_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2)
    except:
        pass

poster_cache = load_poster_cache()

def fetch_real_movie_poster(title):
    clean = title.split('(')[0].replace(':', ' ').strip()
    for candidate in [title, clean, title.lower(), clean.lower()]:
        if candidate in poster_cache:
            return poster_cache[candidate]
        
    url = f"https://v3-cinemeta.strem.io/catalog/movie/top/search={urllib.parse.quote(clean)}.json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            metas = data.get('metas', [])
            if metas and metas[0].get('poster'):
                img = metas[0].get('poster')
                # Upgrade image quality if Amazon thumbnail
                if '@._V1_' in img:
                    img = img.split('@._V1_')[0] + '@._V1_SX500.jpg'
                poster_cache[title] = img
                poster_cache[clean.lower()] = img
                save_poster_cache(poster_cache)
                return img
    except Exception:
        pass
        
    return ''

def get_recommendation_payload(user_id):
    old_stdout = sys.stdout
    sys.stdout = io.StringIO()
    
    try:
        loader = DataLoader()
        loader.load_movies()
        loader.load_ratings(sample_size=100000)
        
        content_engine = ContentEngine(loader).fit()
        collab_engine = CollaborativeEngine(loader).fit()
        hybrid_engine = HybridEngine(loader, content_engine, collab_engine)
        explainer = Explainer(loader, content_engine, collab_engine)
        engagement_scorer = EngagementScorer(loader)
        
        eng_data = engagement_scorer.calculate_user_engagement(user_id)
        raw_watchlist = hybrid_engine.recommend(user_id, top_n=12)
        
        persona_title = f"Custom User #{user_id}"
        if eng_data['cohort'] == 'Power Viewer':
            persona_title = f"User #{user_id} (VIP Power Viewer)"
        elif eng_data['cohort'] == 'Core Active':
            persona_title = f"User #{user_id} (Active Subscriber)"
        elif eng_data['cohort'] == 'Casual Viewer':
            persona_title = f"User #{user_id} (Casual Streamer)"
        else:
            persona_title = f"User #{user_id} (At-Risk User)"
            
        enriched_watchlist = []
        for rank, item in enumerate(raw_watchlist, 1):
            m_id = item['movieId']
            explanation = explainer.explain_recommendation(user_id, m_id, candidate_info=item)
            real_poster = fetch_real_movie_poster(item['title'])
            
            enriched_watchlist.append({
                'rank': rank,
                'movieId': m_id,
                'title': item['title'],
                'year': item['year'],
                'genres': item['genres'],
                'director': item['director'],
                'cast': item['cast'],
                'predictedRating': item['predictedRating'],
                'matchPercentage': item['matchPercentage'],
                'posterPath': real_poster,
                'explanation': {
                    'text': explanation['text'],
                    'tags': explanation['tags'],
                    'peerAgreementPct': explanation['peerAgreementPct'],
                    'collabScore': round(explanation['collabScore'], 3),
                    'contentScore': round(explanation['contentScore'], 3),
                    'hybridScore': round(explanation['hybridScore'], 3)
                }
            })
            
        result = {
            'user': {
                'userId': user_id,
                'persona': persona_title,
                'description': f"Dynamic subscriber profile calculated in real time from MovieLens ratings.",
                'engagement': eng_data
            },
            'watchlist': enriched_watchlist
        }
    finally:
        sys.stdout = old_stdout
        
    return result

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--user', type=int, required=True)
    args = parser.parse_args()
    
    payload = get_recommendation_payload(args.user)
    print("__JSON_START__" + json.dumps(payload) + "__JSON_END__")
