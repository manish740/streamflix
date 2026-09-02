import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useMusic } from '../context/MusicContext';
import {
  navItems,
  allNavItems,
  mobilePrimaryNavItems,
  type NavItem
} from '../data/navigation';
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
  User
} from 'lucide-react';

export { navItems, allNavItems, mobilePrimaryNavItems };
export type { NavItem };

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
  const mobileScrollRef = useRef<HTMLDivElement>(null);

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

  // Smoothly scroll active nav item into view in the mobile scroll row
  useEffect(() => {
    if (mobileScrollRef.current) {
      const activeEl = mobileScrollRef.current.querySelector<HTMLElement>('[aria-current="page"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
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
    setIsMobileMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const getItemIcon = (label: string, isPlayingMusic = false) => {
    switch (label) {
      case 'Home':
        return <Home className="w-4 h-4" />;
      case 'Movies':
        return <Film className="w-4 h-4" />;
      case 'TV Shows':
        return <Tv className="w-4 h-4" />;
      case 'Music':
        return isPlayingMusic ? (
          <Disc3 className="w-4 h-4 text-[#E50914] animate-spin" />
        ) : (
          <Music className="w-4 h-4" />
        );
      case 'New & Popular':
        return <Sparkles className="w-4 h-4" />;
      case 'My List':
        return <Bookmark className="w-4 h-4" />;
      case 'History':
        return <History className="w-4 h-4" />;
      case 'Search':
        return <Search className="w-4 h-4" />;
      case 'Profile':
        return <UserCheck className="w-4 h-4" />;
      default:
        return null;
    }
  };

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
          : 'bg-gradient-to-b from-black/95 via-black/60 to-transparent'
      }`}
    >
      {/* Upper Bar (Brand, Desktop Nav Links, Primary Controls) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between h-16 md:h-20">
        {/* Left: Brand and Desktop Nav Links */}
        <div className="flex items-center gap-4 lg:gap-8 shrink-0">
          {/* Brand Logo */}
          <Link
            id="brand-logo-link"
            to="/"
            className="flex items-center gap-2 group focus:outline-none shrink-0"
            aria-label="StreamFlix Home"
          >
            <div className="w-8 h-8 rounded bg-[#E50914] flex items-center justify-center font-display text-2xl text-white tracking-wider shadow-md shadow-red-900/50 group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="font-display text-2xl sm:text-3xl tracking-wider text-[#E50914] font-bold group-hover:text-red-500 transition-colors">
              STREAMFLIX
            </span>
          </Link>

          {/* Desktop Nav Links (Driven by single navItems configuration) */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-7 shrink-0" aria-label="Desktop Navigation">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                id={`nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors relative py-1 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label === 'Music' && isPlaying && (
                      <Disc3 className="w-3.5 h-3.5 text-[#E50914] animate-spin shrink-0" />
                    )}
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.path === '/my-list' && watchlist.length > 0 && (
                      <span className="px-1.5 py-0.2 bg-[#E50914] text-white text-[10px] font-bold rounded-full shrink-0">
                        {watchlist.length}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914] rounded-full shadow-[0_0_8px_rgba(229,9,20,0.8)]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: Search, Notifications, Profile, Mobile Drawer Toggle */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-5 shrink-0">
          {/* Interactive Search Bar */}
          <div className="relative flex items-center">
            <div
              className={`flex items-center transition-all duration-300 ${
                isSearchOpen
                  ? 'w-44 xs:w-52 sm:w-64 md:w-80 search-glass-container rounded-full px-3 py-1.5 shadow-xl'
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
                  placeholder="Titles, music, genres..."
                  className="search-glass-input w-full text-xs sm:text-sm font-medium text-white/90 placeholder-white/50 tracking-wide antialiased ml-2 bg-transparent outline-none border-none"
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

          {/* Kids Filter Badge / Link */}
          <Link
            to="/browse/kids"
            className="hidden sm:inline-block text-xs font-semibold text-zinc-300 hover:text-white px-2 py-1 rounded bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            KIDS
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              id="notifications-toggle-btn"
              onClick={() => setIsNotificationsOpen(prev => !prev)}
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-zinc-300 hover:text-white focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E50914] ring-2 ring-[#050505]" />
            </button>

            {isNotificationsOpen && (
              <div
                id="notifications-popover"
                className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-xl p-4 z-50 animate-fade-in"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <span className="text-sm font-bold text-white">Notifications</span>
                  <span className="text-xs text-zinc-400 font-mono">3 new</span>
                </div>

                <div className="divide-y divide-zinc-800/60 max-h-[360px] overflow-y-auto">
                  {notifications.map(n => (
                    <Link
                      key={n.id}
                      to={n.to}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="flex items-start gap-3 py-3 hover:bg-zinc-800/40 rounded-lg px-2 transition-colors"
                    >
                      <img
                        src={n.img}
                        alt=""
                        className="w-16 h-10 object-cover rounded-md flex-shrink-0 bg-zinc-800"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{n.title}</p>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{n.desc}</p>
                        <span className="text-[10px] text-zinc-500 mt-1 block">{n.time}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Profile Menu */}
          <div className="relative hidden md:block" ref={profileMenuRef}>
            <button
              id="profile-menu-toggle-btn"
              onClick={() => setIsProfileMenuOpen(prev => !prev)}
              className="flex items-center gap-2 group focus:outline-none"
              aria-label="User profile menu"
            >
              <img
                src={activeProfile.avatar}
                alt={activeProfile.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-zinc-700 group-hover:ring-[#E50914] transition-all"
                referrerPolicy="no-referrer"
              />
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 group-hover:text-white transition-transform duration-200 ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isProfileMenuOpen && (
              <div
                id="profile-dropdown-menu"
                className="absolute right-0 mt-3 w-64 rounded-2xl bg-zinc-900/98 border border-zinc-800 shadow-2xl backdrop-blur-xl p-3 z-50 animate-fade-in"
              >
                {/* Profiles List */}
                <div className="space-y-1.5 pb-3 border-b border-zinc-800">
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold px-2 py-1">
                    Switch Profile
                  </p>
                  {user?.profiles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchProfile(p.id);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                        p.id === activeProfile.id
                          ? 'bg-zinc-800 text-white font-semibold'
                          : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-6 h-6 rounded-md object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span>{p.name}</span>
                      </div>
                      {p.id === activeProfile.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
                      )}
                    </button>
                  ))}
                  <Link
                    to="/profiles"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="block text-center text-xs text-zinc-400 hover:text-white pt-1.5 hover:underline"
                  >
                    Manage Profiles
                  </Link>
                </div>

                {/* Account Links */}
                <div className="py-2 border-b border-zinc-800 space-y-1">
                  <Link
                    id="profile-menu-account-link"
                    to="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Account Settings</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      id="profile-menu-admin-link"
                      to="/admin"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-[#E50914] hover:bg-red-950/30 transition-colors font-bold"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin Control Center</span>
                    </Link>
                  )}
                </div>

                {/* Sign Out */}
                <div className="pt-2">
                  <button
                    id="signout-button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of StreamFlix</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Profile Link Avatar */}
          <Link
            id="mobile-header-profile-link"
            to="/profile"
            className="md:hidden flex items-center"
            aria-label="Profile"
          >
            <img
              src={activeProfile.avatar}
              alt={activeProfile.name}
              className="w-7 h-7 rounded-md object-cover ring-1 ring-zinc-700"
              referrerPolicy="no-referrer"
            />
          </Link>

          {/* Mobile Hamburger / Menu Toggle */}
          <button
            id="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Horizontally Scrollable Primary Navigation Row */}
      <div
        id="mobile-navbar-row"
        ref={mobileScrollRef}
        className="md:hidden border-t border-zinc-800/80 bg-[#050505]/95 backdrop-blur-md px-3 sm:px-4 py-1.5 overflow-x-auto no-scrollbar scroll-smooth shadow-lg shadow-black/50"
      >
        <nav className="flex items-center gap-1 sm:gap-2 min-w-max" aria-label="Mobile Navigation">
          {mobilePrimaryNavItems.map(item => (
            <NavLink
              key={item.path}
              id={`mobile-nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `relative py-1.5 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-[#E50914] text-white font-bold shadow-md shadow-red-950/60'
                    : 'bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="shrink-0">{getItemIcon(item.label, isPlaying)}</span>
                  <span>{item.label}</span>
                  {item.path === '/my-list' && watchlist.length > 0 && (
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                        isActive ? 'bg-white text-zinc-950' : 'bg-[#E50914] text-white'
                      }`}
                    >
                      {watchlist.length}
                    </span>
                  )}
                  {isActive && (
                    <span
                      id={`mobile-active-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      className="absolute -bottom-1 left-2 right-2 h-0.5 bg-white/80 rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer (Accessible via hamburger toggle, includes all navigation options) */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="md:hidden bg-[#050505]/98 border-b border-zinc-800 px-4 py-4 space-y-4 backdrop-blur-xl animate-fade-in shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Complete Navigation
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">StreamFlix</span>
          </div>

          {/* Grid of All Application Navigation Options */}
          <div className="grid grid-cols-2 gap-2">
            {allNavItems.map(item => (
              <NavLink
                key={item.path}
                id={`drawer-nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E50914] text-white font-bold shadow-md shadow-red-950/60'
                      : 'bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0">{getItemIcon(item.label, isPlaying)}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.path === '/my-list' && watchlist.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-white text-zinc-950 text-[10px] font-bold rounded-full ml-1 shrink-0">
                    {watchlist.length}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Profile Switcher & Account Section */}
          <div className="pt-2 border-t border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 p-1">
              <span className="flex items-center gap-2">
                <img
                  src={activeProfile.avatar}
                  alt={activeProfile.name}
                  className="w-6 h-6 rounded-md object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="text-zinc-200 font-medium truncate max-w-[140px]">
                  {activeProfile.name}
                </span>
              </span>
              <Link
                to="/profiles"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#E50914] font-bold hover:underline"
              >
                Switch Profile
              </Link>
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg text-xs text-[#E50914] bg-red-950/20 border border-red-900/30 font-bold"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {isAuthenticated ? (
              <button
                id="mobile-drawer-signout-btn"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-zinc-900 transition-colors font-medium border border-red-950/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
