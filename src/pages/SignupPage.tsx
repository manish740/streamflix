import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const res = await signup(name, email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/profiles', { replace: true });
    } else {
      setError(res.error || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Wallpaper */}
      <div className="absolute inset-0 z-0 select-none opacity-20 pointer-events-none">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1920&q=85')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-[#050505]/90" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-[#E50914] flex items-center justify-center font-display text-2xl text-white font-bold shadow-lg shadow-red-900/50 group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="font-display text-2xl sm:text-3xl font-bold tracking-wider text-[#E50914] group-hover:text-red-500 transition-colors">
            STREAMFLIX
          </span>
        </Link>

        <Link
          to="/login"
          className="px-4 py-1.5 rounded-md border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-xs sm:text-sm font-semibold transition-all"
        >
          Sign In
        </Link>
      </header>

      {/* Signup Form Card */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-[#0c0c0c]/90 backdrop-blur-xl rounded-2xl border border-zinc-800/80 shadow-2xl p-6 sm:p-10 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="text-xs text-zinc-400 mt-1.5">
              Start your 4K Ultra HD streaming journey with unlimited profiles
            </p>
          </div>

          {/* Benefits bullets */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span>Watch everywhere</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span>No ads, cancel anytime</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span>4K Ultra HD & Atmos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span>Up to 5 profiles</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              id="signup-error-message"
              className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-200 text-xs text-center font-medium animate-shake"
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Your Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  id="signup-name-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Sterling"
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#E50914] focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  id="signup-email-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#E50914] focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  id="signup-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#E50914] focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  id="signup-confirm-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#E50914] focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full py-3.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-sm transition-all shadow-lg shadow-red-900/40 hover:shadow-red-900/60 active:scale-[0.99] flex items-center justify-center mt-2"
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create StreamFlix Account'
              )}
            </button>
          </form>

          {/* Footer switch to Login */}
          <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800/80">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="text-white hover:text-[#E50914] font-semibold underline transition-colors"
            >
              Sign in.
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-zinc-500">
        Questions? Contact customer support • StreamFlix Streaming Platform
      </footer>
    </div>
  );
};
