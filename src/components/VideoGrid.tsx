import React from 'react';
import { Video } from '../types';
import VideoCard from './VideoCard';
import VideoPlayer from './VideoPlayer';
import { useVideo } from '../context/VideoContext';
import { Sparkles } from 'lucide-react';

interface VideoGridProps {
  videos: Video[];
  showRecommendedLabel?: boolean;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, showRecommendedLabel }) => {
  const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null);
  const { addToHistory, recommendations } = useVideo();

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    addToHistory(video);
  };

  const isRecommended = (video: Video) => {
    return showRecommendedLabel && recommendations.some(r => r.id === video.id);
  };

  // Create a Set of video IDs to track duplicates
  const seenIds = new Set<string>();
  const uniqueVideos = videos.filter(video => {
    if (seenIds.has(video.id)) {
      return false;
    }
    seenIds.add(video.id);
    return true;
  });

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {uniqueVideos.map((video) => (
          <div key={`${video.id}-${isRecommended(video) ? 'recommended' : 'regular'}`} className="relative">
            {isRecommended(video) && (
              <div className="absolute -top-2 left-2 z-10 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Recommended
              </div>
            )}
            <VideoCard
              video={video}
              onClick={() => handleVideoSelect(video)}
            />
          </div>
        ))}
      </div>

      {selectedVideo && (
        <VideoPlayer
          videoId={selectedVideo.id}
          title={selectedVideo.title}
          channel={selectedVideo.channel}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
};

export default VideoGrid;