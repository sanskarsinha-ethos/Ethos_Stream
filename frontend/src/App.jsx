import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabaseClient';

// Layouts
import Navbar from './components/layout/Navbar';
import AuthGuard from './components/layout/AuthGuard';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileSelectPage from './pages/ProfileSelectPage';
import BrowsePage from './pages/BrowsePage';
import SearchPage from './pages/SearchPage';
import MyListPage from './pages/MyListPage';
import PlayerPage from './pages/PlayerPage';
import WatchPartyPage from './pages/WatchPartyPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const { session, setSession } = useAuthStore();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <BrowserRouter>
      {/* Global Toast Notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1F2937', // ethos-surface
            color: '#fff',
            border: '1px solid #374151', // ethos-border
          },
          success: { iconTheme: { primary: '#00E5CC', secondary: '#1F2937' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#1F2937' } }
        }} 
      />

      {/* Conditionally render Navbar based on route? 
          We use Navbar inside PageWrapper for Browse, Search, MyList. 
          So no need for global Navbar here. */}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={session ? <Navigate to="/profiles" replace /> : <LandingPage />} />
        <Route path="/login" element={session ? <Navigate to="/profiles" replace /> : <LoginPage />} />
        <Route path="/register" element={session ? <Navigate to="/profiles" replace /> : <RegisterPage />} />

        {/* Protected Routes - require authentication */}
        <Route element={<AuthGuard />}>
          {/* Profile Selection */}
          <Route path="/profiles" element={<ProfileSelectPage />} />
          
          {/* Manage Profiles */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Main Content (Requires active profile, handled by AuthGuard or component) */}
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/my-list" element={<MyListPage />} />
          
          {/* Player & Rooms */}
          <Route path="/watch/:id" element={<PlayerPage />} />
          <Route path="/watch-party/:code" element={<WatchPartyPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
