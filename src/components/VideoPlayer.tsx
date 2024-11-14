import React, { useEffect, useRef, useCallback, useState } from 'react';
import { X, Volume2, VolumeX, Maximize2, Minimize2, Play, Pause, Settings, SkipBack, SkipForward, ChevronRight, Check } from 'lucide-react';
import { useVideo } from '../context/VideoContext';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  channel: string;
  onClose: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const QUALITY_LEVELS = [
  { value: 'auto', label: 'Auto' },
  { value: 'hd1080', label: '1080p HD' },
  { value: 'hd720', label: '720p HD' },
  { value: 'large', label: '480p' },
  { value: 'medium', label: '360p' },
  { value: 'small', label: '240p' },
  { value: 'tiny', label: '144p' },
];

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, channel, onClose }) => {
  const { updateViewingMetrics } = useVideo();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
 
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'main' | 'speed' | 'quality'>('main');
  const startTimeRef = useRef(Date.now());
  const playerRef = useRef<any>(null);
  
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const youtubePlayerRef = useRef<any>(null);

  const initializeYouTubePlayer = useCallback(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    } else {
      createPlayer();
    }
  }, []);

  const createPlayer = () => {
    youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        cc_load_policy: isFullscreen ? 0 : 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onPlaybackQualityChange: (event: any) => {
          setCurrentQuality(event.data);
        },
      },
    });
  };

  const onPlayerReady = () => {
    setIsPlayerReady(true);
    setDuration(youtubePlayerRef.current.getDuration());
    setAvailableQualities(youtubePlayerRef.current.getAvailableQualityLevels());
    startTimeUpdate();
  };

  const onPlayerStateChange = (event: any) => {
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
  };




  const handleInteraction = useCallback(() => {
    // Show controls on any interaction
    setIsControlsVisible(true);

    // Clear the previous timeout to avoid hiding the controls prematurely
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Set a new timeout to hide controls after 10 seconds
    controlsTimeoutRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 5000); // 10 seconds
  }, []);

  useEffect(() => {
    // Initial setup for hiding controls after 10 seconds
    handleInteraction();

    // Cleanup timeout on unmount
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [handleInteraction]);

  const startTimeUpdate = () => {
    const updateTime = () => {
      if (youtubePlayerRef.current && !isDragging && isPlayerReady) {
        setCurrentTime(youtubePlayerRef.current.getCurrentTime());
      }
      requestAnimationFrame(updateTime);
    };
    updateTime();
  };

  const handleMetricsUpdate = useCallback((completed: boolean) => {
    const watchDuration = (Date.now() - startTimeRef.current) / 1000;
    updateViewingMetrics({
      videoId,
      watchTime: watchDuration,
      timestamp: Date.now(),
    });
  }, [videoId, updateViewingMetrics]);

  const togglePlay = () => {
    if (youtubePlayerRef.current && isPlayerReady) {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (seconds: number) => {
    if (youtubePlayerRef.current && isPlayerReady) {
      const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
      youtubePlayerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleMute = () => {
    if (youtubePlayerRef.current && isPlayerReady) {
      if (isMuted) {
        youtubePlayerRef.current.unMute();
        youtubePlayerRef.current.setVolume(volume);
      } else {
        youtubePlayerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    if (youtubePlayerRef.current && isPlayerReady) {
      youtubePlayerRef.current.setVolume(newVolume);
      if (isMuted && newVolume > 0) {
        youtubePlayerRef.current.unMute();
        setIsMuted(false);
      }
    }
    setVolume(newVolume);
  };

  const handleTimeUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (!isDragging && youtubePlayerRef.current && isPlayerReady) {
      youtubePlayerRef.current.seekTo(newTime, true);
    }
  };

  const handleTimeSliderMouseDown = () => {
    setIsDragging(true);
  };

  const handleTimeSliderMouseUp = () => {
    if (youtubePlayerRef.current && isPlayerReady) {
      youtubePlayerRef.current.seekTo(currentTime, true);
    }
    setIsDragging(false);
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    if (youtubePlayerRef.current && isPlayerReady) {
      youtubePlayerRef.current.setPlaybackRate(speed);
      setPlaybackSpeed(speed);
    }
    setIsSettingsOpen(false);
    setSettingsTab('main');
  };

  const handleQualityChange = (quality: string) => {
    if (youtubePlayerRef.current && isPlayerReady) {
      youtubePlayerRef.current.setPlaybackQuality(quality);
      setCurrentQuality(quality);
    }
    setIsSettingsOpen(false);
    setSettingsTab('main');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    initializeYouTubePlayer();
    return () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }
    };
  }, [initializeYouTubePlayer]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && youtubePlayerRef.current) {
        youtubePlayerRef.current.setOption('captions', 'track', { languageCode: 'en' });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      handleMetricsUpdate(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleMetricsUpdate(false);
    };
  }, [handleMetricsUpdate]);

  useEffect(() => {
    if (isHovering) {
      setIsControlsVisible(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isHovering && isPlaying && !isDragging && !isSettingsOpen) {
          setIsControlsVisible(false);
        }
      }, 2000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isHovering, isPlaying, isDragging, isSettingsOpen]);

  const handleClose = () => {
    handleMetricsUpdate(currentTime / duration >= 0.9);
    onClose();
  };

  return (<div className="video-container" onClick={handleInteraction}>
      
    <div className={`fixed inset-0 z-50 ${isFullscreen ? '' : 'bg-black bg-opacity-75 p-4'}`}>
      <div 
        ref={videoContainerRef}
        className={`relative ${isFullscreen ? 'w-full h-full' : 'max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg overflow-hidden'}`}
      >
        {!isFullscreen && (
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold truncate dark:text-white">{title}</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6 dark:text-white" />
            </button>
          </div>
        )}
        
        <div 
          className={`relative ${isFullscreen ? 'h-full' : 'aspect-video'} bg-black`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div ref={playerRef} className="absolute inset-0 w-full h-full" />
          
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300
                      ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={currentTime}
                  onChange={handleTimeUpdate}
                  onMouseDown={handleTimeSliderMouseDown}
                  onMouseUp={handleTimeSliderMouseUp}
                  onTouchStart={handleTimeSliderMouseDown}
                  onTouchEnd={handleTimeSliderMouseUp}
                  className="w-full h-1 bg-gray-200/30 rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                           [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => seek(-10)} className="text-white hover:text-gray-300">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button onClick={togglePlay} className="text-white hover:text-gray-300">
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  <button onClick={() => seek(10)} className="text-white hover:text-gray-300">
                    <SkipForward className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-white hover:text-gray-300">
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-200/30 rounded-lg appearance-none cursor-pointer
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                               [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white
                               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                  <div className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsSettingsOpen(!isSettingsOpen);
                        setSettingsTab('main');
                      }}
                      className="text-white hover:text-gray-300"
                    >
                      <Settings className="w-5 h-5" />
                    </button>

                    {isSettingsOpen && (
                      <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden">
                        {settingsTab === 'main' && (
                          <div className="p-2">
                            <button
                              onClick={() => setSettingsTab('speed')}
                              className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                            >
                              <span>Playback Speed</span>
                              <div className="flex items-center">
                                <span className="mr-2">{playbackSpeed}x</span>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </button>
                            <button
                              onClick={() => setSettingsTab('quality')}
                              className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                            >
                              <span>Quality</span>
                              <div className="flex items-center">
                                <span className="mr-2">
                                  {QUALITY_LEVELS.find(q => q.value === currentQuality)?.label || 'Auto'}
                                </span>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </button>
                          </div>
                        )}

                        {settingsTab === 'speed' && (
                          <div className="p-2">
                            {PLAYBACK_SPEEDS.map(speed => (
                              <button
                                key={speed}
                                onClick={() => handlePlaybackSpeedChange(speed)}
                                className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                              >
                                <span>{speed}x</span>
                                {speed === playbackSpeed && (
                                  <Check className="w-4 h-4 text-blue-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {settingsTab === 'quality' && (
                          <div className="p-2">
                            {QUALITY_LEVELS.filter(quality => 
                              quality.value === 'auto' || availableQualities.includes(quality.value)
                            ).map(quality => (
                              <button
                                key={quality.value}
                                onClick={() => handleQualityChange(quality.value)}
                                className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                              >
                                <div className="flex flex-col items-start">
                                  <span>{quality.label}</span>
                                  {quality.value === 'auto' && (
                                    <span className="text-xs text-gray-500">Recommended</span>
                                  )}
                                </div>
                                {quality.value === currentQuality && (
                                  <Check className="w-4 h-4 text-blue-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button onClick={toggleFullscreen} className="text-white hover:text-gray-300">
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {!isFullscreen && (
          <div className="p-4">
            <h3 className="font-medium text-lg dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{channel}</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default VideoPlayer;