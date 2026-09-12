## 🎬 CineMatch (CineWatch AI) — Low-Level Design (LLD)

### Role: **Member 1 — Lead Frontend / UI-UX**

**Scope (from HLD):**

- Base CineMatch UI: Next.js layout, 3D Hero Carousel, Expand Cards, Search Overlay, Dark-mode theme
- Hackathon scope UI: `/hackathon` dashboard, Persona switcher, Watchlist UI

---

# 1) Frontend Architecture (Module-Level)

## 1.1 Tech Stack (Frontend)

- Next.js 16 (App Router)
- React 19 + TypeScript
- TailwindCSS v4
- Framer Motion
- Lucide Icons

## 1.2 Layered Structure (LLD)

1. **Presentation Layer (UI Components)**
    - Buttons, cards, dialogs/drawers, overlays, skeletons
2. **Feature Layer (Screens + Feature Modules)**
    - `home` (carousel, moods, search overlay)
    - `hackathon` (persona switcher + watchlist UI)
3. **State & Data Layer**
    - UI state + selected persona
    - Fetching via `fetch()` from Next API routes: `/api/movies/*`, `/api/hackathon/recommend`
4. **Styling & Theming Layer**
    - Tailwind tokens + dark mode + persisted preference

---

# 2) Routes / Pages (App Router)

## 2.1 Route Map

### `/` (Homepage)

**Purpose:** Production discovery UI.

**Primary components:**

- `HeroCarousel3D`
- `MoodSelector`
- `SearchOverlay`
- `MovieExpandCard` / `MoviePreviewModal`
- `ThemeToggle`

### `/hackathon` (Hackathon Dashboard)

**Purpose:** Demo UI to showcase cached recommender output.

**Primary components:**

- `PersonaSwitcher`
- `PersonaSummaryPanel`
- `WatchlistGrid`
- `RecommendationCard`
- `WhyPickedDrawer`

---

# 3) Data Contracts (Frontend DTOs)

## 3.1 Common Movie Shape (UI Model)

```tsx
export type UIMovie = {
  movieId: number;
  title: string;
  year?: number;
  genres?: string[];
  posterPath?: string;
};
```

## 3.2 `/api/hackathon/recommend` Response (Consumed by `/hackathon`)

```tsx
export type RecommendationExplanation = {
  text: string;
  tags: string[];
  collabScore: number;
  contentScore: number;
  hybridScore: number;
};

export type WatchlistItem = UIMovie & {
  predictedRating: number;
  matchPercentage: number;
  explanation: RecommendationExplanation;
};

export type HackathonUserMeta = {
  userId: number;
  persona: string;
  engagement: {
    score: number;
    cohort: string;
    churnRisk: string;
    totalRatings: number;
    meanRating: number;
    genreDiversity: number;
    retentionStrategy: string;
  };
};

export type HackathonRecommendResponse = {
  user: HackathonUserMeta;
  watchlist: WatchlistItem[];
  datasetStats?: {
    totalMovies: number;
    totalRatings: number;
    svdRMSE: number;
    genresCount: number;
  };
};
```

---

# 4) Component Design (LLD)

## 4.1 Global Layout & Theme

### 4.1.1 `RootLayout`

**Responsibilities**

- Global styles / fonts
- Theme class injection
- App-level providers (if any)

### 4.1.2 Theme System

- Tailwind dark mode via `class` strategy
- Persisted preference key: `cinematch.theme`

```tsx
type ThemeMode = "light" | "dark" | "system";

function getInitialTheme(): ThemeMode;
function applyTheme(mode: ThemeMode): void;
```

**Edge cases**

- SSR-safe theme init (no `window` usage on server)
- Avoid flicker (`suppressHydrationWarning` / inline init script if needed)

---

## 4.2 Homepage Components

### 4.2.1 `HeroCarousel3D`

**Props**

```tsx
type HeroCarousel3DProps = {
  items: UIMovie[];
  onSelect: (movie: UIMovie) => void;
};
```

**State**

- `activeIndex`, `isDragging`, `autoplayEnabled`

**Behavior**

- Keyboard left/right
- Drag/swipe
- Optional autoplay (pause on hover)

### 4.2.2 `MovieExpandCard` (Expand Cards)

**Props**

```tsx
type MovieExpandCardProps = {
  movie: UIMovie;
  open: boolean;
  onClose: () => void;
  overview?: string;
  cast?: string[];
};
```

**Accessibility**

- Focus trap, ESC close, `role="dialog"`

### 4.2.3 `SearchOverlay`

**Props**

```tsx
type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
  onPickMovie: (movie: UIMovie) => void;
};
```

**Data flow**

- Debounced query (250–400ms)
- Calls `/api/movies/search?q=...`

---

## 4.3 Hackathon Dashboard Components

### 4.3.1 `PersonaSwitcher`

```tsx
type PersonaSwitcherProps = {
  personas: Array<{ userId: number; label: string }>;
  selectedUserId: number;
  onChange: (userId: number) => void;
};
```

### 4.3.2 `PersonaSummaryPanel`

```tsx
type PersonaSummaryPanelProps = {
  user: HackathonUserMeta;
  datasetStats?: HackathonRecommendResponse["datasetStats"];
};
```

### 4.3.3 `WatchlistGrid`

```tsx
type WatchlistGridProps = {
  items: WatchlistItem[];
  onWhyPicked: (item: WatchlistItem) => void;
  onOpenMovie: (item: WatchlistItem) => void;
};
```

### 4.3.4 `WhyPickedDrawer`

```tsx
type WhyPickedDrawerProps = {
  open: boolean;
  item: WatchlistItem | null;
  onClose: () => void;
};
```

---

# 5) State Management

## 5.1 Hook: `useHackathonRecommendations(userId)`

```tsx
type UseHackathonRecommendationsState = {
  data: HackathonRecommendResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

function useHackathonRecommendations(userId: number): UseHackathonRecommendationsState;
```

**Caching suggestion**

- Memo cache per `userId` to make persona switching feel instant

---

# 6) Error Handling & UX Rules

- Skeletons for loading
- Inline retry on error
- Empty-state messaging when no data

---

# 7) Performance & Non-Functional Requirements

- Transform-based animations (GPU friendly)
- Poster lazy loading; placeholder for missing posters

---

# 8) Accessibility

- Keyboard navigable overlay/drawer
- Focus return to trigger
- Sufficient contrast in dark mode

---

# 9) Test Plan (Frontend)

## Unit

- PersonaSwitcher change
- hook success/error/loading
- WhyPickedDrawer rendering

## E2E

- Load `/hackathon` → switch persona → open “Why Picked?” drawer

---

# 10) Deliverables Checklist (Member 1)

1. `/` UI: 3D carousel, expand card, search overlay, dark mode
2. `/hackathon` UI: persona switcher, watchlist grid, XAI drawer
3. Polished UX: skeletons, empty/error states, responsive layout
4. Tests for critical demo paths