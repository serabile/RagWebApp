'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSettings } from '@/contexts/SettingsContext';
import { getDefaultApiUrl } from '@/lib/env';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const [apiEndpoint, setApiEndpoint] = useState(settings.apiEndpoint);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Reset apiEndpoint if settings change from elsewhere
    setApiEndpoint(settings.apiEndpoint);
  }, [settings.apiEndpoint]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ apiEndpoint });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    const defaultUrl = getDefaultApiUrl();
    setApiEndpoint(defaultUrl);
    updateSettings({ apiEndpoint: defaultUrl });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-neutral-50 to-primary-50/30">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-9 h-9 mr-3">
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-medium text-neutral-900 font-display">App Settings</h1>
          </div>
          <Link
            href="/"
            className="text-sm px-3 py-1.5 rounded-lg transition-all duration-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-soft rounded-xl border border-neutral-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50">
              <h2 className="text-lg font-medium text-neutral-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                API Configuration
              </h2>
            </div>
          
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="apiEndpoint" className="block text-sm font-medium text-neutral-700">
                  API Endpoint URL
                </label>
                <input
                  type="url"
                  id="apiEndpoint"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all duration-200"
                  placeholder={getDefaultApiUrl()}
                  required
                />
                <p className="mt-1 text-sm text-neutral-500">
                  The base URL of your RAG service API (without trailing slash)
                </p>
              </div>

              {isSaved && (
                <div className="animate-message-entrance p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                  </svg>
                  Settings saved successfully!
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-all duration-200"
                >
                  Reset to Default
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm hover:shadow transform hover:translate-y-[-1px]"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 bg-white shadow-soft rounded-xl border border-neutral-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50">
              <h2 className="text-lg font-medium text-neutral-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About This App
              </h2>
            </div>
            <div className="p-6">
              <p className="text-neutral-600">
                RAG Assistant helps you chat with your documents using AI-powered retrieval augmented generation technology. 
                Configure the API endpoint to connect to your backend service.
              </p>
              <div className="mt-4 flex justify-end">
                <Link
                  href="/chat"
                  className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Go to Chat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
