import { useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { useRoomStore } from '../store/roomStore';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { watchPartyApi } from '../api/watchPartyApi';
import toast from 'react-hot-toast';

export function useRoom(roomCode) {
  const { activeProfile } = useAuthStore();
  const { setRoom, clearRoom, isConnected } = useRoomStore();
  const { setPlaying, setTime } = usePlayerStore();
  
  const { sendSync, sendChat, sendReaction, stompClient } = useWebSocket(roomCode);
  const syncSubscription = useRef(null);

  useEffect(() => {
    if (!roomCode || !activeProfile) return;

    let isMounted = true;

    const initRoom = async () => {
      try {
        const roomData = await watchPartyApi.joinRoom(roomCode, { profileId: activeProfile.id });
        if (isMounted) {
          setRoom(roomData);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to join room');
      }
    };

    initRoom();

    return () => {
      isMounted = false;
      watchPartyApi.leaveRoom(roomCode, { profileId: activeProfile.id }).catch(console.error);
      clearRoom();
    };
  }, [roomCode, activeProfile, setRoom, clearRoom]);

  // Subscribe to sync topic once connected
  useEffect(() => {
    if (isConnected && stompClient.current?.connected && roomCode) {
      syncSubscription.current = stompClient.current.subscribe(`/topic/room/${roomCode}/sync`, (msg) => {
        const payload = JSON.parse(msg.body);
        
        // Ignore our own sync events to prevent loops
        if (payload.senderProfileId === activeProfile?.id) return;

        if (payload.type === 'PLAY') {
          setPlaying(true);
        } else if (payload.type === 'PAUSE') {
          setPlaying(false);
        } else if (payload.type === 'SEEK') {
          setTime(payload.position); // Note: UI layer needs to intercept this and seek video player
        }
      });
    }

    return () => {
      if (syncSubscription.current) {
        syncSubscription.current.unsubscribe();
      }
    };
  }, [isConnected, roomCode, stompClient, activeProfile, setPlaying, setTime]);

  return {
    sendSync,
    sendChat,
    sendReaction
  };
}
