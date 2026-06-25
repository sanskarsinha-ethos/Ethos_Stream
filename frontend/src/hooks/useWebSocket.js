import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { supabase } from '../lib/supabaseClient';
import { useRoomStore } from '../store/roomStore';

export function useWebSocket(roomCode) {
  const stompClient = useRef(null);
  const { setConnected, addMessage, addReaction, setParticipants } = useRoomStore();

  useEffect(() => {
    if (!roomCode) return;

    let isSubscribed = true;

    const connect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
      const socket = new SockJS(`${wsUrl}?token=${session.access_token}`);
      
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: () => {
          if (!isSubscribed) return;
          setConnected(true);

          client.subscribe(`/topic/room/${roomCode}/chat`, (msg) => {
            const message = JSON.parse(msg.body);
            addMessage(message);
          });

          client.subscribe(`/topic/room/${roomCode}/reactions`, (msg) => {
            const reaction = JSON.parse(msg.body);
            addReaction(reaction);
          });

          client.subscribe(`/topic/room/${roomCode}/participants`, (msg) => {
            const update = JSON.parse(msg.body);
            if (update.participants) {
              setParticipants(update.participants);
            }
          });
        },
        onDisconnect: () => {
          setConnected(false);
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
        }
      });

      client.activate();
      stompClient.current = client;
    };

    connect();

    return () => {
      isSubscribed = false;
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [roomCode, setConnected, addMessage, addReaction, setParticipants]);

  const sendSync = (type, position, senderProfileId) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: `/app/room/${roomCode}/sync`,
        body: JSON.stringify({ type, position, timestamp: Date.now(), senderProfileId })
      });
    }
  };

  const sendChat = (content, type = 'text', profileId) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: `/app/room/${roomCode}/chat`,
        body: JSON.stringify({ roomCode, profileId, content, type })
      });
    }
  };

  const sendReaction = (emoji, x, y, profileId) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: `/app/room/${roomCode}/reaction`,
        body: JSON.stringify({ emoji, x, y, profileId })
      });
    }
  };

  return {
    sendSync,
    sendChat,
    sendReaction,
    stompClient
  };
}
