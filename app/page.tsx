import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-20 -right-10 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-56 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>
      
      <div className="max-w-md w-full space-y-12 relative z-10">
        <div className="flex flex-col items-center animate-slide-up">
          <div className="w-24 h-24 mb-5 relative">
            <div className="absolute inset-0 bg-primary-100 rounded-full animate-pulse-slow"></div>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src="/logo.svg" 
                alt="RAG Assistant Logo"
                width={80}
                height={80}
                className="animate-float"
                priority
              />
            </div>
          </div>
          <h1 className="text-center text-4xl font-bold text-neutral-900 font-display tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
              RAG Assistant
            </span>
          </h1>
          <p className="mt-3 text-center text-xl text-neutral-600 max-w-sm">
            Chat with your documents using AI-powered intelligence
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              AI-Powered
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
              PDF Support
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Semantic Search
            </span>
          </div>
        </div>
        
        <div className="space-y-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Link 
            href="/chat" 
            className="group relative w-full flex items-center justify-center py-4 px-5 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Start Chatting
          </Link>
          
          <Link
            href="/settings"
            className="group relative w-full flex items-center justify-center py-3.5 px-5 border border-neutral-200 text-lg font-medium rounded-xl text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-all duration-200 shadow-sm hover:shadow transform hover:-translate-y-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </div>
        
        <div className="text-center mt-8 text-sm text-neutral-500 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p>Upload documents and ask questions in natural language</p>
          <p className="mt-2">Built with Retrieval-Augmented Generation technology</p>
          <div className="mt-6 flex justify-center space-x-4">
            <a href="#" className="text-primary-500 hover:text-primary-600 transition-colors">About</a>
            <a href="#" className="text-primary-500 hover:text-primary-600 transition-colors">Privacy</a>
            <a href="#" className="text-primary-500 hover:text-primary-600 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
}
