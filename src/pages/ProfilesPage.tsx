import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Check, X, Shield, Trash2, ArrowLeft } from 'lucide-react';
import { MOCK_PROFILES } from '../data/mockData';

const AVAILABLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80'
];

export const ProfilesPage: React.FC = () => {
  const { user, selectProfile, addProfile, updateProfile, deleteProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [isManaging, setIsManaging] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // New Profile Form State
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(AVAILABLE_AVATARS[2]);
  const [newIsKids, setNewIsKids] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editIsKids, setEditIsKids] = useState(false);

  const profiles = user?.profiles || MOCK_PROFILES;

  const handleSelect = (profileId: string) => {
    if (isManaging) {
      const p = profiles.find(item => item.id === profileId);
      if (p) {
        setEditingProfileId(profileId);
        setEditName(p.name);
        setEditIsKids(p.isKids);
      }
      return;
    }
    selectProfile(profileId);
    navigate('/', { replace: true });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addProfile(newName.trim(), newAvatar, newIsKids);
    setNewName('');
    setIsAdding(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfileId || !editName.trim()) return;
    updateProfile({
      name: editName.trim(),
      isKids: editIsKids
    });
    setEditingProfileId(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-between p-6 sm:p-12 relative overflow-hidden select-none">
      {/* Top Header with Brand */}
      <header className="w-full max-w-6xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#E50914] flex items-center justify-center font-display text-2xl text-white font-bold shadow-lg shadow-red-900/50">
            S
          </div>
          <span className="font-display text-2xl font-bold tracking-wider text-[#E50914]">
            STREAMFLIX
          </span>
        </div>

        <button
          onClick={logout}
          className="text-xs text-zinc-400 hover:text-white font-semibold transition-colors px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600"
        >
          Sign Out
        </button>
      </header>

      {/* Main Profile Selection / Management Area */}
      <main className="w-full max-w-4xl flex flex-col items-center justify-center my-auto py-10 z-10 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight text-center mb-10">
          {isManaging ? 'Manage Profiles' : "Who's Watching?"}
        </h1>

        {/* Profile Avatars Grid */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-12 mb-12">
          {profiles.map(p => (
            <div
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className="flex flex-col items-center group cursor-pointer w-24 sm:w-32 md:w-36"
            >
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-white transition-all shadow-xl group-hover:scale-105">
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Edit overlay icon when in managing mode */}
                {isManaging && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-black/80 border border-white/60 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Edit2 className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </div>

              <span className="text-sm sm:text-base font-medium text-zinc-400 group-hover:text-white mt-3 text-center truncate w-full transition-colors">
                {p.name}
              </span>

              {p.isKids && (
                <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider mt-0.5 bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-800">
                  Kids Mode
                </span>
              )}
            </div>
          ))}

          {/* Add Profile Tile (if less than 5 profiles) */}
          {!isManaging && profiles.length < 5 && (
            <div
              onClick={() => setIsAdding(true)}
              className="flex flex-col items-center group cursor-pointer w-24 sm:w-32 md:w-36"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl border-2 border-dashed border-zinc-700 group-hover:border-white flex items-center justify-center bg-zinc-900/60 group-hover:bg-zinc-800 transition-all group-hover:scale-105">
                <Plus className="w-10 h-10 text-zinc-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm sm:text-base font-medium text-zinc-500 group-hover:text-white mt-3 text-center transition-colors">
                Add Profile
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsManaging(!isManaging)}
            className={`px-8 py-2.5 rounded-lg border text-xs sm:text-sm font-bold tracking-wider uppercase transition-all shadow-md ${
              isManaging
                ? 'bg-white text-black border-white hover:bg-zinc-200'
                : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-white'
            }`}
          >
            {isManaging ? 'Done Managing' : 'Manage Profiles'}
          </button>
        </div>
      </main>

      {/* Add Profile Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c0c0c] rounded-2xl border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Add New Profile</h2>
              <button
                onClick={() => setIsAdding(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Sarah, Gaming, Guest"
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#E50914] focus:outline-none"
                  required
                />
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">
                  Choose Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVAILABLE_AVATARS.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="Avatar option"
                      onClick={() => setNewAvatar(av)}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        newAvatar === av ? 'border-[#E50914] scale-105 ring-2 ring-red-500/50' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              </div>

              {/* Kids Mode Toggle */}
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Kids Profile?</p>
                    <p className="text-[11px] text-zinc-400">Restricts to TV-G / PG ratings</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={newIsKids}
                  onChange={e => setNewIsKids(e.target.checked)}
                  className="w-5 h-5 accent-[#E50914] cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-xs shadow-lg transition-all"
                >
                  Create Profile
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editingProfileId && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c0c0c] rounded-2xl border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={() => setEditingProfileId(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#E50914] focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Kids Profile?</p>
                    <p className="text-[11px] text-zinc-400">Restricts to TV-G / PG ratings</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={editIsKids}
                  onChange={e => setEditIsKids(e.target.checked)}
                  className="w-5 h-5 accent-[#E50914] cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-xs shadow-lg transition-all"
                >
                  Save Profile
                </button>

                {profiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      deleteProfile(editingProfileId);
                      setEditingProfileId(null);
                    }}
                    className="px-3 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-semibold text-xs flex items-center gap-1"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setEditingProfileId(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-6xl text-center text-xs text-zinc-600 py-4">
        StreamFlix Multi-Profile Streaming Experience
      </footer>
    </div>
  );
};
