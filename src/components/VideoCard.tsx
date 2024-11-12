import React from 'react';
import { Clock, Check } from 'lucide-react';
import { Video } from '../types';
import { useVideo } from '../context/VideoContext';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  const { addToWatchLater, removeFromWatchLater, isInWatchLater } = useVideo();
  const inWatchLater = isInWatchLater(video.id);

  const handleWatchLater = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchLater) {
      removeFromWatchLater(video.id);
    } else {
      addToWatchLater(video);
    }
  };

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-video">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleWatchLater}
          className="absolute top-2 right-2 p-2 bg-black bg-opacity-75 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-90"
        >
          {inWatchLater ? (
            <Check className="w-5 h-5 text-white" />
          ) : (
            <Clock className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
      <div className="p-3">
        <div className="flex gap-3">
          <img
            src={video.avatar}
            alt={video.channel}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold line-clamp-2">{video.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{video.channel}</p>
            <div className="flex items-center text-sm text-gray-600">
              <span>{video.views}</span>
              <span className="mx-1">•</span>
              <span>{video.timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;