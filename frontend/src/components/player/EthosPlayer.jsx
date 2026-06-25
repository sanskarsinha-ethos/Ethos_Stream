import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../../hooks/usePlayer';
import PlayerControls from './PlayerControls';
import SubtitleOverlay from './SubtitleOverlay';
import clsx from 'clsx';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EthosPlayer({ video, streamUrl, onStartRoom }) {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { videoRef, togglePlay, qualities, changeQuality } = usePlayer(streamUrl);
  
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef(null);

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={clsx(
        "relative w-full bg-black group",
        isFullscreen ? "h-screen" : "h-full min-h-[50vh] aspect-video"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { if (!videoRef.current?.paused) setShowControls(false); }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      <SubtitleOverlay text="" />

      {/* Top Bar / Back Button */}
      <div className={clsx(
        "absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 z-20 flex items-center justify-between",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <button 
          onClick={() => navigate(-1)} 
          className="text-white hover:text-ethos-teal transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-8 h-8" />
          <span className="text-lg font-medium hidden sm:inline">Back to Browse</span>
        </button>
      </div>

      <div className={clsx(
        "transition-opacity duration-300 z-20",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <PlayerControls 
          videoRef={videoRef}
          title={video?.title}
          onPlayPause={togglePlay}
          qualities={qualities}
          changeQuality={changeQuality}
          onStartRoom={onStartRoom}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
        />
      </div>
    </div>
  );
}
