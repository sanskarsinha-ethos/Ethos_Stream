import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function AuthGuard({ children, requireProfile = true }) {
  const { session, activeProfile } = useAuthStore();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If on /profiles, don't require an active profile
  if (requireProfile && !activeProfile && location.pathname !== '/profiles' && location.pathname !== '/profile') {
    return <Navigate to="/profiles" replace />;
  }

  return children ? children : <Outlet />;
}
