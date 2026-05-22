<div align="center">

# 🎬 CineWatch AI — Next-Gen Movie Discovery

**A premium, responsive Next.js movie recommendation web app featuring 3D carousels, mood matching, co-watching, and instant caching.**

[![Next.js](https://img.shields.io/badge/Next.js-15%2F16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TMDB API](https://img.shields.io/badge/TMDB_API-v3-01b4e4?style=for-the-badge&logo=the-movie-database)](https://www.themoviedb.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 📖 About

**CineWatch AI** is a state-of-the-art movie discovery and recommendation platform. It combines raw cinematic aesthetics, 3D rotating carousels, mood-based AI recommendations, and interactive co-watching mechanics with a server-side caching layer. Powered by standard React Server Components and live TMDB integration, CineWatch AI serves smooth transitions, instant (0ms) subpage navigations, and responsiveness across all devices from standard laptops to viewports on mobile phones.

---

## 🖼️ Screenshots

### Landing Page & Trending 3D Gallery
![CineWatch AI Home Screen](./public/screenshots/hero-demo.webp)

### Cinematic Details & Trailer Section
![CineWatch AI Details Page](./public/screenshots/details-demo.webp)

---

## 🚀 Key Features

* **3D Circular Carousel:** A responsive, hardware-accelerated 3D rotating gallery built for trending movies. It dynamically scales its dimensions, translation radius, and visual cards down to mobile screen sizes without page clipping.
* **Mood-Based Recommender:** A custom, interactive selector that filters and displays movies tailored to your precise mood (e.g. *funny, adventurous, romantic, thrilled, mind-blown, or emotional*).
* **Co-Watch Movie Matcher:** An interactive, gaming-inspired swiper card interface specifically tailored to let friends, couples, or groups match movies together.
* **Cinematic Detail Views:** Immersive full-screen backdrop pages showcasing real-time ratings, release dates, genre tags, interactive casts, official embedded trailers, and relevant similar movies.
* **Custom Watchlist:** A persistent and reactive watchlist that allows users to seamlessly save or remove movies in real-time, built over a centralized React Context provider.
* **Instant Subpages (0ms Latency):** Equipped with custom, double-deduplicated caching rules that completely eliminate TMDB API network lags on movie detail page navigations.

---

## ⚡ Caching & Performance Optimizations

To deliver highly responsive page transitions, CineWatch AI implements a double-layered server caching strategy:

1. **Request-Level Deduplication (React `cache`):** Next.js splits page metadata generation (`generateMetadata`) and page component rendering (`MoviePage`) into distinct lifecycles. We wrap the movie data-fetching controller inside React's `cache` wrapper, ensuring a single Promise is shared across the request. This cuts live TMDB API network queries in half.
2. **Global Server-Side Caching:** An in-memory cache map inside our TMDB API client module preserves resolved requests for 10 minutes. Clicks on already visited or pre-rendered movies are loaded instantly from memory (0ms network delay).

---

## 💻 Tech Stack

* **Framework:** Next.js (App Router with Server & Client components)
* **Core:** React 19, TypeScript
* **Styling:** Tailwind CSS, Glassmorphic Vanilla CSS Variables
* **Icons & Animation:** Lucide Icons, Motion (f.k.a. Framer Motion)
* **Database / API:** Live The Movie Database (TMDB) REST API

---

## 🛠️ Getting Started

### Prerequisites

* Node.js (v18.0.0 or higher)
* A TMDB API Key (Create an account on [The Movie Database](https://www.themoviedb.org/) and navigate to Settings > API to generate a free key)

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/CineWatch-AI.git
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your TMDB API token:
   ```env
   TMDB_API_KEY=your_tmdb_api_key_here
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to experience CineWatch AI.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
