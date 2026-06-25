import React from 'react';
import clsx from 'clsx';

export default function Avatar({ src, alt, fallback, size = 'md', isOnline = false, className }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  };

  return (
    <div className={clsx("relative inline-block", sizes[size], className)}>
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="w-full h-full rounded-full object-cover border-2 border-ethos-surface"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-ethos-elevated flex items-center justify-center font-bold text-ethos-teal border-2 border-ethos-surface">
          {fallback || "?"}
        </div>
      )}
      
      {isOnline && (
        <span className="absolute bottom-0 right-0 block w-3 h-3 rounded-full bg-ethos-success ring-2 ring-ethos-surface" />
      )}
    </div>
  );
}
