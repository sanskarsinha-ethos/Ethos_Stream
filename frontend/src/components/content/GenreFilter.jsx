import React, { useRef } from 'react';
import clsx from 'clsx';

export default function GenreFilter({ genres, activeGenre, onSelectGenre }) {
  const scrollRef = useRef(null);

  // Allow mouse wheel horizontal scrolling
  const handleWheel = (e) => {
    if (scrollRef.current) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="relative w-full overflow-hidden mb-8">
      <div 
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex space-x-3 overflow-x-auto hide-scrollbar scroll-smooth px-4 sm:px-6 lg:px-8 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button
          onClick={() => onSelectGenre(null)}
          className={clsx(
            "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
            activeGenre === null
              ? "bg-ethos-teal text-ethos-bg border-ethos-teal"
              : "bg-ethos-elevated text-ethos-muted border-ethos-border hover:text-white hover:border-ethos-muted"
          )}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => onSelectGenre(genre)}
            className={clsx(
              "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
              activeGenre === genre
                ? "bg-ethos-teal text-ethos-bg border-ethos-teal"
                : "bg-ethos-elevated text-ethos-muted border-ethos-border hover:text-white hover:border-ethos-muted"
            )}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}
