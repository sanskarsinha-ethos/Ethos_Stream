import React from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { userApi } from '../../api/userApi';
import toast from 'react-hot-toast';
import { watchPartyApi } from '../../api/watchPartyApi';

export default function HeroBanner({ video, isInWatchlist, onWatchlistToggle }) {
  const navigate = useNavigate();
  const { activeProfile } = useAuthStore();

  if (!video) return <div className="w-full h-[60vh] bg-ethos-elevated animate-pulse" />;

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
        toast.success('Removed from My List');
      } else {
        await userApi.addToWatchlist(activeProfile.id, video.id);
        toast.success('Added to My List');
      }
      if (onWatchlistToggle) onWatchlistToggle();
    } catch (err) {
      toast.error('Failed to update My List');
    }
  };

  return (
    <div className="relative w-full h-[60vh] lg:h-[70vh] flex items-end pb-12 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={video.thumbnailUrl} // Ideally a bannerUrl if available, falling back to thumbnail
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ethos-bg via-ethos-bg/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ethos-bg via-ethos-bg/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          {video.genres && video.genres.length > 0 && (
            <Badge variant="teal" className="mb-4">
              {video.genres[0]}
            </Badge>
          )}

          <h1 className="text-4xl md:text-6xl font-space font-bold text-white mb-4">
            {video.title}
          </h1>
          
          <p className="text-lg text-ethos-muted mb-8 line-clamp-3">
            {video.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={() => navigate(`/watch/${video.id}`)}>
              <Play className="w-5 h-5 mr-2 fill-current" />
              Play Now
            </Button>
            
            <Button size="lg" variant="amber" onClick={handleStartRoom}>
              <Users className="w-5 h-5 mr-2" />
              Start Ethos Room
            </Button>
            
            <Button size="lg" variant="ghost" onClick={handleToggleWatchlist} className="border-ethos-border bg-ethos-surface/50 backdrop-blur-sm">
              {isInWatchlist ? <Check className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
              My List
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
