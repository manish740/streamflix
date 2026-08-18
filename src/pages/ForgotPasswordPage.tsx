import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    const res = await resetPassword(email);
    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || 'Failed to send reset link.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between relative overflow-hidden">
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

      {/* Main Card */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-[#0c0c0c]/90 backdrop-blur-xl rounded-2xl border border-zinc-800/80 shadow-2xl p-6 sm:p-10 space-y-6">
          {!submitted ? (
            <>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Forgot Password
                </h1>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  We will send you an email with instructions on how to reset your password.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-200 text-xs text-center font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-[#050505] border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-[#E50914] focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-sm transition-all shadow-lg shadow-red-900/40"
                >
                  {isLoading ? 'Sending Link...' : 'Email Me'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 bg-green-950/80 border border-green-700 text-green-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Reset Link Sent!</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                An email has been dispatched to <strong className="text-white">{email}</strong> with
                password recovery instructions.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-xs transition-all shadow-md"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}

          <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800/80">
            <Link
              to="/login"
              className="text-zinc-400 hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
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
