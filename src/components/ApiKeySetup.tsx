import React, { useState } from 'react';
import { useApiKeys } from '../context/ApiKeyContext';
import { KeyRound } from 'lucide-react';

const ApiKeySetup: React.FC = () => {
  const { apiKeys, addApiKey, hasRequiredKeys } = useApiKeys();
  const [currentKey, setCurrentKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    addApiKey(currentKey.trim());
    setCurrentKey('');
    setError('');
  };

  if (hasRequiredKeys) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-6">
          <KeyRound className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold">YouTube API Setup</h2>
        </div>
        
        <p className="mb-4 text-gray-600">
          Please provide {5 - apiKeys.length} more YouTube API key{5 - apiKeys.length > 1 ? 's' : ''} to enable video functionality.
        </p>
        
        <div className="mb-4">
          <div className="flex gap-2 flex-wrap">
            {Array(5).fill(0).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < apiKeys.length ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={currentKey}
              onChange={(e) => setCurrentKey(e.target.value)}
              placeholder="Enter YouTube API Key"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add API Key ({apiKeys.length}/5)
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeySetup;