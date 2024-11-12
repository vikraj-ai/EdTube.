import React, { useState } from 'react';
import { Menu, Bell, UserCircle, BookOpen, Search, Clock, X } from 'lucide-react';
import MobileSearch from './MobileSearch';
import ProfileModal from './ProfileModal';
import { useVideo } from '../context/VideoContext';

interface HeaderProps {
  onSearch: (query: string) => void;
  onMenuClick: () => void;
  searchQuery: string;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onMenuClick, searchQuery }) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { searchHistory, addToSearchHistory, removeFromSearchHistory, clearSearchHistory } = useVideo();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      onSearch(query);
      addToSearchHistory(query);
      setIsSearchHistoryOpen(false);
    }
  };

  const handleSearchHistoryClick = (query: string) => {
    onSearch(query);
    setIsSearchHistoryOpen(false);
  };

  return (
    <>
      <div className="fixed top-0 w-full bg-white dark:bg-gray-900 shadow-sm z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <button 
              onClick={onMenuClick} 
              className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full"
            >
              <Menu className="h-6 w-6 dark:text-white" />
            </button>
            <div className="flex items-center gap-1">
              <BookOpen className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold dark:text-white">EdTube</span>
            </div>
          </div>
          
          <form 
            onSubmit={handleSearch} 
            className="flex-1 max-w-2xl mx-4 hidden sm:block relative"
          >
            <div className="relative">
              <input
                name="search"
                type="text"
                defaultValue={searchQuery}
                placeholder="Search educational content"
                className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 dark:text-white"
                onFocus={() => setIsSearchHistoryOpen(true)}
              />
              <button type="submit" className="absolute right-3 top-2.5">
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {isSearchHistoryOpen && searchHistory.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Recent Searches</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      clearSearchHistory();
                      setIsSearchHistoryOpen(false);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchHistory.map((query, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleSearchHistoryClick(query);
                        }}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
                      >
                        <Clock className="h-4 w-4" />
                        <span>{query}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromSearchHistory(query);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <Search className="h-6 w-6 dark:text-white" />
            </button>
            <Bell className="h-6 w-6 dark:text-white cursor-pointer" />
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1"
            >
              <UserCircle className="h-8 w-8 dark:text-white" />
            </button>
          </div>
        </div>
      </div>

      {isMobileSearchOpen && (
        <MobileSearch
          onSearch={(query) => {
            if (query.trim()) {
              onSearch(query);
              addToSearchHistory(query);
            }
            setIsMobileSearchOpen(false);
          }}
          onClose={() => setIsMobileSearchOpen(false)}
          initialQuery={searchQuery}
          searchHistory={searchHistory}
          onSearchHistoryClick={handleSearchHistoryClick}
          onRemoveFromHistory={removeFromSearchHistory}
          onClearHistory={clearSearchHistory}
        />
      )}

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default Header;