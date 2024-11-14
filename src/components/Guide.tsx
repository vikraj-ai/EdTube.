import React from 'react';
import { CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

const steps = [
  {
    title: 'Create Google Cloud Project',
    instructions: [
      'Go to Google Cloud Console',
      'Click "Select a project" at the top',
      'Click "New Project"',
      'Enter a project name and click "Create"'
    ]
  },
  {
    title: 'Enable YouTube Data API',
    instructions: [
      'In the Google Cloud Console, go to "APIs & Services" > "Library"',
      'Search for "YouTube Data API v3"',
      'Click on the API and press "Enable"'
    ]
  },
  {
    title: 'Configure OAuth Consent',
    instructions: [
      'Go to "APIs & Services" > "OAuth consent screen"',
      'Select "External" user type',
      'Fill in the application name and user support email',
      'Add your email in developer contact info',
      'Save and continue through the remaining steps'
    ]
  },
  {
    title: 'Create API Key',
    instructions: [
      'Go to "APIs & Services" > "Credentials"',
      'Click "Create Credentials" and select "API key"',
      'Your API key will be generated automatically',
      'Click "Restrict Key" to set usage limitations'
    ]
  },
  {
    title: 'Restrict API Key (Recommended)',
    instructions: [
      'In the API key settings, under "API restrictions"',
      'Select "Restrict key"',
      'Choose "YouTube Data API v3" from the dropdown',
      'Click "Save" to apply restrictions'
    ]
  }
];

const YouTubeApiGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <h2 className="text-2xl font-bold text-white">YouTube API Setup Guide</h2>
          <p className="text-blue-100 mt-2">Follow these steps to create your YouTube API key</p>
        </div>

        <div className="p-6">
          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                </div>
                <ul className="space-y-2 ml-11">
                  {step.instructions.map((instruction, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <ChevronRight className="w-4 h-4 mt-1 text-blue-500 flex-shrink-0" />
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Important Notes */}
          <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">Important Notes:</h4>
                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                  <li>• Keep your API key secure and never share it publicly</li>
                  <li>• API keys have usage quotas and limitations</li>
                  <li>• Consider implementing API key rotation for security</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-center"
            >
              Open Google Cloud Console
            </a>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 focus:ring-2 focus:ring-gray-500/20 focus:outline-none"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeApiGuide;