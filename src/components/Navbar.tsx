import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useMusic } from '../context/MusicContext';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  Bookmark,
  History,
  Sparkles,
  X,
  Menu,
  Film,
  Tv,
  Home,
  ShieldCheck,
  UserCheck,
  Music,
  Disc3,
  Radio
} from 'lucide-react';

interface NavbarProps {
  onOpenProfileModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfileModal }) => {
  const { user, activeProfile, isAuthenticated, isAdmin, logout, switchProfile } = useAuth();
  const { watchlist } = useWatchlist();
  const { isPlaying } = useMusic();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Sync search input with URL search param if on /search
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || '';
      setSearchQuery(q);
      if (q) setIsSearchOpen(true);
    }
  }, [location.pathname, location.search]);

  // Scroll listener for sticky navbar background transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside listener for dropdown menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchToggle = () => {
    setIsSearchOpen(prev => {
      const nextState = !prev;
      if (nextState) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        setSearchQuery('');
        if (location.pathname === '/search') {
          navigate('/');
        }
      }
      return nextState;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      navigate(`/search?q=${encodeURIComponent(val.trim())}`);
    } else if (location.pathname === '/search') {
      navigate('/search');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (location.pathname === '/search') {
      navigate('/');
    }
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { to: '/movies', label: 'Movies', icon: <Film className="w-4 h-4" /> },
    { to: '/tv-shows', label: 'TV Shows', icon: <Tv className="w-4 h-4" /> },
    {
      to: '/music',
      label: 'Music',
      icon: isPlaying ? (
        <Disc3 className="w-4 h-4 text-[#E50914] animate-spin" />
      ) : (
        <Music className="w-4 h-4" />
      )
    },
    { to: '/new-popular', label: 'New & Popular', icon: <Sparkles className="w-4 h-4" /> },
    { to: '/my-list', label: 'My List', icon: <Bookmark className="w-4 h-4" />, count: watchlist.length },
    { to: '/history', label: 'History', icon: <History className="w-4 h-4" /> }
  ];

  const notifications = [
    {
      id: 'n-1',
      title: 'Neon Odyssey: 2099',
      desc: 'Now streaming in 4K Ultra HD and Dolby Atmos.',
      time: '2h ago',
      img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=120&q=80',
      to: '/content/m1'
    },
    {
      id: 'n-2',
      title: 'Echoes of the Void Season 2',
      desc: 'New episodes just dropped for your watchlist.',
      time: 'Yesterday',
      img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      to: '/content/tv1'
    },
    {
      id: 'n-3',
      title: 'Top 10 in Cinema Today',
      desc: 'Discover the most watched releases this week.',
      time: '2 days ago',
      img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=120&q=80',
      to: '/new-popular'
    }
  ];

  return (
    <header
      id="main-navbar-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050505]/95 backdrop-blur-md shadow-2xl shadow-black/80 border-b border-zinc-800/80'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between h-16 md:h-20">
        {/* Left: Brand and Navigation */}
        <div className="flex items-center gap-6 lg:gap-10">
          {/* Brand Logo */}
          <Link
            id="brand-logo-link"
            to="/"
            className="flex items-center gap-2 group focus:outline-none"
            aria-label="StreamFlix Home"
          >
            <div className="w-8 h-8 rounded bg-[#E50914] flex items-center justify-center font-display text-2xl text-white tracking-wider shadow-md shadow-red-900/50 group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="font-display text-2xl sm:text-3xl tracking-wider text-[#E50914] font-bold group-hover:text-red-500 transition-colors">
              STREAMFLIX
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7">
            {navLinks.map(item => (
              <NavLink
                key={item.to}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors relative py-1 flex items-center gap-1.5 ${
                    isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span className="px-1.5 py-0.2 bg-[#E50914] text-white text-[10px] font-bold rounded-full">
                        {item.count}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914] rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: Search, Notifications, Profile Dropdown */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Interactive Search Bar */}
          <div className="relative flex items-center">
            <div
              className={`flex items-center transition-all duration-300 ${
                isSearchOpen
                  ? 'w-56 sm:w-72 md:w-80 search-glass-container rounded-full px-3.5 py-1.5 shadow-xl'
                  : 'w-9 h-9 items-center justify-center rounded-full hover:bg-white/10 transition-colors'
              }`}
            >
              <button
                id="search-toggle-btn"
                onClick={handleSearchToggle}
                className="text-white/65 hover:text-white transition-colors focus:outline-none flex items-center justify-center shrink-0"
                aria-label="Toggle search input"
              >
                <Search className="w-5 h-5 stroke-[1.75]" />
              </button>

              {isSearchOpen && (
                <input
                  ref={searchInputRef}
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Titles, actors, genres..."
                  className="search-glass-input w-full text-sm font-medium text-white/90 placeholder-white/50 tracking-wide antialiased ml-2"
                />
              )}

              {isSearchOpen && searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="text-white/60 hover:text-white ml-1.5 p-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5 stroke-[2]" />
                </button>
              )}
            </div>
          </div>

          {/* Kids Mode Badge */}
          {activeProfile?.isKids && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Kids Mode
            </span>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              id="notifications-bell-btn"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="text-zinc-400 hover:text-white p-1.5 transition-colors relative focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#E50914] rounded-full animate-pulse" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#0c0c0c] border border-zinc-800 shadow-2xl p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h4 className="text-sm font-bold text-white">Notifications</h4>
                  <span className="text-[11px] text-zinc-400 font-mono">3 new</span>
                </div>
                <div className="divide-y divide-zinc-800/80 max-h-72 overflow-y-auto no-scrollbar">
                  {notifications.map(n => (
                    <Link
                      key={n.id}
                      to={n.to}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="py-3 flex gap-3 hover:bg-zinc-900/80 p-2 rounded-xl transition-colors"
                    >
                      <img
                        src={n.img}
                        alt={n.title}
                        className="w-12 h-14 object-cover rounded-lg shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{n.desc}</p>
                        <span className="text-[10px] text-zinc-500 mt-1 block font-mono">
                          {n.time}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown or Sign In */}
          {isAuthenticated ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 group focus:outline-none"
                aria-label="User profile settings"
              >
                <img
                  src={activeProfile.avatar}
                  alt={activeProfile.name}
                  className="w-8 h-8 rounded-lg object-cover border border-transparent group-hover:border-white transition-all shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform ${
                    isProfileMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#0c0c0c] border border-zinc-800 shadow-2xl p-2 z-50 text-sm animate-fade-in">
                  {/* Profiles Switcher */}
                  <div className="p-2 border-b border-zinc-800">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-2">
                      Switch Profile
                    </p>
                    <div className="space-y-1">
                      {user?.profiles.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            switchProfile(p.id);
                            setIsProfileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-800/80 transition-colors text-left ${
                            p.id === activeProfile.id ? 'bg-zinc-800/90' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.avatar}
                              alt={p.name}
                              className="w-7 h-7 rounded-md object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-xs font-medium text-white">{p.name}</span>
                          </div>
                          {p.isKids && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                              Kids
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="p-1 space-y-0.5 text-xs">
                    <Link
                      to="/profiles"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-zinc-400" />
                      Who&apos;s Watching? (Profiles)
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
                      Account & Preferences
                    </Link>

                    <Link
                      to="/my-list"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-zinc-400" />
                      My Watchlist ({watchlist.length})
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
                    >
                      <History className="w-4 h-4 text-zinc-400" />
                      Viewing History
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[#E50914] hover:text-red-400 hover:bg-zinc-800/80 rounded-lg font-bold transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                  </div>

                  {/* Sign out */}
                  <div className="pt-1 mt-1 border-t border-zinc-800">
                    <button
                      id="navbar-signout-btn"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-zinc-800/80 rounded-lg transition-colors font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out of StreamFlix
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              id="navbar-signin-link"
              to="/login"
              className="px-4 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-bold tracking-wide transition-all shadow-md"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-zinc-400 hover:text-white p-1"
            aria-label="Toggle mobile navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#050505]/98 border-b border-zinc-800 px-4 py-4 space-y-3 backdrop-blur-xl animate-fade-in">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-zinc-800">
            {navLinks.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-[#E50914] text-white'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <span>Profile: {activeProfile.name}</span>
            <Link
              to="/profiles"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[#E50914] font-bold hover:underline"
            >
              Change Profile
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
