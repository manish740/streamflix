import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { MusicProvider } from './context/MusicContext';
import { LoadingScreen } from './components/LoadingScreen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';

// Pages
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { TvShowsPage } from './pages/TvShowsPage';
import { MusicPage } from './pages/MusicPage';
import { NewPopularPage } from './pages/NewPopularPage';
import { MyListPage } from './pages/MyListPage';
import { HistoryPage } from './pages/HistoryPage';
import { SearchPage } from './pages/SearchPage';
import { ContentDetailsPage } from './pages/ContentDetailsPage';
import { WatchPage } from './pages/WatchPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProfilesPage } from './pages/ProfilesPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { ErrorBoundary } from './components/ErrorBoundary';

const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading StreamFlix..." />;
  }

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Profiles Selection Screen (Requires Auth, but profile not selected yet) */}
      <Route
        path="/profiles"
        element={
          <ProtectedRoute requireProfile={false}>
            <ProfilesPage />
          </ProtectedRoute>
        }
      />

      {/* Standalone Fullscreen Video Player (No Navbar / Footer) */}
      <Route
        path="/watch/:contentId"
        element={
          <ProtectedRoute>
            <WatchPage />
          </ProtectedRoute>
        }
      />

      {/* Standard App Layout with Navbar & Footer */}
      <Route element={<AppLayout />}>
        {/* Browse & Discovery Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/tv-shows" element={<TvShowsPage />} />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/music/audio" element={<MusicPage />} />
        <Route path="/music/video" element={<MusicPage />} />
        <Route path="/live-discovery" element={<MusicPage />} />
        <Route path="/new-popular" element={<NewPopularPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/content/:contentId" element={<ContentDetailsPage />} />

        {/* User Protected Routes */}
        <Route
          path="/my-list"
          element={
            <ProtectedRoute>
              <MyListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Catch-All Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <WatchlistProvider>
            <MusicProvider>
              <AppRoutes />
            </MusicProvider>
          </WatchlistProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
