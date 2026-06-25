import React from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Users, RotateCcw, RotateCw, Subtitles } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { formatTimestamp } from '../../utils/formatTime';
import QualitySelector from './QualitySelector';
import Button from '../ui/Button';

export default function PlayerControls({ 
  videoRef, 
  title, 
  onPlayPause, 
  qualities, 
  changeQuality, 
  onStartRoom,
  isFullscreen,
  toggleFullscreen
}) {
  const { isPlaying, currentTime, duration, isMuted, volume, setMuted, setVolume } = usePlayerStore();

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
    }
  };

  const skip = (amount) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol === 0) {
      setMuted(true);
    } else if (isMuted) {
      setMuted(false);
    }
  };

  const toggleMute = () => {
    setMuted(!isMuted);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end transition-opacity duration-300">
      
      {/* Progress Bar */}
      <div 
        className="relative h-1.5 bg-ethos-border/50 rounded-full mb-6 cursor-pointer group"
        onClick={handleSeek}
      >
        {/* Hover area expansion */}
        <div className="absolute -top-3 -bottom-3 left-0 right-0" />
        
        <div 
          className="absolute top-0 left-0 bottom-0 bg-ethos-teal rounded-full"
          style={{ width: `${progressPercent}%` }}
        >
          {/* Scrubber Dot */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform shadow-lg" />
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between">
        
        {/* Left Controls */}
        <div className="flex items-center space-x-4">
          <button onClick={onPlayPause} className="text-white hover:text-ethos-teal transition-colors focus:outline-none">
            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
          </button>
          
          <button onClick={() => skip(-10)} className="text-white hover:text-ethos-teal transition-colors focus:outline-none" title="Rewind 10s">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={() => skip(10)} className="text-white hover:text-ethos-teal transition-colors focus:outline-none" title="Forward 10s">
            <RotateCw className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 group relative">
            <button onClick={toggleMute} className="text-white hover:text-ethos-teal transition-colors focus:outline-none">
              {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            <input 
              type="range" 
              min="0" max="1" step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-0 group-hover:w-20 transition-all duration-300 origin-left opacity-0 group-hover:opacity-100 accent-ethos-teal"
            />
          </div>

          <span className="text-white font-mono text-sm ml-2">
            {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
          </span>
        </div>

        {/* Center Title */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <h3 className="text-white font-medium text-lg truncate max-w-sm drop-shadow-md">{title}</h3>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4">
          {onStartRoom && (
            <button 
              onClick={onStartRoom}
              className="text-ethos-amber hover:text-yellow-400 hover:bg-ethos-amber/10 p-2 rounded-full transition-colors focus:outline-none"
              title="Start Ethos Room"
            >
              <Users className="w-6 h-6" />
            </button>
          )}

          <button className="text-white hover:text-ethos-teal transition-colors focus:outline-none p-2" title="Subtitles">
            <Subtitles className="w-5 h-5" />
          </button>

          <QualitySelector qualities={qualities} changeQuality={changeQuality} />

          <button onClick={toggleFullscreen} className="text-white hover:text-ethos-teal transition-colors focus:outline-none p-2">
            {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}
