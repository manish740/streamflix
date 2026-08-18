import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import {
  User,
  Shield,
  Globe,
  Settings,
  CreditCard,
  Tv,
  LogOut,
  Check,
  Sparkles,
  Sliders,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const {
    user,
    activeProfile,
    switchProfile,
    updateProfile,
    logout,
    isAdmin,
    toggleAdminRole
  } = useAuth();
  const { showToast } = useWatchlist();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState(activeProfile.name);
  const [isKids, setIsKids] = useState(activeProfile.isKids);
  const [preferredLang, setPreferredLang] = useState(activeProfile.preferredLang || 'en');
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [autoPlayPreviews, setAutoPlayPreviews] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileName.trim(),
      isKids,
      preferredLang
    });
    setIsEditing(false);
    showToast('Profile Updated', 'Your preferences have been saved.', 'success');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="pt-24 sm:pt-28 pb-16 px-4 sm:px-8 md:px-12 max-w-5xl mx-auto min-h-[75vh] space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Account & Profile Settings</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your StreamFlix subscription, profiles, and playback preferences
          </p>
        </div>

        <Link
          to="/profiles"
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>Switch Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid: Active Profile + Subscription */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Active Profile Details */}
        <div className="md:col-span-1 bg-[#0c0c0c] border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="text-center space-y-3">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden mx-auto shadow-xl ring-2 ring-zinc-700">
              <img
                src={activeProfile.avatar}
                alt={activeProfile.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{activeProfile.name}</h3>
              <p className="text-xs text-zinc-400">{user?.email}</p>
              {activeProfile.isKids && (
                <span className="inline-block mt-1 text-[10px] bg-yellow-950/80 text-yellow-400 border border-yellow-800 px-2 py-0.5 rounded font-bold uppercase">
                  Kids Experience
                </span>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs transition-colors"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          {/* Quick Profile Switcher Tiles */}
          {user?.profiles && user.profiles.length > 1 && (
            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <p className="text-xs font-semibold text-zinc-400">Other Profiles</p>
              <div className="flex items-center gap-2">
                {user.profiles
                  .filter(p => p.id !== activeProfile.id)
                  .map(p => (
                    <div
                      key={p.id}
                      onClick={() => switchProfile(p.id)}
                      className="cursor-pointer group flex flex-col items-center"
                      title={`Switch to ${p.name}`}
                    >
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-transparent group-hover:border-white transition-all"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] text-zinc-400 group-hover:text-white truncate max-w-[48px] mt-1">
                        {p.name}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Edit Profile or Membership details */}
        <div className="md:col-span-2 space-y-6">
          {isEditing ? (
            <div className="bg-[#0c0c0c] border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white">Edit Profile Details</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full bg-[#050505] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#E50914] focus:outline-none"
                    required
                  />
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Kids Experience</p>
                      <p className="text-[11px] text-zinc-400">
                        Restrict display to TV-G / PG certified titles
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isKids}
                    onChange={e => setIsKids(e.target.checked)}
                    className="w-5 h-5 accent-[#E50914] cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Preferred Language
                  </label>
                  <select
                    value={preferredLang}
                    onChange={e => setPreferredLang(e.target.value)}
                    className="w-full bg-[#050505] border border-zinc-700 text-xs text-white rounded-lg p-2.5 focus:border-[#E50914] focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="es">Español (Spanish)</option>
                    <option value="fr">Français (French)</option>
                    <option value="de">Deutsch (German)</option>
                    <option value="ja">日本語 (Japanese)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-xs shadow-md transition-all"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Membership Card */}
              <div className="bg-[#0c0c0c] border border-zinc-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800 text-[#E50914] flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">StreamFlix Premium 4K Plan</h3>
                      <p className="text-xs text-zinc-400">Ultra HD 4K + HDR, Spatial Audio, 4 Screens</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-950/80 border border-green-700 text-green-400 text-xs font-bold">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <p className="text-zinc-400">Next Billing</p>
                    <p className="font-bold text-white mt-0.5">March 28, 2026</p>
                  </div>
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <p className="text-zinc-400">Payment Method</p>
                    <p className="font-bold text-white mt-0.5">•••• 4242 (Visa)</p>
                  </div>
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <p className="text-zinc-400">Max Resolution</p>
                    <p className="font-bold text-[#E50914] mt-0.5">4K Ultra HD</p>
                  </div>
                </div>
              </div>

              {/* Playback & Audio Preferences */}
              <div className="bg-[#0c0c0c] border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#E50914]" />
                  Playback Settings
                </h3>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 cursor-pointer">
                    <div>
                      <p className="font-bold text-white">Autoplay next episode automatically</p>
                      <p className="text-zinc-400 text-[11px]">
                        Starts the next episode in a series seamlessly
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoPlayNext}
                      onChange={e => setAutoPlayNext(e.target.checked)}
                      className="w-5 h-5 accent-[#E50914]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 cursor-pointer">
                    <div>
                      <p className="font-bold text-white">Autoplay previews while browsing</p>
                      <p className="text-zinc-400 text-[11px]">
                        Play video clips and audio trailers on hover
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoPlayPreviews}
                      onChange={e => setAutoPlayPreviews(e.target.checked)}
                      className="w-5 h-5 accent-[#E50914]"
                    />
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Admin Role Toggle (For Testing Portfolios) */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Admin Privileges</p>
                <p className="text-[11px] text-zinc-400">
                  Current role: <strong className="text-white uppercase">{user?.role || 'user'}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleAdminRole}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors"
              >
                Switch to {isAdmin ? 'User' : 'Admin'}
              </button>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3.5 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-xs font-bold text-white transition-all shadow-md"
                >
                  Admin Portal →
                </Link>
              )}
            </div>
          </div>

          {/* Sign Out CTA */}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of All Devices</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
