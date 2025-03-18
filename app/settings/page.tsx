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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto w-full p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">API Configuration</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-700 mb-1">
                API Endpoint URL
              </label>
              <input
                type="url"
                id="apiEndpoint"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={getDefaultApiUrl()}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                The base URL of your RAG service API (without trailing slash)
              </p>
            </div>

            {isSaved && (
              <div className="mb-6 p-2 bg-green-50 text-green-700 rounded border border-green-200">
                Settings saved successfully!
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
