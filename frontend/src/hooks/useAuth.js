import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/userApi';

export function useAuth() {
  const { setSession, clearSession, session } = useAuthStore();

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
      if (!session) {
        clearSession();
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, clearSession]);

  const signUp = async (email, password, name) => {
    console.log('Attempting signup with:', { email, name });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    console.log('Signup response - data:', data, 'error:', error);
    if (error) {
      console.error('Signup error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        full: JSON.stringify(error)
      });
      throw error;
    }

    // Call our backend to sync the first profile
    if (data.user) {
      // Small delay to ensure Supabase trigger creates public.users first
      await new Promise(r => setTimeout(r, 1000));
      await userApi.syncProfile(name);
    }
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profiles`
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    session,
    user: session?.user || null,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };
}
