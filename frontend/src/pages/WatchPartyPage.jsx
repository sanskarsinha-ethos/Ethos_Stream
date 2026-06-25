import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { useRoomStore } from '../store/roomStore';
import { useAuthStore } from '../store/authStore';
import { contentApi } from '../api/contentApi';
import EthosPlayer from '../components/player/EthosPlayer';
import Avatar from '../components/ui/Avatar';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Send, Users, LogOut, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WatchPartyPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { activeProfile } = useAuthStore();
  const { room, participants, messages, isConnected } = useRoomStore();
  const { sendChat, sendReaction } = useRoom(code);
  
  const [video, setVideo] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load video once room is joined
  useEffect(() => {
    if (room && room.videoId) {
      contentApi.getVideoById(room.videoId).then(setVideo).catch(console.error);
      contentApi.getStreamUrl(room.videoId)
        .then(res => setStreamUrl(res.url))
        .catch(() => toast.error('Failed to load video stream'));
    }
  }, [room]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeProfile) return;
    sendChat(chatInput, 'text', activeProfile.id);
    setChatInput('');
  };

  const handleReaction = (emoji) => {
    if (!activeProfile) return;
    const x = Math.random() * 80 + 10; // 10% to 90%
    const y = Math.random() * 80 + 10; // 10% to 90%
    sendReaction(emoji, x, y, activeProfile.id);
  };

  const handleLeaveRoom = () => {
    navigate('/browse');
  };

  if (!room) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ethos-amber mb-4"></div>
          <p>Joining Ethos Room {code}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black flex overflow-hidden">
      
      {/* Main Player Area */}
      <div className={`flex-1 relative transition-all duration-300 ${isSidebarOpen ? 'mr-80' : 'mr-0'}`}>
        {streamUrl && (
          <EthosPlayer 
            video={video} 
            streamUrl={streamUrl}
          />
        )}
        
        {/* Connection Status indicator */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
          {!isConnected && (
            <div className="bg-ethos-danger text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg animate-pulse">
              Reconnecting to room...
            </div>
          )}
        </div>

        {/* Reaction Buttons Overlay */}
        <div className="absolute right-6 bottom-32 z-40 flex flex-col space-y-2">
          {['😂', '😲', '😍', '🔥', '👏'].map(emoji => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="w-10 h-10 rounded-full bg-ethos-surface/80 border border-ethos-border text-xl hover:scale-110 hover:bg-ethos-surface transition-transform backdrop-blur-sm"
            >
              {emoji}
            </button>
          ))}
        </div>
        
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-6 right-6 z-50 p-2 rounded-md bg-ethos-surface/80 backdrop-blur-sm border border-ethos-border text-white hover:text-ethos-teal transition-colors ${isSidebarOpen ? 'hidden' : 'block'}`}
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>

      {/* Right Sidebar - Chat & Participants */}
      <div className={`fixed top-0 right-0 bottom-0 w-80 bg-ethos-bg border-l border-ethos-border flex flex-col transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-ethos-border flex items-center justify-between bg-ethos-surface">
          <div>
            <h2 className="text-white font-space font-bold flex items-center">
              <Users className="w-4 h-4 mr-2 text-ethos-amber" />
              Room {code}
            </h2>
            <p className="text-xs text-ethos-muted">{participants.length} / 4 watching</p>
          </div>
          <button onClick={handleLeaveRoom} className="text-ethos-danger hover:bg-red-500/10 p-2 rounded-md transition-colors" title="Leave Room">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Participants List */}
        <div className="p-4 border-b border-ethos-border flex space-x-2 overflow-x-auto">
          {participants.map(p => (
            <Avatar 
              key={p.profileId} 
              src={p.avatarUrl} 
              fallback={p.name?.[0] || '?'} 
              size="sm" 
              isOnline={true}
              title={p.name}
            />
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => {
            if (msg.type === 'system') {
              return (
                <div key={idx} className="text-center text-xs text-ethos-muted bg-ethos-elevated rounded-full py-1 px-3 w-max mx-auto">
                  {msg.content}
                </div>
              );
            }
            
            const isMe = msg.profileId === activeProfile?.id;
            
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-ethos-muted mb-1 px-1">
                  {isMe ? 'You' : msg.profileName || 'User'}
                </span>
                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-ethos-teal text-ethos-bg rounded-br-none' : 'bg-ethos-elevated text-white rounded-bl-none'}`}>
                  {msg.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-ethos-surface border-t border-ethos-border">
          <form onSubmit={handleSendChat} className="flex items-center space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-ethos-elevated border border-ethos-border rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-ethos-teal"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="w-10 h-10 rounded-full bg-ethos-amber text-ethos-bg flex items-center justify-center hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}
