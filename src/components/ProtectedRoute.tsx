import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireProfile = true,
  requireAdmin = false
}) => {
  const { isAuthenticated, isLoading, hasSelectedProfile, isAdmin, toggleAdminRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Checking authorization..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in but hasn't selected a profile yet, redirect to /profiles (unless current page is /profiles)
  if (requireProfile && !hasSelectedProfile && location.pathname !== '/profiles') {
    return <Navigate to="/profiles" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-800 text-red-500 flex items-center justify-center font-bold text-xl mx-auto">
            !
          </div>
          <h2 className="text-xl font-bold text-white">Admin Access Required</h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            You are logged in as a standard user. Admin privileges are required to access this portal.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={toggleAdminRole}
              className="w-full py-2.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-xs transition-all shadow-lg"
            >
              Enable Admin Mode & Continue
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, isAdmin, toggleAdminRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Verifying admin credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-800 text-red-500 flex items-center justify-center font-bold text-xl mx-auto">
            !
          </div>
          <h2 className="text-xl font-bold text-white">Admin Access Required</h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            You are logged in as a standard user. Admin privileges are required to access this portal.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={toggleAdminRole}
              className="w-full py-2.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-xs transition-all shadow-lg"
            >
              Grant Admin Role for Demo Testing
            </button>
            <a
              href="/"
              className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
