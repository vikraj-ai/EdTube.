import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Video, ViewingMetrics } from '../types';
import { useProfile } from './ProfileContext';
import { searchChannelVideos } from '../services/youtube';
import { useApiKeys } from './ApiKeyContext';

interface VideoContextType {
  watchHistory: Video[];
  watchLater: Video[];
  searchHistory: string[];
  viewportMode: 'desktop' | 'mobile';
  viewingMetrics: Record<string, ViewingMetrics>;
  recommendations: Video[];
  addToHistory: (video: Video) => void;
  removeFromHistory: (videoId: string) => void;
  addToWatchLater: (video: Video) => void;
  removeFromWatchLater: (videoId: string) => void;
  isInWatchLater: (videoId: string) => boolean;
  setViewportMode: (mode: 'desktop' | 'mobile') => void;
  updateViewingMetrics: (videoId: string, duration: number, completed: boolean) => void;
  getRecommendations: () => void;
  addToSearchHistory: (query: string) => void;
  removeFromSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchHistory, setWatchHistory] = useState<Video[]>([]);
  const [watchLater, setWatchLater] = useState<Video[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [viewingMetrics, setViewingMetrics] = useState<Record<string, ViewingMetrics>>({});
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const { profile } = useProfile();
  const { getNextValidKey } = useApiKeys();

  useEffect(() => {
    const storedHistory = localStorage.getItem('watchHistory');
    const storedWatchLater = localStorage.getItem('watchLater');
    const storedMetrics = localStorage.getItem('viewingMetrics');
    const storedSearchHistory = localStorage.getItem('searchHistory');
    
    if (storedHistory) setWatchHistory(JSON.parse(storedHistory));
    if (storedWatchLater) setWatchLater(JSON.parse(storedWatchLater));
    if (storedMetrics) setViewingMetrics(JSON.parse(storedMetrics));
    if (storedSearchHistory) setSearchHistory(JSON.parse(storedSearchHistory));
  }, []);

  const addToHistory = useCallback((video: Video) => {
    setWatchHistory(prev => {
      const filtered = prev.filter(v => v.id !== video.id);
      const updated = [video, ...filtered].slice(0, 50);
      localStorage.setItem('watchHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((videoId: string) => {
    setWatchHistory(prev => {
      const updated = prev.filter(v => v.id !== videoId);
      localStorage.setItem('watchHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addToSearchHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q !== query);
      const updated = [query, ...filtered].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromSearchHistory = useCallback((query: string) => {
    setSearchHistory(prev => {
      const updated = prev.filter(q => q !== query);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  const updateViewingMetrics = useCallback((videoId: string, duration: number, completed: boolean) => {
    setViewingMetrics(prev => {
      const video = watchHistory.find(v => v.id === videoId);
      const metrics = prev[videoId] || {
        videoId,
        watchCount: 0,
        lastWatched: 0,
        watchDuration: 0,
        category: video?.category,
        completed: false
      };

      const updated = {
        ...prev,
        [videoId]: {
          ...metrics,
          watchCount: metrics.watchCount + 1,
          lastWatched: Date.now(),
          watchDuration: metrics.watchDuration + duration,
          completed: metrics.completed || completed
        }
      };

      localStorage.setItem('viewingMetrics', JSON.stringify(updated));
      return updated;
    });
  }, [watchHistory]);

  const getRecommendations = useCallback(async () => {
    if (!profile) return;

    const validKey = await getNextValidKey();
    if (!validKey) return;

    // Get videos from favorite channels
    const channelVideos = await Promise.all(
      profile.favoriteChannels.map(async channel => {
        const keywords = [
          ...profile.subjects,
          ...profile.interests,
          profile.grade
        ].join(' ');
        return searchChannelVideos(validKey, channel.id, keywords);
      })
    );

    // Flatten and filter channel videos
    const recommendedVideos = channelVideos
      .flat()
      .filter(video => !watchHistory.slice(0, 5).some(v => v.id === video.id));

    // Sort by relevance to user's interests and subjects
    const scoredVideos = recommendedVideos.map(video => {
      let score = 0;

      // Score based on title matching interests and subjects
      const titleLower = video.title.toLowerCase();
      [...profile.interests, ...profile.subjects].forEach(keyword => {
        if (titleLower.includes(keyword.toLowerCase())) {
          score += 2;
        }
      });

      // Score based on grade level
      if (titleLower.includes(profile.grade.toLowerCase())) {
        score += 3;
      }

      return { video, score };
    });

    const sortedVideos = scoredVideos
      .sort((a, b) => b.score - a.score)
      .map(({ video }) => video);

    setRecommendations(sortedVideos);
  }, [profile, watchHistory, getNextValidKey]);

  const addToWatchLater = useCallback((video: Video) => {
    setWatchLater(prev => {
      if (prev.some(v => v.id === video.id)) return prev;
      const updated = [video, ...prev];
      localStorage.setItem('watchLater', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromWatchLater = useCallback((videoId: string) => {
    setWatchLater(prev => {
      const updated = prev.filter(v => v.id !== videoId);
      localStorage.setItem('watchLater', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isInWatchLater = useCallback((videoId: string) => {
    return watchLater.some(v => v.id === videoId);
  }, [watchLater]);

  return (
    <VideoContext.Provider value={{
      watchHistory,
      watchLater,
      searchHistory,
      viewportMode,
      viewingMetrics,
      recommendations,
      addToHistory,
      removeFromHistory,
      addToWatchLater,
      removeFromWatchLater,
      isInWatchLater,
      setViewportMode,
      updateViewingMetrics,
      getRecommendations,
      addToSearchHistory,
      removeFromSearchHistory,
      clearSearchHistory
    }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};