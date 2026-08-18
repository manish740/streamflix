# 🎬 StreamFlix — Modern Streaming Platform Clone

**StreamFlix** is a production-grade, responsive streaming web platform inspired by modern entertainment hubs. Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and an **Express REST backend**, with a complete **Prisma PostgreSQL schema** for scalable production deployments.

---

## 🌟 Key Features

### 1. 🎞️ Cinematic Landing & Browse Experience
- **Dynamic Hero Banner**: Full-width cinematic backdrop with auto-playing video trailer loops, sound toggle, title typography, match percentage, age advisory pills, and 4K UHD badges.
- **Categorized Content Rows**: Smooth horizontally scrollable carousels for *Trending Now*, *Top 10 Today (custom numbered layout)*, *Continue Watching*, *Popular TV Shows*, *Blockbuster Movies*, *Sci-Fi*, *Action*, *Award-Winning Dramas*, *Anime*, and *Docuseries*.
- **Interactive Card Hover Expansion**: Real-time video snippet preview on hover, quick action buttons (Play, Add/Remove My List, Like/Love rating, Detail Modal trigger), and dynamic progress bars.

### 2. 📺 Full-Screen Custom Video Player
- **Netflix-Style Overlay**: Header with title, episode metadata, and back button.
- **Precision Scrubbing**: Smooth seeking with live timestamp hover preview.
- **Playback Controls**: 10s skip backward / 10s fast-forward, spacebar toggle, mute/unmute slider, playback speed selector (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x).
- **Subtitles & Audio Track Switcher**: Multi-language audio and simulated subtitle overlay rendering.
- **Next Episode Auto-Countdown**: Countdown banner at the end of episodes with 1-click "Watch Now" action.
- **Persistent Progress Sync**: Automatically records and resumes playback position per user profile.

### 3. 🔍 Real-Time Search & Smart Filtering
- Live debounced search across title, synopsis, actors, directors, genres, and mood tags.
- Filter chips by type (*All*, *Movies*, *TV Shows*) and genres (*Sci-Fi*, *Action*, *Thriller*, *Drama*, *Anime*, *Docuseries*).
- Multi-criteria sorting (*Recommended Match %*, *Critic Rating*, *Release Year*, *Title A-Z*).

### 4. 📑 Watchlist & Viewing History
- **My List**: Instant add/remove with toast alerts and filter tabs.
- **Viewing History**: Resume timestamps, completion percentages, and 1-click "Clear History".

### 5. 👥 Profiles & Authentication
- Multi-profile selector (*Alex*, *Kids Club*, *Cinema Buff*, *Sci-Fi Fanatic*).
- **Kids Mode**: Automatic content filtering to display only age-appropriate titles (TV-G / PG).
- 1-Click **Portfolio Demo Login** and sign-up flows with local storage and REST sync.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide React
- **Backend / REST API**: Node.js, Express, tsx (with Vite development middleware)
- **Database & ORM**: PostgreSQL with Prisma Schema (`/prisma/schema.prisma`)
- **Video Streams**: Open-source public video streams and royalty-free cinematic trailers (Blender Foundation, Big Buck Bunny, Tears of Steel, Sintel, Cosmos Laundromat)

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn or pnpm

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/streamflix.git
cd streamflix
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🗄️ Database Setup (Prisma + PostgreSQL)

The repository includes a complete Prisma schema in `prisma/schema.prisma` with models for:
- `User` and `UserProfile`
- `Movie` and `TVShow`
- `Season` and `Episode`
- `Genre`
- `Watchlist`
- `ViewingProgress`
- `WatchHistory`
- `Rating`

### To connect a live PostgreSQL database:
1. Set `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/streamflix?schema=public"
   ```
2. Generate Prisma client & apply migrations:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/movies` | List all available movies |
| `GET` | `/api/tv-shows` | List all TV series with seasons & episodes |
| `GET` | `/api/media/:id` | Get details and similar recommendations for a title |
| `GET` | `/api/genres` | List supported catalog genres |
| `GET` | `/api/search?q=...` | Search catalog with filters & sorting |
| `GET` | `/api/watchlist` | Get current user watchlist |
| `POST` | `/api/watchlist` | Add title to watchlist |
| `DELETE` | `/api/watchlist/:id` | Remove title from watchlist |
| `GET` | `/api/progress` | Get viewing progress for all media |
| `POST` | `/api/progress` | Record playback timestamp and percent |
| `GET` | `/api/history` | Get user viewing history |
| `DELETE` | `/api/history` | Clear user viewing history |
| `POST` | `/api/ratings` | Rate a title (loved / liked / disliked) |
| `POST` | `/api/auth/login` | Authenticate user session |

---

## 🚢 Deployment Guide

### Deploying to Vercel
1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Set Framework Preset to **Vite** or **Next.js**.
4. Configure Build Command: `npm run build` and Output Directory: `dist`.

### Deploying to Docker / Cloud Run
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📄 License & Attribution
- All media assets, descriptions, and video URLs are open-source samples or licensed under Creative Commons. No proprietary or copyrighted trademarks are used.
