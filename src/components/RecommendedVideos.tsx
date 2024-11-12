import React, { useEffect, useCallback } from 'react';
import { useVideo } from '../context/VideoContext';
import VideoCard from './VideoCard';
import { Sparkles } from 'lucide-react';

const RecommendedVideos: React.FC = () => {
  const { recommendations, getRecommendations, watchHistory } = useVideo();

  const updateRecommendations = useCallback(() => {
    getRecommendations();
  }, [getRecommendations]);

  useEffect(() => {
    updateRecommendations();
  }, [updateRecommendations, watchHistory.length]);

  if (!recommendations.length) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h2 className="text-xl font-semibold">Recommended for you</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {recommendations.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedVideos;