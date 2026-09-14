#FIXME:Model 1 is our Collaborative Filtering engine located in collaborative_engine.py. It uses Truncated SVD from the Python surprise library to decompose the user-item matrix into latent taste factors.
# It learns from peer viewing behavior to accurately predict what rating any subscriber will give to any movie, achieving an RMSE under 0.90
import numpy as np
from surprise import SVD
from surprise.model_selection import cross_validate
from config import SVD_N_FACTORS, SVD_N_EPOCHS, SVD_LR_ALL, SVD_REG_ALL

class CollaborativeEngine:
    #TODO:Uses the battle-tested Python library surprise (the industry-standard library for collaborative filtering).
    def __init__(self, data_loader):
        self.data_loader = data_loader
        self.model = SVD(
            n_factors=SVD_N_FACTORS,  # Hidden taste dimensions (latent factors)
            n_epochs=SVD_N_EPOCHS,    # How many times it studies the data (20 epochs)
            lr_all=0.005,             # Learning rate (how fast it learns)
            reg_all=0.02,             # Regularization (stops it from memorizing noise)
            random_state=42
        )
        self.trainset = None
        self.is_fitted = False
        self.eval_metrics = {}
        
    #TODO:Loads up to 250,000 real user ratings and mathematically factorizes the user-item matrix so the model learns everyone's hidden taste patterns.
    def fit(self, max_ratings=250000):
        """
        Trains the SVD matrix factorization model.
        Uses max_ratings limit for high training speed while keeping statistical power.
        """
        if self.data_loader.surprise_data is None:
            self.data_loader.load_ratings(sample_size=max_ratings)
            
        print("Building full trainset for Collaborative Filtering (SVD)...")
        self.trainset = self.data_loader.surprise_data.build_full_trainset()
        
        print(f"Training SVD model (n_factors={SVD_N_FACTORS}, epochs={SVD_N_EPOCHS})...")
        self.model.fit(self.trainset)
        self.is_fitted = True
        print("Collaborative Engine (SVD) fitted successfully!")
        return self
    #TODO:Uses Cross-Validation to test the model on unseen ratings and calculates the RMSE (Root Mean Squared Error) that appears on the Pink Card (0.8987).
    def evaluate(self, cv=3):
        """Performs cross-validation to assess RMSE and MAE benchmarks."""
        if self.data_loader.surprise_data is None:
            raise RuntimeError("Ratings not loaded. Call fit() first.")
            
        print(f"Running {cv}-Fold Cross-Validation for SVD...")
        results = cross_validate(
            self.model, 
            self.data_loader.surprise_data, 
            measures=['RMSE', 'MAE'], 
            cv=cv, 
            verbose=False
        )
        rmse_mean = float(np.mean(results['test_rmse']))
        mae_mean = float(np.mean(results['test_mae']))
        self.eval_metrics = {
            'rmse': rmse_mean,
            'mae': mae_mean
        }
        print(f"Evaluation Results -> RMSE: {rmse_mean:.4f} | MAE: {mae_mean:.4f}")
        return self.eval_metrics
    #TODO:Predicts the expected rating for a given user and movie, which is then normalized to a [0.0, 1.0] scale for blending with content-based similarity scores.    
    def predict_rating(self, user_id, movie_id):
        """Predicts expected rating for (user_id, movie_id) on [0.5, 5.0] scale."""
        if not self.is_fitted:
            raise RuntimeError("CollaborativeEngine is not fitted yet. Call fit() first.")
            
        pred = self.model.predict(uid=user_id, iid=movie_id)
        return float(pred.est)
    #TODO:get_normalized_score() converts that 1.0–5.0 star prediction into a clean percentage (0.0 to 1.0) so it can easily blend with Model 2 (TF-IDF Content similarity)!
    def get_normalized_score(self, user_id, movie_id):
        """
        Normalizes predicted rating from [1.0, 5.0] to [0.0, 1.0]
        for direct blending with content similarity.
        """
        raw_pred = self.predict_rating(user_id, movie_id)
        clipped = max(1.0, min(5.0, raw_pred))
        normalized = (clipped - 1.0) / 4.0
        return float(normalized)
