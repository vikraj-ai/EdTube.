import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Trash2 } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { UserProfile } from '../types';
import axios from 'axios';
import { YOUTUBE_API_BASE_URL } from '../config/youtube';
import { useApiKeys } from '../context/ApiKeyContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useProfile();
  const { getNextValidKey } = useApiKeys();
  const [formData, setFormData] = useState<UserProfile>(profile || {
    name: '',
    grade: '',
    subjects: [],
    favoriteChannels: [],
    interests: [],
  });
  const [channelSearch, setChannelSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string }>>([]);
  const [interest, setInterest] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

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
    }
    setChannelSearch('');
    setSearchResults([]);
  };

  const removeChannel = (channelId: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteChannels: prev.favoriteChannels.filter(c => c.id !== channelId),
    }));
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

  const removeInterest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 my-8">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
            <select
              value={formData.grade}
              onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select grade</option>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Favorite Educational Channels
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={channelSearch}
                onChange={e => setChannelSearch(e.target.value)}
                placeholder="Search for channels"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={searchChannels}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Learning Interests
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={interest}
                onChange={e => setInterest(e.target.value)}
                placeholder="Add an interest (e.g., Web Development)"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.interests.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeInterest(index)}
                    className="p-0.5 hover:bg-gray-200 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;