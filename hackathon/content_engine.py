'''
Member #4 (ML Engineer — Content Systems)
Teach the computer to understand movie similarities using Natural Language Processing (NLP).

Step A — TF-IDF Vectorization:
 Computers cannot read English sentences directly.
 Member 4 used TF-IDF (Term Frequency-Inverse Document Frequency) to convert each movie's "Feature Bag" text into a row of 10,000 numbers (like a unique mathematical fingerprint).
 If two movies both mention "space", "lightsaber", and "galaxy", their number fingerprints will be very close together!
 
 Step B — Cosine Similarity Matrix:
Member 4 compared every single movie fingerprint against every other movie fingerprint (4,760×4,760).
This gives a similarity score between 0.0 (completely different) and 1.0 (identical) for every movie pair.

The Result: When we asked for movies similar to Star Wars (1977), the engine instantly and accurately returned:
The Empire Strikes Back (40.8% match)
Return of the Jedi (29.1% match)
Star Wars: Clone Wars (26.5% match)
The Phantom Menace (25.2% match)
Revenge of the Sith (23.9% match) (Zero human hints — purely discovered by the ML algorithm reading text!)

'''

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from config import TFIDF_MAX_FEATURES, TFIDF_STOP_WORDS

class ContentEngine:
    def __init__(self, data_loader):
        self.data_loader = data_loader
        self.vectorizer = TfidfVectorizer(
            max_features=TFIDF_MAX_FEATURES, 
            stop_words=TFIDF_STOP_WORDS,
            ngram_range=(1, 2)
        )
        self.tfidf_matrix = None
        self.similarity_matrix = None
        self.is_fitted = False
        
    def fit(self):
        """Fits TF-IDF vectorizer and computes pairwise cosine similarity."""
        if self.data_loader.movies_df is None:
            self.data_loader.load_movies()
            
        print("Fitting TF-IDF Vectorizer on movie feature bags...")
        feature_bags = self.data_loader.movies_df['Feature_Bag'].tolist()
        self.tfidf_matrix = self.vectorizer.fit_transform(feature_bags)
        print(f"TF-IDF Matrix shape: {self.tfidf_matrix.shape}")
        
        print("Computing Cosine Similarity Matrix (4,760 x 4,760)...")
        self.similarity_matrix = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)
        self.is_fitted = True
        print("Content Engine fitted successfully!")
        return self
        
    def get_content_recommendations(self, movie_id, top_n=10):
        """
        Returns top_n movie recommendations similar to movie_id based on metadata.
        Returns list of tuples: [(recommended_movie_id, similarity_score), ...]
        """
        if not self.is_fitted:
            raise RuntimeError("ContentEngine is not fitted yet. Call fit() first.")
            
        if movie_id not in self.data_loader.movie_id_to_idx:
            return []
            
        idx = self.data_loader.movie_id_to_idx[movie_id]
        sim_scores = list(enumerate(self.similarity_matrix[idx]))
        
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = [item for item in sim_scores if item[0] != idx][:top_n]
        
        recommendations = []
        for match_idx, score in sim_scores:
            m_id = self.data_loader.idx_to_movie_id[match_idx]
            recommendations.append((m_id, float(score)))
            
        return recommendations

    def get_content_affinity(self, anchor_movie_ids, candidate_movie_id):
        """
        Calculates the maximum content similarity between a candidate movie
        and a user's favorite anchor movies.
        """
        if not self.is_fitted:
            raise RuntimeError("ContentEngine is not fitted yet. Call fit() first.")
            
        if candidate_movie_id not in self.data_loader.movie_id_to_idx:
            return 0.0
            
        cand_idx = self.data_loader.movie_id_to_idx[candidate_movie_id]
        max_sim = 0.0
        
        for anchor_id in anchor_movie_ids:
            if anchor_id in self.data_loader.movie_id_to_idx:
                anc_idx = self.data_loader.movie_id_to_idx[anchor_id]
                sim = self.similarity_matrix[cand_idx][anc_idx]
                if sim > max_sim:
                    max_sim = float(sim)
                    
        return max_sim
