import React, { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import clsx from 'clsx';

export default function QualitySelector({ qualities, changeQuality }) {
  const [isOpen, setIsOpen] = useState(false);
  const { quality } = usePlayerStore();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!qualities || qualities.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-ethos-teal transition-colors focus:outline-none p-2"
        title="Quality Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-32 bg-ethos-surface border border-ethos-border rounded-md shadow-lg overflow-hidden py-1 z-50">
          <button
            onClick={() => { changeQuality(-1); setIsOpen(false); }}
            className={clsx(
              "w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-ethos-elevated",
              quality === -1 ? "text-ethos-teal" : "text-ethos-muted hover:text-white"
            )}
          >
            Auto
            {quality === -1 && <span className="w-2 h-2 rounded-full bg-ethos-teal"></span>}
          </button>
          
          {[...qualities].reverse().map((q, index) => {
            // Because reversing, actual index in original array needs to be calculated
            const originalIndex = qualities.length - 1 - index;
            return (
              <button
                key={originalIndex}
                onClick={() => { changeQuality(originalIndex); setIsOpen(false); }}
                className={clsx(
                  "w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-ethos-elevated",
                  quality === originalIndex ? "text-ethos-teal" : "text-ethos-muted hover:text-white"
                )}
              >
                {q.height}p
                {quality === originalIndex && <span className="w-2 h-2 rounded-full bg-ethos-teal"></span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
