import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import VideoCard from '../components/content/VideoCard';
import VideoDetailPage from './VideoDetailPage';
import { userApi } from '../api/userApi';
import { useAuthStore } from '../store/authStore';
import Skeleton from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

export default function MyListPage() {
  const { activeProfile } = useAuthStore();
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const navigate = useNavigate();

  const loadWatchlist = async () => {
    if (!activeProfile) return;
    setIsLoading(true);
    try {
      const data = await userApi.getWatchlist(activeProfile.id);
      // data.content is an array of MyList objects with {video, addedAt}
      setWatchlist(data.content?.map(item => item.video) || []);
    } catch (err) {
      toast.error('Failed to load My List');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, [activeProfile]);

  const handleMoreClick = (video) => {
    setSelectedVideo(video);
    setIsDetailOpen(true);
  };

  const handlePlayClick = (id) => {
    navigate(`/watch/${id}`);
  };

  const handleModalClose = () => {
    setIsDetailOpen(false);
    // Reload watchlist in case they removed it in the modal
    loadWatchlist();
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-space font-bold text-white mb-8">My List</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="w-full aspect-video" />
            ))}
          </div>
        ) : watchlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {watchlist.map((video) => (
              <div key={video.id} className="w-full">
                <VideoCard 
                  video={video} 
                  onClickMore={handleMoreClick} 
                  onClickPlay={handlePlayClick} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-ethos-surface rounded-xl border border-ethos-border">
            <Plus className="w-16 h-16 text-ethos-border mx-auto mb-6" />
            <h2 className="text-2xl font-space font-bold text-white mb-2">Your list is empty</h2>
            <p className="text-ethos-muted mb-6">Save shows and movies to keep track of what you want to watch.</p>
            <Button onClick={() => navigate('/browse')}>
              Find something to watch
            </Button>
          </div>
        )}
      </div>

      <VideoDetailPage 
        video={selectedVideo} 
        isOpen={isDetailOpen} 
        onClose={handleModalClose} 
      />
    </PageWrapper>
  );
}
