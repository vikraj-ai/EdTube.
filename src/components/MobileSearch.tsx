import React, { useState } from 'react';
import { Search, ArrowLeft, Clock, X, Trash2 } from 'lucide-react';

interface MobileSearchProps {
  onSearch: (query: string) => void;
  onClose: () => void;
  initialQuery?: string;
  searchHistory: string[];
  onSearchHistoryClick: (query: string) => void;
  onRemoveFromHistory: (query: string) => void;
  onClearHistory: () => void;
}

const MobileSearch: React.FC<MobileSearchProps> = ({
  onSearch,
  onClose,
  initialQuery = '',
  searchHistory,
  onSearchHistoryClick,
  onRemoveFromHistory,
  onClearHistory,
}) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      <form onSubmit={handleSubmit} className="p-2 flex items-center gap-2 border-b dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <ArrowLeft className="w-6 h-6 dark:text-white" />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos..."
            className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 
                     bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 dark:text-white"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-3 top-2"
          >
            <Search className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </form>

      {searchHistory.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Recent Searches</h3>
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
          
          {searchHistory.map((historyQuery, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700"
            >
              <button
                onClick={() => onSearchHistoryClick(historyQuery)}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-200"
              >
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{historyQuery}</span>
              </button>
              <button
                onClick={() => onRemoveFromHistory(historyQuery)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileSearch;