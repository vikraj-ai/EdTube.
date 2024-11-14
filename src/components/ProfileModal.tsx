import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Trash2, AlertCircle } from 'lucide-react';
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
  const [errors, setErrors] = useState({
    channels: false,
    subjects: false
  });

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
    const newErrors = {
      channels: formData.favoriteChannels.length === 0,
      subjects: formData.subjects.length === 0
    };
    setErrors(newErrors);
    if (newErrors.channels || newErrors.subjects) return;
    updateProfile(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-modal-overlay backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 my-8 shadow-modal animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-red-100 modal-gradient rounded-t-2xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
            Edit Profile
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6 text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 custom-scrollbar">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-red-100 rounded-xl input-focus bg-white/50"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade
            </label>
            <select
              value={formData.grade}
              onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full px-4 py-2.5 border border-red-100 rounded-xl input-focus bg-white/50"
            >
              <option value="">Select grade</option>
              {GRADES.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                    formData.subjects.includes(subject)
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            {errors.subjects && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-2 bg-red-50 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4" />
                <span>Please select at least one subject to proceed</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favorite Educational Channels
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={channelSearch}
                onChange={e => setChannelSearch(e.target.value)}
                placeholder="Search for channels"
                className="flex-1 px-4 py-2.5 border border-red-100 rounded-xl input-focus bg-white/50"
              />
              <button
                type="button"
                onClick={searchChannels}
                className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mb-4 border border-red-100 rounded-xl divide-y divide-red-100 overflow-hidden">
                {searchResults.map(channel => (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => addChannel(channel)}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors duration-200"
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
                  className="flex items-center justify-between p-3 bg-red-50 rounded-xl"
                >
                  <span className="text-gray-700">{channel.name}</span>
                  <button
                    type="button"
                    onClick={() => removeChannel(channel.id)}
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {errors.channels && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-2 bg-red-50 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4" />
                <span>Please add at least one educational channel to proceed</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Interests
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={interest}
                onChange={e => setInterest(e.target.value)}
                placeholder="Add an interest (e.g., Web Development)"
                className="flex-1 px-4 py-2.5 border border-red-100 rounded-xl input-focus bg-white/50"
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.interests.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl group"
                >
                  <span className="text-gray-700">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeInterest(index)}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm font-medium"
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