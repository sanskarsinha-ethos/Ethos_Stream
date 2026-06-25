import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentApi } from '../api/contentApi';
import { userApi } from '../api/userApi';
import { useAuthStore } from '../store/authStore';
import HeroBanner from '../components/content/HeroBanner';
import ContentRow from '../components/content/ContentRow';
import VideoDetailPage from './VideoDetailPage';
import PageWrapper from '../components/layout/PageWrapper';
import toast from 'react-hot-toast';

export default function BrowsePage() {
  const { activeProfile } = useAuthStore();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState(null);
  const [history, setHistory] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [trending, setTrending] = useState([]);
  const [action, setAction] = useState([]);
  const [comedy, setComedy] = useState([]);
  
  const [loading, setLoading] = useState(true);
  
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (!activeProfile) return;

    const loadContent = async () => {
      setLoading(true);
      try {
        const [featuredRes, histRes, recRes, trendRes, actRes, comRes] = await Promise.all([
          contentApi.getFeaturedVideos(),
          userApi.getHistory(activeProfile.id),
          contentApi.getRecommendations(activeProfile.id),
          contentApi.getVideos({ size: 10 }), // Mock trending
          contentApi.getVideos({ genre: 'Action & Thriller', size: 10 }),
          contentApi.getVideos({ genre: 'Comedy', size: 10 })
        ]);

        if (featuredRes.content?.length > 0) {
          setFeatured(featuredRes.content[0]);
        }
        setHistory(histRes.content?.map(h => h.video) || []);
        setRecommended(recRes || []);
        setTrending(trendRes.content || []);
        setAction(actRes.content || []);
        setComedy(comRes.content || []);
      } catch (err) {
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [activeProfile]);

  const handleMoreClick = (video) => {
    setSelectedVideo(video);
    setIsDetailOpen(true);
  };

  const handlePlayClick = (id) => {
    navigate(`/watch/${id}`);
  };

  return (
    <PageWrapper>
      <div className="pb-20">
        <HeroBanner video={featured} />
        
        <div className="mt-[-8vh] sm:mt-[-12vh] relative z-20 space-y-12">
          {history.length > 0 && (
            <ContentRow 
              title="Continue Watching" 
              videos={history} 
              isLoading={loading} 
              onClickMore={handleMoreClick}
              onClickPlay={handlePlayClick}
            />
          )}
          
          <ContentRow 
            title="Recommended for You" 
            videos={recommended} 
            isLoading={loading} 
            onClickMore={handleMoreClick}
            onClickPlay={handlePlayClick}
          />
          
          <ContentRow 
            title="Trending Now" 
            videos={trending} 
            isLoading={loading} 
            onClickMore={handleMoreClick}
            onClickPlay={handlePlayClick}
          />

          {/* Ethos Room CTA Banner */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
            <div className="w-full bg-gradient-to-r from-ethos-amber/20 to-transparent border border-ethos-amber/30 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-2xl font-space font-bold text-white mb-2">Host an Ethos Room</h3>
                <p className="text-ethos-muted max-w-2xl">Watch perfectly in sync with your friends, chat in real-time, and share emoji reactions. Select any video and click "Start Ethos Room" to begin.</p>
              </div>
            </div>
          </div>

          <ContentRow 
            title="Action & Thriller" 
            videos={action} 
            isLoading={loading} 
            onClickMore={handleMoreClick}
            onClickPlay={handlePlayClick}
          />

          <ContentRow 
            title="Comedy" 
            videos={comedy} 
            isLoading={loading} 
            onClickMore={handleMoreClick}
            onClickPlay={handlePlayClick}
          />
        </div>
      </div>

      <VideoDetailPage 
        video={selectedVideo} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
    </PageWrapper>
  );
}
