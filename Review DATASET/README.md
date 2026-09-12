# Review DATASET

This directory is designated for datasets containing movie/series reviews, user ratings, and feedback metadata for **Use Case 6 – OTT Recommendation and Engagement Agent**.

---

## 📂 Guidelines for Adding Datasets

When adding your dataset:
1. **Supported Formats:** .csv, .json, .tsv, or .parquet.
2. **Naming Convention:** Keep dataset filenames descriptive (e.g., imdb_user_reviews_sampled.csv, otten_tomatoes_critic_audience.json).
3. **Large Files:** If your dataset exceeds **50 MB**, please compress it (.zip / .gz) or consider sharing a sampled version, as GitHub has a 100 MB hard limit per file.

---

## 🚀 How Team Members Can Add Their Datasets

1. **Pull the latest main branch:**
   `ash
   git checkout main
   git pull origin main
   `

2. **Create and switch to a new branch:**
   `ash
   git checkout -b add-dataset-<your-name>
   # Example: git checkout -b add-dataset-narendra
   `

3. **Copy your dataset file(s) into this folder (Review DATASET/).**

4. **Stage, commit, and push your branch:**
   `ash
   git add "Review DATASET"
   git commit -m "feat: add review dataset from <source>"
   git push origin add-dataset-<your-name>
   `

5. **Open a Pull Request (PR) on GitHub:**
   - Go to https://github.com/CHETHCODEX/CineWatch
   - Click **Compare & pull request** and merge into main.
