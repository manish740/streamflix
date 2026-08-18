import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SocialAuthButtons } from '../components/SocialAuthButtons';
import { Lock, Mail, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    login,
    signInWithGoogle,
    signInWithFacebook,
    demoLogin,
    isAuthenticated,
    isLoading: authLoading
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSocial, setActiveSocial] = useState<'google' | 'facebook' | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profiles', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleAuth = async () => {
    setError('');
    setActiveSocial('google');
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        navigate('/profiles', { replace: true });
      } else {
        setError(res.error || 'Google sign-in was cancelled.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setActiveSocial(null);
    }
  };

  const handleFacebookAuth = async () => {
    setError('');
    setActiveSocial('facebook');
    try {
      const res = await signInWithFacebook();
      if (res.success) {
        navigate('/profiles', { replace: true });
      } else {
        setError(res.error || 'Facebook sign-in failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Facebook sign-in failed. Please try again.');
    } finally {
      setActiveSocial(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        navigate('/profiles', { replace: true });
      } else {
        setError(res.error || 'Email or password is incorrect.');
      }
    } catch (err: any) {
      setError(err?.message || 'Email or password is incorrect.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoUser = async () => {
    setError('');
    await demoLogin(false);
    navigate('/profiles', { replace: true });
  };

  const handleQuickDemoAdmin = async () => {
    setError('');
    await demoLogin(true);
    navigate('/profiles', { replace: true });
  };

  const isAnyLoading = isSubmitting || activeSocial !== null || authLoading;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Poster Collage Wallpaper with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0 select-none opacity-20 pointer-events-none">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85')`
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
          to="/signup"
          className="px-4 py-1.5 rounded-md bg-[#E50914] hover:bg-[#b80710] text-white text-xs sm:text-sm font-semibold transition-all shadow-md"
        >
          Sign Up
        </Link>
      </header>

      {/* Login Card Form */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-[#0c0c0c]/90 backdrop-blur-xl rounded-2xl border border-zinc-800/80 shadow-2xl p-6 sm:p-10 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-xs text-zinc-400 mt-1.5">
              Access your watchlist, recommendations, and 4K streams
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              id="login-error-message"
              className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-200 text-xs text-center font-medium animate-shake"
            >
              {error}
            </div>
          )}

          {/* Social Authentication Options */}
          <div className="space-y-3">
            <SocialAuthButtons
              onGoogleClick={handleGoogleAuth}
              onFacebookClick={handleFacebookAuth}
              isLoading={isAnyLoading}
              activeProvider={activeSocial}
            />

            {/* Visual Divider */}
            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-zinc-800 w-full" />
              <span className="bg-[#0c0c0c] px-3 text-xs uppercase font-semibold text-zinc-500 tracking-wider shrink-0">
                OR
              </span>
              <div className="border-t border-zinc-800 w-full" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex.sterling@streamflix.io"
                  disabled={isAnyLoading}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-[#E50914] focus:outline-none transition-colors disabled:opacity-60"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-zinc-400 hover:text-[#E50914] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isAnyLoading}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:border-[#E50914] focus:outline-none transition-colors disabled:opacity-60"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="login-remember-checkbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#050505] border-zinc-700 accent-[#E50914] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[11px] text-zinc-500 hover:text-zinc-300">
                Need Help?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isAnyLoading}
              className="w-full py-3.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-sm transition-all shadow-lg shadow-red-900/40 hover:shadow-red-900/60 active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Login Shortcuts */}
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Instant Demo Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="quick-demo-user-btn"
                type="button"
                onClick={handleQuickDemoUser}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all text-center truncate border border-zinc-700"
              >
                Standard User
              </button>
              <button
                id="quick-demo-admin-btn"
                type="button"
                onClick={handleQuickDemoAdmin}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-all text-center flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Admin Demo
              </button>
            </div>
          </div>

          {/* Footer switch to Sign Up */}
          <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800/80">
            <span>Don't have an account? </span>
            <Link
              to="/signup"
              className="text-white hover:text-[#E50914] font-semibold underline transition-colors"
            >
              Create Account
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
