import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface ProfileContextType {
  profile: UserProfile | null;
  updateProfile: (profile: UserProfile) => void;
  isProfileComplete: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  grade: '',
  subjects: [],
  favoriteChannels: [],
  interests: [],
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('userProfile');
    return stored ? JSON.parse(stored) : DEFAULT_PROFILE;
  });

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };

  const isProfileComplete = Boolean(
    profile &&
    profile.name &&
    profile.grade &&
    profile.subjects.length > 0
  );

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, isProfileComplete }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};