import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import VideoCard from './VideoCard';
import VideoPlayer from './VideoPlayer';

interface VideoHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoHistoryModal: React.FC<VideoHistoryModalProps> = ({ isOpen, onClose }) => {
  const { watchHistory, removeFromHistory } = useVideo();
  const [selectedVideo, setSelectedVideo] = useState<{
    id: string;
    title: string;
    channel: string;
  } | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="bg-white rounded-lg max-w-6xl mx-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Watch History</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-4">
            {watchHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No watch history yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchHistory.map((video) => (
                  <div key={video.id} className="relative group">
                    <VideoCard
                      video={video}
                      onClick={() => setSelectedVideo({
                        id: video.id,
                        title: video.title,
                        channel: video.channel
                      })}
                    />
                    <button
                      onClick={() => removeFromHistory(video.id)}
                      className="absolute top-2 right-2 p-2 bg-black bg-opacity-75 rounded-full 
                               opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-90"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedVideo && (
        <VideoPlayer
          videoId={selectedVideo.id}
          title={selectedVideo.title}
          channel={selectedVideo.channel}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default VideoHistoryModal;