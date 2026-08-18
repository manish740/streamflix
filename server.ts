import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MOCK_MEDIA, MOCK_GENRES, MOCK_PROFILES } from './src/data/mockData';
import { MediaItem, ViewingProgress, WatchHistoryItem, UserRating } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory persistent database stores (synchronized with REST requests)
  let watchlistStore: string[] = ['m1', 'tv1', 'm2', 'tv4'];
  let historyStore: WatchHistoryItem[] = [
    {
      id: 'hist-1',
      mediaId: 'm1',
      media: MOCK_MEDIA.find(m => m.id === 'm1')!,
      watchedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      progressPercent: 42
    },
    {
      id: 'hist-2',
      mediaId: 'tv1',
      media: MOCK_MEDIA.find(m => m.id === 'tv1')!,
      episodeId: 'ep101',
      episodeTitle: 'Signal in the Static',
      watchedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      progressPercent: 78
    }
  ];

  let progressStore: Record<string, ViewingProgress> = {
    'm1': {
      mediaId: 'm1',
      mediaType: 'movie',
      currentTime: 3580,
      duration: 8520,
      percent: 42,
      updatedAt: new Date().toISOString()
    },
    'tv1': {
      mediaId: 'tv1',
      mediaType: 'tv',
      episodeId: 'ep101',
      seasonNumber: 1,
      episodeNumber: 1,
      currentTime: 2520,
      duration: 3240,
      percent: 78,
      updatedAt: new Date().toISOString()
    }
  };

  let ratingsStore: Record<string, UserRating> = {
    'm1': { mediaId: 'm1', score: 'loved', updatedAt: new Date().toISOString() },
    'tv1': { mediaId: 'tv1', score: 'liked', updatedAt: new Date().toISOString() }
  };

  // 1. Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'StreamFlix API', version: '2.0.0' });
  });

  // 2. Movies & TV Shows
  app.get('/api/media', (req: Request, res: Response) => {
    const { type, genre, featured, limit } = req.query;
    let results = [...MOCK_MEDIA];

    if (type && typeof type === 'string' && type !== 'all') {
      results = results.filter(item => item.type === type);
    }

    if (genre && typeof genre === 'string' && genre !== 'All') {
      results = results.filter(item => item.genres.some(g => g.toLowerCase().includes(genre.toLowerCase())));
    }

    if (featured === 'true') {
      results = results.filter(item => item.featured);
    }

    if (limit && typeof limit === 'string') {
      results = results.slice(0, parseInt(limit, 10));
    }

    res.json({ success: true, count: results.length, data: results });
  });

  app.get('/api/movies', (req: Request, res: Response) => {
    const movies = MOCK_MEDIA.filter(m => m.type === 'movie');
    res.json({ success: true, count: movies.length, data: movies });
  });

  app.get('/api/tv-shows', (req: Request, res: Response) => {
    const tvShows = MOCK_MEDIA.filter(m => m.type === 'tv');
    res.json({ success: true, count: tvShows.length, data: tvShows });
  });

  app.get('/api/media/:id', (req: Request, res: Response) => {
    const item = MOCK_MEDIA.find(m => m.id === req.params.id || m.slug === req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }
    const similar = (item.similarIds || [])
      .map(id => MOCK_MEDIA.find(m => m.id === id))
      .filter((m): m is MediaItem => Boolean(m));

    res.json({ success: true, data: { ...item, similar } });
  });

  // 3. Genres
  app.get('/api/genres', (req: Request, res: Response) => {
    res.json({ success: true, data: MOCK_GENRES });
  });

  // 4. Search
  app.get('/api/search', (req: Request, res: Response) => {
    const { q, genre, type, sort } = req.query;
    const query = typeof q === 'string' ? q.trim().toLowerCase() : '';

    let results = [...MOCK_MEDIA];

    if (query) {
      results = results.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const synopsisMatch = item.synopsis.toLowerCase().includes(query);
        const castMatch = item.cast.some(c => c.toLowerCase().includes(query));
        const directorMatch = (item.director || item.creator || '').toLowerCase().includes(query);
        const genreMatch = item.genres.some(g => g.toLowerCase().includes(query));
        const tagMatch = item.tags.some(t => t.toLowerCase().includes(query));
        return titleMatch || synopsisMatch || castMatch || directorMatch || genreMatch || tagMatch;
      });
    }

    if (type && typeof type === 'string' && type !== 'all') {
      results = results.filter(item => item.type === type);
    }

    if (genre && typeof genre === 'string' && genre !== 'All') {
      results = results.filter(item => item.genres.includes(genre));
    }

    if (sort === 'year') {
      results.sort((a, b) => b.releaseYear - a.releaseYear);
    } else if (sort === 'rating') {
      results.sort((a, b) => b.ratingScore - a.ratingScore);
    } else if (sort === 'title') {
      results.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: match percentage
      results.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    res.json({ success: true, query, total: results.length, data: results });
  });

  // 5. Watchlist
  app.get('/api/watchlist', (req: Request, res: Response) => {
    const list = watchlistStore
      .map(id => MOCK_MEDIA.find(m => m.id === id))
      .filter((m): m is MediaItem => Boolean(m));
    res.json({ success: true, ids: watchlistStore, data: list });
  });

  app.post('/api/watchlist', (req: Request, res: Response) => {
    const { mediaId } = req.body;
    if (!mediaId) {
      return res.status(400).json({ success: false, error: 'mediaId is required' });
    }
    if (!watchlistStore.includes(mediaId)) {
      watchlistStore.push(mediaId);
    }
    res.json({ success: true, message: 'Added to Watchlist', watchlist: watchlistStore });
  });

  app.delete('/api/watchlist/:id', (req: Request, res: Response) => {
    const mediaId = req.params.id;
    watchlistStore = watchlistStore.filter(id => id !== mediaId);
    res.json({ success: true, message: 'Removed from Watchlist', watchlist: watchlistStore });
  });

  // 6. Viewing Progress
  app.get('/api/progress', (req: Request, res: Response) => {
    res.json({ success: true, data: progressStore });
  });

  app.post('/api/progress', (req: Request, res: Response) => {
    const { mediaId, mediaType, episodeId, currentTime, duration, percent } = req.body;
    if (!mediaId || typeof currentTime !== 'number' || typeof duration !== 'number') {
      return res.status(400).json({ success: false, error: 'Invalid progress payload' });
    }

    const calculatedPercent = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : percent || 0;

    const progress: ViewingProgress = {
      mediaId,
      mediaType: mediaType || 'movie',
      episodeId,
      currentTime,
      duration,
      percent: calculatedPercent,
      updatedAt: new Date().toISOString()
    };

    progressStore[mediaId] = progress;

    // Also update history
    const mediaItem = MOCK_MEDIA.find(m => m.id === mediaId);
    if (mediaItem) {
      const existingIdx = historyStore.findIndex(h => h.mediaId === mediaId);
      const histItem: WatchHistoryItem = {
        id: `hist-${Date.now()}`,
        mediaId,
        media: mediaItem,
        episodeId,
        watchedAt: new Date().toISOString(),
        progressPercent: calculatedPercent
      };

      if (existingIdx >= 0) {
        historyStore[existingIdx] = histItem;
      } else {
        historyStore.unshift(histItem);
      }
    }

    res.json({ success: true, progress });
  });

  // 7. Watch History
  app.get('/api/history', (req: Request, res: Response) => {
    res.json({ success: true, data: historyStore });
  });

  app.delete('/api/history', (req: Request, res: Response) => {
    historyStore = [];
    res.json({ success: true, message: 'Watch history cleared' });
  });

  // 8. User Ratings
  app.get('/api/ratings', (req: Request, res: Response) => {
    res.json({ success: true, data: ratingsStore });
  });

  app.post('/api/ratings', (req: Request, res: Response) => {
    const { mediaId, score, review } = req.body;
    if (!mediaId || !score) {
      return res.status(400).json({ success: false, error: 'mediaId and score are required' });
    }
    ratingsStore[mediaId] = {
      mediaId,
      score,
      review,
      updatedAt: new Date().toISOString()
    };
    res.json({ success: true, rating: ratingsStore[mediaId] });
  });

  // 9. Auth & User Profile Demo
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    // Mock robust token login
    const user = {
      id: 'u-1',
      email: email || 'alex.streamer@streamflix.io',
      name: 'Alex Sterling',
      avatar: MOCK_PROFILES[0].avatar,
      role: 'user',
      profiles: MOCK_PROFILES,
      activeProfileId: 'p1'
    };
    res.json({ success: true, token: 'mock-jwt-streamflix-session', user });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = {
      id: 'u-1',
      email: 'alex.streamer@streamflix.io',
      name: 'Alex Sterling',
      avatar: MOCK_PROFILES[0].avatar,
      role: 'user',
      profiles: MOCK_PROFILES,
      activeProfileId: 'p1'
    };
    res.json({ success: true, user });
  });

  // 10. YouTube Search Proxy Endpoint
  app.get('/api/youtube/search', async (req: Request, res: Response) => {
    const { q, pageToken, maxResults = '50' } = req.query;
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ success: false, error: 'Query parameter q is required' });
    }

    if (!apiKey) {
      return res.json({ success: false, fallback: true, message: 'No API key configured on server' });
    }

    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${encodeURIComponent(
        String(maxResults)
      )}&q=${encodeURIComponent(q)}${pageToken ? `&pageToken=${encodeURIComponent(String(pageToken))}` : ''}&key=${apiKey}`;

      const ytRes = await fetch(searchUrl);
      if (!ytRes.ok) {
        return res.status(ytRes.status).json({ success: false, error: 'YouTube API request failed' });
      }

      const data: any = await ytRes.json();
      const videoIds = (data.items || [])
        .map((i: any) => i.id?.videoId)
        .filter(Boolean)
        .join(',');

      if (videoIds) {
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
        const detailsRes = await fetch(detailsUrl);
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          return res.json({
            success: true,
            items: detailsData.items || [],
            nextPageToken: data.nextPageToken,
            prevPageToken: data.prevPageToken,
            pageInfo: data.pageInfo
          });
        }
      }

      return res.json({
        success: true,
        items: data.items || [],
        nextPageToken: data.nextPageToken,
        prevPageToken: data.prevPageToken,
        pageInfo: data.pageInfo
      });
    } catch (err: any) {
      console.error('Server YouTube search error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development & static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 StreamFlix Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
