import { create } from 'zustand';

export const useRoomStore = create((set) => ({
  room: null,
  participants: [],
  messages: [],
  reactions: [],
  isConnected: false,

  setRoom: (room) => set({ room }),
  setParticipants: (participants) => set({ participants }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  addReaction: (reaction) => {
    // Add reaction and automatically remove it after 3 seconds for the floating animation
    const id = Date.now() + Math.random();
    set((state) => ({ reactions: [...state.reactions, { ...reaction, id }] }));
    setTimeout(() => {
      set((state) => ({ reactions: state.reactions.filter((r) => r.id !== id) }));
    }, 3000);
  },
  setConnected: (isConnected) => set({ isConnected }),
  clearRoom: () => set({ room: null, participants: [], messages: [], reactions: [], isConnected: false }),
}));
