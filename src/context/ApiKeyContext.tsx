import React, { createContext, useContext, useState, useEffect } from 'react';

interface ApiKeyContextType {
  apiKeys: string[];
  currentKeyIndex: number;
  addApiKey: (key: string) => void;
  removeApiKey: (index: number) => void;
  hasRequiredKeys: boolean;
  rotateApiKey: () => number;
  getNextValidKey: () => Promise<string | null>;
  isValidating: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  const addApiKey = (key: string) => {
    setApiKeys(prev => [...prev, key]);
  };

  const removeApiKey = (index: number) => {
    setApiKeys(prev => prev.filter((_, i) => i !== index));
    if (currentKeyIndex >= index) {
      setCurrentKeyIndex(prev => Math.max(0, prev - 1));
    }
  };

  const rotateApiKey = () => {
    const nextIndex = (currentKeyIndex + 1) % apiKeys.length;
    setCurrentKeyIndex(nextIndex);
    return nextIndex;
  };

  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&key=${key}`
      );
      return response.status === 200;
    } catch {
      return false;
    }
  };

  const getNextValidKey = async (): Promise<string | null> => {
    if (apiKeys.length === 0) return null;
    
    setIsValidating(true);
    try {
      const startIndex = currentKeyIndex;
      let currentIndex = startIndex;
      
      do {
        const key = apiKeys[currentIndex];
        const isValid = await validateApiKey(key);
        
        if (isValid) {
          setCurrentKeyIndex(currentIndex);
          return key;
        }
        
        currentIndex = (currentIndex + 1) % apiKeys.length;
      } while (currentIndex !== startIndex);
      
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const hasRequiredKeys = apiKeys.length >= 5;

  useEffect(() => {
    const storedKeys = localStorage.getItem('youtubeApiKeys');
    if (storedKeys) {
      setApiKeys(JSON.parse(storedKeys));
    }
  }, []);

  useEffect(() => {
    if (apiKeys.length > 0) {
      localStorage.setItem('youtubeApiKeys', JSON.stringify(apiKeys));
    }
  }, [apiKeys]);

  return (
    <ApiKeyContext.Provider value={{
      apiKeys,
      currentKeyIndex,
      addApiKey,
      removeApiKey,
      hasRequiredKeys,
      rotateApiKey,
      getNextValidKey,
      isValidating
    }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKeys = () => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKeys must be used within an ApiKeyProvider');
  }
  return context;
};