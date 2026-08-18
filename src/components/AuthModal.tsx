import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Sparkles, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, isLoading } = useAuth();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (isSignUpMode) {
      const ok = await signup(name.trim() || 'Alex', email.trim(), password);
      if (ok) onClose();
    } else {
      const ok = await login(email.trim(), password);
      if (ok) onClose();
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    await login('alex.sterling@streamflix.io', 'demo1234');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0c0c0c] rounded-2xl border border-zinc-800 shadow-2xl p-6 sm:p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#E50914] text-white font-display text-2xl mb-2 shadow-lg shadow-red-900/30">
            S
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isSignUpMode ? 'Create StreamFlix Account' : 'Welcome to StreamFlix'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Unlimited movies, TV shows, and 4K streaming
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="mb-6 p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-zinc-300">Portfolio Demo Access</span>
          </div>
          <button
            id="demo-login-btn"
            type="button"
            onClick={handleDemoLogin}
            className="px-3 py-1 bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-bold rounded-lg shadow-md transition-all"
          >
            Quick Demo Login
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUpMode && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Sterling"
                  className="w-full bg-[#050505] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-[#E50914] focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#050505] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-[#E50914] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050505] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-[#E50914] focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-sm transition-colors shadow-lg shadow-red-900/30"
          >
            {isLoading ? 'Processing...' : isSignUpMode ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-xs text-zinc-400">
          {isSignUpMode ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUpMode(false);
                  setError('');
                }}
                className="text-white hover:text-[#E50914] font-semibold underline ml-1"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to StreamFlix?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUpMode(true);
                  setError('');
                }}
                className="text-white hover:text-[#E50914] font-semibold underline ml-1"
              >
                Sign up now
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
