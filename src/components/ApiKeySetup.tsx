import React, { useState } from 'react';
import { useApiKeys } from '../context/ApiKeyContext';
import { KeyRound, ExternalLink, Youtube, BookOpen, ChevronRight } from 'lucide-react';
import ProfileModal from './ProfileModal';
import Guide from './Guide';

const ApiKeySetup: React.FC = () => {
  const { apiKeys, addApiKey, hasRequiredKeys } = useApiKeys();
  const [currentKey, setCurrentKey] = useState('');
  const [error, setError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    addApiKey(currentKey.trim());
    setCurrentKey('');
    setError('');

    if (apiKeys.length === 4) {
      setShowProfileModal(true);
    }
  };

  if (hasRequiredKeys && !showProfileModal) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-red-50/90 to-white/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg max-w-md w-full mx-auto overflow-hidden border border-red-100/50">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-400 to-red-500 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">EdTube API Setup</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Progress Indicator */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">API Keys Added</span>
                <span className="text-sm font-medium text-red-500">{apiKeys.length}/5</span>
              </div>
              <div className="w-full bg-red-50 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-red-400 to-red-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(apiKeys.length / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Setup Guide Button */}
            <button
              onClick={() => setShowGuide(true)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-50/50 to-red-100/50 rounded-xl border border-red-100/50 hover:from-red-100/50 hover:to-red-200/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">View Setup Guide</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* API Key Creation Link */}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-gradient-to-r from-red-50/50 to-red-100/50 rounded-xl border border-red-100/50 hover:from-red-100/50 hover:to-red-200/50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <KeyRound className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Create YouTube API Key</span>
                </div>
                <ExternalLink className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="mt-2 text-sm text-red-600/80">
                Visit Google Cloud Console to generate your YouTube Data API key
              </p>
            </a>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={currentKey}
                    onChange={(e) => setCurrentKey(e.target.value)}
                    placeholder="Enter YouTube API Key"
                    className="w-full px-4 py-3 bg-white/50 border border-red-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all placeholder:text-red-300"
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-400 to-red-500 text-white py-3 px-4 rounded-xl font-medium hover:from-red-500 hover:to-red-600 transition-all duration-200 focus:ring-2 focus:ring-red-200 focus:outline-none shadow-sm"
              >
                Add API Key
              </button>
            </form>

            <p className="text-sm text-red-500/70 text-center">
              {5 - apiKeys.length} more key{5 - apiKeys.length !== 1 ? 's' : ''} required to enable video functionality
            </p>
          </div>
        </div>
      </div>

      {showGuide && <Guide onClose={() => setShowGuide(false)} />}

      {showProfileModal && (
        <ProfileModal 
          isOpen={true} 
          onClose={() => setShowProfileModal(false)}
          isInitialSetup={true}
        />
      )}
    </>
  );
};

export default ApiKeySetup;