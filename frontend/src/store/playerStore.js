import { create } from 'zustand';

export const usePlayerStore = create((set) => ({
  currentVideo: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  quality: -1, // -1 means Auto in hls.js
  isMuted: false,
  volume: 1,

  setVideo: (video) => set({ currentVideo: video }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setQuality: (quality) => set({ quality }),
  setMuted: (isMuted) => set({ isMuted }),
  setVolume: (volume) => set({ volume }),
}));
