import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useApiKeys } from '../context/ApiKeyContext';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeysModal: React.FC<ApiKeysModalProps> = ({ isOpen, onClose }) => {
  const { apiKeys, addApiKey, removeApiKey } = useApiKeys();
  const [newKey, setNewKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    addApiKey(newKey.trim());
    setNewKey('');
    setError('');
  };

  const handleDelete = (index: number) => {
    removeApiKey(index);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Manage API Keys</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {apiKeys.map((key, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-mono text-sm">
                  {key.slice(0, 6)}...{key.slice(-4)}
                </div>
                <div className="text-xs text-gray-500">API Key {index + 1}</div>
              </div>
              <button 
                onClick={() => handleDelete(index)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Enter new API key"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeysModal;