export interface Video {
  id: string;
  thumbnail: string;
  title: string;
  channel: string;
  channelId: string;
  views: string;
  timestamp: string;
  avatar: string;
  category?: string;
  tags?: string[];
}

export interface Category {
  icon: JSX.Element;
  name: string;
  query?: string;
}

export interface ViewingMetrics {
  videoId: string;
  watchCount: number;
  lastWatched: number;
  watchDuration: number;
  category?: string;
  completed: boolean;
}

export interface UserProfile {
  name: string;
  grade: string;
  subjects: string[];
  favoriteChannels: {
    name: string;
    id: string;
  }[];
  interests: string[];
}