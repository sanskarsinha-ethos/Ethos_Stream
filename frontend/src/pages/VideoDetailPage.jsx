import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Users, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { watchPartyApi } from '../api/watchPartyApi';
import { userApi } from '../api/userApi';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';
import { formatDuration } from '../utils/formatTime';

export default function VideoDetailPage({ video, isOpen, onClose }) {
  const navigate = useNavigate();
  const { activeProfile } = useAuthStore();
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Ideally we would fetch watchlist status here, but for now we'll assume it's passed or handled via global state/query
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!video) return null;

  const handleStartRoom = async () => {
    if (!activeProfile) return;
    try {
      const room = await watchPartyApi.createRoom({ videoId: video.id, profileId: activeProfile.id });
      navigate(`/watch-party/${room.code}`);
    } catch (err) {
      toast.error('Failed to create room');
    }
  };

  const handleToggleWatchlist = async () => {
    if (!activeProfile) return;
    try {
      if (isInWatchlist) {
        await userApi.removeFromWatchlist(activeProfile.id, video.id);
        setIsInWatchlist(false);
        toast.success('Removed from My List');
      } else {
        await userApi.addToWatchlist(activeProfile.id, video.id);
        setIsInWatchlist(true);
        toast.success('Added to My List');
      }
    } catch (err) {
      toast.error('Failed to update My List');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-ethos-surface border border-ethos-border rounded-xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
          >
            {/* Banner Area */}
            <div className="relative w-full h-[40vh] sm:h-[50vh] flex-shrink-0">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ethos-surface via-ethos-surface/40 to-transparent" />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end">
                <h2 className="text-3xl sm:text-5xl font-space font-bold text-white mb-6 drop-shadow-lg">
                  {video.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="lg" onClick={() => navigate(`/watch/${video.id}`)} className="px-8 shadow-xl">
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Play
                  </Button>
                  <Button size="lg" variant="amber" onClick={handleStartRoom} className="shadow-xl">
                    <Users className="w-5 h-5 mr-2" />
                    Start Ethos Room
                  </Button>
                  <Button 
                    size="lg" 
                    variant="ghost" 
                    onClick={handleToggleWatchlist} 
                    className="border border-ethos-border bg-ethos-surface/50 backdrop-blur-sm shadow-xl"
                  >
                    {isInWatchlist ? <Check className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Details Area */}
            <div className="p-8 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-3 text-sm text-ethos-muted">
                    <span className="text-ethos-success font-medium">98% Match</span>
                    <span>2023</span>
                    <Badge variant="muted">{formatDuration(video.durationSeconds)}</Badge>
                    {video.isHD && <Badge variant="teal">HD</Badge>}
                  </div>
                  
                  <p className="text-lg text-white leading-relaxed">
                    {video.description}
                  </p>
                </div>
                
                <div className="w-full md:w-1/3 space-y-4 text-sm">
                  <div>
                    <span className="text-ethos-muted">Cast:</span>
                    <span className="ml-2 text-white">Actor One, Actor Two, Actor Three</span>
                  </div>
                  <div>
                    <span className="text-ethos-muted">Genres:</span>
                    <span className="ml-2 text-white">{video.genres?.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* More Like This (Placeholder Grid) */}
              <div className="mt-12">
                <h3 className="text-xl font-space font-bold text-white mb-6">More Like This</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-video bg-ethos-elevated rounded-md animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
