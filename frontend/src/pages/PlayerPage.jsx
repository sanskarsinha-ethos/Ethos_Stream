import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EthosPlayer from '../components/player/EthosPlayer';
import { contentApi } from '../api/contentApi';
import { watchPartyApi } from '../api/watchPartyApi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function PlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeProfile } = useAuthStore();
  const [video, setVideo] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const vid = await contentApi.getVideoById(id);
        setVideo(vid);
        
        try {
          const stream = await contentApi.getStreamUrl(id);
          setStreamUrl(stream.url);
        } catch (streamErr) {
          toast.error('Failed to load video stream');
        }
      } catch (err) {
        toast.error('Failed to load video metadata');
        navigate('/browse');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) loadVideo();
  }, [id, navigate]);

  const handleStartRoom = async () => {
    if (!activeProfile || !video) return;
    try {
      const room = await watchPartyApi.createRoom({ videoId: video.id, profileId: activeProfile.id });
      navigate(`/watch-party/${room.code}`);
    } catch (err) {
      toast.error('Failed to create room');
    }
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-ethos-teal"></div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      <EthosPlayer 
        video={video} 
        streamUrl={streamUrl} 
        onStartRoom={handleStartRoom} 
      />
    </div>
  );
}
