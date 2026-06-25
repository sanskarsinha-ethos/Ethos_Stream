import React from 'react';

export default function SubtitleOverlay({ text }) {
  if (!text) return null;

  return (
    <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none z-10 px-4">
      <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded text-white text-lg md:text-xl lg:text-2xl font-medium text-center shadow-lg" style={{ textShadow: '1px 1px 2px black' }}>
        {text}
      </div>
    </div>
  );
}
