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
      {/* Enhanced header with better icon */}
      <header className="bg-white shadow-sm border-b border-neutral-200 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 mr-3 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-sm"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.4 15C19.1277 15.8031 19.2583 16.6718 19.75 17.35L19.81 17.43C20.2112 17.9636 20.3399 18.6418 20.1586 19.2732C19.9774 19.9047 19.5052 20.4147 18.89 20.64C18.2725 20.8595 17.5916 20.7897 17.03 20.45L16.95 20.4C16.3251 19.9241 15.5003 19.7514 14.71 19.93C13.9172 20.1113 13.2474 20.6233 12.91 21.33L12.87 21.44C12.649 22.0343 12.1856 22.498 11.5914 22.7296C10.9971 22.9612 10.3348 22.9425 9.75998 22.68C9.18293 22.4084 8.76795 21.9178 8.61698 21.32C8.53584 20.9319 8.56257 20.5294 8.69498 20.16L8.74998 20C9.04096 19.2859 8.99273 18.4841 8.61698 17.81C8.22146 17.1271 7.5347 16.6714 6.75998 16.56L6.62998 16.54C5.99208 16.4332 5.42513 16.0398 5.06303 15.458C4.70093 14.8761 4.58316 14.1621 4.73998 13.49C4.90059 12.8148 5.32693 12.2359 5.91998 11.9C6.26767 11.7186 6.67232 11.6429 7.07498 11.68L7.19998 11.7C7.92881 11.7646 8.64576 11.5226 9.17498 11.03C9.69989 10.5461 10.0054 9.87586 10.03 9.16998L10.04 9.00998C10.0775 8.36129 10.3817 7.75873 10.8815 7.32074C11.3814 6.88276 12.0334 6.64999 12.685 6.66998C13.3229 6.69063 13.9262 6.94129 14.3765 7.37073C14.8269 7.80018 15.0933 8.38376 15.13 9.00998V9.17998C15.1677 9.882 15.4779 10.5412 16 11.03C16.5254 11.5265 17.2403 11.7679 17.97 11.7L18.09 11.69C18.4927 11.6523 18.8973 11.7274 19.245 11.91C19.8381 12.2459 20.2644 12.8248 20.425 13.5C20.5818 14.172 20.464 14.886 20.102 15.468" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-medium text-neutral-900 font-display">App Settings</h1>
          </div>
          <Link
            href="/"
            className="text-sm px-3 py-1.5 rounded-lg transition-all duration-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:-translate-y-0.5 flex items-center"
          >
            <svg className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 10.0001L10 2.50012L2.5 10.0001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.16669 11.6667V15.8334C4.16669 16.2754 4.34228 16.6994 4.6548 17.0119C4.96732 17.3244 5.39129 17.5 5.83335 17.5H14.1667C14.6088 17.5 15.0327 17.3244 15.3452 17.0119C15.6578 16.6994 15.8334 16.2754 15.8334 15.8334V11.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Home</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Enhanced API Configuration card with detailed illustration */}
          <div className="bg-white shadow-soft rounded-xl border border-neutral-100 overflow-hidden transition-cards hover-scale">
            <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-primary-50/20">
              <h2 className="text-lg font-medium text-neutral-900 flex items-center">
                <svg className="h-6 w-6 mr-2 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 17L12 22L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 7L12 2L7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="7.5" cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="16.5" cy="12" r="1.5" fill="currentColor"/>
                </svg>
                API Configuration
              </h2>
            </div>
          
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="apiEndpoint" className="block text-sm font-medium text-neutral-700 flex items-center">
                  <svg className="h-4 w-4 mr-1.5 text-primary-500" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3334 8.00004C13.3334 7.58337 13.05 7.16671 12.7 6.91671L9.90004 4.95004C9.36671 4.58337 8.63337 4.58337 8.10004 4.95004L5.30004 6.91671C4.95004 7.16671 4.66671 7.58337 4.66671 8.00004V11.3334C4.66671 12.0667 5.26671 12.6667 6.00004 12.6667H12C12.7334 12.6667 13.3334 12.0667 13.3334 11.3334V8.00004Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2.66663 6.66675L4.66663 8.00008" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2.66663 9.33325L4.66663 7.99992" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  API Endpoint URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="apiEndpoint"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all duration-200"
                    placeholder={getDefaultApiUrl()}
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3333 9.99999C13.3333 11.8409 11.8409 13.3333 9.99996 13.3333C8.15901 13.3333 6.66663 11.8409 6.66663 9.99999C6.66663 8.15904 8.15901 6.66666 9.99996 6.66666C11.8409 6.66666 13.3333 8.15904 13.3333 9.99999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17.5 2.5L2.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-sm text-neutral-500 flex items-center">
                  <svg className="h-4 w-4 mr-1 text-neutral-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.00004 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8.00004C14.6667 4.31814 11.6819 1.33337 8.00004 1.33337C4.31814 1.33337 1.33337 4.31814 1.33337 8.00004C1.33337 11.6819 4.31814 14.6667 8.00004 14.6667Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 5.33337V8.00004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 10.6666H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  The base URL of your RAG service API (without trailing slash)
                </p>
              </div>

              {isSaved && (
                <div className="animate-zoom-in p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-green-100 rounded-full mr-3">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Settings saved successfully!</h3>
                    <p className="text-sm text-green-600">Your changes have been applied.</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="group px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-all duration-200 flex items-center"
                >
                  <svg className="h-4 w-4 mr-2 text-neutral-500 group-hover:text-neutral-700 transition-colors" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.16667 3.33334V8.33334H9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15.8333 16.6667V11.6667H10.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.9917 7.50001C14.5583 6.30834 13.8167 5.25834 12.8417 4.44167C11.8667 3.62501 10.6917 3.07501 9.45833 2.85834C8.225 2.64167 6.95833 2.77501 5.8 3.24167C4.64167 3.70834 3.63333 4.48334 2.875 5.48334L1.25 7.50001M18.75 12.5C18.75 13.9167 18.1583 15.2833 17.125 16.3167C16.0917 17.35 14.725 17.9417 13.3083 17.9417C11.8917 17.9417 10.525 17.35 9.49167 16.3167C8.45833 15.2833 7.86667 13.9167 7.86667 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Reset to Default
                </button>
                <button
                  type="submit"
                  className="group relative px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm hover:shadow transform hover:-translate-y-0.5 overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Save Settings
                  </div>
                </button>
              </div>
            </form>
          </div>
          
          {/* Enhanced About section with better illustration */}
          <div className="mt-8 bg-white shadow-soft rounded-xl border border-neutral-100 overflow-hidden transition-cards hover-scale">
            <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-primary-50/20">
              <h2 className="text-lg font-medium text-neutral-900 flex items-center">
                <svg className="h-6 w-6 mr-2 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 7.01001H12.01M12 17H12.01M8.31 3H15.68C16.62 3 17.3 3.68 17.3 4.62V19.38C17.3 20.32 16.62 21 15.68 21H8.32C7.38 21 6.7 20.32 6.7 19.38V4.62C6.7 3.68 7.38 3 8.32 3H8.31Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 14C12.5523 14 13 13.5523 13 13C13 12.4477 12.5523 12 12 12C11.4477 12 11 12.4477 11 13C11 13.5523 11.4477 14 12 14Z" fill="currentColor"/>
                  <path d="M12 8C12.5523 8 13 7.55228 13 7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7C11 7.55228 11.4477 8 12 8Z" fill="currentColor"/>
                </svg>
                About This App
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0 w-24 h-24 mx-auto md:mx-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="15" y="15" width="45" height="55" rx="4" fill="#EEF2FF" stroke="#E0E7FF"/>
                    <rect x="22" y="25" width="30" height="3" rx="1.5" fill="#6366F1"/>
                    <rect x="22" y="32" width="25" height="3" rx="1.5" fill="#A5B4FC"/>
                    <rect x="22" y="39" width="30" height="3" rx="1.5" fill="#A5B4FC"/>
                    <rect x="22" y="46" width="20" height="3" rx="1.5" fill="#C7D2FE"/>
                    <rect x="22" y="53" width="25" height="3" rx="1.5" fill="#C7D2FE"/>
                    <circle cx="65" cy="60" r="20" fill="url(#radial)" fillOpacity="0.9"/>
                    <path d="M57 60C57 55.5817 60.5817 52 65 52C69.4183 52 73 55.5817 73 60" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M73 60C73 64.4183 69.4183 68 65 68" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M65 68C60.5817 68 57 64.4183 57 60" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.5 4"/>
                    <path d="M45 35L55 50" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M45 45L55 60" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M45 55L55 70" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="50" cy="40" r="1.5" fill="#4F46E5"/>
                    <circle cx="50" cy="65" r="1.5" fill="#4F46E5"/>
                    <defs>
                      <radialGradient id="radial" cx="65" cy="60" r="20" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#6366F1"/>
                        <stop offset="100%" stopColor="#4338CA"/>
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
                
                <div className="flex-1">
                  <p className="text-neutral-600 leading-relaxed">
                    RAG Assistant helps you chat with your documents using AI-powered retrieval augmented generation technology. 
                    The system processes your documents, extracts their content, and allows you to ask questions in natural language.
                  </p>
                  <p className="text-neutral-600 mt-3 leading-relaxed">
                    Configure the API endpoint above to connect to your backend service that processes documents and generates responses.
                  </p>
                  
                  <div className="mt-6 flex justify-end">
                    <Link
                      href="/chat"
                      className="group relative inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 overflow-hidden"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.8334 7.50004L13.3334 10L10.8334 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.66663 10H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Go to Chat
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Version info card */}
          <div className="mt-6 bg-white shadow-soft rounded-xl border border-neutral-100 overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-neutral-500 text-sm">
                <svg className="h-4 w-4 mr-1.5 text-primary-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 8H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 6V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Version 1.0.0
              </div>
              <a href="#" className="text-primary-600 hover:text-primary-700 text-sm flex items-center">
                <svg className="h-4 w-4 mr-1" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.66663 4L11.3333 8.66667L6.66663 13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Check for updates
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
