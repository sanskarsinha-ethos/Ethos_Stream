import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { formatDuration } from '../../utils/formatTime';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function VideoCard({ video, onClickMore, onClickPlay }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative w-72 aspect-video bg-ethos-elevated rounded-md overflow-hidden cursor-pointer flex-shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        className="w-full h-full object-cover"
      />
      
      {/* Default Overlay Items */}
      <div className="absolute top-2 left-2">
        {video.isHD && <Badge variant="teal" className="bg-black/50 backdrop-blur-sm">HD</Badge>}
      </div>
      <div className="absolute top-2 right-2">
        <Badge variant="muted" className="bg-black/50 backdrop-blur-sm">
          {formatDuration(video.durationSeconds)}
        </Badge>
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-t from-ethos-bg via-ethos-bg/60 to-transparent p-4 flex flex-col justify-end ring-2 ring-ethos-teal z-10"
          >
            <h4 className="text-white font-bold truncate mb-1">{video.title}</h4>
            <div className="flex flex-wrap gap-1 mb-3">
              {video.genres?.slice(0, 3).map((g) => (
                <span key={g} className="text-xs text-ethos-teal">• {g}</span>
              ))}
            </div>
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1 px-0" onClick={(e) => { e.stopPropagation(); onClickPlay(video.id); }}>
                <Play className="w-4 h-4 fill-current mr-1" /> Play
              </Button>
              <Button size="sm" variant="ghost" className="px-2 border-ethos-border bg-ethos-surface/50 backdrop-blur-sm hover:border-ethos-white hover:bg-ethos-elevated" onClick={(e) => { e.stopPropagation(); onClickMore(video); }}>
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
