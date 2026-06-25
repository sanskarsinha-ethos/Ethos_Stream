import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import VideoCard from './VideoCard';
import Skeleton from '../ui/Skeleton';

export default function ContentRow({ title, videos, isLoading, seeAllLink, onClickMore, onClickPlay }) {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    handleScroll();
  }, [videos]);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth + 100 : clientWidth - 100;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!isLoading && (!videos || videos.length === 0)) return null;

  return (
    <div className="mb-10 relative group">
      <div className="flex justify-between items-end px-4 sm:px-6 lg:px-8 mb-4">
        <h2 className="text-xl md:text-2xl font-space font-bold text-white">{title}</h2>
        {seeAllLink && (
          <Link to={seeAllLink} className="text-sm font-medium text-ethos-teal hover:text-white transition-colors">
            See All
          </Link>
        )}
      </div>

      <div className="relative">
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-4 w-12 bg-black/60 hover:bg-black/80 text-white z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        <div
          ref={rowRef}
          className="flex space-x-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={handleScroll}
        >
          {isLoading
            ? [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-72 aspect-video flex-shrink-0" />
              ))
            : videos.map((video) => (
                <div key={video.id} className="snap-start scroll-ml-4 sm:scroll-ml-6 lg:scroll-ml-8">
                  <VideoCard video={video} onClickMore={onClickMore} onClickPlay={onClickPlay} />
                </div>
              ))}
        </div>

        {showRightArrow && !isLoading && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-4 w-12 bg-black/60 hover:bg-black/80 text-white z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
}
