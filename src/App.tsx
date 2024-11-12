import React, { useState, useEffect } from 'react';
import { Compass, BookOpen, Trophy, Code2, Palette, Music2, FlaskConical } from 'lucide-react';
import Header from './components/Header';
import Categories from './components/Categories';
import VideoGrid from './components/VideoGrid';
import Sidebar from './components/Sidebar';
import ApiKeySetup from './components/ApiKeySetup';
import { ApiKeyProvider, useApiKeys } from './context/ApiKeyContext';
import { VideoProvider } from './context/VideoContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProfileProvider } from './context/ProfileContext';
import { useProfile } from './context/ProfileContext';
import { searchVideos, searchChannelVideos } from './services/youtube';
import { Video, Category } from './types';

const categories: Category[] = [
  { icon: <Compass size={20} />, name: 'Explore' },
  { icon: <Code2 size={20} />, name: 'Programming', query: 'programming tutorials' },
  { icon: <BookOpen size={20} />, name: 'Literature', query: 'literature lessons' },
  { icon: <FlaskConical size={20} />, name: 'Science', query: 'science education' },
  { icon: <Palette size={20} />, name: 'Arts', query: 'arts tutorials' },
  { icon: <Music2 size={20} />, name: 'Music', query: 'music lessons' },
  { icon: <Trophy size={20} />, name: 'Mathematics', query: 'mathematics tutorials' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function distributeChannelVideos(videos: Video[]): Video[] {
  // Group videos by channel
  const videosByChannel = videos.reduce((acc, video) => {
    if (!acc[video.channelId]) {
      acc[video.channelId] = [];
    }
    acc[video.channelId].push(video);
    return acc;
  }, {} as Record<string, Video[]>);

  // Create arrays of videos from each channel
  const channelArrays = Object.values(videosByChannel);
  
  // Initialize result array
  const distributed: Video[] = [];
  
  // Keep track of current index for each channel
  const indices = new Array(channelArrays.length).fill(0);
  
  // Distribute videos
  while (distributed.length < videos.length) {
    for (let i = 0; i < channelArrays.length; i++) {
      if (indices[i] < channelArrays[i].length) {
        distributed.push(channelArrays[i][indices[i]]);
        indices[i]++;
      }
    }
  }

  return distributed;
}

function AppContent() {
  const [selectedCategory, setSelectedCategory] = useState('Explore');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { apiKeys, getNextValidKey, isValidating } = useApiKeys();
  const { profile } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFavoriteChannelVideos = async () => {
    if (!apiKeys.length || !profile?.favoriteChannels.length) return;

    try {
      setLoading(true);
      setError(null);

      const validKey = await getNextValidKey();
      if (!validKey) {
        setError('No valid API keys available. Please check your API keys.');
        return;
      }

      // Fetch videos from all favorite channels
      const channelVideosPromises = profile.favoriteChannels.map(channel =>
        searchChannelVideos(validKey, channel.id)
      );

      const channelVideosArrays = await Promise.all(channelVideosPromises);
      const allChannelVideos = channelVideosArrays.flat();
      
      // Shuffle and distribute videos
      const distributedVideos = distributeChannelVideos(shuffleArray(allChannelVideos));
      setVideos(distributedVideos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load videos. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryVideos = async (query?: string) => {
    if (!apiKeys.length) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const validKey = await getNextValidKey();
      if (!validKey) {
        setError('No valid API keys available. Please check your API keys.');
        return;
      }

      const category = categories.find(c => c.name === selectedCategory);
      const searchQuery = query || category?.query || '';
      const { videos: fetchedVideos } = await searchVideos(
        validKey,
        searchQuery,
        '',
        async () => {
          const nextKey = await getNextValidKey();
          if (nextKey) {
            return fetchCategoryVideos(query);
          }
        }
      );
      
      const videosWithCategory = fetchedVideos.map(video => ({
        ...video,
        category: selectedCategory
      }));
      
      // Shuffle and distribute videos
      const distributedVideos = distributeChannelVideos(shuffleArray(videosWithCategory));
      setVideos(distributedVideos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load videos. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiKeys.length) {
      if (selectedCategory === 'Explore' && !searchQuery) {
        fetchFavoriteChannelVideos();
      } else {
        fetchCategoryVideos(searchQuery);
      }
    }
  }, [selectedCategory, apiKeys, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onSearch={handleSearch} 
        onMenuClick={toggleSidebar}
        searchQuery={searchQuery}
      />
      <Sidebar isOpen={isSidebarOpen} />
      <Categories
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
      
      <main className={`pt-32 px-4 pb-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : ''}`}>
        {loading || isValidating ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 dark:text-red-400 py-8">{error}</div>
        ) : (
          <VideoGrid 
            videos={videos}
            showRecommendedLabel={selectedCategory === 'Explore' && !searchQuery}
          />
        )}
      </main>
      <ApiKeySetup />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <ApiKeyProvider>
          <VideoProvider>
            <AppContent />
          </VideoProvider>
        </ApiKeyProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;