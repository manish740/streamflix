import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_MEDIA, MOCK_PROFILES } from '../data/mockData';
import {
  ShieldCheck,
  Film,
  Tv,
  Users,
  Eye,
  Activity,
  Server,
  Database,
  Search,
  Plus,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, toggleAdminRole } = useAuth();
  const [searchFilter, setSearchFilter] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const filteredMedia = MOCK_MEDIA.filter(item => {
    const matchSearch =
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.genres.some(g => g.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchType = filterType === 'all' || item.type === filterType;
    return matchSearch && matchType;
  });

  const moviesCount = MOCK_MEDIA.filter(m => m.type === 'movie').length;
  const tvCount = MOCK_MEDIA.filter(m => m.type === 'tv').length;

  return (
    <div className="pt-24 sm:pt-28 pb-16 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto space-y-8 text-white font-sans">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800 text-[#E50914] flex items-center justify-center font-bold text-xl shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">StreamFlix Admin Operations</h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Manage content catalogs, monitor streaming health, and inspect accounts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleAdminRole}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300"
          >
            Toggle Role (Current: Admin)
          </button>
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-xs font-bold text-white shadow-md flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-zinc-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Total Catalog Titles</span>
            <Film className="w-4 h-4 text-[#E50914]" />
          </div>
          <p className="text-2xl font-bold text-white">{MOCK_MEDIA.length}</p>
          <p className="text-[11px] text-zinc-500">
            {moviesCount} Movies • {tvCount} TV Shows
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-zinc-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Active Profiles</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{user?.profiles.length || MOCK_PROFILES.length}</p>
          <p className="text-[11px] text-green-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Multi-profile enabled
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-zinc-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Edge CDN Health</span>
            <Server className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">99.99%</p>
          <p className="text-[11px] text-zinc-500">Global latency &lt; 18ms</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-zinc-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">REST API Server</span>
            <Activity className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">Online (v2.0)</p>
          <p className="text-[11px] text-zinc-500">Express + Vite Engine</p>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-[#0c0c0c] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Media Catalog Inventory</h2>
            <p className="text-xs text-zinc-400">Review metadata, resolutions, and maturity ratings</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-white/50 absolute left-3 top-2.5 stroke-[1.75]" />
              <input
                type="text"
                placeholder="Search titles or genres..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="search-glass-container rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/50 focus:border-white/30 focus:outline-none"
              />
            </div>

            {/* Type filters */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-semibold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded ${filterType === 'all' ? 'bg-[#E50914] text-white' : 'text-zinc-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('movie')}
                className={`px-2.5 py-1 rounded ${filterType === 'movie' ? 'bg-[#E50914] text-white' : 'text-zinc-400'}`}
              >
                Movies
              </button>
              <button
                onClick={() => setFilterType('tv')}
                className={`px-2.5 py-1 rounded ${filterType === 'tv' ? 'bg-[#E50914] text-white' : 'text-zinc-400'}`}
              >
                TV
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[11px]">
                <th className="py-3 px-3">Title</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Year</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">Quality</th>
                <th className="py-3 px-3">Genres</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredMedia.map(item => (
                <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-3">
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-8 h-12 rounded object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span>{item.title}</span>
                      {item.featured && (
                        <span className="block text-[10px] text-[#E50914] font-bold uppercase">
                          Featured Hero
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 capitalize text-zinc-300">
                    {item.type === 'movie' ? 'Movie' : 'TV Show'}
                  </td>
                  <td className="py-3 px-3 text-zinc-400">{item.releaseYear}</td>
                  <td className="py-3 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">
                      {item.maturityRating}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#E50914] font-semibold">{item.quality}</td>
                  <td className="py-3 px-3 text-zinc-400 truncate max-w-[180px]">
                    {item.genres.join(', ')}
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <Link
                      to={`/content/${item.id}`}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-semibold"
                    >
                      View
                    </Link>
                    <Link
                      to={`/watch/${item.id}`}
                      className="px-2.5 py-1 rounded bg-[#E50914] hover:bg-[#b80710] text-white font-bold"
                    >
                      Play
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
