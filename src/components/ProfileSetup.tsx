import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useProfile } from '../context/ProfileContext';
import { BookOpen, GraduationCap, Sparkles } from 'lucide-react';

import { X, Plus, Search, Trash2 ,AlertCircle} from 'lucide-react';

import axios from 'axios';
import { YOUTUBE_API_BASE_URL } from '../config/youtube';
import { useApiKeys } from '../context/ApiKeyContext';
const GRADES = ['6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Literature',
  'History',
  'Geography',
];

const ProfileSetup: React.FC = () => {
  const { updateProfile, isProfileComplete } = useProfile();
  const { getNextValidKey } = useApiKeys();
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    grade: '',
    subjects: [],
    favoriteChannels: [],
    interests: [],
  });
  const [formError, setFormError] = useState('');
  const [interest, setInterest] = useState('');
  const [channelSearch, setChannelSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string }>>([]);
  const [errors, setErrors] = useState({
    channels: false,
    subjects: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate channels
    if (formData.favoriteChannels.length === 0) {
      setErrors(prev => ({ ...prev, channels: true }));
      return;
    }

    // Validate subjects
    if (formData.subjects.length === 0) {
      setErrors(prev => ({ ...prev, subjects: true }));
      return;
    }

    updateProfile(formData);
  };
 
  const searchChannels = async () => {
    if (!channelSearch.trim()) return;

    try {
      const apiKey = await getNextValidKey();
      if (!apiKey) return;

      const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
        params: {
          part: 'snippet',
          type: 'channel',
          q: channelSearch,
          maxResults: 5,
          key: apiKey,
        },
      });

      const channels = response.data.items.map((item: any) => ({
        id: item.snippet.channelId,
        name: item.snippet.channelTitle,
      }));

      setSearchResults(channels);
    } catch (error) {
      console.error('Failed to search channels:', error);
    }
  };

  const addChannel = (channel: { id: string; name: string }) => {
    if (!formData.favoriteChannels.some(c => c.id === channel.id)) {
      setFormData(prev => ({
        ...prev,
        favoriteChannels: [...prev.favoriteChannels, channel],
      }));
      // Clear channel error when adding a channel
      setErrors(prev => ({ ...prev, channels: false }));
    }
    setChannelSearch('');
    setSearchResults([]);
  };

  const removeChannel = (channelId: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteChannels: prev.favoriteChannels.filter(c => c.id !== channelId),
    }));
    // Set channel error if removing the last channel
    if (formData.favoriteChannels.length <= 1) {
      setErrors(prev => ({ ...prev, channels: true }));
    }
  };

  const addInterest = () => {
    if (interest.trim() && !formData.interests.includes(interest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()],
      }));
      setInterest('');
    }
  };

  if (isProfileComplete) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
            <GraduationCap className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold dark:text-white">Complete Your Profile</h2>
            <p className="text-gray-600 dark:text-gray-300">Help us personalize your learning experience</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Grade Level
            </label>
            <select
              value={formData.grade}
              onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Select your grade</option>
              {GRADES.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subjects
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SUBJECTS.map(subject => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      subjects: prev.subjects.includes(subject)
                        ? prev.subjects.filter(s => s !== subject)
                        : [...prev.subjects, subject],
                    }));
                    setErrors(prev => ({ ...prev, subjects: false }));
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.subjects.includes(subject)
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            {errors.subjects && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                <AlertCircle className="w-4 h-4" />
                <span>Please select at least one subject to proceed</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Favorite Educational Channels
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={channelSearch}
                onChange={e => setChannelSearch(e.target.value)}
                placeholder="Search for channels"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={searchChannels}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mb-4 border rounded-lg divide-y">
                {searchResults.map(channel => (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => addChannel(channel)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    {channel.name}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {formData.favoriteChannels.map(channel => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span>{channel.name}</span>
                  <button
                    type="button"
                    onClick={() => removeChannel(channel.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {errors.channels && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                <AlertCircle className="w-4 h-4" />
                <span>Please add at least one educational channel</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Interests
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={interest}
                onChange={e => setInterest(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                         dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Web Development, Art History"
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.interests.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm
                           dark:bg-red-900 dark:text-red-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                     transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Start Learning
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;