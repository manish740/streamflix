import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { X, Check, Plus, Shield, Globe } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, activeProfile, switchProfile, updateProfile } = useAuth();
  const { showToast } = useWatchlist();

  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState(activeProfile.name);
  const [isKids, setIsKids] = useState(activeProfile.isKids);
  const [preferredLang, setPreferredLang] = useState(activeProfile.preferredLang || 'en');

  if (!isOpen || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      isKids,
      preferredLang
    });
    showToast('Profile Updated', 'Your preferences have been saved', 'success');
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#0c0c0c] rounded-2xl border border-zinc-800 shadow-2xl p-6 sm:p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
          aria-label="Close profile modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white text-center mb-6">
          {isEditing ? 'Edit Profile' : "Who's Watching?"}
        </h2>

        {!isEditing ? (
          <div>
            {/* Profiles Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {user.profiles.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    switchProfile(p.id);
                    onClose();
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-white transition-all shadow-md group-hover:scale-105">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {p.id === activeProfile.id && (
                      <div className="absolute top-1 right-1 bg-[#E50914] text-white p-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-zinc-300 group-hover:text-white mt-2 text-center truncate w-full">
                    {p.name}
                  </span>
                  {p.isKids && (
                    <span className="text-[10px] text-yellow-400 font-bold uppercase mt-0.5">
                      Kids
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Manage Profile CTA */}
            <div className="text-center">
              <button
                onClick={() => {
                  setProfileName(activeProfile.name);
                  setIsKids(activeProfile.isKids);
                  setPreferredLang(activeProfile.preferredLang || 'en');
                  setIsEditing(true);
                }}
                className="px-6 py-2 rounded-lg border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-xs font-bold tracking-wider uppercase transition-all"
              >
                Manage Active Profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <img
                src={activeProfile.avatar}
                alt={activeProfile.name}
                className="w-16 h-16 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Profile Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-[#E50914] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Kids Experience Toggle */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-xs font-bold text-white">Kids Experience</p>
                  <p className="text-[11px] text-zinc-400">Only show titles suitable for all ages (TV-G / PG)</p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isKids}
                onChange={e => setIsKids(e.target.checked)}
                className="w-5 h-5 accent-[#E50914] cursor-pointer"
              />
            </div>

            {/* Language Selector */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Display & Audio Language</span>
              </div>
              <select
                value={preferredLang}
                onChange={e => setPreferredLang(e.target.value)}
                className="w-full bg-[#050505] border border-zinc-700 text-xs text-white rounded-lg p-2 focus:border-[#E50914] focus:outline-none"
              >
                <option value="en">English</option>
                <option value="es">Español (Spanish)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
                <option value="ja">日本語 (Japanese)</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-xs transition-colors shadow-lg shadow-red-900/30"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
