import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import GenreFilter from '../components/content/GenreFilter';
import VideoCard from '../components/content/VideoCard';
import VideoDetailPage from './VideoDetailPage';
import { contentApi } from '../api/contentApi';
import Skeleton from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [genres, setGenres] = useState([]);
  const [activeGenre, setActiveGenre] = useState(null);
  
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Load genres
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await contentApi.getGenres();
        setGenres(data);
      } catch (err) {
        console.error('Failed to load genres');
      }
    };
    loadGenres();
  }, []);

  // Fetch results based on debounced query or active genre
  useEffect(() => {
    if (!debouncedQuery && !activeGenre) {
      setResults([]);
      return;
    }

    const searchVideos = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (debouncedQuery) params.search = debouncedQuery;
        if (activeGenre) params.genre = activeGenre;
        
        const data = await contentApi.getVideos(params);
        setResults(data.content || []);
      } catch (err) {
        toast.error('Search failed');
      } finally {
        setIsLoading(false);
      }
    };

    searchVideos();
  }, [debouncedQuery, activeGenre]);

  const handleMoreClick = (video) => {
    setSelectedVideo(video);
    setIsDetailOpen(true);
  };

  const handlePlayClick = (id) => {
    navigate(`/watch/${id}`);
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Input */}
        <div className="relative mb-10">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-ethos-muted" />
          </div>
          <input
            type="text"
            className="w-full bg-ethos-elevated border border-ethos-border rounded-lg pl-12 pr-4 py-4 text-xl text-white placeholder-ethos-muted focus:outline-none focus:ring-2 focus:ring-ethos-teal focus:border-transparent transition-all"
            placeholder="Search movies, series, or genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Genre Filter */}
        <GenreFilter 
          genres={genres} 
          activeGenre={activeGenre} 
          onSelectGenre={(g) => setActiveGenre(g)} 
        />

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} className="w-full aspect-video" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((video) => (
              <div key={video.id} className="w-full">
                <VideoCard 
                  video={video} 
                  onClickMore={handleMoreClick} 
                  onClickPlay={handlePlayClick} 
                />
              </div>
            ))}
          </div>
        ) : (debouncedQuery || activeGenre) ? (
          <div className="text-center py-20">
            <p className="text-xl text-ethos-muted mb-4">No matches found for "{debouncedQuery || activeGenre}".</p>
            <p className="text-ethos-muted">Try searching for a different title or genre.</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-ethos-border mx-auto mb-6" />
            <p className="text-xl text-ethos-muted">Start typing to search or select a genre above.</p>
          </div>
        )}
      </div>

      <VideoDetailPage 
        video={selectedVideo} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
    </PageWrapper>
  );
}
