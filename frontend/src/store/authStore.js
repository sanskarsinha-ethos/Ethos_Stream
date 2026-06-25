import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      session: null,
      user: null,
      activeProfile: null,
      profiles: [],
      setSession: (session) => set({ session, user: session?.user || null }),
      setActiveProfile: (profile) => set({ activeProfile: profile }),
      setProfiles: (profiles) => set({ profiles }),
      clearSession: () => set({ session: null, user: null, activeProfile: null, profiles: [] }),
    }),
    {
      name: 'ethos-auth-storage',
      // Only persist activeProfile to avoid stale session bugs (Supabase client handles session persistence itself)
      partialize: (state) => ({ activeProfile: state.activeProfile }),
    }
  )
);
